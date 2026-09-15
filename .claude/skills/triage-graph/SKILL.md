---
name: triage-graph
description: Run the triage example as an explicit graph (Workflow tool)
disable-model-invocation: true
---
Run the graph workflow in `.claude/workflows/triage.js` with the Workflow tool. Invoking this skill is the user's explicit opt-in to multi-agent orchestration.

Prefer `Workflow({ name: "triage" })`. If the name is not registered (the registry is built at session start), use `Workflow({ scriptPath: "<absolute path to this project>/.claude/workflows/triage.js" })`.

Don't pre-process or "help" the workflow. When it returns, run `npm run check:graph` and show its output verbatim. If the check fails, do NOT fix files by hand. Name which node produced the bad output. The graph is the accountable structure, and that is the point of the example.
