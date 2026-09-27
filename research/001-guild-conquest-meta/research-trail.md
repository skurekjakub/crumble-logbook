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
