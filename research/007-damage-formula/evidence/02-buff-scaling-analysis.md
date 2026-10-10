# How a buffer's stats scale the buffs she gives, as derived from the game client

- captured: 2026-10-10
- kind: derived analysis (written by hand from a reverse-engineering session; no decompiled code, assembly, dumped type files or decode keys are kept here)
- client: Cookie Run: Crumble 1.5.002 (`com.devsisters.cc`), Unity 6000.3.15f1, IL2CPP metadata v39, Android x86_64 split
- tools: Cpp2IL 2022.1.0-pre-release.21 (type and field layouts from `global-metadata.dat`); Ghidra 12.1.4, headless, on `lib_burst_generated.so` (x86_64)
- addresses: Ghidra addresses with image base `0x100000`, as in `01-damage-formula-analysis.md`
- companion to `01-damage-formula-analysis.md`, which covers what the receiver does with the sums (§ "Inside a bucket"); this file covers how each buff's amount is set on the caster's side, when, and how copies of a buff combine on one receiver

## Functions read

| Function | Ghidra address | What it decides |
|---|---|---|
| `Crumble.CharacterModifierManagementSystem.CollectBonusProperties` | `0x0044de70` | A landed modifier's amount on each stat it touches, from the caster's stats |
| `Crumble.CharacterModifierManagementSystem.OnUpdate` | `0x0044f120` | The add-modifier pipeline: same-ID replacement, stack count, lifetime, group immunity |
| `Crumble.CharacterModifierManagementSystem.GetGroupRankBaseProperty` | `0x0044eaa0` | The receiver's out-of-battle base used to rank grouped modifiers |
| `Crumble.CharacterModifierManagementSystem.StackReservedModifier` | `0x00456630` | Two requests for the same modifier on one character in one tick |
| `Crumble.CombatBonusProperty.AddProperty` | `0x004567d0` | Adds one stat line's amount into the receiver's bonus field |
| `Crumble.CombatBonusProperty.ToGroupRankValue` | `0x00456a20` | Puts a line's amount on one scale for group contests |
| `Crumble.SkillEntitySpawnerSystem+SpawnSkillEntityJob.Execute` | `0x00339990` | Copies the caster's in-battle stats into the skill entity |
| `Crumble.AddCharacterModifierOnHitSystem+AddCharacterBuffOnEffectJob.Execute` | `0x003deae0` | Rolls a modifier's apply chance per target; tenacity |
| `Crumble.AddCharacterModifierToCasterSystem.OnUpdate` | `0x0042d310` | The same for modifiers a skill puts on its own caster |
| `Crumble.CharacterStatRecalculateSystem+RecalculateCharacterModifierGroupJob.Execute` | `0x0042fed0` | Which modifiers are enabled (groups, state triggers), then the sums |
| `Crumble.StateTriggerConditionCheckSystem.EvaluateHaveModifier`, `EvaluateModifierCount` | `0x0030b170`, `0x0030b330` | Conditions such as "while holding a modifier of group g" |
| `Crumble.PassiveModifierManagementSystem.OnUpdate` | `0x00409580` | Passive auras' modifier requests (snapshot timing not settled) |

