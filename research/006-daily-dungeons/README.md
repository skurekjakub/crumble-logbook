# 006 — Daily Dungeons (일일던전): the furthest full-auto deck per dungeon (Cookie Run: Crumble)

Status: active (started, captured and curated 2026-10-07; written up 2026-10-09)

Measured on 2026-10-07 from branch `worktree-agent-a1baaed30c4ca2383` (off `main` at `06d6234`): bosses, caps and patch changes from the official Naver cafe notices; decks, clears, keys and sweeps from the cafe's guide board, DCInside's 쿠키런 크럼블 gallery and KR and global YouTube (VART, 서신우, 누리머, ND러너, Chateaw). Every capture predates the 2026-10-08 update. The research changed no code. The curated dataset imports as the app's `daily_dungeon` mode (`pnpm import:record 006-daily-dungeons`, after records 001 to 005) and fills the Daily Dungeons board.

## Question

As asked: which decks clear each daily dungeon (EXP, coin, dough, research stone, rune crystal) furthest, full auto first, with each cookie's level and why, and what bounds them: the boss, keys, quick clear and the stage cap.

As a falsifiable statement: players post daily dungeon clears with the lineup, pets, perks and run method precisely enough that, for each daily dungeon, the deck that clears the furthest stage on full auto can be named and reproduced, alongside the boss, entry and stage-cap facts that bound it.

## Verdict

**Supported, with the EXP Dungeon the only one where the auto deck is the frontier.** On EXP the furthest hands-off clear is **746 at 4.5G against 9.7G recommended** (dc:80715, 2026-10-04, clear screen in the video): Brightseeker deals alone, Milk captains, Pomegranate, Lime and Cheesecake buff, Ion, Dark Choco, Hound and Moon Rabbit tank for Armor Repair, Herb and Grapevine heal, Rockstar shields, and Furball Pup is the Projectile Speed pet. EXP, coin and dough all reached the 770 cap on 10-07 (dc:82001): coin and dough by hand, EXP on auto with endless retries by an anonymous reply's account. Elsewhere the full-auto decks stop well short of the hand clears: research stone 703 (nv:49007), coin 674 (VART), rune crystal 659 (nv:47326, read as auto). **On dough, full auto stops low:** the furthest posted full-auto deck is an early one at 527 (nv:43827); VART's tank deck reaches 675 only after one move to 1 o'clock (yt 7GHVEHoVFsw). The strongest reason: every auto deck at the top is a full posted lineup with a screenshot or video, and the losses come from the opening, so retries, not control, carry the auto runs.

## Reasoning

1. **Fixed bosses, no rotation.** Each daily dungeon has one boss, one element and its own key at every stage; the stage-select screens show it (nv:43827 images 1–5, dc:80715 frame). EXP: 악몽을 꾸는 도서관 사서, Dark, weak to Light. Coin: 사막 모래 풍뎅이, Light, weak to Dark. Dough: 타피오카 개구리, Water, weak to Grass. Research stone (global name Innovite, yt RaZght8lZZ8): 위험한 우무젤리, Fire, weak to Water. Rune crystal (added 8/13, nv:16132): 백설탕 가디언 골렘, Grass, weak to Fire. English boss names in `curated/` are translations, not the global client's. `curated/daily-dungeons.json`.
2. **Caps and the 10-08 update.** Stages went to 570 on 9/10 (nv:37730) and 770 on 9/23 (nv:44477). The 10-01 notice promised easing (nv:48486); the 10-08 notes lower the EXP Librarian's base ATK, lengthen the push AoE's cooldown and shrink the inner-book range, lower the dough frogs' and hounds' ATK, cut the research jellies' HP and speed their spawns, leave coin and rune alone, and raise no cap (nv:50417). The 500→350 ATK figure in nv:49847 is not in the official text.
3. **Keys and sweeps.** Three keys a day; the entry button shows up to 6 with blessing (축복), the permanent ₩5.5k pass and the Crumble Pass (dc:81981; frames show 1/6 and 1/3). Saturdays and Sundays add extras (dc:80664); unused keys are lost at reset (dc:79358, dc:82563); the mileage and arena shops and a ₩6,000 pack sell more, stacking above the cap (dc:81634, dc:82346, nv:49847). Every stage pays a one-time first-clear reward and a cookie-shaped item every 5th stage (dc:82001 boards), so players push before they sweep (소탕), then sweep at their wall (dc:81070, dc:80671). **No capture states whether a lost run returns its key**; guides treat losses as free retries (nv:43827 "판당 3~4번 리트"), which suggests it, unconfirmed.
4. **EXP: the solo-Brightseeker frame.** The auto decks narrowed from three dealers (gramPH, 582, dc:73577; VART, 572, yt MxJ7HUD1jVw) to Brightseeker plus Rye (VART 641, yt VVHt98jkWCo; 누리머 655) to Brightseeker alone (푸에리 601, nv:46707; dc:78450 696; dc:79492 724; dc:80715 746). The 724 and 746 lineups are identical cookie for cookie (frames `evidence/02-dc-yt-exp/dcframes/79492-v1-first.png`, `80715-v1-first.png`); only the pet changed, Hot Doggie to Furball Pup. Perks Armor Repair plus Health Insurance (dc:79492 body, dc:80715 comments). Mechanisms per cookie: `curated/decks.json`.
5. **EXP: the boss's timing.** A slam near 53 s, a double push ending about 48 s; manual players enter at 47–48 s (nv:48303, nv:46895, nv:48828, dc:77003, yt O3WxZZHsKyY). Pushes shove the team out of the book ring every few seconds (nv:46851); a book hit freezes Milk (dc:76824). Milk, Brightseeker or Pomegranate dying loses the run (dc:77003, nv:46707). At a 35% damage correction the auto deck stops working (dc:81139). `curated/mechanics.json`.
6. **The EXP clears, by stage.**

   | Stage | Power | Auto | Who | Date | Evidence |
   |---|---|---|---|---|---|
   | 770 | — | not stated | anonymous | 2026-10-07 | dc:82001 first-clear board; a reply: "방어펫 2개 탄속펫 그냥 자동 무한리트" |
   | 746 | 4.5G (rec 9.7G) | full | anonymous | 2026-10-04 | dc:80715 video |
   | 742 | — | manual | anonymous | 2026-10-04 | dc:80543 title |
   | 724 | 3.96G (rec 7.72G) | full | anonymous | 2026-10-02 | dc:79492 video |
   | 724 | 4.5G | full | 비쿠 | 2026-10-02 | nv:48705 video, nv:49847 |
   | 721 | 6.93G | full, retries | ND러너 | 2026-10-03 | yt 0CUv152HVrA |
   | 716 | 4.54G | semi | 가방은 항상 두개 | 2026-10-02 | nv:48828 video |
   | 696 | 4.15G (rec 5.77G) | full | anonymous | 2026-09-30 | dc:78450 video |

   Every clear with its source: `curated/dungeon-clears.json`.
