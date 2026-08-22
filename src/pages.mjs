import { site, faqs, fullAddress, hoursSummary } from './site.config.mjs';
import { esc, PICADO } from './layout.mjs';
import * as S from './schema.mjs';

const g = S.graph;
const base = (path, title, description, trail) => [
  S.businessNode(),
  S.websiteNode(),
  S.webPageNode({ path, title, description, trail }),
];
const HOME = { name: 'Home', path: '/' };

const statusStrip = `<p class="status" data-status>${esc(hoursSummary)}</p>`;

const hoursTable = () => `<table class="hours" data-hours-table>
<caption class="vh">Opening hours</caption>
<tbody>${site.hours
  .map(
    (h) =>
      `<tr${h.open ? '' : ' data-closed="true"'}><th scope="row">${h.day}</th><td>${h.label}</td></tr>`
  )
  .join('')}</tbody></table>`;

const faqBlock = (list) => `<div class="faq">${list
  .map(
    (f) => `<details><summary>${esc(f.q)}</summary><div class="faq__a"><p>${esc(f.a)}</p></div></details>`
  )
  .join('')}</div>`;

const napBlock = () => `<dl class="specs">
<div><dt>Address</dt><dd>${esc(fullAddress)} &middot; <a href="https://www.google.com/maps/search/?api=1&amp;query=${site.lat},${site.lng}">Directions</a></dd></div>
<div><dt>Phone</dt><dd><a href="tel:${site.phoneE164}">${site.phone}</a></dd></div>
<div><dt>Email</dt><dd><a href="mailto:${site.email}">${esc(site.email)}</a></dd></div>
<div><dt>Cross street</dt><dd>${esc(site.crossStreet)}, east Santa Rosa</dd></div>
<div><dt>Parking</dt><dd>Free open lot on site, no permit or validation</dd></div>
<div><dt>Capacity</dt><dd>Up to 150 for a full buyout</dd></div>
<div><dt>Languages</dt><dd>English and Spanish spoken</dd></div>
</dl>`;

