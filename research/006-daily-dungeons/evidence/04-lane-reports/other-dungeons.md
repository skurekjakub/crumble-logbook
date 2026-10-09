## Daily dungeons other than EXP: what I found (as of 2026-10-07)

I did no commits and changed nothing in the repo (`git status` is clean). All captures are in `<scratchpad>/expdeck/other/`:
- **`manifest.jsonl`** has a line per file (`file, url, captured_at, source_id, tool`), with every line tagged.
- **`evidence/captures.jsonl`** is the scrapers' ledger for the same files.
- **Evidence folders:** `evidence/nv` (posts and images), `evidence/dc`, `evidence/yt` (watch digests, `video/`, `frames/`).
- **Scratch files:** `drive.mts` (a driver that points `pnpm capture` at the scratchpad), `sheet.sh`, and `ref/` (labelled icon sheets and frame sheets, not evidence).

I also used the sibling captures in `../dc-yt/` (dc:82162, 77041, 78207 and the digests for yt:zx8hJ6_37w8, 6hrfYOlgYu4, RaZght8lZZ8).

Capture gaps:
- nv:35617, 44828 and 45924 are free-board posts that need a login, so they were saved as refusals.
- yt:6LIoab8JCqU failed to download.
- Some images are 0-byte link-preview thumbnails (for example nv-49007-1 and nv-49516-1). The posts' real deck images are fine.

### What applies to all four dungeons
- **The four:**
  - 코인 던전 (Coin Dungeon)
  - 반죽 던전 (Dough Dungeon)
  - 연구석 던전 (the global client calls it "Innovite Dungeon", yt:RaZght8lZZ8)
  - 룬결정 던전 (Rune Crystal Dungeon). The community also calls it "슈가룬 던전". It was added on 8/13 (nv:16132).
- **No rotation by weekday.** All five dungeons are open every day, each with its own fixed enemy and its own key (nv:45446 image 5). Difficulty scales by stage, and each stage shows a recommended power. You can pick any stage you've cleared, and there is a 연속 도전 (repeat) toggle (nv:43827).
- **Stage cap:**
  - 570 from 9/10 (nv:37730), then 770 from 9/23 (nv:44477).
  - The 10/8 patch does not raise it (nv:50417). Players at 770 expect about 2 weeks at the wall (dc:82198).
- **10/8 difficulty easing** (nv:50417, announced in nv:48486):
  - Dough: the 타피오카 개구리 and 찐만두 들개 get lower attack.
  - Research stone: 위험한 우무젤리 gets less HP, adjusted spawn positions and faster spawning.
  - Coin and rune crystal are not changed.
- **Keys (열쇠/입장권):**
  - 3 per day base (a free player shows 5/3 after buying, nv:49244). The cap rises to 6 with extras. Players name the Crumble Pass, 축복 (blessing) and the permanent ₩5.5k pack as sources (dc:81981; YT comment on yt:h0qCokY_Ylg). Exactly what each grants is unverified.
  - Extra keys on Saturday and Sunday (dc:80664).
  - Keys refill at the daily reset, around midnight KST (dc:80969). Unused keys are lost and don't carry over (dc:79358; nv:27551).
  - Keys can be bought in the mileage shop (crumblehub currency guide, research/005 evidence; dc:81469), the arena (와레나) shop (dc:81634) and a ₩6,000 key pack (dc:82346). Bought keys can push you above the cap, for example 9/6 (nv:49847 image 6).
  - Crumblehub's buying order is dough, then coin, then EXP. Players say research stone is the real bottleneck (dc:79491, dc:80671, dc:82346).
- **Does a failed run give the key back?** No capture states it. Every guide treats losses as free retries ("판당 3~4번 리트", nv:43827; "1시간 리트할래 소탕 할래", dc:80666), which suggests a key is spent only on a clear. This is an inference, not confirmed.
- **Quick clear (소탕):**
  - A 소탕 button sits on every dungeon screen.
  - Each stage has a one-time first-clear reward (달성 보상), plus 50 of a cookie-shaped item every 5th stage (dc:82001, dc:82162). That is why players push stages instead of sweeping, and why first-clear rewards beat sweeps (dc:80671 comments).
  - Consensus: sweep when stuck (dc:81070, 36 recommends; dc:80671). Early advice was not to sweep before the cap (nv:27551).
