import { existsSync } from 'node:fs';
import { site, hoursSummary, fullAddress } from './site.config.mjs';

// Social card is emitted only when static/og.jpg exists. Drop a real photo of
// the patio or a Cumbia Rosa night in there — it will outperform any graphic.
const HAS_OG = existsSync('static/og.jpg');
const ogTags = () => HAS_OG ? `<meta property="og:image" content="${site.origin}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} — ${esc(site.tagline)}, ${esc(site.locality)}, ${site.region}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${site.origin}/og.jpg">` : '<meta name="twitter:card" content="summary">';

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
  { path: '/events/', label: "What's On" },
  { path: '/menu/', label: 'Beer & Food' },
  { path: '/private-events/', label: 'Book The Room' },
  { path: '/visit/', label: 'Visit' },
  { path: '/faq/', label: 'FAQ' },
];

const MARK = `<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true" fill="none">
<path d="M20.5 4.2c1.4-1.6 3.6-1.9 4.6-.6.9 1.2.2 3-1.3 3.9" stroke="#3E8C63" stroke-width="2.2" stroke-linecap="round"/>
<path d="M21.8 7.4C21.8 16 17.4 24.6 9.6 28.4c-2.4 1.2-4.6-.9-3.6-3.3C9.2 17.6 14 11 21.8 7.4Z" fill="#C1272D"/>
<path d="M13.4 12.1c1.6 3.4 1.2 8.2-1.1 12.4" stroke="#E23B41" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;

// Papel picado — cut-paper bunting rendered as a perforated rule. Used once
// per page, as a divider, not as decoration sprayed everywhere.
export const PICADO = `<svg class="picado" viewBox="0 0 120 26" preserveAspectRatio="none" aria-hidden="true">
<defs><pattern id="pp" width="20" height="26" patternUnits="userSpaceOnUse">
<path d="M0 0h20v9a10 10 0 0 1-20 0Z" fill="currentColor"/>
<circle cx="10" cy="4.5" r="1.9" fill="#16100E"/>
<circle cx="4" cy="3" r="1.1" fill="#16100E"/><circle cx="16" cy="3" r="1.1" fill="#16100E"/>
</pattern></defs><rect width="120" height="26" fill="url(#pp)"/></svg>`;

const hoursJSON = JSON.stringify(site.hours.map((h) => [h.open, h.close]));

// Live open/closed. ~20 lines, no dependencies, degrades to the full hours
// table if JS is off — the fallback text is in the HTML, not injected.
const STATUS_JS = `<script>(function(){
var H=${hoursJSON};
function tz(){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});
var d=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(o.weekday);return{d:d,m:+o.hour*60+ +o.minute};}
function mins(s){return +s.slice(0,2)*60 + +s.slice(3,5);}
function fmt(s){var h=+s.slice(0,2),m=s.slice(3,5),ap=h>=12?'pm':'am';h=h%12||12;return h+(m==='00'?'':':'+m)+ap;}
var n=tz(),row=H[n.d],state='closed',msg='';
if(row&&row[0]){var o=mins(row[0]),c=mins(row[1]);if(c<o)c+=1440;
 if(n.m>=o&&n.m<c){state='open';msg='Closes '+fmt(row[1]);}else if(n.m<o){msg='Opens '+fmt(row[0])+' today';}}
if(state==='closed'&&!msg){for(var i=1;i<=7;i++){var r=H[(n.d+i)%7];if(r&&r[0]){var nm=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][(n.d+i)%7];msg='Opens '+(i===1?'tomorrow':nm)+' '+fmt(r[0]);break;}}}
document.querySelectorAll('[data-status]').forEach(function(el){
 el.setAttribute('data-state',state);
 el.innerHTML='<span class="status__dot"></span><span class="status__word">'+(state==='open'?'Open now':'Closed')+'</span>'+(msg?'<span aria-hidden="true">\\u00b7</span><span>'+msg+'</span>':'');});
