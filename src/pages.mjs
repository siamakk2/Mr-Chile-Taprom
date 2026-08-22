import { site, faqs, fullAddress, hoursSummary, L } from './site.config.mjs';
import { ROUTES, UI, formatDate, shortDate, time12 } from './routes.mjs';
import { esc, pic, flyer, PICADO } from './layout.mjs';
import * as S from './schema.mjs';

const g = S.graph;
const t = (k, loc) => L(UI[k], loc);
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`;
const tel = `tel:${site.phoneE164}`;

const base = (path, title, description, trail, loc) => [
  S.businessNode(loc), S.websiteNode(loc),
  S.webPageNode({ path, title, description, trail, loc }),
];
const home = (loc) => ({ name: loc === 'es' ? 'Inicio' : 'Home', path: ROUTES.home[loc] });

const status = (loc) => `<p class="status" data-status>${esc(L(hoursSummary, loc))}</p>`;

const hoursTable = (loc) => `<table class="hours" data-hours-table>
<caption class="vh">${esc(t('hours', loc))}</caption><tbody>${site.hours
  .map((h) => `<tr${h.open ? '' : ' data-closed="true"'}><th scope="row">${esc(L(h.day, loc))}</th><td>${esc(L(h.label, loc))}</td></tr>`)
  .join('')}</tbody></table>`;

const faqBlock = (list, loc) => `<div class="faq">${list
  .map((f) => `<details><summary>${esc(L(f.q, loc))}</summary><div class="faq__a"><p>${esc(L(f.a, loc))}</p></div></details>`)
  .join('')}</div>`;

const napBlock = (loc) => `<dl class="specs">
<div><dt>${esc(t('address', loc))}</dt><dd>${esc(fullAddress)} &middot; <a href="${mapUrl}">${esc(t('directions', loc))}</a></dd></div>
<div><dt>${esc(t('phone', loc))}</dt><dd><a href="${tel}">${site.phone}</a></dd></div>
<div><dt>${esc(t('email', loc))}</dt><dd><a href="mailto:${site.email}">${esc(site.email)}</a></dd></div>
<div><dt>${esc(t('crossSt', loc))}</dt><dd>${esc(site.crossStreet)}, ${esc(t('crossStVal', loc))}</dd></div>
<div><dt>${esc(t('parking', loc))}</dt><dd>${esc(t('parkingVal', loc))}</dd></div>
<div><dt>${esc(t('capacity', loc))}</dt><dd>${esc(t('capacityVal', loc))}</dd></div>
<div><dt>${esc(t('languages', loc))}</dt><dd>${esc(t('langsVal', loc))}</dd></div>
</dl>`;

/** Upcoming dated events, soonest first, past dates dropped automatically. */
const upcoming = () => {
  const today = new Date().toISOString().slice(0, 10);
  return site.datedEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ ...e, series: site.series.find((s) => s.slug === e.seriesSlug) || {} }));
};

const COPY = {
  heroKicker: { en: 'Santa Rosa, California · Montgomery & Mission', es: 'Santa Rosa, California · Montgomery y Mission' },
  heroA: { en: "Sonoma County's First", es: 'El primer taproom' },
  heroB: { en: 'Latino Taproom', es: 'latino de Sonoma' },
  heroSub: { en: 'Beer &amp; culture · Cumbia, sonidero and live music · Creekside patio',
             es: 'Cerveza y cultura · Cumbia, sonidero y música en vivo · Patio junto al arroyo' },
  whatEyebrow: { en: 'What this place is', es: 'Qué es este lugar' },
  whatH: { en: 'A taproom that runs like a venue', es: 'Un taproom que funciona como salón' },
  whatP1: {
    en: '<strong>Mr. Chile Taproom is a Latino-owned craft beer taproom and live event venue at 4357 Montgomery Dr, Suite B, in Santa Rosa, California.</strong> It pours a rotating list of Sonoma County beer, cider and wine, serves bar food built around baked wings and mac and cheese, and books cumbia nights, sonidero, live bands and community fundraisers.',
    es: '<strong>Mr. Chile Taproom es un taproom de cerveza artesanal y salón de eventos de propiedad latina en 4357 Montgomery Dr, Suite B, Santa Rosa, California.</strong> Sirve una lista rotativa de cerveza, sidra y vino del condado de Sonoma, comida de bar con alitas horneadas y macarrones con queso, y organiza noches de cumbia, sonidero, bandas en vivo y eventos benéficos.',
  },
  whatP2: {
    en: 'Out back, a patio runs along Santa Rosa Creek under mature oaks — string lights, heat lamps, picnic tables, yard games and a taco truck in the corner. Inside, flags of a dozen countries hang over the tap wall and the game goes up on the projector. Parking is free and on site.',
    es: 'Atrás, el patio se extiende junto al arroyo de Santa Rosa bajo robles — luces colgantes, calentadores, mesas de picnic, juegos y un camión de tacos en la esquina. Adentro, banderas de una docena de países cuelgan sobre la barra y el partido va en el proyector. Estacionamiento gratis.',
  },
  whatP3: {
    en: 'Most nights it is a neighborhood taproom. On the first Saturday of the month it is a dance floor until 2am.',
    es: 'Casi todas las noches es un taproom de barrio. El primer sábado del mes es una pista de baile hasta las 2am.',
  },
  progEyebrow: { en: 'The programming', es: 'La programación' },
  progH: { en: "What's on", es: 'Qué hay' },
  progLede: { en: 'Four things run on repeat, plus dated shows as they are announced.',
              es: 'Cuatro cosas se repiten cada mes, más fechas especiales conforme se anuncian.' },
  privEyebrow: { en: 'Private events', es: 'Eventos privados' },
  privH: { en: 'Book the room', es: 'Renta el salón' },
  privLede: {
    en: 'Quinceañeras, birthdays, company parties, rehearsal dinners, memorials, fundraisers and full-venue buyouts up to 150 guests. Patio, back room or the whole place.',
    es: 'Quinceañeras, cumpleaños, fiestas de empresa, cenas de ensayo, memoriales, eventos benéficos y renta completa hasta 150 personas. Patio, salón trasero o todo el lugar.',
  },
  privCta: { en: 'See packages &amp; enquire', es: 'Ver paquetes y cotizar' },
  roomEyebrow: { en: 'The room', es: 'El lugar' },
  roomH: { en: 'Why people come back', es: 'Por qué la gente regresa' },
  roomP: {
    en: 'Reviewers keep naming the same four things: the patio, the wings, the staff, and the fact that you can bring the kids before the music starts.',
    es: 'Las reseñas mencionan siempre lo mismo: el patio, las alitas, el personal, y que puedes traer a los niños antes de que empiece la música.',
  },
  faqEyebrow: { en: 'Common questions', es: 'Preguntas frecuentes' },
  faqH: { en: 'Before you come', es: 'Antes de venir' },
  visitEyebrow: { en: 'Visit', es: 'Visítanos' },
};
const c = (k, loc) => L(COPY[k], loc);

// ============================================================================
// HOME
// ============================================================================
export const homePage = (loc) => {
  const path = ROUTES.home[loc];
  const title = loc === 'es'
    ? 'Mr. Chile Taproom | El primer taproom latino del condado de Sonoma — Santa Rosa'
    : "Mr. Chile Taproom | Sonoma County's First Latino Taproom — Santa Rosa, CA";
  const description = loc === 'es'
    ? 'Taproom latino y salón de eventos en 4357 Montgomery Dr, Santa Rosa. Cerveza artesanal local, alitas horneadas, patio junto al arroyo, Cumbia Rosa cada primer sábado y noches sonideras. Abierto de martes a domingo.'
    : 'Latino-owned craft beer taproom and event venue at 4357 Montgomery Dr, Santa Rosa. Rotating local taps, baked wings, a creekside patio, Cumbia Rosa every first Saturday and sonidero nights. Open Tue–Sun.';
  const next = upcoming().slice(0, 2);

  return {
    path, loc, altPath: ROUTES.home[loc === 'en' ? 'es' : 'en'], title, description,
    jsonld: g([...base(path, title, description, [home(loc)], loc),
      ...S.seriesNodes(loc), ...S.datedEventNodes(loc), S.faqNode(faqs.slice(0, 6), loc)]),
    body: `
