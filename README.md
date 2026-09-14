# loop-vs-graph

A starter template for two ways of building agents in Claude Code.

In loop engineering you write one prompt and one stop condition, and Claude keeps working until a check script passes. You decide the goal; the model decides how to get there.

In graph engineering you draw the steps up front as a Workflow script. Each node is an agent call with a schema, and the edges between nodes are plain code, so you decide the path too.

The repo has a working example of both on the same task (support-ticket triage), plus two skills that scaffold a task of your own.

## Quickstart

1. Click **Use this template** on GitHub (or clone), then `cd` into the repo.
2. Check you have Node ≥ 20 and Claude Code ≥ 2.1.203.
3. Run `claude` in the repo and trust the folder. Accept the prompt to install the `ralph-loop` plugin (this repo's `.claude/settings.json` asks for it). No prompt? Run `/plugin install ralph-loop@claude-plugins-official`.
4. Optional, to skip the Workflow permission prompt: `cp .claude/settings.local.example.json .claude/settings.local.json`
5. Start your own task with `/new-loop <name>` or `/new-graph <name>`.

The Workflow tool (used by the graph approach) is available on paid plans and with API access. On Pro, turn it on in `/config`.

## Loop or graph?

It mostly comes down to whether you know the steps in advance.

| | Loop | Graph |
|---|---|---|
| Use when | the path is unknown or changes per run | the steps are known and repeat |
| You write | a task prompt + a check script | nodes, schemas, edges + a check script |
| You get | adaptability, little setup | parallelism, visible phases, predictable cost |
| Fails by | wandering or stopping early (the check guards it) | a node returning bad data (the node is named) |

Rule of thumb: graph for what you know, loop for what you don't. Often you want both, because each `agent()` node in a graph is itself a Claude Code loop.

Whichever you pick, write the check script first, since both approaches use it to decide when they're done.

## Try the example

```bash
npm test          # check-script self-test
npm run reset     # clear outputs + loop state
```

Loop, inside `claude`:
```
/ralph-loop:ralph-loop Follow examples/triage/TASK.md --completion-promise "ALL TICKETS TRIAGED" --max-iterations 8
```

Graph, inside `claude` (use a second terminal to run both at once):
```
/triage-graph
```

Compare:
```bash
npm run check:loop && npm run check:graph && npm run diff
```

Five tickets in `examples/triage/tickets/inbox/` each need an `examples/triage/triaged/<loop|graph>/<id>.json` that passes the check. T-005 is the edge case: Greek, a GDPR request, no matching category.

## Start your own

- `/new-loop <name>` asks for the goal and what "done" means, then writes `tasks/<name>/TASK.md` and `tasks/<name>/check.mjs`. It confirms the check fails before any work is done and prints the exact `/ralph-loop` line to run.
- `/new-graph <name>` asks for the goal, the nodes and the done rules, then writes `.claude/workflows/<name>.js` and `tasks/<name>/check.mjs`.

Both skills push back if the other approach fits your answers better.

## Layout

- `.claude/settings.json`: plugin prompt and the permissions for the example and `tasks/`.
- `.claude/skills/`: `new-loop`, `new-graph`, `triage-graph`.
- `.claude/workflows/triage.js`: the example graph. Your graphs go next to it.
- `examples/triage/`: the loop prompt (`TASK.md`), the tickets, the check script and its tests.
- `templates/`: what the scaffold skills copy (`loop/TASK.md`, `graph/workflow.js`, `check.mjs`).
- `tasks/`: your tasks.
