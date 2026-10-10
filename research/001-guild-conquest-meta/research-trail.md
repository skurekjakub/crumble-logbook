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

## Round 2026-10-09

Window: 2026-10-07 (the last refresh heading) to 2026-10-09. Captures in `evidence/r2026-10-09/`.

### Baseline

The patch data first: crumb.gg's `data/patches.json` (`15-crumbgg/api/data-patches.json`) has 1.5.002 as released on 10-08 16:00 KST, with Chardonnay's kit (CRIT% +60–120%, 다발 1–2, Push RES 40–60%) and the level cap 120. The official patch board (`14-global/list-naver-patch-notes.tsv`) has nothing newer than nv:50417; re-fetched, its body is unchanged. Then every other saved search once, each into a file named for its id: the DC listings in `list-<id>.tsv`, the Naver guide board in `list-naver-guide-board.tsv`, crumb.gg in `15-crumbgg/api/`, YouTube in `14-global/ytq/`, the web pages in `13-sites/` and `14-global/`. The gallery now posts far faster than in September: three pages of `토벌` reached only 10-08 13:00, so `토벌` and `샤르도네` were rerun with more pages (`-2`) until they predated 10-07 19:23 (dc:82457, the last round's newest post). crumb.gg's `/pub/leaderboard` answered 404 three times; no power board this round.

Synthesis:
- Season 7 runs 10-08 16:00 to 10-12 12:00 KST on the same Extra-Stuffed Piñata (crumb.gg's page; the in-game lobby in dc:83491). The live #1 is 환상 at 10T 266G after about 22 hours; Season 6's #1 is not in the top 100.
- The gallery switched decks on day one: Macaron out for Chardonnay, Cherry out for Melon Soda. 저장용's 4T 227G at 4.55G and 4T 300G at 4.29G, and 캔디애플's 3T 966G and 4T 077G, are Chardonnay decks: the 4T 300G and 3T 966G lobbies show the lineup, the result screens don't. An anonymous in-battle screen at 4T 647G, 13.7 s left, shows the deck's portraits and levels (dc:83836).
- 서신우's 2.5T guide video (RKNiw1fRosw) shows the same deck at 5★ Chardonnay, with runes and all twelve cookies alive past 17 s.
- The saved web pages are byte-identical to 10-07.

### Discovery

From the patch delta and the baseline's new names: DC listings `list-disc-*.tsv` for 샤르, comment:샤르도네, 샤르도네 토벌, 다발, 밀치기 저항, 120렙, 118렙, 레벨 확장, 시즌7, 10T, 8T, 4T, 1000배, 딸크, 정전 빼, and the Season 7 top players 공포, 바삭한반장, newbiee, 리리 (환상, 노을, 타미 and 날씨의아이 are saved searches). The official notices board (menu 1, `14-global/list-disc-naver-notices.tsv`) for a hotfix: none, only a correction (nv:51057) and the maintenance notice. The Naver guide board's new conquest posts (nv:51157, nv:51490). YouTube watch pages for the round's new conquest and Chardonnay videos.

Synthesis: no Season 7 top-10 player posted a team; their names return nothing on DC. The forum settles the mechanism: Milk and Chardonnay take Pomegranate's beams first through 탄속; crit buffs don't stack, so Chardonnay replaces Macaron; her 다발 2 doesn't replace Tiger Lily's 다발 3, so Tiger Lily stays; her Push RES may keep Pomegranate out of Tiger Lily's range (disputed). Cookie Lv.120 needs account level 200, so day-one cores are Lv.114–118.

### Web rounds (iterative-research)

Round 1 queries:
- 쿠키런 크럼블 샤르도네 토벌전
- Cookie Run Crumble Chardonnay Cookie guild conquest team
- 크럼블 120레벨 토벌 시즌7

Synthesis: as in both earlier rounds, the engines index only launch-era articles (Inven Global, allthings.how) and nothing on Chardonnay or Season 7.

Round 2 queries:
- "Chardonnay Cookie" Crumble Volley Pomegranate
- CookieRun Crumble October 8 update level 120 Chardonnay
- 샤르도네맛 쿠키 크럼블 덱 추천

Synthesis: wine pages and the August update's coverage; no page knows the 10-08 update.

Round 3 queries:
- 쿠키런 크럼블 샤르도네 석류 탄속 토벌
- crumb.gg guild conquest season 7 Cookie Run Crumble
- Cookie Run Crumble Chardonnay Cookie tier list build sugar runes

Synthesis: the allthings.how Piñata guide again and July-era tier lists. The web rounds end here; the round's findings come from the DC gallery, the official cafe, YouTube and crumb.gg captures.

## Round 2026-10-10

Window: 2026-10-09 (the last refresh heading) to 2026-10-10; the gallery posts read run from 10-09 14:41 to 10-11 00:23 KST, after the last round's newest post (dc:84303). Captures in `evidence/r2026-10-10/`.

### Baseline

The patch data first: crumb.gg's `data/patches.json` (`15-crumbgg/api/data-patches.json`) is byte-identical to the 10-09 capture, newest 1.5.002. The official patch board (`14-global/list-naver-patch-notes.tsv`) still ends at nv:50417, and the notices board (`14-global/list-naver-notices.tsv`) has nothing after nv:51057 (10-08): no hotfix. Then every other saved search once, each into a file named for its id: the DC listings in `list-<id>.tsv`, the Naver guide board in `list-naver-guide-board.tsv`, crumb.gg in `15-crumbgg/api/`, YouTube in `14-global/ytq/`, the web pages in `13-sites/` and `14-global/`. `토벌`, `샤르도네` and `샤르` ran six pages, the broad single-word terms four, so every listing's last page predates 10-09 14:35 KST. crumb.gg's `/pub/leaderboard` answered 404 again, and its rankings page now offers only the conquest, Rumble Arena and Rift boards: no power board. A saved search's `lastHit` is 2026-10-10 when its result held an in-window item that the round captured or cited: a post or watch page captured on its own, or a record the search's capture holds whole, as crumblehub's deck list does. The round's review applied that to every saved search in `searches.json`.

Synthesis:
- Season 7's live board on 10-11 00:41 KST: #1 Arsen at 13T 522G (not in the top 100 on 10-09), #10 at 10T 219G, #50 at 8T 101G, #100 at 6T 660G. The 79 players on both this board and Season 6's final sit at 1.69–3.31× their Season 6 scores, median 2.48× (`15-crumbgg/11-players.tsv` joined with `evidence/r2026-10-07/15-crumbgg/11-players.tsv` by player id).
- crumb.gg's Guild Conquest page differs from 10-09 only in its countdowns: Season 8 opens 10-15 16:00 KST, boss not announced.
- The Naver guide board has two new conquest guides, both Chardonnay decks with Strawberry Crepe: 신비한쿠키사전's 3T 384G at 5.06G (nv:51882) and 서신우's 3.1T (nv:51817, the video W6jC87xR1fE). YouTube adds 누리머's 3T 416G with Crepe (Up48r9fwOM8).
- The gallery's ≥2T posts are all Chardonnay decks: 8T 069G on a result screen with Melon Soda and Strawberry Crepe as sub-dealers (dc:84913), 7T 557G with Melon Soda in Cherry's slot (dc:84393), 5T 811G at 5.72G with the lineup on screen (dc:84772), 4T 668G at 4.4G with a 50-run Macaron-vs-Chardonnay test (dc:84663).
- crumblehub's community conquest list adds one uncited deck ("use Chardonnay instead of Macaron", 10-09); its meta decks, crumbleguides and cookieruncrumbles are unchanged apart from a redeploy's file names.

### Discovery

From the baseline's new names and the brief's seeds, DC listings `list-disc-*.tsv` for 메소딸크, 딸기크레페, 전갈, 마카롱, 1100배, 1200배, 1300배, 1400배, 6T, 7T, 9T, 10T, 샤르덱, 샤르도네덱, 신덱, 개사기덱, 샤르 9성, 샤르 5성, 정전 다발, 3다발, 120레벨, 만렙, 200렙, 올생존, 0초, the Season 7 top players and guilds (저주11단, 젱젱, 바삭한반장, 딘딘, 리리, 목사, 군무원, 방랑자; 환상, 스타, 노을, 타미 and Arsen are saved searches), the guide authors 서신우 and 누리머, and the authors of the round's 5T posts (러유, 븜구미사랑단). YouTube watch pages for every new conquest video in the saved searches; the two Korean guides downloaded and cut into frames.

Synthesis: no Season 7 top-10 player posted a team, and none of their names returns a conquest post; a poster asks the top ranks to unmask (dc:84555). The new lead is Lv.119: a lobby at 8.04G shows Lv.119 cores and a 6T 351G personal best with Strawberry Crepe and levelled fillers (dc:84701), and a reply puts survival to 0 s at Lv.119 and about 19M HP (dc:85200). The Scorpion question settles toward crit: a decompile places the crit roll in the client's native library and has poison ticks pass through it (dc:84560, dc:84579). No post names a deck without Chardonnay, Pomegranate or Tiger Lily at 2T+, and `120레벨`, `200렙`, `샤르덱`, `개사기덱` and the top players' names came back empty.

### Web rounds (iterative-research)

Round 1 queries:
- 쿠키런 크럼블 길드 토벌전 샤르도네 덱 시즌7
- Cookie Run Crumble guild conquest Chardonnay team trillion October 2026
- 크럼블 토벌전 딸기크레페 메론소다 샤르도네 고득점

Synthesis: launch-era articles (Inven Global, allthings.how, Bleeding Cool) and a Cookie Run: Kingdom deck blog; the Korean food words return Crumbl bakery pages. Nothing on Chardonnay or Season 7.

Round 2 queries:
- "Chardonnay Cookie" CookieRun Crumble guild raid lineup Strawberry Crepe
- crumb.gg guild conquest season 7 leaderboard Arsen
- 쿠키런 크럼블 샤르도네맛 쿠키 토벌 8T

Synthesis: the one new result, `allthings.how/?p=178870`, redirects to a Cherry Cola PvE teams guide that predates Chardonnay; not used. crumb.gg doesn't surface; an FFXIV "Arsen" does.

Round 3 queries:
- allthings.how CookieRun Crumble Strawberry Crepe Cookie guild conquest
- CookieRun Crumble Chardonnay Cookie skill Volley Synergy Push RES build
- 쿠키런 크럼블 120레벨 계정레벨 200 토벌전

Synthesis: Pocket Gamer cookie guides and the fan wiki's synergy page, all pre-Chardonnay; Korean launch news. As in every round, the engines index nothing at T-tier. The round's findings come from the DC gallery, the official cafe, YouTube and crumb.gg captures.
