# Open questions

Decisions waiting on the user. Each links to the design it blocks. Answer inline, or in a session, and delete the entry once it's settled.

## Guild Conquest simulator (deferred 2026-09-27)

Spec: [`docs/superpowers/specs/2026-09-27-conquest-simulator-design.md`](docs/superpowers/specs/2026-09-27-conquest-simulator-design.md), §11. Nothing is implemented. The implementation plan (plan 5) gets written only after these are answered and the spec is approved.

1. **Calibration data.** Will you enter your 12 lobby stat screens, swap one ATK% line on Milk and read the ATK change, and log at least 20 scored runs?
   - Yes: v1 is calibrated to your account.
   - No: v1 is relative-only, with no G predictions and no ATK% marginals.
   - Context: on 2026-09-27 you declined logging your runs in the app. Without a run log, calibration rests on your stated 700G median / 900G best at 2.2G, plus the documented community runs. That's workable but looser. A one-time stat-screen entry alone would still pin the scale.
2. **May that data be committed?** The repo is public.
   - Yes: it becomes the evidence of its own calibration record, and the calibration is reproducible from the repo.
   - No: it stays in the browser and a gitignored local file, and the calibration record holds only the method.
3. **What does the game show you?**
   - An in-battle stat view: where does "45 haste in combat" come from?
   - A running damage total during the fight.
   - A per-cookie damage breakdown at the end.

   Each changes the input form (lobby vs combat values) and adds a calibration target.
4. **Survival scope.** Is "what is surviving the 17 s wipe worth" enough for v1, with "what it takes to survive" (HP/DEF/DR) in v2? Or do you want the survival model in v1?

## Team power growth (record 005, 2026-09-28)

Record: [`research/005-team-power-growth/`](research/005-team-power-growth/README.md). The guild lab is the one power source with no table anywhere; the only size is one unmeasured reply claiming a research-13 guild adds ~+20% to account total power (dc:76461).

1. **Can you read your guild's research?** Your guild's research level and the stat lines it grants (the guild research screen), and, if you ever switch guilds, your team power before and after. That would size the guild lab in team power and let the planner count it.
2. **Who owns a power source's slug when a later record researches it again?** A power source's slug, such as `plating`, is unique across records, so a slug names one row wherever rows link to it. A later record that lists `plating` fails its import ("already loaded by record 005").
   - Keep it: a later record updates the power source by replacing record 005, or through the API.
   - Or let a later record take over a slug: its row replaces 005's and the links follow it, at the cost of 005 no longer owning what it researched.
