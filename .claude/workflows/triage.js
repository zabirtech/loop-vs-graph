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
