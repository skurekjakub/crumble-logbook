# Repo grounding for record 005 (team power growth)

Written 2026-09-28 by the session agent (no subagent was dispatched in this run), from the repo at the worktree's base commit. It quotes what records 001–003 already hold on raising team power and on spending, with `file:line` locators, says where they are silent, and recommends nothing.

## What the records already settle

### The power gate (why displayed team power matters)

- Record 003 holds the bracket table: <10% → 1%, 10% → 5%, 20% → 15%, 40% → 35%, 60% → 55%, 80% → 75%, 100% → 100%, 120% → 120% of damage by team power ÷ recommended power (`research/003-stage-pushing-meta/README.md:21`). It lowers only the damage your team deals.
- For the user: "a stage preset showing about 2.2G sits at 55% to 288-3, 35% to 304-19, and 15% everywhere to 328-30 … Reaching 328-30 at 35% needs 4.00G" (`research/003-stage-pushing-meta/README.md:58`).
- "Power is padded, accuracy is capped. Displayed power sets the bracket, so stage gear is rolled for power, SSR rune lines that add power are kept until the Rift, and a guild's bonus counts" (`research/003-stage-pushing-meta/README.md:41`).
- The Rift's 차원의 힘 inflates power inside the Rift only (`research/003-stage-pushing-meta/README.md:42`).
- Record 001's user-account section states team power 2.2G for the conquest team (`research/001-guild-conquest-meta/README.md:92`).

### Which power sources exist (as the earlier records' captures list them)

- The cafe intro guide lists the growth elements Resolve (돌파력, coins), Fame (명성, victory medals), Gnome Lab (노움 연구소, research stones), Stellar Link (스텔라 링크, Stellar Points, opened by cookie stars), plating and sugar runes (`research/002-pvp-meta/evidence/04-naver-global/nv/nv-33130.md:48-74`, `:131-149`), and says Arena applies cookie level, promotion, pets, collection, gear, plates and runes but not the Gnome or guild labs (`:95-96`).
- The same cafe's FAQ: gear level range by oven level is oven×3−5 to oven×3 (`research/002-pvp-meta/evidence/04-naver-global/nv/nv-30148.md:26-30`); Arena applies level, promotion, collection, gear, runes (`:38-40`).
- Record 002's synthesis: "Breakthrough (돌파력), Stellar Link, Gnome Lab and Guild Lab do not apply" in PvP, which is why players call displayed power 뻥투력 there (`research/002-pvp-meta/evidence/04-naver-global/SYNTHESIS.md:20`); nv-23817 says the same (`research/002-pvp-meta/evidence/04-naver-global/nv/nv-23817.md:19`).
- The cafe newbie guidebook (nv-43444, captured by record 002) covers levels, stars, Resolve, the stuck-stage order, lab priorities, currency sources, purchase tiers, Stellar shapes and costs, plating order and shop orders (`research/002-pvp-meta/evidence/04-naver-global/nv/nv-43444.md:428-480`, `:543-581`, `:716-856`, `:1168-1340`).

### Power padding in stage play (record 003)

- dc:76290: at 2G a player thought 4G impossible; a reply reached 4G at oven 36 "as gear level rose with the oven and research kept going", plus Bari 5★ and Stellar 8 with 6 points; free pulls alone reached 8-3, and 8-3 to 8-6 is about 45 cookie stars; "padded power is purely research"; plates only 18s (`research/003-stage-pushing-meta/evidence/02-dc/dc/76290.md`, comments).
- dc:67596: leaving the guild dropped a player from 35% to the 15% bracket (`research/003-stage-pushing-meta/evidence/02-dc/dc/67596.md`, body).
- nv-32484: crit resistance lines inflate power and raise the bracket; "padded power is stage-only" (`research/003-stage-pushing-meta/evidence/04-naver/nv/nv-32484.md:21`, `:261`).
- The 003 grounding report quotes the two-preset practice: a 55% preset that takes any power line and a 35% preset built for real stats (`research/003-stage-pushing-meta/evidence/01-repo-grounding/report.md:177-179`).

### Game data already captured

- Sugar Pocket's catalogs (game 1.4.002): cookie level curve, per-cookie star growth, plating rates (`research/001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_gameplay.json`), oven gear progression, collection (codex) boosts, sugar rune reroll costs (`…/cookieruncrumble_app_api_catalog_database.json`). Both files are single-line JSON; this record tabulates them in `../07-derived/`.
- Record 003's per-stage recommended power (`research/003-stage-pushing-meta/evidence/06-derived/stage-table.json`) and Rift levels (`…/rift-table.json`).

### Account total versus team power

- Record 001's glossary: 총투 is "the account's total 전투력 over all cookies, the figure crumb.gg's power leaderboard shows … Not the team power the 배 multiple uses" (`research/001-guild-conquest-meta/curated/glossary.json:3316-3325`).
- A conquest team at 2.09G team power sat on an account of about 13G total (`research/001-guild-conquest-meta/evidence/08-extract/dc-extra.json:1481`); an account sale listing gives a stage deck of 710M on 2.743G total (`research/003-stage-pushing-meta/evidence/01-repo-grounding/report.md:1680`).

## Where the records are silent

- No record measures how much team power each growth system adds, or its cost; there is no package price list, no USD price, no plating odds table, no Resolve cost curve, no guild lab table.
- No record says how displayed power is computed from stats. Record 003 notes the open question of "whether 돌파력 counts" toward the gate's team power (`research/003-stage-pushing-meta/evidence/01-repo-grounding/report.md:2402`).
- The mercenary band's effect on displayed power, pets' holding and companion effects, and the collection's unit of boost are not described.
