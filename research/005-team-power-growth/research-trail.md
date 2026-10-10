# Research trail — 005 team power growth

The web rounds (iterative-research), run 2026-09-28. Search results are leads, not findings: every claim that reached the README was captured into `evidence/` first. The DCInside, Naver cafe and YouTube searches ran through the capture tools and are listed in `evidence/02-dc/*.tsv`, `evidence/03-naver/01-nv-guide-menu9.tsv` and `evidence/05-youtube/ytq-*.html`.

## Before the rounds: what the repo already gave

- Record 003's bracket table and its 2.2G reach (55% to 288-3, 35% to 304-19), and its "power is padded" practice.
- Record 002's captures of the cafe's intro guide (nv:33130) and newbie guidebook (nv:43444): the growth systems by name, what Arena applies, purchase tiers, Stellar shapes, plating order, shop orders.
- Record 001's Sugar Pocket game-data catalogs (game 1.4.002): level, star and plating curves, oven gear progression, collection boosts, rune reroll costs.
- `evidence/01-repo-grounding/repo-grounding.md` holds the locators.

## Round 1 — survey

Queries:
- 쿠키런 크럼블 전투력 올리는 법 성장 요소 효율
- Cookie Run Crumble how to increase combat power guide breakthrough stellar link gnome lab
- 쿠키런 크럼블 패키지 가격 효율 과금 추천

Synthesis: the KR query surfaced DC threads asking the same question (dc:23689, dc:17489) and generic guide sites; the English one surfaced global guide sites (cookieruncrumbles.com, cookierun-crumble.wiki) that restate the growth systems with no numbers; the spending query surfaced crumblehub's spending guide with KRW budget tiers and its package value table (Crystal value per KRW), plus a DC "package value roundup" (dc:1905, which no longer loads; the gallery manager's later series dc:68116–68148 does). Strongest lead: crumblehub's `/api/efficiency` and the gallery's own threads for before/after numbers. Gap: USD prices and any measured power gain per system.

## Round 2 — deepen

Queries:
- Cookie Run Crumble best packages to buy USD "$4.99" OR "$9.99" sugarcoating membership pass value
- CookieRun Crumble Resolve Fame Gnome Laboratory Stellar Link power priority F2P guide
- 쿠키런 크럼블 도감 효과 전투력 펫 보유효과 동행효과 길드 연구소

Synthesis: Pocket Gamer's global pack guide (Ad Removal, Crumble Pass, "about $10 for both") but no per-item USD prices; the English progression guide restates priorities without figures; the collection query found namu.wiki's collection page, which returned a Cloudflare challenge in the browser and was not used (not circumvented). No site measures the guild lab. The measured gains all come from DCInside (dc:68732, dc:77329, dc:75684, dc:76718) and the patch digest (Resolve per-level values).

## Round 3 — verify

Queries:
- "Crumble" cookierun "Special Sugarcoating Membership" price $
- reddit CookieRunCrumble which packs are worth it permanent membership crumble pass price dollars
- 쿠키런 크럼블 길드 연구소 효과 전투력 증가량

Synthesis: the first query surfaced the App Store product page, whose top in-app purchases carry prices; captured for the US and KR storefronts, matching names give the KRW↔USD tiers (`evidence/07-derived/price-tiers.json`). No USD price for the 55,000 KRW membership exists on the open web; Reddit has nothing on packs. The guild lab's size stays a single claim (dc:76461: research 13 ≈ +20% total power); no web source quantifies it.

## After the rounds

- The plating odds table for 0→20 is an image in dc:53079, transcribed into `evidence/08-extract/plate-rates.json`; 20→25 and the restore costs come from the official notice reposted as dc:72150.
- crumb.gg's current patch digest (`evidence/04-sites/data-patches.json`) gave the Resolve, Fame, Gnome Lab and plating cap changes by date.
- Sugar Pocket's catalog API now answers 403 to plain requests; record 001's copies of the same game version serve.
- English subtitles hit YouTube's 429 limit; only `6DFlOgeXLds` has an English track in the record, and the other global videos are cited by title only or not at all.

## Final takeaways (each verified against a capture before use)

