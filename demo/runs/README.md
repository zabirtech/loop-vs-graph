# Förkörda resultat (ripcord)

Om nätet dör på scen: visa dessa istället för att köra live.

- `graph-run.md` – en komplett körning av `/triage-graph` (Workflow) med check-utskrift och alla fem JSON-filer.
- `loop-run.md` – din körning av Ralph-loopen. Skapa den torsdag kväll:
  1. `npm run reset`
  2. Starta `claude` i repot, kör raden från CUE-CARDS.md kort 2.
  3. När loopen är klar: `/export` i Claude Code → spara som `demo/runs/loop-run.md`.
  4. Klistra in `npm run check:loop`-utskriften längst ner.
