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

/**
 * Content now lives in /content as JSON so the CMS at /admin can edit it.
 * This file keeps the same exported shape it always had — site, faqs,
 * hoursSummary, fullAddress — so nothing downstream had to change.
 *
 * JSON rather than this file because a CMS can safely rewrite a data file; it
 * cannot safely rewrite JavaScript, and one stray quote from the taproom would
 * have taken the build down.
 */
import business from '../content/business.json' with { type: 'json' };
import technical from '../content/technical.json' with { type: 'json' };
import hoursData from '../content/hours.json' with { type: 'json' };
import menuData from '../content/menu.json' with { type: 'json' };
import eventsData from '../content/events.json' with { type: 'json' };
import privateData from '../content/private-events.json' with { type: 'json' };
import amenitiesData from '../content/amenities.json' with { type: 'json' };
import faqData from '../content/faq.json' with { type: 'json' };

export const site = {
  ...business,
  ...technical,
  hours: hoursData.hours,
  happyHour: hoursData.happyHour,
  amenities: amenitiesData.amenities,
  series: eventsData.series,
  datedEvents: eventsData.datedEvents,
  privatePackages: privateData.privatePackages,
  pricesConfirmed: menuData.pricesConfirmed,
  menu: menuData.menu,
};

export const faqs = faqData.faqs;

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

export const fullAddress = `${site.street}, ${site.locality}, ${site.region} ${site.postal}`;