- Measured before/after gains: Stellar (dc:68732, dc:77329), plating (dc:75684), Resolve versus gear (dc:76718), gear rarity (dc:72901), the 2G → 4G path (dc:76290, record 003).
- Costs: plating odds (dc:53079, dc:72150), Stellar shapes (nv:43444, nv:5693, dc:55570, dc:56417), TSSR stars (dc:50913), KRW prices (crumblehub, App Store KR), USD prices (App Store US).
- Orders: the cafe guidebook (nv:43444), ND러너's and 서신우's videos, crumblehub's currency and plating guides.

## Round 2026-10-07

The first refresh round. Window: 2026-09-28 (`curated/meta.json`'s `updated`) to 2026-10-07. The saved searches reran first, one capture each (`evidence/r2026-10-07/02-dc/list-<id>.tsv`, `04-sites/`, `05-youtube/`, `06-store/`); discovery followed. Search results are leads: a claim reached the README only from a capture.

### Baseline

- crumb.gg's patch digest answered 200 again on 2026-10-07 (the round brief had it at 404) and already carries update 1.5.002 as upcoming, with the new SSR's stats at level 120 (`04-sites/data-patches.json`). The official cafe's patch board (menu 3, `03-naver/list-naver-patch-notes.tsv`) lists the 10-08 notes (nv:50417, posted 10-07); the 10-01 notice on oven auto-open (nv:48486) sits outside that board and was fetched by id.
- Every saved DCInside search covers the window: each listing's oldest row predates 09-28 (the gallery search reads back to about post 72,700, 09-22).
- crumblehub's efficiency table and guides, Pocket Gamer and the EN progression guide are unchanged apart from page chrome; the App Store top-purchase lists rotated (KR adds the ₩1,500 Epic gear hot deal and the ₩6,000 Arena ticket pack).
- Sugar Pocket's pages are client-rendered and agent-browser isn't installed on this machine, so they were saved as served (no rendered text). Two saved YouTube channels (훈TV, 김바보 TV) now post only other games. yt-dlp isn't installed either, so videos were dated from watch digests and read by title and description only.

### Round 1 — survey

Queries:
- 쿠키런 크럼블 120레벨 확장 전투력
- Cookie Run Crumble level cap 120 update October 2026
- CookieRun Crumble max level 150 datamine

Synthesis: the open web has nothing on the cap raise; news sites stop at the September updates. The "150" lead resolves to cookierun.wiki pages (a Cloudflare challenge to curl and WebFetch; not circumvented, not used) whose snippet speaks of Crumble Level 150, the account level, not the cookie cap. The community is where the round's material is.

### Round 2 — deepen

Queries:
- CookieRun Crumble Chardonnay Cookie update max level 120 Gnome Laboratory 130
- 쿠키런 크럼블 샤르도네맛 쿠키 업데이트 최대 레벨 120 노움 연구소
- 쿠키런 크럼블 와글와글 스페셜 패스 가격 구성

Synthesis: still nothing indexed on the 10-08 update or the Rumble Special Pass. The pass price comes from the App Store (₩19,000, `06-store/`); the update's details from the official notes and the gallery. Discovery moved to DCInside with the patch delta's words (120, 만렙, 레벨 확장, 경험치/경치, 출석, 우유, 와글 패스/스페셜 패스/스패, 복각, 깜짝 패키지, 샤르도네, 마일리지, 쇳물, 초코강, 자동 열기, 반죽, 유출, 뻥투), one listing each (`02-dc/list-dc-*.tsv`). 유출 ("leak") surfaced a client-data leak of the update from 10-02 that the gallery read as a cookie cap of 150 (dc:79685, dc:82186): that is where the "150" comes from.

### Round 3 — verify

Queries:
- 쿠키런 크럼블 유출 쿠키 레벨 150 크럼블 레벨 350
- crumb.gg Chardonnay Cookie Crumble stats level 120
- 쿠키런 크럼블 특별 연구 공격력 증폭 30% 전투력 상승

Synthesis: no web source carries the leak or a level-120 table; the verifying captures are the official notes (cap 120, not 150; nv:50417), the gallery's leak-versus-notes comparison (dc:82186) and crumb.gg's level-120 stats for the new SSR, which the round turned into a level-120 multiplier (`07-derived/level-120.json`, checked against Princess Bari at level 100). The lab ATK 30% gain is a screenshot in the gallery (dc:82156), not on the web.

## Round 2026-10-10

The second refresh round. Window: 2026-10-07 to 2026-10-10, two days into update 1.5.002. The round asks, beside team power, which upgrade systems raise damage in Guild Conquest, PvP, the Rift and the Crumble Dungeon, and counts every system that grows an account, gear sub-stats and presets included. Saved searches reran first (`evidence/r2026-10-10/`); discovery followed.

### Baseline

- crumb.gg's patch digest lists 1.5.002 as released on 2026-10-08 16:00 KST and nothing later (`04-sites/data-patches.json`); the cafe's patch board has no newer notice than the 10-07 notes (`03-naver/list-naver-patch-notes.tsv`). crumb.gg's `/pub/leaderboard` answers 404, as in record 001's 10-09 round, so the power board isn't captured; `/api/meta` was captured instead and carries no board.
- Every saved DCInside listing reaches back before 10-07 (oldest rows 09-23 to 10-07). The guide board (`03-naver/list-naver-guide-board.tsv`) gave the post-patch rune table (nv:51217) and a creator's Conquest gear lines (nv:51157); one post is members-only (nv:51435, saved as the refusal).
- crumblehub's table and guides, the EN progression guide and Pocket Gamer are unchanged; the App Store pages moved to 1.5.001 with new top purchases and price pairs (₩9,900 = $6.99, ₩22,000 = $13.99, ₩1,500 = $0.99). agent-browser now runs on this machine, so Sugar Pocket's pages were captured rendered.
- yt-dlp and ffmpeg are installed now: the post-update overview (yt-EbXFIgSprRU) was read from frames and the skill-amp video (yt-7ZcZXq0zUmE) from subtitle-band sheets. Two saved channels still post only other games.

### Round 1 — survey

Queries:
- 쿠키런 크럼블 120레벨 전투력 상승 후기
- CookieRun Crumble 1.5.002 level 120 gnome laboratory 130 update
- CookieRun Crumble best gear substats guild conquest skill amplification crit

Synthesis: the open web still has nothing on 1.5.002 or level-120 gains. The leads are cookierun.wiki, which now answers 200 to plain requests (it was a Cloudflare challenge on 10-07), and a global guide site (allthings.how, HTTP 403 to curl; not used). The wiki's Gear, Build, Mercenary Guild, Collection and 1.5 notes pages were captured (`04-sites/wiki-*.html`).

### Round 2 — deepen

Queries:
- 쿠키런 크럼블 노움 연구소 특별 연구 21 22 효과
- 쿠키런 크럼블 장비 부옵션 추천 토벌 스테이지 아레나 프리셋
- CookieRun Crumble Fame boss damage crit damage per level guide

Synthesis: nothing indexed on specials 20–22 or per-mode gear; the wiki's Build page gives Fame's per-level damage table (boss, elemental and crit damage in turn) and its Gear page the sub-stat pool of each slot group, which explains the gallery's per-slot Conquest lines. Discovery moved to DCInside with the patch delta's words and the round's damage angle (118, 119, 크럼블 레벨, 특별 연구, 특연, 프리셋, 부옵, 장비 옵션, 이터널 패키지, 토벌 장비, 스증, 스가, 복지, 치저, 20강, 박살, 팀투, 총투, 신규지역, 차원조각; `02-dc/list-dc-*.tsv`) and YouTube (크럼블 120레벨, 장비 옵션, 토벌 장비 세팅, 마일리지 교환, level 120). The gear-preset guides found that way predate the window but answer the gear question (web:yt-HcVx3n0gjpQ and its pinned comment).

### Round 3 — verify

Queries:
- CookieRun Crumble October 8 update Chardonnay level 120 Crumble level requirement
- cookierun.wiki Mercenary Guild perks Passion Pay Crumble
- 쿠키런 크럼블 플레이트 20강 기댓값 초코강 쇳물 시뮬레이터

Synthesis: the Crumble-level gate is verified from the gallery, not the web: Crumble 154 opens 110, 190 opens 118, 200 opens 120 (dc:83392, dc:83091), as the 10-02 leak said. The perks' values come from the wiki's Mercenary Guild page (its "(Mechanic)" page answered 404). Plating's 19→20 cost rests on in-game screens and a relayed simulator figure in the gallery (dc:83284, dc:83374, dc:84350); the simulators themselves were not captured. The Conquest per-stat weights exist only as a leaked guild sheet (dc:82295).
