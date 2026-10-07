# 001 — Guild Conquest damage meta (Cookie Run: Crumble)

| | |
|---|---|
| Status | Written up 2026-09-28; refreshed 2026-10-07, after Season 6 closed and before the 10-08 update. First-round captures 2026-08-27 → 2026-09-27; the round's are in `evidence/r2026-10-07/`. |
| Measured | Community posts, comments and result screens on the DCInside `projectcc` gallery (`dc:`) and the official Naver cafe `ccrumble` (`nv:`), crumb.gg's rankings, pages and public JSON API, YouTube, and the Sugar Pocket calculator bundle (`web:`, `yt:`). Nothing was measured in the game client. |
| Branch | Captured in the Obsidian vault, migrated to this repo's `main` (`bf66e8d`); written on `main`; the 2026-10-07 round ran in a worktree lane merged into `main`. |
| What it changed | Nothing in the game or on the user's account. The curated dataset in `curated/` is what the app serves: `pnpm import:record 001-guild-conquest-meta`, then `data/snapshot.json`. |

**Evidence marks.** *Observed*: on a captured screen. *Stated*: a poster's words, no screen. *Derived*: arithmetic on the above, done here or by the poster. Source ids resolve in `curated/sources.json`; `dc:N` is `m.dcinside.com/board/projectcc/N`, `nv:N` is `cafe.naver.com/ccrumble/N`. Ids marked † are captured but not in `curated/sources.json` (they came from `evidence/17-kr-highscore/`).

## Question

As asked: the latest Guild Conquest meta lives mostly on Korean forums. Some teams do upwards of 2 trillion damage. Which exact cookie builds, sugar runes, gear, pets and leveling tricks do they run? Collect all current meta teams. The user has a whale account with every cookie built, and the KR and Global versions are identical.

As a falsifiable statement: there is a small, documented set of Guild Conquest teams that KR/Global top players use to reach ≥1T damage. For each one, the community sources name the cookie lineup, levels (including deliberate Lv.1 fillers), sugar runes, gear stats, pets and perks precisely enough that someone with every cookie could reproduce it.

## Verdict

**True from 1T to about 2.2T, and in part to 3T; still unanswered above it.** The documented ≥1T meta is the Cherry deck (체리덱), with the Melon Soda deck (메소덱) as its move-speed variant. Every ≥2T Season 6 forum lineup but one (dc:79943) is one of the two. The best run with its lineup on screen is the Season 5 #2's 3T 045G at 4.23G team power: a Melon Soda deck with no move speed, from a lobby that shows no runes, with the ATK order given from memory (dc:76966). Season 6's best forum screen with its lineup is 2T 204G at 2.86G: a Cherry deck whose fillers are levelled just under the beam line so they outlive the 17 s wipe (dc:80067). Season 6's #1 reached 6T 276G and the rest of the top 10 4.2–4.9T (web:crumbgg:final-s6); none of them has posted a team. The #1 credits stacked small optimizations plus money (dc:82457), and posters credit plates at +20 and +25 (dc:81148, dc:80723). The strongest reason is still the spread at equal power: the levelled-filler Cherry account at 2.93G got 208–783× over 100 runs (dc:80859). What separates runs is execution, survival and gear depth, not a different team.

## Reasoning

1. **The Cherry deck is the documented meta.** It has Lv.1 fillers so Pomegranate's +69% skill-amp beams land only on the carries, plus an ATK order of Milk › Brightseeker › Skating Queen › Macaron › Tea Knight › Cheesecake. Scorpion catches stray beams, and an R-rarity Cherry holds the formation. *Stated* in guides (nv:43653, dc:71135, nv:48773), backed by *observed* result screens (dc:76135, dc:75400, dc:81110). → `curated/decks.json` (`cherry`), `evidence/07-nv-posts/nv-43653.md`, `evidence/r2026-10-07/07-nv-posts/nv-48773.md`.

