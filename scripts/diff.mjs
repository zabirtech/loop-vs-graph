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
