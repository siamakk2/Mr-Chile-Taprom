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
  // The apex 301s to www, so www is the real host. Canonicals, hreflang,
  // og:url, every JSON-LD @id and the sitemap are all built from this — a
  // canonical pointing at a URL that redirects is a signal Google discounts.
  origin: 'https://www.mrchiletaproom.com',

  // Google Search Console, URL-prefix property. Rendered into every page head.
  // Set to null once the property is verified by DNS instead, or leave it —
  // Google re-checks periodically and removing it can un-verify the property.
  googleSiteVerification: 'ss7t2cU0e-wcAZS7GURrnYLvUm4QFVErcGdN8g43Ru4',

  // Google Analytics 4 measurement ID. Set to null to remove analytics entirely.
  ga4Id: 'G-3ZJMXL1WDK',

  // Shown at the foot of the privacy page. Bump it whenever that page changes.
  privacyUpdated: '2026-08-28',

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
    { day: { en: 'Tuesday', es: 'Martes' },      schemaDay: 'Tuesday',   open: '15:00', close: '21:00', label: '3pm – 9pm' },
    { day: { en: 'Wednesday', es: 'Miércoles' }, schemaDay: 'Wednesday', open: '15:00', close: '21:00', label: '3pm – 9pm' },
    { day: { en: 'Thursday', es: 'Jueves' },     schemaDay: 'Thursday',  open: '15:00', close: '21:00', label: '3pm – 9pm' },
    { day: { en: 'Friday', es: 'Viernes' },      schemaDay: 'Friday',    open: '15:00', close: '22:00', label: '3pm – 10pm' },
    { day: { en: 'Saturday', es: 'Sábado' },     schemaDay: 'Saturday',  open: '09:00', close: '22:00', label: '9am – 10pm' },
    { day: { en: 'Sunday', es: 'Domingo' },      schemaDay: 'Sunday',    open: '09:00', close: '17:00', label: '9am – 5pm' },
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
        en: 'Freaking Tacos is the kitchen here, serving their full menu — tacos, burritos, tortas and plates.',
        es: 'Freaking Tacos es la cocina aquí, con su menú completo — tacos, burritos, tortas y platillos.',
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
      pageKey: 'cumbia',
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
      capacity: { en: 'Indoors and patio together', es: 'Interior y patio juntos' },
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

  // --- Pricing ---------------------------------------------------------------
  // Prices below came from third-party aggregators, not from the taproom. They
  // are plausible but unverified, and one of them ("$10.91") is clearly a
  // tax-inclusive or POS-export artifact rather than a menu price. Publishing a
  // wrong price on the canonical source is worse than publishing none, so they
  // stay hidden until someone reads them off the actual board.
  //
  // Flip this to true once confirmed and every price appears on the page AND in
  // the Menu/Offer structured data automatically.
  // Food prices come from the Freaking Tacos published menu. Set false to hide
  // every price at once if they drift, rather than deleting them one by one.
  pricesConfirmed: true,

  // Hoppy Hour is the highest-value thing in this data set: "happy hour near me"
  // is a high-intent search and no listing anywhere mentions theirs.
  happyHour: {
    name: { en: 'Hoppy Hour', es: 'Hoppy Hour' },
    days: { en: 'Tuesday to Friday', es: 'Martes a viernes' },
    schemaDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '16:00',
    closes: '18:00',
    window: '4pm – 6pm',
    deals: {
      en: ['Bottled beer $4.99', 'Draft beer $5.99', 'Cocktails $6.99',
           'Buy two or more drinks and get 15% off your Freaking Tacos order'],
      es: ['Cerveza en botella $4.99', 'Cerveza de barril $5.99', 'Cócteles $6.99',
           'Con dos bebidas o más, 15% de descuento en tu orden de Freaking Tacos'],
    },
  },

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
        { name: { en: 'Wine', es: 'Vino' }, desc: { en: 'Reds and whites by the glass.', es: 'Tintos y blancos por copa.' } },
      ],
    },
    {
      section: { en: 'Cocktails', es: 'Cócteles' },
      note: {
        en: 'House cocktails alongside the taps — the michelada list is the reason to come.',
        es: 'Cócteles de la casa junto a los barriles — la lista de micheladas vale la pena.',
      },
      items: [
        { name: { en: 'House Michelada', es: 'Michelada de la casa' }, price: '10.00', desc: { en: 'Built in house on any beer from the list.', es: 'Preparada en casa con cualquier cerveza de la lista.' } },
        { name: 'Licuachela', price: '17.99', desc: { en: 'The big one — a loaded michelada built to share, or not.', es: 'La grande — michelada cargada para compartir, o no.' } },
        { name: { en: 'Margarita', es: 'Margarita' }, desc: { en: 'Traditional, strawberry or passion fruit.', es: 'Tradicional, fresa o maracuyá.' } },
        { name: { en: 'Espresso Martini', es: 'Espresso Martini' }, price: '12.99', desc: { en: 'On the regular cocktail list.', es: 'En la lista regular de cócteles.' } },
        { name: { en: 'Old Fashioned', es: 'Old Fashioned' }, price: '12.99', desc: { en: 'Made to order.', es: 'Preparado al momento.' } },
        { name: { en: 'Spiked Lemonade', es: 'Limonada preparada' }, price: '12.49', desc: { en: 'Easy drinking, good on the patio.', es: 'Ligera y fresca, ideal para el patio.' } },
      ],
    },
    {
      section: { en: 'Food — Freaking Tacos', es: 'Comida — Freaking Tacos' },
      note: {
        en: 'The kitchen is Freaking Tacos and the full menu is served here. Every plate comes with a choice of meat. Prices are theirs and can change.',
        es: 'La cocina es Freaking Tacos y aquí se sirve el menú completo. Cada platillo lleva carne a elegir. Los precios son de ellos y pueden cambiar.',
      },
      items: [
        { name: 'Taco', price: '3.50', desc: { en: 'Corn tortilla, choice of meat, cilantro, onions and red salsa.', es: 'Tortilla de maíz, carne a elegir, cilantro, cebolla y salsa roja.' } },
        { name: 'Sopes', price: '5.75', desc: { en: 'Homemade thick crispy tortilla, refried beans, lettuce, sour cream and cotija cheese.', es: 'Tortilla gruesa y crujiente hecha a mano, frijoles refritos, lechuga, crema y queso cotija.' } },
        { name: 'Torpedo Burrito', price: '14.50', desc: { en: 'Flour tortilla, choice of meat, rice, whole pinto beans, mozzarella, sour cream and green salsa. Their best seller.', es: 'Tortilla de harina, carne a elegir, arroz, frijoles enteros, mozzarella, crema y salsa verde. Su más vendido.' } },
        { name: { en: 'Bean & Cheese Burrito', es: 'Burrito de frijol y queso' }, price: '9.50', desc: { en: 'Refried pinto beans and cheese only.', es: 'Sólo frijoles refritos y queso.' } },
        { name: { en: 'Mini Burrito', es: 'Mini burrito' }, price: '8.99', desc: { en: 'Rice, whole beans, cheese and a choice of meat.', es: 'Arroz, frijoles enteros, queso y carne a elegir.' } },
        { name: { en: 'Quesadilla', es: 'Quesadilla' }, price: '14.50', desc: { en: 'Flour tortilla, melted mozzarella, green salsa and sour cream.', es: 'Tortilla de harina, mozzarella derretido, salsa verde y crema.' } },
        { name: { en: 'Cheese Only Quesadilla', es: 'Quesadilla sólo de queso' }, price: '8.99', desc: { en: 'Cheese only.', es: 'Sólo queso.' } },
        { name: { en: 'Mini Quesadilla', es: 'Mini quesadilla' }, price: '8.50', desc: { en: 'Choice of meat and cheese only.', es: 'Carne a elegir y queso.' } },
        { name: { en: 'Torta', es: 'Torta' }, price: '16.99', desc: { en: 'Fresh Mexican white bread, choice of meat, mayonnaise, refried beans, lettuce, tomato, onion, melted cheese and avocado.', es: 'Pan blanco mexicano fresco, carne a elegir, mayonesa, frijoles refritos, lechuga, jitomate, cebolla, queso derretido y aguacate.' } },
        { name: 'Wet-Rito', price: '16.99', desc: { en: 'Flour tortilla, rice, refried beans, mozzarella and sour cream, topped with green enchilada sauce.', es: 'Tortilla de harina, arroz, frijoles refritos, mozzarella y crema, bañado en salsa verde de enchilada.' } },
        { name: 'Mexi-Salad', price: '14.50', desc: { en: 'Choice of meat, lettuce, pico de gallo, rice, whole pinto beans, green salsa and cotija.', es: 'Carne a elegir, lechuga, pico de gallo, arroz, frijoles enteros, salsa verde y cotija.' } },
        { name: { en: 'Fajitas Plate', es: 'Plato de fajitas' }, price: '18.99', desc: { en: 'Choice of protein with rice, beans, four corn tortillas, mozzarella and peppers.', es: 'Proteína a elegir con arroz, frijoles, cuatro tortillas de maíz, mozzarella y pimientos.' } },
        { name: { en: 'Nachos', es: 'Nachos' }, price: '18.99', desc: { en: 'Choice of meat, mozzarella, refried beans, pico de gallo and guacamole.', es: 'Carne a elegir, mozzarella, frijoles refritos, pico de gallo y guacamole.' } },
        { name: 'Esquites', price: '5.99', desc: { en: 'Corn, mayonnaise, Valentina, Tajín, lime and cheese.', es: 'Elote, mayonesa, Valentina, Tajín, limón y queso.' } },
      ],
    },
    {
      section: { en: 'Combos', es: 'Combos' },
      note: {
        en: 'Each combo includes rice, refried beans, chips and a fountain drink.',
        es: 'Cada combo incluye arroz, frijoles refritos, totopos y un refresco.',
      },
      items: [
        { name: { en: 'Combo #1 — Two Tacos', es: 'Combo #1 — Dos tacos' }, price: '16.50', desc: { en: 'Two tacos with choice of meat, red salsa, onions and cilantro.', es: 'Dos tacos con carne a elegir, salsa roja, cebolla y cilantro.' } },
        { name: { en: 'Combo #2 — One Sope', es: 'Combo #2 — Un sope' }, price: '16.25', desc: { en: 'One sope, thick homemade crispy tortilla topped with refried beans.', es: 'Un sope, tortilla gruesa y crujiente hecha a mano con frijoles refritos.' } },
        { name: { en: 'Combo #3 — One Quesadilla', es: 'Combo #3 — Una quesadilla' }, price: '19.99', desc: { en: 'Quesadilla with choice of meat, mozzarella, green salsa and sour cream.', es: 'Quesadilla con carne a elegir, mozzarella, salsa verde y crema.' } },
      ],
    },
    {
      section: { en: 'Sides', es: 'Guarniciones' },
      note: {
        en: 'Add to anything, or graze on the patio.',
        es: 'Para acompañar cualquier cosa, o para picar en el patio.',
      },
      items: [
        { name: { en: 'Chips & Salsa', es: 'Totopos y salsa' }, price: '0.99', desc: { en: 'Crispy tortilla chips with a zesty tomato salsa.', es: 'Totopos crujientes con salsa de jitomate.' } },
        { name: { en: 'Guacamole & Chips', es: 'Guacamole y totopos' }, price: '6.99', desc: { en: 'Mashed avocado with lime, cilantro and onion, served with chips.', es: 'Aguacate machacado con limón, cilantro y cebolla, con totopos.' } },
        { name: 'Guac Poppers', price: '7.99', desc: { en: 'Fresh guacamole with their special chips.', es: 'Guacamole fresco con sus totopos especiales.' } },
        { name: { en: 'Side of Guacamole', es: 'Guacamole' }, price: '4.95', desc: { en: 'Creamy avocado dip, good for sharing.', es: 'Dip cremoso de aguacate, bueno para compartir.' } },
        { name: { en: 'Side of Avocado', es: 'Aguacate' }, price: '4.75', desc: { en: 'Freshly diced avocado.', es: 'Aguacate fresco picado.' } },
        { name: { en: 'Rice & Beans', es: 'Arroz y frijoles' }, price: '7.25', desc: { en: 'Hispanic rice and refried pinto beans.', es: 'Arroz y frijoles pintos refritos.' } },
        { name: { en: 'Side of Rice', es: 'Arroz' }, price: '4.25', desc: { en: 'Hispanic rice.', es: 'Arroz.' } },
        { name: { en: 'Side of Refried Beans', es: 'Frijoles refritos' }, price: '4.25', desc: { en: 'Creamy mashed beans, lightly seasoned.', es: 'Frijoles machacados y cremosos, ligeramente sazonados.' } },
        { name: { en: 'Pico de Gallo', es: 'Pico de gallo' }, price: '3.50', desc: { en: 'Fresh salsa.', es: 'Salsa fresca.' } },
        { name: { en: 'Grilled Onions & Jalapeños', es: 'Cebollas y jalapeños asados' }, price: '3.50', desc: { en: 'Grilled and seasoned.', es: 'Asados y sazonados.' } },
        { name: { en: 'Side of Crema', es: 'Crema' }, price: '0.75', desc: { en: 'Mexican crema, small or large.', es: 'Crema mexicana, chica o grande.' } },
        { name: { en: 'Side of Salsa', es: 'Salsa' }, price: '0.50', desc: { en: 'Red, green or spicy Diablo. 2oz, 12oz or 16oz.', es: 'Roja, verde o Diablo picante. 2oz, 12oz o 16oz.' } },
      ],
    },
    {
      section: { en: 'Non-Alcoholic', es: 'Sin Alcohol' },
      note: {
        en: 'A full non-alcoholic list — this is a family room before the music starts.',
        es: 'Lista completa sin alcohol — es un lugar familiar antes de que empiece la música.',
      },
      items: [
        { name: { en: 'Non-alcoholic Corona', es: 'Corona sin alcohol' }, desc: { en: 'A cold one without the alcohol, same as everyone else is drinking.', es: 'Una fría sin alcohol, igual que la de todos.' } },
        { name: { en: 'Lagunitas non-alcoholic IPA', es: 'IPA sin alcohol de Lagunitas' }, desc: { en: 'Hoppy and alcohol-free, brewed down the road in Petaluma.', es: 'Con lúpulo y sin alcohol, de Petaluma, aquí cerca.' } },
        { name: 'Mexican Coke', desc: { en: 'Cane sugar, glass bottle.', es: 'Azúcar de caña, botella de vidrio.' } },
        { name: { en: 'Fountain drinks', es: 'Refrescos de máquina' }, price: '3.25', desc: { en: 'Pepsi, Pepsi Zero, Starry, lemonade, Tropicana and more.', es: 'Pepsi, Pepsi Zero, Starry, limonada, Tropicana y más.' } },
        { name: 'Horchata', price: '4.99', desc: { en: 'Sweet rice milk with cinnamon and vanilla.', es: 'Agua de arroz con canela y vainilla.' } },
        { name: { en: 'Jamaica agua fresca', es: 'Agua de jamaica' }, price: '4.50', desc: { en: 'Steeped hibiscus flowers, tart and cold.', es: 'Flor de jamaica, ácida y bien fría.' } },
        { name: 'Jarritos', price: '4.00', desc: { en: 'Mandarin, tamarind, pineapple, sidral mundet or sangria.', es: 'Mandarina, tamarindo, piña, sidral mundet o sangría.' } },
        { name: { en: 'Bottled & sparkling water', es: 'Agua embotellada y mineral' }, price: '1.99', desc: { en: 'Still, or sparkling with lime, lemon, berry or orange.', es: 'Natural, o mineral con limón, lima, frutos rojos o naranja.' } },
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
      en: 'Yes. Mr. Chile Taproom books private events, including birthdays, quinceañeras, company parties, rehearsal dinners, nonprofit fundraisers and full-venue buyouts. Options are a patio buyout for up to 80 guests, a semi-private back room for 25 to 45, and a full venue buyout with stage, PA and projector. Inquire at (707) 239-4188 or through the booking form on this site.',
      es: 'Sí. Mr. Chile Taproom renta para eventos privados, incluyendo cumpleaños, quinceañeras, fiestas de empresa, cenas de ensayo, eventos benéficos y renta del lugar completo. Las opciones son el patio hasta 80 personas, el salón trasero semiprivado de 25 a 45, y el lugar completo con escenario, sonido y proyector. Llama al (707) 239-4188 o usa el formulario de este sitio.',
    },
  },
  {
    q: { en: 'Is there a happy hour?', es: '¿Tienen happy hour?' },
    a: {
      en: 'Yes. Mr. Chile Taproom runs Hoppy Hour Tuesday through Friday from 4pm to 6pm, with discounted bottled beer, draft beer and cocktails. Buy two or more drinks during Hoppy Hour and you also get 15 percent off a food order from the Freaking Tacos truck on the patio.',
      es: 'Sí. Mr. Chile Taproom tiene Hoppy Hour de martes a viernes de 4pm a 6pm, con descuentos en cerveza de botella, cerveza de barril y cócteles. Con dos bebidas o más durante el Hoppy Hour también recibes 15 por ciento de descuento en tu orden del camión Freaking Tacos.',
    },
  },
  {
    q: { en: 'Is there food?', es: '¿Hay comida?' },
    a: {
      en: 'Yes. The kitchen at Mr. Chile Taproom is Freaking Tacos, and the full Freaking Tacos menu is served here — tacos, Torpedo Burritos, Wet-Ritos, tortas, quesadillas, Mexi-Salads, sopes, esquites, nachos and fajita plates, with sides and horchata. Street food vendors also set up for some event nights.',
      es: 'Sí. La cocina de Mr. Chile Taproom es Freaking Tacos, y aquí se sirve su menú completo — tacos, Torpedo Burritos, Wet-Ritos, tortas, quesadillas, Mexi-Salads, sopes, esquites, nachos y platillos de fajitas, con guarniciones y horchata. En algunas noches de evento también hay vendedores de comida.',
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

/**
 * One-line hours, derived from site.hours rather than typed.
 *
 * This was a hardcoded string and it silently disagreed with the table above
 * the moment the hours changed. Runs of identical days are collapsed, so
 * Tue/Wed/Thu at the same times reads "Tue-Thu".
 */
const summarise = (loc) => {
  const abbr = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  }[loc];
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const idx = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  const days = order.map((d) => site.hours.find((h) => h.schemaDay === d));

  const runs = [];
  for (const h of days) {
    const label = typeof h.label === 'string' ? h.label : h.label[loc];
    const prev = runs[runs.length - 1];
    if (prev && prev.label === label) prev.end = h;
    else runs.push({ start: h, end: h, label });
  }

  return runs.map(({ start, end, label }) => {
    const a = abbr[idx[start.schemaDay]];
    const b = abbr[idx[end.schemaDay]];
    const span = a === b ? a : `${a}–${b}`;
    if (!start.open) return loc === 'es' ? `${span} cerrado` : `${span} closed`;
    return `${span} ${label.replace(/\s*–\s*/, '–')}`;
  }).join(' · ');
};

export const hoursSummary = { en: summarise('en'), es: summarise('es') };
