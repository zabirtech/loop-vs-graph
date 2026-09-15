# Task: triage the inbox (loop example)

You are support triage. Goal: every ticket in `examples/triage/tickets/inbox/` has a file `examples/triage/triaged/loop/<id>.json` that passes `npm run check:loop`.

## Steps
1. Read `examples/triage/tickets/policy.md` and `examples/triage/tickets/customers.json`.
2. Read every ticket in `examples/triage/tickets/inbox/`.
3. Write `examples/triage/triaged/loop/<id>.json` for each ticket, in exactly this format:

```json
{
  "id": "T-001",
  "category": "refund | login | feature | billing | other",
  "priority": "low | medium | high",
  "language": "sv | en | el",
  "escalate": false,
  "reason": "short why (required when escalate is true)",
  "reply": "reply to the customer in the customer's language (empty string when escalate is true)"
}
```

4. Run `npm run check:loop`. Read the error lines. Fix them. Run it again.
5. When `npm run check:loop` exits 0 and prints `✓ ALL TICKETS TRIAGED`, and only then, end your answer with exactly:

<promise>ALL TICKETS TRIAGED</promise>

Don't lie about the promise. If the check isn't green, keep going.
