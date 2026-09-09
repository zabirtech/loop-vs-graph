# Loop vs Graf — show-and-tell demo (design)

Date: 2026-09-09. Talk: Friday 2026-09-12, company conference (Greece), Swedish, developer audience, 10–15 min.
Speaker: Sabir. Builder: Claude Code.

## Goal

Demonstrate **loop engineering** vs **graph engineering** for AI agents, using Claude Code itself as the demo vehicle. Same task (support-ticket triage) solved two ways, live in the terminal, with a scripted web animation carrying the concepts and the speaker's cue cards.

Takeaway to land: *graf för det du vet, loop för det du inte vet — i praktiken graf med loopar i noderna.*

## Definitions used in the talk

- **Loop engineering**: one prompt + one stop condition. The model chooses the path. Claude Code's native turn is an inner loop (think → act → observe); the Ralph loop is an explicit outer loop (same prompt re-fed until a completion promise is true).
- **Graph engineering**: the author draws nodes and edges up front. Each node is a bounded agent call; edges are code. Claude Code's Workflow tool (`agent()`, `pipeline()`, `parallel()`, `phase()`) is the graph runtime.
- **Hybrid**: every `agent()` node in a Workflow is itself a Claude Code loop. Structure outside, freedom inside.

## Storyline (target 12 min)

| # | Scene | Min | Speaker action |
|---|-------|-----|----------------|
| 0 | Hook: same task, two ways | 1 | Artifact scene 1 |
| 1 | The loop | 2 | Artifact scene 1 → terminal A: start Ralph loop, leave running |
| 2 | The graph | 2 | Artifact scene 2 → terminal B: `/triage-graph`, Workflow phases visible |
| 3 | Side by side: happy path, then Greek edge case | 3 | Artifact scenes 3–4 |
| 4 | Back to terminals: both green, compare traces | 2 | `npm run check:loop`, `npm run check:graph`, `npm run diff`; loop transcript (wandering) vs phase log (straight) |
| 5 | Hybrid + when to use what | 2 | Artifact scenes 5–6 |
| — | Q&A | rest | |

## Repository layout

```
loop-vs-graph/
├── README.md                      EN. What, why, how to run both demos, how to reset.
├── CUE-CARDS.md                   SV. One card per scene: tid, säg (stödord), gör, fallback.
├── TRIAGE.md                      SV/EN. The task spec the loop prompt points to.
├── package.json                   scripts: check:loop, check:graph, diff, reset, test. No runtime deps.
├── .gitignore                     node_modules, triaged/*/*.json, .claude/ralph-loop.local.md
├── tickets/
│   ├── inbox/T-001.md … T-005.md  frontmatter: id, from, subject, lang, received
│   ├── customers.json             fake CRM keyed by email: name, tier (free|pro|enterprise), orders, notes
│   └── policy.md                  categories, refund limit, escalation rules, priority rules
├── triaged/loop/.gitkeep          loop output, one JSON per ticket
├── triaged/graph/.gitkeep         graph output — separate dir so both terminals can run at once
├── scripts/
│   ├── check.mjs                  validator = stop condition. `node scripts/check.mjs loop|graph`
│   ├── check.test.mjs             node --test
│   ├── diff.mjs                   side-by-side table of loop vs graph outputs (scene 4 talk)
│   └── reset.sh                   rm triaged/{loop,graph}/*.json; rm -f .claude/ralph-loop.local.md
├── .claude/
│   ├── commands/triage-graph.md   slash command → run Workflow `triage`
│   ├── workflows/triage.js        the graph
│   └── settings.json              pre-allow Bash(npm run check:*), Bash(npm run diff), Read tickets/**, Write/Edit triaged/** → no permission prompts live
└── demo/
    ├── loop-vs-graf.html          the artifact (single file, no CDN, offline-safe)
    ├── cue-cards.html             print CSS, one card per page
    ├── cue-cards.pdf              generated from cue-cards.html
    ├── runs/                      pre-run transcripts (ripcord): loop-run.md, graph-run.md
    └── vhs/                       optional .tape files for GIF recording (loop.tape, graph.tape)
```

## Fixtures

