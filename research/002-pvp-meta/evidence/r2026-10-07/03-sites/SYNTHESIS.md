# Sites, round 2026-10-07: what changed on crumb.gg, crumblehub and Sugar Pocket

Derived from this round's captures in this folder (crumb.gg captured 2026-10-07 06:32Z, the meta page updated 06:17Z), compared with `../../03-sites/` (2026-09-27 14:33Z). The figures are computed by `../08-extract/crumbgg-figures.mjs`; its output is `../08-extract/crumbgg-figures.txt`. Every number below is read from that file or the named capture.

## Headline

1. **crumb.gg has a new `/pub/meta-page`** (`crumbgg_pub-meta-page.json`, loaded by the site's `/meta` page): 12-cookie lineup shares, captain, pets and perks for **regular Arena** as well as Rumble. It is the first regular-Arena ladder data from any site. Its sample and method aren't stated.
2. **crumb.gg dropped `/data/patches.json`**: it answers 404 with the site's not-found page (`crumbgg_data-patches-404.html`). The site links no patch page any more. Patch facts now come from the official cafe.
3. **Rumble is still Season 1 on 10-07; Season 2 runs 10-08 14:00 KST to 10-21 12:00 KST** (Sugar Pocket's client data, `cookieruncrumble_app_rumble-arena.html`). The client lists only the two Season 1 passives and isn't tied to a season, so the Season 2 passive can't be read from it.
4. **Rumble top 100: same team, drifting at the edges.** Herb fell from 67 to 44 revealed slots; Icy Birdie rose from 12 to 45 as the third pet.
5. **No client update**: `data-meta.json` is byte-identical to 09-27 (client 1.4.002). Chardonnay isn't in it yet.

## Rumble Arena

**Ratings at the end of each UTC day** (`pub-live-history-rumble_arena-2000h.json`, 1,865 snapshots from 09-24):

| Date | #1 | #10 | #50 | #100 | #1 player |
|---|---|---|---|---|---|
| 09-27 | 4204 | 3512 | 3076 | 2869 | 凱凱の餅乾軍團 |
| 09-30 | 5094 | 4296 | 3356 | 3144 | 凱凱の餅乾軍團 |
| 10-03 | 5813 | 4604 | 3641 | 3358 | 凱凱の餅乾軍團 |
| 10-06 | 6903 | 5583 | 3926 | 3609 | 凱凱の餅乾軍團 |
| 10-07 06:23Z | 6912 | 5631 | 3917 | 3626 | 슈퍼땅콩 |

**Top 5 on 10-07** (`pub-live-rumble_arena.json`; account power from `api-lookup-suggest-*.json`): 슈퍼땅콩 6912 (cp 43.6e9), 凱凱の餅乾軍團 6854 (44.4e9), 인미 6422 (38.6e9), 살라딘 6245 (38.3e9), 한탱 6219 (34.7e9). Power still doesn't order the board.

**Top-100 usage, revealed slots only** (`pub-stats.json`; 303 of 1,200 slots hidden, against 264 on 09-27):

- Down: Herb 67 → 44, Pinot 94 → 86, Cherry Cola 50 → 45, Bari 41 → 36, Oven 53 → 49, Crepe 9 → 1, Rye 6 → 2.
- Up: Cheesecake 80 → 87, Hound 75 → 84, Moon Rabbit 74 → 81, Skating Queen 3 → 8, Rockstar 3 → 5.
- Pets: King Choco Drop 96 → 97, Holy Baby Drop 90 → 86, **Hot Doggie 84 → 54, Icy Birdie 12 → 45**, Mango Toucan 2 → 8.
- Pet sets on the board: Holy Baby + Hot Doggie + King Choco 41 teams; Holy Baby + Icy Birdie + King Choco 35.

**Fully revealed teams:** 12 of 100. 9 are exactly the standard 12 (#40, 41, 43, 56, 60, 63, 64, 80, 85). The others: #39 Vampire and Skating Queen for Cherry Cola and Herb; #42 Crepe for Hound; #73 Rye, Tiger Lily and Rockstar for Oven, Cherry Cola and Herb.

**Top 10 on 10-07:** no top-10 team shows Herb except #7; #3 shows Rockstar; #1, 2, 3, 5 and 6 carry Icy Birdie, and #9 and 10 the evasion pet Mango Toucan. Because hidden slots sit where Herb would be, Herb's absence is likely but not confirmed for most.

**Meta page, Rumble tab** (lineup shares; the sample isn't stated):

- Grouped: standard 12 64.0%; Rye / Skating Queen / Grapevine ("Rye anti-charge") 31.3%; Rye / Brightseeker / Rockstar / Crepe 3.2%.
- Exact lineups: standard 12 47.3%; Rye / Skating / Grapevine 14.6%; **standard 12 with Rockstar for Herb 6.1% (+4.1 points in 7 days)**; Rye / Doughnut / Grapevine 3.6%; Rye / Skating / Rockstar 3.5%.
- Cookie shares: Pomegranate and Milk 100, Herb 81.6 (−5.8 in 7 days), Bari 65.0, Oven 62.4, Cherry Cola 59.6, Rye 36.7, Rockstar 18.8 (+6.7).
- Pets: Holy Baby 80.6, King Choco 79.9, Hot Doggie 67.0, Icy Birdie 39.6.
- Perks: the standard 12 lists Passion Pay + Rapid Promotion; the Rye lineups Passion Pay + Armor Repair. Milk is captain in every lineup.

The Rye family is 31% of this wider sample but on 2 of the top 100: a mid-ladder deck.

## Regular Arena (new)

**Meta page, Arena tab:**

- Grouped: Rye / Skating Queen / Grapevine 31.0% (+7.7 in 7 days); the Rumble standard 12 24.3%; the old five-ranged deck (Wind Archer, Milky Way, Brightseeker, Rye, Doughnut, Crepe) 14.7% (−5.4); Rye / Doughnut / Espresso / Crepe 9.3%; Rye / Brightseeker / Rockstar / Crepe 7.0%.
- Exact lineups: Rye / Skating / Grapevine 13.0%; the standard 12 11.3%; Rye / Doughnut / Grapevine 4.2%; Rye / Brightseeker / Rockstar / Crepe 4.0%.
- Cookie shares: Milk 96.7, Pomegranate 96.5, Pinot and Macaron 93.1, Hound 87.1, Cheesecake 83.5, Herb 80.7, Rye 72.9, Moon Rabbit 65.5 (+14.2 in 7 days), Ion 62.4 (+8.4), Doughnut 43.4, Crepe 38.1, Brightseeker 30.5, Bari 28.0, Oven 22.3, Rockstar 9.8 (+6.0).
- Pets: Holy Baby 96.0, Hot Doggie 75.2, Chargemellow 45.1, Icy Birdie 31.4, King Choco 17.8.

Reading: regular Arena has converged on the Rumble cookies. The Rye anti-charge build leads and the charge core is second; the August five-ranged deck is falling.

## crumblehub and Sugar Pocket

- crumblehub's Arena decks: 86, against 80 on 09-27; the 6 new ones (10-01 to 10-07) include two exact standard 12s, a standard 12 with Brightseeker for Oven, and an Adventurer bind deck. `meta-decks` is byte-identical. The `rumble_arena` mode still answers 400.
- Sugar Pocket: the community deck list changed (one new deck, not PvP); the new `/rumble-arena/` page carries the season calendar and the passives quoted above, with the caveat "시즌별 실제 활성 효과는 게임 내 아레나 화면과 대조해 주세요".

## Grid order

Every crumb.gg grid lists its revealed cookies in non-increasing attack range (`data-meta.json` `range`), and so does every meta-page lineup (`crumbgg-figures.txt`). So a board grid's index is set by the rest of the team, not chosen: grids give membership, not slots. Slots come only from owner formation screens.

## "Conquest arena"

crumb.gg's bundle (`crumbgg_chunk_2hacb3yatvlic.js`) names its boards: `guild_conquest_players` and `guild_conquest_guilds` (Guild Conquest, PvE), `rumble_arena`, the power leaderboard, and `dimension_stage` (the Rift, PvE). No site has a "conquest arena" board.

## Gaps

- The meta page's sample and method.
- The Season 2 passive.
- Levels, stars, runes, gear and win rates: no site publishes them.
