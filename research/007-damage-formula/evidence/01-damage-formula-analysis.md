# The damage formula of client 1.5.002, as derived from the game client

- captured: 2026-10-10
- kind: derived analysis (written by hand from a reverse-engineering session; no decompiled code, assembly or dumped type files are kept here)
- client: Cookie Run: Crumble 1.5.002 (`com.devsisters.cc`), Unity 6000.3.15f1, IL2CPP metadata v39, Android x86_64 split
- tools: Cpp2IL 2022.1.0-pre-release.21 (type and field layout dump from `global-metadata.dat`); Ghidra 12.1.4, headless, on `lib_burst_generated.so` (x86_64)
- why the Burst library: the method bodies in `libil2cpp.so` are encrypted at rest (AppSealing), so the managed C# is unreadable; the ECS damage system is Burst-compiled, so its machine code sits unencrypted in `lib_burst_generated.so`
- addresses: Ghidra addresses with image base `0x100000` (file VA = Ghidra address − `0x100000`)

## Functions read

| Function | Ghidra address | What it decides |
|---|---|---|
| `Crumble.DamageSystem.CalculatedDamage` | `0x003f43b0` | Every hit: miss roll, crit tiers, each multiplier, the floor, shields, HP |
| `Crumble.DamageSystem.OnUpdate` | `0x003fae10` | Per tick: refreshes the combat constants, applies heals, then damage |
| `Crumble.DamageSystem.TrySetConst` | `0x003fc080` | Copies the combat constants from their singletons into the system |
| `Crumble.DamageSystem.AppendDamageReport` | `0x003f31f0` | The damage number and its crit and miss flags |
| `Crumble.CharacterStatRecalculateSystem+RecalculateCharacterModifierGroupJob.Execute` | `0x0042fed0` | Sums every enabled battle modifier, stack by stack |
| `Crumble.CombatBonusProperty.ApplyBonus` | `0x00464530` | Applies the summed modifiers to the out-of-battle base stats |

