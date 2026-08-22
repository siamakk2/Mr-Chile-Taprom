// ============================================================================
// MR. CHILE TAPROOM — SINGLE SOURCE OF TRUTH
// Every page, every schema block, llms.txt and sitemap.xml read from this file.
// Change a fact here once and it propagates everywhere. This is the fix for the
// NAP-inconsistency problem documented in AUDIT.md.
// ============================================================================

export const site = {
  // --- Identity -------------------------------------------------------------
  legalName: 'Mr. Chile Taproom',
  name: 'Mr. Chile Taproom',
  altName: 'Mr. Chile TAPROOM Beer & Culture',
  tagline: 'Beer & Culture',
  // The entity claim. This is the single most important sentence on the site
  // for generative engines: it is specific, checkable, and unique.
  entityClaim:
    "Sonoma County's first Latino-owned taproom — craft beer, cumbia nights, comedy and a creekside patio on Montgomery Drive in Santa Rosa.",

  // --- CANONICAL NAP --------------------------------------------------------
  // ⚠ CONFIRM WITH OWNER BEFORE PRODUCTION DEPLOY (see AUDIT.md §1)
  phone: '(707) 239-4188',
  phoneE164: '+17072394188',
  email: 'mr.chiletaproominfo@gmail.com', // ⚠ two addresses in the wild — pick one
  street: '4357 Montgomery Dr',
  locality: 'Santa Rosa',
  region: 'CA',
  regionName: 'California',
  postal: '95405',
  country: 'US',
  lat: 38.4572662,
  lng: -122.6721164,
  neighborhood: 'Montgomery Drive at Mission Boulevard',
  crossStreet: 'Mission Blvd & Montgomery Dr',
  county: 'Sonoma County',
  priceRange: '$$',
  currency: 'USD',
  founded: '2025',

  // ⚠ Create a free Formspree form and paste the endpoint here (2 min setup).
  formEndpoint: 'https://formspree.io/f/REPLACE_WITH_FORM_ID',

  // --- Domain ---------------------------------------------------------------
  // Set to the real domain the day it is bought, then rebuild.
  origin: 'https://mrchiletaproom.com',

  // --- Profiles (sameAs — feeds entity disambiguation) ----------------------
  profiles: [
    'https://www.instagram.com/mr.chiletaproom/',
    'https://www.facebook.com/confluencetaproom/',
    'https://www.yelp.com/biz/mr-chile-taproom-santa-rosa',
    'https://maps.app.goo.gl/', // ⚠ replace with the real Google Maps short link
  ],

  // --- Hours ----------------------------------------------------------------
  // ⚠ FIVE public sources currently disagree (see AUDIT.md §1). These are the
  // owner-published Instagram-bio hours. Confirm, then treat this as canonical
  // and push identical values to Google, Yelp, Apple and Facebook.
  hours: [
    { day: 'Monday',    schemaDay: 'Monday',    open: null,    close: null,    label: 'Closed' },
    { day: 'Tuesday',   schemaDay: 'Tuesday',   open: '16:00', close: '21:00', label: '4pm – 9pm' },
    { day: 'Wednesday', schemaDay: 'Wednesday', open: '16:00', close: '21:00', label: '4pm – 9pm' },
    { day: 'Thursday',  schemaDay: 'Thursday',  open: '16:00', close: '21:00', label: '4pm – 9pm' },
    { day: 'Friday',    schemaDay: 'Friday',    open: '15:00', close: '23:00', label: '3pm – 11pm' },
    { day: 'Saturday',  schemaDay: 'Saturday',  open: '15:00', close: '23:00', label: '3pm – 11pm' },
    { day: 'Sunday',    schemaDay: 'Sunday',    open: '12:00', close: '21:00', label: '12pm – 9pm' },
  ],

  // --- Amenities (each one is an answer to a real long-tail AI query) -------
  amenities: [
    { name: 'Creekside patio', detail: 'Tree-shaded outdoor seating backing onto Santa Rosa Creek, under mature oaks.' },
    { name: 'Kid-friendly until 8pm', detail: 'Families are welcome in the taproom and on the patio. Dance nights are 21+.' },
    { name: 'Sports on the projector', detail: 'Games projected on the bar wall plus multiple screens.' },
    { name: 'Free parking', detail: 'Open surface lot shared with the Montgomery Drive center.' },
    { name: 'Patio games', detail: 'Yard games in the outdoor area.' },
    { name: 'Taco truck on site', detail: 'Freaking Tacos parks in the back — al pastor is the order.' },
    { name: 'Dog-friendly patio', detail: 'Leashed dogs welcome outside.' }, // ⚠ confirm
    { name: 'Live music & DJs', detail: 'Cumbia, Latin and local acts, most weekends.' },
  ],

  // --- Recurring programming ------------------------------------------------
  // Modelled as EventSeries with an eventSchedule so we never publish a fake
  // date. Add specific dated events to `datedEvents` below.
  series: [
    {
      slug: 'cumbia-rosa',
      name: 'Cumbia Rosa',
      kicker: 'First Saturday, monthly',
      byDay: 'Saturday',
      byMonthWeek: 1,
      startTime: '20:00',
      endTime: '01:00',
      age: '21+',
      short: 'A cumbia dance night with a beginner class at 8:15pm, then open floor until 1am.',
      long:
        'Cumbia Rosa is the taproom\u2019s monthly cumbia night. A guided beginner class runs at 8:15pm — no partner and no experience needed — and the floor stays open with cumbia sets until 1am. Drink specials run all night. Entry is 21 and over.',
      esShort: 'Noche de cumbia con clase para principiantes a las 8:15pm y baile hasta la 1am. Solo mayores de 21.',
      genre: 'Cumbia',
    },
    {
      slug: 'comedy-night',
      name: 'Comedy Night',
      kicker: 'Monthly',
      byDay: 'Friday',
      startTime: '19:00',
      endTime: '21:00',
      age: 'All ages until 8pm',
      short: 'Stand-up from Bay Area and Sonoma County comics in the back room.',
      long:
        'A stand-up showcase featuring comics from across Sonoma County and the Bay Area. Seating is limited and first-come. Full bar and kitchen service throughout the show.',
      esShort: 'Noche de comedia en vivo con comediantes del Bay Area y el condado de Sonoma.',
      genre: 'Comedy',
    },
    {
      slug: 'live-music',
      name: 'Live Music Weekends',
      kicker: 'Most Fridays & Saturdays',
      byDay: 'Friday',
      startTime: '19:00',
      endTime: '22:00',
      age: 'All ages until 8pm',
      short: 'Local bands and DJs — Latin, rock en espa\u00f1ol, soul and cumbia.',
      long:
        'Live sets from Sonoma County and North Bay artists on the taproom stage, weighted toward Latin music, rock en espa\u00f1ol and cumbia, with soul and blues in the mix.',
      esShort: 'M\u00fasica en vivo con bandas locales — cumbia, rock en espa\u00f1ol, soul y m\u00e1s.',
      genre: 'Live Music',
    },
    {
      slug: 'drink-for-a-cause',
      name: 'Drink For A Cause',
      kicker: 'Quarterly benefit',
      byDay: 'Friday',
      startTime: '18:00',
      endTime: '21:00',
      age: 'All ages until 8pm',
      short: '10% of the night\u2019s proceeds go to a Sonoma County nonprofit.',
      long:
        'A recurring benefit night where 10% of proceeds go to a local nonprofit. Past partners include Latino Service Providers, which works on equity and wellbeing for Latinx youth and families in Sonoma County.',
      esShort: 'Noche ben\u00e9fica: el 10% de las ventas apoya a una organizaci\u00f3n local.',
      genre: 'Community',
    },
  ],

  // --- Dated events ---------------------------------------------------------
  // ADD REAL DATES HERE. Anything in this array is emitted as full Event JSON-LD
  // and becomes eligible for Google event rich results and AI "what's on" answers.
  // Format:
  // { seriesSlug:'cumbia-rosa', date:'2026-09-05', start:'20:00', end:'01:00',
  //   name:'Cumbia Rosa — September', price:'10', ticketUrl:'https://...' }
  datedEvents: [],

  // --- Private events (the revenue page) ------------------------------------
  privatePackages: [
    {
      name: 'Patio Buyout',
      capacity: 'Up to 80 guests',
      best: 'Birthdays, quincea\u00f1eras, graduations, baby showers',
      includes: ['Tree-shaded creekside patio', 'Yard games', 'Bring your own decor', 'Taco truck coordination'],
    },
    {
      name: 'Back Room',
      capacity: '25–45 guests',
      best: 'Company parties, team offsites, rehearsal dinners, memorials',
      includes: ['Semi-private seating', 'Projector for slideshows', 'Dedicated bartender', 'Reserved tab or drink tickets'],
    },
    {
      name: 'Full Venue Buyout',
      capacity: 'Up to 150 guests',
      best: 'Weddings, nonprofit fundraisers, album releases, weddings after-parties',
      includes: ['Indoor taproom + patio', 'Stage, PA and projector', 'Full bar and kitchen', 'Event staff on site'],
    },
  ],

  // --- Menu -----------------------------------------------------------------
  // ⚠ No prices published — deliberately omitted rather than invented.
  // Add `price` keys and the schema will emit them automatically.
  menu: [
    {
      section: 'On Tap',
      note: 'The tap list rotates constantly. Call ahead if you are chasing something specific.',
      items: [
        { name: 'Local craft beer', desc: 'A rotating lineup weighted toward Sonoma County and North Bay breweries — IPAs, lagers, stouts and sours.' },
        { name: 'Cider', desc: 'Dry and semi-dry ciders from California producers.' },
        { name: 'Wine', desc: 'Sonoma County reds and whites by the glass.' },
        { name: 'Michelada setups', desc: 'Build a michelada on any beer on the list.' },
      ],
    },
    {
      section: 'Kitchen',
      note: 'Bar food built to go with beer. Vegetarian options available.',
      items: [
        { name: 'Ed Hops Wings', desc: 'Baked, not fried — the item regulars come back for.' },
        { name: 'Louie The Mac', desc: 'Baked mac and cheese.' },
        { name: 'Yo Adrin', desc: 'Cheese garlic bread.' },
        { name: 'Chips & Salsa', desc: 'House salsa.' },
        { name: 'Sandwiches', desc: 'Rotating sandwich board.' },
      ],
    },
    {
      section: 'Non-Alcoholic',
      note: 'Full non-alcoholic list — this is a family-friendly room before 8pm.',
      items: [
        { name: 'Mexican Coke', desc: 'Cane sugar, glass bottle.' },
        { name: "Martinelli's Apple Juice", desc: 'Sonoma County\u2019s own.' },
        { name: 'Sodas & sparkling water', desc: 'Standard non-alcoholic lineup.' },
      ],
    },
    {
      section: 'Freaking Tacos',
      note: 'An independent taco truck parked in the back. Hours can differ from the taproom.',
      items: [
        { name: 'Tacos al pastor', desc: 'The order to place. Repeatedly singled out in reviews.' },
        { name: 'Full taqueria menu', desc: 'Ordered at the truck, eaten on the patio.' },
      ],
    },
  ],
};