// ============================================================================
// HOME
// ============================================================================
const home = () => {
  const title = "Mr. Chile Taproom | Sonoma County's First Latino Taproom — Santa Rosa, CA";
  const description =
    'Latino-owned craft beer taproom and event venue at 4357 Montgomery Dr, Santa Rosa. Rotating local taps, baked wings, a creekside patio, monthly Cumbia Rosa dance nights, comedy and live music. Open Tue–Sun.';
  const boardRows = site.series.slice(0, 3);
  return {
    path: '/',
    title,
    description,
    esPath: '/es/',
    jsonld: g([
      ...base('/', title, description, [HOME]),
      ...S.seriesNodes(),
      ...S.datedEventNodes(),
      S.faqNode(faqs.slice(0, 6)),
    ]),
    body: `
<section class="hero">
<div class="wrap hero__in">
<span class="eyebrow">Santa Rosa, California &middot; Montgomery &amp; Mission</span>
<h1>Sonoma County&rsquo;s First<em>Latino Taproom</em></h1>
<p class="hero__sub">Beer &amp; culture &middot; Cumbia, comedy and live music &middot; Creekside patio</p>
${statusStrip}
<div class="board" style="margin-top:1.75rem">
  <div class="board__top">
    <span class="board__label">On the board</span>
    <span class="pill pill--gold">${esc(site.county)}</span>
  </div>
  <div class="board__body">
    ${boardRows
      .map(
        (s) => `<div class="board__row">
      <span class="board__when">${esc(s.kicker)}</span>
      <div class="board__what"><h3>${esc(s.name)}</h3><p>${esc(s.short)}</p></div>
    </div>`
      )
      .join('')}
  </div>
  <div class="board__foot btn-row">
    <a class="btn btn--gold" href="/events/">See the full calendar</a>
    <a class="btn btn--ghost" href="https://www.google.com/maps/search/?api=1&amp;query=${site.lat},${site.lng}">Get directions</a>
  </div>
</div>
</div>
</section>

${PICADO}

<section class="band band--alt">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow eyebrow--chile">What this place is</span>
<h2>A taproom that runs like a venue</h2>
</div>
<div class="prose">
<p><strong>Mr. Chile Taproom is a Latino-owned craft beer taproom and live event venue at 4357 Montgomery Dr in Santa Rosa, California.</strong> It pours a rotating list of Sonoma County beer, cider and wine, serves bar food built around baked wings and mac and cheese, and books cumbia dance nights, stand-up comedy, live bands and community fundraisers.</p>
<p>The room seats groups large and small. Out back, a tree-shaded patio runs along Santa Rosa Creek under mature oaks, with yard games, room for kids, and a taco truck parked in the corner. Games go up on the projector. Parking is free and on site.</p>
<p>Most nights it is a neighborhood taproom. On the first Saturday of the month it is a dance floor until 1am.</p>
</div>
</div>
</section>

<section class="band">
<div class="wrap">
<span class="eyebrow">The programming</span>
<h2>What&rsquo;s on</h2>
<p class="lede" style="margin-top:1rem">Four things run on repeat. Dated listings and ticket links live on the calendar.</p>
<div class="grid grid--4" style="margin-top:2.5rem">
${site.series
  .map(
    (s) => `<a class="card card--link" href="/events/#${s.slug}">
<span class="card__kicker">${esc(s.kicker)}</span>
<h3>${esc(s.name)}</h3>
<p>${esc(s.short)}</p>
<span class="card__tag">${esc(s.age)}</span>
</a>`
  )
  .join('')}
</div>
<div class="btn-row" style="margin-top:2rem"><a class="btn btn--primary" href="/events/">Full calendar</a></div>
</div>
</section>

<section class="band band--chile">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">Private events</span>
<h2>Book the room</h2>
</div>
<div>
<p class="lede">Quincea&ntilde;eras, birthdays, company parties, rehearsal dinners, memorials, fundraisers and full-venue buyouts up to 150 guests. Patio, back room or the whole place.</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--gold" href="/private-events/">See packages &amp; enquire</a>
<a class="btn btn--ghost" href="tel:${site.phoneE164}" style="border-color:rgba(255,255,255,.5)">Call ${site.phone}</a>
</div>
</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">The room</span>
<h2>Why people come back</h2>
<p class="prose" style="margin-top:1.25rem">Reviewers keep naming the same things: the patio, the wings, the staff, and the fact that you can bring the kids before the music starts.</p>
</div>
<div class="grid grid--2">
${site.amenities
  .slice(0, 6)
  .map((a) => `<div class="card"><h4>${esc(a.name)}</h4><p>${esc(a.detail)}</p></div>`)
  .join('')}
</div>
</div>
</section>

<section class="band">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">Common questions</span>
<h2>Before you come</h2>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--ghost" href="/faq/">All questions</a></div>
</div>
<div>${faqBlock(faqs.slice(0, 6))}</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">Visit</span>
<h2>4357 Montgomery Dr</h2>
<div style="margin:1.25rem 0">${statusStrip}</div>
<a class="tel" href="tel:${site.phoneE164}">${site.phone}</a>
<div style="margin-top:1.5rem">${napBlock()}</div>
</div>
<div>
<h4 style="margin-bottom:1rem">Hours</h4>
${hoursTable()}
<p class="form__note" style="margin-top:1rem">Event nights can run past posted closing. Call to confirm on holidays.</p>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--primary" href="https://www.google.com/maps/search/?api=1&amp;query=${site.lat},${site.lng}">Open in Maps</a></div>
</div>
</div>
</section>`,
  };
};

