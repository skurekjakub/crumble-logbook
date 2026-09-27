# Conquest simulator: design

Date: 2026-09-27 · Status: for review. Revises the draft at `C:\Users\skure\crumble-re\sim-design-draft.md` (outside the repo), which is superseded once this is approved.

## 1. The question

The user wants to simulate the Guild Conquest encounter (지나치게 무거워진 피냐타, 60 s) as a patchwerk fight: twelve cookies run in and hit a boss that can't die, and the score is the damage dealt. The sim should rebuild the damage formulas from public data and show what each substat is worth. They chose a "comprehensive tuning sim", built hybrid, spike first.

**The v1 question.** *For my team, what does one more rune line of stat X on cookie Y buy me, in damage, with an honest error bar?* Everything else waits for a later stage (§10): building stats from gear, survival thresholds, the optimiser.

**The calibration target** is the user's account, as the user reported it on 2026-09-27:
- Cherry deck at 2.2G team power: median 700G (≈318×), best 900G (≈409×).
- The six ATK-order cookies are Lv.100.
- Brightseeker has 45 skill haste in combat.
- The whole team survives the 30 s slam. The 17 s wipe kills everyone except Pomegranate, and sometimes Skating Queen.

## 2. Constraints

- **Public data only.** The APK's code and data tables are AppSealing / WinZip-AES encrypted (spike log, `crumble-re/NOTES.md`), and we don't circumvent that. No model input comes from the APK, and no raw or decompiled APK artefact enters the repo. Public fan-site captures are fine and already committed.
- **Rank by damage, never by 배.** 배 is shown only as a secondary figure, computed from the power the user enters.
- **Every research claim is cited.** Every model parameter carries its provenance (§5.8). Evidence is never edited; a new measurement is a new numbered capture.
- **Architecture.**
  - Layers run routes → services → repos → db, enforced by `apps/server/test/architecture.test.ts`.
  - Content types are registered once in `apps/server/src/registry.ts`.
  - The web gets types only through `hc<AppType>`.
  - Components are props-only, and `apps/web/src/app/modes.ts` drives the views.
- **Local only**, single user.

## 3. Sources and how this spec cites them

| Tag | What | Source id |
|---|---|---|
| **CAT** | `research/001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_gameplay.json` (client 1.4.002) | `web:sugarpocket-catalog` |
| **DB** | `…/12-glossary-src/cookieruncrumble_app_api_catalog_database.json` | `web:sugarpocket-catalog` |
| **SP** | `research/001-guild-conquest-meta/evidence/19-sugarpocket/skills-runes-1.4.002.json` | `web:sugarpocket-bundle-1.4.002` |
| **SP-code** | Functions in the bundle `index-CAL2QT8S.js` (sha256 `a17de1…`). `Gn`, `Ar`, `jr` and `Mr` are quoted in `evidence/19-sugarpocket/README.md`. `Ne` (char offset 7572033), the stat-unit table `Pn` (7685951) and `Hn` (7689423) are quoted here and get their own capture in stage S0 (§10). | `web:sugarpocket-bundle-1.4.002` |
| **DPS** | `evidence/15-crumbgg/32-dps-read.txt`: crumb.gg's DPS chart, MV/s per cookie | `web:crumbgg:dps` |
| **FE** | A `fight_events` row by event key, imported from `evidence/08-extract/kr-encounter.json` | per row |
| **M:"…"** | A curated mechanic in `research/001-guild-conquest-meta/curated/mechanics.json`, by title, with its source ids | per row |

`crumble-re/crc/skill-dataset-1.4.002.json`, `sugarpocket-runes-skills-1.4.002.json` and the committed SP have the same sha256 (`c1373463…`). They hold no base stats. Role, element, synergies and base stats live in **CAT**, which is already committed.

## 4. Gap analysis

"Have" means the value is in a committed capture. "Community" means a curated mechanic or fight event. "Missing" means neither. The last column says how the design handles each input.

