/**
 * Tests for the parts where a bug means somebody gets in free, or a forged
 * request mints tickets. Run: node --test test/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  newSerial, sign, serialIsWellFormed, humanSerial, verifyStripeSignature,
} from '../api/_lib.mjs';

const KEY = 'test-signing-key';
const HOOK = 'whsec_test';

const stripeHeader = (payload, secret, t = Math.floor(Date.now() / 1000)) =>
  `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')}`;

test('serials are well formed and verify', () => {
  for (let i = 0; i < 200; i++) {
    const s = newSerial(KEY);
    assert.ok(serialIsWellFormed(s, KEY), `${s} should verify`);
    assert.match(s.split('.')[0], /^[0-9A-HJKMNP-TV-Z]{10}$/, 'body avoids I, L, O, U');
  }
});

test('serials are unique across a large batch', () => {
  const seen = new Set();
  for (let i = 0; i < 20000; i++) seen.add(newSerial(KEY));
  assert.equal(seen.size, 20000, 'no collisions');
});

test('a serial signed with another key is rejected', () => {
  const s = newSerial('some-other-key');
  assert.equal(serialIsWellFormed(s, KEY), false);
});

test('tampered serial bodies are rejected', () => {
  const s = newSerial(KEY);
  const [body, sig] = s.split('.');
  const swapped = `${body.slice(0, 9)}${body[9] === 'A' ? 'B' : 'A'}.${sig}`;
  assert.equal(serialIsWellFormed(swapped, KEY), false);
});

test('truncated and malformed serials are rejected, not thrown on', () => {
  for (const bad of ['', '.', 'abc', 'ABCDEFGHIJ', 'ABCDEFGHIJ.', '.sig', null, undefined, 42, {}]) {
    assert.equal(serialIsWellFormed(bad, KEY), false, `${JSON.stringify(bad)} must be rejected`);
  }
});

test('a signature of the wrong length cannot crash timingSafeEqual', () => {
  const [body] = newSerial(KEY).split('.');
  assert.equal(serialIsWellFormed(`${body}.short`, KEY), false);
  assert.equal(serialIsWellFormed(`${body}.${'x'.repeat(64)}`, KEY), false);
});

test('human serial is readable and derived from the body', () => {
  const s = newSerial(KEY);
  const h = humanSerial(s);
  assert.match(h, /^MCT-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
  assert.equal(h.replace('MCT-', '').replace('-', ''), s.split('.')[0]);
});

test('sign is deterministic', () => {
  assert.equal(sign('ABCDEFGHJK', KEY), sign('ABCDEFGHJK', KEY));
  assert.notEqual(sign('ABCDEFGHJK', KEY), sign('ABCDEFGHJM', KEY));
});

// --- Stripe webhook signature -------------------------------------------------
test('a valid Stripe signature passes', () => {
  const p = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
  assert.equal(verifyStripeSignature(p, stripeHeader(p, HOOK), HOOK), true);
});

test('a signature made with the wrong secret fails', () => {
  const p = '{"id":"evt_1"}';
  assert.equal(verifyStripeSignature(p, stripeHeader(p, 'wrong'), HOOK), false);
});

test('a modified payload fails', () => {
  const p = '{"amount_total":1500}';
  const header = stripeHeader(p, HOOK);
  assert.equal(verifyStripeSignature('{"amount_total":1}', header, HOOK), false);
});

test('an old signature is rejected as a replay', () => {
  const p = '{"id":"evt_1"}';
  const old = Math.floor(Date.now() / 1000) - 3600;
  assert.equal(verifyStripeSignature(p, stripeHeader(p, HOOK, old), HOOK), false);
});

test('a future-dated signature outside tolerance is rejected', () => {
  const p = '{"id":"evt_1"}';
  const future = Math.floor(Date.now() / 1000) + 3600;
  assert.equal(verifyStripeSignature(p, stripeHeader(p, HOOK, future), HOOK), false);
});

test('missing or junk signature headers are rejected', () => {
  const p = '{}';
  for (const h of [undefined, '', 'nonsense', 't=123', 'v1=abc', 't=abc,v1=def']) {
    assert.equal(verifyStripeSignature(p, h, HOOK), false, `${h} must fail`);
  }
});
