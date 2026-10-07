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

## After the rounds

A lead passed in by the coordinator, not found by the rounds: crumb.gg publishes its own datamined stage file (`/data/stages.json`) and patch digest (`/data/patches.json?v=5`). Both captured; the brackets and all recommended powers match crumblehub's exactly (`evidence/06-derived/crumbgg-comparison.json`).

## Final takeaways (each verified against a capture before use)

- The bracket table, the 35%/15% entry points and the boss-damage exemption: crumblehub (`evidence/03-sites`).
- Stage recommended power per stage and the Rift's per-level power: crumblehub's 1.4.002 data (`evidence/03-sites`).
- Teams at 35% and 15%: DC and the Naver cafe only (`evidence/02-dc`, `evidence/04-naver`); the web rounds found none elsewhere.
- The Rift's rules and the 9/23 stage relief: the official patch note (nv:44477) with press corroboration (`evidence/05-web`).

## Round 2026-10-03 (Rift at 15%)

### Web rounds

Round 1 queries:
- 쿠키런 크럼블 차원의 이면 15퍼
- Cookie Run Crumble Dimensional Rift team low power clear guide
- 크럼블 이면 덱 공략 차원의 힘

Synthesis: the search engines index nothing Rift-specific in Korean beyond the 9/23 update; English results are generic team guides. The Rift's community lives on DCInside, the Naver cafe and YouTube, as in the first round.

Round 2 queries:
- reddit CookieRunCrumble "Dimensional Rift" power
- arca.live 크럼블 차원의 이면
- 나무위키 쿠키런: 크럼블 차원의 이면

Synthesis: no Reddit or arca.live thread; the official EN names surfaced (Dimensional Energy Level for 차원의 힘, Continuum Cog for 무한바퀴, an SSR pet adding Boss DMG in the Rift). Checked in the browser afterwards: arca.live's Cookie Run channel, by keyword and by its unfiltered listing back to 2026-09-22, holds no Rift post (`evidence/r2026-10-03/03-sites/arca_cookierun_*.tsv`); Namu Wiki has no Rift article and its Cloudflare blocked the session; the Crumble subreddit returns nothing (`03-sites/reddit_cookieruncrumble_search_rift.txt`).

Round 3 queries:
- "Dimensional Energy" Cookie Run Crumble Rift
- "Continuum Cog" Crumble
- a probe of crumb.gg and crumblehub for Rift endpoints

Synthesis: the press repeats the patch article; crumb.gg serves `data/rift.json`, the Rift's damage table, 차원의 힘 levels, idle gain and seasons from the 1.4.002 client (`03-sites/data-rift.json`). crumblehub's clear-deck API has no Rift mode.

### YouTube

Searches: one capture per query in `05-youtube/`, named `ytq-<query>.html`. They found 서신우's Rift entry and level 2-4 guides (read from frames and burned-in subtitles) and ND러너's level-34 stream; the rest were stage videos or other games.

### DCInside and the Naver cafe

The saved searches and the discovery queries are in the DC lane's listings (`02-dc/list-<search id>.tsv`) and `04-naver/list-naver-*.tsv`; the ones that produced a cited source are saved in `searches.json`. DC's search splits a title on spaces, so the multi-word queries are noisy; the single-word nicknames saved in `searches.json` carried the round.

### Takeaways (each verified against a capture before use)

- The bracket a Rift fight runs at: the Rift's header power against `curated/rift-levels.json`, with crumb.gg's `dmg` table (`03-sites/data-rift.json`) and 서신우's "차원 기준" lines (nv:49183, nv:49192, nv:49254).
- The 15% clears and their teams: DCInside screenshots (`02-dc/dc/`), curated in `curated/rift-clears.json` and `curated/decks.json`.

## Round 2026-10-07

Window: the Rift from 2026-10-03, main stages from 2026-09-28, to 2026-10-07. The saved searches reran one capture each (`evidence/r2026-10-07/`); the discovery queries below are the round's own.

### Web rounds

Round 1 queries:
- 쿠키런 크럼블 차원의 이면 시즌2
- Cookie Run Crumble Dimensional Rift season 2 October 2026
- 쿠키런 크럼블 10월 8일 업데이트 레벨 120 샤르도네

