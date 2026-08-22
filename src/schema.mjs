import { site, faqs, fullAddress } from './site.config.mjs';

const ID = {
  org: `${site.origin}/#business`,
  site: `${site.origin}/#website`,
  place: `${site.origin}/#place`,
};

const openingHours = () =>
  site.hours
    .filter((h) => h.open)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${h.schemaDay}`,
      opens: h.open,
      closes: h.close,
    }));

const postalAddress = () => ({
  '@type': 'PostalAddress',
  streetAddress: site.street,
  addressLocality: site.locality,
  addressRegion: site.region,
  postalCode: site.postal,
  addressCountry: site.country,
});

const geo = () => ({ '@type': 'GeoCoordinates', latitude: site.lat, longitude: site.lng });

// -----------------------------------------------------------------------------
// The root business node. Multi-typed on purpose: BarOrPub carries the food and
// drink semantics, EventVenue carries the bookable-venue semantics. Both are
// true, and each unlocks a different class of query.
// -----------------------------------------------------------------------------
export const businessNode = () => ({
  '@type': ['BarOrPub', 'EventVenue'],
  '@id': ID.org,
  name: site.name,
  alternateName: site.altName,
  description: site.entityClaim,
  slogan: site.tagline,
  url: `${site.origin}/`,
  telephone: site.phoneE164,
  email: site.email,
  address: postalAddress(),
  geo: geo(),
  hasMap: `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`,
  openingHoursSpecification: openingHours(),
  priceRange: site.priceRange,
  currenciesAccepted: site.currency,
  paymentAccepted: 'Cash, Credit Card, Debit Card',
  foundingDate: site.founded,
  smokingAllowed: false,
  publicAccess: true,
  isAccessibleForFree: true,
  maximumAttendeeCapacity: 150,
  knowsLanguage: ['en-US', 'es-US'],
  areaServed: [
    { '@type': 'City', name: 'Santa Rosa' },
    { '@type': 'AdministrativeArea', name: 'Sonoma County' },
    { '@type': 'AdministrativeArea', name: 'North Bay' },
  ],
  servesCuisine: ['Bar food', 'Mexican', 'American'],
  hasMenu: `${site.origin}/menu/`,
  amenityFeature: site.amenities.map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: a.name,
    value: true,
    description: a.detail,
  })),
  sameAs: site.profiles.filter((u) => !u.endsWith('goo.gl/')),
  potentialAction: [
    {
      '@type': 'ReserveAction',
      name: 'Book a private event',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.origin}/private-events/`,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
    },
  ],
});

export const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': ID.site,
  url: `${site.origin}/`,
  name: site.name,
  inLanguage: 'en-US',
  publisher: { '@id': ID.org },
});

export const breadcrumb = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: `${site.origin}${t.path}`,
  })),
});

export const faqNode = (list = faqs) => ({
  '@type': 'FAQPage',
  '@id': `${site.origin}/faq/#faq`,
  mainEntity: list.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

// EventSeries with an eventSchedule — the honest way to publish recurring
// programming without inventing dates.
export const seriesNodes = () =>
  site.series.map((s) => ({
    '@type': 'EventSeries',
    '@id': `${site.origin}/events/#${s.slug}`,
    name: s.name,
    description: s.long,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@id': ID.org },
    organizer: { '@id': ID.org },
    ...(s.age === '21+' ? { typicalAgeRange: '21-' } : {}),
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

export const datedEventNodes = () =>
  site.datedEvents.map((e) => {
    const s = site.series.find((x) => x.slug === e.seriesSlug) || {};
    return {
      '@type': 'Event',
      '@id': `${site.origin}/events/#${e.seriesSlug}-${e.date}`,
      name: e.name || s.name,
      description: e.description || s.long,
      startDate: `${e.date}T${e.start || s.startTime}:00-07:00`,
      endDate: `${e.date}T${e.end || s.endTime}:00-07:00`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@id': ID.org },
      organizer: { '@id': ID.org },
      superEvent: { '@id': `${site.origin}/events/#${e.seriesSlug}` },
      offers: {
        '@type': 'Offer',
        price: e.price ?? '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: e.ticketUrl || `${site.origin}/events/`,
        validFrom: `${e.date}T00:00:00-07:00`,
      },
    };
  });

export const menuNode = () => ({
  '@type': 'Menu',
  '@id': `${site.origin}/menu/#menu`,
  name: `${site.name} Menu`,
  inLanguage: 'en-US',
  hasMenuSection: site.menu.map((sec) => ({
    '@type': 'MenuSection',
    name: sec.section,
    description: sec.note,
    hasMenuItem: sec.items.map((i) => ({
      '@type': 'MenuItem',
      name: i.name,
      description: i.desc,
      ...(i.price ? { offers: { '@type': 'Offer', price: i.price, priceCurrency: 'USD' } } : {}),
    })),
  })),
});

export const serviceNodes = () =>
  site.privatePackages.map((p) => ({
    '@type': 'Service',
    '@id': `${site.origin}/private-events/#${p.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: `${p.name} — private event at ${site.name}`,
    serviceType: 'Private event venue hire',
    description: `${p.capacity}. Suited to ${p.best.toLowerCase()}. Includes ${p.includes.join(', ').toLowerCase()}.`,
    provider: { '@id': ID.org },
    areaServed: { '@type': 'AdministrativeArea', name: 'Sonoma County' },
  }));

export const webPageNode = ({ path, title, description, trail }) => ({
  '@type': 'WebPage',
  '@id': `${site.origin}${path}#webpage`,
  url: `${site.origin}${path}`,
  name: title,
  description,
  isPartOf: { '@id': ID.site },
  about: { '@id': ID.org },
  primaryImageOfPage: `${site.origin}/og.jpg`,
  breadcrumb: breadcrumb(trail),
  inLanguage: 'en-US',
});

export const graph = (nodes) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });

export { ID, fullAddress };
