# Lane 04: Naver cafe (official) and global sources: synthesis

Captured 2026-09-27. Extraction: `../08-extract/naver-global.json`. Captures: `nv/` (cafe articles and images), `yt/` (watch-page digests), `ytq/` (search hits), `frames/` (video frames, official GIF frames, deck tiles), `web/` (Naver blog posts, EN guide sites), board indexes `01`–`05-*.tsv`.

**Name note.** Rumble Arena is **와글와글 아레나** in KR (shorthand 와레나). TW calls it 熱鬧開戰競技場, and a JP video tags it わちゃわちゃアリーナ. In PvP posts, 바궁 means Wind Archer (바람궁수). Princess Bari is 바리 or 바공.

## 1. Official rules

### Arena (아레나): high confidence unless marked

- **Launch.** Arena launched with the game on 2026-07-30. Season 1 was live on 2026-08-03 (notice 7982).
- **Format.** The attacker's team fights another player's saved defense team in an auto-battle. Each side fields 12 cookies and 3 pets, and attack and defense teams are saved separately. Battles last about 60 s, and near the end the game shows "종료 임박 피해량이 더 증가합니다!" ("time almost up, damage increases"). There are no bans, picks or rounds. Refreshing the opponent list can cost crystals, and continuous auto-attack was added on 2026-09-10.
- **Matchmaking.** Matchmaking and rankings are per server. The attacker picks the opponent from a list.
- **Seasons.** Seasons last about two weeks. Season 5 was running on 09-25/27. Since Season 3 (patch 08-27), ranks 1–3 get the Champion 1/2/3 tiers, and Master 4 to Grand Master 1 promote by absolute rank instead of top-%. A season closes at 12:00 KST.
- **Rewards.**
  - Fame (명성) points come only from wins. They level Boss DMG, Element DMG and Crit DMG, reaching +74–76% at Fame Lv.112 (Noorimer).
  - Wins also give Victory Medals.
  - Season-end rewards scale with rank. Noorimer finished Season 3 in 2nd and received 50,000 crystals and 5,000 medals.
- **Stats that apply.** Level, stars, collection, gear, sugar runes, pets, captain and mercenary perks apply. Guide 43444 lists perks as *not* applying, but a player test (23817) contradicts it.
- **Stats that do not apply.** Breakthrough (돌파력), Stellar Link, Gnome Lab and Guild Lab do not apply. Displayed power therefore overstates PvP strength, which players call 뻥투력 ("inflated power").
- **Official bugs and actions.**
  - In Season 1 the defense team's DMG reduction was not applied. It was fixed from Season 2 (7982).
  - Until 08-27, defense start positions were partly random.
  - On 09-23 the team warned against pre-arranged win trading (45322).
- **Power-gap correction.** There is no official power-gap correction (전투력 보정) for PvP. No notice or patch note mentions one.

### Rumble Arena (와글와글 아레나): high confidence for the officially shown items

- **Launch.** Rumble Arena launched on **2026-09-23** (patch 44477). The official EN and TW teasers came out on 09-21.
- **Format.** The format is the same as Arena, but the opponent pool is **cross-server** ("모든 서버의 쿠키들과 만날 수 있습니다!", "you can meet cookies from every server"). Each side fields 12 cookies and 3 pets, with separate defense and attack teams. Battles last about 60 s. It has its own tickets, which can also be bought with mileage.
- **Seasons.** Seasons run on an irregular schedule, and each season has its own passive.
  - **Season 1 passive** (official GIF, confirmed by the EN client): **Charge (돌격형) cookies get +30% max HP, and all cookies and summons get +30% DMG reduction.**
  - The GIF showed 5d 22h left. I could not confirm the coordinator's 09-23 → 10-08 dates from official text.
- **Tiers.** The coordinator reported Platinum → Diamond → Master → Champion. The official GIF only shows "Master league" and top-N brackets. Samool's EN client shows a "Crystal 1" tier.
- **Season rewards (official GIF).**