Synthesis: the open web has nothing on Rift season 2 or the 10-08 update; the press stops at the 9/23 Chuseok update (Inven Global 26418). As in earlier rounds, the Rift lives on DCInside, the Naver cafe and YouTube.

Round 2 queries:
- Devsisters CookieRun Crumble Chuseok update dungeon oven
- 크럼블 이면 15퍼 덱 망치공주 트럭 비틀기
- "Crumble" "Dimensional" rift 15% team reddit OR discord

Synthesis: the Chuseok article is the 9/23 update again. The Korean slang query returns nothing about the game. The English one surfaced cookierun.wiki's Crumble patch-notes pages (1.1 to 1.4).

Round 3 queries:
- cookierun.wiki Patch Notes (Crumble) October 8 update level cap 120 Chardonnay
- cookierun.wiki Dimensional Rift Crumble Dimensional Energy Level season
- 쿠키런 크럼블 차원의 이면 랭킹 단계 공략 블로그

Synthesis: checked in the browser, cookierun.wiki's patch-notes index stops at 1.4 (2026-09-23) and has no 1.5 page; curl gets a 403 there. Korean blog guides (oslink.io) are beginner team guides with no Rift content. Not used: none of it adds a fact the captures don't.

### Discovery outside the web rounds

- **DCInside** (`02-dc/list-disc-*.tsv`): 시즌2, subject:시즌, subject:층, subject:주차, 샤르도네, 만렙, 뻥투, 차원조각, 무한바퀴, subject:차원의, 이면 20 and 이면 30 found cited posts. Nothing came from 이면 랭킹, subject:랭킹, subject:등수, subject:20단계/25단계/30단계, 120렙, 차원 15, subject:순위, 이면 순위, 렙조절, subject:이계, 이면 투력, subject:성공, subject:깼, subject:뚫, 이면 덱, subject:무바, subject:차힘, subject:15단, subject:망치공주 or subject:들개. Name searches (name:카린, name:Noah, name:노아, name:롤로노아, name:SCANDAL) found nothing new: the Rift posters post as anonymous ㅇㅇ.
- **Naver cafe search** (`04-naver/search-*.txt`): 차원의 이면 and 이면 found nv:50328 and nv:49390; author:서신우 found nv:50582. Nothing came from 이면 15, 이면 덱, 시즌2 이면, 120레벨, 차원의 힘, 비틀기, 15퍼, 시즌2, 120, author:롤로노아 or author:카린. Several hits need a login (listed in the round's report).
- **YouTube** (`05-youtube/ytq-*.html`): 차원의 이면 15퍼 surfaced 그니's per-level Rift shorts, which led to his level 6-10 and 11-20 deck guides (yt:IAFNvjeqUqw, yt:kMw3E6KXUAo), the round's main source. Cookie Run Crumble Dimensional Rift surfaced stanley's 35% shorts. Nothing citable came from 이면 15%, 차원의 이면 비틀기, 차원의 이면 20/21/25/30/40단계, 이면 시즌2, 크럼블 120레벨, 크럼블 샤르도네, 크럼블 이면 덱, 그니 차원의 이면, cookierun crumble dimensional rift stanley or 누리머 쿠키런 크럼블.
- **crumb.gg** (`03-sites/`): its JS names the Rift board `/pub/live?board=dimension_stage` (captured with its 168-hour history) and the 10-08 client's data files `rift_v15.json` and `stages_v15.json` (captured). crumblehub's clear-deck API has no Rift mode (`rift`, `dimension`, `dimension_stage` and `dimensional_rift` answer 400). Sugar Pocket gained a `/dimension/` planner (captured; no teams).
- **arca.live and Reddit** (`03-sites/`): nothing on the Rift since 10-03; Reddit served a bot check.

### Takeaways (each verified against a capture before use)

- 15% Rift clears with the header power on screen now cover every boss type except GingerCraven: 그니's guides (`05-youtube/frames/kMw3e-*.jpg`, `IAFNe-*.jpg`) and 머핀이's level 7 (`04-naver/nv/img/nv-50328-1.jpg`), curated in `curated/rift-clears.json`.
- GingerCraven is still a 35% fight in every screenshot (그니 levels 5, 10, 15 and 20).
- Season 2 (from 10-08) runs on new game data: recommended power ×1.448 and a new boss (`03-sites/data-rift_v15.json`, `06-derived/crumbgg-diff-r2026-10-07.json`).
