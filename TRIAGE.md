# Uppgift: triagera inboxen (loop-demo)

Du är support-triage. Målet: varje ticket i `tickets/inbox/` har en fil `triaged/loop/<id>.json` som klarar `npm run check:loop`.

## Gör så här
1. Läs `tickets/policy.md` och `tickets/customers.json`.
2. Läs varje ticket i `tickets/inbox/`.
3. Skriv `triaged/loop/<id>.json` per ticket, exakt detta format:

```json
{
  "id": "T-001",
  "category": "refund | login | feature | billing | other",
  "priority": "low | medium | high",
  "language": "sv | en | el",
  "escalate": false,
  "reason": "kort varför (obligatorisk om escalate är true)",
  "reply": "svar till kunden på kundens språk (tom sträng om escalate är true)"
}
```

4. Kör `npm run check:loop`. Läs felraderna. Rätta. Kör igen.
5. När `npm run check:loop` avslutas med exit 0 och skriver `✓ ALLA TICKETS TRIAGERADE` – och först då – avsluta ditt svar med exakt:

<promise>ALLA TICKETS TRIAGERADE</promise>

Ljug inte om promisen. Om check inte är grön: fortsätt.