<section class="hero">
${pic('patio-wide', loc === 'es'
      ? 'El patio de Mr. Chile Taproom al anochecer, con luces colgantes entre los robles'
      : 'The patio at Mr. Chile Taproom at dusk, string lights strung between the oaks',
      { sizes: '100vw', cls: 'hero__bg', eager: true })}
<div class="wrap hero__in">
<span class="eyebrow">${esc(c('heroKicker', loc))}</span>
<h1>${esc(c('heroA', loc))}<em>${esc(c('heroB', loc))}</em></h1>
<p class="hero__sub">${c('heroSub', loc)}</p>
${status(loc)}
<div class="board">
  <div class="board__top">
    <span class="board__label">${esc(t(next.length ? 'upNext' : 'onTheBoard', loc))}</span>
    <span class="pill pill--gold">${esc(L(site.county, loc))}</span>
  </div>
  <div class="board__body">
${(next.length ? next : site.series.slice(0, 2).map((s) => ({ series: s }))).map((e) => `    <div class="board__row">
      <span class="board__when">${esc(e.date ? shortDate(e.date, loc) : L(e.series.kicker, loc))}</span>
      <div class="board__what"><h3>${esc(L(e.name, loc) || L(e.series.name, loc))}</h3>
      <p>${esc(L(e.series.short, loc))}</p>
      ${e.lineup ? `<p class="board__meta">${esc(e.lineup)}</p>` : ''}</div>
    </div>`).join('\n')}
  </div>
  <div class="board__foot btn-row">
    <a class="btn btn--gold" href="${ROUTES.events[loc]}">${esc(t('fullCalendar', loc))}</a>
    <a class="btn btn--ghost" href="${mapUrl}">${esc(t('directions', loc))}</a>
  </div>
</div>
</div>
</section>

${PICADO}

<section class="band band--alt">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow eyebrow--chile">${esc(c('whatEyebrow', loc))}</span>
<h2>${esc(c('whatH', loc))}</h2>
<figure class="fig" style="margin-top:1.75rem">
${pic('taproom', loc === 'es' ? 'El interior del taproom con la barra de barriles y banderas de muchos países'
  : 'Inside the taproom: the tap wall, high ceilings and flags of many countries',
  { sizes: '(min-width:720px) 45vw, 100vw' })}
</figure>
</div>
<div class="prose">
<p>${c('whatP1', loc)}</p>
<p>${c('whatP2', loc)}</p>
<p>${c('whatP3', loc)}</p>
</div>
</div>
</section>

