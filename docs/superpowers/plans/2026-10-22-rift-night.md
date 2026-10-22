# Rift 6 overnight: ATK order, DimensionRift preset, oven keep-filter

> The user (2026-10-22, before going to sleep): "only deleveling is allowed to
> chagne atk order / i am allowing you to do the deleveling yourself by the
> way, i am also commanding you to make a me gear preset - once researched -
> use the evasion preset and rename it DimensionRift, filter for the currect
> substats on the oven and then isntead of selling equip, note the preset is
> not active until equipped to a team so you can jsut build it async like that
> while the attempts are running, again make sure to make ntoes about
> everything / everything is fully autonomous … also oechstrate the full app
> rebuild while im deadge / keep track of everything using superpowers
> workflow"

The app rebuild runs on its own plan,
`docs/superpowers/plans/2026-10-22-player-first-app.md`; this plan tracks the
game-side work and the macro change it needs.

## Global constraints

- Sugar runes are never edited. ATK order moves only by deleveling.
- In-game writes allowed tonight: deleveling, the DimensionRift preset (rename,
  equip into it), the oven upkeep, Auto Summon. Nothing else.
- The rift's damage bracket reads the lobby header power: the 15% line on rift
  6 is 13.8G. Every delevel is checked against it.
- Never run two macros; stop the rift loop before working in menus, relaunch
  after (state carries).
- Logs, recordings, `stops\` and `stage-runs*.csv` are never committed.

## Research (settled before compaction, `research-gc/` in the scratchpad)

- Clear at 16.35G (그니, YouTube L-HBCw9g9E8): ATK order Milk > Scorpion >
  Skating Queen > Brightseeker > Cheesecake, the rest below.
- Caine is Cheesecake's upgrade (an ATK buffer). With any skill haste his buff
  breaks after GingerCraven's fear; at 0 haste it holds (dc 92181, 92207).
  Haste comes from runes and gear, so the rift gear carries no haste lines.
- Rift gear: Skill AMP on the weapon and upper accessories; damage reduction
  and HP on armour; damage reduction on the lower accessory; accuracy and
  focus about 1,200; no skill haste.

- Why the order matters: Pomegranate's +69% Skill AMP beams go to Milk and
  Chardonnay first, then to the highest-ATK allies, never to herself; 6
  beams need Tiger Lily's 다발 3 (record 001, "Pomegranate's beam"). So the
  deck takes 그니's Tiger Lily and Bari back, and every cookie that shouldn't
  take a beam sits under Caine.

## Tasks

- [x] 1. Read the live rift lineup and every member's out-of-battle ATK.
- [x] 2. Delevel so the order is Milk > Scorpion > Skating Queen >
      Brightseeker > Caine > the rest; check the header power after each.
- [x] 3. Rename the Evasion preset to DimensionRift; record its slots.
- [x] 4. Set Auto Bake's substat filter to the rift's subs.
- [x] 5. Change the oven upkeep: with `OvenSell=0` the loop reports a stopped
      Auto Bake and leaves the results for a gear pass by hand.
- [x] 6. The false "oven full" read of 23:34 was Auto Bake stopped by a
      preset change with a part-full oven; the report-only mode taps nothing,
      and the gear pass restarts it either way.
- [ ] 7. Gear passes through the night: equip rift-substat drops into
      DimensionRift, sell the rest, restart Auto Bake (log below).
- [ ] 8. Switch lineup 4 to DimensionRift once it beats Conquest on the
      rift's needs (accuracy and focus near 1,200, no haste).
- [x] 9. Notes: rift macro README, stage-macro skill, memory, this plan.

## The rift deck, 2026-10-23 00:10

Lineup 4, captain Milk. Out-of-battle ATK from the magnifier panel, Conquest
preset. Pets: Continuum Cog, Octo Wasabi, Holy Baby Drop (Hot Doggie out).

| Cookie | Level | ATK | Change |
| --- | --- | --- | --- |
| Milk (captain) | 120 | 2,405K | — |
| Scorpion | 120 | 2,064K | — |
| Skating Queen | 120 | 2,054K | — |
| Chardonnay | 120 | 1,934K | — (takes a beam through 탄속 at any ATK) |
| Pomegranate | 120 | 1,933K | — (never beams herself) |
| Brightseeker | 104 | 1,914K | reset from 120 (2,255K) |
| Caine | 120 | 1,728K | — (5★, no runes) |
| Moon Rabbit | 96 | 1,641K | reset from 120 (1,959K) |
| Princess Bari | 63 | 1,611K | in for Cool Mint; reset from 120 |
| Tiger Lily | 108 | 1,610K | in for Rye; reset from 120 (1,751K) |
| Cherry Cola | 72 | 1,595K | reset from 120 (2,225K) |
| Dark Choco | 95 | 1,590K | reset from 120 (1,906K) |

- Out of the lineup: Cool Mint at Lv.79 (reset from 120, ATK 1,700K), Rye at
  120.
- Other modes lose level on the shared cookies until they are levelled back
  (reset refunds the EXP; levelling up spends it): Moon Rabbit, Dark Choco,
  Princess Bari (Rumble defence), Tiger Lily (Conquest), Brightseeker.
- Header power: 17.27G before, 15.18G after (15% line 13.8G). Lineup power
  11.11G → 9.76G.
- Not checked: the in-battle ATK order (Octo Wasabi's +10% goes to duration
  synergy receivers only).

## DimensionRift, 2026-10-23 00:20 (the old Evasion preset)

| Slot | Item | Lv | Main | Subs |
| --- | --- | --- | --- | --- |
| TL1 | Axe-Spear of Blind Destruction | 105 | ATK 9,445 | CRIT 16.03%, Skill AMP 8.55% |
| TL2 | Resplendent Wind Guardian | 105 | Accuracy 642 | CRIT 18.03%, Skill AMP 8.11% |
| TL3 | Dreaming Moon | 107 | CRIT 47.71% | CRIT 14.99%, Skill AMP 9.13% |
| BL1 | Helmet of Silence | 110 | DEF 8,947 | Evasion 102, CRIT RES 18.67% |
| BL2 | Awakened Dragon Lord's Armor | 110 | HP 121K | Evasion 69.9, DMG Reduction 6.64% |
| BL3 | Hollyberry Shield | 108 | Evasion 617 | Evasion 87.8, CRIT RES 21.89% |
| TR1 | Endless Void Necklace | 109 | CRIT RES 49.16% | CRIT 14.32%, Skill AMP 7.36% |
| TR2 | Eternally Sweet Paradise | 110 | Focus 627 | Resistance 105.9, Skill AMP 8.48% |
| TR3 | Light of Deceit | 107 | Resistance 612 | CRIT 17.75%, Skill AMP 9.10% |
| BR1 | Free Explorer's Lily | 114 | CRIT DMG 40% | Evasion 85.8, DMG Reduction 6.48% |
| BR2 | Ultimate Recipe Book | 111 | Skill AMP 18.13% | Evasion 116, Skill Haste 4.60 |
| BR3 | Rainbow Ginseng | 112 | DMG Reduction 17.35% | Evasion 115.6, DMG Reduction 6.41% |

- Against Conquest: about the same Skill AMP from subs, 4.6 haste against
  18.4, but lower item levels and 642 gear accuracy against 1,064, so the
  lineup stays on Conquest for now. First upgrades wanted: an accuracy
  weapon (TL2), DMG Reduction + HP armour (BL1–BL3), a BR2 without haste.
- Auto Bake filter (Eternal+, 500 per use): Accuracy, Skill AMP, DMG
  Reduction, Focus. Skill Haste taken off.

## Gear pass log