- **A quick-restart trick.** Open the panel from the top-right arrow and restarts skip the 5-second wait; the ad-removal button still has to be pressed (nv:23490).
- **Shared setup:**
  - Captain is 바삭튼튼 소아과 의사 우유맛 쿠키 (우유) in every deck.
  - Welfare perks, from the screenshots (nv:48282, nv:48838, nv:49244, nv:50391):
    - 열정페이: the top-attack ally gets +20% attack and −20% max HP.
    - 초고속 승진: the top-attack ally gets +7% attack.
    - 방어구 수리 특약: +10% damage reduction with 3 or more tanks.
    - 의료보험: +5% max HP with 2 or more supports.
    - 가족 같은 용병단: +2% elemental damage per cookie of the most-fielded element.
  - Pets, from the in-game effect text (yt:LM1NwNyxqEA frames):
    - 갓난갓방울: +20% attack.
    - 핫도그도그: +10% skill amplification.
    - 사바나나 사자: area synergy +30%, and +10% attack to allies with area synergy.
  - Other pets that recur in the decks: 전지멜로우 (adds to multi-hit 연타 synergy), 치즈뭉치 고양이 (the chain-synergy pet), 와사비 문어 (extends durations) and 얼음과자새, 근엄한 초코왕방울 (survival).
  - A player-recommended gear preset is skill haste, skill amp and damage reduction (스가/스증/피감) (VART videos; nv:45446 comments).
  - Some players lower cookie levels on purpose so 우유 or 치즈케이크 keeps the top-attack slot for the buff (dc:81582; yt:bWKBqmhl0OI).

**Abbreviations used in the tables.** C = captain. Lv100 means every cookie is level 100 unless a level is listed. FA = full auto. Semi = one move at the start, then hands off. Manual = steering through the fight. "Stage (rec / team)" is the stage, its recommended power, and the team's power.

---

### 1. Coin Dungeon (코인 던전)
- **Drops:** coins (111G at stage 524, 1.24T at 770; nv:43827, dc:81991).
- **Enemy:** 사막 모래 풍뎅이 (desert sand scarab), Light element, weak to Dark (nv:43827 image 2).
- **Mechanics:**
  - The fight is a time limit; the usual failure is a time-over (nv:48282, nv:45446).
  - The scarabs keep their distance: they back off when you approach and come closer when you hold still (dc:81582 thread).
  - So you sit in a corner (7 o'clock or 1 o'clock), let them bunch up, then release (nv:46840, nv:46559, nv:49319: "hold 7 o'clock until 42s, or just release at 50s").
- **Top reported:** 770 cleared at 4.3G and 5.19G against a 12.43G recommendation, both by hand (dc:81991, dc:81988).

