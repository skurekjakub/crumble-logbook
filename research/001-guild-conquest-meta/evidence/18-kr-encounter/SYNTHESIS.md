# KR encounter research: Guild Conquest fight logic

Boss: 지나치게 무거워진 피냐타 (Extra Stuffed Piñata), Dark, weak to Light. Written 2026-09-27 from 47 newly-read DC posts (`18-kr-encounter/dc/`) plus a re-read of `legacy/dashboard/data/mechanics.json`, `rng.json` and the crumb.gg captures (`evidence/15-crumbgg/`). Full structured data: `evidence/08-extract/kr-encounter.json`.

No new Naver posts were added — the guild board is almost entirely recruitment ("토벌 500g 길드 구합니다"-style posts, 0 relevance per the extraction brief) and the guide board's "보스" hits are all regular-stage content, not Guild Conquest.

## Second-by-second timeline (best known)

Fight length is **60 seconds**, confirmed two ways: crumb.gg's own DPS chart page states "Fight length 60 s" (`evidence/15-crumbgg/32-dps-read.txt`), and a datamine poster independently says the same ("토벌전이 60초", dc:71383). The in-run HUD counts *down*, and "17초" / "30초" in every community post are both **remaining-time marks** — i.e. elapsed 43 s and elapsed 30 s respectively (dc:69724, prior evidence).

| t (elapsed) | t (remaining) | Event | Confidence |
|---|---|---|---|
| 0 s | 60 s | Team runs in and collides into a line. No scripted stop point — a cookie advances until physically blocked by an ally or the boss (dc:72759, dc:74804). | high |
| 0–10 s | 60–50 s | *Claimed* boss damage-reduction phase 0: DR 0%, boss ATK at base (5,000). Best damage-efficiency window if the datamine below is real. | low |
| 10–22 s | 50–38 s | *Claimed* DR phase 1: DR 10%, boss ATK 505,000. | low |
| 22–30 s | 38–30 s | *Claimed* DR phase 2: DR 30%, boss ATK 2,500,500. | low |
| ~30 s | ~30 s | **The 30 s slam** ("30초 쿵" / "부랄찢기"). First team-wide lethal pattern. | high |
| ~33 s | ~27 s | A distinct mob/add wave self-destructs near the front line, a few seconds after the slam itself — a separately survivable hit. | medium |
| 34–46 s | 26–14 s | *Claimed* DR phase 3: DR 50%, boss ATK 12,500,500. Covers the run-up to the wipe. | low |
| ~41 s | ~19 s | Individual cookies start dying — the wipe is a taper, not a single simultaneous kill. | medium |
| **43 s** | **17 s** | **The super-jump wipe.** Historically a certain full-team kill for every publicly documented run. | high |
| 46–58 s | 14–2 s | *Claimed* DR phase 4→5: DR 70%→90%, boss ATK 250M→750M. | low |
| 60 s | 0 s | Timer ends the fight (not a wipe). Damage already dealt is kept regardless of whether the team is alive. | medium |

### The 30 s slam
Sequence (prior evidence, dc:53667, unchanged by this pass): gift-bomb → ground pounds → 3 bomb-mobs thrown at the front line → jump, then the mobs detonate a few seconds later (the "27 s" sub-hit above). Survival numbers converge across five independent posts this pass:
- General HP floor: **~3–4M HP**, "below that you get one-shot no matter what" (dc:70607).
- Row-split floor: **front row ≈4.5M HP, back row ≈3.5M HP** (dc:70625; a looser front≈5M/back≈mid-3M version in dc:67659).
- Team-power curve (commenter-reported): **~400M power → 1–2 of 12 survive; ~600M → whole team survives; ~1.5G → essentially never dies here** (dc:75547).
- It is RNG-sensitive even at a fixed build: one account failed twice at identical power/build, cleared on the third try (score jumped ~2×), then failed ten more times on the unchanged build (dc:70607).
- **Milk is disproportionately likely to die here**, apparently because she spends the window healing teammates and isn't healed herself — this was observed to remove her ATK buff for an ~11 s stretch (28 s→17 s remaining) before the wipe finishes the run (dc:70832).

