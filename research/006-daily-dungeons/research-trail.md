# Research trail — 006 Daily Dungeons

The search rounds, run 2026-10-07 in parallel lanes: the Naver cafe on the EXP Dungeon, DCInside and YouTube on the EXP Dungeon, and the other dungeons across every site. Web access was agent-browser and curl, as `AGENTS.md` sets, so the rounds ran through each site's own search and boards rather than a web search tool. Each lane's report is kept verbatim in `evidence/04-lane-reports/`; the saved queries are `searches.json`. Search hits are leads: every claim in the README was read back from a capture in `evidence/`.

## Round 1 — survey

Queries:
- DC `경던`, `경험치 던전`, `경험치던전`, `경던덱`, `노컨` (`evidence/02-dc-yt-exp/list-*.tsv`)
- Naver guide board (menu 9, 09-20 to 10-07), notices (menu 1) and patch notes (menu 3) (`evidence/01-naver-exp/list-*.tsv`, `evidence/03-other-dungeons/nv/*.tsv`)
- YouTube `크럼블 경험치 던전`, `쿠키런 크럼블 경던`, `crumble exp dungeon` (`evidence/02-dc-yt-exp/yt/ytq-*.html`)

Synthesis: the EXP Dungeon (경던) is the wall; every other dungeon has corner or element tricks. The auto decks converge on one frame: Milk captain, Brightseeker as the dealer, Pomegranate and Cheesecake on it, three tanks for Armor Repair. The cafe's roundup (nv:49847) and the per-boss guides (뱅국, 눈) name the other dungeons' bosses and decks.

## Round 2 — deepen

Queries:
- DC `오토`, `오토덱`, `풀오토`, `경던 오토` (`evidence/02-dc-yt-exp/list-auto*.tsv`)
- YouTube `크럼블 경던 오토`, `크럼블 경험치던전 700`
- DC titles `subject:일던`, `subject:일일던전`, `subject:코인던전`, `subject:반죽던전`, `subject:연구석던전`, `subject:룬결정`, `subject:소탕`, `subject:열쇠` (`evidence/03-other-dungeons/dc/list-keys.tsv`)
- YouTube `크럼블 일일던전`, `크럼블 코인던전`, `크럼블 반죽던전`, `크럼블 연구석던전`, `크럼블 룬결정던전`, `서신우 크럼블 던전`

Synthesis: dc:79492 (724) and dc:80715 (746, no input) are the furthest hands-off EXP clears; DC's embedded videos were fetched with curl and read as frames because the scraper keeps only stickers. The other dungeons reached the 770 cap by hand on 10-07 (dc:81991, dc:81988, dc:82162). Keys, sweeps and weekend extras came from the `subject:열쇠` and `subject:소탕` threads.

## Round 3 — verify

Reads: the official notices for the caps and the 10-08 changes (nv:37730, nv:44477, nv:48486, nv:50417); the stage-select screenshots for every boss's element and weakness (nv:43827); the frames of dc:80715 and dc:79492 for stage, power, pets and lineup; the first-clear boards in dc:82001.

Synthesis: dc:82001 shows EXP, coin and dough first-clear boards ticked to 770 on 10-07, which the EXP lanes missed; a reply credits the EXP clear to auto with endless retries, so the EXP top stage is 770 while the furthest documented hands-off clear stays 746. No capture states whether a lost run returns its key.
