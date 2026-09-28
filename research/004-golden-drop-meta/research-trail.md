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