2. **The ≥1T forum runs.** Every row is in `curated/scores.json`. The multiple (배) is shown for comparison only. The ranking is by damage.

   | Damage | Team power | 배 | Deck | What's observed | Source |
   |---|---|---|---|---|---|
   | 3T 257G | not shown | — | not shown | Result screen, Season 6 | dc:80426 |
   | 3T 045G | 4.23G | ≈720 *derived* | Melon Soda, no move speed | Lobby: personal best and power; the Season 5 #2 | dc:76966 |
   | 2T 919G | not shown | — | not shown | Result screen, Season 6 day 1, 섬영's card on screen; posted by an anonymous ㅇㅇ, so 섬영 is *inferred* | dc:79103 |
   | 2T 204G | 2.86G | 771 | Cherry, fillers Lv.42–91 | Result screen and lobby | dc:80067 |
   | 2T 186G | 2.9G | ≈754 | Cherry, Lv.1 fillers | Lobby | dc:81110, dc:80846 |
   | 2T 130G | 3.82G | ≈557 | Herb Lv.85, no Cherry or Tiger Lily, an unidentified Light Lv.100 | Result screen and lobby | dc:79943 |
   | 2T 072G | 3.0G | ≈691 | Melon Soda, levelled fillers (Lv.40–60) | Lobby | dc:80848 |
   | 2T 030G | 2.87G | ≈707 | Melon Soda, move speed, Lv.1 fillers, Scorpion Lv.21 | Lobby | dc:81023 |
   | 1T 999G | 3.07G, *derived* from "덱투 650배정도" | ~650 *stated* | Cherry | Score on screen | dc:76235 |
   | 1.62T | 2.7G *derived* | ~600 *stated* | Cherry | Score on screen | dc:75462 |
   | 1T 312G | 1.8G | 728 | Cherry, Pomegranate Lv.1, Scorpion Lv.10 | Result screen | dc:76135 |
   | 1T 116G | 1.74G | 641 | Cherry, Scorpion Lv.45 | Result screen | dc:75400 |
   | 1T 086G | 2.61G | ≈416 | Coffee Cookie in Cherry's slot, fillers Lv.50–60 (TW client) | Video frames | web:yt-K0aJ56DdQvc |
   | 1T 066G | 2.38G | 448 | Cherry, old pets | Result screen | dc:75176 |
   | 1T 049G | 2.31G | ≈454 | Cherry, Scorpion Lv.47 | Video frames: lobby, runes, result | nv:48773, web:yt-WmSUutrNdaY |
   | 1T 031G | 2.35G | ≈439 | Melon Soda, Scorpion Lv.35 | Video frames: lobby, result | web:yt-mYqjYOdkqcg |
   | ≈1T | 1.6G | ~625 (a commenter's figure) | Melon Soda | Not verified | dc:74759 |

   More Season 6 runs between 1T and 2T are in `curated/scores.json`. Text-only claims, with no screen: 1.987T at about 3.24G (dc:80615), 2.8T at 3.6G (dc:76317), 1.5T at 2.6G and 1.3T at 3G (dc:76333).

3. **Who ran the 1T 999G, and what's known about it.**
   - **Author.** DC user `awkward2637` posted it. The uid was read from the desktop site (`evidence/21-author-awkward2637/README.md`).
   - **Player.** crumb.gg lists 1T 999G under 섬영 · 판도라 (`evidence/20-verify-1t999/`). The same uid posted 섬영's own conquest lobby (dc:69331, dc:71121). That the DC account belongs to 섬영's player is *inferred* from those screenshots, not stated. On Season 6's first day an anonymous ㅇㅇ posted a 2T 919G result screen with 섬영's card on it (dc:79103), with no lineup; that the run is 섬영's is *inferred*.
   - **Team power.** It's on no screen. The last *observed* team power is 1.38G on 9/20 (dc:71121).
   - **Build.** Cherry deck, no move speed. Milk has 1.27M ATK from SSR ATK% lines at minimum rolls. All *stated* (dc:76235).
   - **Misread claims.** The "780×" and "정전씀" (uses Tiger Lily) replies in dc:76583 belong to another user, `female8264`. So Tiger Lily isn't confirmed for this run.

4. **Power is necessary, not sufficient.**
   - **Forum runs.** At similar team power the multiple spans about 2×: 448× at 2.38G (dc:75176), ~450× at 3G (dc:76333, *stated*), 480× at 3.18G (dc:77105), and 557× at 3.82G (dc:79943). Against those, 771× at 2.86G (dc:80067).
   - **One deck, many runs.** 100 runs on the levelled-filler Cherry account (저장용, the 2T 204G poster) at 2.93G gave 208–783×, mean 477×; 700×+ came once in 20 (dc:80859). A 39-run log at 2.44G spanned 246–629× (dc:79121).
   - **crumb.gg, Season 6 top 50.** Score ÷ account power runs 76–164× (median 110×). The strongest account (50.8G) placed #19, and the #1 holds 38.2G (`evidence/r2026-10-07/15-crumbgg/11-players.tsv`, `13-power-top500.tsv`).
   - **Caveat.** crumb.gg power is account-wide, not the 12-cookie team power the forum's 배 uses. The two ratios don't compare.

5. **Pomegranate's beam count sets the multiple.**
   - **The beam.** +69% skill amp for 9 s, to the highest-ATK allies (ATK, not power), never to herself. Her level doesn't change it.
   - **Beam count.** 3 + the 다발 (Volley) level she holds when she casts: 5 with Cheesecake's 다발 2, 6 with Tiger Lily's 다발 3. Levels don't add up, and nobody reports more than 6.
   - **The catch.** Tiger Lily grants 다발 3 only to allies near her when she mounts. Posters keep Panda Dumpling so she gets pushed into place (dc:81699).
   - **Recipients, in order.** Milk, Skating Queen and Brightseeker on the base beams, then Tea Knight and Macaron at 다발 2, then Cheesecake at 다발 3 (dc:70056). On 5 beams Cheesecake goes unbuffed.
   - **Sources.** `curated/mechanics.json` ("Pomegranate's beams"): nv:29690, dc:53804, dc:70056, web:sugarpocket-bundle-1.4.002. This is why non-carries sit at Lv.1 and Scorpion is tuned to exactly 7th in ATK (dc:76135, dc:71105).

6. **Buffs scale with the caster's skill amp.**
   - **Calculator formula.** Sugar Pocket computes `buff = floor(base × value × (1 + caster skill amp / 100))`, and the base can be the caster's ATK (`evidence/19-sugarpocket/README.md`). This is *derived* from a third-party calculator's code, not from the client.
   - **Official patch.** The 8/13 notes make skill amp apply to Milk's ATK buff (web:16132, `evidence/14-global/nv-patchnotes/nv-16132.md`).
   - **So.** Milk runs ATK%, because her buff's base is her ATK and the welfare perks go to ATK #1. The other buffers run skill amp. crumb.gg's rune optimizer, by the Season 6 #1, suggests the same on its sample account (dc:82457, *observed* screenshot).

7. **Runes and gear agree across guides.**
   - **Runes.** `curated/runes.json`. Brightseeker's haste has a knee near 40 in a model of the 43 s fight (nv:44761). The 1T 312G run shows 49.6 in battle (dc:76135), a Season 6 recipe gives 44 (dc:78711), and at 58.6 drones start peeling onto adds (dc:75934). Cooldown = base × 100 / (100 + haste) (dc:31305). A second-hand rumour has the Season 6 #1 at only about 32.7 total haste with the rest in crit dmg (dc:81144).
   - **Gear.** `curated/gear.json`. The ceiling is 6 skill-amp lines plus 6 haste lines (dc:75400, dc:76135, dc:78711). Plates past +15 are the round's new lever: posters credit +20 and +25 accessories for the Season 6 #1 (dc:81148, dc:80723), all *stated* second-hand.

8. **Retries matter, but build changes matter more.**
   - **How often.** At 2.93G, 700×+ in 1 of 20 runs (dc:80859). At 1.74G, 1T lands in 1–2 of 10 runs (dc:75400). The ceiling is roughly the best of 20 runs plus 10–20% (dc:74815). Records still come from overnight macros (dc:76545, dc:79585).
   - **The 1T 999G author's history.** Two hours of manual retries bought him +16G on 9/19 (dc:70682). His next record, on 9/20, followed haste runes on Tiger Lily (dc:71121). → `curated/rng.json`, `curated/takeaways.json`.

9. **Past 2T, the carries usually outlive the 17 s wipe.**
   - **The screens.** Every ≥2T screen that shows the timer or a survival note outlives it. The 2T 204G run keeps 5–6 cookies, Brightseeker included, alive past it (dc:80067); the 2T 186G run keeps every Lv.100 but Milk (dc:81110); the 2T 130G run ends at 5.2 s left (dc:79943). 캔디애플's Melon Soda team, later 2T 030G, doesn't survive (dc:80069, dc:79882). The first round's survival hypothesis now has run screens behind it, though no single build is shown surviving at 3T+.
   - **What it takes.** Posters estimate 10–13M+ HP per survivor, *stated* rather than measured: a 13.4M HP, 43% DR Brightseeker lived to about 7 s left (dc:79585), a 10.4M HP, 39% DR Milk died (dc:79144), and a poster whose Pomegranate and Skating Queen alone survive puts the bar past 11M (dc:80785). The first round's 9M floor came with 45% DR (dc:74801), and 5–9M is the band that safely reaches 17 s, not past it (dc:81699). Panda Dumpling places Tiger Lily better while the team dies at 17 s; Candy Shade Pouch's HP wins once carries survive (dc:81699, dc:79169).
   - **What it's worth, disputed.** The boss takes full damage to 10 s elapsed, then 10/30/50/70/90% less from 10/22/34/46/58 s (dc:81844, *derived* from game data; the same table is on crumb.gg's Guild Conquest page, `evidence/r2026-10-07/15-crumbgg/40-guild-conquest-db.txt`). Past the wipe, from 43 to 46 s elapsed hits count at 50%, then 30% from 46 s, then 10% from 58 s. Posters still put survival at +300–600G for a run that reaches 1.5T by 17 s (dc:79493, *stated*); a 1T guide says keep the damage pets and take the wipe (nv:48773).