Five tickets. Four sit cleanly in known categories; one does not.

| id | lang | category (truth) | trap |
|----|------|------------------|------|
| T-001 | sv | refund | amount 1 200 SEK > 500 SEK limit → must escalate |
| T-002 | en | login | sender is enterprise tier → priority high (needs CRM lookup) |
| T-003 | sv | feature | none; priority low |
| T-004 | sv | billing | duplicate charge, pro tier; priority medium |
| T-005 | el | other | GDPR erasure request in Greek. No known category → `other` + escalate. The edge case. |

`policy.md` states: categories `refund | login | feature | billing`; anything else is `other` and MUST escalate; refund > 500 SEK MUST escalate; enterprise → priority `high`; reply language must match ticket language; legal/GDPR is never handled by support.

## Output schema (`triaged/<loop|graph>/T-00X.json`)

```json
{
  "id": "T-001",
  "category": "refund | login | feature | billing | other",
  "priority": "low | medium | high",
  "language": "sv | en | el",
  "escalate": true,
  "reason": "short why",
  "reply": "customer-facing text in ticket language, or empty string if escalated"
}
```

## Validator (`scripts/check.mjs`) — the stop condition

Node 20, no deps. Usage `node scripts/check.mjs <loop|graph>` (aliases `npm run check:loop`, `npm run check:graph`). Exit 0 only when every rule holds, printing `✓ ALLA TICKETS TRIAGERADE (5/5)`; otherwise exit 1 with one line per failure, e.g. `✗ T-001: refund 1200 SEK > 500 → escalate must be true`.

Rules:
1. Every `tickets/inbox/*.md` has a `triaged/<target>/<id>.json`; no extra `*.json` files (`.gitkeep` ignored).
2. JSON parses, all fields present, enums valid, `id` matches filename.
3. `language` equals ticket frontmatter `lang`.
4. `category == other` ⇒ `escalate == true`.
5. Refund: amount parsed from ticket body (`\d+\s*(SEK|kr)`) > 500 ⇒ `escalate == true`.
6. Sender tier `enterprise` (from `customers.json`) ⇒ `priority == high`.
7. `escalate == false` ⇒ `reply` non-empty (≥ 40 chars). `escalate == true` ⇒ `reason` non-empty.

Rules 4–6 exist to give the loop something to get wrong on the first pass. The graph encodes them as explicit edges.

## The loop (Ralph)

Speaker types one line in terminal A:

```
/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8
```

`TRIAGE.md` tells the agent: read `tickets/policy.md`, `tickets/customers.json`, every inbox ticket; write one JSON per ticket into `triaged/loop/`; run `npm run check:loop`; fix until exit 0; only then output `<promise>ALLA TICKETS TRIAGERADE</promise>`. Ralph's stop hook re-feeds the same prompt on every exit without the promise.

