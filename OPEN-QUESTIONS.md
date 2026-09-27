# Open questions

Decisions waiting on the user. Each links to the design it blocks. Answer inline, or in a session, and delete the entry once it's settled.

## Scraping from the UI (raised 2026-09-28)

Spec: [`docs/superpowers/specs/2026-09-27-crumble-logbook-design.md`](docs/superpowers/specs/2026-09-27-crumble-logbook-design.md), success criterion 3 ("A DC, Naver or crumb.gg scrape can be triggered from the UI and its captures land in a record") and its Jobs section. It was never built: plan 2 (jobs and scrapers) was never written, no `/jobs` route exists, and the `jobs` table the migrations create is unused. Captures are still taken by the Python scripts under `research/*/evidence/` and by agent-browser sessions.

1. **Build it or descope it?**
   - Build: write plan 2 (the job runner, the DC, Naver and crumb.gg scrapers ported to TypeScript, `/jobs` routes and a jobs screen), then implement it.
   - Descope: strike criterion 3 from the spec, keep capturing by script, and drop the `jobs` table in a migration.

## Guild Conquest simulator (deferred 2026-09-27)

Spec: [`docs/superpowers/specs/2026-09-27-conquest-simulator-design.md`](docs/superpowers/specs/2026-09-27-conquest-simulator-design.md), §11. Nothing is implemented. The implementation plan (plan 5) gets written only after these are answered and the spec is approved.

1. **Calibration data.** Will you enter your 12 lobby stat screens, swap one ATK% line on Milk and read the ATK change, and log at least 20 scored runs?
   - Yes: v1 is calibrated to your account.
   - No: v1 is relative-only, with no G predictions and no ATK% marginals.
   - Context: on 2026-09-27 you declined logging your runs in the app. Without a run log, calibration rests on your stated 700G median / 900G best at 2.2G, plus the documented community runs. That's workable but looser. A one-time stat-screen entry alone would still pin the scale.
2. **May that data be committed?** The repo is public.
   - Yes: it becomes record 003 evidence, and the calibration is reproducible from the repo.
   - No: it stays in the browser and a gitignored local file, and record 003 holds only the method.
3. **What does the game show you?**
   - An in-battle stat view: where does "45 haste in combat" come from?
   - A running damage total during the fight.
   - A per-cookie damage breakdown at the end.

   Each changes the input form (lobby vs combat values) and adds a calibration target.
4. **Survival scope.** Is "what is surviving the 17 s wipe worth" enough for v1, with "what it takes to survive" (HP/DEF/DR) in v2? Or do you want the survival model in v1?