10. **Season 6: the boards doubled, the teams stayed hidden.**
    - **The boards.** Season 5 closed on 09-28 with #1 at 3T 305G and #50 at 2T 025G (web:crumbgg:final-s5). Season 6 ran 10-01 16:00 to 10-05 12:00 KST on the same boss: #1 Arsen 6T 276G, #2 4T 910G, #50 3T 341G, #100 2T 763G (web:crumbgg:final-s6). The 47 players on both boards scored 1.16–2.13× their Season 5 finals (`evidence/r2026-10-07/15-crumbgg/11-players.tsv`, joined by crumb.gg player id).
    - **The #1.** Arsen, crumb.gg's developer, was at 5T 115G by 10-02, over a trillion ahead of #2 (dc:79664). He says the "secret sauce" is many small optimizations, plus money, and opened crumb.gg's rune optimizer for 48 h (dc:82457). Leaked stat weights from his account: skill amp +1% ≈ +2% damage, crit dmg +15% ≈ +4% (dc:82295, *stated* second-hand). His own calculator's sample shows far less: skill amp +1% ≈ +0.45%, crit dmg +1% ≈ +0.38% (dc:82457 image 2, *observed*).
    - **Not a new deck.** Posters who tried other dealers in Cherry's slot failed (dc:79678), and one says the #2's 4T 700 gap isn't a special build (dc:80723). A 1000×+ deck is rumoured without any detail (dc:79686).

## Steelman: "more power is all you need"

**The case.** Damage is team power × multiple, so power multiplies everything. Season 6 bears it out on the boards: every player on both seasons' boards rose (1.16–2.13×), though that says nothing of players on only one, and the forum's ≥2T screens sit at 2.86–4.23G team power, well above the first round's 1.8G. Survival past the wipe takes 10–13M+ HP by posters' estimate, which is power by another name. Plates at +20 and +25, said to be behind the #1, are bought power.

**The answer, point by point.**
- **Equal power, different results.** One deck at one power gave 208–783× across 100 runs (dc:80859). At 3.82G a team scored 2T 130G; at 2.86G another scored 2T 204G (dc:79943, dc:80067).
- **crumb.gg.** The highest-power account (50.8G) placed #19 in Season 6; the #1 holds 38.2G.
- **Survival.** Conceded in part: it needs HP and damage reduction. But levelling fillers so they live, the 2T 204G build's lever, *lowers* the multiple per point of power while raising damage (dc:79270), so the setup decides whether the power turns into score.
- **Plates.** Conceded as a lever. The #1 himself frames it as optimization of every element plus money (dc:82457), not money alone.

**Net.** Power is the multiplicand and the setup is the multiplier. For a team below about 600×, fixing the setup is still worth as much as doubling power.

