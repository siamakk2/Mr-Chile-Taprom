-- ============================================================================
-- Site editor accounts
--
-- Clients log in here with an email and password. They never see GitHub; the
-- server holds a GitHub App key and mints a one-hour installation token after
-- a successful login.
--
-- Built multi-site from the start. Adding the second client should be an
-- INSERT, not a migration, and retrofitting tenancy onto a single-tenant
-- schema is the kind of job that quietly leaks one client's data into
-- another's.
-- ============================================================================

create extension if not exists pgcrypto;

-- --- sites ------------------------------------------------------------------
create table if not exists sites (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  repo        text not null,              -- e.g. siamakk2/Mr-Chile-Taprom
  origin      text not null,
  created_at  timestamptz not null default now()
);

-- --- editors ----------------------------------------------------------------
-- No password column. A password is never stored, only a scrypt hash with a
-- per-user salt, kept together in one string so the parameters travel with it.
create table if not exists editors (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  name           text,
  password_hash  text,                    -- null until the invite is accepted
  status         text not null default 'invited'
                 check (status in ('invited', 'active', 'suspended')),
  last_login_at  timestamptz,
  failed_logins  integer not null default 0,
  locked_until   timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists editors_email_idx on editors (lower(email));

-- --- who can edit what ------------------------------------------------------
-- Roles are here rather than on the editor, because the same person may be an
-- owner of one site and a contributor to another.
create table if not exists site_editors (
  site_id     uuid not null references sites (id) on delete cascade,
  editor_id   uuid not null references editors (id) on delete cascade,
  role        text not null default 'editor'
              check (role in ('owner', 'editor', 'viewer')),
  created_at  timestamptz not null default now(),
  primary key (site_id, editor_id)
);

-- --- invitations ------------------------------------------------------------
-- Only the hash of the token is stored. A leaked database row must not be
-- redeemable as an invitation.
create table if not exists invites (
  id          uuid primary key default gen_random_uuid(),
  editor_id   uuid not null references editors (id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists invites_editor_idx on invites (editor_id);

-- --- sessions ---------------------------------------------------------------
-- Server-side sessions rather than a self-contained cookie, so that suspending
-- someone takes effect immediately instead of whenever their token expires.
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  editor_id   uuid not null references editors (id) on delete cascade,
  token_hash  text not null unique,
  user_agent  text,
  ip          text,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists sessions_editor_idx on sessions (editor_id);
create index if not exists sessions_expiry_idx on sessions (expires_at);

-- --- audit ------------------------------------------------------------------
-- Every login, failure, invite and account change. If an account is ever
-- misused this is the only record of what happened and when.
create table if not exists auth_events (
  id          bigserial primary key,
  editor_id   uuid references editors (id) on delete set null,
  email       text,
  action      text not null,
  detail      text,
  ip          text,
  created_at  timestamptz not null default now()
);

create index if not exists auth_events_created_idx on auth_events (created_at desc);

-- --- housekeeping -----------------------------------------------------------
create or replace function purge_expired_sessions()
returns void language sql as $$
  delete from sessions where expires_at < now() - interval '7 days';
$$;

-- --- row level security -----------------------------------------------------
-- Nothing here is reachable from a browser. Every query runs server-side with
-- the service role key; the anon key is given no policy and therefore no access.
alter table sites        enable row level security;
alter table editors      enable row level security;
alter table site_editors enable row level security;
alter table invites      enable row level security;
alter table sessions     enable row level security;
alter table auth_events  enable row level security;

-- --- seed -------------------------------------------------------------------
insert into sites (slug, name, repo, origin)
values ('mr-chile-taproom', 'Mr. Chile Taproom', 'siamakk2/Mr-Chile-Taprom', 'https://www.mrchiletaproom.com')
on conflict (slug) do nothing;
