# Mr. Chile Taproom — entity & visibility audit

Findings from research plus the owner's own flyers. Ordered by revenue impact.

---

## §1 — The hours are wrong on every platform, and they all disagree

| Day | Google | Yelp | Instagram (owner) | Wanderlog |
|---|---|---|---|---|
| Mon | Closed | Closed | Closed | Closed |
| Tue–Thu | 3–9pm | 3–9pm | **4–9pm** | 4–9pm |
| Fri | 3–10pm | 3–11pm | **3–11pm** | 3–11pm |
| Sat | **9am**–10pm | **12pm**–11pm | **3–11pm** | 3–11pm |
| Sun | 9am–**5pm** | 12pm–9pm | **12pm–9pm** | 9am–**7pm** |

Saturday is the money night and no two sources agree on when it starts. Google
currently claims a 9am Saturday open — someone who shows up at 10am finds a
locked door and leaves a one-star review about it.

When an AI is asked "is Mr. Chile Taproom open now," it reconciles across
sources. Where they conflict it either picks arbitrarily, hedges ("hours vary,
call ahead"), or drops the business in favour of a competitor with clean data.
Conflicting data is worse than thin data.

**Fix:** confirm the real hours, then push identical values to Google, Yelp,
Apple Business Connect, Facebook and this site on the same day. The site is now
canonical — `src/site.config.mjs` holds one copy and every page, the JSON-LD
and `llms.txt` are generated from it.

---

## §2 — Three businesses are wearing this address

- The Facebook page URL is `facebook.com/**confluencetaproom**/`
- MapQuest describes 4357 Montgomery Dr as *"Juncture Taproom & Lounge…"*
- Checkle files the listing under `/biz/**juncture-taproom-lounge**-santa-rosa`

Two prior businesses — **Confluence Taproom** and **Juncture Taproom & Lounge** —
still hold entity records here, and directories are serving *their* descriptions
under *your* name. In the original Google screenshot, the MapQuest result is
titled "Mr. Chile Taproom" but the description underneath is Juncture's. That is
an entity collision rendered in public.

**Fixes, in order:**
1. Claim the Google Business Profile — it still shows *"Own this business?"*,
   which is why Google is guessing.
2. Change the Facebook vanity URL to `/mrchiletaproom`. Facebook allows one
   change; do it deliberately.
3. Submit "permanently closed" edits on the Confluence and Juncture records at
   Google, Yelp, MapQuest and Apple Maps.
4. The `## Disambiguation` block in `llms.txt` states in plain language that the
   prior names are not this business. It exists solely to give an AI crawler a
   reason to discard the stale records.

---

## §3 — Facts the flyers corrected

Three things published on this site would have been wrong without the flyers:

- **Cumbia Rosa runs until 2am**, not 1am as third-party listings imply.
- **There is a ticket price** — $15 advance, $20 at the door. No directory
  mentions it, so nobody searching "cumbia Santa Rosa cover charge" finds it.
- **The address is Suite B.** Every listing omits it.

The flyers also name the partner (**Ritmo y Pasión Dance**), the instructors
(Maria and Rogelio), and the DJ (**DJ Edge**). Those are now `performer` and
`organizer` entities in the Event schema, which links this venue to a second
established brand — a genuine authority signal that no amount of on-page copy
buys you.

⚠ One item still needs confirming: the exact sound-system names on the Sonidero
flyer. `Familia Linares · Beto Méndez` is what is legible; verify before the
next print run.

---

## §4 — The review asset is being left on the table

217 Google reviews at 4.6, 15 Yelp reviews at 4.9, and until now no website to
send that authority anywhere. Reviews are the strongest thing this business has
and the most-quoted source when an AI is asked "is it any good."

The reviews name the same specifics over and over: the creekside patio under the
oaks, the baked wings, the staff, and al pastor from the Freaking Tacos truck.
All of it is now in the site copy in plain language, because specific checkable
claims get cited and generic ones ("great atmosphere") never do.

**Do not** paste review text onto the site as testimonials — it is the
reviewers' copyright and Google's data. Keep earning them instead.

---

## §5 — Indexed as a bar, not as a venue

Google categorises this as **Bar**. Yelp files it under **Sports Bars**. Neither
captures the event business, which is where the margin is: a Saturday buyout for
a quinceañera is worth more than a week of walk-in pints.

The site is typed `["BarOrPub", "EventVenue"]`. The second type is what makes it
eligible for "private event venue Santa Rosa," "quinceañera venue Sonoma County"
and "where can I book a party in Santa Rosa." Add **Event Venue** as a secondary
category on the Google Business Profile to match.

---

## §6 — Nobody is serving the Spanish-language search

"Primer taproom latino de Sonoma" is the positioning, the event copy is written
in Spanish, and the audience searches in Spanish — but every listing is
English-only. There is essentially no competition for these queries in Sonoma
County.

The site now ships fully bilingual: every page exists at a Spanish URL
(`/es/eventos/`, `/es/eventos-privados/`) with reciprocal `hreflang`, Spanish
JSON-LD, a Spanish FAQ block in `llms.txt`, and a language switch in the header.

---

## §7 — Still open for the owner

Marked in `src/site.config.mjs`. Everything else on the site is sourced from
published material or the flyers.

1. Correct hours (§1)
2. Which of the two Gmail addresses is real
3. Private-event capacities — 80 / 25–45 / 150 are estimates from the room
4. Whether outside catering is genuinely allowed on buyouts
5. Deposit amount and cancellation terms
6. Exact sonido names on the Sonidero flyer (§3)
7. Whether Freaking Tacos is permanent or week-to-week
8. Dogs on the patio — currently not claimed either way

---

## §8 — Menu data exists, but only from scrapers

A full menu and a Hoppy Hour turned up in aggregator listings — items, sections
and prices. Two things are worth separating.

**The item names are safe and now published.** Ceviche Tostadas, Meat Lovers
Sandwich, fish tacos, tacos de cabeza, the Licuachela, pupusas on event nights.
These corroborate across sources and match the reviews. They are on the menu
page and in the `Menu` structured data.

**The prices are not safe.** They came from third-party aggregators, not the
taproom, and one of them gives the set away: a margarita at **$10.91**. No bar
prices a drink at ninety-one cents; that is a tax-inclusive total or a POS
export, scraped and relabelled as a menu price. If one number in the set is an
artifact, the rest are suspect too.

Publishing a wrong price on the canonical source is worse than publishing none.
A customer who reads $8.99 wings here and is charged $11.99 has been misled by
the business's own website — and it undoes the exact authority this whole build
is meant to establish.

So prices sit in `site.config.mjs` behind `pricesConfirmed: false`. They are in
the code, hidden from the page and withheld from the structured data. Read them
off the actual board once, flip the flag to `true`, and every price appears on
the page and in the `Offer` markup in both languages at the next build.

`llms.txt` states plainly that prices are unconfirmed and that figures found
elsewhere online may be wrong — which is itself a correction being fed back to
the engines that scraped them.

**Hoppy Hour is the real find.** Tuesday to Friday, 4–6pm, with a 15% food
discount on two or more drinks. No directory lists it. "Happy hour near me" is
one of the highest-intent local searches there is, and nobody in east Santa Rosa
is competing for it with structured data. It now has its own section on the menu
page, an FAQ entry, a line in `llms.txt`, and a real `Offer` node with
`hoursAvailable` for all four days.

⚠ Confirm with the owner: the individual prices, and whether Hoppy Hour still
runs those days and hours.