<section class="band">
<div class="wrap">
<span class="eyebrow">${esc(c('progEyebrow', loc))}</span>
<h2>${esc(c('progH', loc))}</h2>
<p class="lede" style="margin-top:1rem">${esc(c('progLede', loc))}</p>
<div class="grid grid--4" style="margin-top:2.5rem">
${site.series.map((s) => `<a class="card card--link" href="${ROUTES.events[loc]}#${s.slug}">
<span class="card__kicker">${esc(L(s.kicker, loc))}</span>
<h3>${esc(L(s.name, loc))}</h3>
<p>${esc(L(s.short, loc))}</p>
<span class="card__tag">${esc(L(s.age, loc))}</span>
</a>`).join('')}
</div>
<div class="btn-row" style="margin-top:2rem"><a class="btn btn--primary" href="${ROUTES.events[loc]}">${esc(t('fullCalendar', loc))}</a></div>
</div>
</section>

<section class="band band--chile">
<div class="wrap grid grid--split">
<div><span class="eyebrow">${esc(c('privEyebrow', loc))}</span><h2>${esc(c('privH', loc))}</h2></div>
<div>
<p class="lede">${esc(c('privLede', loc))}</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--gold" href="${ROUTES.private[loc]}">${c('privCta', loc)}</a>
<a class="btn btn--ghost btn--onred" href="${tel}">${esc(t('call', loc))} ${site.phone}</a>
</div>
</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">${esc(c('roomEyebrow', loc))}</span>
<h2>${esc(c('roomH', loc))}</h2>
<p class="prose" style="margin-top:1.25rem">${esc(c('roomP', loc))}</p>
<figure class="fig" style="margin-top:1.75rem">
${pic('tacos-beer', loc === 'es' ? 'Una canasta de tacos al pastor con limón y salsa verde junto a una cerveza'
  : 'A basket of tacos al pastor with lime and salsa verde beside a cold beer',
  { sizes: '(min-width:720px) 45vw, 100vw' })}
</figure>
</div>
<div class="grid grid--2">
${site.amenities.map((a) => `<div class="card"><h4>${esc(L(a.name, loc))}</h4><p>${esc(L(a.detail, loc))}</p></div>`).join('')}
</div>
</div>
</section>

<section class="band">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">${esc(c('faqEyebrow', loc))}</span>
<h2>${esc(c('faqH', loc))}</h2>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--ghost" href="${ROUTES.faq[loc]}">${esc(t('allQuestions', loc))}</a></div>
</div>
<div>${faqBlock(faqs.slice(0, 6), loc)}</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow">${esc(c('visitEyebrow', loc))}</span>
<h2>4357 Montgomery Dr</h2>
<div style="margin:1.25rem 0">${status(loc)}</div>
<a class="tel" href="${tel}">${site.phone}</a>
<div style="margin-top:1.5rem">${napBlock(loc)}</div>
</div>
<div>
<h4 style="margin-bottom:1rem">${esc(t('hours', loc))}</h4>
${hoursTable(loc)}
<p class="form__note" style="margin-top:1rem">${esc(t('eventNote', loc))}</p>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--primary" href="${mapUrl}">${esc(t('openInMaps', loc))}</a></div>
</div>
</div>
</section>`,
  };
};

// ============================================================================
// EVENTS
// ============================================================================
export const eventsPage = (loc) => {
  const path = ROUTES.events[loc];
  const title = loc === 'es'
    ? 'Eventos en Mr. Chile Taproom | Cumbia, sonidero y música en vivo en Santa Rosa'
    : 'Events at Mr. Chile Taproom | Cumbia, Sonidero & Live Music in Santa Rosa';
  const description = loc === 'es'
    ? 'Qué hay en Mr. Chile Taproom, Santa Rosa: Cumbia Rosa cada primer sábado con clase a las 8:15pm y baile hasta las 2am, noches sonideras, música en vivo y eventos benéficos.'
    : "What's on at Mr. Chile Taproom, Santa Rosa: Cumbia Rosa every first Saturday with an 8:15pm class and dancing until 2am, sonidero nights, live music and quarterly benefits.";
  const next = upcoming();
  const lede = loc === 'es'
    ? '<strong>Mr. Chile Taproom organiza Cumbia Rosa cada primer sábado del mes, noches sonideras en sábados selectos, música en vivo casi todos los fines de semana y eventos benéficos trimestrales.</strong> Todo en 4357 Montgomery Dr, Suite B, Santa Rosa.'
    : '<strong>Mr. Chile Taproom hosts Cumbia Rosa on the first Saturday of every month, sonidero nights on select Saturdays, live music most weekends and quarterly benefit nights.</strong> Everything happens at 4357 Montgomery Dr, Suite B, Santa Rosa.';

  return {
    path, loc, altPath: ROUTES.events[loc === 'en' ? 'es' : 'en'], title, description,
    jsonld: g([...base(path, title, description, [home(loc), { name: L(UI.nav.events, loc), path }], loc),
      ...S.seriesNodes(loc), ...S.datedEventNodes(loc)]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">${loc === 'es' ? 'Calendario' : 'Calendar'}</span>
<h1 class="h1--sm">${esc(L(COPY.progH, loc))}</h1>
<p class="lede" style="margin-top:1.25rem">${lede}</p>
${status(loc)}
</div>
</section>

${PICADO}

${next.length ? `<section class="band band--alt">
<div class="wrap">
<span class="eyebrow eyebrow--chile">${esc(t('upNext', loc))}</span>
<h2>${loc === 'es' ? 'Próximas fechas' : 'Coming up'}</h2>
<div class="grid grid--2" style="margin-top:2.5rem">
${next.map((e) => `<article class="flyer">
<a href="/img/${e.image}.jpg" class="flyer__link">${flyer(e.image, `${L(e.name, loc) || L(e.series.name, loc)} — ${formatDate(e.date, loc)}`)}</a>
<div class="flyer__body">
<span class="card__kicker">${esc(formatDate(e.date, loc))} &middot; ${esc(L(e.series.age, loc))}</span>
<h3>${esc(L(e.name, loc) || L(e.series.name, loc))}</h3>
${e.lineup ? `<p class="flyer__lineup">${esc(e.lineup)}</p>` : ''}
<p>${esc(L(e.series.short, loc))}</p>
<p class="form__note">
<span class="pill">${esc(time12(e.start || e.series.startTime))}</span>
${e.priceNote ? `<span class="pill pill--gold">${esc(L(e.priceNote, loc))}</span>` : ''}
${e.food ? `<span class="pill">${esc(e.food)}</span>` : ''}
</p>
${e.ticketUrl ? `<a class="btn btn--primary" href="${e.ticketUrl}" rel="noopener">${loc === 'es' ? 'Boletos' : 'Tickets'}</a>` : ''}
</div>
</article>`).join('')}
</div>
</div>
</section>` : ''}

<section class="band">
<div class="wrap">
<span class="eyebrow">${loc === 'es' ? 'Cada mes' : 'Every month'}</span>
<h2>${loc === 'es' ? 'Lo que se repite' : 'What runs on repeat'}</h2>
<div class="stack" style="margin-top:2.5rem">
${site.series.map((s) => `<article id="${s.slug}" class="card card--wide">
<span class="card__kicker">${esc(L(s.kicker, loc))} &middot; ${esc(L(s.age, loc))}</span>
<h3 class="h2--sm">${esc(L(s.name, loc))}</h3>
<p style="font-size:1.02rem">${esc(L(s.long, loc))}</p>
<p class="form__note">
<span class="pill">${esc(L(s.genre, loc))}</span>
<span class="pill">${esc(time12(s.startTime))}–${esc(time12(s.endTime))}</span>
${s.partner ? `<a class="pill pill--gold" href="${s.partner.url}" rel="noopener">${esc(s.partner.name)}</a>` : ''}
</p>
</article>`).join('')}
</div>
</div>
</section>

<section class="band band--chile">
<div class="wrap grid grid--split">
<div><span class="eyebrow">${loc === 'es' ? 'Fechas y boletos' : 'Dates & tickets'}</span>
<h2>${loc === 'es' ? 'Confirma antes de manejar' : 'Confirm before you drive'}</h2></div>
<div>
<p class="lede">${loc === 'es'
      ? 'Las fechas, carteles y boletos se publican primero en Instagram y Facebook. Llama al taproom si quieres confirmarlo con una persona.'
      : 'Dates, lineups and ticket links post to Instagram and Facebook first. Call the taproom if you want it confirmed by a person.'}</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--gold" href="https://www.instagram.com/mr.chiletaproom/" rel="noopener">Instagram</a>
<a class="btn btn--ghost btn--onred" href="${tel}">${esc(t('call', loc))} ${site.phone}</a>
</div>
</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div><span class="eyebrow">${esc(c('privEyebrow', loc))}</span><h2>${esc(c('privH', loc))}</h2></div>
<div><p class="lede">${esc(c('privLede', loc))}</p>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--primary" href="${ROUTES.private[loc]}">${c('privCta', loc)}</a></div></div>
</div>
</section>`,
  };
};

