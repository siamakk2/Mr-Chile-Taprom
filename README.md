# Mr. Chile Taproom

Bilingual (English + Spanish) static site for Mr. Chile Taproom, 4357 Montgomery Dr Suite B, Santa Rosa, CA.

No framework, no client-side rendering, no dependencies. Node reads a config
file and writes HTML. Every crawler — Googlebot, GPTBot, ClaudeBot,
PerplexityBot — receives complete content in the first response, with no
JavaScript execution required.

```
npm run build     # writes /public
npm run dev       # build + serve on :3000
```

## Why it is built this way

Roughly 25kb of HTML per page and one 17kb stylesheet. Two small inline scripts
(open/closed status, mobile menu) that the page works fine without. There is no
hydration step to wait on, so Largest Contentful Paint is bounded by network
latency rather than by JavaScript.

The choice matters beyond speed: several AI crawlers do not execute JavaScript
at all. A React site that renders client-side is, to those crawlers, an empty
page.

## The one file that matters

**`src/site.config.mjs`** is the single source of truth. Address, phone, hours,
events, menu, private-event packages and every FAQ answer live there once. The
page HTML, the JSON-LD, `llms.txt` and `sitemap.xml` are all generated from it.

Change the Saturday hours in that file and they change in seven places,
including the structured data a search engine reads. This is deliberate: the
audit found five conflicting versions of this business's hours in the wild
(see `AUDIT.md` §1), and the root cause is always the same — facts copy-pasted
into many places and updated in one.

Lines marked `⚠` need owner confirmation before production.

## Structured data

| Page | Emits |
|---|---|
| all | `BarOrPub` + `EventVenue`, `WebSite`, `WebPage`, `BreadcrumbList` |
| `/` | + `EventSeries` ×4, `FAQPage` |
| `/events/` | + `EventSeries` ×4, `Event` (any dated) |
| `/menu/` | + `Menu` with `MenuSection` / `MenuItem` |
| `/private-events/` | + `Service` ×3, `ItemList` |
| `/faq/`, `/visit/` | + `FAQPage` |

Two deliberate decisions:

**Dual typing.** The business node is `["BarOrPub", "EventVenue"]`. Both are
true. `BarOrPub` competes for "taproom near me"; `EventVenue` competes for
"private event venue Santa Rosa," which is the higher-margin query.

**`EventSeries`, not fake `Event`s.** Recurring nights are published as
`EventSeries` with an `eventSchedule` (`byDay: Saturday`, `byMonthWeek: 1`).
This states "first Saturday of every month" truthfully without inventing dates.
Publishing `Event` nodes with made-up dates is how sites earn manual actions.

To add real dates, push to `site.datedEvents` in the config:

```js
{ seriesSlug: 'cumbia-rosa', date: '2026-09-05', start: '20:00', end: '01:00',
  name: 'Cumbia Rosa — September', price: '10', ticketUrl: 'https://…' }
```

Full `Event` JSON-LD with `Offer` and `superEvent` is generated automatically,
which is what makes the listing eligible for Google event rich results and for
"what's on in Santa Rosa this weekend" AI answers.

## GEO layer

- **`llms.txt`** — plain-language entity brief. Canonical facts, hours, events,
  the full FAQ, and a `## Disambiguation` section stating explicitly that
  "Confluence Taproom" and "Juncture Taproom & Lounge" are prior businesses at
  this address and not this one. That section exists to give a crawler an
  explicit reason to discard the stale records described in `AUDIT.md` §2.
- **`robots.txt`** — named `Allow` for 20 AI crawlers. Default-allow is not
  enough; some CDN and host presets block these by default, and an explicit
  rule removes the ambiguity.
- **Answer-first copy.** Every FAQ answer and every page intro opens with one
  complete, standalone, extractable sentence. "Mr. Chile Taproom is a
  Latino-owned craft beer taproom and live event venue at 4357 Montgomery Dr
  in Santa Rosa, California." A model can lift that sentence and cite it
  without needing surrounding context. That is the whole technique.
- **Three consistent signals.** Every fact appears in visible HTML, in JSON-LD,
  and in `llms.txt`, generated from one source so they cannot drift apart.
  Agreement across all three is what produces a confident citation instead of
  a hedge.

## Accessibility

Skip link, visible focus rings, semantic landmarks, `aria-current` on the
active nav item, labelled form fields, `prefers-reduced-motion` respected, and
a live-region-free status strip that degrades to static text without JS.
Contrast meets WCAG AA throughout.

## Before production

1. Confirm every `⚠` in `src/site.config.mjs` with the owner
2. Set `site.origin` to the real domain, rebuild
3. Create a Formspree form and set `site.formEndpoint` (2 minutes, free tier)
4. Replace the `maps.app.goo.gl/` placeholder in `site.profiles` with the real
   Google Maps short link
5. Add real photography — the patio and the crowd on a Cumbia Rosa night are
   the two shots worth having
6. Claim the Google Business Profile, then submit the sitemap in Search Console

---

## Bilingual build

Every page is generated twice from one builder, with localized URLs:

| English | Español |
|---|---|
| `/` | `/es/` |
| `/events/` | `/es/eventos/` |
| `/menu/` | `/es/menu/` |
| `/private-events/` | `/es/eventos-privados/` |
| `/visit/` | `/es/visitanos/` |
| `/faq/` | `/es/preguntas/` |

Spanish pages get Spanish URLs on purpose — `/es/eventos/` ranks for Spanish
queries in a way `/es/events/` does not. Each page declares reciprocal
`hreflang` for both versions plus `x-default`, so the two never compete.

Copy lives as `{ en, es }` pairs in `src/site.config.mjs` and `src/routes.mjs`.
The `L(value, locale)` helper resolves them. To add a language, add its code to
`LOCALES`, add slugs to `ROUTES`, and fill in the third key.

## Images

Photos are processed once into `static/img/` at 640/1280px in both WebP and
JPEG, and served through a `<picture>` element with `sizes`, so a phone in the
car park pulls 640px rather than a desktop-sized file. Only the hero image is
`eager` with `fetchpriority="high"`; everything else is lazy.

The logo ships in two variants — `logo.png` (original, for light backgrounds and
print) and `logo-light.png` (wordmark recoloured for the dark site). The header
uses `mark-light.png`, the chile artwork alone.

Event flyers are published at full width on the events page and are also the
`image` property on each Event node, which is what Google event rich results
display.

## Adding an event

One entry in `site.datedEvents` produces the flyer card, the board on the home
page, full `Event` JSON-LD with `Offer` and `performer`, and a line in
`llms.txt` — in both languages:

```js
{ seriesSlug:'cumbia-rosa', date:'2026-10-03', start:'20:15', end:'02:00',
  name:'Cumbia Rosa', lineup:'DJ Edge · Clase con Maria y Rogelio',
  price:'15', priceNote:{en:'$15 advance / $20 door', es:'$15 preventa / $20 en la puerta'},
  ticketUrl:'https://www.ritmoypasiondance.com', image:'flyer-cumbia-rosa' }
```

Past dates drop off the site automatically at the next build. Drop the flyer
into `static/img/` as `flyer-<name>.jpg` and `.webp`.