Field names on the modifier side come from the Cpp2IL layouts: `SkillCasterData` (the caster's `CombatProperty` copy at +0x10), `ModifierData` (`Category` +0x0C, `ApplyRate` +0x10, `MaxStack` +0x34, `IgnoreTenacity` +0x38, `IgnoreResist` +0x39), `CombatBonusElement` (calculate type, base type, field type, a basis-point value and a double value), `CharacterModifierElement` (`CombatBonus` +0x10, `Enabled`, `CurrentStack`, `GroupId`), `ClientOnlyBonusPropertyElement`, `ModifierCategory` (Debuff 2, ActionControl 3), `StatCalculateBaseType` (None 0, Fixed 1, CastersAttackPoint 2, CastersDefensePoint 3, CastersHealthPoint 4).

## 1. A buff's amount

Each modifier carries one or more stat lines (`CombatBonusElement`). For each line `CollectBonusProperties` computes, once, when the modifier lands on its receiver:

amount (basis points) = ⌊10000 × v × B × A⌋

- **v** is the line's value: a basis-point value ÷ 10000, or a double. Double lines are allowed only for damage reduction and element damage reduction, and those combine as a screen, clamped to [0, 1], as on the receiver side.
- **B** is the line's base: 1 for a Fixed line; the caster's ATK, max(DEF, 0) or HP for a line based on the caster's stat, in raw stat points. A line with no base is skipped.
- **A** is the amp factor: 1 + the caster's Skill AMP (fraction), except
  - A = 1 for every line of a modifier whose category is Debuff (a hard-coded category compare), and
  - A = 1 for a line whose stat type is on the amp exclusion list (`CombatConstSettingSingleton.AbilityAmplifyExclusion`, filled from `GameSetting.IgnoreAbilityAmplifyCombatPropertyCalculateType`, proto field 301). The list arrives with the server's settings; the client doesn't carry it.
- `AddProperty` then adds the amount into the receiver's bonus field for that stat. Several lines of one modifier add.

The amount is in the receiver's bonus units, so a Caster's-ATK line with v = 0.10 adds 0.10 × caster ATK × A flat ATK points to the receiver, which `ApplyBonus` then adds after the receiver's ATK% pool (`01-damage-formula-analysis.md` § "Inside a bucket").

**Lines added raw.** `ClientOnlyBonusPropertyElement` lines take neither a base nor the amp factor: knockback resistance, airborne resistance, final damage rate and heal reduction. A "final DMG +X%" buff is therefore the same size whoever gives it. That final damage buffs use this element rather than an ordinary stat line is inferred from the type split; the raw add itself is read.

**What isn't read at apply time.** No skill level, star grade, crit, boss DMG or element stat reaches `CollectBonusProperties`. Star grade picks a different set of skill and passive prefabs at battle setup (`SkillGradeType` S0, S1, S3, S5, S7, S9 from `CookieGradeInfo.SkillStep`; `CharacterModel.SelectSkillList`, `SelectPassiveIds`), each with its own modifier IDs and values: inferred from the layouts, since those bodies are managed code.

**Duration** isn't scaled by amp. A modifier's lifetime is its lifetime coefficient × the skill's lifetime × max(1 + the matching synergy stat × the skill's synergy value, 0) (`OnUpdate`); the synergy stat is the one the skill names (Duration, AoE, …). For debuffs the coefficient carries tenacity (§ 4).

## 2. When the caster's stats are taken: a snapshot

1. `SpawnSkillEntityJob.Execute` copies the caster's whole in-battle `FinalStatData` (her stats after her own buffs) into the `SkillCasterData` the skill entity carries. Read.
2. Child skill entities take the parent's `SkillCasterData` (`SpawnSkillChildEntityJob.Execute` signature), so delayed and pulsing pieces of one cast keep the cast-time stats. Inferred from the signature.
3. Buff requests, on hit or onto the caster, copy that `SkillCasterData` into the request. Read.
4. `CollectBonusProperties` has one call site, in `OnUpdate`'s add path, and its result is stored on the receiver's modifier element. `RecalculateCharacterModifierGroupJob` only re-sums stored amounts and never reads the caster again. Read.

So a buff is sized by what the buffer held **when she cast**:

