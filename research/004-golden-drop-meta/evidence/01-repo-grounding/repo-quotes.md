# Repo grounding: what the repository already held on the Golden Drop mode

Written 2026-09-28 by the record's author (no subagent: the session brief forbade dispatching one), from `main` at `cac2374`. Quotes are verbatim; locators are `file:line`. No recommendation here.

## The roadmap and the architecture audit

- `README.md:99` "more game modes, such as stage-pushing teams and the Golden Drop encounter, each with its own views, backend logic and simulator."
- `docs/architecture/2026-09-28-audit.md:106` notes that `scores` is `damageG`/`powerG` "with no `mode` column at all" and that "Golden Drop's is damage again", and that `GEAR_CONTEXT = raid | arena | stage` "is a second, parallel mode-ish enum keyed to the in-game preset; Golden Drop has no value."
- `docs/architecture/2026-09-28-audit.md:205` R15: "`BossConfig` → `EncounterConfig` with optional sections (roadmap 3, Golden Drop)."
- `docs/architecture/2026-09-28-audit.md:284` open question 7: "Golden Drop's shape. Is it a timed encounter with a fight timeline like the Piñata (fits `fight_events` and `EncounterConfig`, R15), or a different loop that needs its own tables?"

## The schema this record's curated files meet

- `packages/schema/src/enums.ts:48` `GAME_MODE = ["guild_conquest", "arena", "rumble_arena", "stage"]`: no value for this mode; values are snake_case.
- `packages/schema/src/enums.ts:35` `GEAR_CONTEXT = ["raid", "arena", "stage"]`.
- `apps/server/src/importers/seed/schema.ts:31` a curated row's `mode` is `z.enum(GAME_MODE).optional()`, so a row naming a new mode fails validation until the enum has it.
- `apps/server/src/importers/seed/schema.ts:114` `seedScore`: `damage_g`, `power_g`, `deck`, `verified`, `date`, `season`, `player`, `note`, `sources`; strict, no mode, no rank or time fields.
- `apps/server/src/importers/manifest.ts:27` `import.json`'s `record.mode` is `z.enum(GAME_MODE).optional()`.

## What earlier records captured about the mode

The mode is never the subject of an earlier record; it appears in passing.

- `research/001-guild-conquest-meta/evidence/14-global/19-eoggg-home.html` (EOG's hub, captured 2026-09-27): a "Crumble Dungeon: the Cookies to take out" section and a "Crumble Dungeon simulator" section (re-captured in this record as `evidence/03-sites/eoggg_cookierun-crumble.html`, byte-identical).
- `research/001-guild-conquest-meta/evidence/14-global/18-crumbleguides-home.html:126` "Crumble Dungeon … PvE boss challenge — take your whole squad against the giant Holy Golden Drop for a high score."
- `research/001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_database.json` (Sugar Pocket's datamined catalog, client 1.4.002): the item "크럼블 던전 입장 열쇠" / "Crumble Dungeon Key" ("황금갓방울을 자주 보고 싶다면 이 열쇠를 잘 챙겨두자"), a score patch, a profile icon for "크럼블 던전 1,000,000,000,000점 달성", a title for "1,000,000,000,000,000점 달성", and a title for keeping "크럼블 던전 주간 랭킹 마감까지 랭킹 TOP 100". The same catalog could not be re-captured on 2026-09-28 (`evidence/03-sites/cookieruncrumble_app_api_catalog_database.json` holds the refusal).
- `research/002-pvp-meta/evidence/04-naver-global/nv/nv-43444.md:670-709` the newbie guide's "4.4. 크럼블 던전 공략": one run a day for the participation reward; ranking closes at midnight, rewards the next day at noon; weekly top 100 earns the 황금빛 광채 title; "실제로는 전투력 상위 40마리가 먼저 전투에 참여합니다"; arena gear without accuracy and focus; Milk captain with the top ATK; ATK order Milk > Scorpion > Figure > other dealers. Line 360: "크럼블 던전, 아레나, 임플란트 타워 랭킹은 전 서버 통합이 아닌 서버별로 집계됩니다."
- `research/001-guild-conquest-meta/evidence/02-dc-index.tsv:1311` "장문) 크럼블던전 43G 공략, 우유 위치 컨트롤 팁" (dc:62042) and `:1364` "클릭금지) 크럼블던전 기록용 43.8G" (dc:57218), both recommended posts; `:1744` "크럼블 던전 꿀팁" (dc:26330).
- `research/001-guild-conquest-meta/evidence/16-top-players/07-yt-search.tsv:10` and `:16` ND러너's "황금갓방울 크럼블던전 1800억 이상 고득점 공략 가이드 완결판" (XeD4c3AuQAs) and "황금갓방울 던전 50G이상 팁 공략 가이드" (UF6zcIkbh_8).
- `research/001-guild-conquest-meta/evidence/14-global/nv-patchnotes/nv-16132.md:112-115` the 8/13 update moved the daily ranking settlement from 00:00–01:00 to 12:00–13:00 KST; `:126` "크럼블 던전 점수 달성 미션 요구 점수 완화".
- `research/001-guild-conquest-meta/evidence/14-global/nv-patchnotes/nv-37730.md:102` the 9/10 update: "길드 토벌전 및 크럼블 던전 진행 중 쿠키의 수동 조작이 가능하던 현상이 수정됩니다."
- `research/001-guild-conquest-meta/evidence/03-dc-posts/46452.md:40` "다크초코 크럼블던전 개사기였는데 결국 고쳐졌구나".

## Names already glossed

- `research/001-guild-conquest-meta/curated/glossary.json`: the perks 열정페이 (Passion Pay), 초고속 승진 (Rapid Promotion), 가족 같은 용병단 (Like A Family), 종합 복지 패키지 (General Perks); 단장 (captain), 탄속 (Projectile Speed synergy), 총투 (account total power); the pets 황금방울 (Gold Drop) and 갓난갓방울 (Holy Baby Drop).
- `research/002-pvp-meta/curated/glossary.json`: 갓방울 = "Holy Baby Drop (pet shorthand)", 빨대 = Pomegranate's Skill AMP beam, 공순 = ATK order. On DCInside, 갓방울 alone mostly names that pet, not the dungeon boss 황금갓방울.

## Where the repository is silent

- No curated row, table or view has this mode; no crumb.gg or crumblehub board for it was captured before this record.
- No record states the fight's length, the boss's HP or pattern, or whether a power penalty applies.