7. **The other dungeons.** Coin: the scarabs back away from the team, so decks hold a corner and let them bunch (dc:81582, nv:49319); VART's area deck runs full auto to 674 (yt LM1NwNyxqEA), 타마타마's Dark deck needs one move (nv:48282), and the 770 clears steer by hand (dc:81991 at 4.3G vs 12.43G, dc:81988). Dough: the frogs' shots kill cookies first; the 5 o'clock corner and Cream Puff's launching field carry the hand clears (dc:82162 at 770, nv:50183 at 766, dc:80985); VART's tank deck reaches 675 on semi-auto, a run to 1 o'clock and then hands off (yt 7GHVEHoVFsw; frames `vart-dough-00m47.0s.jpg`, "1시방향으로 쭉가서 쿠키 다 모이면 손놓기", and `vart-dough-01m14.0s.jpg`, "675스테이지까지 클리어"), so full auto on dough stops at the early 527 deck (nv:43827). Research stone: jellies spawn under the team and explode (dc:79239, nv:46838); 롤로노아's stand-in-place deck runs full auto to 703 at 4.87G (nv:49007, stage-select screen). Rune crystal: the most automatable (nv:47793); cast Pinot Noir first against the opening knock-up (nv:46845), dodge orbs at 53, 45, 37 and 29 s by hand (yt N6fgEKs3qq4); 질퍽이's Fire deck reaches 659, read as full auto because the post names no hand moves (nv:47326, with nv:47793's hands-off rune runs), and the top found is a 719 stage-select screen (nv:49521).
8. **Where the sources disagree** (curated as disputed mechanics, no winner picked): one EXP dealer or more (dc:80715, dc:79492 vs VART, 누리머, dc:75870); the second perk, Health Insurance or Passion Pay (dc:79492 vs VART; 아포 switches to HP when cookies die at 48 s); the gear preset, Conquest steadier (dc:79478, dc:79421 corrected, dc:82563, dc:80715 comments) vs stage for damage (dc:80425, a dc:79492 commenter) vs arena plus Rooty (dc:77041, dc:78836); whether EXP auto holds past 720 (dc:80715 at 746 vs dc:82340 stuck at 746 with more power, dc:81485 "하루짜리", a yt zx8hJ6_37w8 commenter).

## The steelman

*The case that there is no auto deck past 700, only luck and power:* the 746 poster's account is far above typical (4.5G, skill haste lines on every piece), commenters with 5★ Brightseekers fail at 713 (dc:79492), one copy stalls at 746 with more power (dc:82340), and a poster says the auto deck "works for a day" (dc:81485).

