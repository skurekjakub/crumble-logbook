# Research trail: 002 PvP meta

The first round (2026-09-27) ran its searches through four capture lanes; their queries are the saved searches in `searches.json` and the listings under `evidence/01-dc-arena/`, `02-dc-rumble/` and `04-naver-global/`. This file starts with the first refresh. Search results are leads, not findings: a claim reaches the README only once its page is captured under `evidence/`.

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
