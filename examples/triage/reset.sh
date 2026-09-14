#!/bin/sh
# Reset between runs: outputs from both approaches + Ralph loop state.
set -e
cd "$(dirname "$0")"
rm -f triaged/loop/*.json triaged/graph/*.json ../../.claude/ralph-loop.local.md
echo "✓ cleared examples/triage/triaged/{loop,graph} and Ralph state"