// ============================================================================
// PRIVATE EVENTS
// ============================================================================
export const privatePage = (loc) => {
  const path = ROUTES.private[loc];
  const title = loc === 'es'
    ? 'Salón para eventos privados en Santa Rosa | Mr. Chile Taproom'
    : 'Private Event Venue in Santa Rosa | Book Mr. Chile Taproom';
  const description = loc === 'es'
    ? 'Renta Mr. Chile Taproom en Santa Rosa para eventos privados: quinceañeras, cumpleaños, fiestas de empresa y eventos benéficos. Patio hasta 80, salón 25–45, lugar completo hasta 150. (707) 239-4188.'
    : 'Book Mr. Chile Taproom in Santa Rosa for private events: quinceañeras, birthdays, company parties, rehearsal dinners and fundraisers. Patio to 80, back room 25–45, full venue to 150. Call (707) 239-4188.';
  const inc = {
    en: [['Outside food', 'Yes for full buyouts and patio bookings — including cake and catering. Alcohol must come from the bar.'],
      ['Taco truck', 'Freaking Tacos can be coordinated for your event. Ask when you enquire.'],
      ['Sound', 'Stage, PA and projector on full buyouts. Bring your own DJ or we can suggest one.'],
      ['Decor', 'Bring your own. Setup time is included in the booking window.'],
      ['Minors', 'Welcome at daytime and early-evening events. Bar-service events after 8pm are 21+.'],
      ['Deposit', 'A deposit holds the date and applies to your final bill.'],
      ['Parking', 'Free on-site lot, no validation needed.'],
      ['Languages', 'We plan events in English and Spanish.']],
    es: [['Comida externa', 'Sí para renta completa y patio — incluyendo pastel y catering. El alcohol debe venir del bar.'],
      ['Camión de tacos', 'Podemos coordinar Freaking Tacos para tu evento. Pregunta al cotizar.'],
      ['Sonido', 'Escenario, sonido y proyector con renta completa. Trae tu DJ o te recomendamos uno.'],
      ['Decoración', 'Trae la tuya. El tiempo de montaje está incluido.'],
      ['Menores', 'Bienvenidos en eventos de día y temprano. Los eventos con bar después de las 8pm son 21+.'],
      ['Depósito', 'Un depósito aparta la fecha y se aplica a la cuenta final.'],
      ['Estacionamiento', 'Gratis en el lugar, sin validación.'],
      ['Idiomas', 'Planeamos eventos en español e inglés.']],
  }[loc];
  const types = {
    en: ['Birthday', 'Quinceañera', 'Graduation', 'Company party or offsite', 'Rehearsal dinner', 'Memorial', 'Nonprofit fundraiser', 'Live music or album release', 'Other'],
    es: ['Cumpleaños', 'Quinceañera', 'Graduación', 'Fiesta de empresa', 'Cena de ensayo', 'Memorial', 'Evento benéfico', 'Música en vivo o lanzamiento', 'Otro'],
  }[loc];
  const F = {
    en: { name: 'Your name', phone: 'Phone', email: 'Email', date: 'Preferred date', guests: 'Guest count', type: 'Type of event', space: 'Space', notes: 'Anything else', unsure: 'Not sure yet', send: 'Send enquiry', blank: 'Leave blank', ph: 'Food, music, timing, decor, budget range…', reply: 'You get a reply within one business day. We do not share your details.' },
    es: { name: 'Tu nombre', phone: 'Teléfono', email: 'Correo', date: 'Fecha preferida', guests: 'Número de personas', type: 'Tipo de evento', space: 'Espacio', notes: 'Algo más', unsure: 'Todavía no sé', send: 'Enviar solicitud', blank: 'Dejar en blanco', ph: 'Comida, música, horario, decoración, presupuesto…', reply: 'Te respondemos en un día hábil. No compartimos tus datos.' },
  }[loc];

  return {
    path, loc, altPath: ROUTES.private[loc === 'en' ? 'es' : 'en'], title, description,
    jsonld: g([...base(path, title, description, [home(loc), { name: L(UI.nav.private, loc), path }], loc),
      ...S.serviceNodes(loc),
      { '@type': 'ItemList', name: title, itemListElement: site.privatePackages.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: L(p.name, loc), description: `${L(p.capacity, loc)}. ${L(p.best, loc)}.` })) }]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">${esc(c('privEyebrow', loc))}</span>
