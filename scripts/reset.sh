#!/bin/sh
# Reset between demo runs: outputs from both approaches + Ralph state.
set -e
cd "$(dirname "$0")/.."
rm -f triaged/loop/*.json triaged/graph/*.json .claude/ralph-loop.local.md
echo "✓ triaged/loop, triaged/graph och Ralph-state rensade"
