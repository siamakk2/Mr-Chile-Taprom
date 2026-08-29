import { asset } from './assets.mjs';
import { site, faqs, fullAddress, L } from './site.config.mjs';
import { ROUTES } from './routes.mjs';

const O = site.origin;
const ID = { org: `${O}/#business`, site: `${O}/#website` };
const abs = (p) => `${O}${p}`;

const openingHours = () =>
  site.hours.filter((h) => h.open).map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${h.schemaDay}`,
    opens: h.open,
    closes: h.close,
  }));

// Multi-typed on purpose. BarOrPub competes for "taproom near me"; EventVenue
// competes for "private event venue Santa Rosa", which is worth more. Both true.
export const businessNode = (loc = 'en') => ({
  '@type': ['BarOrPub', 'EventVenue'],
  '@id': ID.org,
  name: site.name,
  alternateName: site.altName,
  description: L(site.entityClaim, loc),
  slogan: site.tagline,
  url: `${O}/`,
  logo: abs(asset('/img/logo.png')),
  image: [abs(asset('/img/hero-taproom-1000.jpg')), abs(asset('/img/patio-wide-1000.jpg')), abs(asset('/img/tacos-beer-640.jpg'))],
  telephone: site.phoneE164,
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.street,
    addressLocality: site.locality,
    addressRegion: site.region,
    postalCode: site.postal,
    addressCountry: site.country,
  },
  geo: { '@type': 'GeoCoordinates', latitude: site.lat, longitude: site.lng },
  hasMap: `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`,
  openingHoursSpecification: openingHours(),
  priceRange: site.priceRange,
  currenciesAccepted: 'USD',
  paymentAccepted: 'Cash, Credit Card, Debit Card',
  foundingDate: site.founded,
  smokingAllowed: false,
  publicAccess: true,
  knowsLanguage: ['en-US', 'es-US'],
  areaServed: [
    { '@type': 'City', name: 'Santa Rosa' },
    { '@type': 'AdministrativeArea', name: 'Sonoma County' },
    { '@type': 'AdministrativeArea', name: 'North Bay' },
  ],
  servesCuisine: ['Bar food', 'Mexican', 'American'],
  hasMenu: abs(ROUTES.menu[loc]),
  amenityFeature: site.amenities.map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: L(a.name, loc),
    value: true,
    description: L(a.detail, loc),
  })),
  sameAs: site.profiles,
  potentialAction: [{
    '@type': 'ReserveAction',
    name: loc === 'es' ? 'Reservar un evento privado' : 'Book a private event',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: abs(ROUTES.private[loc]),
      actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
    },
  }],
});

export const websiteNode = (loc = 'en') => ({
  '@type': 'WebSite',
  '@id': ID.site,
  url: `${O}/`,
  name: site.name,
  inLanguage: loc === 'es' ? 'es-US' : 'en-US',
  publisher: { '@id': ID.org },
});

export const breadcrumb = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path),
  })),
});

export const faqNode = (list, loc = 'en') => ({
  '@type': 'FAQPage',
  '@id': `${abs(ROUTES.faq[loc])}#faq`,
  inLanguage: loc === 'es' ? 'es-US' : 'en-US',
  mainEntity: list.map((f) => ({
    '@type': 'Question',
    name: L(f.q, loc),
    acceptedAnswer: { '@type': 'Answer', text: L(f.a, loc) },
  })),
});