<h1 class="h1--sm">${esc(c('privH', loc))}</h1>
<p class="lede" style="margin-top:1.25rem">${loc === 'es'
      ? '<strong>Mr. Chile Taproom renta para eventos privados de hasta 150 personas en Santa Rosa</strong> — quinceañeras, cumpleaños, graduaciones, fiestas de empresa, cenas de ensayo, memoriales y eventos benéficos. Elige el patio junto al arroyo, el salón trasero semiprivado, o todo el lugar.'
      : '<strong>Mr. Chile Taproom books private events in Santa Rosa for up to 150 guests</strong> — quinceañeras, birthdays, graduations, company parties, team offsites, rehearsal dinners, memorials and nonprofit fundraisers. Choose the creekside patio, the semi-private back room, or a full venue buyout.'}</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--primary" href="#enquire">${loc === 'es' ? 'Pedir cotización' : 'Send an enquiry'}</a>
<a class="btn btn--ghost" href="${tel}">${esc(t('call', loc))} ${site.phone}</a>
</div>
</div>
</section>

<figure class="banner">
${pic('patio-dusk', loc === 'es' ? 'El corredor cubierto y las luces sobre el patio al atardecer'
      : 'The covered walkway and string lights over the patio at dusk',
      { sizes: '100vw' })}
</figure>

<section class="band">
<div class="wrap">
<span class="eyebrow">${loc === 'es' ? 'Tres formas de rentar' : 'Three ways to book'}</span>
<h2>${loc === 'es' ? 'Paquetes' : 'Packages'}</h2>
<div class="grid grid--3" style="margin-top:2.5rem">
${site.privatePackages.map((p) => `<div class="card">
<span class="card__kicker">${esc(L(p.capacity, loc))}</span>
<h3>${esc(L(p.name, loc))}</h3>
<p><strong class="hi">${loc === 'es' ? 'Ideal para:' : 'Best for:'}</strong> ${esc(L(p.best, loc))}</p>
<ul class="mlist">${L(p.includes, loc).map((x) => `<li><span>${esc(x)}</span></li>`).join('')}</ul>
</div>`).join('')}
</div>
<p class="form__note" style="margin-top:1.5rem">${loc === 'es'
      ? 'El precio depende de la fecha, el número de personas y si quieres cuenta abierta, boletos de bebida o bar de paga. Envía el formulario y te regresamos una cotización por escrito.'
      : 'Pricing depends on date, guest count and whether you want a bar tab, drink tickets or a cash bar. Send the form below and you get a written quote back.'}</p>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div><span class="eyebrow">${loc === 'es' ? 'Respuestas directas' : 'Straight answers'}</span>
<h2>${loc === 'es' ? 'Qué incluye' : "What's included"}</h2>
<figure class="fig" style="margin-top:1.75rem">
${pic('patio-tacos', loc === 'es' ? 'Sombrillas rojas sobre mesas de picnic con el camión de tacos atrás'
      : 'Red umbrellas over picnic tables with the taco truck behind',
      { sizes: '(min-width:720px) 45vw, 100vw' })}