## Recommendation for the user's account

**The account, as the user stated it in the first round:**
- Team power 2.2G. Median 700G (318×, *derived*), best 900G (409×, *derived*).
- Brightseeker is 8★ with 45 haste in combat. The other buffers are 9–10★.
- The buffed cookies (the beam recipients) are Lv.100, and Macaron is 4th in ATK. Scorpion is Lv.40.
- ATK% rune lines on Milk, Macaron and Skating Queen, a mix elsewhere.
- Tiger Lily's haste has been tuned, but runs still often show 5 Pomegranate beams.

**Where the gap is.** The Season 6 2T runs sit at 700–770× (dc:80067, dc:81110, dc:81023). At that multiple, 2.2G would be about 1.6–1.7T (*derived*). The gap is in the multiple, not in power. In order of expected return:

1. **Get the sixth beam more often.**
   - **Runes.** Tiger Lily runs all skill haste. The Melon Soda deck's ≈1T author (캔디애플) runs SSR +5, SR +2 and SR +3 on her (dc:74818). Pomegranate runs skill amp and no haste (`curated/runes.json`).
   - **What's left is positioning.** Even with haste, 6 beams depend on Pomegranate standing near Tiger Lily when Tiger Lily mounts. Panda Dumpling, not Candy Shade Pouch, lets her get pushed into place while the team still dies at 17 s (dc:81699).
   - **Use the checklist as a retry filter.** Pomegranate should hold 다발 2 by the HUD's 45 s mark and 다발 3 by the 27 s mark (dc:70056). A run that misses 다발 3 stays at 5 beams, so restart it (a *derived* use of the checklist). Whether "45초/27초" means time left or time elapsed is still ambiguous (see Side findings).
2. **Brightseeker to 10★.**
   - **Evidence.** The 1.62T and 1T 999G author runs a 10★ Brightseeker (dc:75462, *stated*). 10★ opens two more rune slots (dc:66636).
   - **Size of the gain.** Unmeasured for 8★ → 10★. Star thresholds posters report for 500×: Brightseeker 6–7★ with Milk 9–10★ and Tea Knight 4–5★ (dc:81335, *stated*).
   - **Haste.** 45 in combat is already in the 40–50 band where returns flatten (nv:44761). Don't chase more, and stay under about 58 (dc:75934).
3. **Reroll the ATK% lines on Macaron and Skating Queen to skill amp.** Milk keeps all ATK%.
   - **Why.** A buffer's buff scales with the caster's skill amp (reasoning 6). Every guide from 9/17 on says skill amp for them (nv:43653, dc:71135, dc:78711).
   - **Check afterwards.** Re-check the ATK order in battle: Milk › Brightseeker › Skating Queen › Macaron › Tea Knight › Cheesecake.
4. **Scorpion's level is only an ATK-order knob.**
   - **The target.** Exactly 7th in ATK, checked in battle (dc:71105). In the lobby, hold her at least 10% under the 6th cookie, because Octo Wasabi adds about 8% ATK when she enters (dc:76135). Season 6 runs use Lv.10–60 (dc:79585, dc:80159).
   - **Lv.40.** It's inside the documented range. Whether it's right depends only on where she lands in the in-battle order.
5. **Raid gear preset** (`curated/gear.json`): weapons skill amp + crit dmg, top-right haste + skill amp, armour damage reduction + HP, bottom-right haste + damage reduction. No move speed, accuracy or focus.
6. **Then survival, once the carries hold 10–13M HP** (posters' estimate; 5–9M only reaches 17 s, dc:81699). Level the fillers to just under the 6th cookie's ATK so they outlive the 17 s wipe and add chip damage, as the 2T 204G build does (dc:80067, dc:79270), and switch to Candy Shade Pouch then (dc:79169). Below that HP, keep Lv.1 fillers and the damage pets (nv:48773).
7. **Retry after a build change, not instead of one.** The best run is 29% over the median (*derived*), in line with "best of 20 + 10–20%" (dc:74815). `tools/conquest-macro/` automates the retry loop.

## What would change the verdict

- **A published 3T+ team.** A Season 6 top-50 player posting a run with its team, levels and runes would answer the half this record can't, and show whether it's still a Cherry or Melon Soda deck.
- **The 10-08 update (1.5.002), after this round's window** (nv:50417, web:crumbgg:patches-1007):
  - **Chardonnay**, a new SSR support: a line barrier giving CRIT% 50–100%, Push RES 40–60% and 다발 1–2 to herself and allies in the line. 다발 2 is short of Tiger Lily's 3, so she can't replace Tiger Lily for the sixth beam; posters weigh her against Macaron and fear her Push RES stops Tiger Lily being pushed into place (dc:81699, dc:81671). Pre-release talk only.
  - **Cookie level cap 100 → 120.** Team power and the ATK order change once recipients reach Lv.120: every filler level rule here is relative to the 6th recipient's ATK and needs re-checking in battle.
  - **Free Milk** from a 7-day check-in: more accounts can field the deck's ATK #1.
  - **Season 7** opens 10-08 16:00 KST, after the update (web:crumbgg:guild-conquest).
- **A survival build that outscores its own wipe version.** The same account posting both, same power, would settle what survival is worth (reasoning 9).
- **The 1T 999G and 2T 919G runs' power.** A lobby showing 섬영's team power would turn the 3.07G from *derived* into *observed*.
- **The user's own data.** Stat screens and a run log (`OPEN-QUESTIONS.md`, question 1) would test the recommendation's estimate on the actual account.

## Side findings

Each is out of scope and surfaced for a decision. None is filed in `.ai/followups/`, because this write-up touches only this README. The open ones are listed in the root `README.md` under "Next research steps".

- **Is 45 s / 27 s time left or elapsed?** The 다발 checkpoints in dc:70056 don't say. `curated/mechanics.json` reads them as time left. `evidence/18-kr-encounter/SYNTHESIS.md` reads them as elapsed, while noting that the community's "17초" and "30초" are time left (dc:69724). Still open after the round. Follow-up: ask in the gallery, or time one run on video.
- **Does a later Cheesecake grant replace a held 다발 3?** No source says. Follow-up: not filed.
- **Candy Shade Pouch's HP bonus.** `curated/mechanics.json` has +12.5%. `evidence/18-kr-encounter/SYNTHESIS.md` reads +7.5%, flat past 5★, from images. Follow-up: check against a max-star screenshot.
- **Boss phases: settled this round.** The first round had one low-confidence datamine (dc:71383). A second datamine (dc:81844) and crumb.gg's Guild Conquest page agree: damage reduction 10/30/50/70/90% from 10/22/34/46/58 s elapsed (`curated/mechanics.json`, "Damage reduction ramps every 12 s"). The parked simulator spec (`docs/superpowers/specs/2026-09-27-conquest-simulator-design.md`) can take it as input.
- **Octo Wasabi's ATK bonus.** The pet card says 10%; posters measure 8% (dc:80030 multiplies Scorpion's ATK by 1.08). Follow-up: not filed.
- **The 2T 130G team's Light Lv.100** (dc:79943) is unidentified from its card art. Follow-up: ask the poster.
- **Unreadable sources.** Reddit was blocked (`evidence/14-global/02-reddit-probe.tsv`) and mrguider sits behind Cloudflare (`evidence/14-global/16-mrguider-guild-conquest.html`). TikTok returns a JS shell, and X needs a login. Naver's free board and search need a login too. The body image of the round's 1T guide (nv:48773) is a sticker; the guide is the video `web:yt-WmSUutrNdaY`.