*Answer:* the frontier is real but account-bound. The same lineup clears 676 at 2.61G with a 5★ Brightseeker (dc:80701), 696 at 4.15G (dc:78450) and 724 at 3.96G (dc:79492); the commenters who failed name the gap (stars, Conquest gear, power ratio), and dc:82563's commenters cleared 20 stages after copying dc:80715 with its perks and gear. Below about a 35% damage correction no lineup holds (dc:81139). The deck is reproducible; how far it goes on a given account is set by Brightseeker's stars and the power ratio, and retries absorb the rest.

## Recommendation

- **EXP:** run the 746 lineup (`exp-dc80715-furball`) with Furball Pup, King Choco Drop and Icy Birdie, Armor Repair plus Health Insurance, and a Conquest gear preset; retry until Milk or Ion survives the opening. Without Furball Pup: Hot Doggie, Octo Wasabi or Holy Baby Drop.
- **Other dungeons:** stack the boss's weakness element and start from the board's best full-auto deck; switch to the corner methods once auto stops.
- **Everywhere:** push for the first-clear rewards, then sweep at your wall. Re-test the walls after the 10-08 easing.
- Open sub-choice: second perk. Recommendation: Health Insurance with the solo deck (the 724 and 746 clears), Passion Pay only with a second dealer.

## What would change

Nothing in code: the board, schema and importer exist (`16114af`). This record supplies the data. Once merged, `data/snapshot.json` is rebuilt from a fresh import of every record.

## Side findings

- **Key refund on a loss:** unknown; worth one in-game test (spend a key, lose, compare the counter). Consciously left as `null` in `curated/daily-dungeons.json`.
- **After 10-08:** every capture predates the easing; a refresh round should re-read the walls, above all EXP's 720+ and dough.
- **Not curated:** 하츠's research deck (nv:47472) is video-only; 사신's dough deck (nv:46612) gives no auto method; 고기파이's 557 EXP deck (nv:46179) names swaps, not a full lineup; nv:35617, nv:44828 and nv:45924 need a login and were saved as refusals.

## Sources

Every source with its title, date and relevance is in `curated/sources.json`, and its English summary in `evidence/08-extract/sources.json`. The load-bearing ones:

- https://m.dcinside.com/board/projectcc/80715 — the 746 no-input EXP clear and its lineup, pets and perks.
- https://m.dcinside.com/board/projectcc/79492 — the 724 full-auto EXP clear with the same cookies.
- https://m.dcinside.com/board/projectcc/82001 — EXP, coin and dough first-clear boards at 770.
- https://m.dcinside.com/board/projectcc/81991, https://m.dcinside.com/board/projectcc/81988, https://m.dcinside.com/board/projectcc/82162 — the coin and dough 770 clears.
- https://cafe.naver.com/ccrumble/43827 — every boss's element and weakness, and early auto decks.
- https://cafe.naver.com/ccrumble/49007 — research stone 703 on full auto.
- https://cafe.naver.com/ccrumble/47326 — rune crystal 659 on full auto.
- https://www.youtube.com/watch?v=LM1NwNyxqEA, https://www.youtube.com/watch?v=7GHVEHoVFsw — VART's coin and dough auto decks.
- https://cafe.naver.com/ccrumble/37730, https://cafe.naver.com/ccrumble/44477, https://cafe.naver.com/ccrumble/48486, https://cafe.naver.com/ccrumble/50417 — the caps, the easing notice and the 10-08 changes.
- https://m.dcinside.com/board/projectcc/81981, https://m.dcinside.com/board/projectcc/80664, https://m.dcinside.com/board/projectcc/79358 — keys.

## Files

- `evidence/01-naver-exp/` — the Naver lane: board listings (`list-*.tsv`), posts as raw API JSON and text (`nv/nv-<id>.json`, `nv/nv-<id>.md`), images and video frames (`nv/img/`, local), YouTube watch pages linked from posts (`yt/`).
- `evidence/02-dc-yt-exp/` — the DC and YouTube EXP lane: DC search listings (`list-*.tsv`), posts (`dc/<no>.md`) and images (`dc/img/`, local), DC video pages (`dcvideo/*.html`), frames and contact sheets from DC and YouTube videos (`dcframes/`, `ytframes/`, local), YouTube searches and watch digests (`yt/`).
- `evidence/03-other-dungeons/` — the other-dungeons lane: Naver listings and posts (`nv/`), DC listing and posts (`dc/`), YouTube searches, watch digests and frames (`yt/`, frames local).
- `evidence/04-lane-reports/` — each lane's report, verbatim.
- `evidence/08-extract/sources.json` — an English summary per cited source.
- `evidence/captures.jsonl` — the capture ledger; downloaded videos stayed in the scratchpad and are not listed.
- `curated/` — the dataset the app imports; `import.json`, `searches.json`, `research-trail.md`.