| Source / date | Stage (rec / team) | 12 cookies | Pets | Welfare | Auto? |
|---|---|---|---|---|---|
| VART yt:LM1NwNyxqEA 9/29 | 674, claims 700 / 2.67G | 바람궁수, 밀키웨이, 피노누아, 석류, 에스프레소, 우유(C), 마카롱, 브라이트시커, 치즈케이크, 피겨여왕, 바리공주, 들개 (levels not shown) | 사바나나사자, 핫도그, 갓방울 | 열정페이 + 초고속 | FA with retries ("손컨 없음") |
| 타마타마 nv:48282 10/1 | 622 (2.68G) / 1.63G | 마카롱, 닌자, 피노누아, 석류, 위치베리, 우유(C), 브시, 감초, 치케, 피겨, 트위즐, 다크초코 | 갓방울, 치즈뭉치고양이, 찹쌀하프물범 | 가족 같은 용병단 + 열정 | Semi: 7 or 1 o'clock, about 80% |
| 질퍽이 nv:47326 9/28 | 683 (5.05G) / 2.71G | 바궁, 브시, 메론소다, 치케, 피겨, 트위즐, 마카롱, 호밀, 피노, 석류, 에스프레소, 우유(C) | 갓방울, 핫도그, 전지멜로우 | – | Semi: corner |
| 눈 nv:43827 9/20 | 524 (973M) / 823M | 바궁, 밀키, 전갈, 치케, 피겨, 체리콜라, 마카롱, 브시, 메론소다, 석류, 우유(C), 다크초코 | 갓방울, 새콤달곰, 핫도그 | 초고속 + 열정 | FA, no retries |
| 신비한쿠키사전 nv:45446 9/23, also nv:49847 main | about 560 / 1.52G | 마카롱, 오븐방랑자 95, 피겨, 우유(C), 쿨링민트 90, 허브, 브시, 석류, 바리, 들개, 체리콜라, 달토끼 95 (same deck for dough) | 갓방울, 초코왕방울 (or 앵앵베리버드), 핫도그 | 열정 + 의료보험 | FA; 7 o'clock if dying |
| 티노씨 dc:81582 10/6, also nv:49847 image 3 | 697 (5.83G) / 1.94G | 바궁 98, 밀키 94, 슈크림 87, 석류, 위치베리 74, 우유(C), 마카롱, 레몬, 치케, 피겨, 락스타, 허브 | 갓방울, 핫도그, 앵앵베리버드 (accuracy) | – | Semi: stay put, nudge up and down; a commenter used it at 763 (dc:81588) |
| 도미 via nv:49847 10/5 | ? / 2.19G | 마카롱, 레몬, 치케, 피겨, 커피, 트위즐, 밀키, 슈크림, 석류, 위치베리, 에스프레소, 우유(C) | 핫도그, 인삼이라지, 갓방울 | 열정 + 초고속 | Semi: corner, then auto |
| 서신우 yt:h0qCokY_Ylg 10/1 (chain deck) | ? / 3.41G | 마카롱, 피노, 석류, 피겨, 트위즐, 락스타, 브시, 치케, 뱀파이어, 위치베리, 바리, 우유(C) | 갓방울, 핫도그, 치즈뭉치고양이 | – | Manual |
| 서신우 yt:szDOdi061sc 10/1 | 700 / 3.33G | 마카롱, 오방, 피노, 피겨, 바리, 우유(C), 브시, 호밀, 석류, 위치베리, 락스타, 딸기크레페 | 갓방울, 전지멜로우, 핫도그 | – | Manual |
| 용사맛 nv:48344 10/1 | 708 / 3.12G (nv:47793) | 바궁, 마카롱, 밀키, 호밀, 피노, 치케, 석류, 뱀파이어, 위치베리, 트위즐, 우유(C), 허브 (levels not stated; "don't use 피겨") | chain pet, 핫도그, 갓방울 | 초고속 + 열정 | Manual: 7 o'clock, finish by hand |
| 도덕킹 nv:48127 9/30 | 697 (5.83G) / 2.18G | 바궁, 전갈, 피노, 석류, 피겨, 트위즐, 마카롱, 호밀, 치케, 뱀파이어, 위치베리, 우유(C) | 갓방울, 전지, 핫도그 | 열정 + 초고속 | Manual: stand on 피겨's field |
| gramPH dc:81991 10/7 | **770** (12.43G) / 4.3G | 바궁, 밀키, 메론소다, 석류, 위치베리, 바리, 마카롱, 슈크림, 치케, 피겨, 트위즐, 우유(C) | 핫도그, 갓방울, 앵앵베리버드 | – | Manual: 1 o'clock, steer around 피겨 |
| 썸바디헬프미 dc:81988 10/7 | **770** / 5.19G | 바궁, 브시, 메론소다, 치케, 피겨, 에스프레소, 마카롱, 호밀, 피노, 석류, 위치베리, 우유(C) | 갓방울, 핫도그, 전지 | 열정 (5 ranged cookies) | Manual: circle the central corridor |

**Consensus:**
- Coin is the easiest dungeon (nv:46840, nv:43827).
- The core is 우유(C), 석류, 치즈케이크, 피겨여왕 and 마카롱, with Dark damage (위치베리, 트위즐, 피노누아) and ranged cookies (바람궁수, 브라이트시커, 밀키웨이).
- Pets are 갓방울 and 핫도그 plus one flexible pet.
- Full auto holds to about 620–700 if your power is near the recommendation; 730 and above is done by hand.
- Best no-control picks: VART's area deck (674) or 타마타마's Dark deck (622, one move).

