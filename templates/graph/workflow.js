// Graph skeleton. Nodes are agent() calls with a schema; edges are plain code.
// Full example with parallel branches and a conditional edge: .claude/workflows/triage.js
export const meta = {
  name: '__NAME__',
  description: '__GOAL__',
  phases: [
    { title: 'List', detail: 'find the work items' },
    { title: 'Work', detail: 'one node per item' },
    { title: 'Verify', detail: 'node tasks/__NAME__/check.mjs' },
  ],
}

// ── Node contracts (schemas) ──────────────────────────────────────────────
const DIR = 'tasks/__NAME__'
const LIST_SCHEMA = { type: 'object', properties: { items: { type: 'array', items: { type: 'string' } } }, required: ['items'] }
const WORK_SCHEMA = { type: 'object', properties: { path: { type: 'string' }, ok: { type: 'boolean' } }, required: ['path', 'ok'] }
const VERIFY_SCHEMA = { type: 'object', properties: { exitCode: { type: 'number' }, output: { type: 'string' } }, required: ['exitCode', 'output'] }

// ── Node: List ────────────────────────────────────────────────────────────
phase('List')
const list = await agent(
  `__LIST_PROMPT__ Return {items}.`,
  { label: 'list', phase: 'List', schema: LIST_SCHEMA, effort: 'low' },
)
const items = list?.items ?? []
log(`${items.length} items`)

// ── Per-item pipeline: add nodes as extra stages; branch with if/else in code ─
const results = await pipeline(
  items,
  (item) => agent(
    `__WORK_PROMPT__ Item: ${item}. Write the result to ${DIR}/out/. Return {path, ok}.`,
    { label: `work:${item}`, phase: 'Work', schema: WORK_SCHEMA },
  ),
)

// ── Node: Verify (a barrier: needs every result on disk) ──────────────────
phase('Verify')
const verify = await agent(
  `Run \`node ${DIR}/check.mjs\` in the repo root. Return exitCode and the complete output verbatim.`,
  { label: 'verify', phase: 'Verify', schema: VERIFY_SCHEMA, effort: 'low' },
)

return { items: items.length, written: results.filter(Boolean).length, check: verify }
