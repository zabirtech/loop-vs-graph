# Förkörd graf-körning (`/triage-graph`) – ripcord

Körd 2026-09-09 10:40 av byggaren. 22 agenter, 0 fel, 108 s. Visa detta om nätet dör på scen.

## Workflow-resultat

```json
{"tickets":5,"written":5,"escalated":2,"check":{"exitCode":0,"output":"✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/graph/"}}
```

## Noder som kördes (fas → label)

```
Inbox         inbox                          → ids: T-001 … T-005
Klassificera  klassificera:T-001 … T-005     → refund/1200 · login · feature · billing · other (GDPR)
Berika        kund:T-00X ∥ policy:T-00X       → tier pro/enterprise/free/pro/free · mustEscalate T-001, T-005
Eskalera      eskalera:T-001, eskalera:T-005 → escalate:true (kanten i koden)
Svara         svara:T-002, T-003, T-004      → reply på kundens språk
Verifiera     verifiera                      → npm run check:graph exit 0
```

## `npm run check:graph`

```
✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/graph/
```

## `npm run diff` (loop-kolumnen fylls av din Ralph-körning)

```
ticket  loop                          graph
--------------------------------------------------------------------
T-001   —                             refund/medium ⚠ eskalerad
T-002   —                             login/high
T-003   —                             feature/low
T-004   —                             billing/medium
T-005   —                             other/medium ⚠ eskalerad
```

## Filerna i `triaged/graph/`

### T-001.json

```json
{
  "id": "T-001",
  "category": "refund",
  "priority": "medium",
  "language": "sv",
  "escalate": true,
  "reason": "Återbetalning på 1 200 SEK överskrider 500 SEK och kräver godkännande.",
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
  "reply": "Hi James, thanks for flagging this and sorry for the disruption. A redirect loop hitting all 40 of your users since this morning points to a problem with the Okta SSO integration on our side rather than your browsers, so no further cookie clearing is needed. I have marked this as high priority and our engineering team is investigating Northwind Industries' SSO configuration right now. As a concrete next step, please reply with your Okta app's ACS/redirect URL and a screenshot of any error in the Okta system log; in the meantime we will enable temporary email/password login for one or two admin accounts so you have access well before your 14:00 board demo. I have also looped in your account manager, Lisa Berg, who will keep you updated until this is resolved."
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
  "reply": "Hej Erik! Tack för ditt förslag och roligt att du gillar appen. Ett mörkt läge som följer systeminställningen automatiskt är ett bra önskemål, så jag har lagt in det som ett funktionsförslag hos produktteamet. Vi återkommer i den här tråden om det blir aktuellt att bygga det. Ha en fin kväll!"
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
  "reply": "Hej Fatima,\n\nTack för att du hörde av dig. Vi ser i vår billing-logg att kundnummer 10944 har två dragningar på 249 SEK den 1 september, trots att du bara har ett Pro-abonnemang – det är alltså en dubbeldebitering från vår sida.\n\nVi återför den extra dragningen på 249 SEK till samma kort/konto som debiterades. Återbetalningen syns normalt på ditt kontoutdrag inom 5–7 bankdagar. Du behöver inte göra något mer, men hör gärna av dig om beloppet inte dykt upp efter det.\n\nVänliga hälsningar,\nSupporten"
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
  "reason": "GDPR-begäran kräver eskalering till dataskyddansvarig.",
  "reply": ""
}

```

