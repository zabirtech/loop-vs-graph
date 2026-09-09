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

## 2. Körschema (mål 12:00)

| Tid | Var | Gör | Förväntat på skärmen |
|----:|-----|-----|----------------------|
| 0:00 | Chrome, scen 1 | Ingenting. Säg hooken (kort 1). | Loop-ringen stilla, "Iteration 0 · väntar på Space" |
| 1:00 | Chrome | `Space` | Tre varv, ~12 s. Röd ✗ två gånger, grön ✓ och `<promise>` på tredje |
| 2:00 | **Terminal A** | Skriv raden nedan. `Enter`. Om autocomplete-menyn står kvar: `Enter` igen. | Setup-scriptet svarar "Ralph loop started / iteration 1 / promise: ALLA TICKETS TRIAGERADE". Sen börjar Claude läsa `policy.md`. |
| 2:20 | Chrome | Cmd-Tab tillbaka. Säg: "Den kör nu. Vi låter den jobba." | |
| 3:00 | Chrome | `→` till scen 2, `Space` | Kanterna ritas cyan, fem tokens flödar förskjutet, ~10 s |
| 4:00 | **Terminal B** | Skriv `/triage-graph`. `Enter` (ev. två). | Workflow startar. Fasboxar dyker upp: Inbox → Klassificera → Berika → Svara / Eskalera → Verifiera. ~2 min totalt. Peka på faserna. |
| 4:30 | Chrome | Cmd-Tab tillbaka. | |
| 5:00 | Chrome | `→` scen 3, `Space` | Båda kör, ~8 s. Loop "steg: 11", graf "steg: 20 av 20". |
| 6:30 | Chrome | `→` scen 4, `Space`. Vänta på röd diamant (~3 s). **Fråga rummet: "Vad händer med grafen nu?" Paus.** Tryck `E`. | Kanten `? → Eskalera` ritas, token går igenom, grönt. |
| 8:00 | **Terminal B** | Cmd-Tab. Bör vara klar. | JSON-resultat + `✓ ALLA TICKETS TRIAGERADE (5/5) · triaged/graph/`. Inte klar? Prata om faserna som syns tills den är det. |
| 8:30 | **Terminal A** | Scrolla upp lite. | Troligast: klar på **ett varv** (~40 s) med tabell + `<promise>ALLA TICKETS TRIAGERADE</promise>` sist. Säg: "Ett varv räckte den här gången. Det visste jag inte i förväg – det är hela poängen med ett stoppvillkor." Om den behövde fler varv: `✗`-rader som blir färre och "🔄 Ralph iteration N" – peka, *det* är loopen. |
| 9:30 | Terminal A | `npm run diff` | Tabell: T-001 `refund ⚠ eskalerad` i båda, T-005 `other ⚠ eskalerad` i båda, T-002 `login/high`. Säg: "Två gröna. Två olika spår." |
| 10:00 | Chrome | `→` scen 5, `Space` | Zoom in i Svara-noden, mini-loop snurrar. |
| 11:00 | Chrome | `→` scen 6, `Space` | Tabellen rad för rad, takeaway. Ställ frågan till rummet. |
| 12:00 | | Klart. Q&A. | |

Raden till terminal A (kort 2):
```
/ralph-loop:ralph-loop Triagera alla tickets enligt TRIAGE.md --completion-promise "ALLA TICKETS TRIAGERADE" --max-iterations 8
```

Tidsregler: ligger du på 9:00 när båda terminalerna är klara – hoppa scen 3. Ligger du på 13:00 – hoppa scen 5, gå direkt på tabellen.

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
