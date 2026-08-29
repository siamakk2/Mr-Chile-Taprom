import { readFileSync } from 'node:fs';
import { asset } from './assets.mjs';
import { site, hoursSummary, fullAddress, L } from './site.config.mjs';

// Widths actually produced by scripts/build-images.py. Markup is generated from
// this, so a <img src> can never point at a size that was never rendered.
const IMG = JSON.parse(readFileSync('static/img/manifest.json', 'utf8'));
import { ROUTES, NAV_KEYS, UI, time12 } from './routes.mjs';

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const t = (key, loc) => L(UI[key], loc);

/**
 * Responsive <picture>. Serves WebP with a JPEG fallback and lets the browser
 * pick a width — a phone on the patio car park pulls 640px, not 1920px.
 */
export function pic(name, alt, { sizes = '100vw', cls = '', eager = false } = {}) {
  const meta = IMG[name];
  if (!meta) throw new Error(`pic(): no image "${name}" in manifest — run scripts/build-images.py`);
  const { widths, w, h } = meta;
  const set = (ext) => widths.map((x) => `${asset(`/img/${name}-${x}.${ext}`)} ${x}w`).join(', ');
  const largest = widths[widths.length - 1];
  return `<picture class="${cls}">
<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
<img src="${asset(`/img/${name}-${largest}.jpg`)}" srcset="${set('jpg')}" sizes="${sizes}"
 width="${w}" height="${h}" alt="${esc(alt)}"
 ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
</picture>`;
}

/** Flyers are single-width portrait artwork, not responsive photography. */
export const flyer = (name, alt) => {
  const m = IMG[name] || {};
  return `<picture>
<source type="image/webp" srcset="${asset(`/img/${name}.webp`)}">
<img src="${asset(`/img/${name}.jpg`)}" alt="${esc(alt)}"${m.w ? ` width="${m.w}" height="${m.h}"` : ''}
 loading="lazy" decoding="async" class="flyer__img">
</picture>`;
};

export const PICADO = `<svg class="picado" viewBox="0 0 120 26" preserveAspectRatio="none" aria-hidden="true">
<defs><pattern id="pp" width="20" height="26" patternUnits="userSpaceOnUse">
<path d="M0 0h20v9a10 10 0 0 1-20 0Z" fill="currentColor"/>
<circle cx="10" cy="4.5" r="1.9" fill="#16100E"/>
<circle cx="4" cy="3" r="1.1" fill="#16100E"/><circle cx="16" cy="3" r="1.1" fill="#16100E"/>
</pattern></defs><rect width="120" height="26" fill="url(#pp)"/></svg>`;

const hoursJSON = JSON.stringify(site.hours.map((h) => [h.open, h.close]));

/**
 * Live open/closed in the venue's own timezone. No dependencies. The static
 * hours summary is already in the HTML, so this degrades cleanly without JS.
 */
const statusScript = (loc) => {
  const w = {
    open: t('openNow', loc), closed: t('closedNow', loc), closes: t('closesAt', loc),
    opens: t('opensAt', loc), today: t('opensToday', loc), tomorrow: t('opensTomorrow', loc),
    days: loc === 'es'
      ? ['lunes','martes','miércoles','jueves','viernes','sábado','domingo']
      : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  };
  return `<script>(function(){
var H=${hoursJSON},W=${JSON.stringify(w)};
function now(){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});
return{d:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(o.weekday),m:+o.hour*60+ +o.minute};}
function mins(s){return +s.slice(0,2)*60 + +s.slice(3,5);}
function fmt(s){var h=+s.slice(0,2),m=s.slice(3,5),a=h>=12?'pm':'am';h=h%12||12;return h+(m==='00'?'':':'+m)+a;}
var n=now(),row=H[n.d],st='closed',msg='';
if(row&&row[0]){var o=mins(row[0]),c=mins(row[1]);if(c<o)c+=1440;
 if(n.m>=o&&n.m<c){st='open';msg=W.closes+' '+fmt(row[1]);}else if(n.m<o){msg=W.opens+' '+fmt(row[0])+' '+W.today;}}
if(st==='closed'&&!msg){for(var i=1;i<=7;i++){var r=H[(n.d+i)%7];if(r&&r[0]){msg=W.opens+' '+(i===1?W.tomorrow:W.days[(n.d+i)%7])+' '+fmt(r[0]);break;}}}
document.querySelectorAll('[data-status]').forEach(function(el){el.setAttribute('data-state',st);
el.innerHTML='<span class="status__dot"></span><span class="status__word">'+(st==='open'?W.open:W.closed)+'</span>'+(msg?'<span aria-hidden="true">&middot;</span><span>'+msg+'</span>':'');});
var tb=document.querySelector('[data-hours-table]');if(tb){var tr=tb.querySelectorAll('tbody tr')[n.d];if(tr)tr.setAttribute('data-today','true');}
})();<\/script>`;
};

