# 001 — Guild Conquest damage meta (Cookie Run: Crumble)

| | |
|---|---|
| Status | Written up 2026-09-28. Captures taken 2026-08-27 → 2026-09-27; Season 5 was still live. |
| Measured | Community posts, comments and result screens on the DCInside `projectcc` gallery (`dc:`) and the official Naver cafe `ccrumble` (`nv:`), crumb.gg's rankings and public JSON API, YouTube, and the Sugar Pocket calculator bundle (`web:`, `yt:`). Nothing was measured in the game client. |
| Branch | Captured in the Obsidian vault, migrated to this repo's `main` (`bf66e8d`); written on `main`. |
| What it changed | Nothing in the game or on the user's account. The curated dataset in `curated/` is what the app serves: `pnpm import:record 001-guild-conquest-meta`, then `data/snapshot.json`. |

**Evidence marks.** *Observed*: on a captured screen. *Stated*: a poster's words, no screen. *Derived*: arithmetic on the above, done here or by the poster. Source ids resolve in `curated/sources.json`; `dc:N` is `m.dcinside.com/board/projectcc/N`, `nv:N` is `cafe.naver.com/ccrumble/N`. Ids marked † are captured but not in `curated/sources.json` (they came from `evidence/17-kr-highscore/`).

## Question

As asked: the latest Guild Conquest meta lives mostly on Korean forums. Some teams do upwards of 2 trillion damage. Which exact cookie builds, sugar runes, gear, pets and leveling tricks do they run? Collect all current meta teams. The user has a whale account with every cookie built, and the KR and Global versions are identical.

As a falsifiable statement: there is a small, documented set of Guild Conquest teams that KR/Global top players use to reach ≥1T damage. For each one, the community sources name the cookie lineup, levels (including deliberate Lv.1 fillers), sugar runes, gear stats, pets and perks precisely enough that someone with every cookie could reproduce it.

## Verdict

**True from 1T to 2T; unanswered above 2T.** The documented ≥1T meta is one team: the Cherry deck (체리덱), with the Melon Soda deck (메소정전) as its move-speed variant. Both are in `curated/decks.json` with every cookie's level rule and reason, runes, gear, pets and perks. Every ≥1T forum run that names its deck is a Cherry deck; the best is a 1T 999G result screen (dc:76235). The Season 5 leaders at 2.3–3.2T on crumb.gg haven't published their teams (web:crumbgg-s5), so no source shows how 2T+ is built. "Reproduce" also has to be read statistically: at 1.74G, 1T lands in 1–2 of 10 runs (dc:75400). The strongest reason is the spread at equal team power. 1.8G gave 728× (dc:76135) and 2.38G gave 448× (dc:75176). So what separates runs is how well the Cherry deck is executed (ATK order, Pomegranate's beam count, runes, Brightseeker's stars, retries), not a different team.

## Reasoning

1. **The Cherry deck is the documented meta.** It has Lv.1 fillers so Pomegranate's +69% skill-amp beams land only on the carries, plus an ATK order of Milk › Brightseeker › Skating Queen › Macaron › Tea Knight › Cheesecake. Scorpion catches stray beams, and an R-rarity Cherry holds the formation. *Stated* in guides (nv:43653, dc:71135), backed by *observed* result screens (dc:76135, dc:75400). → `curated/decks.json` (`cherry`), `evidence/07-nv-posts/nv-43653.md`, `evidence/03-dc-posts/{71135,76135,75400}.md`.

