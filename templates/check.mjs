#!/usr/bin/env node
// Stop condition for tasks/__NAME__. Exit 0 only when every rule holds.
// The loop keeps iterating, and the graph's Verify node reports failure, until this is green.
// Usage: node tasks/__NAME__/check.mjs
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const errors = [];
const fail = (msg) => errors.push(`✗ ${msg}`);

// ── Rules ────────────────────────────────────────────────────────────────
// Replace these with checks for your task. Each failure message should tell
// the agent exactly what to fix: the loop reads them to decide its next step.
// See examples/triage/check.mjs for a full set of rules.
const out = join(HERE, 'out');
if (!existsSync(out)) fail('missing tasks/__NAME__/out/ (write results there)');
else if (!readdirSync(out).length) fail('tasks/__NAME__/out/ is empty');

// ── Verdict ──────────────────────────────────────────────────────────────
if (errors.length) {
  console.error(`${errors.join('\n')}\n\n${errors.length} problem(s)`);
  process.exit(1);
}
console.log('✓ __PROMISE__');