const MENU_JS = `<script>(function(){var b=document.querySelector('[data-menu-btn]'),d=document.querySelector('[data-drawer]');if(!b||!d)return;
b.addEventListener('click',function(){var o=d.getAttribute('data-open')==='true';d.setAttribute('data-open',String(!o));b.setAttribute('aria-expanded',String(!o));});})();<\/script>`;

/**
 * Cookie notice. California is a notice-and-opt-out jurisdiction, so analytics
 * runs by default and this tells people it does; declining flips Consent Mode
 * to denied for good. Rendered hidden and revealed by script, so a returning
 * visitor who already answered never sees it flash.
 */
const consentBanner = (loc) => !site.ga4Id ? '' : `<div class="cc" data-cc hidden role="region" aria-label="${esc(t('consentLabel', loc))}">
<div class="cc__in">
<p class="cc__txt">${esc(t('consentBody', loc))} <a href="${ROUTES.privacy[loc]}">${esc(t('consentMore', loc))}</a></p>
<div class="cc__btns">
<button class="btn btn--gold" type="button" data-cc-ok>${esc(t('consentOk', loc))}</button>
<button class="btn btn--ghost" type="button" data-cc-no>${esc(t('consentNo', loc))}</button>
</div>
</div>
</div>`;

const CONSENT_JS = `<script>(function(){var K='mrc-consent',el=document.querySelector('[data-cc]');if(!el)return;
var v=null;try{v=localStorage.getItem(K);}catch(e){}
if(!v)el.hidden=false;
function set(val){try{localStorage.setItem(K,val);}catch(e){}
if(val==='denied'&&window.gtag)gtag('consent','update',{analytics_storage:'denied'});
if(val==='granted'&&window.gtag)gtag('consent','update',{analytics_storage:'granted'});
el.hidden=true;}
el.querySelector('[data-cc-ok]').addEventListener('click',function(){set('granted');});
el.querySelector('[data-cc-no]').addEventListener('click',function(){set('denied');});})();<\/script>`;

function header(path, loc, altPath) {
  const other = loc === 'en' ? 'es' : 'en';
  const nav = NAV_KEYS.map((k) => {
    const p = ROUTES[k][loc];
    return `<a href="${p}"${path === p ? ' aria-current="page"' : ''}>${esc(L(UI.nav[k], loc))}</a>`;
  }).join('');
  return `<header class="hdr">
<div class="wrap hdr__in">
<a class="brand" href="${ROUTES.home[loc]}" aria-label="${esc(site.name)} \u2014 ${esc(site.tagline)}">
<img class="brand__lockup" src="${asset('/img/logo-horizontal.png')}" width="670" height="114" alt="" aria-hidden="true">
<img class="brand__mark" src="${asset('/img/mark-light.png')}" width="464" height="216" alt="" aria-hidden="true">
</a>
<nav class="nav" aria-label="${loc === 'es' ? 'Principal' : 'Primary'}">${nav}</nav>
<a class="lang" href="${altPath}" hreflang="${other}" lang="${other}" title="${esc(t('langLabel', loc))}"><span class="lang__long">${esc(t('langSwitch', loc))}</span><span class="lang__short" aria-hidden="true">${esc(t('langShort', loc))}</span></a>
<a class="btn btn--primary hdr__cta" href="tel:${site.phoneE164}">${esc(t('call', loc))} ${site.phone}</a>
<button class="menu-btn" type="button" data-menu-btn aria-expanded="false" aria-controls="drawer" aria-label="${esc(t('menuBtn', loc))}">
<svg viewBox="0 0 20 14" aria-hidden="true" focusable="false"><path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
</div>
<div class="drawer" id="drawer" data-drawer data-open="false"><div class="wrap">
${NAV_KEYS.map((k) => `<a href="${ROUTES[k][loc]}">${esc(L(UI.nav[k], loc))}</a>`).join('')}
<a href="${altPath}" hreflang="${other}" lang="${other}">${esc(t('langSwitch', loc))}</a>
<a href="tel:${site.phoneE164}">${esc(t('call', loc))} ${site.phone}</a>
</div></div>
</header>`;
}