## Refresh 2026-10-07

Window: 2026-09-27 (`curated/meta.json` `updated`; no earlier refresh heading) to 2026-10-07. Patches in it: none that touch Guild Conquest. The only official notice in the window, 10-01 (nv:48486), changes oven auto-open and defers daily-dungeon easing (`evidence/r2026-10-07/14-global/nv-patchnotes/nv-48486.md`). crumb.gg's `data/patches.json` answered 200 with JSON on 10-07, not the 404 the round brief expected, and lists nothing for conquest between 09-23 and 10-07 (`evidence/r2026-10-07/15-crumbgg/api/data-patches.json`). The 10-08 update (nv:50417) is after the window, under "What would change the verdict".

### Changelog

| Change | Recommendation | Evidence |
|---|---|---|
| added | deck `cherry-levelled`, Cherry deck with levelled fillers: 2T 204G at 2.86G, fillers held just under the beam line to outlive the 17 s wipe; rng from the same account's 100-run log | `evidence/r2026-10-07/03-dc-posts/80067.md`, `79270.md`, `80859.md` |
| added | deck `meso-nospeed`, Melon Soda deck with no move speed: the Season 5 #2's lobby, 3T 045G best at 4.23G | `evidence/r2026-10-07/03-dc-posts/76966.md`, `77113.md` |
| changed | deck `cherry`: ceiling 1T 312G → 2T 186G at 2.9G; pet note (Panda while dying at 17 s, Pouch once surviving); Popcorn-for-Cherry and Herb-for-Scorpion substitutions | `evidence/r2026-10-07/03-dc-posts/81110.md`, `80846.md`, `81699.md`, `80297.md`, `79142.md` |
| changed | deck `meso`: ceiling ≈1T → 2T 030G at 2.87G; Scorpion's level range Lv.1–7 → Lv.1–40, Dark Choco's Lv.6–43 → Lv.1–43; Melon Soda's and Pinot's move-speed lines | `evidence/r2026-10-07/03-dc-posts/80848.md`, `81023.md`, `80069.md`, `79624.md` |
| added | scores: Season 5 final and Season 6 final board rows, and the round's forum and video runs (all new rows; earlier rows kept) | `evidence/r2026-10-07/15-crumbgg/`, `evidence/r2026-10-07/08-extract/`, `evidence/r2026-10-07/14-global/frames/` |
| added | mechanics: the boss's damage-reduction phases, scoring only the boss, survival HP and pet, what survival is worth (disputed), levelled fillers, leaked stat weights, Chardonnay's 다발 1–2 | `evidence/r2026-10-07/03-dc-posts/81844.md`, `evidence/r2026-10-07/15-crumbgg/40-guild-conquest-db.txt` |
| changed | mechanic "Survival and the Season 5 jump": every ≥2T screen that shows the timer or a survival note outlives the wipe; 캔디애플's Melon Soda team doesn't | `evidence/r2026-10-07/03-dc-posts/80067.md`, `81110.md`, `79943.md`, `80069.md` |
| added | gear rec: skill-amp and crit-dmg accessories, plated to +20 first (second-hand) | `evidence/r2026-10-07/03-dc-posts/81148.md`, `81144.md` |
| changed | rune build `브시커`: the Season 6 #1 haste rumour in its dispute | `evidence/r2026-10-07/03-dc-posts/81144.md` |
| added | rng factor: run-to-run spread at fixed power, on the levelled-filler account | `evidence/r2026-10-07/03-dc-posts/80859.md`, `79121.md` |
| changed | takeaways, timeline and `meta.json` (season S6, caveat, the user's summary and survival step) | `evidence/r2026-10-07/` |
| re-captured | crumblehub's meta decks and the crumbleguides and cookieruncrumbles conquest guides: unchanged since September; crumblehub's community conquest list adds one uncited deck | `evidence/r2026-10-07/13-sites/`, `evidence/r2026-10-07/14-global/web-cookieruncrumbles-guild-conquest.html` |

Nothing was marked obsolete: no source in the round says a current recommendation stopped working, and no patch in the window touched conquest. Each new deck was weighed against the deck in its slot, and both of each pair stay:

- **`cherry-levelled` 2T 204G (dc:80067) against `cherry` 2T 186G (dc:81110).** The margin is within one setup's run spread (dc:80859). Levelled fillers only pay once the carries survive the wipe, which needs more power, so it's a higher-spec slot, not a replacement.
- **`meso-nospeed` 3T 045G against `meso` 2T 030G (dc:76966, dc:81023).** Different power (4.23G against 2.87G), season and account; dropping move speed makes it a separate build.

The Season 6 Cherry and Melon Soda runs extend the current decks rather than displace them.

### Unconfirmed this round

- Decks `cheesecake-recipient` and `lottery`: no source in the round mentions them (`dc-cheesecake-deck`, `dc-lottery-deck` and `dc-tobeol-deck` came back without them). They stay as they were.
- Most rune builds and gear recs: posts repeat them (dc:78711, nv:48773) without new data; the Pinot, Tiger Lily and Melon Soda rows weren't re-measured.
- Princess Bari in conquest: no lineup or post in the round puts her in a conquest team (`dc-tobeol` and the discovery search `토벌 바리` came back without one).

### Couldn't settle

- **The Season 6 #1's team.** Only second-hand rumours (dc:81144, dc:81148, dc:80723) and his own post (dc:82457). A lobby or run from him would settle it.
- **What surviving the wipe is worth.** Posters' +300–600G against a guide's "take the wipe" (reasoning 9). One account's paired runs would settle it.
- **The 2T 130G team's Light Lv.100 cookie** (dc:79943).
- **Chardonnay and the level-120 cap**: after the window; the next round sees them in play.

## Sources

Every source the record used is in `curated/sources.json`, with its URL, title and date. The ones this README leans on:

| Id | What it settled |
|---|---|
| [nv:43653](https://cafe.naver.com/ccrumble/43653) | The Cherry deck guide: lineup, levels, runes, gear |
| [dc:71135](https://m.dcinside.com/board/projectcc/71135) | Cherry deck 460× setup; runes; Dark Choco's haste after 8/27 |
| [dc:76135](https://m.dcinside.com/board/projectcc/76135) | 1T 312G at 728×; ATK order; Scorpion's 10% rule; Pomegranate's level; Brightseeker at 49.6 haste |
| [dc:75400](https://m.dcinside.com/board/projectcc/75400) | 1T 116G at 1.74G; 1T in 1–2 of 10 runs; Scorpion Lv.45 |
| [dc:69368](https://m.dcinside.com/board/projectcc/69368) | The 470× club post; Melon Soda deck; filler levels don't matter next to Milk's buff |
| [dc:71105](https://m.dcinside.com/board/projectcc/71105) | Melon Soda deck move-speed runes; Scorpion exactly 7th in ATK |
| [dc:74759](https://m.dcinside.com/board/projectcc/74759) | The Melon Soda deck's ≈1T at 1.6G |
| [dc:74818](https://m.dcinside.com/board/projectcc/74818) | 캔디애플's runes: Tiger Lily SSR +5, SR +2, SR +3 haste |
| [dc:70056](https://m.dcinside.com/board/projectcc/70056) | The 다발 2 / 다발 3 retry checklist and the beam recipients |
| [dc:53804](https://m.dcinside.com/board/projectcc/53804) | Herb is 다발 2, Tiger Lily 다발 3 |
| [nv:29690](https://cafe.naver.com/ccrumble/29690) | Tiger Lily and Pomegranate beam synergy |
| [dc:76235](https://m.dcinside.com/board/projectcc/76235) | The 1T 999G result screen; "덱투 650배정도"; Milk 1.27M ATK |
| [dc:76583](https://m.dcinside.com/board/projectcc/76583) | Survival to 8 s left at 21G account power; female8264's 780× |
| [dc:69331](https://m.dcinside.com/board/projectcc/69331), [dc:71121](https://m.dcinside.com/board/projectcc/71121) | 섬영's lobby screens posted by awkward2637; Tiger Lily haste runes |
| [dc:70682](https://m.dcinside.com/board/projectcc/70682) | Two hours of retries for +16G |
| [dc:75462](https://m.dcinside.com/board/projectcc/75462) | 1.62T at about 600×; 10★ Brightseeker on 4 haste lines |
| [dc:75176](https://m.dcinside.com/board/projectcc/75176) | 1.07T at 2.38G (448×) |
| [dc:76333](https://m.dcinside.com/board/projectcc/76333), [dc:76317](https://m.dcinside.com/board/projectcc/76317) | Text-only 1.3T / 1.5T / 2.8T claims |
| [dc:74815](https://m.dcinside.com/board/projectcc/74815), [dc:76545](https://m.dcinside.com/board/projectcc/76545) | Retry odds and macro hours |
| [dc:74801](https://m.dcinside.com/board/projectcc/74801), [dc:69856](https://m.dcinside.com/board/projectcc/69856) | The 9M HP / 45% DR survival floor |
| [nv:44761](https://cafe.naver.com/ccrumble/44761) | Brightseeker's haste breakpoint model |
| [dc:75934](https://m.dcinside.com/board/projectcc/75934), [dc:31305](https://m.dcinside.com/board/projectcc/31305) | Drones peel at 58.6 haste; the haste formula |
| [dc:66636](https://m.dcinside.com/board/projectcc/66636) | Rune slot unlocks and per-line maxima |
| [dc:75854](https://m.dcinside.com/board/projectcc/75854), [dc:76218](https://m.dcinside.com/board/projectcc/76218) | The raid gear preset |
| [dc:69724](https://m.dcinside.com/board/projectcc/69724) | The community's "17초/30초" are time left |
| [dc:74994](https://m.dcinside.com/board/projectcc/74994)†, [dc:70064](https://m.dcinside.com/board/projectcc/70064)†, [dc:71155](https://m.dcinside.com/board/projectcc/71155)†, [dc:74440](https://m.dcinside.com/board/projectcc/74440)† | Scorpion-level fix; ATK%→skill-amp projection; Brightseeker 7★→8★; pet stars |
| [dc:71383](https://m.dcinside.com/board/projectcc/71383) | Boss phase datamine, first round (low confidence; corroborated by dc:81844) |
| [web:16132](https://cafe.naver.com/ccrumble/16132) | 8/13 patch: skill amp scales Milk's buff |
| [web:crumbgg-s5](https://crumb.gg/rankings) | Season 5 live board (#1 3T 226G on 2026-09-27) |
| [web:crumbgg-join](https://crumb.gg/pub/leaderboard) | Season 5 scores joined with account power |
| [web:crumbgg-lookup-seomyeong](https://crumb.gg/lookup) | 1T 999G listed under 섬영 · 판도라, 22.20B account power |
| [web:sugarpocket-bundle-1.4.002](https://cookieruncrumble.app/sugar-pocket/assets/index-CAL2QT8S.js) | Buff, damage and debuff formulas from the calculator's code |
| [web:crumbgg:final-s5](https://api.crumb.gg/api/rankings?kind=players) | Season 5 final player and guild boards: #1 3T 305G, #50 2T 025G |
| [web:crumbgg:final-s6](https://crumb.gg/pub/live?board=guild_conquest_players) | Season 6 final player and guild boards (guilds: `pub/live?board=guild_conquest_guilds`): #1 Arsen 6T 276G, #2 4T 910G, #50 3T 341G, #100 2T 763G |
| [web:crumbgg:power-leaderboard-1007](https://crumb.gg/pub/leaderboard) | Account power top 500 on 10-07 (top 50.76G), joined with the Season 6 board |
| [web:crumbgg:guild-conquest](https://crumb.gg/guild-conquest) | Season 6 and 7 dates; the boss and its damage-reduction phase table |
| [web:crumbgg:patches-1007](https://crumb.gg/data/patches.json) | Nothing for conquest in the window; 1.5.002's Chardonnay kit (다발 1–2) and level cap 120 |
| [nv:50417](https://cafe.naver.com/ccrumble/50417) | The official 10-08 update notes |
| [nv:48773](https://cafe.naver.com/ccrumble/48773), [web:yt-WmSUutrNdaY](https://www.youtube.com/watch?v=WmSUutrNdaY) | 서신우's 1T guide: Cherry deck at 2.31G, 1T 049G; take the wipe rather than spend pets on survival |
| [web:yt-mYqjYOdkqcg](https://www.youtube.com/watch?v=mYqjYOdkqcg), [web:yt-K0aJ56DdQvc](https://www.youtube.com/watch?v=K0aJ56DdQvc) | 누리머's Melon Soda deck at 1T 031G; a TW Coffee Cookie variant at 1T 086G |
| [dc:80067](https://m.dcinside.com/board/projectcc/80067), [dc:79270](https://m.dcinside.com/board/projectcc/79270) | The levelled-filler Cherry deck: 2T 204G at 2.86G, 1.81T at 2.69G |
| [dc:81110](https://m.dcinside.com/board/projectcc/81110), [dc:80846](https://m.dcinside.com/board/projectcc/80846) | Cherry deck 2T 186G at 2.9G and its lobby |
| [dc:76966](https://m.dcinside.com/board/projectcc/76966), [dc:77113](https://m.dcinside.com/board/projectcc/77113) | The Season 5 #2's no-move-speed Melon Soda lobby (3T 045G, 4.23G); the same build at 650G |
| [dc:80848](https://m.dcinside.com/board/projectcc/80848), [dc:81023](https://m.dcinside.com/board/projectcc/81023), [dc:80069](https://m.dcinside.com/board/projectcc/80069) | Melon Soda 2T 072G (levelled fillers) and 2T 030G (the deck's ceiling); 캔디애플's move-speed recipe, and his team not surviving |
| [dc:80426](https://m.dcinside.com/board/projectcc/80426), [dc:79103](https://m.dcinside.com/board/projectcc/79103), [dc:79943](https://m.dcinside.com/board/projectcc/79943) | 3T 257G and 2T 919G result screens without teams (the 2T 919G *inferred* to be 섬영's); 2T 130G with Herb Lv.85 |
| [dc:80859](https://m.dcinside.com/board/projectcc/80859), [dc:79121](https://m.dcinside.com/board/projectcc/79121) | 100-run and 39-run logs at fixed power |
| [dc:79585](https://m.dcinside.com/board/projectcc/79585), [dc:79144](https://m.dcinside.com/board/projectcc/79144), [dc:79169](https://m.dcinside.com/board/projectcc/79169), [dc:81699](https://m.dcinside.com/board/projectcc/81699), [dc:79493](https://m.dcinside.com/board/projectcc/79493) | Survival HP, the pet choice and what survival is worth |
| [dc:81844](https://m.dcinside.com/board/projectcc/81844) | Boss datamine: damage-reduction phases, only the boss scores |
| [dc:82457](https://m.dcinside.com/board/projectcc/82457), [dc:79664](https://m.dcinside.com/board/projectcc/79664), [dc:81144](https://m.dcinside.com/board/projectcc/81144), [dc:81148](https://m.dcinside.com/board/projectcc/81148), [dc:80723](https://m.dcinside.com/board/projectcc/80723), [dc:82295](https://m.dcinside.com/board/projectcc/82295) | The Season 6 #1: his own post, his 5T board, and the second-hand rumours |

Not used, and why: Reddit (blocked), mrguider (Cloudflare), TikTok (JS shell), X (login), Naver's free board and search (login), and web search engines (no T-tier conquest content in either round's queries, `research-trail.md`).

## Files

| Path | What it holds |
|---|---|
| `research-trail.md` | The access probe and each round's searches and web rounds, with syntheses |
| `searches.json` | The saved searches every round reruns |
| `STATE.md` | Mid-session working state, superseded; vault paths are pre-migration |
| `import.json` | What `import:record` loads and from where |
| `curated/` | The curated dataset, which wins over the evidence summaries: `decks`, `mechanics`, `runes`, `gear`, `scores`, `rng`, `takeaways`, `timeline`, `meta`, `sources`, `glossary` |
| `evidence/01-access-probe.tsv` | HTTP reachability of DC, Arca, Inven and Naver |
| `evidence/02-dc-index.tsv`, `10-dc-index-extra.tsv` | DC gallery list indexes used to pick posts |
| `evidence/03-dc-posts/`, `11-dc-posts-extra/` | DC posts with comments and images (mobile site) |
| `evidence/04-arca-search-tobeol.txt` | The Arca search for 토벌 |
| `evidence/05-nv-guide-board-index.tsv`, `06-nv-guild-board-index.tsv` | Naver cafe board indexes |
| `evidence/07-nv-posts/` | Naver cafe articles with images |
| `evidence/08-extract/` | Subagent extractions per source batch (`BRIEF.md` is the schema); `import:record` reads its summaries from here |
| `evidence/12-glossary.json`, `12-glossary-src/` | KR↔EN names and the site data they came from |
| `evidence/13-sites/` | KR guide sites (crumblehub, cookieruncrumble.app/.net, alkapa, crumblehelper, gamemeca) |
| `evidence/14-global/` | EN sites, official patch notes and notices, YouTube pages and transcripts, video frames, Chzzk, and the unreadable probes |
| `evidence/15-crumbgg/` | crumb.gg rankings for every season, the power top 500, players, patches, sim and DPS pages, raw `api/` JSON |
| `evidence/16-top-players/` | Posts by or about the Season 5 top players, with search listings and crumb.gg JSON |
| `evidence/17-kr-highscore/` | Posts on what raises the median; `SYNTHESIS.md` ranks the levers |
| `evidence/18-kr-encounter/` | Posts on the fight's timeline, boss and scoring; `SYNTHESIS.md` |
| `evidence/19-sugarpocket/` | The Sugar Pocket skill and rune dataset (client 1.4.002) and the quoted formulas |
| `evidence/20-verify-1t999/` | crumb.gg board and Lookup captures verifying the 1T 999G run |
| `evidence/21-author-awkward2637/` | Desktop-site captures with uids, tying the 1T 999G posts to one DC account |
| `evidence/*.py` | `dc_scrape.py`, `nv_scrape.py`, `digest.py`, `build_sources.py` (retired) |
| `evidence/r2026-10-07/list-*.tsv` | The round's DC listings, one per saved search (`list-<id>.tsv`, reruns with more pages `-2`, `-3`) and per discovery term (`list-disc-*.tsv`); the Naver guide board listing |
| `evidence/r2026-10-07/03-dc-posts/` | The round's DC posts with comments and images |
| `evidence/r2026-10-07/07-nv-posts/` | nv:48773, the 1T guide |
| `evidence/r2026-10-07/08-extract/` | The round's extractions: DC batches, crumb.gg, videos |
| `evidence/r2026-10-07/13-sites/` | crumblehub's meta and conquest decks, crumbleguides' guide |
| `evidence/r2026-10-07/14-global/` | The patch-board listing and notes (nv:50417, nv:48486), YouTube searches and watch pages, video frames (`frames/<videoId>-<mmss>.jpg`, cut with ffmpeg from yt-dlp downloads; media, local only), cookieruncrumbles' guide |
| `evidence/r2026-10-07/15-crumbgg/` | crumb.gg's JSON (`api/`), the Guild Conquest page text, and the Season 5 final, Season 6 final and power boards as TSVs |

## Current state (2026-10-07)

- **Done.**
  - The 2026-10-07 round: Season 5's final and Season 6's boards, the round's forum runs, decks `cherry-levelled` and `meso-nospeed`, and the boss's phase table are in `curated/`.
- **Next, in order.**
  1. After the 10-08 update, re-check the ATK order with Lv.120 recipients, and whether Chardonnay enters any conquest lineup (Season 7 from 10-08 16:00 KST).
  2. Settle the 45 s / 27 s reading (Side findings); recommendation 1 depends on it.
  3. A paired survival test (same account, wipe build versus survival build) would settle reasoning 9.
  4. The simulator is parked on `OPEN-QUESTIONS.md`; the boss phase table now feeds it.
- **Rules.**
  - Rank by damage, never by 배.
  - Every claim carries a source id or a path.
  - Evidence files are never edited; a new measurement is a new file.
  - Where the evidence summaries and `curated/` disagree, `curated/` wins.
