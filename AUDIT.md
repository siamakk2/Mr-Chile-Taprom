# Mr. Chile Taproom — entity & visibility audit

Findings from the pre-build research pass. Ordered by revenue impact, not by effort.

---

## §1 — The hours are wrong on every platform, and they all disagree

Five public sources, five different answers, for a business whose single most
common search is *"are they open."*

| Day | Google | Yelp | Instagram (owner) | Wanderlog | Checkle |
|---|---|---|---|---|---|
| Mon | Closed | Closed | Closed | Closed | Closed |
| Tue | 3–9pm | 3–9pm | **4–9pm** | 4–9pm | 4–9pm |
| Wed | 3–9pm | 3–9pm | **4–9pm** | 4–9pm | 4–9pm |
| Thu | 3–9pm | 3–9pm | **4–9pm** | 4–9pm | 4–9pm |
| Fri | 3–10pm | 3–11pm | **3–11pm** | 3–11pm | 3–11pm |
| Sat | **9am**–10pm | **12pm**–11pm | **3–11pm** | 3–11pm | 3–11pm |
| Sun | 9am–**5pm** | 12pm–9pm | **12pm–9pm** | 9am–**7pm** | 9am–7pm |

Saturday is the money night and no two sources agree on when it starts.
Google currently claims a 9am Saturday open — a customer who shows up at 10am
finds a locked door and leaves a one-star review about it.

**Why this matters for AI answers specifically.** When ChatGPT, Perplexity or
Google's AI Overview is asked "is Mr. Chile Taproom open now," it reconciles
across sources. When sources conflict, the model either picks arbitrarily,
hedges ("hours vary, please call"), or drops the business from the answer in
favour of a competitor whose data is clean. Conflicting data is worse than
thin data.

**Fix:** confirm the real hours with the owner, then push identical values to
Google Business Profile, Yelp, Apple Business Connect, Facebook and the website
on the same day. The site is now the canonical source — `src/site.config.mjs`
holds one copy of the hours and every page, the JSON-LD, and `llms.txt` read
from it.

---

## §2 — Three businesses are wearing this address

This is the most damaging finding and it is invisible from inside the business.

- The Facebook page URL is `facebook.com/**confluencetaproom**/`
- MapQuest describes 4357 Montgomery Dr as *"Juncture Taproom & Lounge…
  located at the intersection of Mission Blvd"*
- Checkle files the listing under `/biz/**juncture-taproom-lounge**-santa-rosa`

Two prior businesses — **Confluence Taproom** and **Juncture Taproom & Lounge** —
still hold entity records on this address, and directories are serving *their*
descriptions under *your* name. A search engine trying to build a knowledge
entity for "Mr. Chile Taproom" is being handed three overlapping, partly
contradictory records.

Notice what shows in the screenshot: MapQuest's result is titled "Mr. Chile
Taproom" but the description underneath is Juncture's. That is an entity
collision rendered in public.

**Fixes, in order:**
1. Claim the Google Business Profile (the listing still shows *"Own this
   business?"* — it is unclaimed, which is why Google is guessing).
2. Change the Facebook vanity URL from `/confluencetaproom` to
   `/mrchiletaproom`. Facebook allows one change; do it deliberately.
3. Submit "mark as permanently closed" / "suggest an edit" on the Confluence
   and Juncture records on Google, Yelp, MapQuest and Apple Maps.
4. Ship the website with `sameAs` pointing at the correct profiles — done.
   The `## Disambiguation` block in `llms.txt` states explicitly, in plain
   language, that the prior names are not this business. That block exists
   solely to give an AI crawler a reason to discard the stale records.

---

## §3 — Two email addresses in circulation

- Instagram bio: `mr.chiletaproominfo@gmail.com`
- Facebook page: `mrchiletaproom707@gmail.com`

Pick one. The site currently uses the Instagram address; change
`site.email` in `src/site.config.mjs` if it should be the other. Better still,
move to `hello@mrchiletaproom.com` once the domain is live — a branded email
address is itself a trust signal that a free Gmail address is not.

---

## §4 — The review asset is being left on the table

217 Google reviews at 4.6, 15 Yelp reviews at 4.9, and no website to send that
authority anywhere. Reviews are the single strongest thing this business has,
and they are also the most-quoted source when an AI is asked "is it any good."

Read the reviews and you find the same specifics repeatedly: the creekside
patio under the oaks, the baked wings, the staff, and al pastor from the
Freaking Tacos truck. Those specifics are now written into the site copy in
plain language, because specific, checkable claims are what get extracted and
cited. Generic claims ("great atmosphere") never are.

**Do not** paste review text onto the site as testimonials — it is the
reviewers' copyright and Google's data. Instead: keep earning them, and make
sure the site says the same true things the reviews say.

---

## §5 — What the business actually is, and what it is being indexed as

Google categorises this as **Bar**. Yelp files it under **Sports Bars**.

Neither captures the event business, which is where the margin is. A Saturday
buyout for a quinceañera is worth more than a week of walk-in pints.

The site is typed as `["BarOrPub", "EventVenue"]` in structured data — both are
true, and the second one is what makes the business eligible to surface for
"private event venue Santa Rosa," "quinceañera venue Sonoma County," and
"where can I book a party in Santa Rosa." Add **Event Venue** as a secondary
category on the Google Business Profile to match.

---

## §6 — Nobody is serving the Spanish-language search

"Primer taproom latino de Sonoma" is the positioning, the event copy is written
in Spanish, and the audience searches in Spanish — but every listing is
English-only.

There is no competition for these queries in Sonoma County right now. The site
ships with a Spanish homepage at `/es/` and correct `hreflang` annotation.
Expanding `/es/` to cover events and private bookings is the cheapest
remaining growth lever on this list.

---

## §7 — Open questions for the owner

These are marked `⚠` in `src/site.config.mjs` and should be confirmed before
the site goes to a real domain. Everything else on the site is sourced from
published material.

1. Correct hours (see §1)
2. Correct email (see §3)
3. Are dogs allowed on the patio?
4. Real private-event capacities — the numbers on the site (80 / 25–45 / 150)
   are estimates from the room description and need confirming
5. Is outside catering genuinely allowed on buyouts?
6. Deposit amount and cancellation terms
7. Are the recurring nights still running on the stated cadence?
8. Whether Freaking Tacos is a permanent fixture or week-to-week