Struct layouts come from the Cpp2IL dump: `DamageData` (0x178 bytes; the attacker's `CombatProperty` snapshot `FromProperty` at +0x18, `DamageMultiplier` at +0x118), `CombatProperty` (`_elementType` +0x04, `_attackPoint` +0x18, `_defensePoint` +0x20, `_criticalRate` +0x28, `_criticalDamageRate` +0x30, `_criticalResist` +0x38, `_accuracy` +0x40, `_avoidance` +0x48, `_accuracyPercent` +0x50, `_avoidancePercent` +0x58, `_damageDecrease` +0x60, `_abilityAmplify` +0x68, `_elementDamageBonus` +0x80, `_elementDamageDecrease` +0x88, `_bossDamageRate` +0xB0, `_finalDamageRate` +0xD0), `FinalStatData` (one `CombatProperty` at +0), `DamageSystem` (constants at +0x90 to +0xA8), `CombatConstSettingSingleton`, `GameSettingData`, `GameSettingInfo`, `ElementType`, `CharacterSide`, `DamageTextType`.

## Units

- Most rate stats are integer basis points: the stored value ÷ 10000 is the fraction (10000 = 100%). Crit rate, crit damage, crit resist, accuracy, accuracy %, avoidance, avoidance %, skill amp, element damage bonus and boss damage are of this kind.
- ATK and DEF are raw points held as doubles.
- Damage reduction and element damage reduction are doubles already in fractions (0.45 = 45%).
- Final damage rate is a 32-bit float fraction.
- A hit's skill coefficient (`DamageData.DamageMultiplier`) is a plain float, for example 1.552 for "155.2% of ATK".
- Every stat on both sides is stored obfuscated and integrity-tagged. A target whose stat block fails its tag check is skipped and a violation is flagged; a side whose block isn't marked encoded reads every stat as 0. Neither changes the arithmetic below.

## The formula, step by step, in the order the code runs

Write `a` for the attacker's snapshot (taken when the hit was created) and `t` for the target's live stats.

### 0. Which hits count

The target must carry its status and final-stat components. A map prop loses exactly 1 HP per hit unless the hit is a weak effect or its coefficient is 0.

### 1. Randomness

Each hit seeds a `Unity.Mathematics.Random` from the attacker's and the target's seeds and draws uniform floats in [0, 1). Damage is therefore deterministic given the two seeds (what server-side replay checking needs). The only random draws are the miss roll and the crit-tier roll; there is no damage spread.

### 2. Miss roll (gate)

Rolled only when the target's Avoidance is above 0 and the hit's coefficient isn't 0:

hit chance = clamp(Accuracy%ₐ + Accuracyₐ ÷ Avoidanceₜ − Avoidance%ₜ, 0, 1), every term in fractions.

A draw at or above the chance is a miss: the number shows as Miss (`DamageTextType` 4) and the hit deals nothing. Against a target with 0 Avoidance no roll happens and Accuracy is dead weight.

### 3. Crit tiers

e = CritRateₐ − CritResistₜ (fractions). k = ⌊e⌋, and one more tier with probability e − k. With n tiers, the crit multiplier is 1 + n × CritDamageₐ when n > 0, else 1. The hit shows as critical when n > 0.

The expected multiplier is exactly 1 + CritDamage × max(0, e): linear in crit rate, with no cap or breakpoint at 100%. 200% always crits twice; 198% crits once and a second time 98% of the time.

### 4. The product

The code multiplies in this order (each line is one factor):

1. ATKₐ
2. × DamageMultiplier (the hit's skill coefficient)
3. × (1 + FinalDamageRateₐ)
4. × 1 ÷ (1 + ln(1 + max(DEFₜ, 0) ÷ C_def))
5. × Elem
6. × (1 + SkillAmpₐ)
7. × (1 − DamageReductionₜ)
8. × (1 + BossDamageₐ) on a target carrying the boss tag, else × 1
9. × crit multiplier (step 3)
10. × Penalty when the target is on the Enemy side, else × 1

damage = max(0, ⌊product⌋).

### 5. Element

`ElementType`: Fire 1, Water 2, Grass 3, Light 4, Dark 5. Advantage pairs (attacker beats target): Fire over Grass, Water over Fire, Grass over Water, Light over Dark, Dark over Light.

- adv = ElementDamageBonusₐ + C_inc when the attacker's element beats the target's, else 0.
- res = ElementDamageReductionₜ + C_dec when the target's element beats the attacker's, else 0.
- Elem = 1 ÷ (1 + res) when res > 0, else 1 + adv.

Light and Dark beat each other, so a Light hit on a Dark target sets both adv and res, and the reduction wins whenever res > 0. A Light cookie therefore gains on a Dark boss only if C_dec plus the boss's element damage reduction is 0; otherwise it deals less than a neutral cookie. The Fire, Water and Grass cycle has no such overlap.

### 6. Defense

D = max(DEFₜ, 0); defense factor = 1 ÷ (1 + ln(1 + D ÷ C_def)). The natural log is inlined (identified by its ln 2 constant and the odd-power series coefficients). Damage never reaches 0 through DEF; it falls off logarithmically: at D = C_def the factor is 0.59, at 3 × C_def 0.42, at 10 × C_def 0.29. DEF shred is worth most against a low-DEF target and less as DEF grows (the slope is −1 ÷ (C_def × x × (1 + ln x)²) with x = 1 + D ÷ C_def).

### 7. Combat-power penalty

The target's `CharacterSide` (Player 0, Enemy 1) decides it: the multiplier applies only to damage dealt to the Enemy side, that is, the player's outgoing damage. Its value is `GameSettingData._combatPowerPenaltyDamageMultiplier`, set by `CombatPowerPenaltyController` from a `ContentCombatPowerPenalty` tier table keyed by the team's power as a share of the recommended power (PvE) or the enemy's power (PvP) (`CombatPowerPenaltyHelper.GetPvePenalty`, `GetStagePenalty`, `GetPvpPenalty`). The controllers that hold a penalty are the arena controllers (`ArenaBattleController`, base of Classic and Rumble), the stage waves (`StageBossWave`, `StageNormalWave`), the Dimensional Rift controllers and the daily dungeon. `GuildRaidBattleController` holds none, and `BattleSetupService.StartDungeonBattle` defaults the multiplier to 1.

### 8. After the number

An invincible target (`InvincibleTag`) shows the number but loses no HP. Shields (`ShieldModifierElement` entries in the target's damage-modifier buffer) absorb first, in buffer order; the rest comes off HP, floored at 0. Knockback, airborne and hit-flash handling follow and don't change the number.

## Inside a bucket: what adds and what multiplies

`RecalculateCharacterModifierGroupJob.Execute` loops over every enabled modifier (`Enabled`) and every stack it holds (`CurrentStack`) and sums each battle-bonus field. `ApplyBonus` then applies the sums to the out-of-battle base (`PlainCombatProperty`):

| Stat | Battle value |
|---|---|
| HP, ATK | ⌊base × (1 + Σ%) + Σflat⌋ |
| DEF | max(⌊base × (1 + Σ%) + Σflat⌋, 0) |
| Crit rate, crit damage, crit resist, accuracy, avoidance, speed, element damage bonus, boss damage, focus, resist | base × (1 + Σ%) + Σflat, in basis points |
| Skill amp, skill haste, accuracy %, avoidance %, focus %, resist % | base + Σflat |
| Final damage rate | base + Σflat ÷ 10000 |
| Damage reduction, element damage reduction | 1 − (1 − base) × Π(1 − bonusᵢ), clamped to [0, 1] |
| Knockback and airborne resistance | the same screen with the base, clamped to [0, 1] |
| Heal reduction, start-cooldown reduction | base + Σflat, clamped to [0, 10000] |

So every battle "+X% ATK" lands in one additive pool, and so does every "+X% skill amp" or "+X% boss damage". Damage reduction is the exception: its sources stack as a screen, so two 30% reductions give 51%, not 60%. The out-of-battle base (gear, runes, research, levels) is built in managed code (`OutBattleStatData`) that the encrypted `libil2cpp.so` hides; a flat ATK line there is multiplied by (1 + Σ battle ATK%).

## Marginal value of +Δ, by bucket

Because every bracket is its own factor, a gain in one bracket is worth Δ ÷ (that bracket's current value) of damage, whatever the other brackets hold:

- Final damage rate: Δ ÷ (1 + FDR).
- Skill amp: Δ ÷ (1 + Amp). At 100% amp, +1 point is +0.5% damage; at 122%, about +0.45%.
- Boss damage (bosses only): Δ ÷ (1 + Boss).
- Element bonus (advantage hits only): Δ ÷ (1 + EDB + C_inc).
- Crit rate: Δ × CDR ÷ (1 + CDR × e). Crit damage: Δ × e ÷ (1 + CDR × e). Per equal point, crit rate is worth more while CDR > e, crit damage once e > CDR: raise whichever of the two is lower. The break-even is e = CDR, not 100%.
- ATK: Δ_effective ÷ ATK, where a flat base line is first scaled by battle ATK%.

## Combat constants (server data)

`TrySetConst` copies them each update from `CombatConstSettingSingleton` and `GameSettingData`:

| Field | On `DamageSystem` | Authoring tooltip | Role |
|---|---|---|---|
| `_combatConstantDefense` (C_def) | +0x90 | 방어 상수: 피해 비율 계산 | Scales target DEF in the defense curve |
| `_combatConstantBaseElementDamageIncrease` (C_inc) | +0x98 | 공격자 속성 피해 증가 기본값 | Base bonus on an element advantage |
| `_combatConstantBaseElementDamageDecrease` (C_dec) | +0xA0 | 피격자 속성 피해 감소 기본값 | Base reduction when the target's element beats the attacker's |
| `_combatPowerPenaltyMultiplier` | +0xA8 | (from the penalty tier table) | Outgoing damage multiplier from team power |

None is in the APK: they arrive in the server-delivered `GameSetting` table (`GameSettingInfo` holds the defense constant as a double, the element ones as basis points, and the PvE and PvP penalty tier tables). The APK holds only `data.unity3d`, `global-metadata.dat` and `Resources/unity`, so the values come with the patch download. The constants that are in the binary: 10000 (the basis-point divisor), 1, 0, −1 (for the uniform draw), the log coefficients, and Miss's text type 4.

How to measure them without the table:

- C_def: two hits that differ only in target DEF; the damage ratio fixes C_def.
- C_inc: one cookie on an advantaged target and on a neutral one with equal DEF and reduction; ratio − 1 − its element bonus.
- C_dec and the Light/Dark question: a Light and a Fire cookie with equal stats on the Dark Piñata; Light below Fire means C_dec plus the boss's element reduction is above 0.
- Penalty: the community's stage power brackets (record 003, `curated/power-brackets.json`) are this tier table measured.

crumblehub's damage code (record 003, `evidence/03-sites/crumblehub_assets_formulas-B0zZ21YN.js`) assumes C_def = 500, C_inc = 15% and C_dec = 0 as defaults; the client doesn't confirm any of them.

## Community model against the code

| Community claim (where it's recorded) | What the code does | Verdict |
|---|---|---|
| Crit past 100% rolls extra tiers: 200% crits twice, 198% once plus 98% for a second (record 001 mechanics "Crit tiers") | ⌊e⌋ tiers plus one with probability frac(e) | Agrees exactly |
| Each tier adds 50% plus bonus crit damage (001 "Crit tiers") | Each tier adds the full crit-damage stat; a 50% base would be data, not code | Consistent |
| Past 100%, +10% crit damage beats +10% crit rate (001 "Crit above 100%") | Expected crit is 1 + CDR × e; crit damage wins only while e > CDR | Partly: 100% is not the threshold |
| Weapon line: take crit rate when the last two digits are 30 or more (001 "Weapon: crit rate or crit dmg") | Expected damage is linear in crit rate; the digits change variance only | Disagrees |
| The raid boss has no crit resistance (001 "Crit above 100%") | Crit resist subtracts straight from crit rate | Consistent; the boss's value is data |
| Accuracy is useless on the boss (001 "Boss") | No miss roll when the target's Avoidance is 0 | Consistent if the boss has 0 Avoidance |
| Enemy DEF floors at 0 (001 "Skill amp nerf (8/27)") | max(DEF, 0) at stat apply and in the damage step | Agrees |
| Skill amp +1% ≈ +2% damage (the leak dc:82295, 001 "Stat weights on the Season 6 #1's account") | The damage step gives Δ ÷ (1 + Amp), never more than 1% | Disagrees for the damage step; any extra must come from amp scaling the caster's buffs |
| His calculator: amp +1% ≈ +0.45%, crit damage +1% ≈ +0.38% (dc:82457) | 0.01 ÷ (1 + Amp) gives Amp ≈ 122%; the crit figure fits e ÷ (1 + CDR × e) | Consistent for plausible stats |
| Crit damage +15% ≈ +4%, crit rate +15% ≈ +3% (dc:82295) | The ratio of the two gains is e ÷ CDR | Consistent; implies e ÷ CDR ≈ 1.3 on his account |
| ATK +650 ≈ +2.5% (dc:82295) | ATK is linear; a flat base line is scaled by battle ATK% | Unresolved: needs his base ATK |
| The Piñata is Dark, weak to Light (001 "Piñata's weakness") | Light beats Dark, but Dark beats Light too, and the target-side reduction overrides when C_dec + the boss's element reduction > 0 | Unresolved: hinges on server constants |
| Boss damage reduction ramps 10/30/50/70/90% (001 "Damage reduction ramps every 12 s") | 1 − DRₜ, with DR stacking as a screen | Consistent; early damage is worth more |
| Lift resistance stacks as base + extra − base × extra (001 "Lift resistance stacking") | Knockback and airborne resistance stack as a screen | Agrees exactly |
| Crit buffs don't stack; Cheesecake's ATK buff overrides Milk's (001 "Crit buffs don't stack", "Cheesecake's buff overrides Milk's") | Modifiers carry a group id and only enabled ones are summed | Consistent; group resolution sits in a system not read |
| Skill amp no longer boosts stat-reduction debuffs (001 "Skill amp nerf (8/27)") | The settings carry an amp-exclusion list | Consistent; the list is data |
| Debuff chance = base × (focus ÷ resist + focus% − resist%) (001 "Debuff application chance") | Hit chance has the same shape for accuracy and avoidance | Consistent; the debuff code wasn't read |
| Buffs scale with the caster's skill amp: ⌊base × value × (1 + amp)⌋ (001 "Buffs scale with the caster's skill amp") | Happens where modifiers are created, outside the damage system | Unresolved |
| Stat layering ⌊base × (1 + Mul) + Add⌋ (Sugar Pocket bundle, record 001 `evidence/19-sugarpocket/`) | ApplyBonus does exactly this for HP, ATK and DEF | Agrees |
| The power gate multiplies final damage, last (record 003 "The power gate is a step function on final damage") | The penalty is the last factor before the floor | Agrees |
| Only your team's damage is cut by the gate (003 "What the gate does not touch") | The penalty applies only to damage dealt to the Enemy side | Agrees |
| The same table gates daily dungeons, the Implant Tower and the Rift (003 "The same table gates other content") | The Rift and daily dungeon controllers hold a penalty; Guild Conquest's doesn't | Agrees for the Rift and daily dungeons; the Implant Tower wasn't traced |
| crumblehub's damage code: the same factors in the same order, the same element override, crit tiers and hit chance (003 `crumblehub_assets_formulas-B0zZ21YN.js`) | Same factors, same order, same override | Agrees; its constant defaults are unconfirmed |
| Guild Conquest damage is ranked by damage, and power doesn't change it (the user's ranking rule) | Guild Conquest's controller has no penalty hook | Agrees for Guild Conquest; in Arena and stages power moves damage through the tier table |

## Confidence

| Step | Confidence | Basis |
|---|---|---|
| Field layout and units | Read | Cpp2IL layouts; the same field decodes the same way on attacker and target |
| Miss roll | Read | Read from the decompile; the text type matches `DamageTextType.Miss` |
| Crit tiers and multiplier | Read | Decompile and disassembly (the floor rounding mode, the integer tier, 1 + n × CDR) |
| Skill amp, boss, final damage rate, damage reduction | Read | Decompile and the multiplication chain in the disassembly |
| Defense curve | Read | The inlined log identified by its coefficients and ln 2 |
| Element tables and the override | Read | Jump tables decoded from read-only data; the compare that picks the reduction |
| Floor and clamp at 0 | Read | Floor rounding and the max with 0 |
| Penalty: which side | Read | The side check |
| Penalty: which modes | Inferred | Controller fields and the default argument of 1 |
| DamageMultiplier is the skill coefficient | Inferred | Its name and place only |
| Attacker stats are a snapshot from when the hit was created | Inferred | `FromProperty` is copied into `DamageData`; the writer wasn't read |
| Buff sums and ApplyBonus | Read | Read from the Burst code |
| Out-of-battle stat build (gear, runes, research) | Unknown | Managed code in the encrypted `libil2cpp.so` |

## Open questions

- The values of C_def, C_inc, C_dec and the penalty tiers (server data; measurement plan above).
- Whether Light gains on the Dark Piñata (C_dec and the boss's element reduction).
- Base crit damage (the community's 50%) and the boss's DEF, damage reduction, crit resist and avoidance: all data.
- How skill amp scales buffs: where modifiers are created, outside the damage system.
- The heal calculation (`CalculatedHeal`) wasn't analysed.
