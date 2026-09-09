# Förkörd loop-körning (Ralph) – ripcord (preliminär)

Körd 2026-09-09 11:17 via vhs-inspelning (`demo/runs/loop.gif`). Loopen blev grön. Transkriptet saknas här – ersätt den här filen med `/export` från din egen körning torsdag (se MANUS.md avsnitt 0, steg 7).

## Kommandot

```
/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8
```

## `npm run check:loop`

```
✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/loop/
```

## `npm run diff` (efter både loop och graf)

```
ticket  loop                          graph
--------------------------------------------------------------------
T-001   refund/medium ⚠ eskalerad     refund/medium ⚠ eskalerad
T-002   login/high                    login/high
T-003   feature/low                   feature/low
T-004   billing/medium                billing/medium
T-005   other/medium ⚠ eskalerad      other/medium ⚠ eskalerad
```

## Filerna i `triaged/loop/`

### T-001.json

```json
{
  "id": "T-001",
  "category": "refund",
  "priority": "medium",
  "language": "sv",
  "escalate": true,
  "reason": "Återbetalning 1 200 SEK överstiger gränsen 500 SEK – kräver godkännande. Order #48211 fast i \"in transit\" sedan 2026-08-25.",
  "reply": ""
}

```

### T-002.json

```json
{
  "id": "T-002",
  "category": "login",
  "priority": "high",
  "language": "en",
  "escalate": false,
  "reason": "",
  "reply": "Hi James, thanks for reporting this and sorry for the disruption. We have opened a high-priority incident for the Okta SSO redirect loop affecting your 40 seats and looped in your account manager Lisa Berg. Our engineers are checking the SAML/OIDC callback configuration on our side now, and we will update you before your 14:00 demo. In the meantime, could you send us the exact URL you land on after the Okta redirect so we can trace the session?"
}

```

### T-003.json

```json
{
  "id": "T-003",
  "category": "feature",
  "priority": "low",
  "language": "sv",
  "escalate": false,
  "reason": "",
  "reply": "Hej Erik, tack för förslaget och kul att du gillar appen! Mörkt läge, gärna ett som följer systeminställningen, är ett återkommande önskemål och vi har lagt in din röst i vår produktbacklog. Vi hör av oss så snart det finns en tidplan att berätta om."
}

```

### T-004.json

```json
{
  "id": "T-004",
  "category": "billing",
  "priority": "medium",
  "language": "sv",
  "escalate": false,
  "reason": "",
  "reply": "Hej Fatima, tack för att du hörde av dig. Vi ser i vår logg två dragningar på 249 SEK den 1 september på kundnummer 10944, vilket inte stämmer med ditt enda Pro-abonnemang. Vi återför den dubbla dragningen till samma kort inom 3–5 bankdagar och skickar ett bekräftelsemejl när det är gjort."
}

```

### T-005.json

```json
{
  "id": "T-005",
  "category": "other",
  "priority": "medium",
  "language": "el",
  "escalate": true,
  "reason": "GDPR-radering (art. 17) – dataskydd hanteras aldrig av support, eskaleras till DPO. Skriftlig bekräftelse krävs inom 30 dagar.",
  "reply": ""
}

```

