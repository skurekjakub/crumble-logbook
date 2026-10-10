# Damage Formula Tracking Plan

> **For agentic workers:** this plan tracks the damage-formula work task by task. Steps use checkbox (`- [ ]`) syntax; tick a box in the same commit as the work it names.

**Goal:** The client's damage formula, the buff scaling behind it and an in-game check of both are published in record 007 and a "Damage formula" page, and the account roadmap's payoffs follow them.

**Sources:** client 1.5.002 (x86_64). The damage step is decompiled from `lib_burst_generated.so` with Ghidra; `libil2cpp.so` is encrypted by AppSealing and isn't touched. Decompiled output stays in the scratchpad; only the derived formula, cited by function name and address, reaches the repo (AGENTS.md: raw APK or decompiled artefacts never go in the repo).

## Global Constraints

- Rank by damage, never by 배.
- The repo is public: no account identifiers, local paths or other players' names. Captured media stays local with a ledger line.
- `pnpm verify` passes before every commit; every commit is pushed (fetch first, fast-forward only).
- The game is read only while the user says it's free. Any setting changed for a test (gear preset, perks) is put back before stopping.
- Reviews run on Opus.

## Task 1: Derive the damage formula

- [x] Install REA and the RE toolchain (Ghidra, Cpp2IL) globally.
- [x] Extract the client libraries; find the readable Burst library.
- [x] Decompile `DamageSystem.CalculatedDamage` and the stat recalculation; write the formula with its buckets, crit tiers, DEF curve, element and penalty terms.
- [x] Fix the roadmap's Skill AMP payoff to the formula (`daf9e0f`).

## Task 2: Record 007 and the "Damage formula" page

- [x] Build record 007-damage-formula and the page in a worktree lane (agent).
- [x] Merge `--no-ff`; check that no decompiled artefact was committed (`e67eb06`).
- [x] `pnpm capture verify`; import gate in a fresh database with every record; export and scope the snapshot (`e4e92c9`).
- [x] Check every touched screen in agent-browser, light and dark, phone width.
- [x] Opus review; fix findings; push. The struct offsets in the evidence and code citations stay (the user's call); decode keys stay out.
- [x] Remove the lane's worktree folder, with every other stale worktree and branch; the superseded branches are bundled in the session scratchpad first.

## Task 3: Buff scaling

- [x] Decompile the modifier systems in the Burst library (`CharacterModifierManagementSystem`, `ScaleModifierRecalculateSystem`, `AddCharacterModifier*`) and find whether Skill AMP scales a buff's value (agent). It does: each buff line is `value × caster stat × (1 + caster Skill AMP)`, read once when the buff lands. Debuffs and final-damage lines get no amp, and the server can exclude a stat type. Same modifier ID refreshes and stacks; same group keeps the strongest.
- [x] Fold the result into record 007 and the page (`9fd7c68`; the page renders the new mechanics from data, no code change).
- [x] Update the roadmap's rune-reroll payoffs: a buffer's Skill AMP lines lift her buffs, so Milk keeps hers and rerolls only her SR ATK lines.
- [x] Record 001's "Cheesecake's buff overrides Milk's" (a weaker buff kept) conflicts with strongest-in-group. Record 007 rates it "partly": not stacking fits the group rule, a fixed priority doesn't; the modifier IDs are in patch data, not the APK.

## Task 4: In-game check

- [x] Read a buffer's skill text and stat sheet under the current gear. Milk's Gentle Remedy reads "ATK Increase 10% of Caster's Attack", stacks ×10: a fixed ratio with no Skill AMP term.
- [x] Switch to a preset with different Skill AMP; read them again; switch back. Power and Conquest gave the same stat sheet and header power out of battle, so the info screens can't A/B gear. Preset is back on Conquest.
- [x] Log the screenshots as gitignored captures with ledger lines in record 007 once its lane merges; add the result as a data point (`evidence/03-ingame-2026-10-10/`, `9fd7c68`).
- [ ] Compare with Task 3. The info screens can't answer it; a battle A/B (damage under two presets) is the in-game route left.
