# Support-policy (triage)

## Kategorier
Exakt en av:
- `refund` – kunden vill ha pengar tillbaka för en order
- `login` – kunden kan inte logga in (lösenord, SSO, redirect-loopar)
- `feature` – förslag eller önskemål om ny funktion
- `billing` – fakturor, dubbeldebitering, kvitton, abonnemangsavgifter
- `other` – allt som inte passar exakt i någon av ovanstående

## Eskalering (`escalate: true`)
- `other` eskaleras ALLTID. Support skriver inget svar; ärendet går till rätt team.
- Juridik, GDPR och dataskydd hanteras aldrig av support → eskalera till DPO.
- Återbetalning över 500 SEK kräver godkännande → eskalera.
- Vid eskalering: `reply` lämnas tom (`""`), `reason` förklarar kort varför.

## Prioritet
- Kund med tier `enterprise` (se `tickets/customers.json`) → `high`
- Kunden är blockerad från att använda tjänsten (t.ex. kan inte logga in) → minst `medium`
- Önskemål/förslag → `low`
- Annars → `medium`

## Svar (`reply`)
- Skriv på kundens språk – samma som `lang` i ticketens frontmatter.
- Kort, vänligt, konkret nästa steg. Minst två meningar.
- Skriv inget svar om ärendet eskaleras.