### 2. Dough Dungeon (반죽 던전)
- **Drops:** 행운반죽 (lucky dough), which opens the oven for gear (31K at 527, 485K first-clear at 769; nv:43827, dc:82162; the oven link is nv:48486).
- **Enemy:** 타피오카 개구리 (tapioca frog), Water element, weak to Grass. 찐만두 들개 also appears (nv:50417).
- **Mechanics:**
  - The frogs shoot hard-hitting projectiles; you lose when your cookies die before they do (nv:48412, nv:47271).
  - The usual move is to run to a corner (5 o'clock is now preferred over 7) and fight there (nv:50398, nv:48344).
  - 슈크림's field launches the frogs into the air ("trampoline", dc:80985). At about 30% skill haste with 우유 and pet duration, its field never drops (nv:50183 comments).
- **Top reported:** 770 cleared (dc:82162; dc:82001). nv:50297 ("last stage") reports the final stage.

| Source / date | Stage (rec / team) | 12 cookies | Pets | Welfare | Auto? |
|---|---|---|---|---|---|
| VART yt:7GHVEHoVFsw 9/29 | 679, claims 700 / 2.63G | 바궁, 피노, 석류, 포도넝쿨, 들개, 허브, 밀키, 치케, 피겨, 우유(C), 딸크, 다크초코 | 초코왕방울 (or 얼음과자새), 핫도그, 갓방울 | 의료보험 + 방어구 수리 | FA ("manual is actually better") |
| 타마타마 nv:48412 10/1 | 629 (2.88G) / 1.36G | 바궁, 석류, 딸기쇼트케이크, 치약초코, 우유(C), 허브, 밀키, 에스프레소, 닥터 와사비, 바리, 들개, 달토끼 (Grass-heavy) | 갓방울, 사바나나사자, 파우치사우루스 | 가족 같은 용병단 + 열정 | Semi: 7 or 1 o'clock, then hands off, "99%" |
| 눈 nv:43827 9/20 | 527 (1G) / 813M | 바궁, 밀키, 석류, 바리, 들개, 허브, 마카롱, 브시, 피겨, 우유(C), 딸크, 다크초코 | 갓방울, 초코왕방울, 핫도그 | 초고속 + 방어구 수리 | FA, about 1 retry in 3 |
| 도미 via nv:49847 | ? / 2.17G | 바궁, 치케, 포도넝쿨, 와사비 96, 들개, 허브, 슈크림, 석류, 에스프레소, 우유(C), 딸크, 달토끼 | 얼음과자새, 핫도그, 초코왕방울 | 열정 + 초고속 | Semi: corner |
| 질퍽이 nv:47326 9/28 | 688 (5.31G) / 2.89G | 바궁, 호밀, 치케, 위치베리, 트위즐, 우유(C), 슈크림, 메론소다, 석류, 에스프레소, 바리, 허브 | 갓방울, 핫도그, 전지 | – | Semi: 7 o'clock corner |
| 용사맛 nv:48344 / nv:50183 10/1–10/6 | 717 → 766 / 3.03G | 바궁, 밀키, 슈크림, 석류, 에스프레소, 크림소다, 치약초코, 라임, 락스타, 우유(C), 들개, 허브 | 핫도그, 사바나나사자 (later 와사비문어), 얼음과자새 | 초고속 + 열정 (last stage: 방어구 수리 + max-HP 5%, arena gear at 6 skill-haste lines, nv:50297) | Semi: 3 o'clock, then the 5 o'clock corner |
| 고기파이 nv:50398 10/7 (merges 용사맛 and 비쿠) | 704 (6.27G) / 2.52G | 바궁, 레몬, 호밀, 석류, 딸쇼, 딸크, 밀키, 슈크림 85, 치케, 에스프레소, 우유(C), 허브 | 핫도그, 와사비문어, 얼음과자새 | 초고속 + 열정 | Semi: 5 o'clock |
| DALTO dc:82162 10/7 | **770** (12.43G) / 5.36G | 바궁, 슈크림, 석류, 우유(C), 이온, 허브, 밀키, 감초, 트위즐, 들개, 딸크, 달토끼 | 갓방울, 초코왕방울, 핫도그 | – | Manual: 5 o'clock, strafe |
| 사신 nv:46612 9/27 | 552 (1.3G) / 531M | 바궁 90, 레몬, 호밀, 팬케이크(?), 트위즐 96, 우유(C), 밀키 98, 슈크림, 메론소다, 석류, 라임, 허브 | 털뭉치멍뭉이, 갓방울, 전지 | – | ? |

**Consensus:**
- Dough is the hardest-hitting of the four. Full auto stops working around 600–680.
- Above that, the method is the 5 o'clock corner, 슈크림 is required ("꼭 넣으세요", nv:50297), plus 딸기크레페 or 들개 tanks.
- The 10/8 attack nerf should push the full-auto limit higher.
- Best no-control picks: 타마타마's Grass deck (one move) or VART's tank deck.

### 3. Research Stone Dungeon (연구석 던전; global name Innovite)
- **Drops:** 기본 연구석 (basic research stone) for 노움 연구소 research (124K at 526, 352K at 703; nv:43827, nv:49007; the reward name is from nv:37730).
- **Enemy:** 위험한 우무젤리 (dangerous agar jelly), Fire element, weak to Water (nv:43827 image 4).
- **Mechanics:**
  - The jellies explode, sometimes wiping the team (nv:46838).
  - They spawn under you (dc:79239) and keep dropping in from above until about 40% remain (nv:49250).
  - The fight is long and the risk is a time-over (nv:27551, nv:50391).
- **Top reported:** 703 (nv:49007) and 702 (dc:80953).

| Source / date | Stage (rec / team) | 12 cookies | Pets | Welfare | Auto? |
|---|---|---|---|---|---|
| VART yt:CZS-dKsfbAk 9/29; same deck in dc:77041 | 620, claims 670 / 2.46G | 마카롱, 호밀, 메론소다, 치케, 트위즐 (Lv1 in dc:77041), 우유(C), 브시, 감초, 피노, 석류, 정글전사, 허브 | 전지, 핫도그, 갓방울 | 의료보험 + 방어구 수리 | FA with retries; optionally drag to 6 o'clock |
| 롤로노아 nv:49007 10/2 | **703** (6.21G) / 4.87G | 마법사, 도넛킹 90, 메론소다, 치케, 에일리언 도넛, 우유(C), 호밀, 감초, 피노, 석류, 라임 80, 허브 | 전지, 갓방울, 핫도그 | – | FA in place ("제자리"); a 3.26G player failed at 689 |
| 신비한 nv:45446 9/23, also 도미 nv:49847 at 2.62G | about 550 / 1.59G | 바궁, 브시, 도넛킹, 피노, 피겨, 들개, 마카롱, 호밀, 메론소다, 석류, 우유(C), 허브 | 갓방울, 핫도그, 전지 | 열정 + 의료보험 | FA ("7시 X") |
| 눈 nv:43827 9/20 | 526 (993M) / 827M | 바궁, 밀키, 석류, 에스프레소, 바리, 들개, 마카롱, 브시, 피겨, 크림소다, 우유(C), 다크초코 | 갓방울, 새콤달곰, 핫도그 | 종합 복지 Lv2 + 초고속 | FA |
| 고성방가 nv:49244 10/3 | 441 (412M) / 348M | 마카롱 96, 메론소다 98, 석류 95, 에스프레소 97, 우유(C), 허브 96, 버블껌 80, 피노 96, 피겨 98, 트위즐 95, 들개 97, 달토끼 96 | 갓방울, 핫도그, 얼음과자새 | 열정 + 방어구 수리 | FA (budget) |
| 고기파이 nv:50391 10/7 | 665 (4.19G) / 2.49G | 바궁, 밀키, 치케, 피겨, 에스프레소, 우유(C), 마카롱, 호밀, 석류, 위치베리, 락스타, 허브 | 갓방울, 사바나나사자, 핫도그 | 초고속 + 열정 | Semi: hug 9 o'clock, push to the centre below 40% |
| 용사맛 nv:48344 10/1 | 676 / 3.09G | 마카롱, 호밀, 감초, 메론소다, 피노, 치케, 석류, 피겨, 트위즐, 라임, 우유(C), 허브 ("no 들개") | 갓방울, 전지, 핫도그 | 초고속 + 열정 | Manual: 7 o'clock |
| dc:78207 9/30 | 634 (3.04G) / 1.8G | 바궁, 감초, 석류, 위치베리, 바리, 딸크, 오렌지, 치케, 피겨, 트위즐 98, 우유(C), 허브 | 핫도그, 갓방울, 전지 | 열정 + 초고속 | Manual: circle the centre until about 50s, aim 감초 |

**Consensus:**
- Players rank it the second hardest after EXP (nv:45446, nv:49250).
- The core is piercing and Water damage (감초, 피노누아, 메론소다, 트위즐, 락스타, 바람궁수) with 갓방울, 핫도그 and 전지멜로우.
- Full auto works to about 620–700 only if your power is near the recommendation.
- Best no-control picks: VART's deck, or 롤로노아's stand-in-place deck at high power.
- The 10/8 patch cuts jelly HP and speeds up spawning, so it is the dungeon most likely to become fully automatable again.

### 4. Rune Crystal Dungeon (룬결정 던전, also called 슈가룬 던전)
- **Drops:** 룬결정 (rune crystals) for sugar-rune refinement (nv:16132; 481 at 472, 728 at 719).
- **Enemy:** a single boss, 백설탕 가디언 골렘 (white sugar guardian golem), Grass element, weak to Fire (nv:43827 image 5, nv:48838).
- **Mechanics:**
  - Its opening attack knocks your cookies into the air, so trigger 피노누아's skill first (nv:45446... nv:46845).
  - It fires green orbs at 53, 45, 37 and 29 seconds (8 s apart); dodge them at those times (yt:N6fgEKs3qq4 frames).
- **Top reported:** 715–719 (yt:N6fgEKs3qq4; nv:49521).

| Source / date | Stage (rec / team) | 12 cookies | Pets | Welfare | Auto? |
|---|---|---|---|---|---|
| 타마타마 nv:48838 10/2 | 614 (2.47G) / 1.78G | 마카롱, 호밀, 뱀파이어, 복숭아, 들개, 허브, 전갈, 석류, 피겨, 우유(C), 이온, 달토끼 | 갓방울, 와사비문어, 꽃개구리 | 방어구 수리 + 의료보험 | FA ("start, win"). Commenters: 바리공주 (5★) for 복숭아 cleared to 656; another reported 683 |
| 용사맛 nv:47793 / nv:48344 9/30 | 611 → 635 / 2.7G | 마카롱, 브시, 전갈, 호밀, 메론소다, 피노, 석류, 피겨, 우유(C), 체리콜라, 허브, 다크초코 | 갓방울, 전지, 핫도그 | 초고속 + 열정 | FA all the way |
| 질퍽이 nv:47326 9/28 | 659 (3.93G) / 2.95G | 마카롱, 오방, 석류, 바리, 우유(C), 허브, 브시, 메론소다, 피겨, 라임, 체리콜라, 달토끼 | 갓방울, 핫도그, 와사비문어 | – | FA with retries |
| 신비한 nv:45446 9/23 | about 550 / 1.49G | 마카롱, 전갈, 석류, 바리, 우유(C), 허브, 브시, 호밀, 다크체리 61, 정글전사, 들개, 다크초코 | 갓방울, 전지, 핫도그 | 열정 + 의료보험 | FA |
| 도미 via nv:49847 | ? / 2.22G | 마카롱, 브시, 전갈, 석류, 피겨, 락스타, 밀키, 오방, 치케, 다크체리, 바리, 우유(C) | 핫도그, 얼음과자새, 초코왕방울 | 열정 + 초고속 | FA |
| 눈 nv:43827 9/20 | 472 (568M) / 833M | 바궁, 밀키, 전갈, 메론소다, 피겨, 허브, 마카롱, 브시, 호밀, 석류, 우유(C), 다크초코 | 갓방울, 와사비문어, 핫도그 | – | FA |
| 서신우 yt:N6fgEKs3qq4 10/4 | **715** (7.03G) / 4.5G | 마카롱, 호밀, 피노, 석류, 라임, 들개, 브시, 메론소다, 치케, 피겨, 우유(C), 체리콜라 | 갓방울, 핫도그, 전지 | 열정 + 초고속 | Manual: dodge the orbs |

**Consensus:**
- Rune crystal is the most automatable of the four (nv:47793: "everything except rune needs hands").
- The core is Fire damage plus 전갈's damage over time, with 와사비문어 extending durations. dc:81476 suggests 들개 with the 3-tank perk, 전갈 and 체리콜라.
- Full auto holds to about 610–680.

### Gaps and caveats
- **Levels:** most screenshots show every cookie at Lv100. VART's video frames show the figures, not the level badges, and 용사맛 gives text only, so levels in those rows are not visible or not stated.
- **One deck for every dungeon:** 누리머's videos (yt:nQmoWQn1TCY, sibling yt:6hrfYOlgYu4) and 서신우's yt:MkcLN_GDgKk were captured but not read deck by deck. 하츠's research deck (nv:47472) is video-only.
- **Crumblehub decks:** the RubyStar set from 8/29 (nv:43255) predates the stage expansions, so I left it out of the tables.
- **Uncertain identifications:** cookies were matched from portraits against the repo icons, and a few are less certain: 팬케이크 in nv:46612 and dc:80011, 찹쌀하프물범 in nv:48282, and 뱀파이어 vs 다크체리 in nv:48838 (the post's text says 뱀파이어).