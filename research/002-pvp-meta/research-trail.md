# Research trail: 002 PvP meta

The first round (2026-09-27) ran its searches through four capture lanes; their queries are the saved searches in `searches.json` and the listings under `evidence/01-dc-arena/`, `02-dc-rumble/` and `04-naver-global/`. This file starts with the first refresh. Search results are leads, not findings: a claim reaches the README only once its page is captured under `evidence/`.

## Round 2026-10-10

Window: 2026-10-07 (the last `## Refresh` heading) to 2026-10-10. The 10-08 update (v1.5.002) went live at 16:00 KST inside it.

### Baseline

- **Patch data.** crumb.gg's `patches.json` answers 200 again (`evidence/r2026-10-10/03-sites/data-patches.json`): v1.5.002 on 10-08 with Chardonnay's client numbers, the Lv.100 → 120 cap (Lv.120 needs account level 200), Rumble Season 2, the Eternal Lv.95 gear, lineup codes and the Arena help line on Mercenary Guild effects. The official patch-notes board lists nothing newer than the 10-08 notes (`04-naver-global/list-naver-patch-notes.tsv`). The notice board (`04-naver-global/list-disc-naver-notices.tsv`, menu 1) has one in-window notice: the store text's daily-dungeon line belongs to the 10-22 update (nv:51057). No hotfix.
- **Every other saved search,** one capture each, named for its id: the DC listings in `01-dc-arena/list-<id>.tsv` and `02-dc-rumble/list-<id>.tsv`, each running back past 10-07; the guide board in `04-naver-global/list-naver-guide-board.tsv`; crumb.gg's live board, history, stats and client data in `03-sites/`; the crumblehub, Sugar Pocket and crumbleguides pages in `03-sites/`; the YouTube searches in `04-naver-global/ytq/` and the channel pages in `04-naver-global/yt/`.
- `crumbgg-live-arena` still answers 404, and `crumbgg-leaderboard` now does too (`03-sites/crumbgg_pub-*-404.json`). crumblehub's Rumble endpoint still answers 400. Sugar Pocket's Rumble page and crumbleguides are byte-identical to 10-07.
- Empty saved searches: `아레나 조합`, `아레나 랭킹`, `전서버 아레나`, `통합 아레나`.
- **YouTube.** The channel pages date 서신우's `아레나 샤르덱 공략` (JuDMhwANm1M) to 10-09; its watch digest gives chapters and no captions, so the video was downloaded (360p, the only format yt-dlp could fetch), cut into frames and subtitle-band sheets (`04-naver-global/yt/frames-JuDMhwANm1M/`, `subs-JuDMhwANm1M/`).

### Discovery

DC searches from the patch delta and the round's new names (`01-dc-arena/list-disc-*.tsv`, `02-dc-rumble/list-disc-*.tsv`): 샤르도네 아레나, 샤르, 시즌6, 120레벨, 이터널, 알룰로스, 시간의 모자, 와플 망토, 장비 프리셋, 편성 코드, 덱 코드, 도움말, 방어 보정, 0스가, 6스가, 치저, 마들렌, 복숭아, 복수, 개구리, 시즌2, 와글와글 시즌2, 와레나 버프, 시즌2 1등, 돌격형 체력. Hits: 샤르 (Chardonnay rune and PvP talk), 이터널 (the Lv.95 set is a package: dc:83361, dc:83525), 0스가 and 6스가 (the haste-count split), 치저 (the crit RES debate), 마들렌 (a six-cookie burst deck, dc:83386), 복숭아 (Peach evasion and its counters), 복수 (revenge and the attacker advantage). Empty: 시즌6, 120레벨, 시간의 모자, 와플 망토, 편성 코드, 덱 코드, 방어 보정, 와글와글 시즌2, 시즌2 1등, 돌격형 체력.

The official cafe's notice board (menu 1), found by probing the board ids, is a discovery capture (`04-naver-global/list-disc-naver-notices.tsv`); the guide board's in-window articles were fetched into `04-naver-global/nv/`.

