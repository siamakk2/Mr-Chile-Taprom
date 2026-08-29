-- ============================================================================
-- Mr. Chile Taproom — ticketing
--
-- Design notes that matter at the door on a Saturday night:
--
--  * A ticket is redeemed exactly once. That is enforced by the database, not
--    by application code, because two door staff scanning the same QR at the
--    same moment is a race the application will lose.
--  * Stripe is the source of truth for money; this schema is the source of
--    truth for admission. They are reconciled by payment_intent_id.
--  * Webhooks arrive more than once. Every write keyed on a Stripe id is
--    idempotent so a replayed webhook cannot mint duplicate tickets.
-- ============================================================================

create extension if not exists pgcrypto;

-- --- events -----------------------------------------------------------------
create table if not exists events (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null,
  occurs_on       date not null,
  doors_at        time not null default '20:00',
  starts_at       time not null default '20:15',
  ends_at         time not null default '02:00',
  name            text not null,
  capacity        integer,                       -- null = uncapped
  advance_cents   integer not null default 1500,
  door_cents      integer not null default 2000,
  sales_close_at  timestamptz,
  status          text not null default 'on_sale'
                  check (status in ('draft', 'on_sale', 'sold_out', 'closed', 'cancelled')),
  created_at      timestamptz not null default now(),
  unique (slug, occurs_on)
);

create index if not exists events_upcoming_idx on events (occurs_on) where status = 'on_sale';

-- --- orders -----------------------------------------------------------------
-- One row per completed Stripe Checkout Session.
create table if not exists orders (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references events (id) on delete restrict,
  stripe_session_id   text not null unique,      -- idempotency key for the webhook
  payment_intent_id   text unique,
  email               text not null,
  name                text,
  quantity            integer not null check (quantity between 1 and 10),
  amount_cents        integer not null,
  currency            text not null default 'usd',
  status              text not null default 'paid'
                      check (status in ('paid', 'refunded', 'disputed', 'cancelled')),
  refunded_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists orders_event_idx on orders (event_id);
create index if not exists orders_email_idx on orders (lower(email));

-- --- tickets ----------------------------------------------------------------
-- One row per admission. serial_no is what a human reads out at will-call when
-- someone has lost the email and the phone is at 2%.
create table if not exists tickets (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders (id) on delete cascade,
  event_id      uuid not null references events (id) on delete restrict,
  serial_no     text not null unique,
  seq           integer not null,                -- 1..quantity within the order
  status        text not null default 'valid'
                check (status in ('valid', 'redeemed', 'void')),
  redeemed_at   timestamptz,
  redeemed_by   text,
  created_at    timestamptz not null default now(),
  unique (order_id, seq)
);

create index if not exists tickets_event_status_idx on tickets (event_id, status);

-- --- scans ------------------------------------------------------------------
-- Every scan attempt, including the rejected ones. If a night goes wrong this
-- is the only record of what actually happened at the door.
create table if not exists scans (
  id          bigserial primary key,
  ticket_id   uuid references tickets (id) on delete set null,
  serial_no   text,
  result      text not null
              check (result in ('admitted', 'already_redeemed', 'void', 'wrong_event', 'unknown', 'bad_signature')),
  scanned_by  text,
  scanned_at  timestamptz not null default now()
);

create index if not exists scans_ticket_idx on scans (ticket_id);

-- --- redemption -------------------------------------------------------------
-- Atomic single-use redemption. The UPDATE ... WHERE status = 'valid' is the
-- whole safety property: exactly one concurrent caller can match the row and
-- change it, so a double scan cannot admit two people on one ticket.
create or replace function redeem_ticket(p_serial text, p_event uuid, p_by text)
returns table (result text, ticket uuid, holder text, seq integer)
language plpgsql
as $$
declare
  v_ticket  tickets%rowtype;
  v_found   tickets%rowtype;
  v_result  text;
begin
  select * into v_ticket from tickets where serial_no = p_serial;

  if not found then
    v_result := 'unknown';
  elsif v_ticket.event_id <> p_event then
    v_result := 'wrong_event';
  elsif v_ticket.status = 'void' then
    v_result := 'void';
  else
    update tickets
       set status = 'redeemed', redeemed_at = now(), redeemed_by = p_by
     where id = v_ticket.id and status = 'valid'
     returning * into v_found;

    if v_found.id is null then
      v_result := 'already_redeemed';
    else
      v_result := 'admitted';
      v_ticket := v_found;
    end if;
  end if;

  insert into scans (ticket_id, serial_no, result, scanned_by)
  values (v_ticket.id, p_serial, v_result, p_by);

  return query
    select v_result,
           v_ticket.id,
           (select o.name from orders o where o.id = v_ticket.order_id),
           v_ticket.seq;
end;
$$;

-- --- row level security -----------------------------------------------------
-- Nothing here is readable by the browser. Every path goes through a server
-- function holding the service role key; the anon key gets no access at all.
alter table events  enable row level security;
alter table orders  enable row level security;
alter table tickets enable row level security;
alter table scans   enable row level security;