</figure>
</div>
<div>
<dl class="specs">${inc.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<p class="form__note" style="margin-top:1rem">${loc === 'es' ? 'Los términos se confirman por escrito al reservar.' : 'Terms are confirmed in writing when you book.'}</p>
</div>
</div>
</section>

<section class="band" id="enquire">
<div class="wrap grid grid--split">
<div>
<span class="eyebrow eyebrow--chile">${loc === 'es' ? 'Cotización' : 'Enquiry'}</span>
<h2>${loc === 'es' ? 'Cuéntanos de tu evento' : 'Tell us about the night'}</h2>
<p class="prose" style="margin-top:1.25rem">${loc === 'es'
      ? 'Entre más nos digas, más precisa la cotización. Si prefieres hablarlo, llama al'
      : 'The more you put in, the tighter the quote comes back. If you would rather talk it through, call'} <a class="hi" href="${tel}">${site.phone}</a>.</p>
</div>
<div>
<form class="form" method="POST" action="${site.formEndpoint}">
<input type="hidden" name="_subject" value="Private event enquiry — ${loc}">
<input type="hidden" name="_language" value="${loc}">
<p class="vh"><label>${esc(F.blank)}<input name="_gotcha" tabindex="-1" autocomplete="off"></label></p>
<div class="form__2">
<div class="field"><label for="name">${esc(F.name)}</label><input id="name" name="name" required autocomplete="name"></div>
<div class="field"><label for="phone">${esc(F.phone)}</label><input id="phone" name="phone" type="tel" required autocomplete="tel"></div>
</div>
<div class="field"><label for="email">${esc(F.email)}</label><input id="email" name="email" type="email" required autocomplete="email"></div>
<div class="form__2">
<div class="field"><label for="date">${esc(F.date)}</label><input id="date" name="date" type="date"></div>
<div class="field"><label for="guests">${esc(F.guests)}</label><input id="guests" name="guests" type="number" min="10" max="150" inputmode="numeric"></div>
</div>
<div class="field"><label for="type">${esc(F.type)}</label><select id="type" name="type">${types.map((x) => `<option>${esc(x)}</option>`).join('')}</select></div>
<div class="field"><label for="space">${esc(F.space)}</label><select id="space" name="space">
${site.privatePackages.map((p) => `<option>${esc(L(p.name, loc))} — ${esc(L(p.capacity, loc))}</option>`).join('')}
<option>${esc(F.unsure)}</option></select></div>
<div class="field"><label for="notes">${esc(F.notes)}</label><textarea id="notes" name="notes" placeholder="${esc(F.ph)}"></textarea></div>
<button class="btn btn--primary" type="submit">${esc(F.send)}</button>
<p class="form__note">${esc(F.reply)}</p>
</form>
</div>
</div>
</section>`,
  };
};

// ============================================================================
// MENU
// ============================================================================
export const menuPage = (loc) => {
  const path = ROUTES.menu[loc];
  const title = loc === 'es'
    ? 'Cerveza, vino y comida | Mr. Chile Taproom, Santa Rosa'
    : 'Beer, Wine & Food Menu | Mr. Chile Taproom, Santa Rosa';
  const description = loc === 'es'
    ? 'Lo que sirve Mr. Chile Taproom: cerveza artesanal, sidra y vino del condado de Sonoma, alitas Ed Hops horneadas, Louie The Mac, totopos con salsa, opciones sin alcohol y tacos al pastor del camión Freaking Tacos.'
    : 'What Mr. Chile Taproom pours and serves: rotating Sonoma County craft beer, cider and wine, baked Ed Hops Wings, Louie The Mac, chips and salsa, non-alcoholic options and al pastor from the Freaking Tacos truck.';
  const diet = {
    en: [['Vegetarian', 'Vegetarian options are on the kitchen menu.'], ['Vegan', 'Limited. Call ahead if this matters for your group.'],
      ['Non-alcoholic', "Mexican Coke, Martinelli's, sodas and sparkling water."], ['Kids', 'Families welcome in the taproom and on the patio before 8pm.'],
      ['Large groups', 'The room handles large parties.']],
    es: [['Vegetariano', 'Hay opciones vegetarianas en la cocina.'], ['Vegano', 'Limitado. Llama antes si es importante para tu grupo.'],
      ['Sin alcohol', "Mexican Coke, Martinelli's, refrescos y agua mineral."], ['Niños', 'Las familias son bienvenidas antes de las 8pm.'],
      ['Grupos grandes', 'El salón recibe grupos grandes.']],
  }[loc];

  return {
    path, loc, altPath: ROUTES.menu[loc === 'en' ? 'es' : 'en'], title, description,
    jsonld: g([...base(path, title, description, [home(loc), { name: L(UI.nav.menu, loc), path }], loc), S.menuNode(loc)]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">${esc(L(UI.nav.menu, loc))}</span>
<h1 class="h1--sm">${loc === 'es' ? 'Lo que servimos' : 'What we pour'}</h1>
<p class="lede" style="margin-top:1.25rem">${loc === 'es'
      ? '<strong>Mr. Chile Taproom sirve una lista rotativa de cerveza artesanal, sidra y vino del condado de Sonoma y el North Bay, junto con cocina de bar.</strong> Los platillos insignia son las alitas Ed Hops horneadas y Louie The Mac. Un camión independiente, Freaking Tacos, se estaciona en el patio.'
      : '<strong>Mr. Chile Taproom serves a rotating list of Sonoma County and North Bay craft beer, cider and wine alongside a bar-food kitchen.</strong> The signature items are the baked Ed Hops Wings and Louie The Mac. An independent taco truck, Freaking Tacos, parks on the patio.'}</p>
${status(loc)}
</div>
</section>

<figure class="banner">
${pic('tacos-beer', loc === 'es' ? 'Tacos al pastor y una cerveza fría en la barra' : 'Tacos al pastor and a cold beer on the bar',
      { sizes: '100vw' })}
</figure>

<section class="band">
<div class="wrap grid grid--2">
${site.menu.map((sec) => `<section class="card">
<h2 class="h2--sm">${esc(L(sec.section, loc))}</h2>
<p class="form__note">${esc(L(sec.note, loc))}</p>
<ul class="mlist">${sec.items.map((i) => `<li><strong>${esc(L(i.name, loc))}</strong><span>${esc(L(i.desc, loc))}</span></li>`).join('')}</ul>
</section>`).join('')}
</div>
<div class="wrap" style="margin-top:2.5rem">
<p class="form__note">${loc === 'es'
      ? 'La lista de barriles cambia constantemente y no se publica aquí a propósito — una lista vieja es peor que ninguna. Llama al'
      : 'The tap list changes constantly and is not published here on purpose — a stale list is worse than no list. Call'}
<a class="hi" href="${tel}">${site.phone}</a> ${loc === 'es' ? 'o revisa Instagram para ver qué hay hoy.' : 'or check Instagram for what is on right now.'}</p>
</div>
</section>

<section class="band band--alt">
<div class="wrap grid grid--split">
<div><span class="eyebrow">${loc === 'es' ? 'Dietas' : 'Dietary'}</span><h2>${loc === 'es' ? 'Bueno saber' : 'Good to know'}</h2></div>
<div><dl class="specs">${diet.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<div class="btn-row" style="margin-top:1.5rem"><a class="btn btn--ghost" href="${ROUTES.private[loc]}">${esc(L(UI.nav.private, loc))}</a></div></div>
</div>
</section>`,
  };
};

