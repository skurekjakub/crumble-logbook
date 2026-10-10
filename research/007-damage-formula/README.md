# 007 — The damage formula (Cookie Run: Crumble, client 1.5.002)

Status: active (read, curated and written up 2026-10-10)

Measured on 2026-10-10 from branch `worktree-agent-a37674bc6ef67b95a` (off `main` at `edf43ef`): the Android client 1.5.002 (`com.devsisters.cc`, Unity 6000.3.15f1, IL2CPP metadata v39, x86_64 split), its type layouts dumped with Cpp2IL 2022.1.0-pre-release.21 and its Burst-compiled `lib_burst_generated.so` read with Ghidra 12.1.4 headless. The method bodies in `libil2cpp.so` are encrypted at rest (AppSealing), so the damage system's Burst copy is the readable one. No decompiled code, assembly, dumped type file or APK piece is kept in this repo: the record holds the derived formula in its own words and math, with function names, addresses and struct offsets as citations. The curated dataset imports as the app's `damage_formula` rows (`pnpm import:record 007-damage-formula`, after records 001 to 006) and fills the Damage formula section (`/formula`).

## Question

As asked: put everything the decompile showed about damage into the app: what multiplies what, and what's worth upgrading.

As a falsifiable statement: the 1.5.002 client's code fixes how a hit's damage is computed precisely enough to name every multiplier, which stats share an additive bucket and which multiply, how crit tiers, misses, element, defense and the power penalty work, and where the community's damage model is right or wrong.

## Verdict

**Supported, except for the server-side constants.** A hit's damage is ⌊ATK × skill coefficient × (1 + final DMG) × 1 ÷ (1 + ln(1 + DEF_t ÷ C_def)) × element × (1 + skill amp) × (1 − DR_t) × (1 + boss DMG on bosses) × (1 + crit DMG × tiers) × power penalty⌋, floored at 0, after a miss roll that only happens against a target with Avoidance (`Crumble.DamageSystem.CalculatedDamage` @ 0x003f43b0). Every bracket is its own multiplier and inside a bracket battle bonuses add, except damage reduction, which stacks as a screen (`CombatBonusProperty.ApplyBonus` @ 0x00464530). The strongest reason: the multiplication chain is read straight off the disassembly in execution order, and crumblehub's independently reversed damage code (record 003) has the same factors in the same order. What the client can't say is the value of the defense constant, the element constants and the penalty tiers: they arrive in the server's `GameSetting` table.

## Reasoning

1. **The product and its order.** `evidence/01-damage-formula-analysis.md` § "The formula, step by step": the factors, the floor and the clamp at 0, read from `CalculatedDamage`. The skill coefficient is `DamageData.DamageMultiplier` (+0x118), inferred from its name and place.
2. **Crit is tiered and linear.** ⌊e⌋ sure tiers plus one more with probability e − ⌊e⌋, e = crit rate − crit RES; the expected multiplier is 1 + crit DMG × e with no breakpoint at 100%. Per equal point, crit rate is worth more while crit DMG > e, crit DMG after (§ "Crit tiers", § "Marginal value").
3. **Additive inside, multiplicative across.** `RecalculateCharacterModifierGroupJob.Execute` (@ 0x0042fed0) sums every enabled modifier's stacks; `ApplyBonus` applies the sums (§ "Inside a bucket"). So +1 skill amp point is worth 1 ÷ (1 + total amp) of damage, and boss DMG is a bucket of its own.
4. **Element can backfire.** Light and Dark beat each other; when the target's element beats the attacker's the reduction branch wins, so a Light hit on a Dark boss loses unless C_dec plus the boss's element RES is 0 (§ "Element").
5. **Defense is logarithmic.** 1 ÷ (1 + ln(1 + DEF_t ÷ C_def)): at DEF = C_def a hit keeps 59%, at 10 × C_def 29% (§ "Defense").
6. **The power penalty skips Guild Conquest.** It applies only to hits on the Enemy side; the arena, stage, Rift and daily dungeon controllers hold one, the Guild Conquest controller doesn't (§ "Combat-power penalty"; mode wiring inferred).
7. **The community model.** § "Community model against the code" holds each claim of record 001's `curated/mechanics.json`, the dc:82295 leak and record 003's power-gate mechanics against the code: crit tiers, DEF floor, lift-resistance stacking and the gate's place agree; the weapon-digit rule and the leak's "+1% amp ≈ +2%" disagree; Light on the Piñata and the leak's ATK figure stay open. Curated in `curated/formula-claims.json`.