// ============================================================================
// EVENTS
// ============================================================================
const events = () => {
  const title = 'Events at Mr. Chile Taproom | Cumbia, Comedy & Live Music in Santa Rosa';
  const description =
    "What's on at Mr. Chile Taproom, Santa Rosa: Cumbia Rosa dance night on first Saturdays with an 8:15pm beginner class, monthly comedy, live music most weekends and quarterly Drink For A Cause benefits.";
  return {
    path: '/events/',
    title,
    description,
    jsonld: g([
      ...base('/events/', title, description, [HOME, { name: 'Events', path: '/events/' }]),
      ...S.seriesNodes(),
      ...S.datedEventNodes(),
    ]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">Calendar</span>
<h1 style="font-size:clamp(2.2rem,7vw,4.4rem)">What&rsquo;s on</h1>
<p class="lede" style="margin-top:1.25rem"><strong>Mr. Chile Taproom hosts cumbia dance nights on the first Saturday of every month, live music most Fridays and Saturdays, monthly stand-up comedy, and quarterly benefit nights for Sonoma County nonprofits.</strong> All events are at 4357 Montgomery Dr, Santa Rosa.</p>
${statusStrip}
</div>
</section>

${PICADO}

<section class="band">
<div class="wrap stack">
${site.series
  .map(
    (s) => `<article id="${s.slug}" class="card" style="scroll-margin-top:90px">
<span class="card__kicker">${esc(s.kicker)} &middot; ${esc(s.age)}</span>
<h2 style="font-size:clamp(1.6rem,4vw,2.4rem)">${esc(s.name)}</h2>
<p style="font-size:1.02rem">${esc(s.long)}</p>
<p class="form__note"><span class="pill">${esc(s.genre)}</span> <span class="pill">Doors from ${s.startTime.replace(':00', '')}:00</span> <span class="pill">${esc(site.locality)}, ${site.region}</span></p>
</article>`
  )
  .join('')}
</div>
</section>

<section class="band band--chile">
<div class="wrap grid grid--split">
<div><span class="eyebrow">Dates &amp; tickets</span><h2>Confirm before you drive</h2></div>
<div>
<p class="lede">Specific dates, lineups and ticket links post to Instagram and Facebook first. Call the taproom if you want it confirmed by a person.</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--gold" href="https://www.instagram.com/mr.chiletaproom/" rel="noopener">Instagram</a>
<a class="btn btn--ghost" href="tel:${site.phoneE164}" style="border-color:rgba(255,255,255,.5)">Call ${site.phone}</a>
</div>
</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div><span class="eyebrow">Want the room to yourself?</span><h2>Private bookings</h2></div>
<div><p class="lede">The patio, the back room or the full venue are all bookable. Up to 150 guests.</p>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--primary" href="/private-events/">Private events</a></div></div>
</div>
</section>`,
  };
};

// ============================================================================
// PRIVATE EVENTS
// ============================================================================
const privateEvents = () => {
  const title = 'Private Event Venue in Santa Rosa | Book Mr. Chile Taproom';
  const description =
    'Book Mr. Chile Taproom in Santa Rosa for private events: quinceañeras, birthdays, company parties, rehearsal dinners and fundraisers. Patio buyout to 80, back room 25–45, full venue to 150. Call (707) 239-4188.';
  return {
    path: '/private-events/',
    title,
    description,
    jsonld: g([
      ...base('/private-events/', title, description, [
        HOME,
        { name: 'Private Events', path: '/private-events/' },
      ]),
      ...S.serviceNodes(),
      {
        '@type': 'ItemList',
        name: 'Private event packages at Mr. Chile Taproom',
        itemListElement: site.privatePackages.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          description: `${p.capacity}. ${p.best}.`,
        })),
      },
    ]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">Private events</span>
<h1 style="font-size:clamp(2.2rem,7vw,4.4rem)">Book the room</h1>
<p class="lede" style="margin-top:1.25rem"><strong>Mr. Chile Taproom books private events in Santa Rosa for up to 150 guests</strong> — quincea&ntilde;eras, birthdays, graduations, company parties, team offsites, rehearsal dinners, memorials, album releases and nonprofit fundraisers. Choose the creekside patio, the semi-private back room, or a full venue buyout.</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--primary" href="#enquire">Send an enquiry</a>
<a class="btn btn--ghost" href="tel:${site.phoneE164}">Call ${site.phone}</a>
</div>
</div>
</section>

${PICADO}

<section class="band">
<div class="wrap">
<span class="eyebrow">Three ways to book</span>
<h2>Packages</h2>
<div class="grid grid--3" style="margin-top:2.5rem">
${site.privatePackages
  .map(
    (p) => `<div class="card">
<span class="card__kicker">${esc(p.capacity)}</span>
<h3>${esc(p.name)}</h3>
<p><strong style="color:var(--masa)">Best for:</strong> ${esc(p.best)}</p>
<ul class="mlist" style="margin-top:.25rem">${p.includes.map((x) => `<li><span>${esc(x)}</span></li>`).join('')}</ul>
</div>`
  )
  .join('')}
</div>
<p class="form__note" style="margin-top:1.5rem">Pricing depends on date, guest count and whether you want a bar tab, drink tickets or a cash bar. Send the form below and you get a written quote back.</p>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">Straight answers</span>
<h2>What&rsquo;s included</h2>
</div>
<div>
<dl class="specs">
<div><dt>Outside food</dt><dd>Yes for full buyouts and patio bookings — including cake and catering. Alcohol must come from the bar.</dd></div>
<div><dt>Taco truck</dt><dd>Freaking Tacos can be coordinated for your event. Ask when you enquire.</dd></div>
<div><dt>Sound</dt><dd>Stage, PA and projector are available on full buyouts. Bring your own DJ or we can suggest one.</dd></div>
<div><dt>Decor</dt><dd>Bring your own. Setup time is included in the booking window.</dd></div>
<div><dt>Minors</dt><dd>Welcome at daytime and early-evening events. Bar-service events after 8pm are 21+.</dd></div>
<div><dt>Deposit</dt><dd>A deposit holds the date and applies to your final bill.</dd></div>
<div><dt>Parking</dt><dd>Free on-site lot, no validation needed.</dd></div>
<div><dt>Languages</dt><dd>We plan events in English and Spanish.</dd></div>
</dl>
<p class="form__note" style="margin-top:1rem">Terms are confirmed in writing when you book.</p>
</div>
</div>
</section>

<section class="band" id="enquire" style="scroll-margin-top:80px">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow eyebrow--chile">Enquiry</span>
<h2>Tell us about the night</h2>
<p class="prose" style="margin-top:1.25rem">The more you put in, the tighter the quote comes back. If you would rather talk it through, call <a href="tel:${site.phoneE164}" style="color:var(--marigold)">${site.phone}</a>.</p>
</div>
<div>
<form class="form" name="private-event" method="POST" action="${site.formEndpoint}">
<input type="hidden" name="_subject" value="Private event enquiry — mrchiletaproom.com">
<p class="vh"><label>Leave blank<input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
<div class="form__2">
<div class="field"><label for="name">Your name</label><input id="name" name="name" required autocomplete="name"></div>
<div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" required autocomplete="tel"></div>
</div>
<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="email"></div>
<div class="form__2">
<div class="field"><label for="date">Preferred date</label><input id="date" name="date" type="date"></div>
<div class="field"><label for="guests">Guest count</label><input id="guests" name="guests" type="number" min="10" max="150" inputmode="numeric"></div>
</div>
<div class="field"><label for="type">Type of event</label>
<select id="type" name="type">
<option>Birthday</option><option>Quincea&ntilde;era</option><option>Graduation</option>
<option>Company party or offsite</option><option>Rehearsal dinner</option><option>Memorial</option>
<option>Nonprofit fundraiser</option><option>Live music or album release</option><option>Other</option>
</select></div>
<div class="field"><label for="space">Space</label>
<select id="space" name="space">
${site.privatePackages.map((p) => `<option>${esc(p.name)} — ${esc(p.capacity)}</option>`).join('')}
<option>Not sure yet</option>
</select></div>
<div class="field"><label for="notes">Anything else</label><textarea id="notes" name="notes" placeholder="Food, music, timing, decor, budget range&hellip;"></textarea></div>
<button class="btn btn--primary" type="submit">Send enquiry</button>
<p class="form__note">You get a reply within one business day. We do not share your details.</p>
</form>
</div>
</div>
</section>`,
  };
};

// ============================================================================
// MENU
// ============================================================================
const menu = () => {
  const title = 'Beer, Wine & Food Menu | Mr. Chile Taproom, Santa Rosa';
  const description =
    'What Mr. Chile Taproom pours and serves: a rotating list of Sonoma County craft beer, cider and wine, baked Ed Hops Wings, Louie The Mac, chips and salsa, non-alcoholic options and al pastor from the Freaking Tacos truck out back.';
  return {
    path: '/menu/',
    title,
    description,
    jsonld: g([
      ...base('/menu/', title, description, [HOME, { name: 'Beer & Food', path: '/menu/' }]),
      S.menuNode(),
    ]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">Beer &amp; food</span>
<h1 style="font-size:clamp(2.2rem,7vw,4.4rem)">What we pour</h1>
<p class="lede" style="margin-top:1.25rem"><strong>Mr. Chile Taproom serves a rotating list of Sonoma County and North Bay craft beer, cider and wine alongside a bar-food kitchen.</strong> The signature items are the baked Ed Hops Wings and Louie The Mac. An independent taco truck, Freaking Tacos, parks in the back.</p>
${statusStrip}
</div>
</section>

${PICADO}

<section class="band">
<div class="wrap grid grid--2">
${site.menu
  .map(
    (sec) => `<section class="card">
<h2 style="font-size:clamp(1.5rem,3.5vw,2rem)">${esc(sec.section)}</h2>
<p class="form__note">${esc(sec.note)}</p>
<ul class="mlist">${sec.items
      .map((i) => `<li><strong>${esc(i.name)}</strong><span>${esc(i.desc)}</span></li>`)
      .join('')}</ul>
</section>`
  )
  .join('')}
</div>
<div class="wrap" style="margin-top:2.5rem">
<p class="form__note">The tap list changes constantly and is not published here on purpose &mdash; a stale list is worse than no list. Call <a href="tel:${site.phoneE164}" style="color:var(--marigold)">${site.phone}</a> or check Instagram for what is on right now.</p>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div><span class="eyebrow">Dietary</span><h2>Good to know</h2></div>
<div><dl class="specs">
<div><dt>Vegetarian</dt><dd>Vegetarian options are on the kitchen menu.</dd></div>
<div><dt>Vegan</dt><dd>Limited. Call ahead if this matters for your group.</dd></div>
<div><dt>Non-alcoholic</dt><dd>Mexican Coke, Martinelli&rsquo;s, sodas and sparkling water.</dd></div>
<div><dt>Kids</dt><dd>Families welcome in the taproom and on the patio before 8pm.</dd></div>
<div><dt>Large groups</dt><dd>The room handles large parties. For 25+ see <a href="/private-events/">private events</a>.</dd></div>
</dl></div>
</div>
</section>`,
  };
};

// ============================================================================
// VISIT
// ============================================================================
const visit = () => {
  const title = 'Visit Mr. Chile Taproom | Hours, Directions & Parking, Santa Rosa CA';
  const description =
    'Mr. Chile Taproom is at 4357 Montgomery Dr, Santa Rosa, CA 95405. Closed Monday, 4–9pm Tue–Thu, 3–11pm Fri–Sat, 12–9pm Sunday. Free on-site parking, creekside patio, family-friendly before 8pm.';
  return {
    path: '/visit/',
    title,
    description,
    jsonld: g([
      ...base('/visit/', title, description, [HOME, { name: 'Visit', path: '/visit/' }]),
      S.faqNode(faqs.filter((f) => /hours|located|parking|kid/i.test(f.q))),
    ]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">Visit</span>
<h1 style="font-size:clamp(2.2rem,7vw,4.4rem)">4357 Montgomery Dr</h1>
<p class="lede" style="margin-top:1.25rem"><strong>Mr. Chile Taproom is at 4357 Montgomery Dr, Santa Rosa, CA 95405, on Montgomery Drive near Mission Boulevard in east Santa Rosa.</strong> Parking is free in the on-site lot. It is about ten minutes from downtown Santa Rosa and roughly an hour and fifteen minutes from San Francisco.</p>
${statusStrip}
<div class="btn-row" style="margin-top:1.5rem">
<a class="btn btn--primary" href="https://www.google.com/maps/search/?api=1&amp;query=${site.lat},${site.lng}">Get directions</a>
<a class="btn btn--ghost" href="tel:${site.phoneE164}">Call ${site.phone}</a>
</div>
</div>
</section>

${PICADO}

<section class="band">
<div class="wrap grid grid--split">
<div>
<h2>Hours</h2>
<div style="margin-top:1.25rem">${hoursTable()}</div>
<p class="form__note" style="margin-top:1rem">Event nights can run past posted closing. Cumbia Rosa runs to 1am. Holidays vary &mdash; call to confirm.</p>
</div>
<div>
<h2>Details</h2>
<div style="margin-top:1.25rem">${napBlock()}</div>
</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap">
<span class="eyebrow">On arrival</span>
<h2>What to expect</h2>
<div class="grid grid--4" style="margin-top:2.5rem">
${site.amenities.map((a) => `<div class="card"><h4>${esc(a.name)}</h4><p>${esc(a.detail)}</p></div>`).join('')}
</div>
</div>
</section>

<section class="band">
<div class="wrap grid grid--split">
<div><span class="eyebrow">Getting here</span><h2>Directions</h2></div>
<div class="prose">
<p><strong>From downtown Santa Rosa:</strong> head east on 4th Street, which becomes Montgomery Drive. Stay on Montgomery for about three miles. The taproom is on the right near Mission Boulevard, in the shopping center set back from the road.</p>
<p><strong>From Highway 101:</strong> exit at 4th Street or College Avenue, head east through downtown and continue onto Montgomery Drive.</p>
<p><strong>From Sonoma or Kenwood:</strong> take Highway 12 west into Santa Rosa and turn onto Montgomery Drive. The taproom is on the left.</p>
<p><strong>Parking:</strong> the shared surface lot is free, open and usually has space even on event nights. No permit or validation.</p>
</div>
</div>
</section>`,
  };
};

// ============================================================================
// FAQ
// ============================================================================
const faqPage = () => {
  const title = 'Mr. Chile Taproom FAQ | Hours, Events, Parking & Private Bookings';
  const description =
    'Answers about Mr. Chile Taproom in Santa Rosa: opening hours, location and parking, whether it is kid-friendly, what Cumbia Rosa is, food and drink, live music and how to book a private event.';
  return {
    path: '/faq/',
    title,
    description,
    jsonld: g([
      ...base('/faq/', title, description, [HOME, { name: 'FAQ', path: '/faq/' }]),
      S.faqNode(),
    ]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">FAQ</span>
<h1 style="font-size:clamp(2.2rem,7vw,4.4rem)">Questions, answered</h1>
<p class="lede" style="margin-top:1.25rem">Everything people ask before they come. If it is not here, call ${site.phone}.</p>
</div>
</section>

${PICADO}

<section class="band">
<div class="wrap" style="max-width:900px">${faqBlock(faqs)}</div>
</section>

<section class="band band--chile">
<div class="wrap grid grid--split">
<div><span class="eyebrow">Still deciding?</span><h2>Come by</h2></div>
<div><p class="lede">${esc(hoursSummary)}. ${esc(fullAddress)}.</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--gold" href="https://www.google.com/maps/search/?api=1&amp;query=${site.lat},${site.lng}">Directions</a>
<a class="btn btn--ghost" href="tel:${site.phoneE164}" style="border-color:rgba(255,255,255,.5)">Call ${site.phone}</a>
</div></div>
</div>
</section>`,
  };
};

// ============================================================================
// ESPAÑOL
// ============================================================================
const espanol = () => {
  const title = 'Mr. Chile Taproom | El primer taproom latino del condado de Sonoma';
  const description =
    'Taproom latino en Santa Rosa, California. Cerveza artesanal local, comida, patio junto al arroyo y noches de cumbia. 4357 Montgomery Dr. Abierto de martes a domingo. Eventos privados hasta 150 personas.';
  return {
    path: '/es/',
    lang: 'es',
    title,
    description,
    jsonld: g([S.businessNode(), S.websiteNode(), ...S.seriesNodes()]),
    body: `
<section class="hero">
<div class="wrap hero__in">
<span class="eyebrow">Santa Rosa, California &middot; Montgomery y Mission</span>
<h1>El primer taproom<em>latino de Sonoma</em></h1>
<p class="hero__sub">Cerveza y cultura &middot; Cumbia, comedia y m&uacute;sica en vivo &middot; Patio junto al arroyo</p>
${statusStrip}
<div class="board" style="margin-top:1.75rem">
<div class="board__top"><span class="board__label">En cartelera</span><span class="pill pill--gold">Condado de Sonoma</span></div>
<div class="board__body">
${site.series
  .slice(0, 3)
  .map(
    (s) => `<div class="board__row"><span class="board__when">${esc(s.kicker)}</span>
<div class="board__what"><h3>${esc(s.name)}</h3><p>${esc(s.esShort)}</p></div></div>`
  )
  .join('')}
</div>
<div class="board__foot btn-row">
<a class="btn btn--gold" href="tel:${site.phoneE164}">Llamar ${site.phone}</a>
<a class="btn btn--ghost" href="https://www.google.com/maps/search/?api=1&amp;query=${site.lat},${site.lng}">C&oacute;mo llegar</a>
</div>
</div>
</div>
</section>

${PICADO}

<section class="band band--alt">
<div class="wrap grid grid--split">
<div><span class="eyebrow eyebrow--chile">Qu&eacute; es este lugar</span><h2>Un taproom que funciona como sal&oacute;n de eventos</h2></div>
<div class="prose">
<p><strong>Mr. Chile Taproom es un taproom latino de cerveza artesanal y sal&oacute;n de eventos ubicado en 4357 Montgomery Dr, Santa Rosa, California.</strong> Servimos cerveza, sidra y vino local del condado de Sonoma, comida de bar, y organizamos noches de cumbia, comedia, m&uacute;sica en vivo y eventos ben&eacute;ficos.</p>
<p>Atr&aacute;s hay un patio con &aacute;rboles junto al arroyo de Santa Rosa, con juegos, espacio para ni&ntilde;os y un camión de tacos. Estacionamiento gratis. Se habla espa&ntilde;ol.</p>
</div>
</div>
</section>

<section class="band">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">Horario</span><h2>Vis&iacute;tanos</h2>
<a class="tel" href="tel:${site.phoneE164}" style="margin-top:1rem;display:inline-block">${site.phone}</a>
<p style="margin-top:1rem;color:var(--masa-dim)">${esc(fullAddress)}</p>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--primary" href="/">English site</a></div>
</div>
<div>${hoursTable()}
<p class="form__note" style="margin-top:1rem">Las noches de evento pueden extenderse. Cumbia Rosa va hasta la 1am.</p>
</div>
</div>
</section>

<section class="band band--chile">
<div class="wrap grid grid--split">
<div><span class="eyebrow">Eventos privados</span><h2>Renta el sal&oacute;n</h2></div>
<div><p class="lede">Quincea&ntilde;eras, cumplea&ntilde;os, fiestas de empresa, cenas de ensayo y eventos ben&eacute;ficos. Hasta 150 personas. Patio, sal&oacute;n trasero o el lugar completo.</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--gold" href="/private-events/">Ver paquetes</a>
<a class="btn btn--ghost" href="tel:${site.phoneE164}" style="border-color:rgba(255,255,255,.5)">Llamar</a>
</div></div>
</div>
</section>`,
  };
};

// ============================================================================
const notFound = () => ({
  path: '/404.html',
  raw: true,
  title: 'Page not found | Mr. Chile Taproom',
  description: 'That page does not exist.',
  robots: 'noindex,follow',
  jsonld: g([S.businessNode()]),
  body: `<section class="band"><div class="wrap">
<span class="eyebrow eyebrow--chile">404</span>
<h1 style="font-size:clamp(2.2rem,7vw,4.4rem)">That page moved on</h1>
<p class="lede" style="margin-top:1.25rem">The link is broken, but the taproom is not. Try the calendar, or call ${site.phone}.</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--primary" href="/">Home</a>
<a class="btn btn--ghost" href="/events/">What&rsquo;s on</a>
</div></div></section>`,
});

export const pages = [home, events, privateEvents, menu, visit, faqPage, espanol, notFound].map((f) => f());
