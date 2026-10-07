# Research trail — 004 Golden Drop (Crumble Dungeon)

The search rounds, run 2026-09-28. The session brief limited web access to agent-browser (plus curl for JSON APIs and server-rendered pages), so the rounds ran through the sites' own search (DCInside, YouTube, the Naver cafe board) with the TypeScript scrapers, and one global round through DuckDuckGo in a headed agent-browser session, instead of the WebSearch tool the iterative-research skill assumes. Search results are leads, not findings: every claim that reached the README was captured into `evidence/` first.

## Before the rounds: what the repo already gave

- The name: record 001's captures of EOG and Crumble Guides call the mode Crumble Dungeon, "the whole squad against the giant Holy Golden Drop"; Sugar Pocket's catalog names the boss 황금갓방울 and the key 크럼블 던전 입장 열쇠. So "Golden Drop attack stage" = 크럼블 던전. `evidence/01-repo-grounding/repo-quotes.md`.
- Leads already indexed: dc:62042 (43G guide), dc:57218 (43.8G), ND러너's two dungeon videos, the Naver guides nv:45597 and nv:46592, and the newbie guidebook's dungeon section (nv:43444).
- A trap: 갓방울 alone is the pet 갓난갓방울 in gallery speech (record 002's glossary).

## Round 1 — survey (DCInside and YouTube)

Queries:
- DC `크럼블던전`, `크럼블 던전`, `크던`, `갓방울` (`evidence/02-dc/01-list-dungeon.tsv`)
- YouTube `크럼블 던전`, `크럼블던전 황금갓방울`, `크던 고득점`, `Crumble Dungeon cookie run crumble`, `Holy Golden Drop crumble` (`evidence/05-youtube/search/`)

Synthesis: DC's search window reaches back to about 2026-09-15; older posts came from record 001's indexes and were fetched by number. The gallery's vocabulary is 크던, 40마리, 공순서, 렙따, 세계선 and score posts in G with a multiple of total power (배). Score posts climb from 43.8G (9/2) to 379G (9/28). 갓방울 hits were mostly the pet, as expected. YouTube gave ND러너's final 180G guide, 그니's two guides, VART's 250G guide and 서신우's 127G guide; the English results were daily-dungeon videos, not this mode. Strongest signal: the top-40-by-power rule and the Milk/Pomegranate ATK-order engine. Gap: named lineups with levels.

## Round 2 — deepen (targeted DC terms, the Naver board, captions and frames)

Queries:
- DC `황금갓방울`, `던전 점수`, `선봉`, `40마리`, `크던 덱`, `던전덱`, `크럼블던전 덱` (`evidence/02-dc/02-list-terms.tsv`)
- Naver guide board, menu 9, back to launch (`evidence/04-naver/01-nv-guide-menu9.tsv`)
- Korean captions of the four guides with speech, and frames of VART's and ND러너's videos

Synthesis: the named lineups live in video descriptions and pinned comments (ND러너, 그니) and in Naver posts (뱅국, 쿠키런 연두), not on DC, where top players post rules and roster screenshots. The captions settled the beam rule (Projectile Speed recipients first, then ATK), the Cheesecake conflict and the perks; the frames verified VART's 221.4G at 9.23G and ND러너's 14.14G. The official patch notes (nv:16132, nv:37730, nv:44477) and crumb.gg's patch data dated the mode's changes, above all the 9/10 buff fix that brought Cheesecake back. Gap: the fight's length and the boss's patterns from a source other than players' timestamps.

## Round 3 — verify (global, and the remaining DC terms)

Queries:
- DC `크던 기갱`, `크던 공순`, `크럼블 던전 공략`, `크던 배`, `크럼블던전 G`, `subject:크던` (`evidence/02-dc/03-list-round3.tsv`)
- DuckDuckGo `"Crumble Dungeon" "Holy Golden Drop" score team` and `cookie run crumble "crumble dungeon" best team score milk pomegranate` (`evidence/07-web/01`, `03`)

Synthesis: the DC round returned nothing new (saturation). The global round found the Cookie Run Wiki page, which states the fight runs up to a minute, three entries a day, and the boss's attacks (knockback squash, lightning, summoned soldier drops), with the milestone and ranking reward tables matching the in-game screens; and an English guide restating ND러너's 50G method. No global source posts scores near the KR top; EOG's one A/B test (0.4G to 0.6G, 2026-08-13) is the only global measurement. crumb.gg and crumblehub have no Crumble Dungeon board or deck data (`evidence/03-sites/SOURCES.md`).

## After the rounds

- The mode is one global client with per-server boards, so "KR vs global" is a difference of sources, not of rules.
- The answer is a ranking of documented runs (`curated/dungeon-runs.json`) plus the lineup rules they share (`curated/decks.json`, `dungeon-exclusions.json`, `dungeon-lineups.json`).

## Round 2026-10-07

The refresh round, window 2026-09-28 to 2026-10-07. Web access through the sites' own search with the TypeScript scrapers, agent-browser (headed) for YouTube frames, the wiki and two DuckDuckGo queries, and curl for the channel pages and guides. yt-dlp and ffmpeg are not on this machine, so video stills were cut by screenshotting the player in agent-browser.

### Baseline: the saved searches

Queries: every entry in `searches.json`, one capture each (`evidence/r2026-10-07/02-dc/list-<id>.tsv`, `04-naver/list-naver-guide-board*.tsv`, `05-youtube/search/`, `05-youtube/channel-*.html`, `03-sites/crumbgg/`, the web pages), plus the official patch-notes and notices boards (`04-naver/list-naver-patch-notes.tsv`, `list-naver-notices.tsv`).

Synthesis: crumb.gg's `patches.json` served 200 (the orchestrator had seen a 404) and lists 1.5.002 for 10-08 but not the 10-01 notice; the cafe's notice nv:48486 shows the window's "dungeon changes" are the Daily Dungeons, so Crumble Dungeon has no change since 9/23. The guide board held the window's top find, 코니's 578.07G at 14.90G (nv:47255), with a video giving the ATK order. DC added a 428.96G run with a 704.63G board entry behind it, a weekly-close timer, and posts on Milk's arrival. The saved channels posted no dungeon video. Gap: the order behind 428.96G and 704.63G, and the perks' basis.

### Discovery 1: the window's new names

Queries: DC `크던 우유`, `석류 레벨`, `이면 버프`; YouTube `크럼블 던전 500G`, `크럼블던전 공략 10월`, `쿠키런 크럼블 크던`.

Synthesis: two players get Milk out at once with Pomegranate near Lv.60; 전치 reports the Rift buff counting in displayed power and scrambling the deployed order (dc:80897), backed by posts on Rift-inflated gear power. YouTube search saturated: only 누리머's 260G guide (09-28) was new, and its frames give 261.96G, 12.91G and Like A Family with Passion Pay.

### Discovery 2: perks and the patch delta

Queries: DC `열정페이`, `샤르도네`, `크던 G`.

Synthesis: a Passion Pay test (dc:78378) finds the perk follows the ATK the cookie window shows, without the captain's +10%, against ND러너's guide; 전치 finds Rapid Promotion a little above Like A Family over 30+ runs each (dc:80905). Chardonnay talk cites a leak that she receives Projectile Speed, which would pull Pomegranate's beam; no run shows her, so it stays under "what would change".

### Discovery 3: global and Korean web

Queries: DuckDuckGo `"Crumble Dungeon" cookie run crumble best team score` and `크럼블 던전 공략 우유 석류` (`evidence/r2026-10-07/07-web/ddg-*.txt`); EOG, the wiki, Crumble Guides and the Milk guide re-captured.

Synthesis: no global source posts a score near the Korean top; EOG revised its PvE tier read (10-04) but not its dungeon section; the wiki and guides are unchanged. Saturation.

### After the round

The top lineup moves from Scorpion second to Brightseeker second and Figure third (578.07G against 379.3G at similar power), and the Scorpion-first deck is marked obsolete. Unsettled: the 704.63G entry's lineup, 코니's full 40, and the weekly close's day.