var t=document.querySelector('[data-hours-table]');if(t){var tr=t.querySelectorAll('tbody tr')[n.d];if(tr)tr.setAttribute('data-today','true');}
})();</script>`;

const MENU_JS = `<script>(function(){var b=document.querySelector('[data-menu-btn]'),d=document.querySelector('[data-drawer]');if(!b||!d)return;
b.addEventListener('click',function(){var o=d.getAttribute('data-open')==='true';d.setAttribute('data-open',String(!o));b.setAttribute('aria-expanded',String(!o));});})();</script>`;

function header(path) {
  const link = (i) =>
    `<a href="${i.path}"${path === i.path ? ' aria-current="page"' : ''}>${i.label}</a>`;
  return `<header class="hdr">
<div class="wrap hdr__in">
<a class="brand" href="/" aria-label="${esc(site.name)} — home">${MARK}<span class="brand__txt">Mr. Chile<small>Taproom · Beer &amp; Culture</small></span></a>
<nav class="nav" aria-label="Primary">${NAV.map(link).join('')}</nav>
<a class="btn btn--primary hdr__cta" href="tel:${site.phoneE164}">Call ${site.phone}</a>
<button class="menu-btn" type="button" data-menu-btn aria-expanded="false" aria-controls="drawer">Menu</button>
</div>
<div class="drawer" id="drawer" data-drawer data-open="false"><div class="wrap">
${NAV.map((i) => `<a href="${i.path}">${i.label}</a>`).join('')}
<a href="tel:${site.phoneE164}">Call ${site.phone}</a>
</div></div>
</header>`;
}

function footer() {
  return `<footer class="ftr">
<div class="wrap band band--tight">
<div class="ftr__grid">
<div>
<h4>Find us</h4>
<address>
<strong>${esc(site.name)}</strong><br>
${esc(site.street)}<br>${esc(site.locality)}, ${site.region} ${site.postal}<br>
<a href="tel:${site.phoneE164}">${site.phone}</a><br>
<a href="mailto:${site.email}">${esc(site.email)}</a>
</address>
<p style="margin-top:1rem"><span class="status" data-status>${esc(hoursSummary)}</span></p>
</div>
<div>
<h4>Pages</h4>
<ul>${NAV.map((i) => `<li><a href="${i.path}">${i.label}</a></li>`).join('')}<li><a href="/es/">Espa&ntilde;ol</a></li></ul>
</div>
<div>
<h4>Hours</h4>
<table class="hours" data-hours-table><tbody>
${site.hours.map((h) => `<tr${h.open ? '' : ' data-closed="true"'}><th scope="row">${h.day}</th><td>${h.label}</td></tr>`).join('')}
</tbody></table>
</div>
</div>
</div>
<div class="wrap"><div class="ftr__base">
<span>&copy; ${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.county)}</span>
<span>Drink responsibly · 21+ after 8pm on event nights</span>
</div></div>
</footer>`;
}

export function layout({
  path,
  title,
  description,
  jsonld,
  body,
  lang = 'en',
  esPath = null,
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
}) {
  const url = `${site.origin}${path}`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#16100E">
<meta name="geo.region" content="US-CA">
<meta name="geo.placename" content="Santa Rosa, California">
<meta name="geo.position" content="${site.lat};${site.lng}">
<meta name="ICBM" content="${site.lat}, ${site.lng}">
<link rel="alternate" hreflang="en-US" href="${site.origin}${path === '/es/' ? '/' : path}">
${esPath || path === '/es/' ? `<link rel="alternate" hreflang="es-US" href="${site.origin}/es/">` : ''}
<link rel="alternate" hreflang="x-default" href="${site.origin}${path === '/es/' ? '/' : path}">
<meta property="og:type" content="${path === '/' ? 'website' : 'article'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${lang === 'es' ? 'es_US' : 'en_US'}">
${ogTags()}
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400..700&display=swap">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${jsonld}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
${STATUS_JS}
${MENU_JS}
</body>
</html>`;
}

export { NAV, fullAddress };
