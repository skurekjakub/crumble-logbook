# Naver cafe and YouTube, round 2026-10-07 (window 2026-09-27 to 2026-10-07)

**Derived from this round's captures only**: `nv/` (cafe articles and images), `yt/` (watch-page digests and HTML), `ytq/` (search pages), `list-naver-*.tsv`, plus `../03-sites/teamhobby_*.html` where noted. Extraction: `../08-extract/naver-global.json`.

The pre-round synthesis (written earlier today from an older capture) was the starting point. Everything below was re-checked against this round. This round has no YouTube captions or storyboard frames, so a video claim stands only where its title, description, chapters or comments state it. Claims the pre-round read from frames are listed in the last section as not supported.

Citation form: `nv:<id>` is a cafe article, `yt:<videoId>` is a video. Confidence: **high** = official text or a screenshot; **medium** = one named creator or author, stated in text; **low** = a single commenter, a title only, or a datamine.

## 1. Official changes

| When | Source | Change | PvP effect | Confidence |
|---|---|---|---|---|
| 10-02 15:00 KST | nv:48486 | Oven auto-open per run by oven level (Lv.32 200 to Lv.38 500); auto-open equipment stack 30 to 100. | Indirect: faster gear farming. | high |
| 10-02 (listed in nv:50417) | nv:50417 | Fixed boss-summon mission counts in Dimensional Rift, Crumble Pass and 와글와글 스페셜 패스. | None; confirms a Rumble pass exists. | high |
| 10-08 13:00-16:00 KST | nv:50393 | Maintenance. | Arena and Rumble are unavailable during it. | high |
| 10-08 | nv:50417 | Patch notes, below. | | high |

What nv:50417 (posted 10-07) says:
- **New SSR Chardonnay Cookie** (샤르도네맛 쿠키): Grass, Support, skill 신록의 성역. She raises **CRIT chance and push resistance** for allies on a straight line, grants **Volley (다발) synergy**, and damages enemies on that line. The card GIF shows "SSR · 풀속성 · 지원". A pickup with missions comes with her.
- **Cookie level cap raised to 120.** Lv.79-100 EXP costs are cut (Lv.100: 13,911,155 to 3,347,644) and the excess is refunded.
- **Rumble Arena Season 2 opens.** The note says only that a new season begins. It gives no passive, dates, length or reward change.
- **Arena help text** gains a line explaining how mercenary (perk) effects apply. The wording isn't in the note.
- **7-day attendance** whose Day 7 reward is the SSR Milk Cookie's Crunchy Strong Pediatrician (screenshot nv-50417-8).
- Gnome Lab extended to 130-2 / special 22. Dungeon and stage-boss difficulty cuts (PvE).
- **No balance change** to any cookie, pet or Arena/Rumble rule.

Datamine disagreement (low): teamhobby's predicted v1.5 page says "쿠키 최대 레벨 Lv.100 → Lv.150" and daily dungeons 770 to 900. A comment on yt:OKBiO8_0J38 also says 150. The official note says 120 and has no dungeon extension, so use 120.

## 2. Arena meta in the window

**Bari charge deck at low stars (nv:48978, 10-02; medium for the claims, high for the screenshots).** 소금노움 runs the standard 12 at 7.45M (Arena preset 2) with **Bari at 2★**:
- Top row: Macaron, Pinot Noir (Lv.80), Pomegranate, Milk (captain), Ion, Herb.
- Bottom row: Oven Wanderer (5★), Cheesecake, Bari, Cake Hound, Cherry Cola, Moon Rabbit.
- All cookies are Lv.100 except Pinot Noir.
- Perks: **Armor Repair + Health Insurance**, "to hold out" because the team is squishy.
- Gear: Skill AMP, Skill Haste, crit resist and DR, with one or two crit lines.
- Claim: "wins quite a lot up to 9M; alternates against 10M+."
- Four damage screens put Bari on top every time: 1,877,647, 1,673,340, 2,078,591 and 1,921,802. Oven Wanderer dealt 0.44M to 1.02M; Cherry Cola 0.13M to 0.74M; Cake Hound 0.16M to 0.94M. The screens do not show win or loss.
- **Bari 7★ variant:** swap Cake Hound for Strawberry Crepe (8.44M screenshot; the preset label reads 길드토벌). "Someone else tried it and 8M beat 14M." That claim is second-hand and the win isn't shown.

