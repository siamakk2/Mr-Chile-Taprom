/**
 * Shared server helpers.
 *
 * No SDKs. Stripe and Supabase both expose plain HTTP APIs and this project
 * has kept a zero-dependency build for good reasons; pulling in two large
 * client libraries plus their transitive trees for what amounts to four fetch
 * calls would be a poor trade. node:crypto covers signing.
 */
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

export const env = (k) => process.env[k];

/**
 * The site origin, with any trailing slash removed.
 *
 * Someone will paste "https://www.mrchiletaproom.com/" into the environment
 * variable, and every URL built from it then carries a double slash. An OAuth
 * redirect_uri fails outright on that, and ticket links quietly 404. Normalise
 * once here rather than trusting the value.
 */
export const ORIGIN = () =>
  (process.env.SITE_ORIGIN || 'https://www.mrchiletaproom.com').replace(/\/+$/, '');

/** Every route calls this first. Missing config must fail closed, not half-work. */
export function requireEnv(...keys) {
  const absent = keys.filter((k) => !process.env[k]);
  if (absent.length) {
    const err = new Error(`ticketing not configured: missing ${absent.join(', ')}`);
    err.statusCode = 503;
    throw err;
  }
}

export const TICKETING_ON = () => process.env.TICKETING_ENABLED === 'true';

// --- responses ---------------------------------------------------------------
export const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
};

export async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

// --- Stripe ------------------------------------------------------------------
export async function stripe(path, params, method = 'POST') {
  requireEnv('STRIPE_SECRET_KEY');
  const body = params ? new URLSearchParams(flatten(params)).toString() : undefined;
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await r.json();
  if (!r.ok) {
    const err = new Error(data?.error?.message || `stripe ${r.status}`);
    err.statusCode = 502;
    throw err;
  }
  return data;
}

/** Stripe wants bracketed form encoding: metadata[event_id]=... */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else if (Array.isArray(v)) v.forEach((item, i) => {
      if (typeof item === 'object') flatten(item, `${key}[${i}]`, out);
      else out[`${key}[${i}]`] = String(item);
    });
    else out[key] = String(v);
  }
  return out;
}

/**
 * Verify a Stripe webhook signature.
 *
 * Done by hand rather than with the SDK, so the details matter: compare in
 * constant time, and reject anything older than the tolerance so a captured
 * request cannot be replayed later.
 */
export function verifyStripeSignature(raw, header, secret, toleranceSec = 300) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=').map((s) => s.trim())));
  const t = Number(parts.t);
  if (!t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;

  const expected = createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(parts.v1, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

// --- tickets -----------------------------------------------------------------
// A serial is <random>.<hmac>. The signature lets the door reject a forged code
// without a database round trip; the database still decides redemption, so a
// valid signature alone never admits anyone.
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: no I, L, O, U

export function newSerial(secret) {
  const bytes = randomBytes(10);
  let body = '';
  for (const b of bytes) body += B32[b % 32];
  return `${body}.${sign(body, secret)}`;
}

export const sign = (body, secret) =>
  createHmac('sha256', secret).update(body).digest('base64url').slice(0, 12);

export function serialIsWellFormed(serial, secret) {
  if (typeof serial !== 'string' || !serial.includes('.')) return false;
  const [body, sig] = serial.split('.');
  if (!body || !sig || body.length !== 10) return false;
  const a = Buffer.from(sign(body, secret), 'utf8');
  const b = Buffer.from(sig, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Human-readable form for will-call: MCT-A1B2C-D3E4F */
export const humanSerial = (serial) => {
  const body = serial.split('.')[0];
  return `MCT-${body.slice(0, 5)}-${body.slice(5, 10)}`;
};

// --- Supabase (PostgREST + RPC) ----------------------------------------------
export async function db(path, { method = 'GET', body, prefer } = {}) {
  requireEnv('SUPABASE_URL', 'SUPABASE_SERVICE_KEY');
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'content-type': 'application/json',
      ...(prefer ? { prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  const data = text ? JSON.parse(text) : null;
  if (!r.ok) {
    const err = new Error(data?.message || `supabase ${r.status}`);
    err.statusCode = 502;
    throw err;
  }
  return data;
}

export const rpc = (fn, args) => db(`rpc/${fn}`, { method: 'POST', body: args });