### The 17 s super-jump wipe
Certain full-team death for essentially every documented run through late September, including a 2.2G-power account (dc:69250) and the #1 guild's own 827G video (prior evidence). The only reported survivors are from a single ~21G-power account, where 4 of 12 cookies (Macaron, Brightseeker, Pomegranate, Skating Queen) live and keep dealing damage until ~8 s remain (prior evidence, dc:76583/69856/74801, survival threshold ~9M HP + 45% DR per survivor). This remains a **timing correlation with the Season 5 score jump, not a shown, replicated build**.

New this pass: the wipe isn't instantaneous. Cookies start dying individually from **~19 s remaining**, tapering through to 17 s (dc:74793). A dead cookie's portrait stays visible in the bottom formation bar with a greyed-out, hourglass-badged "downed" icon rather than disappearing — no UI or community evidence of in-run revival was found (a targeted search for "부활" turned up only unrelated gacha-cookie chat, nothing about Guild Conquest).

## Boss stats (low confidence — single-source datamine)

One poster (초코초코케이크) posted two datamine attempts, dc:67285 then a refined dc:71383, both admittedly uncertain and with no screenshot evidence:

- **HP**: claimed ≈2^62 (~4.6×10^18) — functionally, combined with the fixed 60 s clock, this means the fight is a **pure damage race**, not a depletable-HP kill. No source anywhere claims the boss can be brought to 0 HP.
- **DEF**: claimed **fixed at 2000** for the whole fight — stated identically in both posts.
- **Damage reduction** (separate, time-gated stat): starts at **0%**, then upgrades starting at **10 s elapsed**, every **12 s** after: 10% → 30% → 50% → 70% → 90% → (99%, never reached — its 70 s start point is past the 60 s fight limit). The first draft (dc:67285) gave slightly different numbers (10/20/30/50/90/99); treat dc:71383 as the corrected version.
- **Boss ATK** (offense stat, same stage boundaries): 5,000 → 505,000 → 2,500,500 → 12,500,500 → 250,005,000 → 750,005,000 → 1,562,505,000 (final value also never reached). This is offered as the likely explanation for why the 30 s and 17 s patterns hit so much harder than earlier chip damage.

If real, this predicts that raw team damage should be **front-loaded**: DR is cheapest to punch through in the first 10 s, and every subsequent 12 s bracket both reduces incoming-damage efficiency and escalates the boss's own outgoing damage. The original poster themselves cannot explain why a 7th (99%) stage exists in the data for a fight that's capped at 60 s — flagged below as a datamine target.

Already-known, higher-confidence boss facts (unchanged, `mechanics.json`): Dark element, weak to Light; crit resistance on the ally side does nothing against it; low evasion/resist means accuracy/focus are unneeded; the boss can lift cookies airborne, and ally lift resistance (not any boss-side stat) is what prevents a skill being cancelled by it.

**Not found in any source to date**: whether the boss moves toward or targets specific cookies, or hits whoever is in range/front line untargeted; whether the boss has any CC immunities or can itself be lifted/staggered.

## Positioning and formation

- Formation is **not scripted** — cookies run in from their configured 12-slot order (crumb.gg's own simulator UI exposes this as an ordered 12-item list, "게임 내 배치 순서대로 본 편성") and physically collide into a line, stopping only when blocked. Leftover move-speed on *any* cookie — including a pure buffer like Pomegranate — pushes it further forward than intended and breaks the tuned line (dc:74804, dc:72759).
- **Charge-type (돌격형) cookies are avoided** specifically because they always rush to melee contact with the boss regardless of the rest of the formation, both wrecking the line and usually missing Milk's ATK-buff range (dc:73560, a commenter's blunt "that's exactly why charge-types are never, ever used" — corroborates the established reason Cherry/Melon Soda are carried purely to force a straight line).
- Stripping all backline supports lets a target cookie run all the way to the boss — but over-optimizing this can make the team engage and die too early, capping score even with "perfect" positioning (dc:72759).
- Top players judge whether a run's positioning/buff-landing worked via **elapsed-time checkpoints**, not just the final screenshot: do Brightseeker and Macaron keep every buff to the end; for the Jungle Warrior variant, does Pomegranate's beam count reach 2 stacks by **45 s elapsed** and 3 stacks by **27 s elapsed**; does Tea Knight receive at least one Pomegranate beam (dc:70056).
- Formation quality is not the only score driver: a visibly wrecked end-of-fight formation can still land near a personal best (dc:74887) — crit RNG and buff-timing luck matter too.

