# Research trail — 003 stage pushing

The web rounds (iterative-research: three rounds of three parallel WebSearch queries), run 2026-09-28. Search results are leads, not findings: each claim that reached the README was captured into `evidence/` first.

## Before the rounds: what the repo and the sites already gave

- Record 001 holds the DC post that first published the power gate (dc:17035, 2026-08-07): 99% power → 75% final damage, 100% → 100%, 120% → 120%, capped at 120%.
- crumblehub.co publishes the whole bracket table in its stage tool (`evidence/03-sites/crumblehub_assets_StageBossIndex-C8_ZZo3q.js`): <10% → 1%, ≥10% → 5%, ≥20% → 15%, ≥40% → 35%, ≥60% → 55%, ≥80% → 75%, ≥100% → 100%, ≥120% → 120%. So the user's "35% efficiency" is the bracket entered at 40% of recommended power and "15%" the one entered at 20%.
- crumblehub's stage index (`crumblehub_data_stage-boss-index-v2.json`, game data 1.4.002) has 328 chapters × 30 stages with the boss and recommended power of each stage; the last stage, 328-30, is the gate to the Dimensional Rift (차원의 이면).
- DC search (`evidence/02-dc/01-list-stage.tsv`) shows the community's own vocabulary: "35% 단", "15%로 밀기", "비겁이 컷", "35% 클덱", "방치덱", "오토덱".

## Round 1 — survey

Queries:
- 쿠키런 크럼블 스테이지 35% 덱 전투력 보정
- Cookie Run Crumble stage push team low power recommended power damage penalty
- 쿠키런 크럼블 차원의 이면 공략

Synthesis: the KR angle surfaced the two DC power-gate posts (dc:17035 and a second, dc:17487 "전투력 보정 시트표"), the alkapa stage-check tool (team power, 명중 accuracy and 집중 focus against each stage's boss evasion and resistance) and Sugar Pocket. The global angle returned crumblehub's English stage page (the same bracket table) and a cluster of SEO guide sites (cookieruncrumbles.com, crumbledb.com, cookierun-crumble.wiki, cookieruncrumblehub.wiki, cookieruncrumble.net) whose stage guides stop at chapter 10–42 and restate the bracket without numbers of their own. The Dimensional Rift angle returned nothing specific: no web guide exists yet, so the Rift has to come from DC and the Naver cafe. Strongest signal: the bracket table and accuracy/focus as a second gate. Gap: teams at the 35% and 15% brackets.

## Round 2 — deepen

Queries:
- 크럼블 스테이지 15% 클리어 덱 유튜브
- alkapa.gg crumble stage-check 명중 집중 요구치
- cookieruncrumble.app 슈가포켓 스테이지 덱 추천 비겁한 쿠키

Synthesis: confirmed that YouTube's KR stage guides exist (youtube glWD1kbs9Vs "영상 하나로 끝내는 모든 스테이지 공략", whose search snippet names Witch, Devil, Cheerful, Biker and Licorice decks); a follow-up `yt-dlp ytsearch` pass found the rest of the KR video set, including the top player ND러너's Rift videos (`evidence/05-youtube`). The alkapa stage-check tool checks team power, accuracy and focus per stage and names the next bracket's power, which confirms accuracy and focus as a stage-specific requirement beside power. Sugar Pocket is a deck comparison tool; its community deck list holds a handful of low-stage decks (`evidence/03-sites/sugarpocket_api_decks.json`) and its stage page restates the bracket table. No source in any round documents a team clearing at the 15% bracket on the open web; those clears live on DC and the Naver cafe (see `evidence/02-dc`, `evidence/04-naver`).

## Round 3 — verify

Queries:
- reddit CookieRun Crumble stage 300 stuck team power percent damage bracket
- "Dimensional Rift" OR "Dimension" CookieRun Crumble September 23 update stage 328
- 쿠키런 크럼블 9월 23일 업데이트 스테이지 난이도 완화 차원의 이면

Synthesis: Reddit has nothing on high stages; the global community is not where the late stages are pushed. The 2026-09-23 update is confirmed by press (Pocket Gamer, ZDNet Korea, Inven): the Dimensional Rift is a boss-only challenge for players who cleared every main stage, with a Dimensional Energy Level (차원의 힘) that raises stats, season rewards, and Dimension Fragments traded for a pet. The official patch note (nv:44477) is the primary source; it alone states the stage difficulty easing for 169-1 to 328-30 and the boss rebalance for 169-1 to 248-30. The press articles corroborate the date.

## Final takeaways (each verified against a capture before use)

- The bracket table, the 35%/15% entry points and the boss-damage exemption: crumblehub (`evidence/03-sites`).
- Stage recommended power per stage and the Rift's per-level power: crumblehub's 1.4.002 data (`evidence/03-sites`).
- Teams at 35% and 15%: DC and the Naver cafe only (`evidence/02-dc`, `evidence/04-naver`); the web rounds found none elsewhere.
- The Rift's rules and the 9/23 stage relief: the official patch note (nv:44477) with press corroboration (`evidence/05-web`).