| Rank | Points | Crystals | Rumble medals |
|---|---|---|---|
| 1st | 3,200 | 60k | 25k |
| 2nd | 3,200 | 50k | 25k |
| 3rd | 3,200 | 45k | 25k |
| Top 10 | 3,000 | 40k | 25k |
| Top 30 | 3,000 | 35k | 25k |
| Top 100 | 3,000 | 30k | 25k |
| Master top 5% | 2,000 | 25k | 20k |
| Master top 10% | 2,000 | 24k | 20k |
| Master top 20% | 2,000 | 23k | 15k |
| Master top 30% | 2,000 | 22k | 15k |

- **Other rewards.**
  - Daily rewards are 2,500 medals for the top 100 and 2,000 for Master top 5–30%, mailed at 00:00 KST.
  - Limited rewards are an "Elite Master" profile image and a tier wappen.
  - Medals are spent in the Rumble shop.
- **What the passive changes.** KR guides (올렐레오로리, 신비한쿠키사전, 쿠키키키) agree that +30% DR blunts burst and dive decks. Pure charge decks work only with high spec there, and a Bari below 5★ is more viable in Rumble thanks to the Charge HP buff.

## 2. Top teams from these sources

The cookie abbreviations match the notes in the JSON: 들개 = Nameless Cake Hound, 치케 = Cheesecake, 딸크 = Strawberry Crepe. The universal core in every September deck is **Milk (captain), Pomegranate, Macaron, Pinot Noir and Cake Hound, plus Ion or Moon Rabbit**. The pets are Holy Baby Drop (갓난갓방울, ATK +20%) with Hot Doggie (Skill AMP) and Icy Birdie (DR) or King Choco Drop (max HP +20%). Chargemellow replaces one of them in Rapid Fire decks.

### Arena

1. **Bari charge deck.** Source: 신비한쿠키사전 45502 = 쿠키키키 45718 (the most-liked guide, 223 likes).
   - **Lineup:** Macaron, Pinot, Pomegranate, Milk, Ion, Herb / Oven Wanderer, Cheesecake, **Bari (7–8★)**, Cake Hound, **Cherry Cola**, Moon Rabbit.
   - **Pets:** Holy Baby Drop 20★, Hot Doggie 20★, Icy Birdie 19★.
   - **Perks:** Passion Pay + Rapid Promotion.
   - **How it works:** at 5★ Bari puts DR and lift/push immunity on 2 Charge allies (Oven Wanderer, Cherry Cola). Commenters report wins at up to 2× power.
   - **Confidence:** high (screenshot plus text).
2. **Seo Sinwoo's Bari deck, labelled for Rumble.**
   - **Lineup:** Macaron, Oven Wanderer, Pinot, Pomegranate, Milk, Ion / Brightseeker, Rye, Cheesecake, Bari (1★), Cake Hound, Moon Rabbit.
   - **Pets:** Holy Baby Drop, Hot Doggie, Icy Birdie.
   - **Perks:** Armor Repair (3 tanks: +10% DR) + Passion Pay.
   - **Result:** won 18.7M vs 15.4M. Bari dealt 1.58M and Oven Wanderer 1.21M.
   - **Runes:** read from screen.
   - **Confidence:** high.
3. **Heal-tank or "stall" decks.**
   - **꿀빵 (43950):** Macaron, Pinot, Pomegranate, Grapevine, Hound, Crepe / Rye, Cheesecake, Skating Queen, Milk, Ion, Herb. He says the #1 and #2 arena players on his server use it and it wins at 2–5M power deficits.
   - **Seo Sinwoo's low-rarity Rye deck (8k0-Yvtlqx8):** Macaron, Pinot, Pomegranate, Grapevine, Hound, Herb / Rye, Cheesecake, Skating Queen, Milk, Ion, Moon Rabbit. Perks are Crunch Mode (Rye, with his armor removed so Crunch targets him) + Armor Repair. It beat Bari decks at a 0.7–0.8M deficit.
   - **How it works:** these decks beat Bari decks at equal spec because they absorb the opening burst.
4. **Rapid Fire decks** (Chargemellow pet, Rye/Wizard/Crepe damage), e.g. 낑깡's Wizard deck (45902). They are strong if they survive the opener, but "catastrophic" against Bari 5★ + Oven Wanderer.