- A buff the buffer holds when she casts (ATK for Caster's-ATK lines, Skill AMP for every amp-scaled line) makes every buff of that cast bigger, and those buffs keep that size until replaced.
- A buff she receives after casting does nothing for the buffs already out.
- A recast replaces the old copy with one sized from the new snapshot (§ 3), so a cast made while she is unbuffed can lower an active buff.

`ScaleModifierRecalculateSystem` doesn't rescale stats: it handles the Scale modifier type (model size, effect size, HP bar width).

Passive auras (`PassiveModifierManagementSystem`) are probably snapshots too: their entities are spawned once from the owner's `FinalStatData`, and the system reads a full stat block before it emits requests. Which entity's stats it reads, and whether they change after battle start, wasn't settled.

## 3. Copies of a buff on one receiver

**Same modifier ID** (`OnUpdate`, `StackReservedModifier`; read). The receiver's existing copy is destroyed and replaced: the new copy carries the new caster's amount, a fresh lifetime, and stack = min(old stack + 1, `MaxStack`). The caster isn't compared, so two buffers casting the same modifier merge. The sum counts the stored amount once per stack, so the total is stack × the newest amount. A modifier with `MaxStack` 1 only refreshes.

**Same group, different IDs** (`RecalculateCharacterModifierGroupJob.Execute`; read). For each group ID only one modifier stays enabled: the one with the largest stack × strength, ties going to the later one; the others are switched off, not removed. Strength is the line's amount on that receiver, caster amp and caster ATK included, put on one scale by `ToGroupRankValue`: an additive line counts its amount, a multiplier line its amount × the receiver's out-of-battle base stat (`GetGroupRankBaseProperty`), so an ATK% buff and a flat ATK buff compare in ATK points. A receiver immune to a group drops its requests outright (`IsGroupImmune`).

**No group**: every copy sums.

**State triggers.** A modifier with a state trigger is disabled until its condition holds. `EvaluateHaveModifier` tests for an enabled modifier of a group; `EvaluateModifierCount` counts enabled modifiers of a category (instances, not stacks).

## 4. Debuff apply chance and duration

`AddCharacterBuffOnEffectJob.Execute` (and the to-caster path) rolls each modifier's `ApplyRate` per target. For the Debuff and ActionControl categories, unless the modifier ignores resist:

chance = ApplyRate × (Focus_c ÷ Resist_t + Focus%_c − Resist%_t), with Focus_c ÷ Resist_t taken as 1 when the target has no Resist

with the caster's Focus and Focus% from her snapshot and the target's Resist and Resist% live. The roll happens only when the chance is under 100%. The same categories take a lifetime coefficient of 1 − Tenacity_t unless the modifier ignores tenacity, and a coefficient at or below 0 means the modifier isn't applied. ActionControl modifiers also skip targets immune to action control. Every other category lands at its ApplyRate with no focus term. Field names here come from matching each read to its `CombatProperty` field (`CombatProperty.ToPlain` @ `0x00312510`).

## 5. Where the per-skill values live

The stat lines (value, base, stat type, category, group, max stack, apply rate, lifetime, the ignore flags, state triggers) are rows of `Modifiers.bytes`, a protobuf table in the patch data (`ModifierTable`, `ModifierEntityFactory.GetOrCreateEntity`). Which modifier a skill applies and its hit coefficients sit in the entity prefabs; the star-to-skill-step map in `CookieGradeTable`. None of these is in the APK splits read: they come in an asset pack or the patch download. So which buffs are Fixed or Caster's-ATK based, which share a group, their max stacks and the exclusion list all stay data.

## 6. Marginal value of Skill AMP on a buffer

For a buffer with amp A_B, +ΔA scales every one of her amp-scaled lines by (1 + A_B + ΔA) ÷ (1 + A_B): +1 point lifts each line by 1 ÷ (1 + A_B). What that does for an ally k depends on the bucket the line feeds (`01-damage-formula-analysis.md` § "Marginal value"):

d ln D_k ÷ dA_B = Σ over her lines enabled on k of v_i × (slope of k's damage in that stat)

with an ATK line counting v_i × B ÷ (k's battle ATK) when it is based on the buffer's ATK. For a carry C, amp on herself pays 1 ÷ (1 + A_C) through her own damage step plus the same sum over any amp-scaled lines she gives herself. Amp on the buffer beats amp on the carry once her lines reach enough of the team's damage, and each extra line she gives (ATK, Skill AMP, crit) adds a term.

Illustration with made-up stats: a buffer giving +40% ATK (Fixed) to a carry whose battle ATK pool is 2.0× gives +10 amp points worth 0.1 × 0.4 ÷ 2.0 = +2.0% to each carry she reaches; +10 points on a carry at 150% amp is +4.0% to that carry.

A buff that grants Skill AMP is itself scaled by its giver's amp, then multiplies the receiver's damage step through (1 + Amp), and, if the receiver is a buffer, the buffs of her next cast. This is how amp across a team can be worth more per point than one cookie's damage step.

## 7. In-game check (2026-10-10, `03-ingame-2026-10-10/`)

- Milk's Gentle Remedy (her V skill) reads "ATK Increase: 10% of Caster's Attack, stacks x10, duration 2.5 s": a Caster's-ATK line. The skill text shows no Skill AMP term and marks no line as unaffected by Skill AMP.
- Out of battle, swapping the gear preset from Conquest to Power changed neither her stat sheet nor the header power, so the info screens can't compare gear; a real comparison needs battle numbers.
- With § 1: each stack of Milk's buff = 0.10 × her in-battle ATK × (1 + her Skill AMP), unless ATK is on the exclusion list. At her sheet's ATK of 1M 588K and Skill AMP of 75.80% that is about 279K ATK per stack, about 2.79M at 10 stacks (the in-battle ATK is higher than the sheet's once her own buffs apply). Her Skill AMP line feeds her buff.

## 8. Community claims against this

| Community claim (where it's recorded) | What the code does | Verdict |
|---|---|---|
| Buffs scale with the caster's skill amp: ⌊base × value × (1 + amp)⌋ (record 001 "Buffs scale with the caster's skill amp", from Sugar Pocket's code) | ⌊10000 × v × B × (1 + caster amp)⌋, the caster's amp, not the receiver's; not for debuffs or excluded stat types | Agrees |
| A share-of-stat buff scales with that stat (001 "A share-of-stat buff scales with that stat") | B is the caster's ATK, max(DEF, 0) or HP | Agrees |
| Skill amp no longer boosts stat-reduction debuffs (001 "Skill amp nerf (8/27)") | Debuff-category modifiers never take amp: a category compare in the code | Agrees |
| Debuff chance = base × (focus ÷ resist + focus% − resist%), no resist counts as 1 (001 "Debuff application chance") | The same expression, for Debuff and ActionControl modifiers | Agrees |
| Chardonnay's crit buff scales with amp; only Push RES doesn't (001 "Chardonnay's crit buff scales with skill amp") | Crit lines take the amp factor unless excluded; knockback and airborne RES lines are added raw | Agrees |
| Crit buffs don't stack: Chardonnay replaces Macaron (001 "Crit buffs don't stack") | Same group: only the largest stack × strength counts | Consistent; whether they share a group is data |
| Cheesecake's ATK buff overrides Milk's on the same cookie: 228K kept over Milk's 483K (001 "Cheesecake's buff overrides Milk's") | In a shared group the larger stack × strength wins, not a fixed order; a shared modifier ID would make the later one replace the other | Partly: "don't stack" fits; a fixed priority holds only if Cheesecake's ranks higher at the contest (Milk's stacks still low) or they share an ID |
| Best case: Cheesecake buffs Milk, whose buff then gives 667K (001, same mechanic) | Milk's line is based on her ATK at cast, after the buffs she holds, Cheesecake's included | Agrees; the 667K figure itself is data |
| Pomegranate's skill amp beams belong on the buffers (001 "Six recipients, six beams") | Amp held at cast scales every amp-scaled buff of that cast | Consistent; the size is per-skill data |
| Leak: skill amp +1% ≈ +2% damage (dc:82295) | One cookie's damage step gives at most 1 ÷ (1 + amp); amp on buffers also scales their buffs, so team-wide a point can be worth more | Unresolved: the mechanism exists; its size needs the per-skill values |

## Confidence

| Finding | Confidence | Basis |
|---|---|---|
| amount = ⌊10000 × v × B × A⌋, B ∈ {1, caster ATK, max(caster DEF, 0), caster HP} | Read | `CollectBonusProperties` and its disassembly |
| A = 1 + caster amp; 1 for the Debuff category and for excluded stat types | Read | The category compare and the exclusion mask; the list is data |
| Final DMG, knockback RES, airborne RES and heal reduction lines added raw | Read | The raw add; that final damage buffs use it is inferred |
| Caster stats are her in-battle stats, copied when the skill entity spawns | Read | `SpawnSkillEntityJob.Execute` and the `CreateSkillEntity` signature |
| Child skill entities keep the parent's snapshot | Inferred | Job signature |
| The amount is computed once and never re-read | Read | Single call site; the sums use the stored amount |
| Same ID: replace, stack + 1 up to MaxStack, newest amount on every stack | Read | `OnUpdate`, `StackReservedModifier`, the per-stack sum |
| Same group: largest stack × strength enabled, ties to the later | Read | `RecalculateCharacterModifierGroupJob.Execute` |
| Strength includes caster amp and ATK; multiplier lines × receiver base | Read | `CollectBonusProperties`, `ToGroupRankValue` |
| Debuff chance with focus and resist; tenacity on lifetime | Read | `AddCharacterBuffOnEffectJob.Execute` |
| Star grade swaps skill prefabs, no level term | Inferred | Layouts |
| Passive auras' snapshot timing | Unknown | Partly read |
| Per-skill values, groups, max stacks, categories, the exclusion list | Unknown | `Modifiers.bytes` and `GameSetting`, not in the APK |
| Shields (`AddShieldModifierSystem`), damage over time (`DamageOverTimeModifierSystem`) | Not read | |

## Open questions

- Each skill's values, base type, category, group and max stack: patch data.
- Which stat types the server's amp exclusion list holds (8/27 says damage-reduction buffs, per record 001).
- Whether passive auras snapshot at battle start or follow the owner's stats.
- How shields and damage over time scale.
- How much team damage +1% Skill AMP on every cookie buys: needs the per-skill values or a battle A/B.
