# Ticketing

Sell tickets on mrchiletaproom.com, email a scannable ticket, scan it at the
door. Stripe hosts the payment page; this system owns admission.

**Currently inert.** Every route returns 503 until `TICKETING_ENABLED=true` and
the keys below exist. Nothing on the public site links to checkout yet.

## Turning it on

### 1. Stripe — the taproom's own account
Not the agency's. It must be in the taproom's legal entity with the taproom's
bank details, because this is where ticket money lands and whose name is on a
chargeback.

- Create the account, complete business verification.
- Copy the secret key (`sk_live_…`).
- Add a webhook endpoint (the trailing slash matters): `https://www.mrchiletaproom.com/api/webhook/`
  Events: `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`
- Copy the signing secret (`whsec_…`).

### 2. Supabase
Create a project, then run `db/001_ticketing.sql` in the SQL editor. Copy the
project URL and the **service role** key. The anon key is never used — the
schema has RLS on with no permissive policies, so all access is server-side.

### 3. Email
A [Resend](https://resend.com) API key, with `mrchiletaproom.com` verified as a
sending domain (SPF + DKIM). Without it, tickets are still issued and still
work at will-call; only the email is skipped.

### 4. Environment variables (Vercel → Settings → Environment Variables)

| Variable | What it is |
|---|---|
| `TICKETING_ENABLED` | `true` to open the routes |
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | service role key — server only, never public |
| `TICKET_SIGNING_KEY` | any long random string; **changing it invalidates every unscanned ticket** |
| `DOOR_CODE` | shared code staff type at the door; rotate per night |
| `SITE_ORIGIN` | `https://mrchiletaproom.com` |
| `RESEND_API_KEY` | optional; without it no email is sent |
| `TICKET_FROM` | e.g. `Mr. Chile Taproom <tickets@mrchiletaproom.com>` |

Test with Stripe's test keys first. A test-mode purchase issues a real ticket
row, so scan one on a phone before selling anything.

## Running a night

1. Insert the event:
   ```sql
   insert into events (slug, occurs_on, name, capacity, advance_cents, door_cents, sales_close_at)
   values ('cumbia-rosa', '2026-10-03', 'Cumbia Rosa', 150, 1500, 2000, '2026-10-02 23:59-07');
   ```
2. Set `status = 'on_sale'` when you want it live.
3. Door staff open `/door/`, pick the event, enter the door code, start camera.
4. Close sales with `status = 'closed'`; the door keeps working.

## How it behaves when things go wrong

| Situation | What happens |
|---|---|
| Same QR scanned twice | Second scan says ALREADY SCANNED. The database, not the app, enforces this — two phones scanning at once cannot both admit. |
| Stripe sends the webhook twice | Second is a no-op. `orders.stripe_session_id` is unique. |
| Guest's phone is dead | Will-call types the `MCT-XXXXX-XXXXX` code; server reconstructs the signed serial. Same check, same single-use guarantee. |
| Refund issued | Unredeemed tickets go `void` and stop scanning. Already-redeemed ones are left alone — they danced. |
| Email never arrives | Ticket exists anyway. Find them at will-call by name. |
| Forged QR | Rejected on signature before touching the database, and logged as `bad_signature`. |
| Internet drops at the door | Scanning needs connectivity. Fallback is the printed door list — export before the night. |

## What is deliberately not built

- **No refund UI.** Refunds are issued in the Stripe dashboard; the webhook
  voids the tickets. A refund button on a website is a way to lose money to a
  misclick.
- **No comps or guest list.** Insert rows directly for now.
- **No seat selection.** General admission only.
- **No offline scanning.** Worth adding only if the door's signal proves bad.

## Security notes

- The service role key is server-side only. It is never sent to a browser.
- `/door/` and `/tickets/` are `noindex`, disallowed in robots.txt, and
  `no-store`.
- The door code is shared, not per-user, which is the right trade for venue
  staffing — but it means rotating it after anyone leaves. Every scan records
  which code was used and when.
- Ticket serials are HMAC-signed, so a guessed code fails without a database
  lookup. The signature alone never admits anyone; the database decides.