// EventSeries with an eventSchedule states "first Saturday of every month"
// truthfully. Inventing Event dates to look active is how sites earn manual
// actions; dated events below are real, taken from published flyers.
export const seriesNodes = (loc = 'en') =>
  site.series.map((s) => ({
    '@type': 'EventSeries',
    '@id': `${abs(ROUTES.events[loc])}#${s.slug}`,
    name: L(s.name, loc),
    description: L(s.long, loc),
    ...(s.pageKey ? { url: abs(ROUTES[s.pageKey][loc]) } : {}),
    ...(s.image ? { image: abs(asset(`/img/${s.image}.jpg`)) } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@id': ID.org },
    organizer: { '@id': ID.org },
    ...(s.partner ? { performer: { '@type': 'Organization', name: s.partner.name, url: s.partner.url } } : {}),
    ...(L(s.age, loc) === '21+' ? { typicalAgeRange: '21-' } : {}),
    eventSchedule: {
      '@type': 'Schedule',
      byDay: `https://schema.org/${s.byDay}`,
      ...(s.byMonthWeek ? { byMonthWeek: s.byMonthWeek } : {}),
      startTime: s.startTime,
      endTime: s.endTime,
      repeatFrequency: s.byMonthWeek ? 'P1M' : 'P1W',
      scheduleTimezone: 'America/Los_Angeles',
    },
  }));

export const datedEventNodes = (loc = 'en') =>
  site.datedEvents.map((e) => {
    const s = site.series.find((x) => x.slug === e.seriesSlug) || {};
    const start = e.start || s.startTime;
    const end = e.end || s.endTime;
    // Events ending after midnight land on the following calendar day.
    const endDate = end < start ? nextDay(e.date) : e.date;
    return {
      '@type': 'Event',
      '@id': `${abs(ROUTES.events[loc])}#${e.seriesSlug}-${e.date}`,
      name: L(e.name, loc) || L(s.name, loc),
      description: L(e.description, loc) || L(s.long, loc),
      startDate: `${e.date}T${start}:00-07:00`,
      endDate: `${endDate}T${end}:00-07:00`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      ...(e.image ? { image: abs(asset(`/img/${e.image}.jpg`)) } : {}),
      location: { '@id': ID.org },
      organizer: { '@id': ID.org },
      superEvent: { '@id': `${abs(ROUTES.events[loc])}#${e.seriesSlug}` },
      ...(L(s.age, loc) === '21+' ? { typicalAgeRange: '21-' } : {}),
      ...(e.lineup ? { performer: e.lineup.split('·').map((n) => ({ '@type': 'PerformingGroup', name: n.trim() })) } : {}),
      offers: {
        '@type': 'Offer',
        price: e.price ?? '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: e.ticketUrl || abs(ROUTES.events[loc]),
        validFrom: `${e.date}T00:00:00-07:00`,
      },
    };
  });

function nextDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return dt.toISOString().slice(0, 10);
}

export const menuNode = (loc = 'en') => ({
  '@type': 'Menu',
  '@id': `${abs(ROUTES.menu[loc])}#menu`,
  name: `${site.name} Menu`,
  inLanguage: loc === 'es' ? 'es-US' : 'en-US',
  hasMenuSection: site.menu.map((sec) => ({
    '@type': 'MenuSection',
    name: L(sec.section, loc),
    description: L(sec.note, loc),
    hasMenuItem: sec.items.map((i) => ({
      '@type': 'MenuItem',
      name: L(i.name, loc),
      description: L(i.desc, loc),
      // Prices reach the structured data only when a human has verified them.
      ...(site.pricesConfirmed && i.price
        ? { offers: { '@type': 'Offer', price: i.price, priceCurrency: 'USD' } }
        : {}),
    })),
  })),
});

/** Hoppy Hour as a real Offer with validity hours - feeds "happy hour near me". */
export const happyHourNode = (loc = 'en') => {
  const h = site.happyHour;
  return {
    '@type': 'Offer',
    '@id': `${abs(ROUTES.menu[loc])}#hoppy-hour`,
    name: `${L(h.name, loc)} - ${site.name}`,
    description: L(h.deals, loc).join('. ') + '.',
    category: 'HappyHour',
    availableAtOrFrom: { '@id': ID.org },
    offeredBy: { '@id': ID.org },
    priceCurrency: 'USD',
    availabilityStarts: h.opens,
    availabilityEnds: h.closes,
    availableDeliveryMethod: 'https://schema.org/OnSitePickup',
    validFrom: `${new Date().toISOString().slice(0, 10)}T${h.opens}:00-07:00`,
    itemOffered: {
      '@type': 'Service',
      name: L(h.name, loc),
      hoursAvailable: h.schemaDays.map((d) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${d}`,
        opens: h.opens,
        closes: h.closes,
      })),
    },
  };
};

export const serviceNodes = (loc = 'en') =>
  site.privatePackages.map((p) => ({
    '@type': 'Service',
    '@id': `${abs(ROUTES.private[loc])}#${p.slug}`,
    name: `${L(p.name, loc)} — ${site.name}`,
    serviceType: loc === 'es' ? 'Renta de salón para eventos privados' : 'Private event venue hire',
    description: `${L(p.capacity, loc)}. ${L(p.best, loc)}.`,
    provider: { '@id': ID.org },
    areaServed: { '@type': 'AdministrativeArea', name: 'Sonoma County' },
    availableLanguage: ['en', 'es'],
  }));

export const webPageNode = ({ path, title, description, trail, loc }) => ({
  '@type': 'WebPage',
  '@id': `${abs(path)}#webpage`,
  url: abs(path),
  name: title,
  description,
  isPartOf: { '@id': ID.site },
  about: { '@id': ID.org },
  primaryImageOfPage: abs(asset('/og.jpg')),
  breadcrumb: breadcrumb(trail),
  inLanguage: loc === 'es' ? 'es-US' : 'en-US',
});

export const graph = (nodes) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });

export { ID, fullAddress };
