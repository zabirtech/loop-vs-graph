# MANUS – Loop vs Graf (körschema, torrkörning, felsökning)

Detta är det du följer, rad för rad. CUE-CARDS.md är stödorden du säger; det här är vad du *gör*.
Torrkör hela manuset minst två gånger: en gång torsdag kväll med klocka, en gång fredag morgon utan att titta i manuset.

---

## 0. Förberedelser (torsdag kväll, ~25 min)

1. Hämta senaste:
   ```
   cd ~/Documents/ZAT/loop-vs-graph && git pull && npm test
   ```
   Förväntat: `# pass 16`.

2. Slå av Workflow-frågan lokalt (filen är gitignorad):
   ```
   cp .claude/settings.local.example.json .claude/settings.local.json
   ```

3. Öppna **två terminalfönster** i repot. A till vänster, B till höger. Typsnitt 18–20 pt (Cmd + flera gånger). Ha inget annat i dem.

4. Starta `claude` i båda. **Första gången** kommer dialogen *"Is this a project you created or one you trust?"* – förvalet är **"No, exit"**. Tryck **pil ner + Enter** för *"Yes, I trust this folder"*. Den kommer inte tillbaka.

5. Chrome: öppna `demo/loop-vs-graf.html` (eller https://claude.ai/code/artifact/1bbb5fae-daab-4dde-992e-957efabeb241). Tryck `F`. Testa `N` av/på, `←`/`→`, `Space`, `R`.

6. Kör hela avsnitt 2 nedan en gång med klocka. Notera var du hamnar i tid.

7. Spara loop-körningen som reservhjul: i terminal A, skriv `/export` och spara som `demo/runs/loop-run.md`. Klistra in `npm run check:loop`-utskriften sist i filen.

8. Nollställ: `npm run reset`.

---

## 1. Fem minuter innan du går upp

- [ ] Terminal A: `npm run reset` → `✓ triaged/loop, triaged/graph och Ralph-state rensade`
- [ ] Terminal A och B: `claude` igång, tom prompt, inga gamla utskrifter (Cmd+K rensar).
- [ ] Chrome: artifacten, scen 1, fullskärm (`F`), presenter-panel **av**.
- [ ] Fokusläge på. Slack, mail, kalender stängda.
- [ ] Cmd-Tab-ordningen är Chrome ↔ Terminal (växla en gång så ordningen sätter sig).
- [ ] Vatten.

---

## 2. Manus – vad du gör och vad du säger (mål 12:00)

Läs **SÄG**-texten högt som den står tills den sitter, sen prata fritt. **GÖR**-raderna är det du fysiskt gör. Kortversionen med samma nummer finns i `CUE-CARDS.md` och i artifactens presenter-panel (`N`).

De två kommandona. Ha Ralph-raden i klippbordet innan du går upp.

Ralph-raden (terminal A, steg 3):
```
/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8
```
Graf-kommandot (terminal B, steg 5):
```
/triage-graph
```

---

### Steg 1 · 0:00 · Hook
**GÖR:** Chrome, scen 1, stilla. Ingenting mer.

**SÄG:**
> Jag ska visa två sätt att bygga en AI-agent för exakt samma uppgift. Uppgiften är tråkig med flit: fem supportärenden ska sorteras. Kategori, prioritet, och antingen ett svar eller en eskalering.
> Det intressanta är inte uppgiften utan hur vi bygger agenten. Det första sättet kallar jag loop engineering. Det andra graph engineering.
> Frågan jag vill att ni tar med er är inte "vilket är bäst". Frågan är: vad vet du i förväg?

### Steg 2 · 1:00 · Förklara loopen
**GÖR:** `Space`. Animationen kör i cirka tolv sekunder medan du pratar.

**SÄG:**
> En loop-agent är det enklaste som finns. Jag skriver en prompt och ett stoppvillkor. Sen kör modellen: tänk, agera, observera, är jag klar? Inte klar? Ett varv till.
> Vägen väljer modellen. Jag äger bara målet.
> Claude Code är redan en sån loop, varje gång ni skriver något i den. Det jag ska köra nu är ett steg upp: Ralph-loopen. Samma prompt matas in igen och igen tills modellen skriver en exakt fras, ett promise, som den bara får skriva när det faktiskt är sant.
> Stoppvillkoret här är `npm run check`. Ett vanligt script som validerar alla fem filerna mot reglerna. Grönt betyder klart.

### Steg 3 · 2:00 · Starta loopen
**GÖR:** Cmd-Tab till **terminal A**. Klistra in Ralph-raden. `Enter`. Står autocomplete-menyn kvar: `Enter` igen.
Förväntat: setup-scriptet svarar med iteration 1 och promise-frasen, sen börjar Claude läsa `policy.md`.

**SÄG:**
> En rad. Prompten pekar på en fil med uppgiften. Promise-frasen är stoppvillkoret. Max åtta varv som säkerhetsbälte, för loopen har ingen egen budget.
> Nu jobbar den. Vi låter den vara och tittar på det andra sättet.

**GÖR:** Cmd-Tab tillbaka till Chrome.

### Steg 4 · 3:00 · Förklara grafen
**GÖR:** `→` till scen 2. `Space`. Kanterna ritas, sen flödar fem tokens.

**SÄG:**
> Graf-agenten är motsatsen. Här ritar jag noderna själv, i förväg.
> Inbox listar ärendena. Klassificera sätter kategori. Sen två noder parallellt: en slår upp kunden i CRM:et, en läser policyn. Sen ett villkor, och det villkoret är vanlig kod, inte modellen: ska det eskaleras eller svaras? Sist en nod som verifierar.
> Varje nod är ett litet, bundet anrop till modellen med ett schema för vad den får svara. Kanterna mellan noderna är kod.
> Det ger mig tre saker gratis: parallellism, observerbarhet, och en kostnad jag kan räkna på innan jag startar. Priset är att jag måste veta strukturen innan jag börjar.

### Steg 5 · 4:00 · Starta grafen
**GÖR:** Cmd-Tab till **terminal B**. Skriv `/triage-graph`. `Enter`, ev. två.
Förväntat: fasboxar dyker upp: Inbox → Klassificera → Berika → Svara / Eskalera → Verifiera. Tar cirka 75 sekunder.

**SÄG:**
> Det här är Claude Codes Workflow-verktyg. Titta på faserna som dyker upp: Inbox, Klassificera, Berika, Svara eller Eskalera, Verifiera. Det är exakt grafen ni såg, körd på riktigt. Tjugotvå agentanrop, alla med schema, ingen väntar på någon annan i onödan.

**GÖR:** Peka på faserna. Cmd-Tab tillbaka till Chrome.

### Steg 6 · 5:00 · Sida vid sida
**GÖR:** `→` till scen 3. `Space`. Cirka åtta sekunder.

**SÄG:**
> Fyra vanliga ärenden in i båda. Båda blir gröna.
> Men titta på stegräknaren. Loopen tog elva steg. Det visste jag inte i förväg. Grafen tog tjugo, exakt så många som jag ritade.
> Det är skillnaden i kostnad. Loopens kostnad är okänd tills den är klar. Grafens kostnad är bunden innan den startar.

### Steg 7 · 6:30 · Edge case
**GÖR:** `→` till scen 4. `Space`. Vänta tills diamanten blir röd, cirka tre sekunder.

**SÄG:**
> Ärende fem. Grekiska. En GDPR-begäran om att radera all data. Ingen av mina fyra kategorier passar.
> Loopen: checken säger nej, "other måste eskaleras". Ett varv till. Modellen läser felet, rättar, grönt. Den improviserade sig fram.
> Grafen: Klassificera säger "other". Och sen? Det finns ingen kant för det. Stopp.

**GÖR:** Fråga rummet: *"Vad gör man med grafen nu?"* Vänta på svar. Tryck `E`.

**SÄG:**
> Man lägger till kanten. Efter att den bitit dig.
> Det är hela skillnaden. Grafen kräver att du såg det komma. Loopen kräver att du litar på modellen.

### Steg 8 · 8:00 · Tillbaka till terminalerna
**GÖR:** Cmd-Tab till **terminal B**. Bör visa `✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/graph/`.

**SÄG:**
> Grafen är klar. Grönt. Tjugotvå anrop, noll fel.

**GÖR:** Cmd-Tab till **terminal A**. Scrolla upp lite.

**SÄG, om loopen blev klar på ett varv (troligast):**
> Loopen blev klar på ett varv. Det visste jag inte i förväg. Och det är poängen med ett stoppvillkor: jag behöver inte veta.

**SÄG, om den tog flera varv:**
> Här ser ni varven. Röda rader som blir färre för varje varv. Det är loopen.

**GÖR:** Skriv `npm run diff` i terminal A. `Enter`.

**SÄG:**
> Samma beslut på alla fem. Två gröna. Men två helt olika spår. Loopens spår läser jag i efterhand. Grafens spår ritade jag i förväg.

### Steg 9 · 10:00 · Hybrid
**GÖR:** Cmd-Tab till Chrome. `→` till scen 5. `Space`. Zoomen tar några sekunder.

**SÄG:**
> Nu det viktigaste. Zooma in i en nod i grafen. Vad finns där inne? En loop.
> Varje agentanrop i Workflow är en egen Claude Code-loop med sitt eget stoppvillkor. Struktur utanpå, frihet inuti.
> Så det är inte loop eller graf. Det är graf med loopar i noderna.

### Steg 10 · 11:00 · När använda vad
**GÖR:** `→` till scen 6. `Space`. Tabellen byggs rad för rad, sen kommer slutraden.

**SÄG:**
> Loop när du inte vet vägen. Utforskande arbete, "fixa tills testerna är gröna", prototyper.
> Graf när du vet vägen och den ska köras hundra gånger. Produktion, revision, kostnadskontroll.
> Och oftast båda: graf för strukturen du känner till, loop inuti noderna för det du inte gör.
> En fråga till er: var i era pipelines har ni loopar som borde vara grafer? Och grafer som borde vara loopar?

### Steg 11 · 12:00 · Klart
Q&A. Repo: github.com/zabirtech/loop-vs-graph

**Tidsregler:** ligger du på 9:00 när båda terminalerna är klara, hoppa steg 6. Ligger du på 13:00, hoppa steg 9 och gå direkt på tabellen.

---

## 3. Om något går fel

| Symptom | Gör |
|---------|-----|
| Terminal A: `Unknown command /ralph-loop:ralph-loop` | Plugin ej laddad. Skriv istället: `Triagera alla tickets enligt TRIAGE.md. Kör npm run check:loop och rätta tills den är grön.` Claude Codes inre loop gör jobbet. Säg: "Det här är loopen utan den yttre loopen – samma form." |
| Terminal B: frågar om Workflow-permission | `settings.local.json` saknas. Svara Yes och kör vidare. |
| Terminal B: `Workflow "triage" not found` | Kommandot faller tillbaka på scriptPath. Om inte: skriv `Kör Workflow med scriptPath .claude/workflows/triage.js`. |
| Loopen blir klar på ett varv (troligt) | Inget fel. Claude Codes inre loop gjorde jobbet, Ralphs yttre loop bekräftade. Säg det. Artifactens scen 1 visar tre varv för att visa *formen*, inte förutsäga antalet. |
| Loopen kör fler än 4–5 varv | Låt gå – `--max-iterations 8` stoppar den. Säg: "Loopen har ingen inbyggd budget. Därför max-iterations." |
| Loopen kör vidare efter demon | `/ralph-loop:cancel-ralph` |
| check blir aldrig grön för loopen | Visa ✗-raderna – det *är* poängen (stoppvillkoret säger nej). Gå vidare på tid. |
| Nätet dör | Artifacten funkar offline. Visa `demo/runs/graph-run.md` och `demo/runs/loop-run.md` i editorn istället för terminalerna. |
| Chrome-tangenter reagerar inte | Klicka en gång på sidan (fokus). |
| Presenter-panelen syns på projektorn | `N`. |

---

## 4. Efter demon

```
npm run reset
```
Ta emot frågor. Repo: https://github.com/zabirtech/loop-vs-graph
