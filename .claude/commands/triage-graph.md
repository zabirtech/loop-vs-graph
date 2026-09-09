---
description: Triagera inboxen som en explicit graf (Workflow-demo)
---
Run the saved workflow named `triage` (file `.claude/workflows/triage.js`) with the Workflow tool: `Workflow({ name: "triage" })`. This slash command is the user's explicit opt-in to multi-agent orchestration.

Do not pre-process or "help" the workflow. When it returns, run `npm run check:graph` and show its output verbatim. If check fails, do NOT fix files by hand — name which node produced the bad output. The graph is the accountable structure; that is the point of the demo.
