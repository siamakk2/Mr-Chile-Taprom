// Localized URL slugs. Spanish pages get Spanish URLs — "/es/eventos/" ranks
// for Spanish queries in a way that "/es/events/" does not, and hreflang keeps
// the two versions paired rather than competing.

export const ROUTES = {
  home:     { en: '/',                 es: '/es/' },
  events:   { en: '/events/',          es: '/es/eventos/' },
  menu:     { en: '/menu/',            es: '/es/menu/' },
  private:  { en: '/private-events/',  es: '/es/eventos-privados/' },
  visit:    { en: '/visit/',           es: '/es/visitanos/' },
  faq:      { en: '/faq/',             es: '/es/preguntas/' },
  privacy:  { en: '/privacy/',         es: '/es/privacidad/' },
};

// Privacy is deliberately absent: it belongs in the footer, not the marquee.
export const NAV_KEYS = ['events', 'menu', 'private', 'visit', 'faq'];

export const UI = {
  nav: {
    events:  { en: "What's On",     es: 'Eventos' },
    menu:    { en: 'Beer & Food',   es: 'Menú' },
    private: { en: 'Book The Room', es: 'Renta el Salón' }, // longest label; nav is nowrap
    visit:   { en: 'Visit',         es: 'Visítanos' },
    faq:     { en: 'FAQ',           es: 'Preguntas' },
  },
  call:          { en: 'Call',              es: 'Llamar' },
  menuBtn:       { en: 'Menu',              es: 'Menú' },
  skip:          { en: 'Skip to content',   es: 'Ir al contenido' },
  openNow:       { en: 'Open now',          es: 'Abierto ahora' },
  closedNow:     { en: 'Closed',            es: 'Cerrado' },
  closesAt:      { en: 'Closes',            es: 'Cierra' },
  opensAt:       { en: 'Opens',             es: 'Abre' },
  opensToday:    { en: 'today',             es: 'hoy' },
  opensTomorrow: { en: 'tomorrow',          es: 'mañana' },
  hours:         { en: 'Hours',             es: 'Horario' },
  findUs:        { en: 'Find us',           es: 'Encuéntranos' },
  pages:         { en: 'Pages',             es: 'Páginas' },
  directions:    { en: 'Get directions',    es: 'Cómo llegar' },
  openInMaps:    { en: 'Open in Maps',      es: 'Abrir en Maps' },
  langSwitch:    { en: 'Español',           es: 'English' },
  langShort:     { en: 'ES',                es: 'EN' },
  langLabel:     { en: 'Ver en español',    es: 'View in English' },
  drink:         { en: 'Drink responsibly · 21+ after 8pm on event nights',
                   es: 'Bebe responsablemente · 21+ después de las 8pm en noches de evento' },
  eventNote:     { en: 'Event nights run past posted closing. Call to confirm on holidays.',
                   es: 'Las noches de evento pasan del horario normal. Llama para confirmar en días festivos.' },
  fullCalendar:  { en: 'Full calendar',     es: 'Ver calendario' },
  allQuestions:  { en: 'All questions',     es: 'Todas las preguntas' },
  upNext:        { en: 'Up next',           es: 'Próximamente' },
  onTheBoard:    { en: 'On the board',      es: 'En cartelera' },
  address:       { en: 'Address',           es: 'Dirección' },
  phone:         { en: 'Phone',             es: 'Teléfono' },
  email:         { en: 'Email',             es: 'Correo' },
  crossSt:       { en: 'Cross street',      es: 'Calle transversal' },
  parking:       { en: 'Parking',           es: 'Estacionamiento' },
  capacity:      { en: 'Capacity',          es: 'Capacidad' },
  languages:     { en: 'Languages',         es: 'Idiomas' },
  parkingVal:    { en: 'Free open lot on site, no permit or validation',
                   es: 'Estacionamiento gratis en el lugar, sin permiso ni validación' },
  capacityVal:   { en: 'Patio, back room or a full venue buyout',
                   es: 'Patio, salón trasero o el lugar completo' },
  langsVal:      { en: 'English and Spanish spoken',
                   es: 'Se habla español e inglés' },
  crossStVal:    { en: 'east Santa Rosa',   es: 'este de Santa Rosa' },

  // --- cookie notice --------------------------------------------------------
  privacyLabel:  { en: 'Privacy',           es: 'Privacidad' },
  consentBody:   { en: 'We use cookies to see how the site gets used, so we can make it better. No ads, and we never sell your information.',
                   es: 'Usamos cookies para ver cómo se usa el sitio y así mejorarlo. Sin anuncios, y nunca vendemos tu información.' },
  consentOk:     { en: 'Got it',            es: 'Entendido' },
  consentNo:     { en: 'No thanks',         es: 'No, gracias' },
  consentMore:   { en: 'Read more',         es: 'Leer más' },
  consentLabel:  { en: 'Cookie notice',     es: 'Aviso de cookies' },
  optOutOn:      { en: 'Analytics is on for this browser.',
                   es: 'Las analíticas están activadas en este navegador.' },
  optOutOff:     { en: 'Analytics is off for this browser.',
                   es: 'Las analíticas están desactivadas en este navegador.' },
  optOutTurnOff: { en: 'Turn analytics off', es: 'Desactivar analíticas' },
  optOutTurnOn:  { en: 'Turn analytics on',  es: 'Activar analíticas' },
};

export const MONTHS = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
};
export const WEEKDAYS = {
  en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  es: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
};

/** Format an ISO date (YYYY-MM-DD) without timezone drift. */
export function formatDate(iso, loc = 'en') {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return loc === 'es'
    ? `${WEEKDAYS.es[wd]} ${d} de ${MONTHS.es[m - 1]}`
    : `${WEEKDAYS.en[wd]}, ${MONTHS.en[m - 1]} ${d}`;
}

export function shortDate(iso, loc = 'en') {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const w = WEEKDAYS[loc][wd].slice(0, 3).toUpperCase();
  return `${w} ${d}`;
}

/** 24h "20:15" -> "8:15pm" */
export const time12 = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, '0')}${ap}` : `${hh}${ap}`;
};