**The same 12 cookies** are the chapter list of EggZaMonkey's build video (yt:OLr04-X7yO4; high that the list is as stated).

**Which deck by star level (nv:48067 replies by Seo Sinwoo; medium):**
- Brightseeker deck: for Bari below 5★ with Brightseeker 5★+.
- Bari deck: keep it if your Bari is 5★+ and it wins more.
- Rye deck: if both are below 5★.
- At equal spec, whoever wins the opening clash wins. Dying instantly means you hit a 5★ Bari deck's first skill.
- Without Majestic King Choco Drop, use Icy Birdie. Moon Rabbit is in the deck.
- His pinned comment on yt:lGxbv7l8QTQ: Herb now replaces Strawberry Crepe.
- A commenter (low): low-spec Crepe + Espresso decks often beat 2-3M higher.

**꽝라멩 (yt:2Ylz143BgdQ; medium for the framing):** "the two meta decks dominating Arena rankings" are a charge deck and a Rye all-in deck. Comments imply the charge deck uses Oven Wanderer and Bari and the Rye deck uses Skating Queen. The creator's own decision rule is not in the text.

**Evasion defense (nv:50309, 10-06; low, single author):**
- Build: 6 evasion pieces (about 1,400 evasion), Mango Toucan, and all-evasion sugar runes on Pinot Noir.
- Claimed effect: weaker attackers lose, stronger ones on an Arena preset draw, and only an accuracy (stage) preset wins.
- Commenter: Peach with Skill Haste 43+ and Dr. Wasabi gives permanent ~90% evasion.
- The beginner guide nv:48555 (10-01) independently names evasion, crit chance, crit resist, Skill Haste and Skill AMP as the current PvP lines, in two preset families: evasion and crit resist (medium-high).

**Mechanics (nv:46716, 09-27; medium):**
- Synergy givers buff synergy receivers first, e.g. Pomegranate to Milk and Macaron to Milky Way.
- Pet ATK buffs count in the ATK ranking used for buff targets.
- DR stacks multiplicatively: Icy Birdie 10% + perk 10% = 19%.
- Real cooldown = CD × 100 / (100 + Skill Haste). A commenter on yt:Dxbq3EFRoMY confirms "25 haste = 20%".
- Debuff chance = base × focus / resist.

**Power-gap complaints (low).** nv:49834's title says a defense 10M above the attacker still breaks and asks whether DR was changed again. Two commenters say they beat "inflated-power" (뻥투력) defenses 8-12M above them. No official notice of any change.

**Oven Wanderer (yt:NbSkyTH4LPo, comments only; low):**
- "Carried by Bari."
- Cherry Cola is better thanks to the Volley and Rapid Fire synergies always present in Arena teams.
- Oven needs 7★, a chain pet and Skating Queen.

**chaye's "Bari counter" for Arena and Rumble (yt:zhXTfJwXH-k):** the team isn't in the text. The pinned comment gives the perks: **Crunch Mode + Armor Repair** at Mercenary Lv.4+ (high that he says it).

## 3. Rumble Arena

- **Season 1 ended with the 10-08 patch.** teamhobby lists Rumble S1 as 2026-09-23 to 2026-10-08 (also Arena Season 5) and a "와글와글 아레나 시즌 2 지원 패키지" (10-02 to 10-21) (medium; datamine). The S2 passive is in neither the official note nor teamhobby.
- **The passive changes every season** (nv:48555: "와레나는 매 시즌별로 적용되는 패시브가 달라져"; medium).
- **Opponents are hidden at high rank.** A 10-07 comment on nv:50417 says "2천점 이후론 왜 다 가려가지고". An EN comment on yt:7HohaFbO2ig says all enemy teams are question marks at higher levels. Medium: two independent comments.
- **Tickets.**
  - Rumble refills to max at midnight (nv:48555).
  - Arena gives 1 ticket every 2 h; both modes give a free refresh every 30 min (nv:48555).
  - A bug report says Rumble refills only to 5/8 with three +1 buffs, while Arena resets to 6/6 (nv:46862; low, unconfirmed). Its screenshot shows Arena tickets at 21/6.
- **Points.** A win at 1,419 points offered **+13** (nv:46862 screenshot; high).
  - The reporter's attack team: 2.96M, with three Lv.1 cookies, plus Macaron, Rye, Cheesecake, Cake Hound, Herb, Pinot Noir, Pomegranate, Milk (captain) and Moon Rabbit.
  - The account's main power is 254M, so PvP power sits on a different scale.