// ============================================================================
// VISIT
// ============================================================================
export const visitPage = (loc) => {
  const path = ROUTES.visit[loc];
  const title = loc === 'es'
    ? 'Visita Mr. Chile Taproom | Horario, cómo llegar y estacionamiento, Santa Rosa'
    : 'Visit Mr. Chile Taproom | Hours, Directions & Parking, Santa Rosa CA';
  const description = loc === 'es'
    ? 'Mr. Chile Taproom está en 4357 Montgomery Dr, Suite B, Santa Rosa, CA 95405. Lunes cerrado, 4–9pm mar–jue, 3–11pm vie–sáb, 12–9pm domingo. Estacionamiento gratis y patio junto al arroyo.'
    : 'Mr. Chile Taproom is at 4357 Montgomery Dr, Suite B, Santa Rosa, CA 95405. Closed Monday, 4–9pm Tue–Thu, 3–11pm Fri–Sat, 12–9pm Sunday. Free on-site parking and a creekside patio.';
  const dirs = {
    en: [['From downtown Santa Rosa', 'Head east on 4th Street, which becomes Montgomery Drive. Stay on Montgomery about three miles. The taproom is on the right near Mission Boulevard, set back from the road.'],
      ['From Highway 101', 'Exit at 4th Street or College Avenue, head east through downtown and continue onto Montgomery Drive.'],
      ['From Sonoma or Kenwood', 'Take Highway 12 west into Santa Rosa and turn onto Montgomery Drive. The taproom is on the left.'],
      ['Parking', 'The shared surface lot is free and open, and usually has space even on event nights. No permit, no validation.']],
    es: [['Desde el centro de Santa Rosa', 'Toma la 4th Street hacia el este, que se convierte en Montgomery Drive. Sigue unas tres millas. El taproom queda a la derecha cerca de Mission Boulevard, retirado de la calle.'],
      ['Desde la Highway 101', 'Sal en 4th Street o College Avenue, cruza el centro hacia el este y continúa por Montgomery Drive.'],
      ['Desde Sonoma o Kenwood', 'Toma la Highway 12 al oeste hacia Santa Rosa y dobla en Montgomery Drive. El taproom queda a la izquierda.'],
      ['Estacionamiento', 'El lote compartido es gratis y abierto, y casi siempre hay lugar incluso en noches de evento. Sin permiso ni validación.']],
  }[loc];

  return {
    path, loc, altPath: ROUTES.visit[loc === 'en' ? 'es' : 'en'], title, description,
    jsonld: g([...base(path, title, description, [home(loc), { name: L(UI.nav.visit, loc), path }], loc),
      S.faqNode(faqs.filter((f) => /hours|horario|where|dónde|parking|estacionamiento|kid|niños/i.test(L(f.q, loc))), loc)]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">${esc(L(UI.nav.visit, loc))}</span>
<h1 class="h1--sm">4357 Montgomery Dr</h1>
<p class="lede" style="margin-top:1.25rem">${loc === 'es'
      ? '<strong>Mr. Chile Taproom está en 4357 Montgomery Dr, Suite B, Santa Rosa, CA 95405, sobre Montgomery Drive cerca de Mission Boulevard.</strong> El estacionamiento es gratis. Queda a unos diez minutos del centro de Santa Rosa y a una hora y cuarto de San Francisco.'
      : '<strong>Mr. Chile Taproom is at 4357 Montgomery Dr, Suite B, Santa Rosa, CA 95405, on Montgomery Drive near Mission Boulevard in east Santa Rosa.</strong> Parking is free in the on-site lot. It is about ten minutes from downtown Santa Rosa and roughly an hour and fifteen minutes from San Francisco.'}</p>
${status(loc)}
<div class="btn-row" style="margin-top:1.5rem">
<a class="btn btn--primary" href="${mapUrl}">${esc(t('directions', loc))}</a>
<a class="btn btn--ghost" href="${tel}">${esc(t('call', loc))} ${site.phone}</a>
</div>
</div>
</section>

<figure class="banner">
${pic('patio-wide', loc === 'es' ? 'El patio con mesas de picnic y calentadores bajo los robles al anochecer'
      : 'The patio with picnic tables and heat lamps under the oaks at dusk',
      { sizes: '100vw' })}
</figure>

<section class="band">
<div class="wrap grid grid--split">
<div>
<h2>${esc(t('hours', loc))}</h2>
<div style="margin-top:1.25rem">${hoursTable(loc)}</div>
<p class="form__note" style="margin-top:1rem">${esc(t('eventNote', loc))} ${loc === 'es' ? 'Cumbia Rosa va hasta las 2am.' : 'Cumbia Rosa runs to 2am.'}</p>
</div>
<div>
<h2>${loc === 'es' ? 'Detalles' : 'Details'}</h2>
<div style="margin-top:1.25rem">${napBlock(loc)}</div>
</div>
</div>
</section>

<section class="band band--alt">
<div class="wrap">
<span class="eyebrow">${loc === 'es' ? 'Al llegar' : 'On arrival'}</span>
<h2>${loc === 'es' ? 'Qué vas a encontrar' : 'What to expect'}</h2>
<div class="grid grid--3" style="margin-top:2.5rem">
${site.amenities.map((a) => `<div class="card"><h4>${esc(L(a.name, loc))}</h4><p>${esc(L(a.detail, loc))}</p></div>`).join('')}
</div>
</div>
</section>

<section class="band">
<div class="wrap grid grid--split">
<div><span class="eyebrow">${loc === 'es' ? 'Cómo llegar' : 'Getting here'}</span>
<h2>${loc === 'es' ? 'Indicaciones' : 'Directions'}</h2>
<figure class="fig" style="margin-top:1.75rem">
${pic('taproom', loc === 'es' ? 'El interior del taproom con la barra iluminada' : 'The lit bar inside the taproom',
      { sizes: '(min-width:720px) 45vw, 100vw' })}
</figure>
</div>
<div class="prose">${dirs.map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join('')}</div>
</div>
</section>`,
  };
};

// ============================================================================
// FAQ
// ============================================================================
export const faqPage = (loc) => {
  const path = ROUTES.faq[loc];
  const title = loc === 'es'
    ? 'Preguntas frecuentes | Mr. Chile Taproom, Santa Rosa'
    : 'Mr. Chile Taproom FAQ | Hours, Events, Parking & Private Bookings';
  const description = loc === 'es'
    ? 'Respuestas sobre Mr. Chile Taproom en Santa Rosa: horario, ubicación y estacionamiento, si pueden ir niños, qué es Cumbia Rosa, comida y bebida, música en vivo y cómo rentar para eventos privados.'
    : 'Answers about Mr. Chile Taproom in Santa Rosa: opening hours, location and parking, whether it is kid-friendly, what Cumbia Rosa is, food and drink, live music and how to book a private event.';
  return {
    path, loc, altPath: ROUTES.faq[loc === 'en' ? 'es' : 'en'], title, description,
    jsonld: g([...base(path, title, description, [home(loc), { name: L(UI.nav.faq, loc), path }], loc), S.faqNode(faqs, loc)]),
    body: `
<section class="band band--tight">
<div class="wrap">
<span class="eyebrow">${esc(L(UI.nav.faq, loc))}</span>
<h1 class="h1--sm">${loc === 'es' ? 'Preguntas, respondidas' : 'Questions, answered'}</h1>
<p class="lede" style="margin-top:1.25rem">${loc === 'es'
      ? `Todo lo que la gente pregunta antes de venir. Si no está aquí, llama al ${site.phone}.`
      : `Everything people ask before they come. If it is not here, call ${site.phone}.`}</p>
</div>
</section>

${PICADO}

<section class="band">
<div class="wrap wrap--narrow">${faqBlock(faqs, loc)}</div>
</section>

<section class="band band--chile">
<div class="wrap grid grid--split">
<div><span class="eyebrow">${loc === 'es' ? '¿Todavía lo piensas?' : 'Still deciding?'}</span>
<h2>${loc === 'es' ? 'Ven un rato' : 'Come by'}</h2></div>
<div><p class="lede">${esc(L(hoursSummary, loc))}. ${esc(fullAddress)}.</p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--gold" href="${mapUrl}">${esc(t('directions', loc))}</a>
<a class="btn btn--ghost btn--onred" href="${tel}">${esc(t('call', loc))} ${site.phone}</a>
</div></div>
</div>
</section>`,
  };
};

export const notFoundPage = () => ({
  path: '/404.html', loc: 'en', altPath: '/es/', raw: true,
  title: 'Page not found | Mr. Chile Taproom',
  description: 'That page does not exist.',
  robots: 'noindex,follow',
  jsonld: g([S.businessNode('en')]),
  body: `<section class="band"><div class="wrap">
<span class="eyebrow eyebrow--chile">404</span>
<h1 class="h1--sm">That page moved on</h1>
<p class="lede" style="margin-top:1.25rem">The link is broken, but the taproom is not. Try the calendar, or call ${site.phone}.<br><span lang="es">El enlace no sirve, pero el taproom sí. Visita el calendario o llama.</span></p>
<div class="btn-row" style="margin-top:1.75rem">
<a class="btn btn--primary" href="/">Home</a>
<a class="btn btn--ghost" href="/events/">What&rsquo;s on</a>
<a class="btn btn--ghost" href="/es/" lang="es">Español</a>
</div></div></section>`,
});

export const PAGE_BUILDERS = [homePage, eventsPage, privatePage, menuPage, visitPage, faqPage];
