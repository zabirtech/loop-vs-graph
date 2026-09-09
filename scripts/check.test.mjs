import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, parseAmountSEK, parseTicket } from './check.mjs';

const tickets = [
  { id: 'T-001', from: 'a@x.se', lang: 'sv', body: 'Jag vill ha tillbaka 1 200 SEK.' },
  { id: 'T-002', from: 'e@ent.com', lang: 'en', body: 'Cannot log in.' },
  { id: 'T-005', from: 'g@x.gr', lang: 'el', body: 'GDPR' },
];
const customers = { 'e@ent.com': { tier: 'enterprise' }, 'a@x.se': { tier: 'pro' } };
const ok = {
  'T-001': { id: 'T-001', category: 'refund', priority: 'medium', language: 'sv', escalate: true, reason: 'över 500 SEK', reply: '' },
  'T-002': { id: 'T-002', category: 'login', priority: 'high', language: 'en', escalate: false, reason: '', reply: 'Hi James, we are looking into the SSO redirect loop right now and will update you within the hour.' },
  'T-005': { id: 'T-005', category: 'other', priority: 'medium', language: 'el', escalate: true, reason: 'GDPR → DPO', reply: '' },
};
const patch = (id, p) => ({ ...ok, [id]: { ...ok[id], ...p } });
const first = (outputs) => validate({ tickets, outputs, customers })[0];

test('valid set passes', () => assert.deepEqual(validate({ tickets, outputs: ok, customers }), []));
test('missing file fails', () => { const { 'T-005': _, ...rest } = ok; assert.match(first(rest), /T-005: saknar triaged/); });
test('extra file fails', () => assert.match(first({ ...ok, 'T-099': ok['T-001'] }), /T-099: .*utan matchande ticket/));
test('invalid json string fails', () => assert.match(first({ ...ok, 'T-001': '{nope' }), /T-001: ogiltig JSON/));
test('bad enum fails', () => assert.match(first(patch('T-002', { category: 'sso' })), /category "sso"/));
test('id mismatch fails', () => assert.match(first(patch('T-002', { id: 'T-003' })), /matchar inte filnamnet/));
test('language mismatch fails', () => assert.match(first(patch('T-002', { language: 'sv' })), /language "sv" ≠ ticketens lang "en"/));
test('other without escalate fails', () => assert.match(first(patch('T-005', { escalate: false, reply: 'x'.repeat(50) })), /other ⇒ escalate/));
test('refund over limit without escalate fails', () => assert.match(first(patch('T-001', { escalate: false, reply: 'x'.repeat(50) })), /refund 1200 SEK > 500/));
test('refund under limit may skip escalate', () => {
  const t = [{ id: 'T-001', from: 'a@x.se', lang: 'sv', body: 'Vill ha 249 kr tillbaka.' }];
  const o = { 'T-001': { ...ok['T-001'], escalate: false, reply: 'x'.repeat(50) } };
  assert.deepEqual(validate({ tickets: t, outputs: o, customers }), []);
});
test('enterprise not high fails', () => assert.match(first(patch('T-002', { priority: 'medium' })), /enterprise-kund ⇒ priority måste vara high/));
test('short reply when not escalated fails', () => assert.match(first(patch('T-002', { reply: 'ok' })), /reply måste vara ≥ 40 tecken/));
test('empty reason when escalated fails', () => assert.match(first(patch('T-001', { reason: '' })), /reason måste vara ifylld/));
test('accepts already-parsed objects and JSON strings', () => assert.deepEqual(validate({ tickets, outputs: { ...ok, 'T-001': JSON.stringify(ok['T-001']) }, customers }), []));

test('parseAmountSEK', () => {
  assert.equal(parseAmountSEK('1 200 SEK'), 1200);
  assert.equal(parseAmountSEK('249 kr den 1 september'), 249);
  assert.equal(parseAmountSEK('inga pengar'), null);
});
test('parseTicket keeps colons inside values', () => {
  const t = parseTicket('---\nid: T-003\nfrom: e@x.se\nsubject: Förslag: mörkt läge\nlang: sv\nreceived: 2026-09-08T11:05:00+02:00\n---\nHej!\n');
  assert.equal(t.subject, 'Förslag: mörkt läge');
  assert.equal(t.received, '2026-09-08T11:05:00+02:00');
  assert.equal(t.body.trim(), 'Hej!');
});
