# 007 — The damage formula (Cookie Run: Crumble, client 1.5.002)

Status: active (read, curated and written up 2026-10-10)

Measured on 2026-10-10 from the Android client 1.5.002 (`com.devsisters.cc`, Unity 6000.3.15f1, IL2CPP metadata v39, x86_64 split): its type layouts dumped with Cpp2IL 2022.1.0-pre-release.21 and its Burst-compiled `lib_burst_generated.so` read with Ghidra 12.1.4 headless, then checked against Milk's skill text and stat sheet in the same client the same day. The method bodies in `libil2cpp.so` are encrypted at rest (AppSealing), so the Burst copies of the damage and modifier systems are the readable ones. No decompiled code, assembly, dumped type file, decode key or APK piece is kept in this repo: the record holds the derived formulas in its own words and math, with function names, addresses and struct offsets as citations. The curated dataset imports as the app's `damage_formula` rows (`pnpm import:record 007-damage-formula`, after records 001 to 006) and fills the Damage formula section (`/formula`).

## Question

As asked: put everything the decompile showed about damage into the app: what multiplies what, and what's worth upgrading. Then: how a buffer's stats scale the buffs she gives.

As a falsifiable statement: the 1.5.002 client's code fixes how a hit's damage is computed, and how each buff's size is set from its caster, precisely enough to name every multiplier, which stats share an additive bucket and which multiply, how crit tiers, misses, element, defense and the power penalty work, which caster stats a buff reads and when, and where the community's damage model is right or wrong.

## Verdict

**Supported, except for the server-side constants and each skill's values.** A hit's damage is ⌊ATK × skill coefficient × (1 + final DMG) × 1 ÷ (1 + ln(1 + DEF_t ÷ C_def)) × element × (1 + skill amp) × (1 − DR_t) × (1 + boss DMG on bosses) × (1 + crit DMG × tiers) × power penalty⌋, floored at 0, after a miss roll that only happens against a target with Avoidance (`Crumble.DamageSystem.CalculatedDamage` @ 0x003f43b0). Every bracket is its own multiplier and inside a bracket battle bonuses add, except damage reduction, which stacks as a screen (`CombatBonusProperty.ApplyBonus` @ 0x00464530). Each buff line a caster hands out is ⌊value × base × (1 + her Skill AMP)⌋, base being 1 or her ATK, DEF or HP, sized once from her stats at cast; debuffs and final DMG lines take no amp (`CharacterModifierManagementSystem.CollectBonusProperties` @ 0x0044de70). The strongest reason: both chains are read straight off the disassembly, and crumblehub's independently reversed damage code (record 003) has the same factors in the same order. What the client can't say is the value of the defense constant, the element constants, the penalty tiers, the amp exclusion list and each skill's buff values: they arrive in the server's `GameSetting` table and the patch data.

## Reasoning