## Scoring

- Score = **cumulative damage dealt during the 60 s window**. A team that wipes completely well before the timer keeps whatever damage it already dealt — one report has a full wipe at the 30 s slam still scoring >100x (dc:69201). The fight is not ended early by a wipe; the clock runs to 0 regardless.
- Whether summon/pet/DoT damage counts is **not directly confirmed** for Guild Conquest itself in this pass, but crumb.gg's own DPS chart explicitly counts summon damage "in full" for its ranking model (prior evidence, `15-crumbgg/32-dps-read.txt`), which is at least suggestive.
- The actual end-of-run **result screen** content (per-cookie breakdown? death-time log? just a total?) was not captured by any source read to date — open question.

## Buff/targeting corrections and additions to `mechanics.json`

- **Candy Shade Pouch (색동주머니) HP bonus may be lower than recorded.** Image-verified this pass: at 5★(SSR) it gives +22.5% lift resistance / **+7.5%** max HP (plus +1.70% Water-element damage as an owned bonus). Commenters report it capping at +30% lift resist / **+7.5%** HP at 10–14★ — i.e. the HP bonus does not appear to scale past 5★. This **conflicts with the existing `mechanics.json` entry of "+12.5% HP" as the pet's max** — worth rechecking against a clean max-star screenshot.
- **Panda Dumpling (판다만두), image-verified at 9★**: party-wide +18% lift resistance, +70 flat HP to support-type cookies. Consistent with, and slightly more precise than, the existing entry.
- Pomegranate's beam-count timing checkpoints (45 s / 27 s elapsed for the Jungle Warrior variant) are a new, load-bearing diagnostic not previously recorded.
- Milk's 30 s-slam death mechanism (healing others without being healed herself) is new; it explains an observed ~11 s no-buff gap before the final wipe that wasn't previously connected to a specific cause.

## Open questions for a client datamine

1. Independent confirmation of the boss DR/ATK/DEF/HP numbers above — currently one poster's self-admittedly uncertain extraction, no screenshots. Look for a **boss stat/phase table keyed to the Guild Conquest stage id**, gated on elapsed battle time with a "first at 10 s, then every 12 s" cadence — something like `GuildRaid`/`GuildConquest` boss phase or `BossPhaseCondition` data.
2. Whether the ~27 s mob-wave hit is a distinct, separately-timed pattern id, or just the tail of the same "30 s slam" skill sequence recorded earlier (gift-bomb → ground pounds → 3 bomb-mobs → jump).
3. Whether the boss ever moves toward or targets a specific cookie, or is purely untargeted/AoE on whoever is in range.
4. Whether the boss has CC immunities, or can itself be lifted/knocked back/stunned.
5. Whether summon/pet/DoT damage counts toward the Guild Conquest score.
6. What the post-fight result screen actually shows.
7. The 12-slot formation order's mapping to physical rows/columns (crumb.gg's simulator confirms the ordered list exists, not the physical layout).
8. Whether any Guild-Conquest-legal effect can revive a downed cookie mid-run (no evidence either way beyond the static "downed" UI state).

## Sources

New captures: `evidence/18-kr-encounter/dc/*.md` (47 posts, `img/` for their images), `evidence/18-kr-encounter/search-*.tsv` (search listings used to find them). Structured extraction: `evidence/08-extract/kr-encounter.json`. Re-read prior evidence: `legacy/dashboard/data/mechanics.json`, `rng.json`, `evidence/15-crumbgg/31-sim-howitworks-read.txt`, `32-dps-read.txt`, `34-sim-ko.txt`.
