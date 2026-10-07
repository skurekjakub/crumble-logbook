# Research trail — 001 Guild Conquest meta

## Access probe (2026-09-27)

A mobile Safari UA with plain curl gets HTTP 200 from m.dcinside.com, arca.live, inven and m.cafe.naver.com (`evidence/01-access-probe.tsv`). DC mobile returns real list and post HTML, and comments come from the `/ajax/response-comment` POST, so no browser is needed for DC. The scraper is `evidence/dc_scrape.py`.

## Round 1 — survey

Queries:
- 쿠키런 크럼블 길드 정복전 조합
- Cookie Run Crumble guild conquest best team trillion damage
- 쿠키런 크럼블 갤러리 dcinside

Synthesis: The KR name for Guild Conquest is **길드 토벌전** (boss: 지나치게 무거워진 피냐타), so "정복전" is the wrong search term. The KR community hub is the DCInside minor gallery `projectcc` (opened 2026-03-23). English guides (allthings.how, cookieruncrumbles.com, YouTube) top out at 16–25G and centre on a Scorpion/Rye/Wind Archer/Melon Soda team, so they cover early-season content, not the T-tier. Gallery titles already use "T" as the damage unit ("T다음 단위는 P구나").

## Round 2 — deepen

Queries:
- arca.live 쿠키런 크럼블 채널 토벌전 덱
- 크럼블 토벌전 석류 브라이트시커 우유 조합 T 딜
- 쿠키런 크럼블 토벌전 공략 슈가룬 장비 세팅 인벤

Synthesis: Arca has no dedicated crumble channel; crumble posts live in `/b/cookierun` (a general guide exists: 178908468). KR guide sites (crumblehub.co, cookieruncrumble.app, crumblehelper.com, alkapa.gg option consultant) turned up, but a link scan of crumblehub /guides and crumblehelper found no raid guide, and cookieruncrumble.app is a client-rendered SPA. No search result names a T-tier lineup. That confirms the DC gallery threads are the primary source.

## Round 3 — verify

Queries:
- 크럼블 토벌전 1조 2조 덱 유튜브
- "크럼블" 토벌 "T" 딜 세팅 석류 레벨 조절 갤러리
- cookie run crumble guild conquest pomegranate bright seeker milk level 1 trick

Synthesis: Search engines don't index T-tier raid tech. The only hits are old stage-clear shorts and generic EN guides. One useful EN point (allthings.how): the Piñata is a Dark boss, so Light attackers (Bright Seeker) hit harder. The web rounds end here. Everything after this comes from direct gallery scraping (see `evidence/02-dc-index.tsv` onward).

## Round 2026-10-07

Window: 2026-09-27 (`curated/meta.json` `updated`) to 2026-10-07. Captures in `evidence/r2026-10-07/`.

### Baseline

Every saved search reran once, each into a file named for its id: the DC listings in `evidence/r2026-10-07/list-<id>.tsv`, the YouTube pages in `14-global/ytq/`, crumb.gg in `15-crumbgg/api/`, the web pages in `13-sites/` and `14-global/`. DC's mobile search reaches back only to about 09-21 to 09-23 (its newest post block), so most DC listings run out before the window start. The broad ones (`토벌`, `석류`, `룬`, `스가`) were rerun into a new file with more pages until their oldest post predated 09-27.

Synthesis:
- crumb.gg's `data/patches.json` answered 200 with JSON, not the 404 the round brief expected. It lists nothing in the window for Guild Conquest. The official patch board (menu 3) has nothing between the 09-23 notes and the 10-08 notes (nv:50417).
- Season 5 closed at 3T 305G (#1 날씨의아이). Season 6 ran 10-01 16:00 to 10-05 12:00 KST on the same boss: #1 Arsen at 6T 276G, the rest of the top 10 at 4.2–4.9T.
- crumb.gg's Guild Conquest page confirms the boss and gives its damage-reduction phase table. Arsen is crumb.gg's developer (yt:rEX1Rs7cEVw's description); dc:82457 is his own post.

### Discovery

DC listings for the names and terms the baseline surfaced (`evidence/r2026-10-07/list-disc-*.tsv`): 팝콘 (a Popcorn-for-Cherry variant), 비법소스 (the "secret sauce" threads about the Season 6 #1), Arsen, 아르센, 샤르도네, 다함께차차차, 4T, 5T, 6T, 800배, 판다, 20강 (plate +20), 17초 생존, 토벌 바리, and the authors 캔디애플 and 저장용. YouTube: 서신우's 1T guide (by its title in nv:48773), 크럼블 토벌전 2T, 크럼블 토벌전 3T, 크럼블 토벌 샤르도네.

Synthesis: the forum's new ≥2T screens are still Cherry and Melon Soda decks. The Season 5 #2 (다함께차차차) posted a 3T 045G lobby at 4.23G with a Melon Soda deck and no Cherry (dc:76966). Posters put the Season 6 #1's edge on gear (plates at +20 and +25) and rune balance, not on a different team (dc:81144, dc:81148, dc:80723, dc:82457). Chardonnay is pre-release talk only.

### Web rounds (iterative-research)

Round 1 queries:
- 쿠키런 크럼블 길드 토벌전 시즌6 덱
- Cookie Run Crumble guild conquest season 6 top team trillion
- 크럼블 토벌전 샤르도네 다발 석류

Synthesis: as in the first round, search engines index no T-tier conquest content. The results are Inven Global's launch article, allthings.how's beginner Scorpion team and unrelated Cookie Run: Kingdom pages; the Korean Chardonnay query returns wine pages.

Round 2 queries:
- crumb.gg rune optimizer guild conquest Arsen
- "Extra-Stuffed Piñata" survive 17 seconds Cookie Run Crumble
- 쿠키런 크럼블 토벌 6T 카페 길드

Synthesis: nothing on crumb.gg's tools or on survival; Korean news pages repeat the launch. The forum and crumb.gg stay the only sources.

Round 3 queries:
- "crumb.gg" Cookie Run Crumble simulator
- 쿠키런 크럼블 토벌전 피냐타 피해감소 단계 10초
- CookieRun Crumble Chardonnay Cookie Volley guild conquest

Synthesis: no hit names crumb.gg, the damage-reduction phases or Chardonnay. The web rounds end here; the round's findings come from the DC gallery, the official cafe, YouTube and crumb.gg captures.
