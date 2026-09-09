# Loop vs Graf Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A repo Sabir can run live in Claude Code on Friday to show loop engineering (Ralph loop) vs graph engineering (Workflow) on the same support-triage task, plus a Swedish animated web artifact with presenter cue cards.

**Architecture:** Fixtures (5 tickets, CRM, policy) + a Node validator that is the stop condition for both approaches. Loop = one Ralph prompt pointing at `TRIAGE.md`, output to `triaged/loop/`. Graph = a saved Workflow script `.claude/workflows/triage.js`, output to `triaged/graph/`. A single-file HTML artifact animates six scenes and holds the cue cards; the same cue text lives in `CUE-CARDS.md` and a printable `cue-cards.html`.

**Tech Stack:** Node 20 (ESM, `node:test`, no deps), Claude Code slash commands + Workflow tool + ralph-loop plugin, vanilla HTML/CSS/SVG/JS (no CDN), headless Chrome for PDF.

**Spec:** `docs/superpowers/specs/2026-09-09-loop-vs-graph-demo-design.md`

## Global Constraints

- Node `>=20`, zero runtime dependencies, `"type": "module"`.
- All user-facing demo text (tickets except T-002/T-005, policy, TRIAGE.md, check output, artifact UI, cue cards) in **Swedish**. README in English. Code comments English.
- Categories exactly `refund | login | feature | billing | other`; priorities `low | medium | high`; languages `sv | en | el`. Refund limit `500` SEK. Min reply `40` chars.
- Completion promise text exactly `ALLA TICKETS TRIAGERADE`. `check.mjs` success line exactly `✓ ALLA TICKETS TRIAGERADE (n/n)`.
- Loop writes `triaged/loop/`, graph writes `triaged/graph/`. Never share an output dir.
- Artifact: single file, no external requests, dark stage, loop accent amber `#f5a524`, graph accent cyan `#22c8e0`. Works when opened as `file://`.
- Commit after every task. Commit trailer:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Hyh2BTM9RED5AuG7Audvpp
  ```

---

### Task 1: Scaffold + fixtures

**Files:**
- Create: `package.json`, `tickets/inbox/T-001.md` … `T-005.md`, `tickets/customers.json`, `tickets/policy.md`, `TRIAGE.md`, `triaged/loop/.gitkeep`, `triaged/graph/.gitkeep`, `scripts/reset.sh`
- Modify: `.gitignore` (already has `triaged/*/*.json`)

**Interfaces:**
- Produces: ticket frontmatter keys `id, from, subject, lang, received`; `customers.json` keyed by email with `{name, tier, orders, notes}`; policy rules that Task 2 encodes.

- [ ] **Step 1: package.json**

```json
{
  "name": "loop-vs-graph",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Loop engineering vs graph engineering — a Claude Code show-and-tell",
  "scripts": {
    "check:loop": "node scripts/check.mjs loop",
    "check:graph": "node scripts/check.mjs graph",
    "diff": "node scripts/diff.mjs",
    "reset": "sh scripts/reset.sh",
    "test": "node --test scripts/check.test.mjs"
  },
  "engines": { "node": ">=20" }
}
```

- [ ] **Step 2: Tickets**

`tickets/inbox/T-001.md`
```markdown
---
id: T-001
from: anna.lindqvist@example.se
subject: Återbetalning – leveransen kom aldrig
lang: sv
received: 2026-09-08T08:12:00+02:00
---
Hej,

Jag beställde en espressomaskin (order #48211) den 22 augusti och den skulle levereras inom 3 dagar. Nu har det gått över två veckor och paketet har fortfarande inte kommit. Spårningen har stått stilla sedan den 25:e.

Jag vill ha tillbaka pengarna, 1 200 SEK, till samma kort som jag betalade med.

Mvh
Anna Lindqvist
```

`tickets/inbox/T-002.md`
```markdown
---
id: T-002
from: james.okafor@northwind-industries.com
subject: Cannot log in – SSO redirect loop
lang: en
received: 2026-09-08T09:40:00+02:00
---
Hi,

Since this morning none of our team (about 40 users) can log in. After entering credentials on our Okta page we get redirected back to your login screen, over and over. Clearing cookies doesn't help. Incognito doesn't help.

We have a board demo at 14:00 today and need access.

James Okafor
IT Manager, Northwind Industries
```

`tickets/inbox/T-003.md`
```markdown
---
id: T-003
from: erik.johansson@example.se
subject: Förslag: mörkt läge i appen
lang: sv
received: 2026-09-08T11:05:00+02:00
---
Hej!

Älskar appen, men den är väldigt ljus på kvällen. Skulle ni kunna lägga till ett mörkt läge? Gärna ett som följer systeminställningen automatiskt.

Inget akut, bara en önskan.

/Erik
```

`tickets/inbox/T-004.md`
```markdown
---
id: T-004
from: fatima.rahim@example.se
subject: Dubbeldebiterad i september
lang: sv
received: 2026-09-08T13:27:00+02:00
---
Hej,

På mitt kontoutdrag ser jag två dragningar på 249 kr den 1 september, båda från er. Jag har bara ett Pro-abonnemang. Kan ni kolla vad som hänt och återföra den ena?

Kundnummer: 10944

Tack,
Fatima
```

`tickets/inbox/T-005.md`
```markdown
---
id: T-005
from: eleni.papadopoulou@example.gr
subject: Αίτημα διαγραφής προσωπικών δεδομένων (GDPR)
lang: el
received: 2026-09-08T15:50:00+02:00
---
Καλησπέρα,

Σύμφωνα με το άρθρο 17 του GDPR, ζητώ την πλήρη διαγραφή όλων των προσωπικών μου δεδομένων από τα συστήματά σας, συμπεριλαμβανομένου του ιστορικού παραγγελιών και των αντιγράφων ασφαλείας.

Παρακαλώ επιβεβαιώστε εγγράφως εντός 30 ημερών.

Με εκτίμηση,
Ελένη Παπαδοπούλου
```

- [ ] **Step 3: customers.json**

```json
{
  "anna.lindqvist@example.se": { "name": "Anna Lindqvist", "tier": "pro", "orders": 3, "notes": "Order #48211 visar 'in transit' sedan 2026-08-25." },
  "james.okafor@northwind-industries.com": { "name": "James Okafor", "tier": "enterprise", "orders": 0, "notes": "Northwind Industries, 40 seats, SSO via Okta. Account manager: Lisa Berg." },
  "erik.johansson@example.se": { "name": "Erik Johansson", "tier": "free", "orders": 0, "notes": "" },
  "fatima.rahim@example.se": { "name": "Fatima Rahim", "tier": "pro", "orders": 1, "notes": "Kundnummer 10944. Två dragningar på 249 SEK 2026-09-01 syns i billing-loggen." },
  "eleni.papadopoulou@example.gr": { "name": "Eleni Papadopoulou", "tier": "free", "orders": 2, "notes": "" }
}
```

- [ ] **Step 4: policy.md**

```markdown
# Support-policy (triage)

## Kategorier
Exakt en av:
- `refund` – kunden vill ha pengar tillbaka för en order
- `login` – kunden kan inte logga in (lösenord, SSO, redirect-loopar)
- `feature` – förslag eller önskemål om ny funktion
- `billing` – fakturor, dubbeldebitering, kvitton, abonnemangsavgifter
- `other` – allt som inte passar exakt i någon av ovanstående

## Eskalering (`escalate: true`)
- `other` eskaleras ALLTID. Support skriver inget svar; ärendet går till rätt team.
- Juridik, GDPR och dataskydd hanteras aldrig av support → eskalera till DPO.
- Återbetalning över 500 SEK kräver godkännande → eskalera.
- Vid eskalering: `reply` lämnas tom (`""`), `reason` förklarar kort varför.

## Prioritet
- Kund med tier `enterprise` (se `tickets/customers.json`) → `high`
- Kunden är blockerad från att använda tjänsten (t.ex. kan inte logga in) → minst `medium`
- Önskemål/förslag → `low`
- Annars → `medium`

## Svar (`reply`)
- Skriv på kundens språk – samma som `lang` i ticketens frontmatter.
- Kort, vänligt, konkret nästa steg. Minst två meningar.
- Skriv inget svar om ärendet eskaleras.
```

- [ ] **Step 5: TRIAGE.md**

```markdown
# Uppgift: triagera inboxen (loop-demo)

Du är support-triage. Målet: varje ticket i `tickets/inbox/` har en fil `triaged/loop/<id>.json` som klarar `npm run check:loop`.

## Gör så här
1. Läs `tickets/policy.md` och `tickets/customers.json`.
2. Läs varje ticket i `tickets/inbox/`.
3. Skriv `triaged/loop/<id>.json` per ticket, exakt detta format:

```json
{
  "id": "T-001",
  "category": "refund | login | feature | billing | other",
  "priority": "low | medium | high",
  "language": "sv | en | el",
  "escalate": false,
  "reason": "kort varför (obligatorisk om escalate är true)",
  "reply": "svar till kunden på kundens språk (tom sträng om escalate är true)"
}
```

4. Kör `npm run check:loop`. Läs felraderna. Rätta. Kör igen.
5. När `npm run check:loop` avslutas med exit 0 och skriver `✓ ALLA TICKETS TRIAGERADE` – och först då – avsluta ditt svar med exakt:

<promise>ALLA TICKETS TRIAGERADE</promise>

Ljug inte om promisen. Om check inte är grön: fortsätt.
```

- [ ] **Step 6: reset.sh + gitkeeps**

`scripts/reset.sh`
```sh
#!/bin/sh
# Reset between demo runs: outputs from both approaches + Ralph state.
set -e
cd "$(dirname "$0")/.."
rm -f triaged/loop/*.json triaged/graph/*.json .claude/ralph-loop.local.md
echo "✓ triaged/loop, triaged/graph och Ralph-state rensade"
```

Run: `mkdir -p triaged/loop triaged/graph && touch triaged/loop/.gitkeep triaged/graph/.gitkeep && chmod +x scripts/reset.sh`

- [ ] **Step 7: Verify**

Run: `npm run reset && ls tickets/inbox | wc -l && node -e "JSON.parse(require('fs').readFileSync('tickets/customers.json','utf8')); console.log('json ok')"`
Expected: reset message, `5`, `json ok`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold, ticket fixtures, policy, TRIAGE.md, reset script"
```

---

### Task 2: Validator `check.mjs` (TDD)

**Files:**
- Create: `scripts/check.mjs`, `scripts/check.test.mjs`

**Interfaces:**
- Produces: `validate({tickets, outputs, customers}) → string[]` (Swedish `✗ <id>: <msg>` lines, empty = pass); `parseTicket(md) → {id, from, subject, lang, received, body}`; `parseAmountSEK(body) → number|null`. CLI: `node scripts/check.mjs <loop|graph>`; exit 0 + `✓ ALLA TICKETS TRIAGERADE (n/n)`, else exit 1 + error lines + `k/n tickets OK`.

- [ ] **Step 1: Write failing tests** — `scripts/check.test.mjs`

```js
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
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test`
Expected: fails — `Cannot find module './check.mjs'`.

- [ ] **Step 3: Implement** — `scripts/check.mjs`

```js
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
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test`
Expected: all 16 tests pass.

- [ ] **Step 5: CLI smoke**

Run: `npm run check:loop; echo "exit=$?"`
Expected: five `✗ T-00X: saknar triaged/<target>/T-00X.json` lines, `0/5 tickets OK`, `exit=1`.

Run: `mkdir -p /tmp/lvg && node -e "
const fs=require('fs');const o={'T-001':{id:'T-001',category:'refund',priority:'medium',language:'sv',escalate:true,reason:'>500',reply:''},'T-002':{id:'T-002',category:'login',priority:'high',language:'en',escalate:false,reason:'',reply:'Hi James, we are on it and will update you within the hour with a fix or workaround.'},'T-003':{id:'T-003',category:'feature',priority:'low',language:'sv',escalate:false,reason:'',reply:'Hej Erik! Tack för förslaget – mörkt läge ligger på vår lista och vi hör av oss när det finns.'},'T-004':{id:'T-004',category:'billing',priority:'medium',language:'sv',escalate:false,reason:'',reply:'Hej Fatima! Vi ser dubbeldragningen och återför 249 kr inom 3–5 bankdagar. Ursäkta besväret.'},'T-005':{id:'T-005',category:'other',priority:'medium',language:'el',escalate:true,reason:'GDPR → DPO',reply:''}};for(const[k,v]of Object.entries(o))fs.writeFileSync('triaged/loop/'+k+'.json',JSON.stringify(v,null,2));" && npm run check:loop; echo "exit=$?"; npm run reset`
Expected: `✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/loop/`, `exit=0`, then reset message.

- [ ] **Step 6: Commit**

```bash
git add scripts/check.mjs scripts/check.test.mjs && git commit -m "feat: check.mjs validator — the stop condition — with tests"
```

---

### Task 3: diff.mjs, Claude Code settings, slash command, Workflow script

**Files:**
- Create: `scripts/diff.mjs`, `.claude/settings.json`, `.claude/commands/triage-graph.md`, `.claude/workflows/triage.js`

**Interfaces:**
- Consumes: `npm run check:graph` exit code/output; `tickets/policy.md`, `tickets/customers.json`.
- Produces: saved workflow named `triage`; slash command `/triage-graph`.

- [ ] **Step 1: diff.mjs**

```js
// Side-by-side view of both runs: category/priority and an escalation flag per ticket.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const load = (dir) => {
  const p = join(ROOT, 'triaged', dir);
  if (!existsSync(p)) return {};
  return Object.fromEntries(readdirSync(p).filter(f => f.endsWith('.json')).map(f => {
    const id = f.replace(/\.json$/, '');
    try { return [id, JSON.parse(readFileSync(join(p, f), 'utf8'))]; } catch { return [id, null]; }
  }));
};
const L = load('loop'), G = load('graph');
const ids = [...new Set([...Object.keys(L), ...Object.keys(G)])].sort();
const cell = (o) => o ? `${o.category}/${o.priority}${o.escalate ? ' ⚠ eskalerad' : ''}` : '—';
console.log(`${'ticket'.padEnd(8)}${'loop'.padEnd(30)}graph`);
console.log('-'.repeat(68));
for (const id of ids) console.log(`${id.padEnd(8)}${cell(L[id]).padEnd(30)}${cell(G[id])}`);
if (!ids.length) console.log('(inga körningar ännu – kör loopen och/eller grafen först)');
```

Run: `npm run diff` → header + `(inga körningar ännu …)`.

- [ ] **Step 2: .claude/settings.json** (no permission prompts during the live demo)

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run check:*)",
      "Bash(npm run diff)",
      "Bash(npm run reset)",
      "Bash(npm test)",
      "Bash(node scripts/check.mjs:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Read(tickets/**)",
      "Read(triaged/**)",
      "Read(TRIAGE.md)",
      "Write(triaged/**)",
      "Edit(triaged/**)"
    ]
  }
}
```

- [ ] **Step 3: .claude/commands/triage-graph.md**

```markdown
---
description: Triagera inboxen som en explicit graf (Workflow-demo)
---
Run the saved workflow named `triage` (file `.claude/workflows/triage.js`) with the Workflow tool: `Workflow({ name: "triage" })`. This slash command is the user's explicit opt-in to multi-agent orchestration.

Do not pre-process or "help" the workflow. When it returns, run `npm run check:graph` and show its output verbatim. If check fails, do NOT fix files by hand — name which node produced the bad output. The graph is the accountable structure; that is the point of the demo.
```

- [ ] **Step 4: .claude/workflows/triage.js**

```js
export const meta = {
  name: 'triage',
  description: 'Triagera support-inboxen som en explicit graf: Inbox → Klassificera → Berika → Svara|Eskalera → Verifiera',
  whenToUse: 'Demo av graph engineering. Kör via /triage-graph.',
  phases: [
    { title: 'Inbox', detail: 'lista tickets' },
    { title: 'Klassificera', detail: 'en nod per ticket', model: 'haiku' },
    { title: 'Berika', detail: 'kund ∥ policy, parallellt per ticket', model: 'haiku' },
    { title: 'Svara', detail: 'skriv svar på kundens språk' },
    { title: 'Eskalera', detail: 'kanten du lägger till efter att den bitit dig' },
    { title: 'Verifiera', detail: 'npm run check:graph' },
  ],
}

// ── Node contracts (schemas) ──────────────────────────────────────────────
const OUT = 'triaged/graph'
const INBOX_SCHEMA = { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } }, required: ['ids'] }
const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['refund', 'login', 'feature', 'billing', 'other'] },
    language: { type: 'string', enum: ['sv', 'en', 'el'] },
    from: { type: 'string' },
    refundAmountSEK: { type: ['number', 'null'] },
    summary: { type: 'string' },
  },
  required: ['category', 'language', 'from', 'refundAmountSEK', 'summary'],
}
const CUSTOMER_SCHEMA = {
  type: 'object',
  properties: { tier: { type: 'string', enum: ['free', 'pro', 'enterprise', 'unknown'] }, name: { type: 'string' }, notes: { type: 'string' } },
  required: ['tier', 'name', 'notes'],
}
const POLICY_SCHEMA = {
  type: 'object',
  properties: { mustEscalate: { type: 'boolean' }, priority: { type: 'string', enum: ['low', 'medium', 'high'] }, reason: { type: 'string' } },
  required: ['mustEscalate', 'priority', 'reason'],
}
const WRITE_SCHEMA = { type: 'object', properties: { path: { type: 'string' }, escalate: { type: 'boolean' } }, required: ['path', 'escalate'] }
const VERIFY_SCHEMA = { type: 'object', properties: { exitCode: { type: 'number' }, output: { type: 'string' } }, required: ['exitCode', 'output'] }

// ── Node: Inbox ───────────────────────────────────────────────────────────
phase('Inbox')
const inbox = await agent(
  'List the ticket ids in tickets/inbox/ (filenames without .md, sorted). Return {ids}.',
  { label: 'inbox', phase: 'Inbox', schema: INBOX_SCHEMA, effort: 'low' },
)
const ids = inbox?.ids ?? []
log(`${ids.length} tickets i inboxen → pipeline, ingen barriär mellan noder`)

// ── Per-ticket pipeline: Klassificera → Berika → Svara | Eskalera ─────────
const results = await pipeline(
  ids,

  // Node: Klassificera
  (id) => agent(
    `Read tickets/inbox/${id}.md and tickets/policy.md. Classify the ticket into exactly one category from the policy; use "other" if it does not fit exactly (legal/GDPR is always "other"). language = the ticket's frontmatter lang. from = frontmatter from (the email). refundAmountSEK = the amount if the customer asks for money back for an order, else null. summary = one sentence. Return data only.`,
    { label: `klassificera:${id}`, phase: 'Klassificera', schema: CLASSIFY_SCHEMA, model: 'haiku', effort: 'low' },
  ),

  // Node: Berika — two branches, genuinely parallel
  (cls, id) => parallel([
    () => agent(
      `Look up the key "${cls.from}" in tickets/customers.json. Return tier ("unknown" if missing), name, notes.`,
      { label: `kund:${id}`, phase: 'Berika', schema: CUSTOMER_SCHEMA, model: 'haiku', effort: 'low' },
    ),
    () => agent(
      `Read tickets/policy.md. Ticket ${id}: category=${cls.category}, refundAmountSEK=${cls.refundAmountSEK}, summary="${cls.summary}". Decide mustEscalate and priority strictly per the policy. Customer tier is NOT known here (applied later in code), so ignore the enterprise rule. reason = one short Swedish sentence if escalating, else "".`,
      { label: `policy:${id}`, phase: 'Berika', schema: POLICY_SCHEMA, model: 'haiku', effort: 'low' },
    ),
  ]).then(([cust, pol]) => ({ cls, cust, pol })),

  // Node: Svara | Eskalera — the edge is code
  (ctx, id) => {
    if (!ctx.cust || !ctx.pol) return null
    const priority = ctx.cust.tier === 'enterprise' ? 'high' : ctx.pol.priority   // enterprise rule lives here
    const base = { id, category: ctx.cls.category, priority, language: ctx.cls.language }

    // ← the edge you only add after it bit you
    if (ctx.cls.category === 'other' || ctx.pol.mustEscalate) {
      const json = { ...base, escalate: true, reason: ctx.pol.reason || 'Utanför supportens kategorier – eskaleras', reply: '' }
      return agent(
        `Create the file ${OUT}/${id}.json containing exactly this JSON, pretty-printed with 2 spaces: ${JSON.stringify(json)}. Return {path, escalate: true}.`,
        { label: `eskalera:${id}`, phase: 'Eskalera', schema: WRITE_SCHEMA, effort: 'low' },
      )
    }
    return agent(
      `Read tickets/inbox/${id}.md and tickets/policy.md. Customer: ${ctx.cust.name} (tier ${ctx.cust.tier}). CRM notes: ${ctx.cust.notes || 'none'}. Write a reply to the customer in language "${ctx.cls.language}" following the policy's "Svar" section: friendly, concrete next step, at least two sentences, at least 60 characters. Then create ${OUT}/${id}.json (pretty-printed) with fields ${JSON.stringify(base)} plus escalate: false, reason: "", reply: <your reply>. Return {path, escalate: false}.`,
      { label: `svara:${id}`, phase: 'Svara', schema: WRITE_SCHEMA },
    )
  },
)

// ── Node: Verifiera — a barrier is correct here: it needs every file on disk ─
phase('Verifiera')
const verify = await agent(
  'Run `npm run check:graph` in the repo root. Return exitCode and the complete output verbatim.',
  { label: 'verifiera', phase: 'Verifiera', schema: VERIFY_SCHEMA, effort: 'low' },
)

return {
  tickets: ids.length,
  written: results.filter(Boolean).length,
  escalated: results.filter(r => r && r.escalate).length,
  check: verify,
}
```

- [ ] **Step 5: Static checks**

Run: `node --check .claude/workflows/triage.js && node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))" && echo ok`
Expected: `ok`. (`--check` parses ESM incl. top-level await; `phase/agent/pipeline/parallel/log` are runtime globals, unresolved names are fine for a syntax check.)

- [ ] **Step 6: Commit**

```bash
git add scripts/diff.mjs .claude && git commit -m "feat: graph workflow, /triage-graph command, demo permissions, diff script"
```

---

### Task 4: Test-run the graph end-to-end

**Files:**
- Create: `demo/runs/graph-run.md`, `demo/runs/README.md`
- Modify (if needed): `.claude/workflows/triage.js`

- [ ] **Step 1: Reset and run**

Run: `npm run reset`. Then call the Workflow tool: `Workflow({ name: "triage" })` (user opted in via plan approval). Wait for the task notification. If `model: 'haiku'` is rejected, remove the `model` opts and the `model` keys in `meta.phases`, then rerun with `resumeFromRunId`.

- [ ] **Step 2: Verify**

Run: `npm run check:graph; echo "exit=$?"; npm run diff; cat triaged/graph/T-005.json`
Expected: `✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/graph/`, `exit=0`. T-005 → `other`, `escalate: true`, Greek not required in reason. T-001 → `escalate: true`. T-002 → `priority: high`.

If check fails: read the failing node's output in the workflow transcript dir (`journal.jsonl`), tighten that node's prompt only, rerun. Do not hand-edit outputs.

- [ ] **Step 3: Save the run as ripcord**

Write `demo/runs/graph-run.md`: heading, the exact command (`/triage-graph`), the workflow's returned JSON, the `npm run check:graph` output, `npm run diff` output, and the five JSON files inline. Write `demo/runs/README.md`:

```markdown
# Förkörda resultat (ripcord)

Om nätet dör på scen: visa dessa istället för att köra live.

- `graph-run.md` – en komplett körning av `/triage-graph` (Workflow) med check-utskrift.
- `loop-run.md` – din körning av Ralph-loopen. Skapa den torsdag kväll:
  1. `npm run reset`
  2. Starta `claude` i repot, kör raden från CUE-CARDS.md kort 2.
  3. När loopen är klar: `/export` i Claude Code → spara som `demo/runs/loop-run.md`.
  4. Klistra in `npm run check:loop`-utskriften längst ner.
```

- [ ] **Step 4: Reset and commit**

```bash
npm run reset && git add demo/runs .claude/workflows/triage.js && git commit -m "test: end-to-end graph run recorded as ripcord"
```

---

### Task 5: Cue cards (Markdown + printable HTML + PDF)

**Files:**
- Create: `CUE-CARDS.md`, `demo/cue-cards.html`, `demo/cue-cards.pdf`

**Interfaces:**
- Produces: the canonical cue text, reused verbatim in Task 6's `CUES` array.

- [ ] **Step 1: CUE-CARDS.md**

```markdown
# Cue cards – Loop vs Graf (12 min, svenska)

Tangenter i artifacten: ←/→ scen · Space spela · R om · N stödord · F fullskärm · E lägg till kant (scen 4)

## Kort 0 · Innan du börjar
- Terminal A och B öppna i repot, `claude` startat i båda. `npm run reset` körd.
- Artifact öppen i Chrome, F för fullskärm, presenter-panelen AV.
- Nät? Om nej: öppna `demo/runs/` – kör bara artifacten.
- Klocka på. Mål 12 min.

## Kort 1 · Hook (0:00–1:00) · Scen 1, stilla
**Säg:** Samma uppgift: triagera fem supportärenden. Två sätt att bygga agenten. Loop: en prompt och ett stoppvillkor. Graf: jag ritar noderna själv. Frågan är inte vilket som är bäst – utan vad du vet i förväg.
**Gör:** Ingenting ännu.

## Kort 2 · Loopen (1:00–3:00) · Scen 1, Space
**Säg:** Prompt + stoppvillkor. Modellen väljer vägen. Tänk → Agera → Observera → Klar? Claude Code är redan en loop – Ralph gör loopen yttre och explicit: samma prompt igen tills promisen är sann. Min artefakt är stoppvillkoret, inte vägen.
**Gör:** Terminal A:
`/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8`
Enter. Låt köra. Tillbaka till artifacten.
**Om det går fel:** Visa `demo/runs/loop-run.md`.

## Kort 3 · Grafen (3:00–5:00) · Scen 2, Space
**Säg:** Jag ritar noderna: Inbox → Klassificera → Kund ∥ Policy → Svara eller Eskalera → Verifiera. Varje nod är ett bundet agentanrop med schema. Kanterna är kod. Parallellism gratis. Faserna syns live.
**Gör:** Terminal B: `/triage-graph` Enter. Peka på faserna. Tillbaka.
**Om det går fel:** Visa `demo/runs/graph-run.md`.

## Kort 4 · Sida vid sida (5:00–6:30) · Scen 3, Space
**Säg:** Fyra vanliga ärenden. Båda gröna. Loopen tog ett antal steg jag inte visste i förväg. Grafen tog exakt så många som jag ritade. Kostnad: loop okänd, graf bunden.

## Kort 5 · Edge case (6:30–8:00) · Scen 4, Space, sen E
**Säg:** Ticket fem. Grekiska. GDPR. Ingen kategori passar. Loopen: check säger nej, ett varv till, landar på other + eskalera. Grafen: Klassificera säger "other" – och det finns ingen kant. Stopp. *(E)* Kanten du lägger till efter att den bitit dig. Grafen kräver att du såg det komma. Loopen kräver att du litar på modellen.

## Kort 6 · Tillbaka till terminalerna (8:00–10:00)
**Gör:** Terminal A: scrolla, visa varven. `npm run check:loop`. Terminal B: fasloggen. `npm run check:graph`. Sen `npm run diff`.
**Säg:** Två gröna. Två helt olika spår. Loopens spår läser du i efterhand. Grafens spår ritade du i förväg.
**Om det går fel:** `npm run diff` funkar på förkörda filer.

## Kort 7 · Hybrid + när använda vad (10:00–12:00) · Scen 5 Space, sen scen 6 Space
**Säg:** Zooma in i en nod – där sitter en loop. Varje agent()-nod i Workflow ÄR en Claude Code-loop. Struktur utanpå, frihet inuti. Tabellen. Takeaway: Graf för det du vet. Loop för det du inte vet. Oftast: graf med loopar i noderna.
**Fråga till rummet:** Var i era pipelines har ni loopar som borde vara grafer – och grafer som borde vara loopar?
```

- [ ] **Step 2: demo/cue-cards.html** — same text, print-first

Structure: `<article class="card">` per Kort with `<h2>`, `<p class="meta">` (time · scene), `<dl>` for Säg/Gör/Om det går fel. CSS:

```css
@page { size: A5 landscape; margin: 12mm; }
html { font: 16px/1.4 -apple-system, system-ui, sans-serif; color: #111; background: #fff; }
body { margin: 0; }
.card { page-break-after: always; min-height: 100vh; padding: 20px 28px; box-sizing: border-box; border-bottom: 1px dashed #ccc; }
.card:last-child { page-break-after: auto; }
h2 { font-size: 22px; margin: 0 0 4px; }
.meta { color: #666; margin: 0 0 12px; font-size: 14px; }
dt { font-weight: 700; margin-top: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: .06em; color: #444; }
dd { margin: 2px 0 0; font-size: 17px; }
code { font: 14px ui-monospace, SFMono-Regular, Menlo, monospace; background: #f2f2f2; padding: 1px 4px; border-radius: 3px; }
@media screen { .card { min-height: auto; max-width: 720px; margin: 24px auto; box-shadow: 0 2px 12px rgba(0,0,0,.1); border-radius: 8px; } }
```

- [ ] **Step 3: PDF**

Run: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$PWD/demo/cue-cards.pdf" "file://$PWD/demo/cue-cards.html" && ls -la demo/cue-cards.pdf`
Expected: PDF > 20 KB. Open with `Read` (pages 1-2) to eyeball layout. If Chrome missing, use the `pdf` skill (reportlab) as fallback.

- [ ] **Step 4: Commit**

```bash
git add CUE-CARDS.md demo/cue-cards.html demo/cue-cards.pdf && git commit -m "docs: Swedish cue cards as markdown, printable html and pdf"
```

---

### Task 6: The artifact `demo/loop-vs-graf.html`

**REQUIRED SUB-SKILL before writing:** `artifact-design`. Then `browser-automation` to verify.

**Files:**
- Create: `demo/loop-vs-graf.html`

**Interfaces:**
- Consumes: cue text from `CUE-CARDS.md` (Kort 1–7 → `CUES[0..5]`, Kort 6 merged into scene 4's panel as "Terminal"-line).
- Produces: a standalone page; a wrapper-stripped copy is published in Task 7.

**Design brief (fixed):** dark stage `#0e1116`, panel `#161b23`, text `#e6e9ef`, muted `#8b94a5`, loop amber `#f5a524`, graph cyan `#22c8e0`, ok green `#3ddc84`, fail red `#ff5c5c`. Fonts: system sans for UI, `ui-monospace` for log lines. Stage graphics are one `<svg viewBox="0 0 1200 620">` per scene, scaled to fit. Type in SVG ≥ 22px at viewBox scale. Every animation ≤ 25 s then idles. No autoplay across scenes.

- [ ] **Step 1: Skeleton + CSS + engine**

```html
<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Loop vs Graf</title>
<style>
:root{--bg:#0e1116;--panel:#161b23;--line:#242b36;--fg:#e6e9ef;--mut:#8b94a5;--loop:#f5a524;--graph:#22c8e0;--ok:#3ddc84;--bad:#ff5c5c}
*{box-sizing:border-box}
html,body{height:100%;margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 -apple-system,system-ui,Segoe UI,Roboto,sans-serif}
body{display:grid;grid-template-rows:auto 1fr auto;grid-template-columns:1fr auto;height:100dvh}
header{grid-column:1/-1;display:flex;align-items:center;gap:20px;padding:10px 18px;border-bottom:1px solid var(--line)}
.brand{font-weight:700;font-size:18px;letter-spacing:.02em}.brand .l{color:var(--loop)}.brand .g{color:var(--graph)}.brand .vs{color:var(--mut);font-weight:400;margin:0 6px}
nav{display:flex;gap:6px;margin-left:auto}
nav button,.ctl button{background:transparent;color:var(--mut);border:1px solid var(--line);border-radius:8px;padding:6px 10px;font:inherit;cursor:pointer}
nav button.on{color:var(--fg);border-color:var(--fg)}
.ctl{display:flex;gap:6px}
main{position:relative;overflow:hidden;padding:12px 18px}
.scene{position:absolute;inset:12px 18px;display:none;flex-direction:column;gap:10px}
.scene.on{display:flex}
.scene h1{margin:0;font-size:clamp(22px,3vw,34px);font-weight:700}
.scene h1 small{display:block;color:var(--mut);font-size:.5em;font-weight:400;margin-top:2px}
.stage{flex:1;min-height:0;display:grid;place-items:center}
.stage svg{width:100%;height:100%;max-height:100%}
.caption{min-height:1.6em;color:var(--fg);font-size:clamp(16px,1.8vw,24px);text-align:center;opacity:0;transition:opacity .5s}
.caption.show{opacity:1}
aside{grid-row:2/4;width:400px;border-left:1px solid var(--line);background:var(--panel);padding:16px 18px;overflow:auto;font-size:15px}
aside[hidden]{display:none}
aside h2{margin:0 0 2px;font-size:17px}aside .t{color:var(--mut);margin-bottom:12px}
aside h3{margin:14px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
aside ul{margin:0;padding-left:18px}aside li{margin:4px 0}
aside code{font:13px ui-monospace,Menlo,monospace;background:#0b0e13;padding:2px 6px;border-radius:5px;display:inline-block;margin-top:4px;word-break:break-all}
aside .clock{font:600 26px ui-monospace,Menlo,monospace;margin-top:14px}
footer{grid-column:1/-1;color:var(--mut);font-size:13px;padding:8px 18px;border-top:1px solid var(--line)}
/* SVG primitives */
.node rect,.node circle,.node polygon{fill:var(--panel);stroke:var(--line);stroke-width:2;transition:stroke .3s,fill .3s}
.node text{fill:var(--fg);font-size:22px;font-weight:600;text-anchor:middle;dominant-baseline:middle}
.node.g.lit rect,.node.g.lit polygon,.node.g.lit circle{stroke:var(--graph);fill:#12303a}
.node.l.lit circle,.node.l.lit rect,.node.l.lit polygon{stroke:var(--loop);fill:#3a2a12}
.node.ok rect,.node.ok circle,.node.ok polygon{stroke:var(--ok)!important;fill:#12321f!important}
.node.bad rect,.node.bad circle,.node.bad polygon{stroke:var(--bad)!important;fill:#3a1414!important;animation:pulse .6s ease-in-out 3}
@keyframes pulse{50%{stroke-width:6}}
.edge{fill:none;stroke:var(--line);stroke-width:3;stroke-linecap:round}
.edge.g.draw{stroke:var(--graph)}.edge.l.draw{stroke:var(--loop)}
.edge.draw{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:draw .7s ease-out forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.edge.dash{stroke-dasharray:10 10}
.token{r:9;fill:var(--graph);filter:drop-shadow(0 0 6px var(--graph))}
.token.l{fill:var(--loop);filter:drop-shadow(0 0 6px var(--loop))}
.token.mv{offset-path:var(--p);offset-rotate:0deg;animation:travel var(--d,1s) linear forwards}
@keyframes travel{from{offset-distance:0%}to{offset-distance:100%}}
.paused *{animation-play-state:paused!important}
.ticket{fill:#1d2430;stroke:var(--line);stroke-width:2;rx:8}
.ticket.gone{opacity:.15}
.log text{fill:var(--mut);font:19px ui-monospace,Menlo,monospace;dominant-baseline:hanging}
.log text.ok{fill:var(--ok)}.log text.bad{fill:var(--bad)}.log text.hd{fill:var(--fg);font-weight:600}
.small{font-size:18px!important;fill:var(--mut)!important;font-weight:400!important}
.cnt{fill:var(--fg);font:600 26px ui-monospace,Menlo,monospace;text-anchor:middle}
table{border-collapse:collapse;width:100%;max-width:1100px;font-size:clamp(15px,1.7vw,22px)}
th,td{padding:10px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{color:var(--mut);font-weight:600;font-size:.8em;letter-spacing:.06em;text-transform:uppercase}
td:nth-child(2){color:var(--loop)}td:nth-child(3){color:var(--graph)}
tbody tr{opacity:0;transform:translateY(6px);transition:opacity .5s,transform .5s}
tbody tr.in{opacity:1;transform:none}
.take{font-size:clamp(20px,2.6vw,34px);font-weight:700;text-align:center;margin-top:18px;opacity:0;transition:opacity .8s}
.take.show{opacity:1}
</style>
</head>
<body>
<header>
  <div class="brand"><span class="l">Loop</span><span class="vs">vs</span><span class="g">Graf</span></div>
  <nav id="nav"></nav>
  <div class="ctl"><button id="play" title="Space">▶</button><button id="again" title="R">↻</button><button id="notes" title="N">N</button><button id="full" title="F">⛶</button></div>
</header>
<main id="main"></main>
<aside id="aside" hidden></aside>
<footer>← → scener · Space spela/pausa · R om · N stödord · F fullskärm · E lägg till kant (scen 4)</footer>
<script>
// ── Engine: virtual clock so Space pauses both JS steps and CSS animations ──
const clock = { t: 0, last: 0, paused: true, rate: 1, timers: [] };
function at(ms, fn) { clock.timers.push({ when: clock.t + ms, fn }); }
function tick(now) {
  if (!clock.last) clock.last = now;
  if (!clock.paused) clock.t += (now - clock.last) * clock.rate;
  clock.last = now;
  const due = clock.timers.filter(x => x.when <= clock.t);
  clock.timers = clock.timers.filter(x => x.when > clock.t);
  due.sort((a, b) => a.when - b.when).forEach(x => x.fn());
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
function setPaused(p) { clock.paused = p; document.body.classList.toggle('paused', p); document.getElementById('play').textContent = p ? '▶' : '⏸'; }

// ── SVG helpers ─────────────────────────────────────────────────────────────
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.appendChild(e); return e; };
const txt = (parent, x, y, s, cls) => { const t = el('text', { x, y, class: cls || '' }, parent); t.textContent = s; return t; };
function node(parent, kind, x, y, label, shape = 'rect', w = 190, h = 62) {
  const g = el('g', { class: `node ${kind}`, transform: `translate(${x} ${y})` }, parent);
  if (shape === 'rect') el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12 }, g);
  if (shape === 'circle') el('circle', { r: h / 2 + 4 }, g);
  if (shape === 'diamond') el('polygon', { points: `0,${-h / 2 - 6} ${w / 2 - 20},0 0,${h / 2 + 6} ${-w / 2 + 20},0` }, g);
  txt(g, 0, 0, label);
  g.dataset.x = x; g.dataset.y = y;
  return g;
}
function edge(parent, kind, d, dashed = false) {
  const p = el('path', { d, class: `edge ${kind}${dashed ? ' dash' : ''}` }, parent);
  p.style.setProperty('--len', p.getTotalLength ? '1200' : '1200');
  return p;
}
function drawEdge(p) { p.style.setProperty('--len', p.getTotalLength()); p.classList.add('draw'); }
function token(parent, kind, d, dur, onEnd) {
  const c = el('circle', { class: `token ${kind}` }, parent);
  c.style.setProperty('--p', `path('${d}')`); c.style.setProperty('--d', dur + 'ms');
  c.classList.add('mv');
  if (onEnd) at(dur, () => { onEnd(c); });
  return c;
}
const lit = (g, on = true) => g.classList.toggle('lit', on);
const mark = (g, cls) => { g.classList.remove('lit', 'ok', 'bad'); if (cls) g.classList.add(cls); };
function logger(parent, x, y, max = 9) {
  const g = el('g', { class: 'log', transform: `translate(${x} ${y})` }, parent); const lines = [];
  return { add(s, cls) { const t = txt(g, 0, lines.length * 28, s, cls); lines.push(t); if (lines.length > max) { lines.shift().remove(); lines.forEach((l, i) => l.setAttribute('y', i * 28)); } return t; }, clear() { lines.splice(0).forEach(l => l.remove()); } };
}
</script>
</body>
</html>
```

The remaining steps append to the `<script>` before `</script>`.

- [ ] **Step 2: Builders — `buildLoop(svg, x, y, r)` and `buildGraph(svg, opts)`**

```js
// Loop: circle with 4 stations. Returns handles + a lap(iter, ok) animation step.
function buildLoop(svg, cx, cy, r, scale = 1) {
  const g = el('g', { transform: `translate(${cx} ${cy}) scale(${scale})` }, svg);
  const ring = `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r}`;
  el('path', { d: ring, class: 'edge l' }, g);
  const n = {
    think: node(g, 'l', 0, -r, 'Tänk', 'rect', 150, 54),
    act: node(g, 'l', r, 0, 'Agera', 'rect', 150, 54),
    observe: node(g, 'l', 0, r, 'Observera', 'rect', 170, 54),
    done: node(g, 'l', -r, 0, 'Klar?', 'diamond', 150, 54),
  };
  const counter = txt(g, 0, -14, 'Iteration 0', 'cnt');
  const sub = txt(g, 0, 22, '', 'cnt small');
  // one lap = quarter arcs think→act→observe→done→think
  const q = (a, b) => `M ${a[0]} ${a[1]} A ${r} ${r} 0 0 1 ${b[0]} ${b[1]}`;
  const P = [[0, -r], [r, 0], [0, r], [-r, 0]];
  const arcs = [q(P[0], P[1]), q(P[1], P[2]), q(P[2], P[3]), q(P[3], P[0])];
  const order = [n.think, n.act, n.observe, n.done];
  function lap(i, ok, verdict, startAt = 0) {   // schedules one iteration at relative offset startAt; returns its duration
    const seg = 700; const start = startAt;
    at(start, () => { counter.textContent = `Iteration ${i}`; sub.textContent = ''; });
    arcs.forEach((d, k) => at(start + k * seg, () => {
      mark(order[k], 'lit'); if (k) mark(order[k - 1]);
      token(g, 'l', d, seg, c => c.remove());
    }));
    at(start + 4 * seg, () => { mark(n.done, ok ? 'ok' : 'bad'); sub.textContent = verdict || (ok ? 'check ✓' : 'check ✗'); });
    at(start + 4 * seg + 900, () => { if (!ok) mark(n.done); });
    return 4 * seg + 900;
  }
  return { g, n, counter, sub, lap };
}

// Graph: fixed DAG. opts.hideEscalate hides the fallback edge+node (scene 4). Returns node/edge handles and a flow(id, path) step.
function buildGraph(svg, ox = 0, oy = 0, scale = 1, opts = {}) {
  const g = el('g', { transform: `translate(${ox} ${oy}) scale(${scale})` }, svg);
  const X = { inbox: 90, cls: 320, enrich: 560, cond: 760, out: 960, verify: 1150 };
  const n = {
    inbox: node(g, 'g', X.inbox, 300, 'Inbox', 'rect', 140),
    cls: node(g, 'g', X.cls, 300, 'Klassificera', 'rect', 210),
    cust: node(g, 'g', X.enrich, 200, 'Kund', 'rect', 150),
    pol: node(g, 'g', X.enrich, 400, 'Policy', 'rect', 150),
    cond: node(g, 'g', X.cond, 300, '?', 'diamond', 110, 60),
    reply: node(g, 'g', X.out, 210, 'Svara', 'rect', 150),
    esc: node(g, 'g', X.out, 400, 'Eskalera', 'rect', 170),
    verify: node(g, 'g', X.verify, 300, 'Verifiera', 'rect', 170),
  };
  const L = (a, b) => `M ${a} ${b}`;
  const d = {
    inCls: `M 160 300 L 215 300`,
    clsCust: `M 425 300 C 480 300 480 200 485 200`,
    clsPol: `M 425 300 C 480 300 480 400 485 400`,
    custCond: `M 635 200 C 690 200 690 300 705 300`,
    polCond: `M 635 400 C 690 400 690 300 705 300`,
    condReply: `M 815 300 C 860 300 860 210 885 210`,
    condEsc: `M 815 300 C 860 300 860 400 875 400`,
    replyVer: `M 1035 210 C 1090 210 1090 300 1065 300`,
    escVer: `M 1045 400 C 1090 400 1090 300 1065 300`,
  };
  const e = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, edge(g, 'g', v, k === 'condEsc' || k === 'escVer')]));
  if (opts.hideEscalate) { n.esc.style.opacity = 0; e.condEsc.style.opacity = 0; e.escVer.style.opacity = 0; }
  const order = ['inCls', 'clsCust', 'clsPol', 'custCond', 'polCond', 'condReply', 'condEsc', 'replyVer', 'escVer'];
  function drawAll(step = 350) { order.forEach((k, i) => at(i * step, () => drawEdge(e[k]))); return order.length * step; }
  // route: 'reply' | 'esc' | 'stuck' (stops at cond, marks bad)
  function flow(route, startAt = 0, seg = 650) {
    const hop = (t, key, nodeAfter) => at(startAt + t, () => { token(g, 'g', d[key], seg, c => c.remove()); if (nodeAfter) at(seg, () => mark(nodeAfter, 'lit')); });
    at(startAt, () => mark(n.inbox, 'lit'));
    hop(0, 'inCls', n.cls);
    hop(seg, 'clsCust', n.cust); hop(seg, 'clsPol', n.pol);                 // parallel: two tokens at once
    hop(2 * seg, 'custCond', n.cond); hop(2 * seg, 'polCond');
    if (route === 'stuck') { at(startAt + 3 * seg + 100, () => { n.cls.querySelector('text').textContent = 'other?'; mark(n.cond, 'bad'); }); return 3 * seg + 100; }
    hop(3 * seg, route === 'esc' ? 'condEsc' : 'condReply', route === 'esc' ? n.esc : n.reply);
    hop(4 * seg, route === 'esc' ? 'escVer' : 'replyVer', n.verify);
    at(startAt + 5 * seg + 200, () => mark(n.verify, 'ok'));
    return 5 * seg + 200;
  }
  function showEscalate() { [n.esc, e.condEsc, e.escVer].forEach(x => { x.style.transition = 'opacity .6s'; x.style.opacity = 1; }); drawEdge(e.condEsc); drawEdge(e.escVer); }
  return { g, n, e, drawAll, flow, showEscalate };
}
```

- [ ] **Step 3: Cue data (verbatim from CUE-CARDS.md) + scenes**

```js
const CUES = [
  { title: 'Hook + Loopen', time: '0:00–3:00', say: ['Samma uppgift: fem supportärenden. Två sätt att bygga agenten.', 'Loop: en prompt + ett stoppvillkor. Modellen väljer vägen.', 'Tänk → Agera → Observera → Klar?', 'Claude Code är redan en loop. Ralph gör loopen yttre och explicit.', 'Min artefakt är stoppvillkoret, inte vägen.'], do: ['Terminal A:', '/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8'], fallback: 'demo/runs/loop-run.md' },
  { title: 'Grafen', time: '3:00–5:00', say: ['Jag ritar noderna: Inbox → Klassificera → Kund ∥ Policy → Svara | Eskalera → Verifiera.', 'Varje nod = ett bundet agentanrop med schema.', 'Kanterna är kod. Parallellism gratis. Faserna syns live.'], do: ['Terminal B:', '/triage-graph'], fallback: 'demo/runs/graph-run.md' },
  { title: 'Sida vid sida', time: '5:00–6:30', say: ['Fyra vanliga ärenden. Båda gröna.', 'Loopen tog ett antal steg jag inte visste i förväg.', 'Grafen tog exakt så många som jag ritade.', 'Kostnad: loop okänd, graf bunden.'], do: [], fallback: '' },
  { title: 'Edge case: T-005', time: '6:30–8:00', say: ['Grekiska. GDPR. Ingen kategori passar.', 'Loopen: check säger nej, ett varv till, landar på other + eskalera.', 'Grafen: "other" – ingen kant. Stopp.', 'Tryck E: kanten du lägger till efter att den bitit dig.', 'Grafen kräver att du såg det komma. Loopen kräver att du litar på modellen.', 'Sen: tillbaka till terminalerna. check:loop, check:graph, diff. Två gröna, två olika spår.'], do: ['E = lägg till kant', 'Terminal A: npm run check:loop', 'Terminal B: npm run check:graph', 'npm run diff'], fallback: 'npm run diff funkar på förkörda filer' },
  { title: 'Hybrid', time: '10:00–11:00', say: ['Zooma in i en nod – där sitter en loop.', 'Varje agent()-nod i Workflow ÄR en Claude Code-loop.', 'Struktur utanpå, frihet inuti.'], do: [], fallback: '' },
  { title: 'När använda vad', time: '11:00–12:00', say: ['Graf för det du vet. Loop för det du inte vet.', 'Oftast: graf med loopar i noderna.', 'Fråga: var har ni loopar som borde vara grafer – och grafer som borde vara loopar?'], do: [], fallback: '' },
];

const TABLE = [
  ['Förutsägbarhet', 'Låg – modellen väljer vägen', 'Hög – du ritade vägen'],
  ['Observability', 'Transkript i efterhand', 'Faser och noder live'],
  ['Parallellism', 'Sekventiell per default', 'Gratis: pipeline / parallel'],
  ['Kostnadskontroll', 'Svår – kan snurra', 'Bunden per nod'],
  ['Okända fall', 'Improviserar', 'Ingen kant = stopp'],
  ['Upfront-design', 'En prompt + stoppvillkor', 'Noder, kanter, scheman'],
  ['Passar när', 'Utforskande · "fixa tills grönt"', 'Produktion · repeterbart · granskbart'],
];

const SCENES = [
  { title: 'Loopen', sub: 'en prompt + ett stoppvillkor', build: sceneLoop },
  { title: 'Grafen', sub: 'du ritar noderna, kanterna är kod', build: sceneGraph },
  { title: 'Sida vid sida', sub: 'fyra vanliga ärenden', build: sceneSide },
  { title: 'Edge case', sub: 'T-005 · grekiska · GDPR', build: sceneEdge },
  { title: 'Hybrid', sub: 'graf med loopar i noderna', build: sceneHybrid },
  { title: 'När använda vad', sub: '', build: sceneTable },
];
```

Scene builders each receive `(stage, caption, api)` where `stage` is the `.stage` div and return nothing; they call `at()` for timing. Reference implementations:

```js
function svgIn(stage) { stage.innerHTML = ''; return el('svg', { viewBox: '0 0 1200 620' }, stage); }
const cap = (c, s) => { c.textContent = s; c.classList.toggle('show', !!s); };

function sceneLoop(stage, caption) {
  const svg = svgIn(stage);
  // prompt + stop cards
  const card = (y, head, body) => { const g = el('g', { transform: `translate(30 ${y})` }, svg); el('rect', { width: 330, height: 120, rx: 12, class: 'ticket' }, g); txt(g, 16, 16, head, 'log hd').setAttribute('style', 'fill:#8b94a5;font:600 16px system-ui'); const t = txt(g, 16, 48, body); t.setAttribute('style', 'fill:#e6e9ef;font:20px ui-monospace,Menlo,monospace'); t.setAttribute('dominant-baseline', 'hanging'); return g; };
  card(90, 'PROMPT', 'Triagera alla tickets\nenligt TRIAGE.md').querySelectorAll('text')[1].innerHTML = '<tspan x="16" dy="0">Triagera alla tickets</tspan><tspan x="16" dy="26">enligt TRIAGE.md</tspan>';
  card(260, 'STOPPVILLKOR', '').querySelectorAll('text')[1].innerHTML = '<tspan x="16" dy="0">npm run check:loop → 0</tspan><tspan x="16" dy="26">&lt;promise&gt;ALLA TICKETS</tspan><tspan x="16" dy="26">TRIAGERADE&lt;/promise&gt;</tspan>';
  const loop = buildLoop(svg, 640, 300, 190);
  // inbox stack
  const tickets = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005'].map((id, i) => { const g = el('g', { transform: `translate(960 ${80 + i * 60})` }, svg); el('rect', { width: 200, height: 48, class: 'ticket' }, g); txt(g, 100, 24, id).setAttribute('style', 'fill:#e6e9ef;font:600 20px ui-monospace,Menlo,monospace;text-anchor:middle;dominant-baseline:middle'); return g; });
  const log = logger(svg, 960, 400, 7);
  // choreography: 3 laps. lap1 writes 3 tickets, check fails (T-001 refund). lap2 fixes, fails on T-005. lap3 green.
  let t = 200;
  at(t, () => { cap(caption, 'Iteration 1: läs policy, läs tickets, skriv JSON, kör check'); log.add('$ läser policy.md, customers.json'); });
  t += loop.lap(1, false, 'check ✗  2 problem', t); tickets.slice(0, 5).forEach((tk, i) => at(t - 2200 + i * 200, () => tk.querySelector('rect').classList.add('gone')));
  at(t - 600, () => { log.add('✗ T-001: refund 1200 SEK > 500 ⇒ escalate', 'bad'); log.add('✗ T-005: other ⇒ escalate måste vara true', 'bad'); });
  at(t, () => cap(caption, 'Stoppvillkoret säger nej → samma prompt igen'));
  t += loop.lap(2, false, 'check ✗  1 problem', t); at(t - 600, () => { log.add('✓ T-001 rättad', 'ok'); log.add('✗ T-005: other ⇒ escalate måste vara true', 'bad'); });
  at(t, () => cap(caption, 'Ett varv till. Modellen valde vägen – jag valde bara målet.'));
  t += loop.lap(3, true, 'check ✓', t); at(t - 600, () => { log.add('✓ ALLA TICKETS TRIAGERADE (5/5)', 'ok'); log.add('<promise>ALLA TICKETS TRIAGERADE</promise>', 'ok'); });
  at(t + 200, () => cap(caption, 'Loop engineering: du äger stoppvillkoret, inte vägen.'));
}

function sceneGraph(stage, caption) {
  const svg = svgIn(stage);
  const G = buildGraph(svg, 0, -20, 1);
  const log = logger(svg, 60, 520, 3);
  let t = 200;
  at(t, () => cap(caption, 'Noderna ritas i förväg. Kanterna är kod.'));
  t += G.drawAll(300) + 400;
  at(t, () => { cap(caption, 'pipeline(): ingen barriär – ticket 2 klassificeras medan ticket 1 svaras'); log.add('▸ Inbox  ▸ Klassificera  ▸ Berika (kund ∥ policy)  ▸ Svara | Eskalera  ▸ Verifiera', 'hd'); });
  const routes = ['esc', 'reply', 'reply', 'reply', 'esc'];      // T-001 esc(refund>500), T-002..T-004 reply, T-005 esc(other)
  routes.forEach((r, i) => G.flow(r, t + i * 900, 600));   // staggered starts = pipeline, no barrier
  at(t + 5 * 900 + 3400, () => { cap(caption, 'Varje steg synligt. Varje nod bunden. Okänt fall = saknad kant.'); log.add('✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/graph/', 'ok'); });
}
```

Implementation note: `at(ms)` is relative to the clock at scheduling time. All scene builders run synchronously at scene start, so every offset (`t`, `startAt`) is relative to scene start. `lap(i, ok, verdict, startAt)` and `flow(route, startAt, seg)` both take that offset and return their own duration, so `t += loop.lap(…, t)` chains laps correctly.

```js
function sceneSide(stage, caption) {
  const svg = svgIn(stage);
  txt(svg, 300, 40, 'LOOP', 'cnt').style.fill = 'var(--loop)'; txt(svg, 900, 40, 'GRAF', 'cnt').style.fill = 'var(--graph)';
  const loop = buildLoop(svg, 300, 300, 150);
  const G = buildGraph(svg, 610, 40, 0.48);
  const lc = txt(svg, 300, 560, 'steg: 0', 'cnt'); const gc = txt(svg, 900, 560, 'steg: 0 av 20', 'cnt');
  let steps = 0; const bump = (k) => at(k, () => { steps++; lc.textContent = `steg: ${steps}`; });
  at(100, () => cap(caption, 'T-001 … T-004. Samma fyra ärenden in i båda.'));
  let t = 300; G.drawAll(120);
  t += loop.lap(1, false, 'check ✗', t); for (let k = 0; k < 6; k++) bump(300 + k * 450);
  t += loop.lap(2, true, 'check ✓', t); for (let k = 0; k < 5; k++) bump(300 + 2800 + k * 450);
  ['esc', 'reply', 'reply', 'reply'].forEach((r, i) => { G.flow(r, 600 + i * 800, 500); at(600 + i * 800 + 2700, () => gc.textContent = `steg: ${(i + 1) * 5} av 20`); });
  at(t + 300, () => cap(caption, 'Båda gröna. Loopen: 11 steg jag inte kunde förutse. Grafen: 20, exakt som ritat.'));
}

function sceneEdge(stage, caption, api) {
  const svg = svgIn(stage);
  txt(svg, 300, 40, 'LOOP', 'cnt').style.fill = 'var(--loop)'; txt(svg, 900, 40, 'GRAF', 'cnt').style.fill = 'var(--graph)';
  const loop = buildLoop(svg, 300, 300, 150);
  const G = buildGraph(svg, 610, 40, 0.48, { hideEscalate: true });
  const badge = el('g', { transform: 'translate(520 80)' }, svg); el('rect', { width: 160, height: 56, class: 'ticket' }, badge); txt(badge, 80, 28, 'T-005 · ΕΛ · GDPR').setAttribute('style', 'fill:#e6e9ef;font:600 18px ui-monospace,Menlo,monospace;text-anchor:middle;dominant-baseline:middle');
  const llog = logger(svg, 120, 500, 3); const glog = logger(svg, 640, 500, 3);
  at(100, () => cap(caption, 'Ticket fem. Grekiska. GDPR. Ingen kategori passar.'));
  G.drawAll(100);
  let t = 400;
  t += loop.lap(1, false, 'check ✗', t); at(t - 500, () => llog.add('✗ T-005: other ⇒ escalate måste vara true', 'bad'));
  t += loop.lap(2, true, 'check ✓', t); at(t - 500, () => llog.add('✓ ALLA TICKETS TRIAGERADE (5/5)', 'ok'));
  G.flow('stuck', 600, 550); at(600 + 3 * 550 + 200, () => { glog.add('✗ ingen kant för category=other', 'bad'); cap(caption, 'Grafen: "other" – och ingen kant. Stopp.  [E] lägg till kant'); });
  api.onKey('e', () => { G.showEscalate(); glog.add('+ kant: ? → Eskalera', 'ok'); cap(caption, 'Kanten du lägger till efter att den bitit dig.');
    at(900, () => { mark(G.n.cond); G.n.cls.querySelector('text').textContent = 'Klassificera'; G.flow('esc', 0, 500); });
    at(900 + 5 * 500 + 400, () => { glog.add('✓ ALLA TICKETS TRIAGERADE (5/5)', 'ok'); cap(caption, 'Grafen kräver att du såg det komma. Loopen kräver att du litar på modellen.'); });
  });
}

function sceneHybrid(stage, caption) {
  const svg = svgIn(stage);
  const G = buildGraph(svg, 0, -20, 1);
  G.drawAll(80);
  // a mini loop pre-rendered inside "Svara", hidden until zoom
  const mini = buildLoop(G.g, 960, 210, 22, 1); mini.g.style.opacity = 0; mini.counter.remove(); mini.sub.remove();
  mini.g.querySelectorAll('.node text').forEach(x => x.setAttribute('style', 'font-size:9px'));
  at(1500, () => cap(caption, 'Titta in i en nod.'));
  at(2500, () => { G.g.style.transition = 'transform 1.4s cubic-bezier(.4,0,.2,1)'; G.g.style.transformOrigin = '960px 210px'; G.g.style.transform = 'translate(-560px, 110px) scale(3.2)'; G.n.reply.querySelector('rect').style.fill = '#0e1116'; G.n.reply.querySelector('text').style.opacity = 0; });
  at(3400, () => { mini.g.style.transition = 'opacity .8s'; mini.g.style.opacity = 1; let t = 0; for (let i = 1; i <= 3; i++) t += mini.lap(i, i === 3, '', t); });
  at(4200, () => cap(caption, 'Varje agent()-nod är en Claude Code-loop. Struktur utanpå, frihet inuti.'));
}

function sceneTable(stage, caption) {
  stage.innerHTML = '';
  const wrap = document.createElement('div'); wrap.style.cssText = 'width:100%;display:flex;flex-direction:column;align-items:center';
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th></th><th style="color:var(--loop)">Loop</th><th style="color:var(--graph)">Graf</th></tr></thead><tbody>' + TABLE.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('') + '</tbody>';
  const take = document.createElement('div'); take.className = 'take'; take.innerHTML = 'Graf för det du vet. Loop för det du inte vet.<br><span style="color:var(--mut);font-weight:400">Oftast: graf med loopar i noderna.</span>';
  wrap.append(table, take); stage.append(wrap);
  [...table.tBodies[0].rows].forEach((r, i) => at(300 + i * 700, () => r.classList.add('in')));
  at(300 + TABLE.length * 700 + 400, () => take.classList.add('show'));
}
```

- [ ] **Step 4: Scene manager, presenter panel, keys**

```js
const main = document.getElementById('main'), nav = document.getElementById('nav'), aside = document.getElementById('aside');
let cur = -1, keyHandlers = {}, started = null;
const api = { onKey: (k, fn) => { keyHandlers[k] = fn; } };
SCENES.forEach((s, i) => { const b = document.createElement('button'); b.textContent = `${i + 1} ${s.title}`; b.onclick = () => go(i); nav.append(b); });
function go(i, autoplay = false) {
  i = Math.max(0, Math.min(SCENES.length - 1, i)); if (i === cur && !autoplay) return;
  cur = i; clock.timers = []; keyHandlers = {}; setPaused(true);
  [...nav.children].forEach((b, k) => b.classList.toggle('on', k === i));
  main.innerHTML = '';
  const sec = document.createElement('section'); sec.className = 'scene on';
  sec.innerHTML = `<h1>${SCENES[i].title}<small>${SCENES[i].sub}</small></h1><div class="stage"></div><div class="caption"></div>`;
  main.append(sec);
  SCENES[i].build(sec.querySelector('.stage'), sec.querySelector('.caption'), api);
  renderNotes(); try { localStorage.setItem('lvg.scene', i); } catch {}
}
function renderNotes() {
  const c = CUES[cur]; if (!c) return;
  aside.innerHTML = `<h2>${cur + 1}. ${c.title}</h2><div class="t">${c.time}</div>
    <h3>Säg</h3><ul>${c.say.map(s => `<li>${s}</li>`).join('')}</ul>
    ${c.do.length ? `<h3>Gör</h3><ul>${c.do.map(s => s.startsWith('/') || s.startsWith('npm') || s.startsWith('E ') ? `<li><code>${s}</code></li>` : `<li>${s}</li>`).join('')}</ul>` : ''}
    ${c.fallback ? `<h3>Om det går fel</h3><ul><li>${c.fallback}</li></ul>` : ''}
    <div class="clock" id="clk">00:00</div>`;
}
setInterval(() => { const e = document.getElementById('clk'); if (!e || !started) return; const s = Math.floor((Date.now() - started) / 1000); e.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 500);
document.getElementById('play').onclick = () => { if (!started) started = Date.now(); setPaused(!clock.paused); };
document.getElementById('again').onclick = () => go(cur, true);
document.getElementById('notes').onclick = () => { aside.hidden = !aside.hidden; };
document.getElementById('full').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
addEventListener('keydown', (ev) => {
  if (ev.target.tagName === 'INPUT') return;
  const k = ev.key.toLowerCase();
  if (ev.key === 'ArrowRight') go(cur + 1); else if (ev.key === 'ArrowLeft') go(cur - 1);
  else if (ev.key === ' ') { ev.preventDefault(); document.getElementById('play').click(); }
  else if (k === 'r') go(cur, true); else if (k === 'n') aside.hidden = !aside.hidden; else if (k === 'f') document.getElementById('full').click();
  else if (/^[1-6]$/.test(k)) go(Number(k) - 1);
  else if (keyHandlers[k]) keyHandlers[k]();
});
let initial = 0; try { initial = Number(localStorage.getItem('lvg.scene')) || 0; } catch {}
go(initial);
```

- [ ] **Step 5: Verify in a browser**

Use the `browser-automation` skill: load `file://$PWD/demo/loop-vs-graf.html`, assert zero console errors, press Space, wait 6 s, screenshot; for each scene 1–6: press the digit, Space, wait 8 s, screenshot. Scene 4: also press `e` and screenshot after 4 s. Press `n`, screenshot presenter panel. Fix anything broken (tokens not moving ⇒ check `offset-path` string quoting; edges not drawing ⇒ `getTotalLength` must run after the path is in the DOM).

Also open the file in Chrome manually at 1920×1080 to check text sizes read from 5 m.

- [ ] **Step 6: Commit**

```bash
git add demo/loop-vs-graf.html && git commit -m "feat: animated Loop vs Graf artifact with presenter panel"
```

---

### Task 7: Publish artifact, README, optional vhs tapes, push

**Files:**
- Create: `README.md`, `demo/vhs/loop.tape`, `demo/vhs/graph.tape`
- Scratch: `<scratchpad>/loop-vs-graf.html` (wrapper-stripped copy for the Artifact tool)

- [ ] **Step 1: Publish**

Strip the document wrapper (the Artifact tool adds its own):

```bash
sed -e '/^<!doctype html>$/d' -e '/^<html lang="sv">$/d' -e '/^<\/html>$/d' -e '/^<head>$/d' -e '/^<\/head>$/d' -e '/^<body>$/d' -e '/^<\/body>$/d' -e '/^<meta /d' demo/loop-vs-graf.html > "$SCRATCH/loop-vs-graf.html"
```

Call `Artifact` with that file, `favicon: "🔁"`, `description: "Loop engineering vs graph engineering — animerad show-and-tell med presenter-panel (svenska)"`. Record the URL in README and in the final message.

- [ ] **Step 2: README.md**

```markdown
# Loop vs Graf — loop engineering vs graph engineering, live in Claude Code

Same task, two ways. Five support tickets in `tickets/inbox/` must each get a `triaged/<run>/<id>.json` that passes `npm run check:<run>`.

- **Loop** — one prompt + one stop condition. Claude Code's Ralph loop re-feeds the same prompt until the completion promise is true. Output: `triaged/loop/`.
- **Graph** — nodes and edges drawn up front as a Workflow script (`.claude/workflows/triage.js`). Output: `triaged/graph/`.
- **Artifact** — `demo/loop-vs-graf.html`: six animated scenes (Swedish) with a presenter panel (`N`). Also published at: <ARTIFACT URL>

## Run it

Requirements: Node ≥ 20, Claude Code with the `ralph-loop` plugin.

```bash
npm test          # validator self-test
npm run reset     # clear outputs + Ralph state
```

Loop (terminal A, inside `claude`):
```
/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8
```

Graph (terminal B, inside `claude`):
```
/triage-graph
```

Then:
```bash
npm run check:loop && npm run check:graph && npm run diff
```

## Layout

- `tickets/` fixtures: inbox, fake CRM, policy. T-005 is the edge case (Greek, GDPR, no matching category).
- `scripts/check.mjs` the stop condition. Rules that bite: `other ⇒ escalate`, refund > 500 SEK ⇒ escalate, enterprise ⇒ high.
- `TRIAGE.md` what the loop prompt points at.
- `.claude/` the graph workflow, the `/triage-graph` command, permissions so the demo never prompts.
- `demo/` artifact, cue cards (md/html/pdf), pre-recorded runs, optional vhs tapes.
- `CUE-CARDS.md` speaker notes (Swedish).

## The point

Graf för det du vet. Loop för det du inte vet. Oftast: graf med loopar i noderna — every `agent()` node in a Workflow is itself a Claude Code loop.
```

- [ ] **Step 3: vhs tapes (optional GIFs; `brew install vhs`)**

`demo/vhs/loop.tape`
```
Output demo/runs/loop.gif
Set FontSize 16
Set Width 1400
Set Height 820
Set Theme "Catppuccin Mocha"
Type "npm run reset" Enter
Sleep 1s
Type "claude" Enter
Sleep 6s
Type '/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8' Enter
Sleep 300s
```

`demo/vhs/graph.tape`
```
Output demo/runs/graph.gif
Set FontSize 16
Set Width 1400
Set Height 820
Set Theme "Catppuccin Mocha"
Type "claude" Enter
Sleep 6s
Type "/triage-graph" Enter
Sleep 240s
```

- [ ] **Step 4: Commit and push**

```bash
git add -A && git commit -m "docs: README, artifact link, vhs tapes"
gh repo create zabirtech/loop-vs-graph --public --source=. --remote=origin --push
```

Expected: repo URL printed. Public, so colleagues can clone right after the talk.

---

### Task 8: Final verification + handoff

- [ ] **Step 1: Fresh-clone smoke**

```bash
cd "$SCRATCH" && git clone -q "$(cd - >/dev/null; git -C /Users/sabirquazi/Documents/ZAT/loop-vs-graph remote get-url origin)" lvg-clone && cd lvg-clone && npm test && npm run check:graph; echo "exit=$? (1 expected: no outputs in a fresh clone)"
```

- [ ] **Step 2: Checklist against the spec**

- [ ] `npm test` green
- [ ] `demo/runs/graph-run.md` exists with a green check
- [ ] artifact: 6 scenes, keys ←/→/Space/R/N/F/E/1–6, no console errors, works from `file://`
- [ ] `CUE-CARDS.md`, `demo/cue-cards.html`, `demo/cue-cards.pdf` present and identical in content
- [ ] `.claude/settings.json` allows `npm run check:*`, `Write(triaged/**)`
- [ ] README has the artifact URL and both commands

- [ ] **Step 3: Handoff message** (Swedish, short): repo path + GitHub URL, artifact URL, the one Ralph line, `/triage-graph`, Thursday checklist (reset, pre-run both, `/export` → `demo/runs/loop-run.md`, print `cue-cards.pdf`), and the offer to record GIFs if `vhs` gets installed.