| # | Input | Datamine | Community | How the design handles it |
|---|---|---|---|---|
| 1 | Fight length | Have: CAT `dungeons.settings[type=GuildRaid].timeLimitMs = 60000` | FE `fight_length` (web:crumbgg:dps, dc:71383, dc:69724) | Fixed at 60 s. |
| 2 | Base stats, element, role, received synergy | Have: CAT `cookies[].baseStats`, `.element`, `.role`, `.synergies` | — | Imported (§7.2). |
| 3 | Level and star growth | Have: CAT `cookieLevels[].attackPercent` (Lv.100 = +2652.99%), `cookies[].starGrowth[]`. SP-code `Ne`: `round(base × (1 + lv%/100 + star%/100))`. | — | Imported. Used for per-cookie ATK% scaling (row 5) and, later, level what-ifs. |
| 4 | In-battle ATK/HP/DEF magnitude | Partial: gear options DB `equipment[].mainOptions/subOptions`, DB `plateEnhancement.rates`, codex DB `codexes[].boosts`, pet CAT `pets[].ownedStat`. The account research layers are missing; crumb.gg's sim takes them as inputs (`web:crumbgg:sim`). | — | **User parameter.** v1 takes the lobby stat screen per cookie. SP-code alone gives Lv.100 10★ Milk ≈3.8K ATK (133 × 28.9); the 1T 999G poster's Milk has 1.27M (dc:76235). |
| 5 | ATK gained from one ATK% line | Formula: SP-code `Gn` (`floor(base×(1+Mult/100)+Add)`). The base the multiplier applies to in game is missing. | M:"Sugar rune slots and rolls" (line maxima) | **Calibration.** The user swaps one ATK% line on Milk and reads the ATK change. That gives ATK per 1% for Milk, scaled to other cookies by the `Ne` ratio (an assumption: the unknown layers are account-wide). Until measured, ATK% marginals are marked "needs measurement". |
| 6 | Skill damage | Have: SP-code `Ar`: `floor(ATK × fround(coef) × (1+amp/100))`. SP `recommendations[id].grades[g].damages[].coefficient` (e.g. Brightseeker g9 laser 0.785, shockwave 2.13). | — | Used as is. |
| 7 | Hit structure (hits per cast, ticks, drones) | Partial: CAT `skill.grades[g].duration`, `.counts` and `.radius` are unlabelled arrays. Brightseeker `counts` goes 2 → 3 at grade 5, i.e. 5★ (drone count). | Drones per star and the 6-drone ceiling (curated `decks.json` Cherry, 브시커 why; `runes.json` 브시커). DPS: Brightseeker 4.50 MV/s with no synergy, 7.59 at max. | **Documented assumption, cross-checked.** The Brightseeker kit reads drones = `counts[0]`, lifetime = `duration[0]` (4 s) and tick = `duration[1]` (0.3 s). With 14 ticks that gives 4.41 MV/s against DPS's 4.50 (−2%). The Duration-synergy stretch is fitted to 7.59. |
| 8 | Cooldowns by grade | Have: SP `grades[g].cooldowns[]` (`seconds`, `conditional`, `zeroInitial`); CAT `skill.grades[g].cooldown` | — | Used as is. |
| 9 | First-cast timing | Missing (only `zeroInitial` flags) | FE `engage` (dc:72759, dc:74804) | **Assumption:** first cast at engage + U(0, 1) s, with a sensitivity toggle. |
| 10 | Haste → cooldown | Missing (the metadata name isn't citable) | M:"Skill haste formula": cd = base × 100/(100+haste), parent skill only (dc:31305, high) | Community formula. **Not fitted**, which contradicts the draft. |
| 11 | Buff magnitude by grade | Have: SP `grades[g].buffs[]` (`effectType`, `rawValue`, `base`, `maxStack`); already served as `buff_values` | — | Used as is. |
| 12 | Buffs scale with the caster's amp | Have: SP-code `jr`: `floor(base × raw × (1+casterAmp/100))/1e4` | M:"Skill amp scales Milk's buff (8/13)" (web:16132). M:"Skill amp nerf (8/27)": not for stat-reduction debuffs or DR buffs (dc:46452, dc:71135). | Used as is, with the 8/27 exclusions. |
| 13 | Buff durations | Partial: CAT `skill.grades[g].duration` (Pomegranate 9 s, Milk 5.5, Macaron 5, Cheesecake 7) | M:"Tea Knight is raid-only": boss DMG for 10 s every 10 s (web:crumbgg:patches) | Used. Tea Knight's comes from the community. |
| 14 | How stacks build (Milk ≤10, Macaron ≤10) | Partial: `maxStack` (SP). Per-cast stacks are missing; CAT `counts` has Milk 3 and Macaron 5. | Macaron hands out "300%+" crit (curated `decks.json` Cherry, 마카롱 why) | **Assumption:** one stack per projectile hit, independent timers. Checked against 300%+ (§9 V7), with a sensitivity toggle. |
| 15 | Pomegranate's beam targets and count | — | M:"Pomegranate's beams (빨대)": 3 + the 다발 level held at cast (5 or 6), highest-ATK allies, never herself (nv:29690, nv:36558, nv:42630, dc:71135, dc:76135, dc:53804, dc:52639, dc:70056, dc:69724) | Community rule. Targets are ranked by **current** combat ATK at cast time. |
| 16 | Who Milk, Macaron, Cheesecake and Skating Queen reach | Missing | Milk misses Tea Knight at the front (M:"Tea Knight is raid-only", dc:75400). Macaron reaches only the path ahead of her (curated `rng.json` "Formation at engage": dc:60340, dc:69368, dc:71105, dc:76716). Cheesecake on Milk is the best case (dc:55485). Skating Queen: nothing. | **Luck model** (§5.5): per-run draws with default probabilities as parameters. |
| 17 | Same-stat buff override | Hint: SP Milk's buff has `statType: AttackPointMultiplier`, which is Cheesecake's `effectType` | M:"Cheesecake's buff overrides Milk's" (dc:55485, measured 8/31). The 9/10 patch notes: "same-type buffs compared on final value" (web:37730). | **Toggle** override / keep-larger, defaulting to override. The patch postdates the measurement. |
| 18 | Synergy levels and what they do | Partial: the received synergy (CAT `synergies`), the grant (SP `otherEffects[].effect`; CAT `skill.description`: Tiger Lily grants Volley "to nearby allies"). Magnitudes are missing. | DPS: Milk Duration +0.75, pet +0.4, Tiger Lily Volley +3, Skating Queen Chain +2. Volley levels in M:"Pomegranate's beams". | **New curated table** `synergy_grants` (§7.2). The effect of a level is known only for Pomegranate (beams) and Brightseeker (fitted, row 7). |
| 19 | Pets | Have: CAT `pets[].battlePassives[]` text by tier, `ownedStat`. Octo Wasabi +8% ATK at tier 3 and +10% at tier 4; Hot Doggie +10% amp; Candy Shade Pouch 30% lift and 12.5% HP at tier 4. | M:"Octo Wasabi pet" (8% vs 10%, disputed) | Imported. **The pet tier is an input.** The tier table explains the 8% vs 10% dispute. |
| 20 | Mercenary perks | Missing | M:"Milk and the welfare perks": 열정페이 +20% ATK / −20% HP, 초고속승진 +7% ATK, to the highest-ATK ally (nv:36231, dc:53977, dc:71135, dc:76142) | Community values. **Assumption:** both are ATK multipliers summed with the others; sensitivity toggle. |
| 21 | Crit | Base crit 10% and crit dmg 50%: CAT `baseStats` | M:"Crit above 100%": each 100% tier crits again for (50% + bonus crit dmg); no crit resist on the boss (dc:31349, dc:75589, dc:75854) | Community rule, rolled per hit. |
| 22 | How damage buckets combine (amp, boss DMG, element, crit) | Partial: `Ar` puts (1+amp) on ATK×coef. The rest is missing. | — | **Assumption:** separate multiplicative buckets. Toggle: boss DMG shares the amp bucket. The design reports whether the marginal ranking flips. |
| 23 | Element advantage (Light vs Dark) | Missing. An element-damage stat exists (DB `ElementDamageBonusAddition`; CAT Candy Shade Pouch `ownedStat`). | M:"Boss": Dark, weak to Light (dc:48412, nv:43653, nv:44761, dc:71381) | **Assumption** `e = 0.25` with sensitivity {0, 0.5}. It affects only the Light vs non-Light split, because K absorbs it for Brightseeker. |
| 24 | Boss DEF, the DEF formula, Dark Choco's shred | Shred: SP gives only the application chance (`debuffs[].basePercent = 20`, ≤10 stacks); magnitude missing. The Piñata isn't in SP `stageBosses`. | DEF 2000 claimed (FE `boss_defense_phase_*`, dc:71383, low). DEF can't go below 0 (M:"Skill amp nerf (8/27)"). | **Absorbed into K** (§5.1). Dark Choco's shred is a switch with an assumed size, off by default. |
| 25 | Boss DR ramp | Missing (wave `GuildRaid_1` is encrypted) | FE `boss_defense_phase_0…5`: 0/10/30/50/70/90% at 0/10/22/34/46/58 s (dc:71383, dc:67285, low) | **Scenario toggle** flat / claimed. Every answer is reported under both. |
| 26 | Boss HP | Missing | Claimed 2^62 (dc:71383), so no kill | Infinite. |
| 27 | Boss attack timeline | CAT `GuildRaid` settings only | FE `slam_pattern` 30 s, `mob_wave_hit` 33 s, `chip_deaths_begin` 41 s, `super_jump_wipe` 43 s | Used for death timing and the timeline overlay. |
| 28 | Survival (HP/DR thresholds) | Heals: SP `heals`. Tea Knight DEF ×(1+0.6) per stack, ≤2. | M:"HP to survive the slam" (3.5–4M HP; dc:69368, dc:71237, dc:74796). M:"Surviving the 17 s wipe" (9M HP + 45% DR; dc:74801, dc:69856, dc:76583). | **v1: a scripted death schedule** (user parameter; the default is the user's observation). v2 adds a threshold model. |
| 29 | Formation / positions | Missing (no positions, speeds or collision) | Run in until blocked (FE `engage`). crumb.gg says movement can't be modelled exactly (web:crumbgg:sim). | **Luck model** replaces movement (§5.5). |
| 30 | 다발 timing | — | Checklist: 다발 2 by 45 s left, 다발 3 by 27 s left (dc:70056). Tiger Lily grants only nearby (M:"Pomegranate's beams"). | **Luck model:** acquisition-time distributions as parameters. |
| 31 | Lift cancels | Missing | M:"Lift resistance": a cast is cancelled if airborne ≥0.4 s; 64% resist with Pinot + pet (dc:52401, dc:75400) | **Assumption:** no cancels when Pinot and a lift pet are present; a warning otherwise. |
| 32 | Scoring | — | FE `fight_ends`: damage is kept after a wipe (dc:69201). Summon and DoT counting is unconfirmed. | Cumulative damage; the DoT question is open. |
| 33 | Rune slots and rolls | Have: SP `slots[].requiredStars` (0, 2, 4, 6, 8, 8, 10, 10), SP `pools[]` (value, weight by rarity). Units from SP-code `Pn` (÷100 for %, ÷1e4 for flat and haste). | M:"Sugar rune slots and rolls" (dc:66636, dc:71105, dc:76652) | Imported. One line is worth the SSR weight-mean roll (ATK% 6.31, amp 4.55, haste 4.2, crit 7.2, crit dmg 7.2); the SSR max is also shown. |
| 34 | Gear substats | Have: DB `equipment[].subOptions[]{min,max}`, DB `plateEnhancement.rates[].subRate` (+30/70/130/200% at +5/10/15/20) | M:"Gear enhancement" (dc:64661, nv:43011) | v2 (gear builder). |
| 35 | Team power | Missing: SP-code's `Pe` is Sugar Pocket's heuristic, not the game's | — | The user enters it; it's used only for 배. |
| 36 | DoT sizes (Scorpion) | Missing: SP `basePercent = 100` is a chance | — | The Scorpion kit is needle hits only; she's a beam catcher at Lv.1–45. |

### 4.1 Where the draft (or its spike notes) contradicts the data

1. **Calibration point.** The draft has "~250× median (550G)". The user reports a median of 700G (≈318×) and a best of 900G (≈409×) at 2.2G.
2. **Haste and crit are not unknowns to fit.** Both are high-confidence community rules: M:"Skill haste formula" and M:"Crit above 100%" (rows 10 and 21).
3. **The "formula term names" row.** Its source is APK metadata, which has no citable source in the repo, so it's dropped. The bucket questions it hinted at become toggles (row 22).
4. **Tea Knight's self DEF.** The draft has "×1.6". SP gives `DefensePointMultiplier` 6000 with `maxStack` 2, which is up to +120% if the stacks add.
5. **Two spike-note numbers are chances, not sizes.** NOTES reads "Dark Choco DEF−20%" and "Scorpion DoT 100%", but both are `basePercent` application chances (SP README). The magnitudes are missing.
6. **Pomegranate's "top-N by current ATK" leaves N undefined.** N = 3 + the 다발 level held at cast (5 or 6, not a sum), never herself.
7. **The engine has no Cheesecake override.** It's added as a toggle, with the 9/10 patch caveat (row 17).
8. **"Milk often dies at the slam."** That's true of weaker teams (dc:70832). On the user's account she dies at the wipe. Deaths are per account, so they're a schedule.
9. **"Entry: run in until blocked" can't be simulated.** There is no position data. It's replaced by per-run luck draws.
10. **`model/stats.ts` from base × level × stars + research layers can't reach in-game magnitudes** (row 4). v1 takes the stat screen.
11. **"fit/ calibrate the unknown terms" isn't identifiable.** One account gives two numbers, and the documented runs have no stat sheets. v1 fits only the scale K (§5.1).
12. **Curated data to fix later** (not evidence, so it can change):
    - M:"Sugar rune slots and rolls" lists only the ★6/★8/★10 unlocks; SP has 8 slots from ★0.
    - The Candy Shade Pouch HP conflict (SYNTHESIS 7.5% vs mechanics 12.5%) and Octo Wasabi's 8% vs 10% are pet tiers (row 19).
13. **Record number.** NOTES proposes `research/002-combat-formula/`, but 002 is `002-pvp-meta`. The simulator record is `003-conquest-sim`.

## 5. The model (revised)

### 5.1 The principle: take the stat screen, model only what changes, fit one scale

The public data fixes every **relative** quantity the v1 question needs:
- skill coefficients, cooldowns, buff sizes and how they scale;
- the crit and haste rules;
- the rune roll values.

It doesn't fix absolute magnitude: DEF mitigation at DEF 2000, the element constant, any power penalty, the account layers. In a fight where the boss can't die, every constant multiplier collapses into one scale:

```
hit = ATK_c(t) × coef × (1 + amp_c(t)/100) × Crit_c(t) × (1 + boss_c(t)/100) × E_c × W(t) × K
```

- `ATK_c(t)` is the cookie's combat ATK: the stat-screen ATK, plus combat-only layers (perks, pet), plus Milk's additive buff, then Cheesecake's multiplier under the override rule. Both follow `Gn` and `jr`.
- `Crit_c(t)` is rolled per hit. There are ⌊r/100⌋ guaranteed tiers, plus one more with probability frac(r/100), and each tier adds `(50 + bonus)`%.
- `E_c` = 1 + e (if the cookie is Light) + element damage. `W(t)` = 1 − DR(t) in the "claimed" scenario, else 1.
- **K is the only fitted number in v1**, set so the sim's median equals the user's logged median.

Marginal values are ratios, so K cancels out of them. They depend on K only through its interactions with the switches, and §9 checks those.

### 5.2 The engine

- A discrete-event loop over 0–60 s with a seeded PRNG. Common random numbers: separate streams for luck draws, crit and timing jitter, so a baseline and a perturbed team see the same luck.
- Each cookie runs a **kit**: its skills' cooldowns (hasted), hits, buffs and grants. Kits live in `packages/sim/src/kits/`.
  - v1 has full kits for the Cherry, Herb and Melon Soda deck cookies.
  - Any other cookie gets a generic kit (Σ coefficients per hasted cooldown, from `skill_grades`) and a warning.
- Brightseeker's kit is the drone model from row 7:
  - `counts[0]` drones per cast, each ticking 0.785×ATK every 0.3 s over its lifetime, plus the 2.13×ATK shockwaves;
  - the lifetime stretched by her Duration synergy (Milk + Octo Wasabi), with the stretch fitted to DPS 7.59;
  - the 6-drone ceiling.
- A buff lands on its recipients through the luck draws (§5.5). It gets its size from `jr` with the caster's **current** amp, and its duration and stacks from rows 13–14.
- Pomegranate re-ranks targets by current combat ATK at every cast. Stray beams (onto Dark Choco, Pinot and so on) fall out naturally.

### 5.3 Luck draws (the retry luck)

Each seed draws once per run:
- L1: which cookies are inside Macaron's path (default: Brightseeker and Scorpion aligned with p = 0.75, per "about 1 in 4 misaligns");
- L2: whether Milk's buff reaches each cookie (default: Tea Knight misses with p = 0.5);
- L3: who Cheesecake's letters reach (default: Milk with p = 0.6);
- L4: when Pomegranate first holds 다발 2 and 다발 3 (defaults centred on the dc:70056 checklist times);
- L5: small jitter on the death times.

Every default is a parameter with provenance "assumed". The draws are the axes the community names as retry luck (curated `rng.json`).

### 5.4 Deaths and the boss

- **v1 death schedule.** Each cookie has a death time, or survives. The default is the user's observation: everyone dies at 43 s except Pomegranate, and Skating Queen survives with p = 0.5. A dead cookie stops casting, and its buffs and grants lapse (Milk dying cuts Brightseeker's Duration synergy).
- **What surviving is worth.** Setting a cookie to "survives" answers the Season 5 question under both the flat and the claimed-ramp scenario. What it *takes* to survive is v2.

### 5.5 Outputs

For N seeds (default 400):
- the damage distribution: p10, p50, p90, mean, the expected best of n runs;
- P(score ≥ threshold), and the expected number of runs to reach it;
- each cookie's share of the damage;
- the median-seed run's timeline: casts, beam recipients, stacks, deaths, cumulative damage;
- the combat check: ATK order, haste, crit rate;
- the parameters the result depends on.

**Marginals.** For each damage-relevant cookie × line type (ATK%, amp, haste, crit, crit dmg), the sim adds one SSR weight-mean line and reports Δmedian and Δmean, with a common-random-numbers bootstrap interval. Swaps (reroll X → Y) are the difference of two such rows.

A row is flagged when its top-3 rank changes under any toggle: the ramp, the bucket structure, the override rule, the stacking, the element constant.

### 5.6 Parameters and provenance

Every model constant is a typed record in `packages/sim/src/params.ts`: `{ id, value, kind: "datamine" | "community" | "fitted" | "assumed", sources: string[], confidence }`.
- Datamine values come in as GameData (§7), cited by the rows that carry them.
- Community and assumed values cite curated source ids. A server test (§7.6) checks that every id exists in the imported sources.
- `MODEL_VERSION` increments on any change to the model or its defaults.

## 6. Revisions to the draft, in short

- **Wrong:**
  - the calibration point;
  - the haste and crit "unknowns";
  - Tea Knight's DEF;
  - the NOTES chance-as-magnitude readings;
  - the APK-name dependency (§4.1).
- **Over-scoped for v1:**
  - movement and collision entry;
  - stats from base × level × stars × research;
  - fitting many unknowns;
  - the optimiser;
  - survival physics.

  These are staged or replaced (§10).
- **Under-specified:**
  - the beam count rule;
  - the Cheesecake override;
  - synergies. The draft never models them, and they drive Brightseeker's damage (DPS: 4.50 → 7.59 MV/s) and Pomegranate's beams;
  - how buff stacks build;
  - pet tiers;
  - common random numbers for marginals;
  - which answers survive which assumptions.
- **Kept:**
  - the provenance-tagged parameters;
  - the named per-factor damage functions;
  - the boss ramp as a switchable scenario;
  - a full-fight recording as a ramp test (§9 V12).

## 7. Backend fit

### 7.1 `packages/sim` (new workspace package `@crumble/sim`)

A pure TypeScript package. It has no database, no Hono, no Node built-ins and no clock. Its only dependency is `zod`, for the input schemas.

```
packages/sim/
  package.json            exports "." (engine API) and "./input" (zod input schemas only)
  src/index.ts            runSim, runMarginals, calibrateK, MODEL_VERSION, types
  src/input.ts            simRunInput, simMarginalsInput, simCalibrateInput (zod)
  src/data.ts             GameData: the facts the service passes in (cookies, levels, skillGrades, buffValues, runeRolls, runeSlots, petPassives, synergyGrants, fightEvents)
  src/params.ts           model constants with provenance; the defaults and toggles
  src/rng.ts              seeded PRNG (sfc32), named sub-streams
  src/formulas/           stat.ts (Ne, Gn), damage.ts (Ar, crit tiers), buff.ts (jr), haste.ts, debuff.ts (Mr)
  src/kits/               brightseeker.ts, pomegranate.ts, milk.ts, macaron.ts, cheesecake.ts, skating-queen.ts, tea-knight.ts, tiger-lily.ts, herb.ts, generic.ts, index.ts (kit registry by cookie kr)
  src/engine/             clock/queue, team state, targeting, stacks, deaths, run.ts
  src/scenario/           luck draws, boss scenario (flat/ramp), death schedule
  src/analysis/           montecarlo.ts, marginals.ts (common random numbers), sensitivity.ts, calibrate.ts
  test/                   golden formula tests against the bundle, determinism, kit tests, the mechanism checks of §9, purity.test.ts
```

It's picked up by the root `vitest.config.ts` (`projects: ["packages/*", …]`) with no config change. The team, the scenario and the seeds are inputs; GameData is passed in and never read from disk.

### 7.2 Game data as cited content types

Game facts come from the committed captures through the existing importer. They're owned by record 001, where the captures live, and use the shared-fact semantics of `buff_values`: first loader owns the row, identical re-loads are skipped, a conflicting one fails.

New tables go in `packages/schema/src/tables/game.ts`, with drizzle-zod inputs and a new migration.

| Registry key | Table | Path | `CITED_ENTITY` | Natural key | Holds |
|---|---|---|---|---|---|
| `cookieStats` | `cookie_stats` | `/cookie-stats` | `cookie_stat` | `cookieKr` | gameId, element, role, received synergy (json), base ATK/DEF/HP/crit/crit dmg/speed/range, `starGrowth` (json per star: skillStep and growth %) |
| `cookieLevels` | `cookie_levels` | `/cookie-levels` | `cookie_level` | `level` | ATK/DEF/HP growth % |
| `skillGrades` | `skill_grades` | `/skill-grades` | `skill_grade` | (`cookieKr`, `skillGrade`) | `fromStar`, skills (json: label, cooldownS, conditional, zeroInitial), damages and heals (json: coef, asset), durations, counts, radius (json), granted-effect texts (json) |
| `runeSlots` | `rune_slots` | `/rune-slots` | `rune_slot` | `slot` | requiredStars |
| `runeRolls` | `rune_rolls` | `/rune-rolls` | `rune_roll` | (`statType`, `rarity`, `value`) | display value (÷ the `Pn` divisor), weight |
| `petPassives` | `pet_passives` | `/pet-passives` | `pet_passive` | (`petKr`, `tier`, `effectType`) | valuePct, target (`all`, or `synergy:<kr>`), the raw text |
| `synergyGrants` | `synergy_grants` | `/synergy-grants` | `synergy_grant` | id | granterKr, synergy (kr key), level, reach (`team`/`nearby`), note. **Curated**, not datamined. |

- Each entry has `content: {}` with an order, and `gloss` on the name column. `cookieStats` and `skillGrades` get a `cookie` filter (`sameName`), `runeRolls` a `stat` filter (`equals`).
- None has a `mode` column: they're game facts shared by every mode.
- Every catalog cookie and pet already resolves in the glossary (checked: none missing).

**Importer.**
- `apps/server/src/importers/game-data.ts`: `readGameData(recordDir, spec, sourceIds, glossaryKrs)` and `insertGameFacts(file, rows)`. The shared-fact step generalises `insertBuffValues`.
- `manifest.ts` gains a `gameData` block for record 001's `import.json`:

```json
"gameData": {
  "catalog": "evidence/12-glossary-src/cookieruncrumble_app_api_catalog_gameplay.json",
  "database": "evidence/12-glossary-src/cookieruncrumble_app_api_catalog_database.json",
  "bundle": "evidence/19-sugarpocket/skills-runes-1.4.002.json",
  "catalogSource": "web:sugarpocket-catalog",
  "bundleSource": "web:sugarpocket-bundle-1.4.002",
  "pets": ["와사비 문어", "핫도그도그", "색동 주머니", "판다만두"],
  "petPassiveEffects": {
    "Duration Synergy Receiving Ally ATK +{n}%": "AttackPointMultiplier@synergy:지속",
    "Ally Duration Synergy +{n}%": "SynergyBoost@synergy:지속",
    "Ally Skill AMP +{n}%": "AbilityAmplifyAddition@all",
    "Ally Lift RES +{n}%": "LiftResist@all",
    "Max HP +{n}%": "HealthPointMultiplier@all",
    "아군 띄우기 저항 {n}%": "LiftResist@all",
    "최대체력 {n}% 증가": "HealthPointMultiplier@all"
  }
}
```

- A passive's text is split on commas, and each part is matched against these patterns.
- The Korean patterns are needed because CAT has the Candy Shade Pouch tier-4 text only in Korean.
- An unmapped part fails the import, naming the pet and tier.
- `synergy_grants` is a curated collection, `curated/synergy-grants.json`, listed in `curated/manifest.json` and cited per row: web:crumbgg:dps, plus the M:"Pomegranate's beams" sources for 다발.
- The re-import of record 001 stays byte-identical apart from the new tables.

### 7.3 The sim service

- `apps/server/src/services/game-data.ts`: maps repo rows to `@crumble/sim`'s `GameData`. It's the only place that knows both shapes. It's memoised on a data fingerprint: the max `research_records.updated_at` plus the game-table counts, read through repos.
- `apps/server/src/services/sim.ts`: `createSimService(store)` → `{ model(), run(input), marginals(input), calibrate(input) }`. It validates cookie names against `cookie_stats` and throws `SimInputError` for unknown cookies or impossible inputs (rune lines beyond the star's slots).
- The cache is an in-process LRU (64 entries), keyed by `sha256(MODEL_VERSION | data fingerprint | canonical JSON of the input)`. Runs are deterministic, so the cache is exact.
- **Nothing is persisted.** Runs are derived, and personal team data must not reach the public `data/snapshot.json`. Team drafts live in the browser (§8.4).

### 7.4 The route

`apps/server/src/routes/sim.ts`, `simRouter(services.sim)`, mounted in `app.ts` as `.route("/sim", simRouter(services.sim))` so `AppType` carries its types.

| Method and path | Body (zod from `@crumble/sim/input`) | Returns |
|---|---|---|
| `GET /api/sim/model` | — | `MODEL_VERSION`, the parameters with provenance (for the toggles and chips), the rune line increments per stat and rarity, the cookies with kits |
| `POST /api/sim/run` | `{ team, scenario, seeds }` | the summary, the per-seed totals (the web bins them), contributions, the median-seed timeline, the combat check, `dependsOn`, warnings |
| `POST /api/sim/marginals` | the same, plus `lines?` and `cookies?` | the baseline plus one row per cookie × line: Δp50%, Δmean%, interval, flip flags |
| `POST /api/sim/calibrate` | `{ team, scenario, observedG: number[] }` (at least 10 runs) | K, the fitted median, spread checks (§9 AC4) |

- `team`: slots in formation order (cookieKr, level, stars, a sheet of ATK/HP/DEF/crit/crit dmg/amp/haste/DR/element dmg, rune lines), pets with tier, perks, and optionally power and the measured ATK per 1% on Milk.
- `scenario`: the toggles and luck parameters, the death schedule, and K.
- `SimInputError` maps to 422 `{ error: "sim_input", issues }` in `app.ts`'s `onError`.
- Marginals are a separate call because they cost about (cookies × lines + 1) × N runs.
- Everything runs on the server rather than in a web worker, so the web keeps the "types only via `hc`" rule and the cache sits in one place. Move it only if latency measures badly.

### 7.5 Wiring

- `services/index.ts` adds `sim: SimService` to `Services` and `createSimService(store)`.
- `packages/schema/src/enums.ts` adds the new `CITED_ENTITY` values.
- `apps/server/package.json` depends on `@crumble/sim`.

### 7.6 The architecture test

In `apps/server/test/architecture.test.ts`, `ROOTS` gains `packages/sim/src`, and these rules join the list:

- **"packages/sim is pure":** it imports only `zod` and its own files. No `node:*`, no other package.
- **"only server services import `@crumble/sim` values":** routes may import `@crumble/sim/input` (schemas) and types only; repos and db import nothing from it.
- **"the web imports nothing from `@crumble/sim`":** its types come through `AppType`.
- **"packages/schema imports nothing from `@crumble/sim`".**

Two more tests:
- `packages/sim/test/purity.test.ts` fails on `Math.random`, `Date`, `performance` or `crypto` in `packages/sim/src`.
- A server test checks that every source id cited in the `@crumble/sim` parameters exists in `/api/sources`.

## 8. Frontend fit

### 8.1 Where it lives: a Guild Conquest sub-tab

Add `{ id: "sim", label: "Simulator", to: "/conquest/sim" }` after "Piñata" in `CONQUEST.tabs`.

A shared tools section is the wrong home: the engine, its kits, its boss scenario and its presets are Piñata-specific, and the mode config already hosts mode-specific screens (`boss`). `ModeSection` gains `sim: SimConfig | null`, null for Arena and Rumble:

```ts
interface SimConfig {
  boss: string;            // fight events for the overlay ("pinata")
  presetDecks: string[];   // decks offered for prefill: ["cherry", "herb", "meso"]
  defaultDeck: string;     // "cherry"
  lede: string;
  seeds: number;           // default N
}
```

A future PvP sim would be another engine behind the same slot.

### 8.2 Files

- `routes/conquest/sim.tsx`: `<SimView mode={CONQUEST} sim={CONQUEST.sim} />`. Search params: `deck`, `seeds`, the toggles.
- `views/SimView.tsx`: queries, runs and the page layout.
- `app/team-draft.ts`: a hook over `localStorage` with try/catch, plus JSON export and import.
- `lib/sim.ts` (pure):
  - deck → draft: cookies with `level` or `level_rule` from `/api/decks/:id`; rune plans parsed from `/api/rune-builds?deck=` for the known phrasings ("All ATK%", "All skill amp", "Skill haste…"), falling back to a hint;
  - histogram binning;
  - team canonicalisation for query keys.
- `api/queries.ts`: `simModelQuery()`, plus `simRunQuery(input)`, `simMarginalsQuery(input)` and `simCalibrateQuery(input)`, keyed by the canonical input and enabled only after "Run". They're deterministic, so TanStack caching is correct. `api/types.ts` adds `SimModel`, `SimResult`, `SimMarginals` and `SimInput` via `InferResponseType`/`InferRequestType`.
- Components (props-only, new):
  - `TeamBuilder.tsx`: the 12 slots in formation order, styled like `Lineup`, with move up/down;
  - `SlotEditor.tsx`: cookie, level, stars, stat sheet, rune lines gated by `rune_slots` for the chosen stars;
  - `AssumptionPanel.tsx`;
  - `Histogram.tsx`: SVG, the same plot conventions as `Scatter`;
  - `ContributionBars.tsx`;
  - `MarginalTable.tsx`, wrapping `DataTable`.
- `FightTimeline.tsx` gains an optional `lanes` prop: labelled interval bars and point marks under the event track, for beam recipients per cast, Milk stacks, deaths and DR phases.

### 8.3 Page layout

1. **`ViewHeader`** and a calibration badge: "uncalibrated", or "calibrated to your median (n runs), K = …". Until the prospective test passes (§9 AC6), the marginal table carries an "unvalidated" pill.
2. **Team.**
   - `TeamBuilder` grid. "Prefill from deck" offers the preset decks and fills cookies, levels (level rules shown as hints), rune plans, pets and perks.
   - Stat sheets are kept per cookie in the saved account draft, so prefilling the Cherry deck picks up the user's own numbers.
   - Pets (with tier), perks, and team power for 배.
3. **Combat check.**
   - `AtkOrder` shows the computed in-battle ATK order, with beam recipients marked, the catcher's margin, and Octo Wasabi and perks applied.
   - Per-cookie combat haste and crit rate, set next to what the user sees in battle (Brightseeker 45 haste).
4. **Assumptions.** `AssumptionPanel` groups the toggles:
   - boss: DR flat / claimed;
   - buckets: boss DMG separate / shared with amp;
   - buffs: override / keep-larger, stacking rule;
   - luck: L1–L4 probabilities;
   - deaths: per-cookie schedule;
   - N and K.

   Each carries a `Pill` for its kind and `SourceChips`.
5. **Results.**
   - `Kv` summary: p50, p10–p90, expected best of 20, P(≥1T) and runs to get there, then 배 as secondary.
   - `Histogram`, with the user's logged median and best as reference lines.
   - `ContributionBars`.
   - `MarginalTable`: rows are cookie × line, columns Δp50%, ΔG, interval and "flips under". It's sortable, and swaps are selectable.
   - `FightTimeline`: the Piñata's fight events plus the median run's lanes.

**Reused:** `ViewHeader`, `Kv`, `AtkOrder`, `Lineup` (styles), `DataTable`, `FightTimeline`, `SourceChips`, `Pill`, `ConfidencePill`, `QueryResult`, `ErrorBox`, `EmptyState`, `CookieName`, and `formatG`/`formatRatio` from `lib/format.ts`.

### 8.4 Phone width

- One column.
- The team grid drops to 3 per row (the existing `.lineup` rule at ≤620px).
- `SlotEditor` opens inline under the grid, not as a modal.
- The assumptions sit in a closed `<details>`.
- The SVGs scale by `viewBox`.
- At ≤520px `MarginalTable` renders a ranked list (the top 10 rows as cards) instead of the table.
- Timeline lanes use the track's percentage positions.
- No horizontal page scroll. The agent-browser pass checks this at phone width in light and dark.

The team draft stays in the browser (localStorage, plus JSON export and import): it's personal data and the repo is public.

## 9. Validation

The documented runs in `curated/scores.json` publish damage and power but no stat sheets, so none of them can calibrate absolute damage. They serve as dimensionless and mechanism checks. The user's account is the only absolute calibration.

**Checks.** The mechanism checks are automated in `packages/sim/test/`.

| Id | Check | Target and source |
|---|---|---|
| V1 | Formula ports | Bit-exact against the bundle's `Ar`, `jr`, `Gn`, `Mr` and `Ne` on fixtures (SP-code) |
| V2 | Brightseeker throughput with no synergy | 4.50 MV/s ± 5% (DPS) |
| V3 | 4★ → 5★ Brightseeker (counts 2 → 3) | +25–47% team damage (curated `decks.json` Cherry, 브시커 why) |
| V4 | The haste curve | Brightseeker's haste marginal flattens past ~40 total. In a 30 s fight, 20 → 40 haste loses about 3.4% against amp (M:"Brightseeker haste breakpoint", nv:44761, dc:75934; medium). |
| V5 | Pomegranate Lv.1 vs Lv.100 | \|Δdamage\| < 1% (curated `decks.json` Cherry, 석류 why; dc:76135) |
| V6 | 다발 3 missed (5 beams) vs made (6) | Loss > 0. A stray beam onto Dark Choco costs damage, and a Scorpion catcher recovers it (curated `rng.json` "Who Pomegranate's beams hit"). |
| V7 | Macaron's crit | ≥300% combat crit rate at 10 stacks for a skill-amp Macaron (curated `decks.json` Cherry, 마카롱 why) |
| V8 | Cheesecake override | Cheesecake on Milk beats Milk alone, which beats Cheesecake on another carry: the 667K > 483K > 228K ordering (M:"Cheesecake's buff overrides Milk's", dc:55485) |
| V9 | Crit dmg vs crit rate | Above 100% rate, +10 crit dmg ≥ +10 crit rate (M:"Crit above 100%") |
| V10 | Linearity | Scaling every ATK by k scales damage by k, so power alone leaves 배 unchanged. The spread of 배 across the verified Cherry runs in `scores.json` (≈200–730×) then has to come from setup and luck, which is what the consistency check below tests. |
| V11 | Spread | For the user's team, p90/p50 and the expected best-of-20/p50 land inside the community bands: "500× in ~1 of 5, ceiling ≈ best of 20 + 10–20%" (dc:74815), "1T in 1–2 of 10 at 1.74G" (dc:75400), "150× floor, 250–350× average, 400×+ peak" (dc:71135). |
| V12 | Ramp discrimination (optional) | One full-fight recording with a running damage total. Under the claimed ramp, the slope drops at 10, 22 and 34 s; under flat it doesn't. |

**User calibration.**
- The user logs at least 20 runs of the current team, with scores, and enters the stat sheet and the Milk ATK% swap measurement.
- `POST /api/sim/calibrate` fits K to the median.
- The best logged run must fall between the sim's p90 and its expected best-of-n, where n is the number of logged runs.

**Consistency, reported but not gating.** Starting from the user's sheet, applying the setup the top Cherry runs document should move the median toward the 580–730× band of the verified 1.69–1.8G Cherry runs (`scores.json`: dc:74815, dc:75400, dc:76135):
- 4–6 haste lines on Brightseeker to about 45;
- 6 amp lines on the buffers;
- the catcher;
- 다발 3 on time.

A uniform ATK scale alone must not move it.

**Acceptance criteria for v1:**
- **AC1:** V1 passes bit-exact.
- **AC2:** determinism. The same input and seeds give byte-identical output. At N = 400, the half-width of the common-random-numbers interval on any top-5 marginal row is under 0.5% of the median; otherwise N is raised automatically and reported.
- **AC3:** V2 within ±5%. V3 inside its band. V4 shape: the haste marginal at 45 is under half its value at 20. V5 under 1%. V7 at least 300%. V8 and V9 hold.
- **AC4:** K reproduces the logged median, and the logged best sits in [p90, E(best of n)]. If not, the luck model is under-dispersed and the page says so.
- **AC5:** every result lists the assumed and fitted parameters it depends on. Marginal rows carry a flag whenever a top-3 rank flips under any toggle.
- **AC6 (the gate for dropping "unvalidated"):** a prospective test. The user makes one change the marginal table ranks highly and logs at least 20 runs. The observed median change has the predicted sign and lies inside the sim's 80% interval.

## 10. Staged scope

| Stage | Delivers | Done when |
|---|---|---|
| **S0: research** | Record `research/003-conquest-sim/`: question, method, the §9 checks as findings. A new capture of the bundle functions `Ne`, `Pn` and `Hn` with offsets (19-sugarpocket stays unedited). `curated/synergy-grants.json` in record 001. | Every id in `synergy-grants.json` resolves. |
| **S1: game data** | The tables of §7.2, the migration, the importer `gameData` block, the routes via the registry, and the importer and route tests | Record 001 imports; `/api/cookie-stats` etc. serve; the snapshot round-trips. |
| **S2: engine v1** | `packages/sim`: formulas, kits for the Cherry, Herb and Melon Soda deck cookies plus the generic kit, luck draws, the death schedule, flat/ramp, Monte Carlo, marginals, calibrate, the architecture rules | AC1–AC3 and AC5 green. |
| **S3: service and route** | `services/game-data.ts`, `services/sim.ts`, `routes/sim.ts`, the cache, the 422 mapping, the source-id test | Route tests pass with `app.request` on fixture data. |
| **S4: web** | The Simulator tab (§8) | View tests and the agent-browser pass (phone width, light and dark). |
| **S5: calibration** | The user's run log and sheet → K; AC4, then AC6 | AC4 reported; AC6 flips the badge. |
| v2 | Stats built from gear, runes, level and stars (DB options, plate rates, `Ne`/`Gn`, the ATK% base from S5). A survival model (HP/DR thresholds from M:"HP to survive the slam", M:"Surviving the 17 s wipe", boss ATK per FE, Milk's heal, Tea Knight's DEF). Level what-ifs (the catcher window). More kits. Luck fitted to the run log. | Survival reproduces the user's deaths without a script. |
| v3 | An optimiser over rune and gear allocation, levels, ATK order and swaps, with common random numbers and successive halving | Top recommendation validated like AC6. |

The plan for S0–S5 gets written with `superpowers:writing-plans` after this spec is approved (plan 5).

## 11. Open questions for the user

These are only the questions whose answers change the design.

1. **Will you enter your 12 lobby stat screens, swap one ATK% line on Milk and read the ATK change, and log at least 20 scored runs?**
   - If yes, v1 is calibrated to your account.
   - If not, v1 becomes relative-only: no G predictions, and no ATK% marginals.
2. **May that data be committed?** The repo is public.
   - If yes, it becomes record 003 evidence, and the calibration is reproducible from the repo.
   - If not, it stays in the browser and in a gitignored local file, and record 003 holds only the method.
3. **What does the game show you?**
   - An in-battle stat view: where does "45 haste in combat" come from?
   - A running damage total during the fight.
   - A per-cookie damage breakdown at the end.

   Each one changes the input form (lobby vs combat values) and adds a calibration target. The last two make the V12 ramp test and per-cookie calibration possible.
4. **Is "what is surviving the wipe worth" enough for v1**, with "what it takes to survive" in v2? Or do you want the survival model in v1? That would move the v2 survival row into S2 and add HP/DEF/DR to the calibration run.

## 12. File index

**New**
- `packages/sim/**` (§7.1)
- `packages/schema/src/tables/game.ts` and a new migration
- `apps/server/src/importers/game-data.ts`
- `apps/server/src/services/game-data.ts`, `apps/server/src/services/sim.ts`
- `apps/server/src/routes/sim.ts`
- `apps/web/src/routes/conquest/sim.tsx`, `apps/web/src/views/SimView.tsx`, `apps/web/src/app/team-draft.ts`, `apps/web/src/lib/sim.ts`
- `apps/web/src/components/{TeamBuilder,SlotEditor,AssumptionPanel,Histogram,ContributionBars,MarginalTable}.tsx`
- `research/003-conquest-sim/`
- `research/001-guild-conquest-meta/curated/synergy-grants.json`
- a new numbered evidence capture of the bundle functions

**Changed**
- `apps/server/src/registry.ts`, `apps/server/src/app.ts`, `apps/server/src/services/index.ts`, `apps/server/src/importers/manifest.ts`, `apps/server/test/architecture.test.ts`
- `packages/schema/src/enums.ts`
- `apps/web/src/app/modes.ts`, `apps/web/src/api/queries.ts`, `apps/web/src/api/types.ts`
- `apps/web/src/components/FightTimeline.tsx` (the `lanes` prop)
- `research/001-guild-conquest-meta/import.json`, `research/001-guild-conquest-meta/curated/manifest.json`
