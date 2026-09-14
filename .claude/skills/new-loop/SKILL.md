---
name: new-loop
description: Scaffold a loop-engineering task (one prompt + a stop condition) in tasks/<name>/
argument-hint: <name>
disable-model-invocation: true
---
Scaffold a loop task named `$ARGUMENTS` (kebab-case; ask for a name if empty).

Run every command from the repo root and never `cd`. The Ralph loop stores its state in `.claude/` relative to the shell's working directory, so a leftover `cd` makes the loop stop after one pass.

1. Is a loop the right fit? Ask: "Do you know the exact steps in advance, and are they the same every run?" If yes, say a graph fits better and suggest `/new-graph`. Continue only if the user still wants a loop.
2. Ask these one at a time:
   - The goal, in one or two sentences.
   - What "done" means, as rules a script can check (files exist, fields valid, tests pass, command exits 0).
   - Which files or folders the agent should read first.
3. Refuse to overwrite: if `tasks/<name>/` already exists, stop and say so.
4. Create files from the templates, replacing every `__PLACEHOLDER__`:
   - `templates/loop/TASK.md` → `tasks/<name>/TASK.md`. `__NAME__` is the task name, `__TITLE__` a short human title, `__GOAL__` the goal, `__INPUTS__` the files to read first (one bullet each), and `__STEP__` the concrete work steps (add numbered steps as needed, keeping the check and promise steps last). `__PROMISE__` is a short uppercase phrase, e.g. `ALL REPORTS WRITTEN`.
   - `templates/check.mjs` → `tasks/<name>/check.mjs`. Use the same `__NAME__` and `__PROMISE__`. Replace the example rules with the user's "done" rules. Every failure message must say what to fix.
5. Prove the stop condition bites: run `node tasks/<name>/check.mjs`. It must exit non-zero now. If it passes before any work is done, the rules are too weak. Tighten them and run it again.
6. Hand off. Print the exact line to start the loop, filled in:

   ```
   /ralph-loop:ralph-loop Follow tasks/<name>/TASK.md --completion-promise "<PROMISE>" --max-iterations 10
   ```

   Say: `/ralph-loop:cancel-ralph` stops it. Raise `--max-iterations` once the loop has proven it converges.

Don't start the loop yourself.