## The steelman

*The case that the leak's "+1% skill amp ≈ +2% damage" is right:* a top player measured it on his own account, and skill amp is the stat every Conquest deck stacks first.

*Answer:* the damage step multiplies by 1 + amp, so a point there can never be worth more than 1% of damage, and his own calculator shows +0.45% (dc:82457), which fits an amp near 122%. Anything above that has to come from amp scaling the buffs the caster hands out, which happens where modifiers are created, outside the damage system and unread here. The leak may be right about the whole team, but not about the damage step.

## Recommendation

- Weigh each upgrade by the bucket it feeds: a point in a bucket at total T is worth 1 ÷ (1 + T). The emptiest bucket pays most.
- Crit: raise whichever of crit rate and crit DMG is lower; ignore crit-rate digits.
- Before trusting Light on the Dark Piñata, test a Light and a Fire cookie with equal stats.
- Open sub-choice: which constant to measure first. Recommendation: C_dec, since it settles the Light question that decides a Conquest slot.

## What would change

Code: the `damage_formula` rows, the formula tables (`packages/schema/src/tables/damage-formula.ts`), their import (`apps/server/src/importers/damage-formula-collections.ts`) and the Damage formula section (`apps/web/src/views/FormulaView.tsx`) land with this record. Once merged, `data/snapshot.json` is rebuilt from a fresh import of every record.

## Side findings

- **The constants are measurable in game.** Each one has a test in `curated/formula-constants.json`; crumblehub assumes C_def = 500, C_inc = 15% and C_dec = 0, which the client neither confirms nor refutes.
- **Record 003's power brackets are the penalty table**, measured from outside; its "PvP's correction is fixed at 100%" is unresolved, since the arena controllers do hold a PvP penalty from a server table.
- **The heal calculation** (`CalculatedHeal`) and the out-of-battle stat build weren't read; left open.

## Sources

- `web:client-1.5.002-damage-system` — this record's analysis of the client (`evidence/01-damage-formula-analysis.md`): every step, unit, stacking rule and constant.
- Record 001's sources for the community claims: dc:31349, dc:75589, dc:75854 (crit tiers and crit past 100%), dc:76333 (weapon digits), dc:82295 and dc:82457 (the leak and the calculator), dc:52401 and dc:75400 (lift resistance), dc:46452 and dc:71135 (the 8/27 amp change, DEF floor), dc:48412 and web:25737 (the Piñata's element), dc:81844 (DR ramp), dc:83118 and dc:55485 (buffs that don't stack), web:sugarpocket-bundle-1.4.002 (stat layering, buff and debuff formulas).
- Record 003's sources: web:crumblehub-formulas (crumblehub's damage code, the comparator) and web:crumblehub-stages (the power gate).

## Files

- `evidence/01-damage-formula-analysis.md` — the derived analysis: functions read, units, the formula step by step, stacking rules, marginal values, constants with how to measure them, the community comparison, confidence and open questions.
- `evidence/captures.jsonl` — the capture ledger.
- `curated/` — the dataset the app imports (its `manifest.json` lists the files): the steps, constants and claims, plus the stacking rules, crit rules, open questions and method as mechanics, and the upgrade verdicts as takeaways.
- `import.json`, `searches.json` — the import manifest; no saved searches, since the record reads the client rather than the community.
