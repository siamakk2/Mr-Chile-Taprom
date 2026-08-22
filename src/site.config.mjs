// ============================================================================
// MR. CHILE TAPROOM — SINGLE SOURCE OF TRUTH (bilingual)
// Facts live here once. Pages, JSON-LD, llms.txt and sitemap.xml all read from
// this file, in both English and Spanish. See AUDIT.md for why that matters.
//
// Bilingual values use { en, es }. Everything else is language-neutral.
// ============================================================================

export const LOCALES = ['en', 'es'];

/** Pick a language out of an { en, es } pair; pass plain strings through. */
export const L = (v, loc = 'en') =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v[loc] ?? v.en) : v;

export const site = {
  name: 'Mr. Chile Taproom',
  altName: 'Mr. Chile TAPROOM Beer & Culture',
  tagline: 'Beer & Culture',

  // --- NAP ------------------------------------------------------------------
  phone: '(707) 239-4188',
  phoneE164: '+17072394188',
  email: 'mr.chiletaproominfo@gmail.com', // a second address is on Facebook — pick one
  street: '4357 Montgomery Dr, Suite B',  // Suite B confirmed from the Sonidero flyer
  locality: 'Santa Rosa',
  region: 'CA',
  postal: '95405',
  country: 'US',
  lat: 38.4572662,
  lng: -122.6721164,
  crossStreet: 'Mission Blvd & Montgomery Dr',
  county: { en: 'Sonoma County', es: 'Condado de Sonoma' },
  priceRange: '$$',
  founded: '2025',

  // Create a free Formspree form and paste the endpoint here (2 minutes).
  formEndpoint: 'https://formspree.io/f/REPLACE_WITH_FORM_ID',
  origin: 'https://mrchiletaproom.com',

  profiles: [
    'https://www.instagram.com/mr.chiletaproom/',
    'https://www.facebook.com/confluencetaproom/',
    'https://www.yelp.com/biz/mr-chile-taproom-santa-rosa',
  ],

  entityClaim: {
    en: "Sonoma County's first Latino-owned taproom — craft beer, cumbia nights, sonidero, comedy and a creekside patio on Montgomery Drive in Santa Rosa.",
    es: 'El primer taproom latino del condado de Sonoma — cerveza artesanal, noches de cumbia, sonidero, comedia y un patio junto al arroyo en Montgomery Drive, Santa Rosa.',
  },

  // --- Hours ----------------------------------------------------------------
  // Five public sources disagree (AUDIT.md section 1). These are the
  // owner-published Instagram hours. Confirm, then push identical values
  // to Google, Yelp, Apple and Facebook on the same day.
  hours: [
    { day: { en: 'Monday', es: 'Lunes' },        schemaDay: 'Monday',    open: null,    close: null,    label: { en: 'Closed', es: 'Cerrado' } },
    { day: { en: 'Tuesday', es: 'Martes' },      schemaDay: 'Tuesday',   open: '16:00', close: '21:00', label: '4pm – 9pm' },
    { day: { en: 'Wednesday', es: 'Miércoles' }, schemaDay: 'Wednesday', open: '16:00', close: '21:00', label: '4pm – 9pm' },
    { day: { en: 'Thursday', es: 'Jueves' },     schemaDay: 'Thursday',  open: '16:00', close: '21:00', label: '4pm – 9pm' },
    { day: { en: 'Friday', es: 'Viernes' },      schemaDay: 'Friday',    open: '15:00', close: '23:00', label: '3pm – 11pm' },
    { day: { en: 'Saturday', es: 'Sábado' },     schemaDay: 'Saturday',  open: '15:00', close: '23:00', label: '3pm – 11pm' },
    { day: { en: 'Sunday', es: 'Domingo' },      schemaDay: 'Sunday',    open: '12:00', close: '21:00', label: '12pm – 9pm' },
  ],

  amenities: [
    {
      name: { en: 'Creekside patio', es: 'Patio junto al arroyo' },
      detail: {
        en: 'Outdoor seating under mature oaks backing onto Santa Rosa Creek, strung with lights and warmed by heat lamps after dark.',
        es: 'Asientos al aire libre bajo robles junto al arroyo de Santa Rosa, con luces colgantes y calentadores al anochecer.',
      },
    },
    {
      name: { en: 'Family-friendly early', es: 'Apto para familias temprano' },
      detail: {
        en: 'Families are welcome in the taproom and on the patio. Dance nights are 21 and over.',
        es: 'Las familias son bienvenidas en el taproom y en el patio. Las noches de baile son solo para mayores de 21.',
      },
    },
    {
      name: { en: 'Sports on the projector', es: 'Deportes en pantalla' },
      detail: {
        en: 'Games go up on the bar wall plus screens around the room — NFL, NBA, MLB and fútbol.',
        es: 'Los partidos se proyectan en la pared del bar y en pantallas por todo el salón — NFL, NBA, MLB y fútbol.',
      },
    },
    {
      name: { en: 'Free parking', es: 'Estacionamiento gratis' },
      detail: {
        en: 'Open surface lot on site. No permit, no validation, usually space even on event nights.',
        es: 'Estacionamiento abierto en el lugar. Sin permiso ni validación, casi siempre hay espacio.',
      },
    },
    {
      name: { en: 'Taco truck out back', es: 'Camión de tacos atrás' },
      detail: {
        en: 'Freaking Tacos parks on the patio. Al pastor is the order.',
        es: 'Freaking Tacos se estaciona en el patio. Pide los de al pastor.',
      },
    },
    {
      name: { en: 'Room for big groups', es: 'Espacio para grupos grandes' },
      detail: {
        en: 'Long communal tables inside, picnic tables and yard games outside.',
        es: 'Mesas comunales adentro, mesas de picnic y juegos afuera.',
      },
    },
  ],

  // --- Recurring programming -------------------------------------------------
  series: [
    {
      slug: 'cumbia-rosa',
      name: 'Cumbia Rosa',
      kicker: { en: 'First Saturday, monthly', es: 'Cada primer sábado del mes' },
      byDay: 'Saturday',
      byMonthWeek: 1,
      startTime: '20:15',
      endTime: '02:00',
      age: '21+',
      image: 'flyer-cumbia-rosa',
      partner: { name: 'Ritmo y Pasión Dance', url: 'https://www.ritmoypasiondance.com' },
      short: {
        en: 'Cumbia class at 8:15pm, then dancing until 2am. $15 advance, $20 at the door.',
        es: 'Clase de cumbia a las 8:15pm y baile hasta las 2am. $15 preventa, $20 en la puerta.',
      },
      long: {
        en: 'Cumbia Rosa runs on the first Saturday of every month, presented by Ritmo y Pasión Dance. A beginner cumbia class with Maria and Rogelio starts at 8:15pm — no partner and no experience needed — then DJ Edge takes over and the floor stays open until 2am. Drink specials run all night. Tickets are $15 in advance and $20 at the door. Entry is 21 and over.',
        es: 'Cumbia Rosa es cada primer sábado del mes, presentado por Ritmo y Pasión Dance. La clase de cumbia para principiantes con Maria y Rogelio empieza a las 8:15pm — sin pareja y sin experiencia — y después DJ Edge toma la cabina y la pista sigue abierta hasta las 2am. Hay especiales de bebidas toda la noche. Boletos $15 en preventa y $20 en la puerta. Solo mayores de 21.',
      },
      genre: 'Cumbia',
    },
    {
      slug: 'sonidero',
      name: { en: 'Sonidero Nights', es: 'Noches Sonideras' },
      kicker: { en: 'Select Saturdays', es: 'Sábados selectos' },
      byDay: 'Saturday',
      startTime: '21:00',
      endTime: '02:00',
      age: '21+',
      image: 'flyer-sonidero',
      short: {
        en: 'Sonidero sound systems, cumbia sonidera and saludos. Tickets at the door, 9pm.',
        es: 'Sonidos, cumbia sonidera y saludos. Boletos en taquilla, 9pm.',
      },
      long: {
        en: 'Full sonidero nights with visiting sound systems and live saludos, starting at 9pm. Tickets are sold at the door only. Street food vendors set up on the patio for these nights. Entry is 21 and over.',
        es: 'Noches sonideras completas con sonidos invitados y saludos en vivo, a partir de las 9pm. Los boletos se venden solo en taquilla. Hay vendedores de comida en el patio esas noches. Solo mayores de 21.',
      },
      genre: { en: 'Cumbia sonidera', es: 'Cumbia sonidera' },
    },
    {
      slug: 'live-music',
      name: { en: 'Live Music Weekends', es: 'Música en Vivo' },
      kicker: { en: 'Most Fridays & Saturdays', es: 'Casi todos los viernes y sábados' },
      byDay: 'Friday',
      startTime: '19:00',
      endTime: '22:00',
      age: { en: 'All ages until 8pm', es: 'Todas las edades hasta las 8pm' },
      short: {
        en: 'Local bands and DJs — cumbia, rock en español, soul and more.',
        es: 'Bandas y DJs locales — cumbia, rock en español, soul y más.',
      },
      long: {
        en: 'Live sets from Sonoma County and North Bay artists, weighted toward Latin music, cumbia and rock en español, with soul and blues in the mix.',
        es: 'Presentaciones en vivo de artistas del condado de Sonoma y el North Bay, con énfasis en música latina, cumbia y rock en español, además de soul y blues.',
      },
      genre: { en: 'Live Music', es: 'Música en vivo' },
    },
    {
      slug: 'drink-for-a-cause',
      name: { en: 'Drink For A Cause', es: 'Beber Por Una Causa' },
      kicker: { en: 'Quarterly benefit', es: 'Evento benéfico trimestral' },
      byDay: 'Friday',
      startTime: '18:00',
      endTime: '21:00',
      age: { en: 'All ages until 8pm', es: 'Todas las edades hasta las 8pm' },
      short: {
        en: '10% of the night goes to a Sonoma County nonprofit.',
        es: 'El 10% de la noche apoya a una organización local.',
      },
      long: {
        en: 'A recurring benefit night where 10% of proceeds go to a local nonprofit. Past partners include Latino Service Providers, which works on equity and wellbeing for Latinx youth and families in Sonoma County.',
        es: 'Una noche benéfica donde el 10% de las ventas apoya a una organización local. Entre los socios anteriores está Latino Service Providers, que trabaja por la equidad y el bienestar de jóvenes y familias latinas en el condado de Sonoma.',
      },
      genre: { en: 'Community', es: 'Comunidad' },
    },
  ],

  // --- Dated events ----------------------------------------------------------
  // These generate full Event JSON-LD with Offers, which is what makes a listing
  // eligible for Google event rich results and for "what's on in Santa Rosa this
  // weekend" answers. Add each new date as the flyer goes out; delete past ones.
  datedEvents: [
    {
      seriesSlug: 'sonidero',
      date: '2026-08-29',
      start: '21:00',
      end: '02:00',
      name: { en: 'Sonidero Night', es: 'Noche Sonidera' },
      lineup: 'Familia Linares · Beto Méndez', // confirm exact sonido names
      food: "Galindo's Street Hot Dogs",
      priceNote: { en: 'Tickets at the door', es: 'Boletos en taquilla' },
      image: 'flyer-sonidero',
    },
    {
      seriesSlug: 'cumbia-rosa',
      date: '2026-09-05',
      start: '20:15',
      end: '02:00',
      name: 'Cumbia Rosa',
      lineup: 'DJ Edge · Clase con Maria y Rogelio',
      price: '15',
      priceNote: { en: '$15 advance / $20 door', es: '$15 preventa / $20 en la puerta' },
      ticketUrl: 'https://www.ritmoypasiondance.com',
      image: 'flyer-cumbia-rosa',
    },
  ],

  privatePackages: [
    {
      slug: 'patio',
      name: { en: 'Patio Buyout', es: 'Patio Completo' },
      capacity: { en: 'Up to 80 guests', es: 'Hasta 80 personas' },
      best: {
        en: 'Birthdays, quinceañeras, graduations, baby showers',
        es: 'Cumpleaños, quinceañeras, graduaciones, baby showers',
      },
      includes: {
        en: ['Oak-shaded creekside patio', 'String lights and heat lamps', 'Picnic tables and yard games', 'Taco truck coordination'],
        es: ['Patio con robles junto al arroyo', 'Luces colgantes y calentadores', 'Mesas de picnic y juegos', 'Coordinación con el camión de tacos'],
      },
    },
    {
      slug: 'back-room',
      name: { en: 'Back Room', es: 'Salón Trasero' },
      capacity: { en: '25–45 guests', es: '25–45 personas' },
      best: {
        en: 'Company parties, team offsites, rehearsal dinners, memorials',
        es: 'Fiestas de empresa, reuniones de equipo, cenas de ensayo, memoriales',
      },
      includes: {
        en: ['Semi-private seating', 'Projector for slideshows', 'Dedicated bartender', 'Reserved tab or drink tickets'],
        es: ['Área semiprivada', 'Proyector para presentaciones', 'Bartender dedicado', 'Cuenta reservada o boletos de bebida'],
      },
    },
    {
      slug: 'full-venue',
      name: { en: 'Full Venue Buyout', es: 'Lugar Completo' },
      capacity: { en: 'Up to 150 guests', es: 'Hasta 150 personas' },
      best: {
        en: 'Weddings, fundraisers, album releases, after-parties',
        es: 'Bodas, eventos benéficos, lanzamientos, after-parties',
      },
      includes: {
        en: ['Indoor taproom plus the whole patio', 'Stage, PA and projector', 'Full bar and kitchen', 'Event staff on site'],
        es: ['Taproom interior y todo el patio', 'Escenario, sonido y proyector', 'Bar y cocina completos', 'Personal de eventos'],
      },
    },
  ],

  // No prices are published anywhere public, so none are invented here.
  menu: [
    {
      section: { en: 'On Tap', es: 'De Barril' },
      note: {
        en: 'The tap list rotates constantly. Call ahead if you are chasing something specific.',
        es: 'La lista de barriles cambia seguido. Llama antes si buscas algo en particular.',
      },
      items: [
        { name: { en: 'Local craft beer', es: 'Cerveza artesanal local' }, desc: { en: 'A rotating lineup weighted toward Sonoma County and North Bay breweries — IPAs, lagers, stouts and sours.', es: 'Selección rotativa de cervecerías del condado de Sonoma y el North Bay — IPAs, lagers, stouts y sours.' } },
        { name: { en: 'Cider', es: 'Sidra' }, desc: { en: 'Dry and semi-dry ciders from California producers.', es: 'Sidras secas y semisecas de productores de California.' } },
        { name: { en: 'Wine', es: 'Vino' }, desc: { en: 'Sonoma County reds and whites by the glass.', es: 'Tintos y blancos del condado de Sonoma por copa.' } },
        { name: { en: 'Micheladas', es: 'Micheladas' }, desc: { en: 'Build one on any beer on the list.', es: 'Con cualquier cerveza de la lista.' } },
      ],
    },
    {
      section: { en: 'Kitchen', es: 'Cocina' },
      note: {
        en: 'Bar food built to go with beer. Vegetarian options available.',
        es: 'Comida de bar para acompañar la cerveza. Hay opciones vegetarianas.',
      },
      items: [
        { name: 'Ed Hops Wings', desc: { en: 'Baked, not fried — the item regulars come back for.', es: 'Horneadas, no fritas — el platillo por el que la gente regresa.' } },
        { name: 'Louie The Mac', desc: { en: 'Baked mac and cheese.', es: 'Macarrones con queso al horno.' } },
        { name: 'Yo Adrin', desc: { en: 'Cheese garlic bread.', es: 'Pan de ajo con queso.' } },
        { name: { en: 'Chips & Salsa', es: 'Totopos y Salsa' }, desc: { en: 'House salsa.', es: 'Salsa de la casa.' } },
        { name: { en: 'Sandwiches', es: 'Sándwiches' }, desc: { en: 'Rotating sandwich board.', es: 'Menú de sándwiches rotativo.' } },
      ],
    },
    {
      section: { en: 'Non-Alcoholic', es: 'Sin Alcohol' },
      note: {
        en: 'A full non-alcoholic list — this is a family room before the music starts.',
        es: 'Lista completa sin alcohol — es un lugar familiar antes de que empiece la música.',
      },
      items: [
        { name: 'Mexican Coke', desc: { en: 'Cane sugar, glass bottle.', es: 'Azúcar de caña, botella de vidrio.' } },
        { name: "Martinelli's", desc: { en: 'Apple juice from just down the road.', es: 'Jugo de manzana de aquí cerca.' } },
        { name: { en: 'Sodas & sparkling water', es: 'Refrescos y agua mineral' }, desc: { en: 'Standard non-alcoholic lineup.', es: 'Opciones sin alcohol de siempre.' } },
      ],
    },
    {
      section: 'Freaking Tacos',
      note: {
        en: 'An independent taco truck parked on the patio. Its hours can differ from the taproom.',
        es: 'Un camión de tacos independiente en el patio. Su horario puede variar del taproom.',
      },
      items: [
        { name: 'Tacos al pastor', desc: { en: 'The order to place. Named again and again in reviews.', es: 'Lo que hay que pedir. Mencionados una y otra vez en las reseñas.' } },
        { name: { en: 'Full taqueria menu', es: 'Menú completo de taquería' }, desc: { en: 'Ordered at the truck, eaten on the patio.', es: 'Se pide en el camión y se come en el patio.' } },
      ],
    },
  ],
};