crumb.gg's current boards: its meta page for both modes (`03-sites/crumbgg_pub-meta-page.json`), the Arena page with both tabs read in a headed browser (`03-sites/crumbgg_arena-page*.md`: Arena Season 6, Rumble Season 2's passives, hidden cookies per tier) and the equipment pages of the new Eternal pieces (`03-sites/crumbgg_equipment-*.md`).

The players behind the round's top results: 서신우 (his cafe post nv:51751 and video), 올렐레옹 (the cafe post nv:51299 links a blog post, captured as `04-naver-global/blog-tunphoto0224-224435676352.md`). The Rumble top 3 on crumb.gg's board weren't looked up this round; their teams are on the board.

### Web round 1: survey

Queries:
- 쿠키런 크럼블 샤르도네 아레나 덱
- Cookie Run Crumble Rumble Arena Season 2 buff charge cookies
- 쿠키런 크럼블 이터널 장비 세트 패키지 알룰로스 랜스

Synthesis: the open web has nothing on Chardonnay in PvP, Season 2's buff or the Lv.95 Eternal set. Results are SEO tier lists, theqoo threads with no lineups, and an allthings.how guide on Season 1's charge buff. DC, the official cafe and crumb.gg stay the only primary sources.

### Web round 2: deepen

Queries:
- cookierun.wiki Chardonnay Cookie Crumble
- 더쿠 크럼블 샤르도네 아레나 바리
- cookie run crumble chardonnay arena team princess bari oven wanderer

Synthesis: no wiki page for Chardonnay yet; the Korean query returns wine pages; the English one returns launch press and allthings.how guides on Oven Wanderer and Bari from September. Nothing post-10-08.

### Web round 3: verify

Queries:
- (fetch) allthings.how/?p=222216, the Rumble charge guide: updated 09-26, Season 1 only, no Season 2 or Chardonnay. Not used.
- 샤르도네맛 쿠키 아레나 추천덱 블로그 크럼블 복지 슈가룬: nothing relevant.
- (agent-browser) m.blog.naver.com/tunphoto0224/224435676352, the blog behind nv:51299: Chardonnay in Macaron's slot of the Bari–Oven–Cherry Cola deck, Passion Pay fixed with Armor Repair or Rapid Promotion, runes Skill AMP first and no haste. Captured and cited.

Synthesis: the round's answers come from the community captures. Season 2's passive is settled by crumb.gg's Arena page and the client data's single passive set for both seasons, with a DC post that rules the Madeleine deck out of Rumble because of the HP and DR buffs (dc:83386).

## Round 2026-10-07

Window: 2026-09-27 (`curated/meta.json` `updated`) to 2026-10-07, the eve of the 10-08 update and the last day of Rumble Arena Season 1.

### Baseline

- **Patch data.** The saved `crumbgg-data-patches` entry now answers 404 (an HTML not-found page, `evidence/r2026-10-07/03-sites/crumbgg_data-patches-404.html` and `.headers.txt`); `pnpm capture crumbgg data … patches` refuses to save it. crumb.gg no longer publishes a patch digest, and its home page links no patch page. The official patch-notes board (`04-naver-global/list-naver-patch-notes.tsv`) lists one patch in the window, the 10-08 update notes (nv:50417, posted 10-07), fetched with the maintenance notice nv:50393.
- **Every other saved search,** one capture each, named for its id: the DC listings in `01-dc-arena/list-<id>.tsv` and `02-dc-rumble/list-<id>.tsv` (each last page predates the window start, post 76853); the Naver guide board in `04-naver-global/list-naver-guide-board.tsv`; crumb.gg's live board, history, stats, leaderboard and client data in `03-sites/`; the crumblehub, Sugar Pocket and crumbleguides pages in `03-sites/`; the YouTube searches in `04-naver-global/ytq/` and the three channel pages in `04-naver-global/yt/`.
- `crumbgg-live-arena` still answers 404 (`03-sites/crumbgg_pub-live-arena-404.json`). crumblehub's `rumble_arena` mode still answers 400.
- Empty saved searches: `아레나 조합`, `아레나 랭킹`, `전서버 아레나`.
- The fetch list for posts reused the post ids a same-day pre-round capture had chosen (branch `backup/stale-refresh-2026-10-07`), plus the in-window posts the listings surfaced that it hadn't, and every post after its capture (ids above 82266).