function footer(loc, altPath) {
  const other = loc === 'en' ? 'es' : 'en';
  return `<footer class="ftr">
<div class="wrap band band--tight">
<div class="ftr__grid">
<div>
<img class="ftr__logo" src="${asset('/img/logo-light.png')}" width="240" height="147" alt="${esc(site.name)}" loading="lazy">
<address>
${esc(site.street)}<br>${esc(site.locality)}, ${site.region} ${site.postal}<br>
<a href="tel:${site.phoneE164}">${site.phone}</a><br>
<a href="mailto:${site.email}">${esc(site.email)}</a>
</address>
<p style="margin-top:1rem"><span class="status" data-status>${esc(L(hoursSummary, loc))}</span></p>
<p class="ftr__social">
<a href="https://www.instagram.com/mr.chiletaproom/" rel="noopener">Instagram</a>
<a href="https://www.facebook.com/confluencetaproom/" rel="noopener">Facebook</a>
</p>
</div>
<div>
<h4>${esc(t('pages', loc))}</h4>
<ul>${NAV_KEYS.map((k) => `<li><a href="${ROUTES[k][loc]}">${esc(L(UI.nav[k], loc))}</a></li>`).join('')}
<li><a href="${ROUTES.cumbia[loc]}">Cumbia Rosa</a></li>
<li><a href="${ROUTES.privacy[loc]}">${esc(t('privacyLabel', loc))}</a></li>
<li><a href="${altPath}" hreflang="${other}" lang="${other}">${esc(t('langSwitch', loc))}</a></li></ul>
</div>
<div>
<h4>${esc(t('hours', loc))}</h4>
<table class="hours" data-hours-table><tbody>
${site.hours.map((h) => `<tr${h.open ? '' : ' data-closed="true"'}><th scope="row">${esc(L(h.day, loc))}</th><td>${esc(L(h.label, loc))}</td></tr>`).join('')}
</tbody></table>
</div>
</div>
</div>
<div class="wrap"><div class="ftr__base">
<span>&copy; ${new Date().getFullYear()} ${esc(site.name)} &middot; ${esc(L(site.county, loc))}</span>
<span>${esc(t('drink', loc))}</span>
</div></div>
</footer>`;
}

export function layout({ path, altPath, loc = 'en', title, description, jsonld, body, cssHref = '/styles.css', robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' }) {
  const url = `${site.origin}${path}`;
  const enPath = loc === 'en' ? path : altPath;
  const esPath = loc === 'es' ? path : altPath;
  return `<!doctype html>
<html lang="${loc === 'es' ? 'es-US' : 'en-US'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${robots}">${site.googleSiteVerification ? `
<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">` : ''}
<meta name="theme-color" content="#16100E">
<meta name="geo.region" content="US-CA">
<meta name="geo.placename" content="Santa Rosa, California">
<meta name="geo.position" content="${site.lat};${site.lng}">
<meta name="ICBM" content="${site.lat}, ${site.lng}">
<link rel="alternate" hreflang="en-US" href="${site.origin}${enPath}">
<link rel="alternate" hreflang="es-US" href="${site.origin}${esPath}">
<link rel="alternate" hreflang="x-default" href="${site.origin}${enPath}">
<meta property="og:type" content="${path === '/' || path === '/es/' ? 'website' : 'article'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${loc === 'es' ? 'es_US' : 'en_US'}">
<meta property="og:locale:alternate" content="${loc === 'es' ? 'en_US' : 'es_US'}">
<meta property="og:image" content="${site.origin}${asset('/og.jpg')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} — ${esc(site.tagline)}, ${esc(site.locality)}, ${site.region}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${site.origin}${asset('/og.jpg')}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${site.origin}${asset('/img/mark-light.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400..700&display=swap">
<link rel="stylesheet" href="${cssHref}">
<script type="application/ld+json">${jsonld}<\/script>${site.ga4Id ? `
<link rel="preconnect" href="https://www.googletagmanager.com">
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
var _c=null;try{_c=localStorage.getItem('mrc-consent');}catch(e){}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',
analytics_storage:_c==='denied'?'denied':'granted'});
gtag('js',new Date());gtag('config','${esc(site.ga4Id)}');<\/script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.ga4Id)}"><\/script>` : ''}
</head>
<body>
<a class="skip" href="#main">${esc(t('skip', loc))}</a>
${header(path, loc, altPath)}
<main id="main">
${body}
</main>
${footer(loc, altPath)}
${consentBanner(loc)}
${statusScript(loc)}
${MENU_JS}
${CONSENT_JS}
</body>
</html>`;
}

export { ROUTES, UI, L, t, fullAddress, time12 };
