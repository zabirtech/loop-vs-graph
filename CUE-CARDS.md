# Cue cards – Loop vs Graf (kortversion av MANUS.md, samma numrering)

Tangenter: ←/→ scen · Space spela · R om · N stödord · F fullskärm · E lägg till kant (scen 4)

## Kort 0 · Innan du går upp
- Terminal A + B i repot, `claude` startat i båda. `npm run reset` körd. Ralph-raden i klippbordet.
- Chrome: artifact, scen 1, `F`. Presenter-panel av.
- Första gången `claude` startas i repot: trust-dialogen har "No, exit" förvalt → pil ner + Enter.
- Inget nät? Kör bara artifacten + `demo/runs/`.

## 1 · 0:00 · Hook · Chrome scen 1, stilla
- Två sätt att bygga en agent för samma uppgift: fem supportärenden.
- Loop engineering. Graph engineering.
- Frågan är inte vilket som är bäst. Frågan är: vad vet du i förväg?

## 2 · 1:00 · Förklara loopen · Space
- Prompt + stoppvillkor. Tänk, agera, observera, klar? Ett varv till.
- Vägen väljer modellen. Jag äger målet.
- Claude Code är redan en loop. Ralph = samma prompt igen tills promise-frasen är sann.
- Stoppvillkoret är `npm run check`. Grönt = klart.

## 3 · 2:00 · Starta loopen · Terminal A
- **GÖR:** klistra in Ralph-raden, Enter (ev. två). Tillbaka till Chrome.
- En rad. Uppgift i fil, promise som stopp, max åtta varv som säkerhetsbälte.
- "Nu jobbar den. Vi låter den vara."

## 4 · 3:00 · Förklara grafen · Chrome scen 2, Space
- Jag ritar noderna i förväg: Inbox → Klassificera → Kund ∥ Policy → villkor → Svara | Eskalera → Verifiera.
- Varje nod: bundet anrop med schema. Kanterna är kod.
- Gratis: parallellism, observerbarhet, känd kostnad. Priset: du måste veta strukturen innan.

## 5 · 4:00 · Starta grafen · Terminal B
- **GÖR:** `/triage-graph`, Enter (ev. två). Peka på faserna. Tillbaka till Chrome.
- Claude Codes Workflow. Faserna = grafen på riktigt. 22 anrop, alla med schema.

## 6 · 5:00 · Sida vid sida · Chrome scen 3, Space
- Fyra vanliga ärenden. Båda gröna.
- Loopen: elva steg, okänt i förväg. Grafen: tjugo, exakt som ritat.
- Loopens kostnad okänd tills klar. Grafens bunden innan start.

## 7 · 6:30 · Edge case · Chrome scen 4, Space, vänta på rött, fråga, sen E
- Ärende fem: grekiska, GDPR, ingen kategori passar.
- Loopen: check säger nej, ett varv till, grönt. Improviserade.
- Grafen: "other", ingen kant. Stopp.
- **Fråga rummet: "Vad gör man med grafen nu?"** Paus. `E`.
- Kanten du lägger till efter att den bitit dig.
- Grafen kräver att du såg det komma. Loopen kräver att du litar på modellen.

## 8 · 8:00 · Terminalerna · B, sen A, sen `npm run diff`
- B: "Grafen är klar. Grönt. 22 anrop, noll fel."
- A, ett varv: "Det visste jag inte i förväg. Poängen med ett stoppvillkor: jag behöver inte veta."
- A, flera varv: "Röda rader som blir färre. Det är loopen."
- diff: "Samma beslut. Två gröna. Två olika spår. Loopens läser jag i efterhand, grafens ritade jag i förväg."

## 9 · 10:00 · Hybrid · Chrome scen 5, Space
- Zooma in i en nod. Där sitter en loop.
- Varje agentanrop i Workflow = en Claude Code-loop med eget stoppvillkor.
- Struktur utanpå, frihet inuti. Inte loop eller graf: graf med loopar i noderna.

## 10 · 11:00 · När använda vad · Chrome scen 6, Space
- Loop när du inte vet vägen: utforskande, "fixa tills grönt", prototyper.
- Graf när du vet vägen och den ska köras hundra gånger: produktion, revision, kostnad.
- Oftast båda: graf för det du vet, loop i noderna för det du inte vet.
- Fråga: var har ni loopar som borde vara grafer, och grafer som borde vara loopar?

## 11 · 12:00 · Klart
- Q&A. github.com/zabirtech/loop-vs-graph