1. **The product and its order.** `evidence/01-damage-formula-analysis.md` § "The formula, step by step": the factors, the floor and the clamp at 0, read from `CalculatedDamage`. The skill coefficient is `DamageData.DamageMultiplier` (+0x118), inferred from its name and place.
2. **Crit is tiered and linear.** ⌊e⌋ sure tiers plus one more with probability e − ⌊e⌋, e = crit rate − crit RES; the expected multiplier is 1 + crit DMG × e with no breakpoint at 100%. Per equal point, crit rate is worth more while crit DMG > e, crit DMG after (§ "Crit tiers", § "Marginal value").
3. **Additive inside, multiplicative across.** `RecalculateCharacterModifierGroupJob.Execute` (@ 0x0042fed0) sums every enabled modifier's stacks; `ApplyBonus` applies the sums (§ "Inside a bucket"). So +1 skill amp point is worth 1 ÷ (1 + total amp) of one cookie's damage, and boss DMG is a bucket of its own.
4. **Element can backfire.** Light and Dark beat each other; when the target's element beats the attacker's the reduction branch wins, so a Light hit on a Dark boss loses unless C_dec plus the boss's element RES is 0 (§ "Element").
5. **Defense is logarithmic.** 1 ÷ (1 + ln(1 + DEF_t ÷ C_def)): at DEF = C_def a hit keeps 59%, at 10 × C_def 29% (§ "Defense").
6. **The power penalty skips Guild Conquest.** It applies only to hits on the Enemy side; the arena, stage, Rift and daily dungeon controllers hold one, the Guild Conquest controller doesn't (§ "Combat-power penalty"; mode wiring inferred).
7. **A buff's size comes from its caster.** `evidence/02-buff-scaling-analysis.md` § 1: amount = ⌊10000 × v × B × A⌋ per stat line, B = 1 or the caster's ATK, max(DEF, 0) or HP, A = 1 + the caster's Skill AMP, except A = 1 for Debuff-category modifiers (hard-coded) and for stat types on the server's exclusion list. Final DMG, knockback RES, airborne RES and heal-reduction lines are added raw. No skill level, crit or boss stat enters.
8. **Sized at cast, never rescaled.** § 2: the caster's in-battle stats are copied when the skill entity spawns (`SpawnSkillEntityJob.Execute` @ 0x00339990), and the amount is computed once when the buff lands. A buff the buffer holds when she casts enlarges that cast; one landing after does nothing for buffs already out; a recast replaces the value.
9. **Copies on one receiver.** § 3: the same modifier ID replaces the old copy, stack + 1 up to its cap, every stack at the newest value; the same group keeps only the largest stack × strength, strength including the caster's amp and ATK; ungrouped buffs sum.
10. **Debuff chance.** § 4: ApplyRate × (Focus_c ÷ Resist_t + Focus%_c − Resist%_t) for debuffs and crowd control; tenacity shortens them.
11. **Milk in game.** `evidence/03-ingame-2026-10-10/readings.md`: Gentle Remedy's "ATK Increase: 10% of Caster's Attack, stacks x10" is a Caster's-ATK line, and the text shows no Skill AMP term. With 7, each stack is 0.10 × her ATK × (1 + her Skill AMP): at the sheet's 1M 588K ATK and 75.80% amp, about 279K per stack, unless ATK is on the exclusion list. Swapping gear presets out of battle left her sheet and the header power unchanged, so the info screens can't compare gear.
12. **The community model.** `evidence/01` § "Community model against the code" and `evidence/02` § 8 hold each claim of record 001's `curated/mechanics.json`, the dc:82295 leak and record 003's power-gate mechanics against the code: crit tiers, DEF floor, lift-resistance stacking, buff amp scaling, the debuff exclusion, debuff chance and Cheesecake-buffs-Milk-first agree; the weapon-digit rule disagrees; "Cheesecake's buff overrides Milk's" agrees only in part; the leak's amp figure, Light on the Piñata and the leak's ATK figure stay open. Curated in `curated/formula-claims.json`.

## The steelman

*The case that the leak's "+1% skill amp ≈ +2% damage" is right:* a top player measured it on his own account, and skill amp is the stat every Conquest deck stacks first.

*Answer:* one cookie's damage step multiplies by 1 + amp, so a point there can never be worth more than 1% of that cookie's damage, and his own calculator shows +0.45% (dc:82457), which fits an amp near 122%. But the client also scales every buff a caster gives by 1 + her amp (`evidence/02` § 1), so amp across a team pays twice: through each carry's damage step, and through every amp-scaled buff the buffers hand out, a Skill AMP buff included, which then feeds the receiver's damage step. Team-wide, a point can be worth more than 1%. Whether it reaches 2% depends on each skill's values and the exclusion list, which the client doesn't carry. The leak is wrong for one cookie's damage step and unsettled for the team.

## Recommendation

- Weigh each upgrade by the bucket it feeds: a point in a bucket at total T is worth 1 ÷ (1 + T). The emptiest bucket pays most.
- Keep Skill AMP lines on buffers whose buffs are amp-scaled: +1 point lifts each of her buffs by 1 ÷ (1 + her amp). Milk keeps hers.
- Don't pay for amp on a cookie whose kit is debuffs or final DMG buffs: amp does nothing for those lines.
- Buff the buffer before she casts: a Pomegranate beam on Milk sizes her next buff, not the ones already out.
- Crit: raise whichever of crit rate and crit DMG is lower; ignore crit-rate digits.
- Before trusting Light on the Dark Piñata, test a Light and a Fire cookie with equal stats.
- Open sub-choice: which constant to measure first. Recommendation: C_dec, since it settles the Light question that decides a Conquest slot.
- Open sub-choice: how to pin Milk's buff value and the exclusion list without the patch data. Recommendation: a battle A/B, two gear presets differing in Skill AMP only, reading a carry's in-battle ATK after her buff lands.