// --- FAQ ---------------------------------------------------------------------
// Answer-first: every answer opens with a complete, standalone, extractable
// sentence. This is what an AI engine lifts as a citation.
export const faqs = [
  {
    q: 'What is Mr. Chile Taproom?',
    a: `Mr. Chile Taproom is a Latino-owned craft beer taproom and live event venue at 4357 Montgomery Dr in Santa Rosa, California, billed as Sonoma County's first Latino taproom. It pours rotating local beer, cider and wine, serves bar food including baked wings and mac and cheese, and hosts cumbia dance nights, comedy shows, live music and community fundraisers. There is a tree-shaded patio backing onto Santa Rosa Creek and free parking on site.`,
  },
  {
    q: 'What are Mr. Chile Taproom\u2019s hours?',
    a: `Mr. Chile Taproom is closed Mondays, open 4pm to 9pm Tuesday through Thursday, 3pm to 11pm Friday and Saturday, and 12pm to 9pm on Sunday. Event nights can run later than posted closing time. Call (707) 239-4188 to confirm on a holiday.`,
  },
  {
    q: 'Where is Mr. Chile Taproom located?',
    a: `Mr. Chile Taproom is at 4357 Montgomery Dr, Santa Rosa, CA 95405, on Montgomery Drive near Mission Boulevard in east Santa Rosa. It sits in a shopping center with a free open parking lot, and the patio backs onto Santa Rosa Creek. It is roughly ten minutes from downtown Santa Rosa and about an hour and fifteen minutes from San Francisco.`,
  },
  {
    q: 'Is Mr. Chile Taproom kid-friendly?',
    a: `Yes. Mr. Chile Taproom welcomes families in the taproom and on the creekside patio, and the outdoor area has room for kids and yard games. Dance nights such as Cumbia Rosa are 21 and over, so check the event listing before bringing children on a weekend night.`,
  },
  {
    q: 'What is Cumbia Rosa?',
    a: `Cumbia Rosa is Mr. Chile Taproom's monthly cumbia dance night, held on the first Saturday of the month. A beginner cumbia class starts at 8:15pm — no partner or experience needed — and the dance floor stays open until 1am with drink specials running all night. Entry is 21 and over.`,
  },
  {
    q: 'Can you book Mr. Chile Taproom for a private event?',
    a: `Yes. Mr. Chile Taproom books private events including birthdays, quincea\u00f1eras, company parties, rehearsal dinners, nonprofit fundraisers and full-venue buyouts for up to 150 guests. Options include a patio buyout for up to 80 guests, a semi-private back room for 25 to 45, and a full venue buyout with stage, PA and projector. Enquire at (707) 239-4188 or through the booking form on this site.`,
  },
  {
    q: 'Does Mr. Chile Taproom serve food?',
    a: `Yes. Mr. Chile Taproom has a kitchen serving bar food — baked Ed Hops Wings, Louie The Mac mac and cheese, cheese garlic bread, chips and salsa and rotating sandwiches, with vegetarian options. An independent taco truck, Freaking Tacos, parks in the back and is known for its al pastor.`,
  },
  {
    q: 'Does Mr. Chile Taproom have parking?',
    a: `Yes. Mr. Chile Taproom has free open surface parking in the shared lot at 4357 Montgomery Dr. No permit or validation is needed and parking is generally available even on event nights.`,
  },
  {
    q: 'Is there live music at Mr. Chile Taproom?',
    a: `Yes. Mr. Chile Taproom hosts live music most Fridays and Saturdays, weighted toward cumbia, Latin music and rock en espa\u00f1ol, alongside monthly comedy nights and quarterly benefit events for Sonoma County nonprofits.`,
  },
  {
    q: 'Do they show sports?',
    a: `Yes. Mr. Chile Taproom projects games on the bar wall and has additional screens throughout the taproom, covering NFL, NBA, MLB and f\u00fatbol.`,
  },
];

// --- Helpers -----------------------------------------------------------------
export const fullAddress = `${site.street}, ${site.locality}, ${site.region} ${site.postal}`;
export const hoursSummary = 'Closed Mon · Tue–Thu 4–9pm · Fri–Sat 3–11pm · Sun 12–9pm';