2. **The ≥1T forum runs.** Every row is in `curated/scores.json`. The multiple (배) is shown for comparison only. The ranking is by damage.

   | Damage | Team power | 배 | Deck | What's observed | Source |
   |---|---|---|---|---|---|
   | 1T 999G | 3.07G, *derived* from the author's "덱투 650배정도" | ~650 *stated* | Cherry | Score on screen; power on no screen | dc:76235 |
   | 1.62T | 2.7G *derived* | ~600 *stated* | Cherry | Score on screen | dc:75462 |
   | 1T 312G | 1.8G | 728 | Cherry, Pomegranate Lv.1, Scorpion Lv.10 | Result screen | dc:76135 |
   | 1T 116G | 1.74G | 641 | Cherry, Scorpion Lv.45 | Result screen | dc:75400 |
   | 1T 066G | 2.38G | 448 | Cherry, old pets | Result screen | dc:75176 |
   | ≈1T | 1.6G | ~625 (a commenter's figure) | Melon Soda | Not verified | dc:74759 |

   Text-only claims, with no screen: 2.8T at 3.6G (dc:76317), 1.5T at 2.6G and 1.3T at 3G (dc:76333).

3. **Who ran the 1T 999G, and what's known about it.**
   - **Author.** DC user `awkward2637` posted it. The uid was read from the desktop site (`evidence/21-author-awkward2637/README.md`).
   - **Player.** crumb.gg lists 1T 999G under 섬영 · 판도라 (`evidence/20-verify-1t999/`). The same uid posted 섬영's own conquest lobby (dc:69331, dc:71121). That the DC account belongs to 섬영's player is *inferred* from those screenshots, not stated.
   - **Team power.** It's on no screen. The last *observed* team power is 1.38G on 9/20 (dc:71121).
   - **Build.** Cherry deck, no move speed. Milk has 1.27M ATK from SSR ATK% lines at minimum rolls. All *stated* (dc:76235).
   - **Misread claims.** The "780×" and "정전씀" (uses Tiger Lily) replies in dc:76583 belong to another user, `female8264`. So Tiger Lily isn't confirmed for this run.

4. **Power is necessary, not sufficient.**
   - **Forum runs.** At similar team power the multiple spans about 2×: 448× at 2.38G (dc:75176), ~450× at 3G (dc:76333, *stated*), and 388G at 1.93G (dc:76605). Against those, 728× at 1.8G (dc:76135).
   - **crumb.gg top 50.** Score ÷ account power runs 75–143×. The strongest account (30.0G) placed #24, and #9 reached 2T 509G on 18.7G (web:crumbgg-join; `evidence/15-crumbgg/11-players.tsv`, `13-power-top500.tsv`).
   - **Caveat.** crumb.gg power is account-wide, not the 12-cookie team power the forum's 배 uses. The two ratios don't compare.

5. **Pomegranate's beam count sets the multiple.**
   - **The beam.** +69% skill amp for 9 s, to the highest-ATK allies (ATK, not power), never to herself. Her level doesn't change it.
   - **Beam count.** 3 + the 다발 (Volley) level she holds when she casts: 5 with Cheesecake's 다발 2, 6 with Tiger Lily's 다발 3. Levels don't add up, and nobody reports more than 6.
   - **The catch.** Tiger Lily grants 다발 3 only to allies near her when she mounts.
   - **Recipients, in order.** Milk, Skating Queen and Brightseeker on the base beams, then Tea Knight and Macaron at 다발 2, then Cheesecake at 다발 3 (dc:70056). On 5 beams Cheesecake goes unbuffed.
   - **Sources.** `curated/mechanics.json` ("Pomegranate's beams"): nv:29690, dc:53804, dc:70056, web:sugarpocket-bundle-1.4.002. This is why non-carries sit at Lv.1 and Scorpion is tuned to exactly 7th in ATK (dc:76135, dc:71105).

6. **Buffs scale with the caster's skill amp.**
   - **Calculator formula.** Sugar Pocket computes `buff = floor(base × value × (1 + caster skill amp / 100))`, and the base can be the caster's ATK (`evidence/19-sugarpocket/README.md`). This is *derived* from a third-party calculator's code, not from the client.
   - **Official patch.** The 8/13 notes make skill amp apply to Milk's ATK buff (web:16132, `evidence/14-global/nv-patchnotes/nv-16132.md`).
   - **So.** Milk runs ATK%, because her buff's base is her ATK and the welfare perks go to ATK #1. The other buffers run skill amp.

7. **Runes and gear agree across guides.**
   - **Runes.** `curated/runes.json`. Brightseeker's haste has a knee near 40 in a model of the 43 s fight (nv:44761). The 1T 312G run shows 49.6 in battle (dc:76135), and at 58.6 drones start peeling onto adds (dc:75934). Cooldown = base × 100 / (100 + haste) (dc:31305).
   - **Gear.** `curated/gear.json`. The ceiling is 6 skill-amp lines plus 6 haste lines (dc:75400, dc:76135).

8. **Retries matter, but build changes matter more.**
   - **How often.** At 1.74G, 1T lands in 1–2 of 10 runs (dc:75400). At 1.69G, 500× lands in about 1 of 5, and the ceiling is roughly the best of 20 runs plus 10–20% (dc:74815). One 546G took 14 h of overnight macro (dc:76545).
   - **The 1T 999G author's history.** Two hours of manual retries bought him +16G on 9/19 (dc:70682). His next record, on 9/20, followed haste runes on Tiger Lily (dc:71121). → `curated/rng.json`, `curated/takeaways.json`.

9. **The 2T+ gap is arithmetic plus a hypothesis.**
   - **Arithmetic** (*derived*). About 3G of team power at 650–780× is 2–2.3T.
   - **Hypothesis: surviving the 17 s wipe.** Posters put the floor at about 9M HP and 45% damage reduction per survivor (dc:74801, dc:69856, *stated*). At 21G account power, the 1T 999G author reports Macaron, Brightseeker, Pomegranate and Skating Queen alive and dealing damage until 8 s left (dc:76583, *stated*).
   - **Timing.** The Season 5 jump coincides with the first survival reports on 9/24. That's a timing match, not a shown build.

## Steelman: "more power is all you need"

**The case.** Damage is team power × multiple, so power multiplies everything. Every 2T+ player on crumb.gg holds 17–26G account power (web:crumbgg-join). The 1T 999G author climbed from 893G at 1.38G (dc:71121) to 1T 999G a week later. The survival that may explain 3T is HP and damage reduction, which is power by another name. The 1T 312G author himself says the multiple keeps rising as team power, stars, runes and gear rise (dc:76135).

**The answer, point by point.**
- **Equal power, different results.** At roughly equal power, the multiple varies about 2× (reasoning 4). A 2.38G team scored less than a 1.8G one.
- **crumb.gg.** The highest-power account placed #24, and an 18.7G account placed #9.
- **The 1T 999G climb.** His power for the 1T 999G run is only known *through* his own 650× figure, so it can't separate power from setup. Between the runs he also gave Tiger Lily haste runes (dc:71121), and by 9/25 he ran a 10★ Brightseeker (dc:75462, *stated*). Her stars on 9/20 aren't recorded.
- **Survival.** Conceded in part: surviving the wipe needs HP and damage reduction. A commenter in the same thread says what matters is the cookies' in-raid HP and damage reduction, not account power (dc:76583, *stated*).
- **"The multiple rises with power."** The same author puts the ceiling on 내실 (overall build), runes and gear: "같은 덱으로 200배 정도 나오는 길드원도 있음" (a guildmate gets about 200× with the same deck; dc:76135).

**Net.** Power is the multiplicand and the setup is the multiplier. For a team below about 600×, fixing the setup is worth as much as doubling power.

## Recommendation for the user's account

**The account, as the user stated it this session:**
- Team power 2.2G. Median 700G (318×, *derived*), best 900G (409×, *derived*).
- Brightseeker is 8★ with 45 haste in combat. The other buffers are 9–10★.
- The buffed cookies (the beam recipients) are Lv.100, and Macaron is 4th in ATK. Scorpion is Lv.40.
- ATK% rune lines on Milk, Macaron and Skating Queen, a mix elsewhere.
- Tiger Lily's haste has been tuned, but runs still often show 5 Pomegranate beams.

**Where the gap is.** The 1T 312G author says his Cherry deck averages 600–800G at 1.8G (*stated*) and peaked at 728× (dc:76135). At 600–730×, 2.2G would be 1.3–1.6T (*derived*). The gap is in the multiple, not in power. In order of expected return:

1. **Get the sixth beam more often.**
   - **Runes.** Tiger Lily runs all skill haste. The Melon Soda deck's ≈1T author (캔디애플) runs SSR +5, SR +2 and SR +3 on her (dc:74818, `evidence/08-extract/dc-extra.json`). Pomegranate runs skill amp and no haste (`curated/runes.json`).
   - **What's left is positioning.** Even with haste, 6 beams depend on Pomegranate standing near Tiger Lily when Tiger Lily mounts, which is a luck and positioning roll. Five beams means Cheesecake goes unbuffed.
   - **Use the checklist as a retry filter.** Pomegranate should hold 다발 2 by the HUD's 45 s mark and 다발 3 by the 27 s mark (dc:70056, 캔디애플). A run that misses 다발 3 stays at 5 beams, so restart it rather than play it out (a *derived* use of the checklist). Whether "45초/27초" means time left or time elapsed is ambiguous in the post (see Side findings).
2. **Brightseeker to 10★.**
   - **Evidence.** The 1.62T and 1T 999G author runs a 10★ Brightseeker (dc:75462, *stated*). 10★ opens two more rune slots (dc:66636, `curated/mechanics.json`), and that author fills them to 4 haste + 2 skill amp.
   - **Size of the gain.** Unmeasured for 8★ → 10★. One account felt 7★ → 8★ was worth only about 10% (dc:71155†, one data point).
   - **Haste.** 45 in combat is already in the 40–50 band where returns flatten (nv:44761). Don't chase more, and stay under about 58 (dc:75934).
3. **Reroll the ATK% lines on Macaron and Skating Queen to skill amp.** Milk keeps all ATK%.
   - **Why.** A buffer's buff scales with the caster's skill amp (reasoning 6). Every guide from 9/17 on says skill amp for them (nv:43653, dc:71135). alkapa.gg's raid tag still says ATK% (`curated/runes.json`, "disputed").
   - **Evidence it helps.** One account at 1.88G and 265× projected roughly 1.7× from this switch plus an ATK-order fix (dc:70064†, *stated* projection).
   - **Check afterwards.** Re-check the ATK order in battle: Milk › Brightseeker › Skating Queen › Macaron › Tea Knight › Cheesecake. Skating Queen ranks on base ATK, and the guides allow ranks 2–6 to swap among themselves (dc:76135).
   - **The rest of the mix.** Cheesecake, Tea Knight and Pomegranate go all skill amp. Dark Choco goes haste, Pinot haste + damage reduction, and Scorpion skill amp + crit dmg.
4. **Scorpion's level is only an ATK-order knob.**
   - **The target.** Exactly 7th in ATK, checked in battle (dc:71105). In the lobby, hold her at least 10% under the 6th cookie, because Octo Wasabi adds about 8% ATK when she enters (dc:76135).
   - **What goes wrong.** A forgotten Scorpion level held one player under 400× until he reset it (dc:74994†).
   - **Lv.40.** It's inside the documented Lv.10–45 range. Whether it's right depends only on where she lands in the in-battle order.
5. **Raid gear preset** (`curated/gear.json`).
   - Weapons: skill amp + crit dmg.
   - Top-right: haste + skill amp.
   - Armour: damage reduction + HP.
   - Bottom-right: haste + damage reduction.
   - No move speed, accuracy or focus.
6. **Retry after a build change, not instead of one.**
   - **Your spread.** The best run is 29% over the median (*derived*). That's in line with "best of 20 + 10–20%" (dc:74815), which suggests this setup is already retried close to its ceiling.
   - **The macro.** `tools/conquest-macro/` automates the retry loop.

## What would change the verdict

- **A published 2T+ team.** A Season 5 top-50 player posting their team, levels and runes would answer the half this record can't. It would also show whether it's still the Cherry deck.
- **Final Season 5 boards.** They're due after 2026-09-28 12:00 KST. They move the score bands, not the deck finding.
- **The 1T 999G run's power.** A lobby or result screen showing its team power would turn the 3.07G from *derived* into *observed*. A number far from 3G would weaken reasoning 9.
- **A survival build.** A replicated run with named cookies, pets and HP/DR values that survives the 17 s wipe would turn the survival hypothesis into a finding.
- **A patch.** Changes to Tea Knight's raid buff, Pomegranate's beams, Milk's skill-amp scaling or the 다발 grants would rewrite the deck.
- **The user's own data.** Stat screens and a run log (`OPEN-QUESTIONS.md`, question 1) would test the recommendation's 1.3–1.6T estimate on the actual account.

## Side findings

Each is out of scope and surfaced for a decision. None is filed in `.ai/followups/`, because this write-up touches only this README. The open ones are listed in the root `README.md` under "Next research steps".

- **Is 45 s / 27 s time left or elapsed?** The 다발 checkpoints in dc:70056 don't say. `curated/mechanics.json` reads them as time left. `evidence/18-kr-encounter/SYNTHESIS.md` reads them as elapsed, while noting that the community's "17초" and "30초" are time left (dc:69724). This decides when the retry filter in recommendation 1 fires. Follow-up: ask in the gallery, or time one run on video.
- **Does a later Cheesecake grant replace a held 다발 3?** No source says. If it does, Cheesecake's timing can cost the sixth beam. Follow-up: not filed.
- **Candy Shade Pouch's HP bonus.** `curated/mechanics.json` has +12.5%. `evidence/18-kr-encounter/SYNTHESIS.md` reads +7.5%, flat past 5★, from images. Commenters say 10–15★ is enough (dc:74440†). Follow-up: check against a max-star screenshot.
- **Boss phases.** One poster's datamine gives damage-reduction phases every 12 s from 10 s elapsed (dc:71383, `evidence/18-kr-encounter/SYNTHESIS.md`). It's single-source and low confidence. Follow-up: the parked simulator spec (`docs/superpowers/specs/2026-09-27-conquest-simulator-design.md`).
- **Octo Wasabi's ATK bonus.** The pet card says 10%; posters measure 8%, and the bonus is missing from the stat screen (`curated/mechanics.json`). Follow-up: not filed.
- **Alignment differs by device** (dc:76716). It matters for the Melon Soda deck. Follow-up: dropped; the user runs Cherry.
- **Unreadable sources.** Reddit was blocked (`evidence/14-global/02-reddit-probe.tsv`) and mrguider sits behind Cloudflare (`evidence/14-global/16-mrguider-guild-conquest.html`). TikTok returns a JS shell (`evidence/14-global/2[12]-tiktok-*.html`), and X needs a login (`evidence/14-global/20-x-aug23-article.html`). Naver's free board and search need a login too. A claimed ~1T video from guild 카페 was never found. Follow-up: retry the 카페 video (root `README.md`).

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
| [dc:76605](https://m.dcinside.com/board/projectcc/76605) | 388G at 1.93G with a 5★ Brightseeker |
| [dc:74815](https://m.dcinside.com/board/projectcc/74815), [dc:76545](https://m.dcinside.com/board/projectcc/76545) | Retry odds and macro hours |
| [dc:74801](https://m.dcinside.com/board/projectcc/74801), [dc:69856](https://m.dcinside.com/board/projectcc/69856) | The 9M HP / 45% DR survival floor |
| [nv:44761](https://cafe.naver.com/ccrumble/44761) | Brightseeker's haste breakpoint model |
| [dc:75934](https://m.dcinside.com/board/projectcc/75934), [dc:31305](https://m.dcinside.com/board/projectcc/31305) | Drones peel at 58.6 haste; the haste formula |
| [dc:66636](https://m.dcinside.com/board/projectcc/66636) | Rune slot unlocks and per-line maxima |
| [dc:75854](https://m.dcinside.com/board/projectcc/75854), [dc:76218](https://m.dcinside.com/board/projectcc/76218) | The raid gear preset |
| [dc:69724](https://m.dcinside.com/board/projectcc/69724) | The community's "17초/30초" are time left |
| [dc:76716](https://m.dcinside.com/board/projectcc/76716) | Alignment differs by device |
| [dc:74994](https://m.dcinside.com/board/projectcc/74994)†, [dc:70064](https://m.dcinside.com/board/projectcc/70064)†, [dc:71155](https://m.dcinside.com/board/projectcc/71155)†, [dc:74440](https://m.dcinside.com/board/projectcc/74440)† | Scorpion-level fix; ATK%→skill-amp projection; Brightseeker 7★→8★; pet stars |
| [dc:71383](https://m.dcinside.com/board/projectcc/71383) | Boss phase datamine (low confidence) |
| [web:16132](https://cafe.naver.com/ccrumble/16132) | 8/13 patch: skill amp scales Milk's buff |
| [web:crumbgg-s5](https://crumb.gg/rankings) | Season 5 live board (#1 3T 226G on 2026-09-27); no raid teams shown |
| [web:crumbgg-join](https://crumb.gg/pub/leaderboard) | Season 5 scores joined with account power (`/pub/live`, `/pub/leaderboard`, `api.crumb.gg/api/rankings`) |
| [web:crumbgg-lookup-seomyeong](https://crumb.gg/lookup) | 1T 999G listed under 섬영 · 판도라, 22.20B account power |
| [web:sugarpocket-bundle-1.4.002](https://cookieruncrumble.app/sugar-pocket/assets/index-CAL2QT8S.js) | Buff, damage and debuff formulas from the calculator's code |

Not used, and why: Reddit (blocked), mrguider (Cloudflare), TikTok (JS shell), X (login), and Naver's free board and search (login).

## Files

| Path | What it holds |
|---|---|
| `research-trail.md` | The access probe and the web search rounds, with syntheses |
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
| `evidence/*.py` | `dc_scrape.py`, `nv_scrape.py`, `digest.py`, `build_sources.py` |

## Current state (2026-09-28)

- **Done.**
  - The record is complete to the deep-research contract, and `curated/` matches the corrections in this README: 다발, the 1T 999G attribution and its derived power, and Scorpion's 7th-in-ATK rule.
  - The app loads `curated/` through `pnpm import:record 001-guild-conquest-meta`; `data/snapshot.json` is the committed dump.
- **Next, in order.**
  1. After 2026-09-28 12:00 KST, re-pull crumb.gg's final Season 5 boards as a new evidence folder (`evidence/22-…`). Update `curated/scores.json` and the verdict's 2.3–3.2T band if they moved. Don't edit `15-crumbgg/`.
  2. Settle the 45 s / 27 s reading (Side findings); recommendation 1 depends on it.
  3. Open research: the exact survival build for the 17 s wipe, and whether the top players run Herb or other survival fillers. These are candidates for a new record, not edits to this one.
  4. The simulator is parked on `OPEN-QUESTIONS.md`; the user's calibration data would test the recommendation's estimate.
- **Rules.**
  - Rank by damage, never by 배.
  - Every claim carries a source id or a path.
  - Evidence files are never edited; a new measurement is a new numbered file.
  - Where the evidence summaries and `curated/` disagree, `curated/` wins.