Talking point: the inner loop (Claude's turn) and the outer loop (Ralph) are the same shape at different scales. The engineer's artifact is the stop condition, not the path.

## The graph (Workflow)

`.claude/commands/triage-graph.md` instructs Claude to run the named workflow `triage` (resolved from `.claude/workflows/triage.js`). Script outline, plain JS, no fs access (an agent lists the inbox):

```
meta.phases: Inbox → Klassificera → Berika → Svara | Eskalera → Verifiera

inbox    = agent(list ticket ids)                                   phase Inbox
results  = pipeline(inbox.ids,
  id  => agent(classify id → {category, language, customerEmail, refundAmount})   phase Klassificera, schema, effort low
  cls => parallel([ agent(customer lookup → {tier}), agent(policy check → {mustEscalate, priority}) ])   phase Berika
  ctx => ctx.cls.category === 'other' || ctx.pol.mustEscalate
           ? agent(write triaged/graph/<id>.json escalate:true)          phase Eskalera   // ← the edge you add after it bit you
           : agent(draft reply in ticket language, write JSON)     phase Svara
)
verify   = agent(run npm run check:graph, report)                          phase Verifiera (barrier: needs all outputs)
return { tickets, verify }
```

Model: `haiku` on Klassificera/Berika for speed and cost; default on Svara. ~22 agents total (1 inbox + 5 classify + 10 enrich + 5 reply/escalate + 1 verify). Phases render live in the terminal as the graph's shape.

Talking point: parallelism for free, every step observable, but an unforeseen input is a missing edge. The repo ships the version WITH the fallback edge so the live run is clean; the artifact shows the version WITHOUT it freezing.

## Artifact (`demo/loop-vs-graf.html`)

Single HTML file, vanilla JS + inline SVG + CSS. No external requests. Swedish UI. Dark stage, large type, two accents: loop = amber, graph = cyan. Published via the Artifact tool for a URL, and opened as a local file at the venue.

Scenes (←/→, 1–6):

1. **Loopen** — circle Tänk → Agera → Observera → Klar?. Orbiting token, iteration counter. Prompt card + stoppvillkor card. Tickets drop in and get consumed; path history draws as an emergent squiggle.
2. **Grafen** — DAG draws in edge by edge (stroke-dash). Inbox → Klassificera → (Kund ∥ Policy) → Svara → Verifiera, side edge → Eskalera. Tokens flow; parallel branches light together; phase labels.
3. **Sida vid sida** — both panels, tickets T-001..T-004, simultaneous run. Step counter per side: loop variable, graph fixed. Both end green.
4. **Edge case** — T-005 enters both. Loop: check fails once (`✗ T-005: other ⇒ escalate`), extra iteration, lands green. Graph: Klassificera → `?` → no edge → red, frozen. Button/key `E` "Lägg till kant": edge `other → Eskalera` draws in, rerun, green. Caption: *Grafen kräver att du såg det komma.*
5. **Hybrid** — graph from scene 2; a node zooms to reveal a mini loop inside. Caption: *Varje agent()-nod är en Claude Code-loop.*
6. **När använda vad** — table animates row by row: förutsägbarhet, observability, parallellism, kostnadskontroll, flexibilitet, upfront-design, felhantering. Final takeaway line.

Controls: Space play/pause, R restart scene, N presenter panel, F fullscreen, `E` in scene 4. Presenter panel: scene title, 3–6 Swedish cue bullets, time target, "Terminal" line where the speaker must act. Panel hidden by default so the projector never shows it until the speaker chooses.

Timing: each scene auto-plays its animation in ≤ 25 s and then idles; speaker advances manually. No autoplay between scenes.

## Cue cards

- `CUE-CARDS.md` is the source of truth. Per scene: **Tid**, **Säg** (stödord, not a script), **Gör** (terminal/artifact action, exact keystrokes), **Om det går fel** (fallback).
- `demo/cue-cards.html` renders the same content with print CSS (A5 landscape, one card per page). README documents "open in Chrome → print to PDF"; the builder generates `demo/cue-cards.pdf` once with headless Chrome.
- The artifact's presenter panel embeds the same bullets (hand-synced; small).

## Ripcord

- Speaker pre-runs both flows Thursday evening; transcripts saved to `demo/runs/`. Terminal tabs stay open with scrollback.
- Artifact runs offline from file.
- `.claude/settings.json` pre-allows the demo's commands so no permission prompt appears mid-talk.
- No network: show `demo/runs/` + artifact. The story lands without live runs.
- Optional GIFs via `vhs` (`brew install vhs`); tape files shipped, generation not required.

## Testing

- `check.mjs`: fixture-driven test (`scripts/check.test.mjs`, `node --test`): valid set passes; missing file, bad enum, refund-without-escalate, enterprise-not-high, other-without-escalate each fail with the expected line.
- Workflow: builder test-runs `triage` once end-to-end here after `npm run reset`; then `npm run check:graph` must exit 0. Transcript saved as `demo/runs/graph-run.md`.
- Loop: builder cannot start Ralph in the speaker's terminal; speaker runs it once Thursday. `TRIAGE.md` reviewed for the promise wording matching the stop hook's exact-match rule.
- Artifact: loaded headless (browser-automation skill); zero console errors; screenshot per scene; keyboard navigation verified.

## Out of scope

Standalone TypeScript agent implementations, real LLM calls from the artifact, n8n/LangGraph code (named verbally only), multi-language UI.
