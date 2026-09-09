# Loop vs Graf — loop engineering vs graph engineering, live in Claude Code

Same task, two ways. Five support tickets in `tickets/inbox/` must each get a `triaged/<run>/<id>.json` that passes `npm run check:<run>`.

- **Loop** — one prompt + one stop condition. Claude Code's Ralph loop re-feeds the same prompt until the completion promise is true. Output: `triaged/loop/`.
- **Graph** — nodes and edges drawn up front as a Workflow script (`.claude/workflows/triage.js`). Output: `triaged/graph/`.
- **Artifact** — `demo/loop-vs-graf.html`: six animated scenes (Swedish) with a presenter panel (`N`). Works offline from `file://`. Published copy: https://claude.ai/code/artifact/1bbb5fae-daab-4dde-992e-957efabeb241

## Run it

Requirements: Node ≥ 20, Claude Code with the `ralph-loop` plugin.

The Workflow tool asks for permission on first use. To skip that prompt on stage, opt in locally (this file is gitignored, so the public repo grants nothing to anyone who clones it):

```bash
cp .claude/settings.local.example.json .claude/settings.local.json
```

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
- `docs/superpowers/` the design spec and implementation plan this was built from.

## The point

Graf för det du vet. Loop för det du inte vet. Oftast: graf med loopar i noderna — every `agent()` node in a Workflow is itself a Claude Code loop.