## What would change

Code: the `damage_formula` rows, the formula tables (`packages/schema/src/tables/damage-formula.ts`), their import (`apps/server/src/importers/damage-formula-collections.ts`) and the Damage formula section (`apps/web/src/views/FormulaView.tsx`) land with this record. The buff findings ride on the same rows: buff mechanics under the stacking topic, claims and takeaways as data. Once merged, `data/snapshot.json` is rebuilt from a fresh import of every record.

## Side findings

- **The constants are measurable in game.** Each one has a test in `curated/formula-constants.json`; crumblehub assumes C_def = 500, C_inc = 15% and C_dec = 0, which the client neither confirms nor refutes.
- **Record 003's power brackets are the penalty table**, measured from outside; its "PvP's correction is fixed at 100%" is unresolved, since the arena controllers do hold a PvP penalty from a server table.
- **Group contests aren't a fixed priority.** Record 001's "Cheesecake's buff overrides Milk's" fits the code only if Cheesecake's buff outranked Milk's stacks at that moment, or the two share a modifier ID; re-test with Milk at full stacks.
- **Each skill's buff values aren't in the APK.** They live in `Modifiers.bytes` in the patch data, most likely in an asset-pack split that wasn't pulled; reading it would settle the base types, groups, max stacks and the leak's amp figure.
- **Star grade swaps skill prefabs** rather than scaling a value (inferred from layouts).
- **Not read:** the heal calculation (`CalculatedHeal`), the out-of-battle stat build, shields, damage over time, and when passive auras snapshot.

## Sources

- `web:client-1.5.002-damage-system` — this record's analysis of the damage system (`evidence/01-damage-formula-analysis.md`): every step, unit, stacking rule and constant.
- `web:client-1.5.002-buff-scaling` — this record's analysis of buff sizing (`evidence/02-buff-scaling-analysis.md`): the amount, the snapshot, stacking, groups, debuff chance.
- `web:ingame-2026-10-10-milk` — Milk's skill text and stat sheet under two gear presets (`evidence/03-ingame-2026-10-10/readings.md`).
- Record 001's sources for the community claims: dc:31349, dc:75589, dc:75854 (crit tiers and crit past 100%), dc:76333 (weapon digits), dc:82295 and dc:82457 (the leak and the calculator), dc:52401 and dc:75400 (lift resistance), dc:46452 and dc:71135 (the 8/27 amp change, DEF floor), dc:48412 and web:25737 (the Piñata's element), dc:81844 (DR ramp), dc:83118 and dc:55485 (buffs that don't stack, Cheesecake and Milk), dc:83255 and dc:83221 (Chardonnay's amp-exempt Push RES), dc:84290 (amp on a buffer over another dealer), web:sugarpocket-bundle-1.4.002 (stat layering, buff and debuff formulas).
- Record 003's sources: web:crumblehub-formulas (crumblehub's damage code, the comparator) and web:crumblehub-stages (the power gate).

## Files

- `evidence/01-damage-formula-analysis.md` — the derived damage analysis: functions read, units, the formula step by step, stacking rules, marginal values, constants with how to measure them, the community comparison, confidence and open questions.
- `evidence/02-buff-scaling-analysis.md` — the derived buff analysis: how a caster's stats size each buff line, the cast-time snapshot, same-ID and same-group stacking, debuff chance, where per-skill values live, amp's marginal value on a buffer, the community comparison, confidence and open questions.
- `evidence/03-ingame-2026-10-10/` — screenshots of Milk's skill text, her stat sheet under the Conquest and Power presets, and the main screen under each (kept local, gitignored), with `readings.md` transcribing their numbers and labels.
- `evidence/captures.jsonl` — the capture ledger.
- `curated/` — the dataset the app imports (its `manifest.json` lists the files): the steps, constants and claims, plus the stacking and buff rules, crit rules, open questions and method as mechanics, and the upgrade verdicts as takeaways.
- `import.json`, `searches.json` — the import manifest; no saved searches, since the record reads the client rather than the community.
