#!/usr/bin/env node
// The stop condition for both demos. Exit 0 only when every rule holds.
// Usage: node scripts/check.mjs <loop|graph>
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATEGORIES = ['refund', 'login', 'feature', 'billing', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];
const LANGS = ['sv', 'en', 'el'];
const FIELDS = ['id', 'category', 'priority', 'language', 'escalate', 'reason', 'reply'];
const REFUND_LIMIT_SEK = 500;
const MIN_REPLY_CHARS = 40;

export function parseTicket(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error('missing frontmatter');
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { ...meta, body: m[2] };
}

export function parseAmountSEK(body) {
  const m = body.match(/(\d{1,3}(?:[  ]\d{3})+|\d+)\s*(?:SEK|kr)\b/i);
  return m ? Number(m[1].replace(/[  ]/g, '')) : null;
}

export function validate({ tickets, outputs, customers }) {
  const errors = [];
  const err = (id, msg) => errors.push(`✗ ${id}: ${msg}`);
  const ids = new Set(tickets.map(t => t.id));
  for (const id of Object.keys(outputs)) if (!ids.has(id)) err(id, 'triaged-fil utan matchande ticket i inbox');

  for (const t of tickets) {
    const raw = outputs[t.id];
    if (raw === undefined) { err(t.id, `saknar triaged/<target>/${t.id}.json`); continue; }
    let o;
    try { o = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { err(t.id, 'ogiltig JSON'); continue; }
    for (const f of FIELDS) if (!(f in o)) err(t.id, `saknar fält "${f}"`);
    if (o.id !== t.id) err(t.id, `id "${o.id}" matchar inte filnamnet`);
    if (!CATEGORIES.includes(o.category)) err(t.id, `category "${o.category}" inte i ${CATEGORIES.join('|')}`);
    if (!PRIORITIES.includes(o.priority)) err(t.id, `priority "${o.priority}" inte i ${PRIORITIES.join('|')}`);
    if (!LANGS.includes(o.language)) err(t.id, `language "${o.language}" inte i ${LANGS.join('|')}`);
    else if (o.language !== t.lang) err(t.id, `language "${o.language}" ≠ ticketens lang "${t.lang}"`);
    if (typeof o.escalate !== 'boolean') err(t.id, 'escalate måste vara true/false');
    if (o.category === 'other' && o.escalate !== true) err(t.id, 'category other ⇒ escalate måste vara true');
    const amount = parseAmountSEK(t.body ?? '');
    if (o.category === 'refund' && amount !== null && amount > REFUND_LIMIT_SEK && o.escalate !== true)
      err(t.id, `refund ${amount} SEK > ${REFUND_LIMIT_SEK} ⇒ escalate måste vara true`);
    if (customers[t.from]?.tier === 'enterprise' && o.priority !== 'high')
      err(t.id, `enterprise-kund ⇒ priority måste vara high (fick "${o.priority}")`);
    if (o.escalate === false && (typeof o.reply !== 'string' || o.reply.trim().length < MIN_REPLY_CHARS))
      err(t.id, `ej eskalerad ⇒ reply måste vara ≥ ${MIN_REPLY_CHARS} tecken`);
    if (o.escalate === true && (typeof o.reason !== 'string' || !o.reason.trim()))
      err(t.id, 'eskalerad ⇒ reason måste vara ifylld');
  }
  return errors;
}

export function loadFromDisk(target) {
  const inbox = join(ROOT, 'tickets/inbox');
  const out = join(ROOT, 'triaged', target);
  const tickets = readdirSync(inbox).filter(f => f.endsWith('.md')).sort()
    .map(f => parseTicket(readFileSync(join(inbox, f), 'utf8')));
  const outputs = {};
  if (existsSync(out)) for (const f of readdirSync(out).filter(f => f.endsWith('.json')))
    outputs[basename(f, '.json')] = readFileSync(join(out, f), 'utf8');
  const customers = JSON.parse(readFileSync(join(ROOT, 'tickets/customers.json'), 'utf8'));
  return { tickets, outputs, customers };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = process.argv[2];
  if (!['loop', 'graph'].includes(target)) {
    console.error('Användning: node scripts/check.mjs <loop|graph>');
    process.exit(2);
  }
  const data = loadFromDisk(target);
  const errors = validate(data);
  const n = data.tickets.length;
  if (errors.length) {
    const failed = new Set(errors.map(e => e.slice(2, e.indexOf(':'))));
    console.error(errors.join('\n'));
    console.error(`\n${n - failed.size}/${n} tickets OK · ${errors.length} problem · mål: triaged/${target}/`);
    process.exit(1);
  }
  console.log(`✓ ALLA TICKETS TRIAGERADE (${n}/${n}) · triaged/${target}/`);
}