### Discovery

DC searches from the patch delta and the round's new names (`01-dc-arena/list-disc-*.tsv`, `02-dc-rumble/list-disc-*.tsv`): 샤르도네, 쟁탈전, 공격보정, 공격이 이김, 방어 뚫, 용병단 효과, 120레벨, 뱀파이어, 천사, 락스타, 명중, 회피, 얼음과자새, 2돌격, 미끼, 아레나 메타, 시즌2, 엘마, 그랜드마스터, 익명의 도전자, 메달, 와레나 덱. Hits: 샤르도네 (Chardonnay talk, mostly Guild Conquest), 쟁탈전 (the unreleased Crumb Clash), 공격보정, 천사 (dc:81536, an Angel deck winning 10M down), 회피 and 명중 (evasion vs accuracy), 시즌2, 엘마, 메달. Empty: 공격이 이김, 방어 뚫, 용병단 효과, 120레벨, 미끼, 그랜드마스터.

The players behind the round's top scores: crumb.gg lookups of the Rumble top 5 on 10-07 (`03-sites/api-lookup-suggest-*.json`); a DC search for their names (`02-dc-rumble/list-disc-top-players.tsv`) found nothing.

crumb.gg's current boards: the new `/pub/meta-page` (`03-sites/crumbgg_pub-meta-page.json`), which the site's `/meta` page loads, holds lineup shares for both regular Arena and Rumble Arena; and the site bundle that lists its board groups (`03-sites/crumbgg_chunk_2hacb3yatvlic.js`).

### Web round 1: survey

Queries:
- 쿠키런 크럼블 와글와글 아레나 시즌2 버프
- Cookie Run Crumble Chardonnay Cookie arena PvP October 8 update
- 쿠키런 크럼블 아레나 공격보정 방어 패배

Synthesis: the open web has nothing on the Season 2 passive, Chardonnay in PvP or the attacker advantage. Results are press releases (thisisgame, inews24, invenglobal) and SEO guide sites; the press stops at the 09-23 Chuseok update. The community sources (DC, the official cafe) stay the only primary sources for this window.

### Web round 2: deepen

Queries:
- (fetch) thisisgame.com/articles/427973, a Devsisters press release in round 1: 403, not used.
- 쿠키런 크럼블 샤르도네맛 쿠키 업데이트 레벨 120 와글와글 아레나 시즌2
- 쿠키런 크럼블 부스러기 쟁탈전

Synthesis: a secondary summary puts the new level cap at Lv.150 and names a data wiki, 삥스크럼블 (cc.team-hobby.com), as its source; the official note says 120. 쟁탈전 returns only launch press; nothing on the web describes Crumb Clash beyond the DC datamine and the PV.

### Web round 3: verify

Queries:
- (fetch) cc.team-hobby.com: a datamine wiki with arena and patch-notes pages
- (fetch) trees.gamemeca.com/view.php?seq=1571: last updated 2026-08-12, nothing on the patch
- (fetch) cookierun.wiki/w/Arena_(Crumble): 403, not used

Synthesis: 삥스크럼블's patch-notes page lists "쿠키 최대 레벨 Lv.100 → Lv.150" for v1.5 (`03-sites/teamhobby_patchnotes.html`), a datamine of the client, while the official note (nv:50417) says the cap is extended "120레벨까지". The record uses 120 and lists the datamine as a disagreement: 150 may be the client's ceiling for a later step. Its arena page (`03-sites/teamhobby_arena.html`) still shows Rumble Season 1 and no Season 2 passive.