### Rumble Arena (the mode is 4 days old; medium confidence)

- **VART F2P Rye deck:** Macaron, Rye, Pinot, Pomegranate, Hound, Herb / Brightseeker, Doughnut King, Cheesecake, Milk, Ion, Moon Rabbit. Pets are Holy Baby Drop, King Choco Drop and Chargemellow. A commenter climbed from 14th to 5th with it.
- **Seo Sinwoo's Bari deck** (arena item 2 above) was shown winning Rumble matches.
- **Samool's EN Rumble team:** Macaron, Cheesecake, Bari, Hound, Crepe, Herb / Pinot, Pomegranate, Milk, Ion, Cherry Cola, Moon Rabbit. Pets are Icy Birdie, Hot Doggie and Holy Baby Drop.
- **Pure dive decks** (Cool Mint + Cherry Cola + Oven Wanderer + Bari) were tested and failed under the +30% DR (올렐레오로리).

### Counter edges

- A Bari deck is beaten by a tank- and healer-heavy single-DPS Rye deck at equal spec (45718, 8k0).
- A Rapid Fire deck is beaten by Bari 5★ + Oven Wanderer (45902).
- A Bari deck with Bari below 5★ is beaten by any deck that has Strawberry Crepe (45312, no mechanism given).
- Heal-heavy decks are beaten by Pinot Noir heal-cut decks (28949).
- A Bari or Oven Wanderer deck at mediocre spec is beaten in Rumble by Rapid Fire decks (45502).

### Builds (consensus)

- **Gear.** Skill Haste goes on every right-side piece; the six "casting first wins" pieces are the priority (28949, 23817).
  - Top pieces: Skill AMP > CRIT% / CRIT DMG.
  - Bottom pieces: DR and crit resist, with RES this season against Moon Rabbit's debuff.
  - Keep a single Accuracy line.
  - Use a separate PvP gear preset. Noorimer is the exception: he uses one set for everything.
- **Sugar runes and levels.**
  - Milk takes all ATK% and must hold the highest ATK, counting pet, perk and captain bonuses.
  - Pomegranate, Macaron, Cheesecake and Skating Queen take all Skill AMP.
  - Cake Hound, Ion, Pinot and Moon Rabbit take DR, HP and Haste.
  - Rye takes ATK% (to receive the Pomegranate buff), CRIT DMG and Haste.
  - Players deliberately lower other cookies' levels to keep Milk's ATK order.

## 3. How EN and global advice differs from KR

- **Timing of the meta.** EN written guides (crumbledb 08-08, cookierun-crumble.wiki, cookieruncrumbles.com) describe an early stall meta of 3 tanks + 4 healers (Dark Choco, Madeleine, Ion; Herb, Milk) with Wind Archer and Skating Queen as priority picks. KR September guides treat healing as devalued since Pinot Noir (08-27) and centre on Milk/Pomegranate ATK ordering, Skill Haste gear, and Bari/Moon Rabbit since 09-23.
- **Rumble coverage.** Only Samool and PonPonLin (TW) cover Rumble teams. Neither EN written site has a Rumble team yet.
- **Where EN and KR agree.** EN creators match KR on Bari's buff targeting (1 random Charge ally, 2 at 5★), on Moon Rabbit with full DR runes, and on "all PvP roads lead back to Rye".
- **Sugar-rune detail.** EN creators rarely show sugar runes, and commenters keep asking for them. KR creators (Seo Sinwoo, 꿀빵, 낑깡) publish full rune lines.

## 4. Gaps

- There is no official statement on which stats or perks apply in Rumble, on Rumble's exact season dates, or on its full tier ladder. The official GIF shows only Master and top-N brackets.
- There is no official PvP damage modifier or power-gap correction. It may not exist.
- Star counts in the formation screenshots are mostly unreadable. Stars in the JSON marked "~N" are inferred from rune slots.
- VART's Rumble charge deck (DCmFEOU2ADY) was not transcribed because the download was incomplete.
- PonPonLin's Rumble and Arena configs were only partly viewed.
- No win-rate or usage statistics come from this lane; those are with the stats-site lane.
