---
name: new-graph
description: Scaffold a graph-engineering task (a Workflow script with explicit nodes and edges) plus its stop condition
argument-hint: <name>
disable-model-invocation: true
---
Scaffold a graph task named `$ARGUMENTS` (kebab-case; ask for a name if empty).

1. Is a graph the right fit? Ask: "Can you name the steps in advance, and are they the same every run?" If not, say a loop fits better and suggest `/new-loop`. Continue only if the user still wants a graph.
2. Ask these one at a time:
   - The goal, in one or two sentences.
   - The nodes, in order: what each step does and what it returns. Mark which steps can run in parallel and which decisions (edges) are rules you can write as code.
   - What "done" means, as rules a script can check.
3. Refuse to overwrite: if `tasks/<name>/` or `.claude/workflows/<name>.js` already exists, stop and say so.
4. Create files from the templates, replacing every `__PLACEHOLDER__`:
   - `templates/graph/workflow.js` → `.claude/workflows/<name>.js`. `__NAME__` is the task name and `__GOAL__` the one-line goal. `__LIST_PROMPT__` becomes the user's first node: how to find the work items. `__WORK_PROMPT__` becomes the per-item node. Add further nodes as extra `pipeline()` stages, each an `agent()` call with a schema. Put branching decisions in plain code between nodes, not in prompts. Use `.claude/workflows/triage.js` as the reference for `parallel()` branches and a conditional edge. Keep the top-level `return`: the Workflow runtime allows it, so plain `node --check` on this file fails and proves nothing.
   - `templates/check.mjs` → `tasks/<name>/check.mjs`. `__NAME__` is the task name. `__PROMISE__` is a short uppercase phrase, e.g. `ALL REPORTS WRITTEN`. Replace the example rules with the user's "done" rules. Every failure message must say what to fix.
5. Prove the stop condition bites: run `node tasks/<name>/check.mjs`. It must exit non-zero now, since nothing has been produced yet. If it passes, the rules are too weak. Tighten them and run it again.
6. Hand off. Tell the user:
   - Restart Claude Code so the workflow registry picks up `<name>`.
   - Run it by asking Claude to "run the <name> workflow". Then run `node tasks/<name>/check.mjs`.
   - To skip the Workflow permission prompt: `cp .claude/settings.local.example.json .claude/settings.local.json`.
   - If the check fails, fix the node that produced the bad output, not the output files.

Don't run the workflow yourself.