// --- FAQ ---------------------------------------------------------------------
// Answer-first in both languages: each answer opens with a complete, standalone
// sentence an AI engine can lift and cite without surrounding context.
export const faqs = [
  {
    q: { en: 'What is Mr. Chile Taproom?', es: '¿Qué es Mr. Chile Taproom?' },
    a: {
      en: "Mr. Chile Taproom is a Latino-owned craft beer taproom and live event venue at 4357 Montgomery Dr, Suite B, in Santa Rosa, California, billed as Sonoma County's first Latino taproom. It pours rotating local beer, cider and wine, serves bar food including baked wings and mac and cheese, and hosts cumbia dance nights, sonidero, comedy, live music and community fundraisers. There is an oak-shaded patio backing onto Santa Rosa Creek and free parking on site.",
      es: 'Mr. Chile Taproom es un taproom de cerveza artesanal y salón de eventos de propiedad latina en 4357 Montgomery Dr, Suite B, Santa Rosa, California, conocido como el primer taproom latino del condado de Sonoma. Sirve cerveza, sidra y vino local, comida de bar como alitas horneadas y macarrones con queso, y organiza noches de cumbia, sonidero, comedia, música en vivo y eventos benéficos. Tiene un patio con robles junto al arroyo de Santa Rosa y estacionamiento gratis.',
    },
  },
  {
    q: { en: 'What are the hours?', es: '¿Cuál es el horario?' },
    a: {
      en: 'Mr. Chile Taproom is closed Mondays, open 4pm to 9pm Tuesday through Thursday, 3pm to 11pm Friday and Saturday, and 12pm to 9pm on Sunday. Event nights run later — Cumbia Rosa goes until 2am. Call (707) 239-4188 to confirm on a holiday.',
      es: 'Mr. Chile Taproom cierra los lunes, abre de 4pm a 9pm de martes a jueves, de 3pm a 11pm viernes y sábado, y de 12pm a 9pm el domingo. Las noches de evento terminan más tarde — Cumbia Rosa va hasta las 2am. Llama al (707) 239-4188 para confirmar en días festivos.',
    },
  },
  {
    q: { en: 'Where is it?', es: '¿Dónde está?' },
    a: {
      en: 'Mr. Chile Taproom is at 4357 Montgomery Dr, Suite B, Santa Rosa, CA 95405, on Montgomery Drive near Mission Boulevard in east Santa Rosa. It sits in a center with a free open parking lot, and the patio backs onto Santa Rosa Creek. It is about ten minutes from downtown Santa Rosa and roughly an hour and fifteen minutes from San Francisco.',
      es: 'Mr. Chile Taproom está en 4357 Montgomery Dr, Suite B, Santa Rosa, CA 95405, sobre Montgomery Drive cerca de Mission Boulevard en el este de Santa Rosa. Está en un centro con estacionamiento gratis, y el patio da al arroyo de Santa Rosa. Queda a unos diez minutos del centro de Santa Rosa y a una hora y cuarto de San Francisco.',
    },
  },
  {
    q: { en: 'What is Cumbia Rosa?', es: '¿Qué es Cumbia Rosa?' },
    a: {
      en: 'Cumbia Rosa is a monthly cumbia dance night at Mr. Chile Taproom on the first Saturday of every month, presented by Ritmo y Pasión Dance. A beginner class with Maria and Rogelio starts at 8:15pm, then DJ Edge plays and the floor stays open until 2am. Tickets are $15 in advance and $20 at the door, and entry is 21 and over.',
      es: 'Cumbia Rosa es una noche mensual de cumbia en Mr. Chile Taproom cada primer sábado del mes, presentada por Ritmo y Pasión Dance. La clase para principiantes con Maria y Rogelio empieza a las 8:15pm, después toca DJ Edge y la pista sigue abierta hasta las 2am. Boletos $15 en preventa y $20 en la puerta. Solo mayores de 21.',
    },
  },
  {
    q: { en: 'Is it kid-friendly?', es: '¿Pueden ir niños?' },
    a: {
      en: 'Yes. Mr. Chile Taproom welcomes families in the taproom and on the creekside patio, where there is room for kids and yard games. Dance nights such as Cumbia Rosa and sonidero nights are 21 and over, so check the event listing before bringing children on a weekend night.',
      es: 'Sí. Mr. Chile Taproom recibe a familias en el taproom y en el patio, donde hay espacio para niños y juegos. Las noches de baile como Cumbia Rosa y las sonideras son solo para mayores de 21, así que revisa el evento antes de llevar niños un fin de semana.',
    },
  },
  {
    q: { en: 'Can you book it for a private event?', es: '¿Se puede rentar para eventos privados?' },
    a: {
      en: 'Yes. Mr. Chile Taproom books private events for up to 150 guests, including birthdays, quinceañeras, company parties, rehearsal dinners, nonprofit fundraisers and full-venue buyouts. Options are a patio buyout for up to 80 guests, a semi-private back room for 25 to 45, and a full venue buyout with stage, PA and projector. Enquire at (707) 239-4188 or through the booking form on this site.',
      es: 'Sí. Mr. Chile Taproom renta para eventos privados de hasta 150 personas, incluyendo cumpleaños, quinceañeras, fiestas de empresa, cenas de ensayo, eventos benéficos y renta del lugar completo. Las opciones son el patio hasta 80 personas, el salón trasero semiprivado de 25 a 45, y el lugar completo con escenario, sonido y proyector. Llama al (707) 239-4188 o usa el formulario de este sitio.',
    },
  },
  {
    q: { en: 'Is there food?', es: '¿Hay comida?' },
    a: {
      en: 'Yes. Mr. Chile Taproom has a kitchen serving baked Ed Hops Wings, Louie The Mac mac and cheese, cheese garlic bread, chips and salsa and rotating sandwiches, with vegetarian options. An independent taco truck, Freaking Tacos, parks on the patio and is known for its al pastor. Street food vendors also set up for some event nights.',
      es: 'Sí. Mr. Chile Taproom tiene cocina con alitas Ed Hops horneadas, macarrones con queso Louie The Mac, pan de ajo con queso, totopos con salsa y sándwiches, además de opciones vegetarianas. Un camión independiente, Freaking Tacos, se estaciona en el patio y es conocido por sus tacos al pastor. En algunas noches de evento también hay vendedores de comida.',
    },
  },
  {
    q: { en: 'Is there parking?', es: '¿Hay estacionamiento?' },
    a: {
      en: 'Yes. Mr. Chile Taproom has free open surface parking in the shared lot at 4357 Montgomery Dr. No permit or validation is needed and there is usually space even on event nights.',
      es: 'Sí. Mr. Chile Taproom tiene estacionamiento gratis en el lote compartido de 4357 Montgomery Dr. No se necesita permiso ni validación y casi siempre hay lugar, incluso en noches de evento.',
    },
  },
  {
    q: { en: 'Do they show sports?', es: '¿Pasan los partidos?' },
    a: {
      en: 'Yes. Mr. Chile Taproom projects games on the bar wall and has additional screens throughout the taproom, covering NFL, NBA, MLB and fútbol.',
      es: 'Sí. Mr. Chile Taproom proyecta los partidos en la pared del bar y tiene pantallas por todo el salón — NFL, NBA, MLB y fútbol.',
    },
  },
  {
    q: { en: 'Is Spanish spoken?', es: '¿Se habla español?' },
    a: {
      en: 'Yes. Mr. Chile Taproom is Latino-owned and staff speak both Spanish and English. Events are promoted in both languages and private events can be planned in Spanish.',
      es: 'Sí. Mr. Chile Taproom es de propiedad latina y el personal habla español e inglés. Los eventos se promocionan en ambos idiomas y los eventos privados se pueden planear en español.',
    },
  },
];

export const fullAddress = `${site.street}, ${site.locality}, ${site.region} ${site.postal}`;

export const hoursSummary = {
  en: 'Closed Mon · Tue–Thu 4–9pm · Fri–Sat 3–11pm · Sun 12–9pm',
  es: 'Lun cerrado · Mar–Jue 4–9pm · Vie–Sáb 3–11pm · Dom 12–9pm',
};
