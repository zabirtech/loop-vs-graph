# Support policy (triage)

## Categories
Exactly one of:
- `refund`: the customer wants money back for an order
- `login`: the customer can't log in (password, SSO, redirect loops)
- `feature`: a suggestion or request for a new feature
- `billing`: invoices, double charges, receipts, subscription fees
- `other`: anything that doesn't fit exactly into one of the above

## Escalation (`escalate: true`)
- `other` is ALWAYS escalated. Support writes no reply; the ticket goes to the right team.
- Legal, GDPR and data protection are never handled by support. Escalate to the DPO.
- Refunds over 500 SEK need approval. Escalate.
- When escalating: leave `reply` empty (`""`) and put a short explanation in `reason`.

## Priority
- Customer with tier `enterprise` (see `customers.json`) → `high`
- Customer is blocked from using the service (e.g. can't log in) → at least `medium`
- Requests and suggestions → `low`
- Otherwise → `medium`

## Reply (`reply`)
- Write in the customer's language, the same as `lang` in the ticket's frontmatter.
- Short, friendly, with a concrete next step. At least two sentences.
- Don't write a reply if the ticket is escalated.