- **Shop.**
  - The 3-gold-key item (500 medals) took the medals without delivering (nv:50133, bug report).
  - The guide's buy order is dough ticket > gold ticket > EXP ticket > 쇳물 (nv:48555).
- **Player sentiment.** Rumble is "just a mileage sink" with no differentiation; a suggestion is to change the cookie count or count the Gnome Lab (nv:48832; low).
- **그니's S1 guide (yt:Dxbq3EFRoMY).** The chapters confirm the structure: two attack decks, a crit-resist gear set, an evasion defense deck and an evasion gear set. Rosters are not in this round's text.

## 4. Chardonnay outlook (pre-release)

- Official kit as in section 1 (high).
- Datamine comment on yt:9ACfuomXglQ (low):
  - Buffs last 5 s.
  - CRIT% +50% at 0★, rising to +100% at 9★+.
  - Volley synergy 100, or 200 from 5★.
  - Push RES 40%, or 60% from 5★.
  - Base stats ATK 133 / DEF 60 / HP 2,790. These base stats match teamhobby's card.
- Commenters expect her to replace Herb (yt:9ACfuomXglQ) or Macaron (yt:VilGFNriNCU).
- Samool's earlier preview (yt:VilGFNriNCU) drew comments that his source was a fan OC wiki, so treat that video as unreliable.
- No PvP results yet.

## 5. The "conquest arena" question

- **Guild Conquest (길드 토벌전) is PvE.** In nv:48555 it is the guild boss mode ("토벌전은 길드별로 보스를 공략하는 컨텐츠"), listed as cross-server alongside Rumble and guilds. It is not PvP (high).
- **쟁탈전 exists in the client as a menu entry but is unreleased.**
  - The dungeon screen in nv-48555-1.png and nv-48555-2.png shows a **"쟁탈전" tab** beside 도전 던전 and 일일 던전 (high that the tab exists).
  - The 10-08 patch note does not mention it (nv:50417).
  - Commenters on that note complain it is again absent: 롤로노아 "쟁탈전 안 내줄거 알고는 있었는데", 사계 "1. 쟁탈전 2. 임플란트 언급이라도 해주자", 에스님 "쟁탈전이라도 빨리 내놓던가".
  - A commenter on yt:DaU0_8dEd1w wants "new content like 쟁탈전".
  - High that it is unreleased as of 10-08.
- **Nothing in these captures describes how 쟁탈전 plays.** Its EN name "Crumb Clash", its tiers and its territory-capture format come from record 001's client strings and from PV frames and a DC post that this round did not capture. The PV digest (yt:sLknXy1U-d8, a re-upload by channel 쿠밥) has only hashtags.
- **Rumble Arena is the live cross-server PvP mode.** If someone means "the server-wide PvP mode", it is Rumble Arena. If they mean a conquest/territory PvP mode, it is 쟁탈전, which is not out.

## 6. Pre-round claims not supported by this round

These came from storyboard frames or uncaptured pages. Do not cite them from this round.

| Claim | Status |
|---|---|
| 꽝라멩: Elite Master 1, rank 13 to 12, decks at 14.92M / 14.66M; ranking "old meta < charge (Bari <5★) < Rye < charge (Bari 5★+)" | Not in text. Only "two meta decks" and Bari-5★ hints in comments. |
| Seo Sinwoo matchups: Espresso > Rye, Rye > Bari <5★, Bari 5★+ beats all but Espresso; 17.55M; perks Armor Repair + Passion Pay | Not in text. The star rule, opening-clash rule, Icy Birdie and Herb swap are supported via nv:48067 and the pinned comment. |
| EggZaMonkey top 10 (Milk first) | Not in text (chapter numbers only). |
| 그니's rosters (Tiger Lily in deck 1, 22.26M / 22.65M / 18.44M, bait defense, gear values) | Not in text. |
| 미스터 M combo (Ion + Rockstar + Moon Rabbit, pets) and nv:49427 being an embed of it | Not in text. nv:49427's body is empty in this capture. |
| Samool said Oven Wanderer is "carried by Bari" | Corrected: a commenter said it. |
| nv:48978 "Bari 1.88M and 2.08M in two shown wins" | Corrected: four screens (1.67M to 2.08M), win or loss not shown. |
| PV segment with strongholds, 6 cookies + 3 pets + gummy bears | Not in this round's captures. |
