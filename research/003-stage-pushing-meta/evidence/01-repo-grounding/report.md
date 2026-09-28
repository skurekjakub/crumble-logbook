# Repo grounding: what records 001/002 hold about stage pushing
- url: null (derived from the repo, working tree 2026-09-28)
- captured: 2026-09-28T05:37:38.7939470+02:00

Scope: everything records 001 (`research/001-guild-conquest-meta/`) and 002 (`research/002-pvp-meta/`), the schema, the apps and the docs already say about regular stage pushing (메인 스테이지), the Dimensional Rift (차원의 이면) and the recommended-power gate (권장 전투력 / 전투력 보정). Record 003's own `evidence/02-dc/`, captured by a parallel lane, is out of scope here.

Path shorthand: `001/` = `research/001-guild-conquest-meta/`, `002/` = `research/002-pvp-meta/`. Every citation is `path:line`. Korean is quoted as captured; the English after each quote is this report's translation unless marked "(site EN)", which means the source ships that English itself. Nothing below was measured in the game client.

## 1. Power gate / recommended power (권장 전투력, 전투력 보정)

### 1.1 The rule as the sources state it

**DC 17035, "[📚정보] 전투력 보정 정리", 똥쿠키, 2026-08-07** (the earliest statement in the repo; source named in a reply as crumblehub.co)

`001/evidence/03-dc-posts/17035.md:10-15`
> 현재 전투력을 권장 전투력과 비교해 최종 데미지에 단계별 배율 적용됨
> 예를 들어 권장 전투력 100만인 스테이지
> - 전투력 99만 -> 최종데미지 75%
> - 전투력 100만 -> 최종데미지 100%
> - 전투력 120만 -> 최종데미지 120%
> 전투력 아무리 올려도 120%가 최대

EN: Current power is compared with recommended power and a stepped multiplier is applied to final damage. For example, a stage with 1,000,000 recommended power: 990,000 power gives 75% final damage; 1,000,000 gives 100%; 1,200,000 gives 120%. However high power goes, 120% is the maximum.

Replies in the same capture:
- `001/evidence/03-dc-posts/17035.md:19` "그럼 딱투력으로 꾸역꾸역 미는시점이면 깡투력이 더 중요하겠네" (EN: so when you're scraping through at just-enough power, raw power matters more).
- `:23` 들개: "그냥 치명저항이라도 전투력 올려주는거 끼워야겠네. 무조건 전투력 높은 장비 뽑아야겠다" (EN: I'll equip anything that raises power, even crit resist; always pick the higher-power gear).
- `:34` 똥쿠키: "crumblehub.co" (the source site).
- `:38` "아니 계단을 만들어놨었네" (EN: so they built a staircase).
- `:39` "이거 파티 기준임 총 전투력 기준임?" (EN: is this by party power or total power?). No answer in the capture.

The post's image, `001/evidence/03-dc-posts/img/17035-1.jpg` (a crumblehub screenshot, read for this report), shows stage **42-17, 권장 전투력 8,093,303** and eight tiles:

| Tile (KR, as printed) | Final damage | Threshold printed |
|---|---|---|
| 10% 미만 | 1% | 809,330 이하 (최대 전투력) |
| 10% 이상 | 5% | 809,331 이상 |
| 20% 이상 | 15% | 1,618,661 이상 |
| 40% 이상 | 35% | 3,237,322 이상 |
| 60% 이상 | 55% | 4,855,982 이상 |
| 80% 이상 | 75% | 6,474,643 이상 |
| 100% 이상 | 100% | 8,093,303 이상 |
| 120% 이상 | 120% | 9,711,964 이상 |

Below the tiles: "STAGE POWER TABLE / 챕터별 최소 팀 전투력 / 핵심 구간 · 전체 8구간" and per-stage rows 42-14 to 42-17 (e.g. "42-17 809,330 809,331 1,618,661 3,237,322 4,855,982"). The same tier list is extracted at `001/evidence/08-extract/dc-1.json:19`: "Stage power correction tiers from the image (stage 42-17, recommended 8,093,303): <10% of recommended -> 1% final dmg; >=10% -> 5%; >=20% -> 15%; >=40% -> 35%; >=60% -> 55%; >=80% -> 75%; >=100% -> 100%; >=120% -> 120% (max)."

In the user's terms: the 35% step (a 65% cut) starts at 40% of recommended power and runs to just under 60%; the 15% step (an 85% cut) starts at 20% and runs to just under 40%.

**crumblehub client strings** (`001/evidence/12-glossary-src/crumblehub_assets_LanguageRuntime-BhZ50ZVn.js:19`, KR key → site EN)
> "전투력 보정" → "Power Adjustment"
> "팀 전투력을 권장 전투력과 비교해 최종 데미지에" → "Your team Power is compared with the recommended Power to apply a final damage multiplier of"
> "의 구간별 배율을 적용합니다. 권장 전투력의 120%에 도달하면 이 보정은 최대 120%입니다." → "in fixed brackets. At 120% of the recommended Power, this adjustment reaches its 120% cap."
> "현재 데미지 보정과 다음 구간까지 필요한 전투력을 계산합니다." → "See your current damage adjustment and the Power needed for the next bracket."
> "챕터별 최소 팀 전투력" → "Minimum Team Power by Chapter"; "전체 8구간" → "All 8 Brackets"
> "1%는 해당 구간에 머무는 최대 전투력이며, 나머지는 각 데미지 보정에 진입하는 최소 전투력입니다. 보정은 구간식으로 상승하며 중간 전투력에 비례해 연속 상승하지 않습니다." → "The 1% column is the highest Power that remains in that bracket. Every other column is the minimum Power needed to enter its damage bracket. The adjustment rises in steps, not continuously between thresholds."
> "이 수치는 PvE 스테이지의 최종 데미지 전투력 보정입니다. 아레나 등 PvP의 해당 보정은 100%로 고정되어 있습니다. 120% 구간 이후에도 캐릭터 자체 능력치 상승 효과는 계속 적용됩니다." → "This is the final-damage Power adjustment for PvE stages. The same adjustment is fixed at 100% in PvP modes such as Arena. Character stat gains still apply beyond the 120% bracket."
> "스테이지별 권장 전투력과 전투력 구간에 따른 최종 피해 보정 수치를 확인할 수 있는 기능을 추가했습니다. …" → "Added a feature that shows each Stage's Recommended Power and final damage adjustment values by Power bracket. …"

**crumblehub stats guide** (`001/evidence/13-sites/crumblehub_guides_stats_ko.html:2`, article 04)
> 권장 전투력이 부족하면 적에게 주는 피해가 감소합니다
> 스테이지 권장 전투력보다 내 전투력이 낮으면 적에게 주는 최종 피해에 페널티가 적용됩니다. 확인된 전투식에서는 이 보정이 회복량이나 아군이 받는 피해까지 함께 낮추지는 않습니다.

EN: Below recommended power, the damage you deal drops. If your power is below the stage's recommended power, a penalty applies to the final damage you deal to enemies. In the confirmed combat formula this adjustment does not also lower healing or the damage allies take. (Extracted as "Below recommended power, outgoing damage is penalised; healing and damage taken are not." at `001/evidence/08-extract/sites.json:1160`.)

**alkapa option consult** (`001/evidence/13-sites/alkapa_option-consult_ko.html:1`, entry `combat-power-defense`; the same strings sit in `001/evidence/13-sites/alkapa_lab_crumble_logic_ko.html:1` and `002/evidence/03-sites/alkapa_option-consult_ko.html:1`)
> title: 권장 전투력 미달 페널티는 주는 피해에만 적용됩니다
> why: 권장 전투력에 미치지 못하면 내가 <b>주는 피해</b>에 페널티 배수가 적용됩니다. 내가 <b>받는 피해</b>에는 동일한 페널티가 적용되지 않습니다.
> soWhat: 생존에는 문제가 없지만 제한 시간 안에 처치하기 어렵다면 전투력 구간을 먼저 확인합니다. 이 경우 생존 옵션을 추가하기보다 다음 전투력 구간에 도달하는 것이 우선입니다.

EN: The below-recommended-power penalty applies only to damage dealt. Below recommended power a penalty multiplier applies to the damage you deal; the same penalty does not apply to damage you take. If survival is fine but you can't kill within the time limit, check your power bracket first; reaching the next bracket comes before adding survival options.

Its stage-verdict strings (same file): "현재 스테이지 대미지 판정", "최종 대미지 {rate}가 적용됩니다", "권장 전투력의 {ratio}%입니다. 다음 {next} 구간까지 전투력 {need}이 필요합니다.", "권장 전투력의 {ratio}%로 최상위 대미지 구간입니다.", "requiredCp: 권장 전투력", "requiredCpCap: 이 스테이지 권장치". EN: current-stage damage verdict; final damage {rate} applies; you are at {ratio}% of recommended power, {need} more power reaches the next {next} bracket; at {ratio}% you are in the top damage bracket.

**eog.gg** (`001/evidence/14-global/19-eoggg-home.html`, site EN)
- `:8978-8979` "The damage bracket is a ratio, and it is brutal below 10 percent. Under a tenth of the recommended Power you deal 1 percent damage. Reaching a tenth takes you to 5 percent, and the scale climbs from there to 120 percent at 1.2 times recommended. A stage you are far under is not slow, it is arithmetically impossible, and no amount of retrying changes that."
- `:9921` "Damage in Crumble is a ratio, not a flat number. The stage carries a recommended Power figure, your squad is measured against it, and the game pays out a damage percentage off a fixed scale. This chart is that scale for every stage from 1-1 to 328-30, all 9,840 of them."
- `:9923` "The useful part is that the scale is the same everywhere. Every threshold is a fixed fraction of the stage's recommended Power: 10% of it puts you in the 5% damage tier, 20% in 15%, 40% in 35%, 60% in 55%, 80% in 75%, the recommended figure itself is 100% , and 120% of it tops the scale out at 120%."
- `:9949` "Each percentage is the lowest team Power that reaches that damage tier, except the 1% figure, which is the highest Power still stuck in the 1% tier."
- `:8998` "The developer publishes no stage table, no boss list, no boss stat line and no offline reward rate. All of it comes from community play data. The recommended Power column is the part with a check behind it. It reproduces, exactly, every one of the 7,440 figures the hub shipped before this refresh … Past 168-30 it is a single source. A second file of damage brackets checks out too: all 68,880 of its thresholds reproduce from the recommended figure alone …"

**cookieruncrumbles.com gear guide** (`001/evidence/14-global/13-cookieruncrumbles-gear-runes.html`, site EN)
- `:2` "Combat power matters because stages can punish an underpowered team."
- `:6` "Story stages can reduce your damage when the team sits below the expected power. One late-story example shows how severe that can get: about 6 million power on Chapter 42-1 dealt roughly 55% damage, 10 million restored normal damage, and 12 million reached around 120%. Those numbers explain the system. They are not universal targets."
- `:24` "Use higher power when it crosses a stage damage breakpoint. Once the penalty is gone, judge the substats and the actual clear."
- `001/evidence/14-global/14-cookieruncrumbles-equipment-choice.html:13` "Your Combat Power relative to the stage changes how difficult it is to apply debuffs. A stronger account can land them more reliably with less Focus than a weaker account has." (a claim that the gap also affects debuff landing; no other source in the repo says so)

**PvP boundary** (record 002's curation of the same string)
- `002/curated/glossary.json:23` "kr": "전투력 보정" … "en": "power adjustment" … "note": "The PvE final-damage power bracket; fixed at 100% in PvP. No PvP power-gap correction was found."
- `002/evidence/03-sites/SYNTHESIS.md:150` "**The power adjustment is off in PvP.** A crumblehub stage-guide string reads "아레나 등 PvP의 해당 보정은 100%로 고정되어 있습니다": the final-damage power bracket used in PvE is fixed at 100% in PvP. Confidence medium, because it is a site statement and not checked in-game."
- `002/evidence/04-naver-global/SYNTHESIS.md:25` "**Power-gap correction.** There is no official power-gap correction (전투력 보정) for PvP. No notice or patch note mentions one."
- `002/evidence/08-extract/sites.json:4760`, `:4842` hold the same crumblehub quote.

### 1.2 Recommended-power values the repo holds

**crumb.gg Stages page** (`001/evidence/15-crumbgg/30-stages.txt`, an agent-browser snapshot with no timestamp in the file; the folder's dated captures are from 2026-09-27, after the easing; tabs "Main" (selected) and "Dimensional Rift" at `:10-11`; column headers `:21-28` "CHAPTER / 15% / 35% / 55% / 75% / 100% / ACCURACY / FOCUS"). Rows as captured:

| Chapter (line) | 15% | 35% | 55% | 75% | 100% | Accuracy | Focus |
|---|---|---|---|---|---|---|---|
| 1 (`:30`) | 320 | 640 | 960 | 1,280 | 1,600 | 100 | 100 |
| 42 (`:399`) | 2.03M | 4.06M | 6.1M | 8.13M | 10.16M | 336 | 285 |
| 168 (`:1533`) | 39.13M | 78.25M | 117.38M | 156.5M | 195.63M | 1,006 | 852 |
| 169 (`:1542`) | 39.47M | 78.94M | 118.42M | 157.89M | 197.36M | 1,010 | 856 |
| 248 (`:2253`) | 274.27M | 548.54M | 822.82M | 1.097G | 1.371G | 1,202 | 1,019 |
| 249 (`:2262`) | 281.09M | 562.17M | 843.26M | 1.124G | 1.405G | 1,204 | 1,021 |
| 328 (`:2973`) | 1.953G | 3.906G | 5.859G | 7.812G | 9.766G | 1,204 | 1,160 |

Each column is 20% / 40% / 60% / 80% / 100% of the 100% column (e.g. chapter 1: 320 / 640 / 960 / 1,280 / 1,600). The page does not say which sub-stage a chapter row stands for (see §7).

**eog.gg World 1** (`001/evidence/14-global/19-eoggg-home.html:9965-9967`, columns "Stage 55% 75% 100% · rec. 120%"): "1-1 960 1,280 1,600 1,920 … 1-30 6,155 8,207 10,258 12,310". Other worlds load by script and are not in the capture.

**The 2026-09-23 easing.** Official patch note, `001/evidence/14-global/nv-patchnotes/nv-44477.md` (cafe 44477, written 2026-09-22 06:00):
- `:118-123`
> ■ 메인 스테이지 난이도 및 밸런스 개선
> - 유저분들의 실제 성장 속도에 맞춰, 전반적인 진행 흐름이 자연스럽게 이어지도록 개선합니다.
> 이를 위해 메인 스테이지의 난이도 곡선과 일부 보스 밸런스를 아래와 같이 조정합니다.
> - 메인 스테이지 169-1~328-30 구간 난이도 완화
> - 메인 스테이지 169-1~248-30 구간 일부 보스 밸런스 조정 :
> 쿨링민트맛 쿠키 / 폭주단 바이커 / 폭주단 트럭 / 비겁한 쿠키 / 생크림콘 독수리 / 오염된 그루터기 정령 / 레드베리 암살자 / 초코크림늑대 망치공주

EN: Main-stage difficulty and balance improvements. To match players' actual growth speed and make progression flow naturally, the main-stage difficulty curve and some boss balance are adjusted: difficulty eased on main stages 169-1 to 328-30; some bosses on 169-1 to 248-30 rebalanced: Cool Mint Cookie / Rowdy Biker / Rowdy Truck / Cowardly Cookie / Cream Eagle (생크림콘 독수리) / Tainted Ent (오염된 그루터기 정령) / Redberry Assassin / Choco Werehound Princess (초코크림늑대 망치공주). The note gives no percentages.

crumb.gg's digest of the same patch, `001/evidence/15-crumbgg/33-patches-read.txt` (site EN):
- `:79` "Main stages 169-1 to 328-30 made easier; the bosses of 169-1 to 248-30 too (Cool Mint Cookie, Rowdy Biker, GingerCraven, Cream Eagle, Tainted Ent, Redberry Assassin, Choco Werehound Princess)."
- `:81` "Recommended power, enemy ATK and HP on those stages: from almost the same at 169-1 to 30% lower at 248-30 and 36% lower at the end. Stage 328-30 power:15.61B → 10.00B"

Community datamine, `001/evidence/03-dc-posts/73113.md:13` (DC 73113, 2026-09-23; same text at `002/evidence/01-dc-arena/dc/73113.md:13` and `002/evidence/02-dc-rumble/dc/73113.md:13`):
> 그리고 막스테 권투력은 약 36%감소함

EN: Also, recommended power at the final stage drops by about 36%. (Extracted with the term entry "권투력" = recommended power at `001/evidence/08-extract/dc-3.json:119`, `:126`, `:1061`.)

Post-easing figure from play, `001/evidence/03-dc-posts/74998.md:27-28` (DC 74998, 2026-09-24):
> - 피카피: 근데... 팀투력 몇으로 뜷은거임? ㅎㄷㄷㄷ
>   ↳ ㅇㅇ: 4.2g엿나 35퍼컷이 4g엿으니 35퍼로 걍 다밀은듯 워낙 쉬워져서

EN: "What team power did you clear it with?" "About 4.2G. The 35% cut was 4G, so I pushed everything at 35%; it got that easy." (Context: reaching the Rift after clearing 328-30.)

Before the easing, the only late-stage power figures in the repo are clear posts (e.g. `001/evidence/17-kr-highscore/dc/72776.md:9-14`, §1.3) and lead titles (§6); no pre-easing recommended-power table is captured.

eog.gg on the curve (`001/evidence/14-global/19-eoggg-home.html`, site EN):
- `:8983` "Recommended Power never falls and almost never leaps. The largest single step in all 9,839 of them is 1-4 into 1-5, at 1.36 times … The steepest boundary in the whole game is 1-30 into 2-1 at 1.04 times. If you are stuck, you are stuck on a slot, not on a chapter."
- `:8987` "Stage 20 and stage 30 are elite slots, and they hit about three times harder … Their attack against the recommended Power of the stage they sit in runs about three times what a normal slot in the same chapter carries, on three in four of them, and rarely under double. The one boss that breaks the pattern is GingerCraven …"
- `:8991` "Past 168-30 the boss outgrows the gate. From 168-30 to 328-30 the recommended Power asks for 79 times more, and the boss brings 183 times the health for it. Attack grows 10 times over and Defense barely moves. Meeting the recommended figure in the late chapters buys you less than the same figure bought you earlier, and the shortfall is health, so it costs you time rather than survival."

### 1.3 How players use the steps (55% / 35% / 15%)

`002/evidence/04-naver-global/nv/nv-33130.md:27` (사계, 2026-09-01, beginner guide):
> - 스테이지별 권장 전투력 및 스텟(집중, 명중) 존재

EN: Each stage has a recommended power and recommended stats (focus, accuracy).

`002/evidence/04-naver-global/nv/nv-24886.md:67` (사계, 2026-08-24):
> - 별사탕이나 다른 재화는 크게 영향 안 받는데 골드 코인은 스테이지 오를 때마다 효율이 제법 오르기에 막히는 구간에서 조금씩 사용해서 권장 투력 55% 맞추고 진행하는 식으로 반복하는 게 가장 효율적!

EN: Star candy and other currencies aren't much affected, but gold coins get noticeably more efficient as you climb, so the most efficient loop is to spend them bit by bit where you get stuck, reach 55% of recommended power, and push on.

`002/evidence/04-naver-global/nv/nv-24886.md:107` (사계, reply):
> 스테이지 프리셋 한정으로 저스펙일수록 명중/집중으로 세팅 추천합니다 투력은 돌파력이나 쿠키 레벨 등으로 보정이 가능해서 전 명중 집중 장비 투력 떨어져도 고르면서 등반 했습니다

EN: For the stage preset only, the lower your spec the more I recommend accuracy/focus. Power can be made up with breakthrough, cookie levels and so on, so I climbed picking accuracy/focus gear even when it lowered power.

`002/evidence/04-naver-global/nv/nv-43444.md:509-512` (쿠키키키, newbie guidebook, 2026-09-19):
> 예를 들어 데미지 효율이 35%라면, 해당 조건에서 데미지가 35%만 들어간다는 의미입니다.
> 35%처럼 낮은 효율로 무리하게 진행하기보다는
> 55~75%를 맞추고 진행하시는 것을 추천합니다.

EN: If damage efficiency is 35%, only 35% of your damage lands under those conditions. Rather than forcing progress at a low efficiency like 35%, reach 55-75% before pushing.

`001/evidence/11-dc-posts-extra/62838.md:9-11` (DC 62838, "[📚정보] 장비 선택 팁 준다", 2026-09-09):
> 스테이지 덱에 쓸 장비 구성중일때는
> 투력컷 55% 맞춰서 적정한 난이도로 깰거다 > 명집 적당히(요구수치의 80%정도) 유지면서 투력높은쪽 선택
> 투력컷 너무 괴랄하게 늘어서 35%로 변태처럼 깰거다 > 명집 요구수치에 맞게 명집 우선으로 찝으면됨

EN: When building stage-deck gear: if you'll clear at a reasonable difficulty at the 55% power cut, keep accuracy/focus at a moderate level (about 80% of the requirement) and pick the higher-power piece; if the power cut has grown absurdly and you'll clear perversely at 35%, pick accuracy/focus first to meet the requirement. Replies `:19-20`: "75퍼로 깰거면 뭐 고름?" / "고를시간에 스테나 쳐밀어라 ㅋㅋ" (EN: "what if I clear at 75%?" "push stages instead of choosing").

`001/evidence/03-dc-posts/75854.md` (DC 75854, 2026-09-26, comment thread on presets):
- `:24` "나는 스테 35퍼용 건실투력용 프리셋도 하나 더 파는 것도 추천함 스증치피(명중) 스증스가(혹은 명,집 둘다 달린거) 피감체렴 피감스가 토벌에서는 명집이 의미가 없어서 명집을 안챙기는건데 명집 없는 토벌셋으로 35퍼 투력컷 스테 밀면 뒤지게 안밀림" (EN: I also recommend a separate "solid power" preset for 35% stages: skill amp + crit DMG (accuracy), skill amp + skill haste (or a piece with both accuracy and focus), DR + HP, DR + skill haste. Conquest sets skip accuracy/focus because they're useless there, but pushing 35%-cut stages with a conquest set without them goes nowhere.)
- `:26` "무지성뻥투 집는 55퍼 프리셋 건실투력용 35퍼 프리셋 무지성 투력뻥 집어도 투력컷 35 될 때가 있는데 그때는 건실투력용 35로 미는게 훨씬 수월해짐" (EN: a 55% preset that mindlessly takes inflated power, and a 35% "solid power" preset. Sometimes even mindless power-inflation still lands you at the 35% cut; then pushing with the solid 35% preset is much easier.) The linked post dc:75607 is not captured in the repo.
- `:27` "55퍼 프리셋은 머리 아프게 옵션 재지 말고 투력 올려주는거 무조건 집으면 됨 35퍼 프리셋만 오븐 레벨 올라갈수록 무지성 뻥투 집다가 옵션 좋은거 뜨면 35프리셋으로 맞춰두고 계속 꾸준히 업그레이드 해주면 됨" (EN: for the 55% preset, just always take whatever raises power; only the 35% preset gets good-option pieces as the oven levels up, upgraded steadily.)
- `:28` "이 겜은 건실투력이고 뭐고 걍 55퍼 보정 받고 스테 미는게 훨씬 수월한데, 무지성 뻥투 프리셋으러도 55퍼가 안될 때 35퍼 프리셋을 쓰는거임" (EN: in this game it's far easier to just get the 55% adjustment and push; you use the 35% preset when even the power-inflated preset can't reach 55%.)
- `:33` "참고로 막스테 328 명중 요구치가 1200임 그래서 최종적으로는 명중 900~1000으로도 충분함" (EN: for reference the accuracy requirement at the final stage 328 is 1200, so 900-1000 accuracy is ultimately enough.)

`001/evidence/03-dc-posts/51143.md` (DC 51143, 그드득, "본인 1~5덱 편성 공유", 2026-08-28):
- `:13-14` "55%라면 엄청 쉽고 / 35%라도 명랑이 디버프 세계선 + 20스택 세계선이면 할만함" (EN, on the Cowardly Cookie deck: at 55% it's very easy; even at 35% it's doable in a timeline where Cheerful lands its debuff and Scorpion reaches 20 stacks.)
- `:37` "55%투력이면 무난무난하게 더이상 스테이지별 조합 안보는듯?" (EN: at 55% power you probably don't need per-stage comps any more.)

`001/evidence/03-dc-posts/70308.md` (DC 70308, 그드득, "168 이후 All In One 단일 덱 및 보스별 스위칭 공유", 2026-09-19):
- `:46-51` "기존 덱 대비 전투력 보존(방어)이 잘 되는 편입니다. 본인은 / 전투력 55% / 맞추고 트라이합니다. / 괜히 명랑한 쿠키 넣어서 전투력 깎인 채(35%) 무한 트라이하는 것보다, 55% 전투력 맞추고 이 덱으로 / 20트 안에 잡는 걸 추천 / 합니다." (EN, Cowardly Cookie: this keeps power (defence) better than the old deck. I match 55% power and try. Rather than adding Cheerful Cookie, losing power (35%) and retrying forever, match 55% and kill it within 20 tries with this deck.)
- `:56-61` "마찬가지로 전투력을 최대한 유지해서 / 55%로 트라이 / 하면 / 10~20트 안에 클리어 가능 / 합니다. / 3번 이동이 전부 뭉치는 미친 동선이 나온다면 35%로도 가능함(2시간동안 해보며...)" (EN, Rowdy Biker trio: likewise keep power up, try at 55%, clear within 10-20 tries; if all three movements bunch up, 35% also works (after two hours of trying).)
- `:74-82` "핵심 요약 및 팁 / 기본적으로 / 전투력 35% 상태에서도 전부 밀립니다. / (35%로 안 되는 보스는 / '폭주단 바이커 3마리', '비겁한 쿠키' / 딱 2개뿐) / 쿨링민트, 폭주단 트럭, 망치공주 등은 35% 전투력이더라도 / 풀오토 10~20트 박으면 알아서 깨지는 수준 / 입니다 (반대로 쿨링민트는 풀오토 권장 9시 7시 비추)" (EN: Summary: basically everything pushes even at 35% power; the only bosses that don't at 35% are the Rowdy Biker trio and Cowardly Cookie. Cool Mint, Rowdy Truck, Werehound Princess etc. clear by themselves at 35% with 10-20 full-auto tries (Cool Mint: full auto recommended, not 9 or 7 o'clock).)
- `:96` 그드득 reply: "어짜피 35%로 밀꺼면 치케가 좋으려나? 어짜피 35%라도 밀리긴해서 결국 비겁이랑 쥐돌이때문에 55%로 미는편이라 ㅇㅇ.. 하루 2시간정도 스테밀다가 비겁이 투력안되면 쿨하게 게임 끄고 투력올라 넘기면 다시 35%로 쭉밀고 반복이라" (EN: if you push at 35% anyway maybe Cheesecake is better? Stages do push at 35%, but I end up pushing at 55% because of Cowardly Cookie and the rat bikers. I push about two hours a day; when power isn't enough for Cowardly Cookie I close the game, and once power passes it I push on at 35% again, and repeat.)

`001/evidence/17-kr-highscore/dc/72776.md` (DC 72776, "너프전 248-30 801.5m 35% + 169~248 덱 정리&장비", 2026-09-22):
- `:9-14` "[시리즈] 169~248 35% 모음 / · 179-30 143.198M 35% / · 219-10 377.7m 35% / · 226-30 428m / 227-30 463m 35% / · 243-10 688.4m 35% / · 243-30 693.5m 35%" (EN: series, 169-248 at 35%: the stage and the team power each was cleared at, all in the 35% step.)
- `:29` "후반부로 갈수록 권장 투력 때문에 감초 대신에 이온을 더 많이 기용했음." (EN: toward the later stages I used Ion instead of Licorice more often because of the recommended power.)
- `:34` "내일 패치로 스테이지가 너프가 예고 되어 있는데, 보스쪽 딜량이 많이 줄을 경우 체력 빼고 치저넣어서 투력 넣는게 더 많이 스테를 밀는 전략일 수도 있을꺼 같으니 이 자료는 참고용으로만 사용하시기를." (EN: tomorrow's patch nerfs stages; if boss damage drops a lot, dropping HP for crit resist to add power may push further, so treat this as reference only.)

`001/evidence/11-dc-posts-extra/69200.md:18` (DC 69200, 2026-09-17): "스테이지에서도 마카롱에게 빨대가 들어가게 되어 35% 15초 남기고 밀어버리는 기적도 보여주기도 함." (EN: with ATK% Macaron, Macaron also gets Pomegranate's straw in stages, which even produced a miracle 35% clear with 15 s left.)

`002/evidence/01-dc-arena/dc/75680.md` (DC 75680, "아레나 프리셋이 더 잘미네", 2026-09-25):
- `:9-11` "290 스테인데 / 스테이지용 프리셋은 명집 투력 챙겨서 2G 100M 정도고, 아레나 프리셋은 1G 900M임 / 아레나 프리셋은 스증 스가 이런거 잘 맞춰서 그런가 스테도 더 잘미네" (EN: at stage 290, the stage preset with accuracy/focus power is about 2.1G, the arena preset 1.9G; the arena preset, built on skill amp and haste, pushes stages better.)
- `:17` 언담: "같은35퍼면 6스가가 ㅈㄴ 잘밈. 근데 또 35딱컷오면 뻥투력마렵더라" (EN: at the same 35%, six skill-haste pieces push very well; but when you're right at the 35% cut you want inflated power.)
- `:21` "이소리하면 발작하는놈들 꼭 있었는데 35퍼 권투일땐 걍 스가6이 압살임 명집 스캠임" (EN: at 35% of recommended power, six haste pieces crush it; accuracy/focus is a scam.)
- `:23` "아레나셋은 투력이 너무떨어져;;;" (EN: the arena set drops power too much.)

`002/evidence/01-dc-arena/dc/76095.md` (DC 76095, "명중집중 ㅈㄴ 중요한 것 같은데 왜 스캠이라는거임", 2026-09-26):
- `:9` "투력 퍼센트 똑같으면 아레나 덱이 더 쎄다던데, 난 명중집중 낮아지면 바로 체감 ㅈㄴ 되면서 개막혀버림" (EN: they say at the same power percentage the arena deck is stronger, but when my accuracy/focus drops I feel it at once and get stuck.)
- `:13` "명집 잡고 35 할빠엔 투력높음거로 55한다는거지" (EN: rather than take accuracy/focus and sit at 35, take higher power and sit at 55.)
- `:15` "같은 35퍼면 아레나덱이 훨 잘밀리던데 300스테에서 명집 700으로 밀었음" (EN: at the same 35% the arena deck pushes far better; I pushed stage 300 with 700 accuracy/focus.)
- `:17` "스테 셋은 명집 1000인데 1~3초 남기고 잡고 아레나 셋은 10초도 남기고 잡히던데 바리가 무한으로 스킬 쓰고 시커가 6개 띄워서 그런가" (EN: the stage set has 1000 accuracy/focus and kills with 1-3 s left; the arena set kills with 10 s left, maybe because Bari casts endlessly and Seeker launches six drones.)
- `:18` "아레나셋이 잘밀리는데 스가때문에 투력이 안나옴 명집뻥투적당히 챙긴 스테셋으로 35퍼 비벼야됨" (EN: the arena set pushes well but haste doesn't show in power; you have to scrape 35% with a stage set that takes some accuracy/focus inflated power.) Record 002's extraction of this thread: `002/evidence/08-extract/dc-arena.json:703`.

`002/evidence/01-dc-arena/dc/71651.md` (DC 71651, 2026-09-21; also `001/evidence/03-dc-posts/71651.md`):
- `:29` "스테장비는 깡투력때문에 토벌장비랑 겸용으로 쓰면 투력컷나서 빡쎄지 않으려나" (EN: stage gear is about raw power, so sharing it with conquest gear would drop you a power step and make it hard.)
- `:33` "스테 이것저것 써보면서 35퍼 최하위에서 오래살아보니까 치저/피감/스가/명집 이것만 챙기면 되겠더라. 특히 명집보다도 스가가 더중요함 힐돌리는게 너무 필요해서" (EN: having lived long at the bottom of the 35% band trying things, crit RES / DR / skill haste / accuracy-focus is all you need; haste matters more than accuracy/focus because heal uptime is essential.)

`002/evidence/01-dc-arena/dc/76065.md:16`, `:23` (DC 76065, Bari review, 2026-09-26): "성장재화도 다 털고 35퍼대라 손컨은 하는데" (EN: I've spent all growth currency and sit in the 35% band, so I play manually) and, as a case against pulling Bari: "2. 투력컷 55% 밑으로 스테미는데 완전오토를 원하는경우" (EN: if you push stages below the 55% power cut and want full auto.)

`002/evidence/01-dc-arena/dc/70321.md:18` (2026-09-19): "뭐 위치베리를 쓴다느니 모험가를 쓴다느니 이것도 권장투력컷 길게 보면 손해니까 넘기고" (EN: using Witchberry or Adventurer is also a loss against the recommended-power cut in the long run, so skip that.)

`001/evidence/03-dc-posts/74998.md:28` (above) and the 1T 999G author's reply `001/evidence/16-top-players/dc/76235.md:26` ("이면 뚫긴햇는데 그걸로 스펙업은 못한다요") are the only in-repo mentions of the gate near the end of the main campaign after the easing.

## 2. Stage decks and stage-specific cookie, rune, gear and pet statements

### 2.1 Decks described in text (lineups are mostly in images)

**그드득's decks 1-5**, `001/evidence/03-dc-posts/51143.md` (2026-08-28; images `51143-1..4.jpg`):
- `:10-14` "1번덱 비겁쿠키전용덱 / 운용법은 명랑쿠키 조우와동시에 디버프 묻히고 전갈 18스택 되면 손놓고 기도하기 / 비겁이는 이걸로 무조건 10트안에 끝냄" (EN: deck 1, Cowardly Cookie only: Cheerful Cookie applies its debuff on contact; once Scorpion reaches 18 stacks, let go and pray; always done within 10 tries.)
- `:16-17` "2번덱 쿨링민트 전용덱 / 시작과 동시에 7시로가기 체감상 10트안에 끝남" (EN: deck 2, Cool Mint only: go to 7 o'clock at the start; about 10 tries.)
- `:19-22` "3번덱 공중띄우기 전용보스덱 / 망치공주, 그루터기 전용이라봐도 무방 / 띄우기때문에 파란색 팬더곰 필수임 이덱의 장점은 컨트롤 필요없이 무한 풀오토 리트 오지게하면됨" (EN: deck 3, for launching bosses, effectively Werehound Princess and Tainted Ent: the blue panda (pet) is mandatory because of the launches; no control needed, just full-auto retries.)
- `:24-31` "4번덱 all In One 덱 / 일반스테이지보스들 싹다 이걸로 해결함 / 기본 풀오토로 쌉가능 5,10,20 다중보스부터 단일보스까지 싹다 해결됨 / 컨트롤해줘야하는 보스는 용암 슈가 와플 도마뱀(돌진2번)뿐임 …" (EN: deck 4, all-in-one: solves all normal stage bosses, full auto, from multi-boss 5/10/20 to single bosses; only the Lava Sugar Waffle Lizard (two charges) needs control …)
- `:32-36` deck 5 is the PvP team; the author resets and re-levels decks when switching (level-up shared across decks).
- Comments: `:41` "쿨민이도 펫 판다만두로 바꾸셈. 쿨민이 드릴 깡으로 맞아도 피겨랑 석류 안끊김" (EN: for Cool Mint also switch the pet to Panda Dumpling; Skating Queen and Pomegranate don't get interrupted even when hit by the drill); `:52`, `:57` the author's cookies are 2★; `:59` "우유 고정" (captain fixed as Milk).

**그드득's "All In One" post-168 deck**, `001/evidence/03-dc-posts/70308.md` (2026-09-19; images `70308-2..8.jpg`):
- `:17-21` "기본형 All In One 덱 … 특정보스 몇몇을 제외하면 이 조합 하나로 전부 클리어 가능 합니다." (EN: base all-in-one deck; apart from a few bosses, clears everything.)
- `:24-30` "기본 고정: 단장 우유 + 열정페이 / 복지 선택 기준 / 아프다: 방어구 특약 / 안 아프다: 초고속승진 (본인은 비겁한 쿠키, 폭주단 바이커 3마리, 트럭에서만 방어구 특약 사용 중)" (EN: fixed: captain Milk + 열정페이; perk choice: if it hurts, 방어구 특약; if not, 초고속승진 (armor perk only for Cowardly Cookie, the Biker trio and the Truck).)
- `:33-41` "기본 고정: 갓방울, 핫도그 / 상황별 3번째 펫 선택 / 아프다 (폭주단 트럭, 비겁한 쿠키 등): 얼음과자새or초코왕방울 … 안 아프다: 건전지 / 에어본 (쿨링, 망치공주, 그루터기 등): 판다만두" (EN: fixed pets Holy Baby Drop, Hot Doggie; third pet: ice-pop bird or Choco King Drop when it hurts (Truck, Cowardly Cookie), Chargemellow (건전지) when it doesn't, Panda Dumpling vs airborne bosses (Cool Mint, Werehound Princess, Tainted Ent).)
- `:44-45` Cowardly Cookie swaps "호밀맛 ➔ 전갈맛 / 딸기맛 ➔ 이온맛"; `:54-55` Biker trio "호밀맛 ➔ 전갈맛 … 딸기맛 유지"; `:64-65` Truck "딸기맛 ➔ 이온맛 … 얼음과자새 채용"; `:67` Truck control ("시작하자마자 9시든 7시든 빙글빙글 돌려주면서, 첫 힐이 발동되는 시간(인게임 기준 약 26초 쯤)까지 무빙 치다가 손 놓아주면 클리어됩니다.", EN: spin around at 9 or 7 o'clock until the first heal at about 26 s in-game, then let go); `:70-71` other airborne bosses: swap in Panda Dumpling only.
- `:86-89` "★가장 중요★ / 우유맛 쿠키의 공격력이 무조건 1등 / 이 되도록 세팅해야 합니다. / (작성자 본인도 공격력 맞추려고 피겨맛, 체리콜라맛 쿠키 레벨을 1~2단계 낮춰서 사용 중입니다.)" (EN: most important: Milk Cookie's ATK must be first; the author lowers Skating Queen and Cherry Cola by 1-2 levels to keep it so.) Extracted at `001/evidence/08-extract/dc-2.json:381`.

**ㅇㄹ's 169-248 35% series**, `001/evidence/17-kr-highscore/dc/72776.md` (2026-09-22; images `72776-1..4.jpg`):
- `:17-20` "복지 피감 + 체력 / 펫 - 갓방울 핫도그 얼음새 / 석류 - 우유 피겨 전갈 / 마카롱 라임 / * 공 체 방 치확 치피 피감 명중 집중" (EN: perks DR + HP; pets Holy Baby Drop, Hot Doggie, ice bird; Pomegranate targets Milk, Skating Queen, Scorpion / Macaron, Lime; gear lines ATK, HP, DEF, crit rate, crit DMG, DR, accuracy, focus.)
- `:25-33` "버퍼와 유지력을 위한 쿠키들은 고정이라 보면 되고 딜러 라인만 투력에 따라서 좀 왔다갔다 가능한데. / 평상시 - 브시커 전갈 2개는 고정 / 10人 - 위치베리 트위즐 딸크 3개는 고정 / 3-10 바이커 3형제 / 5-20, 30 그루터기 정려 / 6-20 망치는 감초 대신 이온 사용해도 무방함 … 3-20 트럭 / 쿨민 / 비겁이는 덱이 거의 동일함 … 비겁이는 브시커를 보스에 붙이고 전갈 독 6 8 8 뭍혀서 3턴에 20 만드는 느낌으로. 그 후 공포는 운" (EN: buffer and sustain cookies are fixed; only the dealer line shifts with power. Normally Brightseeker and Scorpion are fixed; for 10-mob slots Witchberry, Twizzly Gummy, Strawberry Crepe are fixed; Biker trio at x-10, Tainted Ent at x-20/30, Werehound at x-20 can use Ion instead of Licorice … Truck, Cool Mint and Cowardly Cookie use almost the same deck … Cowardly Cookie: put Brightseeker on the boss and land Scorpion poison 6, 8, 8 to reach 20 in three turns; the fear afterwards is luck.)

**Other decks in text**
- `001/evidence/08-extract/dc-extra.json:12` (DC 75540 extraction): "Stage (not raid) auto deck share. Pinot Noir kept low level deliberately so it does not take Pomegranate's buff; starting buff recipients 호밀/우유/딸크. Perks: armor special + 열정페이."
- `001/evidence/17-kr-highscore/dc/75601.md:9-14` (2026-09-25): "256 미는중인데 / 시커 메소 호밀 달토끼 들개 닼초 넣어서 굴리다가 / 애매하게 딜 모자라서 한번씩 막히길래 / 바리 5성 찍고 / 바리 오방 체콜 슈가룬 하지도않았는데 / 스테이지 더 잘밀림" (EN: pushing 256 with Seeker, Melon Soda, Rye, Moon Rabbit, Cake Hound, Dark Choco, stalling on damage; took Bari to 5★ and, with no runes yet on Bari, Oven Wanderer, Cherry Cola, stages push better.) Replies `:34-35` "바리 1성이어도 체콜만 10성이면 스테 씹 goat임 / 물론 방치오토덱으로는 못 씀" (EN: even 1★ Bari with 10★ Cherry Cola is the GOAT for stages; not usable as an idle auto deck), `:39` (use one tank (Dark Choco) plus Cheesecake; Bari deck has the higher ceiling but needs manual control; the rapid-fire deck with Brightseeker is easier on auto).
- `002/evidence/01-dc-arena/dc/76065.md:21-29` (Bari review): "- 비추천 케이스 / 1. 나처럼 5성시커 뽕맛급 기대하고 뽑는경우 / 2. 투력컷 55% 밑으로 스테미는데 완전오토를 원하는경우 / 3. 통합섭 아레나 보상이나 등급 노리고 뽑는경우 … - 추천 케이스 / 1. 스테밀때 빡컨은 싫지만 게임하는 느낌은 원하는경우 / 2. 레드베리나 다수몹 보스 새는게 빡치는경우" (EN: don't pull Bari if you expect a 5★-Seeker-level jump, if you push below the 55% cut and want full auto, or for Rumble rewards; do pull if you want some control without hard control while pushing, or if Redberry and multi-mob bosses leaking annoy you.)
- `002/evidence/04-naver-global/nv/nv-24886.md:117-118`: question "80 스테이지에서 막혔는데 평소 놓고쓰는 스테이지 덱 추천좀" / 사계 "이게 제일 메인이었고 상황에 따라 치케 -> 포도 쿨민 -> 멜소 플레이했습니다" (EN: this was my main; depending on the situation I swapped Cheesecake → Grapevine, Cool Mint → Melon Soda.)
- `002/evidence/04-naver-global/nv/nv-27210.md:10-11` (서신우, 2026-08-27): "[쿠키런크럼블] 스테이지, 스토리 전부 가능한 시커덱 공략 / 추가로 아레나를 좀 더 제대로 하실 분들은 락스타, 마카롱 자리에 에소, 밀키 같은 딜러를 넣거나 …" (EN: a Seeker deck for stages and story; for arena, put dealers like Espresso or Milky Way in the Rockstar and Macaron slots …)
- `002/evidence/04-naver-global/nv/nv-43444.md:534-560` (stage-deck section links out to "서신우님 유튜브"; order when stuck: "① 덱 변경 및 컨트롤하며 여러번 시도하기 ② 크럼블 허브에서 요구 명중·집중 확인 후 장비 교체 ③ 쿠키 레벨 올리기 ④ 돌파력 상승 ⑤ 펫•쿠키 성급 상승 ⑥ 스텔라•슈가룬", EN: ① change deck, control, retry; ② check required accuracy/focus on crumblehub and swap gear; ③ raise cookie levels; ④ breakthrough; ⑤ pet/cookie stars; ⑥ Stella / sugar runes.) `:517-531` stage structure: "각 스테이지는 세부 스테이지 30개로 구성되어 있습니다. … 스테이지는 최대 328-30스테이지까지 있습니다." (EN: each stage has 30 sub-stages … up to 328-30.)
- `001/evidence/03-dc-posts/32255.md:9-43` (겸이둥징, 2026-08-15, "보스별 덱 정리해봄"): lineups are images only (`32255-1..19.jpg`); `:42-43` "일반 스테이지 덱" image `32255-19.jpg`. Extracted at `001/evidence/08-extract/dc-1.json:101` (boss list: 비겁이, 쿨링민트, 망치공주, 오염된 그루터기, 은행강도 폭탄광, 폭주단 트럭/바이커, 생크림 콘 독수리, 초코왕방울, 얼음골렘, 설인거인, 용암슈가와플도마뱀).
- crumblehub curated meta decks, category "stage" (`001/evidence/13-sites/crumblehub_api_meta-decks.json`, same file at `002/evidence/03-sites/`): "쿨링민트 + 감초 오토덱" / "Cool Mint + Licorice Auto", "다중 보스 덱" / "Multiple Boss", "단일 보스 중독 덱" / "Single Boss Poison" (created 2026-08-17; cookies as numeric ids only).
- Sugar Pocket community decks (`001/evidence/13-sites/cookieruncrumble_app_api_decks.json`): "전갈발사대" (purpose "PVE 보스공격력이낮고 단일대상공격인경우"), "27-30 돌파" ("스테이지 보스 공략"), "밀린스테이지 방치용" and "버섯" ("스테이지 일반 공략"); cookie ids only.
- eog.gg PvE decks (`001/evidence/14-global/19-eoggg-home.html`, site EN): `:5498-5513` "Multiple Boss Stages … Oven Wanderer Cookie Wind Archer Cookie Vampire Cookie Dark Choco Cookie Toothpaste Cookie Pomegranate Cookie Scorpion Cookie Milk Cookie's Crunchy Strong Pediatrician Nameless Cake Hound Herb Cookie Macaron Cookie Cheesecake Cookie … Pets … Hot Doggie Majestic King Choco Drop or Sweet n' Sour Ho Holy Baby Drop"; `:5518-5533` "Single Boss Poison … GingerCraven and Cool Mint Cookie being the fights it was built for … Orange Cookie Wind Archer Cookie Rye Cookie … This build is from whales who have pushed into stage 80+."
- OSLink (`001/evidence/13-sites/oslink_blog_cookierun-crumble-team-building-guide.html:144-151`, site EN): slot unlocks "5th Slot — Stage 1-8 … 12th (Final) Slot — Stage 13-30".
- Gamemeca (`001/evidence/08-extract/sites.json:1501`): "Team images last updated 2026-08-12 … stage/boss teams only. Caption notes 우유/석류/치즈/닼초/피겨 must survive the first 30 s vs Cool Mint 38-30."

### 2.2 Gear, runes and stats for stages

- `001/evidence/17-kr-highscore/dc/72512.md:9-11` (2026-09-22): "스테이지는 집중 명중 / 아레나는 스증 치피 피감 치저 / 길컨 스증 치피 스가 이속" (EN: stages: focus, accuracy; arena: skill amp, crit DMG, DR, crit RES; guild conquest: skill amp, crit DMG, haste, move speed.) `:22` gramPH: "지금 내가 스테용으로 명중 집중 뽑았는데 플레이트 강화 13>14 하니까 집중 1400되더라 집중 1200이면 충분해서 15강 되면 집중 좀 덜어내도 될 것 같음" (EN: focus reached 1400 at plate +14; 1200 focus is enough.)
- `002/evidence/04-naver-global/nv/nv-24886.md:30-32` (2026-08-24): "5. 스테이지 덱의 필수 스텟, 명중과 집중 / - 크럼블은 명중과 회피, 집중과 저항의 서로 상반되는 관계가 존재하고 스테이지별로 회피와 저항이 있기에 요구되는 명중/집중이 있지만 반드시 필요한 요소는 아니며, 체감상 저스펙 트라이 유저일수록 권장 명중, 집중을 맞추는 것을 추천한다 / * 168 스테이지 기준 명중 750 집중 800 추천" (EN: essential stage stats are accuracy and focus; each stage has evasion and resist, so there are required accuracy/focus values, not strictly mandatory; the lower your spec, the more you should meet them; at stage 168, 750 accuracy / 800 focus recommended.) `:51-54` presets "스테이지(명중/집중) / 아레나(회피/치명저항)".
- `002/evidence/04-naver-global/nv/nv-41500.md:116` (comment): "스테이지에선 명집 중요하고 나머지 점수내기 컨텐츠랑 아레나는 스증이랑 스가 중요한 걸로 알아요." (EN: accuracy/focus matter in stages; skill amp and haste in score content and arena.)
- `002/evidence/04-naver-global/nv/nv-23817.md:31-32` (밀크흑당버블티, 2026-08-22): "대부분의 분들이 100스테이지를 넘어가면 해당 스테이지를 밀기 위해 많은 양의 명중/집중 스탯이 장비에 부옵으로 들어가있습니다. … 일반 PVE스테이지에서는 노움연구소나 길드연구소를 통해 대량의 치확을 챙길 수 있고, 쿠키들의 레벨을 조정해서 마카롱에게 석류스증을 뭍힌다거나 …" (EN: past stage 100 most players carry lots of accuracy/focus substats to push; in normal PvE stages you get lots of crit rate from the Gnome and guild labs, and adjust levels so Macaron gets Pomegranate's skill amp …)
- `002/evidence/04-naver-global/nv/nv-28949.md:73-74` (comments): "공략은 굿 근데 현재 스테이지 뚫린 시점에서 이 글보고 무리해서 아레나 세팅 바꾸지말고 명집 모아서 스테먼저 하도록" / "스테이지 많이 밀어야 장비도 더 얻을 수 있고 오븐렙도 올릴 수 있어서 웬만하면 스테이지 장비 챙기는게 먼저지만 …" (EN: don't switch to arena settings while stages still push; gather accuracy/focus and do stages first / pushing stages yields more gear and oven levels, so stage gear comes first.)
- `002/evidence/04-naver-global/nv/nv-43444.md:923` "슈가룬은 아레나, 스테이지, 토벌전 등 콘텐츠에 따라 중요하게 여겨지는 옵션이 다릅니다." and `:973` "본 가이드는 스테이지에서 자주 사용되는 조합을 기준으로 작성했습니다. 보스나 상황에 따라 특정 쿠키 및 펫은 변경될 수 있습니다." (EN: rune priorities differ by content … this rune guide is based on the combos commonly used in stages.) Per-cookie priorities follow at `:978-1070` (Milk ATK%; Pomegranate skill amp; Scorpion crit DMG / focus / ATK% / skill amp; Herb skill amp / haste / DR; Macaron from `:1066`).
- `001/evidence/07-nv-posts/nv-43011.md:53` (뭔디, 2026-09-18): "스테이지덱으로 맞춰둔 집중,명중셋팅으로는 토벌전 고점은 어림도 없고 … 스테이지덱이 제가 1G인데 108G 나왔고 …" (EN: a stage deck set for focus/accuracy is nowhere near conquest peaks; my 1G stage deck scored 108G …); `:83-84` "혹시 올 스가 가도 스테이지에서 크게 안떨어지고 딜 할 수 있나요?" / "네 브시랑 닼초는 스테이지에서 스가도 좋습니다" (EN: Brightseeker and Dark Choco are fine on all haste in stages too.)
- `002/evidence/01-dc-arena/dc/71651.md:9-17` (proposal): "토벌전 장비를 스테이지랑 겸하는게 더 이득 아님? … 스테이지 토벌전 장비 / 검 활 지팡이 - 스증 치명 / 악세 - 스증 치명/피감 스가 / 방어구 치저 피감 고정"; replies `:24-26` "토벌이랑 스테이지는 치저도 빠져야 하는 거 아님?" / "스테이지 겸이면 방어구 치저는 필수같음 깡스탯 들어가니 투력 박살나네", `:36-37` "스테 치저 무효옵 아님? 난 투력 떨어져도 스테 치저 다 버렸는데" / "그 투력 버려갈 정도로 깡방 깡체가 좋은 옵션이 아니라서 치저 고르는 느낌임" (EN: shouldn't crit RES go for conquest and stages? / for stage use, armor crit RES seems mandatory because flat stats tank power / isn't crit RES a dead option in stages? I dropped it despite the power loss / flat DEF/HP aren't worth losing that power, so crit RES gets picked.) Also `001/evidence/03-dc-posts/71381.md:16` "스테이지랑 토벌은 치저 잡옵임" (EN: crit RES is junk in stages and conquest).
- `001/evidence/03-dc-posts/75854.md:17`, `:21` "스테 토벌에서는 어차피 몬스터는 치저도 없고 버프로 치확 존나 높아져서 치확딜 효율 증가 시켜주는 치피를 챙기는거임" / "참고로 스테에서는 치저가 의미가 없어서 피감체력 장비 챙기는게 좋음" (EN: in stages and conquest monsters have no crit RES and buffs push crit rate very high, so you take crit DMG / crit RES is meaningless in stages, so take DR/HP gear.)
- `001/evidence/03-dc-posts/76599.md:14` 언담: "장기적으로 올스가가 제일좋은데 아레나나 스테이지나 투력낮은구간에서는 스증도 ㄱㅊ대" (EN, Seeker runes: all haste is best long-term, but skill amp is fine in arena or stages at low power.)
- `001/evidence/11-dc-posts-extra/62608.md:13` "딜은 스증, 스테이지생존이나 토벌전 30초이상까지 버티기 더 좋은 건 공증인데" (EN: skill amp for damage; ATK% is better for stage survival or lasting past 30 s in conquest.)
- `001/evidence/03-dc-posts/75029.md:9-11`, `001/evidence/03-dc-posts/75542.md:10`: players keep separate stage / arena / conquest presets; `75029.md:11` "[스테이지프리셋] 상태에서 전투력증가 활성화 장비만 클릭 후 명중,집중 1줄있는것만 업데이 트" (EN: in the stage preset, click only power-increasing pieces and update only those with an accuracy or focus line). `001/evidence/08-extract/dc-3.json:913-927` summarises preset names such as "35%(명중집중)" and "스테(뻥툴)".
- alkapa (`001/evidence/13-sites/alkapa_option-consult_ko.html:1`, entry `crit-resist-stop`): "PvE 치명저항은 10%에서 효용이 포화됩니다 … 대부분의 몬스터는 치명확률이 10%입니다. 내 치명저항이 10%에 도달하면 몬스터의 치명타가 발생하지 않으며, 초과 수치는 추가 효과를 만들지 않습니다." (EN: PvE crit RES saturates at 10%: most monsters have 10% crit rate; at 10% crit RES monsters never crit and more does nothing.) Its recommender states it is stage-based: `002/evidence/08-extract/sites.json:6002` "이 추천은 스테이지(PVE) 기준입니다. …"
- eog.gg (`001/evidence/14-global/19-eoggg-home.html`, site EN): `:6675` "Hit chance is your Accuracy over enemy Avoidance, clamped at 100 percent. Under the bar every miss loses the whole swing, damage and debuff together; at the bar every further point is inert."; `:6676` "enemy Resist climbs 10.2 times across the campaign"; `:6680` "enemy Focus never moves off 1.0 across all 9,840 stages through 328-30, while their Accuracy, Avoidance and Resist all climb"; `:6681` "No monster carries any CriticalResist"; `:6740` "enemy Resist reaches 1,020 by the last stage"; `:8994-8995` "The Accuracy the enemy brings against your Evasion reaches its ceiling at 168-29 and then holds flat for the final 4,802 stages … The Accuracy a stage demands of you keeps climbing for another eighty chapters past that, to 248-28, before it finds a ceiling of its own; Focus never stops rising at all."
- cookieruncrumbles equipment guide (`001/evidence/14-global/14-cookieruncrumbles-equipment-choice.html`, site EN): `:10` "| Accuracy and debuffs already work well | Skill Amp, then Skill Haste as the stage-oriented starting order |"; `:12` "Around chapter 200, roughly 900 Accuracy is a useful progression reference."; `:14` "a practical stage-progression order starts with Accuracy, followed by Focus. Skill Amp is the next default choice".
- crumb.gg required accuracy/focus per chapter: §1.2 table (`001/evidence/15-crumbgg/30-stages.txt`).
- Sugar Pocket game data (`001/evidence/19-sugarpocket/skills-runes-1.4.002.json:20566`, key `stageBosses`, client 1.4.002): `"basis": "Monster.BaseResist × Stage.ResistRate; excludes in-battle modifiers"`, a `stages` array from 1-1 to 328-30 with `resistRate` (1 at 1-1, 11.615 at 328-30) and `focusRate` (1 throughout), and a `bosses` map (name, baseResist, baseFocus, controlImmune). No recommended power, HP, ATK or element in it.
- `001/evidence/17-kr-highscore/nv/nv-24362.md:15-19` (올렐레오로리, 2026-08-23): "168 스테이지까지 완등한 시점에서 … 168-30 스테이지 보스인 비겁한 쿠키를 기준으로 공증과 스증이 어떤 계산식으로 적용되는지 역산해서 파악했고 … 공격력 증가 1% = 스킬증폭 증가 0.617% 에 해당한다" (EN: against the 168-30 boss Cowardly Cookie, reverse-solved how ATK% and skill amp apply: 1% ATK = 0.617% skill amp.) Record 001 flags it as pre-8/27 and stale: `001/evidence/08-extract/kr-highscore.json:375-377`.

### 2.3 Cookie-specific stage statements

- Tea Knight (실론나이트) is conquest-only: `001/evidence/07-nv-posts/nv-27449.md:25-26` "실론 스테이지나 아레나에선 별로죠.?" / "실론의 스킬을 보면 토벌전에서 버프를 준다는 문구가 있기에 다른 곳에서는 적용이 되지 않는 것 같습니다", `:35-36` "토벌전 전용 쿠키입니다"; `001/evidence/07-nv-posts/nv-35279.md:28-29` "혹시 실론나이트 스테이지 보스 적용되나요?" / "스킬 설명에 길드 토벌전에서만 적용된다고 명시되어 있습니다." (EN: Tea Knight's buff text says Guild Conquest; it doesn't apply in stages.)
- Pinot Noir rapid-fire deck: `002/evidence/04-naver-global/nv/nv-26982.md:30-31` "아레나 스테 다 같은 덱쓰는건가용" / "스테이지에는 안좋습니다 한마리만 잡는 컨텐츠 쓰이는거라서 …" (EN: not good for stages; it's for single-target content.)
- Strawberry Crepe: `002/evidence/04-naver-global/nv/nv-28011.md:61` "크레페는 스테이지에서도 활용 가능하여 …" (EN: Crepe is also usable in stages.)
- Macaron and Pomegranate's straw: `001/evidence/11-dc-posts-extra/69200.md:12` "하지만 스테이지에서 마카롱에게 빨대가 전혀 들어가지 않아 아쉬운 모습 보임" (EN: with skill-amp Macaron, Macaron gets no straw at all in stages), `:18` (§1.3).
- Pomegranate's straw vs airborne bosses: `001/evidence/17-kr-highscore/dc/71848.md:27` "스테이지에서 망치 같은 거 못 깨는 건 망치로 석류 빨대가 끊겨서 그러는 거임 피노판다 안 쓰면 석류 저항 못 받아서 빨대 끊길거라서 치명적임" (EN: failing Werehound-type stages is the hammer breaking Pomegranate's straw; without Pinot + Panda, Pomegranate gets no resistance and the straw breaks.)
- Rockstar: `002/evidence/01-dc-arena/dc/75148.md:33` "락스타 상향 받아서 지금 숨은 꿀캐임 스테이지도 괜찮음" (EN: Rockstar, buffed, is a hidden gem; fine in stages too.)
- Princess Bari: `002/evidence/02-dc-rumble/dc/75083.md:16` "스테이지도 존나 좋은거 같은데 깡딜 좋아" (EN: very good in stages too; raw damage); Oven Wanderer as a Bari launch pad in stages: `002/evidence/01-dc-arena/dc/72449.md:37`.
- Cool Mint boss bug (official): `001/evidence/14-global/nv-notices/nv-45166.md:23` "메인 스테이지에 배치된 보스 쿨링민트맛 쿠키가 전투 중 스킬을 사용하지 않고 일반 공격만 진행하는 현상" (EN: the Cool Mint boss on main stages uses only basic attacks, no skills.)
- Candy Shade Pouch (색동주머니) vs Cool Mint: lead title dc:76612 (`001/evidence/17-kr-highscore/q21.tsv:2`) and extraction `001/evidence/08-extract/kr-highscore.json:179-186` ("Tried dropping Pinot and running only Candy Shade Pouch's 30% lift resistance against a Stage boss; still got launched …").
- Cool Mint lever trick: `001/evidence/08-extract/kr-highscore.json:21` "For the 35% auto/farming Cherry-formation deck against Cool Mint … spinning the movement lever in a fast circle right after each drill-attack window regroups the team and pushed clear rate to near 100%."
- Boss attack/defence mechanics per stage boss: `001/evidence/19-sugarpocket/skills-runes-1.4.002.json:20566` (`controlImmune: true` on the stage bosses listed there).

### 2.4 Level and idle notes

- Level rules for stage decks appear only as asides: Milk ATK first (`001/evidence/03-dc-posts/70308.md:86-89`), Pinot kept low (`001/evidence/08-extract/dc-extra.json:12`), Macaron ATK vs levels (`001/evidence/11-dc-posts-extra/62608.md:18-25`), stage-pushing levels vs conquest Lv.1 (`001/curated/scores.json:19-20`, `001/evidence/08-extract/dc-extra.json:3045-3046` "스테미느라 올려놓은거임 피노 닼초 허브 렙따ㄱ", EN: they're levelled for stage pushing; level down Pinot, Dark Choco, Herb).
- Offline (idle) income: `002/evidence/04-naver-global/nv/nv-24886.md:14` (higher stages pay more; main rewards step every 20 stages, e.g. 121-1, 141-1); `002/evidence/04-naver-global/nv/nv-33130.md:21`; eog.gg `001/evidence/14-global/19-eoggg-home.html:8970-8975` ("Offline income is a step function, not a curve … Farm the highest stage you have cleared, not the hardest one you can survive"); crumblehub idle-efficiency tool strings at `001/evidence/12-glossary-src/crumblehub_assets_LanguageRuntime-BhZ50ZVn.js:19`.

## 3. Dimension stages (차원의 이면, Dimensional Rift)

Official patch note, `001/evidence/14-global/nv-patchnotes/nv-44477.md` (2026-09-23 update, written 2026-09-22):
- `:51-56`
> ■ 신규 콘텐츠 - 차원의 이면
> 모든 스테이지를 완료한 용병단분들을 위한 신규 콘텐츠 '차원의 이면'이 오픈됩니다!
> - 차원의 이면은 업데이트 단위의 시즌제로 운영되며, 메인 스테이지를 마지막 단계까지 모두 완료해야 도전할 수 있습니다.
> - 전용 성장 요소인 '차원의 힘' 레벨을 올려 능력치를 강화할 수 있으며, 차원의 이면의 일반 몬스터 처치 단계가 생략되어 성장한 만큼 다음 단계 보스에 즉시 도전할 수 있습니다.
> - 단계를 클리어하여 시즌 한정 프로필 테두리를 획득할 수 있으며, '차원의 조각'을 모아 교환소에서 전용 펫과 다채로운 보상으로 교환할 수 있습니다.

EN: New content, the Dimensional Rift, for merc bands who cleared every stage. It runs in seasons per update and requires clearing the main stages to the last step. Its own growth stat, Dimensional Energy (차원의 힘), raises your stats by level; the Rift skips the normal-monster phase, so you challenge the next step's boss directly as far as your growth allows. Clearing steps gives season-limited profile frames; Dimension Fragments (차원의 조각) buy a dedicated pet and other rewards at the exchange.
- `:58-61` "■ 차원의 이면 교환소 전용 신규 펫 - <SSR> 무한바퀴 … 무한바퀴 펫은 차원의 이면에서 아군의 보스피해를 증가시키는SSR 펫입니다." (EN: new Rift-exchange pet, SSR Continuum Cog (무한바퀴), raises allies' boss damage in the Rift.)
- Comments: `:192-193` "차원의 이면은.. 아직 잘 모르겠네" / "그냥 스테이지 추가 하는거 대신에 나온거임" (EN: it came out instead of adding stages); `:245` "차원의 이면은 격차가 더 벌어지겠는데" (EN: the Rift will widen the gap); `:261` "이제겨우 188인데 ㅠ" (EN: I'm only at 188).

Community guide, `002/evidence/04-naver-global/nv/nv-43444.md:1347-1358`:
> 8.7. 차원의 이면 / 위의 각종 교환소와 마찬가지로 차원의 조각 교환소가 있습니다. … 차원의 이면은 모든 메인 스테이지를 완료하면 개방됩니다. / 전 서버 통합으로 일일 보상과 주간 보상이 있습니다. / 뉴비분들은 당장은 크게 신경 쓰지 않아도 됩니다. / * 업데이트 단위의 시즌제로 운영됩니다. / * 전용 성장 요소인 '차원의 힘'으로 능력치를 강화할 수 있습니다. / * 일반 몬스터 처치 단계가 생략되어, 성장한 만큼 다음 단계 보스에 바로 도전할 수 있습니다.

EN: The Rift has a Dimension Fragment exchange; it opens after all main stages; daily and weekly rewards are all-server; newbies can ignore it; seasonal; Dimensional Energy raises stats; no normal-monster phase.

crumb.gg (`001/evidence/15-crumbgg/33-patches-read.txt`, site EN):
- `:57-59` "Ally Boss DMG +150%, only in the Dimensional Rift. From the Dimensional Rift exchange. / +50% at the lowest grade, +150% at the highest. No effect in Guild Conquest."
- `:71` "Dimensional Rift: opens after the last main stage. Boss-only stages; raise your Dimensional Energy level for stats. Season rewards: profile frames and Dimension Fragments for the exchange."
- `001/evidence/15-crumbgg/30-patches.txt:74` links "https://crumb.gg/stages?tab=rift"; `001/evidence/15-crumbgg/30-stages.txt:11` shows the "Dimensional Rift" tab, not selected, so its contents were not captured.

Game data and glossary:
- `001/curated/glossary.json:3222-3224` "kr": "차원의 이면" … "en": "Dimensional Rift" (game text).
- `001/curated/glossary.json:2358-2367` entry 무한바퀴: "en": "Continuum Cog", "owned_stat": "AvoidanceAddition", "battle_passive_max_kr": "차원의 이면에서 아군 보스피해 150% 증가", "battle_passive_max_en": "+150% Ally Boss DMG in the Dimentional Rift".
- crumblehub strings (`001/evidence/12-glossary-src/crumblehub_assets_LanguageRuntime-BhZ50ZVn.js:11`): "차원의 힘" → "Dimensional Energy", "차원의 조각" → "Dimension Fragment", "차원의 이면 10단계 달성 테두리" → "Dimensional Rift Stage 10 Frame", "차원의 이면 30단계 달성 테두리" → "Dimensional Rift Stage 30 Frame", plus Rift packages ("차원 챌린저 패키지", "차원의 이면 도전 패키지 Vol.1/Vol.2", "차원의 이면 돌파 와펜"). ("차원 뽑기" in the same bundle is the Special/Dimensional gacha, a different thing.)

Player posts:
- `001/evidence/03-dc-posts/74998.md:9-14` (DC 74998, 2026-09-24): "이거보상 상점에 잇는게 전부임. / 추가능력치는 이면던전에서만 적용되는 능력치 / (토벌 및 기타컨탠츠 적용x) / 시간당 얻는 재화는 상점서 물건을 사는 재화가 아니라 능력치 레벨을 자동으로 올려주는 경험치임 / 상점재화는 클리어해서 나오는 보상으로 사는것. / 펫은 이면보스피해 50프로임.." (EN: the rewards are just what's in the shop. The extra stats apply only in the Rift dungeon (not conquest or other content). The per-hour currency isn't shop currency but EXP that auto-levels the stat level; shop currency comes from clear rewards. The pet is +50% Rift boss damage.) `:27-28` cleared at about 4.2G team power at the 35% cut (§1.2). Extraction `001/evidence/08-extract/dc-3.json:581-589` reads the image: "차원의 힘 Lv.2 effects: 공격력 증폭 10%, 방어력 증폭 10%, 체력 증폭 10%, 치명피해 30%, 치명확률 10%, 집중확률 5%, 명중률 10% — all '차원의 이면' scoped."
- `001/evidence/17-kr-highscore/dc/75087.md:9-10` (2026-09-24): "이면가면 더 쌔지는줄알앗음 ㅇㅇ... 토벌 딜 하늘 뚫을줄 알앗는데 / 뭔가 성장이 천장에 막힌기분" (EN: I thought reaching the Rift would make me stronger and conquest damage would skyrocket; growth feels capped.)
- `001/evidence/16-top-players/dc/76235.md:25-27` (the 1T 999G conquest post, 2026-09-26; same lines at `001/evidence/21-author-awkward2637/76235.md:26-28`): "혹시 이면꺠고 스펙업 한건가" / "이면 뚫긴햇는데 그걸로 스펙업은 못한다요 그렇게 높게친건아님 덱투 650배정도라" / "아 이면 막 10g나오는건 거기안에서만 적용인건가" (EN: did you spec up by clearing the Rift? / I broke through the Rift but it gives no spec-up … / so the Rift's big 10G is only applied inside it.)
- `001/evidence/16-top-players/dc/76333.md:21`: "이면 막혀서 할게 없는데" (EN: stuck in the Rift, nothing to do.)
- `001/evidence/14-global/nv-notices/nv-45166.md:34` (comment on the 9/23 known-issues notice): "차원 스테이지가 일반스테이지보다 보상이 낮은건 정상인가요" (EN: is it normal that dimension stages pay less than normal stages?) No reply in the capture.
- `001/evidence/08-extract/crumbgg.json:4908` "2026-09-23: Dimensional Rift exchange pet/item 'Ally Boss DMG +150%' has no effect in Guild Conquest."; `001/evidence/08-extract/global.json:511` "무한바퀴 pet: boss damage only in 차원의 이면, not Guild Conquest".
- Rift recommended power: title only, dc:74351 "방치형인데 차원 권장 전투력 1T ㅋㅋㅋㅋㅋㅋ" (`001/evidence/10-dc-index-extra.tsv:29`; EN: an idle game, yet the Dimension recommended power is 1T). The post body is not captured.

## 4. Code and schema touch points for "stage"

- `packages/schema/src/enums.ts:34-36` "/** Game mode a gear recommendation is for. */ export const GEAR_CONTEXT = ["raid", "arena", "stage"] as const; export type GearContext = (typeof GEAR_CONTEXT)[number];"
- `packages/schema/src/enums.ts:42-48` `GAME_MODE = ["guild_conquest", "arena", "rumble_arena"]` has no stage value; `packages/schema/src/tables/columns.ts:9-11` `modeColumn()` defaults every `mode` column to `guild_conquest`.
- `packages/schema/src/tables/gear.ts:2`, `:13` `gearRecs.context` is `text("context", { enum: GEAR_CONTEXT }).notNull()` (doc comment `:5-8`: "`context` is the in-game gear preset it's for; `mode` is the game mode whose research recommends it").
- `packages/schema/src/tables/scores.ts:5` doc comment "A recorded raid/arena/stage score, optionally tied to the deck that produced it." The table (`:6-17`) has `damageG`, `powerG` and no `mode` or stage column.
- `packages/schema/test/enums.test.ts:174-185` round-trips every `GEAR_CONTEXT` member, including "stage".
- `apps/server/src/importers/seed/schema.ts:13`, `:93` the curated `gear.json` row schema validates `context: z.enum(GEAR_CONTEXT)`.
- `apps/web/src/app/modes/types.ts:117-118` `gearContext: GearRec["context"]` on the boss-screen config; `apps/web/src/app/modes/conquest.ts:80` sets `gearContext: "raid"`; `apps/web/src/views/BossView.tsx:213` filters gear by `g.context === boss.gearContext`. No web view shows `context: "stage"` rows.
- `apps/web/src/app/modes/index.ts:26` `MODES = [CONQUEST, ARENA, RUMBLE]`; there is no stage mode section, route folder or view.
- Unrelated uses of the word: `apps/web/test/boss-view.test.tsx:84-85`, `:484`, `:529`, `apps/server/test/importers/import-record.test.ts:280`, `packages/schema/test/roundtrip.test.ts:345-349` ("unresolved_final_dr_stage", "unresolved_stage") are Guild Conquest boss damage-reduction phases, not campaign stages.
- Curated rows with `"context": "stage"`: only in record 002:
  - `002/curated/gear.json:10` `{ "mode": "arena", "slot": "general", "substats": "Attack evasion defenders on the stage preset (accuracy)", "why": "Accuracy cancels evasion; the evasion deck lost even to 7M attackers with accuracy.", "context": "stage", "sources": ["dc:73173", "dc:69591", "dc:74043"] }`
  - `002/curated/gear.json:16` `{ "mode": "rumble_arena", "slot": "general", "substats": "Top rankers reportedly attack on their stage (accuracy) preset", "why": "An observation, not a guide; a reply guesses it is to beat evasion defenders.", "context": "stage", "sources": ["dc:75391", "dc:76490"] }`
  - Record 001's `curated/gear.json` has none; `001/curated/gear.json:8` mentions stage stats inside a raid row ("accuracy and focus (stage stats) are dead lines").
- Other curated mentions of stage pushing: `001/curated/scores.json:19-20` (levels raised / gear switched for stage pushing); `002/curated/counters.json:77`, `002/curated/mechanics.json:11`, `:27`, `002/curated/rng.json:4`, `002/curated/takeaways.json:3`, `:14` (the stage preset as an arena counter to evasion); `002/curated/glossary.json:4-5` (client stage types `Arena`, `RumbleArena`).
- Design docs: `docs/superpowers/specs/2026-09-27-crumble-logbook-design.md:86` "`gear_recs` | substats per slot | `slot` enum (top_left, top_right, bottom_left, bottom_right, general), `substats`, `context` enum (raid, arena, stage), `why`"; `docs/superpowers/plans/2026-09-27-data-core.md:98` the same enum.
- `data/snapshot.json` carries the curated rows above (derived; not listed line by line).
- `tools/conquest-macro/conquest-loop.ahk:16`, `:283` `Phase := "idle"` is a macro state, not the game's idle rewards.

## 5. What the roadmap, audit and open-questions docs say about a stage mode

- `README.md:90` "**Roadmap** (the user's, 2026-09-28): simulators for every game mode, starting with the Guild Conquest one specced in `docs/superpowers/specs/2026-09-27-conquest-simulator-design.md`; scrapers and easy ways to plug in more decks and research records; and more game modes, such as stage-pushing teams and the Golden Drop encounter, each with its own views, backend logic and simulator. The architecture audit against this roadmap is `docs/architecture/2026-09-28-audit.md`."
- `docs/architecture/2026-09-28-audit.md:9` "3. More game modes beyond Guild Conquest, Arena and Rumble Arena: stage pushing (story/world stages) and the Golden Drop encounter, each with views, backend logic and its own simulator."
- `:67` "**Where it bends when the second sim (Golden Drop, Arena, stage) arrives:**"
- `:88` "6. *The curated `mode` default.* Every curated row schema defaults `mode` to `guild_conquest` (`seed/schema.ts:26`), as does the DB column (`columns.ts:9`) and the record itself (`seed/map.ts:256`). Record 001's rows omit `mode` and rely on this. A new stage-mode record whose author forgets `mode` on a row files it under Guild Conquest silently. The default made sense with one mode; it is now a trap."
- `:106` "1. *Conquest concepts on generic tables.* … `scores` (`tables/scores.ts`) is `damageG`/`powerG` with no `mode` column at all … A stage mode's result is "cleared / not, with which team, in how many attempts"; Golden Drop's is damage again. … `GEAR_CONTEXT = raid | arena | stage` (`enums.ts:35`) is a second, parallel mode-ish enum keyed to the in-game preset; Golden Drop has no value."
- `:109` "4. *Record ↔ mode is two relations.* … Workable; a record that covers stage pushing and Golden Drop will exercise it."
- `:152` "Why: roadmap 3 (a new mode's record cannot silently file rows under conquest)."
- `:164` "Why: roadmap 2 and 3 (new curated collections per mode: stages, encounter facts)."
- `:203` "**R14. Result and ranking tables per mode (roadmap 3, stage mode).** When the stage mode's record exists, decide between adding `mode` to `scores` and generalising `damageG` to a `value` with a per-mode unit, or introducing `stage_clears` as its own content type. The registry makes the second cheap and keeps 배 conquest-only, which matches the "배 is only a normaliser" rule; lean that way. Same question for `rankings.board`. **M**, risk low. Not before the mode exists."
- `:207` "**R16. `routes/$mode/` instead of one folder per mode (roadmap 3, at the fourth mode).**"
- `:209` "**R17. Generalise `refs` beyond decks** … the first time a content type references another aggregate (a `stages` table, an `encounters` table)."
- `:253` "1. **Schema**: add the value to `GAME_MODE` (`packages/schema/src/enums.ts`). … If the mode needs a new content type (stage clears, encounter facts), follow the content-type checklist …"
- `:266` "Resolved 2026-09-28: every question is answered below. The remaining unknowns are research outcomes, not decisions: record 003 settles what stage pushing is as data, and Golden Drop's shape waits on its own record."
- `:278` "1. **Mode routing.** Keep one route folder per mode … or move to `routes/$mode/` when the stage mode arrives (R16)?"
- `:281` "4. **Results for non-damage modes.** Extend `scores` with `mode` and a unit, or add per-mode result tables (`stage_clears`) and keep `scores` conquest-only (R14)?"
- `:283` "6. **What is "stage pushing" as data?** Per-stage teams (a `stages` dimension and clear records) or one general PvE team with notes? This decides whether R14 and a `stages` content type are needed at all."
- `:290` "- Mode routing: move to `routes/$mode/` when the stage mode arrives (R16)."
- `:293` "- Non-damage results: per-mode result tables such as `stage_clears`; `scores` stays Guild Conquest only (R14)."
- `:299` "- Stage pushing as data: record 003 settles it. Golden Drop's shape: its own research record settles it."
- `OPEN-QUESTIONS.md:19-21` (Guild Conquest simulator, calibration data): "2. **May that data be committed?** The repo is public. / - Yes: it becomes record 003 evidence, and the calibration is reproducible from the repo. / - No: it stays in the browser and a gitignored local file, and record 003 holds only the method." These lines use the number 003 for simulator calibration data, a different subject from this record. OPEN-QUESTIONS.md has no stage-mode entry.
- `docs/superpowers/specs/2026-09-28-capture-ledger-design.md:55` "`pnpm capture dc fetch 003-stage-pushing-meta evidence/04-dc 17035 …`" (an example command naming this record and the power-adjustment post).

## 6. Lead table: stage, dimension and recommended-power titles in the index TSVs

Method. Every index TSV in `001/evidence/` (`02-dc-index.tsv`, `05-nv-guide-board-index.tsv`, `10-dc-index-extra.tsv`, `14-global/03-nv-notices-menu1.tsv`), `001/evidence/16-top-players/*.tsv` (including the Naver free board `06-nv-free-board.tsv` and guide-board recapture `05-nv-guide-board.tsv`), `001/evidence/17-kr-highscore/*.tsv`, `001/evidence/18-kr-encounter/*.tsv` and `002/evidence/*/*.tsv` was scanned for titles naming stages (스테, 스테이지, a stage number such as 243-10, 막스테, 챕터), the Rift (차원, 이면), the gate (권장, 권투, 보정, 투력컷, a 15/35/55/75% step), idle decks, or a recurring stage boss (비겁, 쿨민/쿨링민트, 쥐토바이/쥐돌이/바이커, 트럭, 그루터기, 망치, 레드베리, 독수리, 거미, 폭탄광, 도마뱀, 설인, 골렘, 식쿠식물, 독뿔버섯, …). Dropped: the Naver guild boards (`06-nv-guild-board-index.tsv`, `16-top-players/04-nv-guild-board.tsv`), whose only hits are guild recruitment and guild-research levels such as "연구 12-3"; titles hit only by the word 방치형 (idle-genre complaints); coupon, pet-only, arena-only and playable-Cool-Mint-coefficient titles. Rows are deduplicated by site and post id; the row with the most views is kept, and "(+n)" counts the other index rows that carried the same post. Stats: dc `v` views, `r` recommends, `c` comments; nv `v` views, `l` likes, `c` comments. A dc date given as a time (HH:MM) in the index is the capture day, 2026-09-27. Glosses are this report's; short and literal. Titles are leads: unless §§1-3 cite a capture, the post body is not in the repo.

### 6.1 Power-gate and damage-step titles

| Post | Site | Date | Stats | Title (KR) | EN gloss | Index row |
|---|---|---|---|---|---|---|
| 76834 | dc | 2026-09-27 21:20 | v131 r0 c5 | 272 35% 비겁이 어째깨냐? | Stage 272 at 35%: how do you beat Cowardly Cookie? | `002/evidence/01-dc-arena/list-b.tsv:10` |
| 76825 | dc | 2026-09-27 21:05 | v282 r0 c10 | 시커 바리 체콜은 15퍼를 찢어 | Seeker + Bari + Cherry Cola tear through the 15% step | `002/evidence/01-dc-arena/list-b.tsv:11` |
| 76804 | dc | 2026-09-27 20:27 | v413 r0 c28 | 개인적으로 내가 제일 좋아하는 35퍼 오토덱 | My favourite 35% auto deck | `001/evidence/17-kr-highscore/all_candidates.tsv:139` (+2) |
| 76797 | dc | 2026-09-27 20:20 | v140 r0 c1 | 312-30 35% 클덱 | Stage 312-30 35% clear deck | `002/evidence/01-dc-arena/list-b.tsv:13` |
| 76779 | dc | 2026-09-27 19:38 | v251 r0 c7 | 바리 5성이상은 15퍼 밀림? | Does Bari at 5★+ push the 15% step? | `002/evidence/01-dc-arena/list-b.tsv:14` |
| 76614 | dc | 2026-09-27 13:35 | v112 r0 c2 | 35퍼 일반 스테 오토로 안밀어지는데 정상임? | Normal stages at 35% won't push on auto; normal? | `001/evidence/02-dc-index.tsv:20` |
| 76223 | dc | 2026-09-26 | v142 r0 c0 | 난 35% 건실 프리셋을 하고싶었는데 | Wanted a 35% "solid-power" preset, but... | `001/evidence/17-kr-highscore/all_candidates.tsv:106` (+2) |
| 75832 | dc | 2026-09-26 | v108 r0 c0 | 35퍼로 미는 중인데 | Pushing at 35% now, but... | `001/evidence/17-kr-highscore/all_candidates.tsv:83` (+2) |
| 75710 | dc | 2026-09-25 | v566 r0 c0 | 호구된 비겁이 35퍼 풀오토로 패기 | Beating a pushover Cowardly Cookie at 35% on full auto | `002/evidence/01-dc-arena/list-c.tsv:45` |
| 75672 | dc | 2026-09-25 | v363 r0 c1 | 바리 35퍼 스테덱 좋던데? | Bari 35% stage deck is good | `001/evidence/02-dc-index.tsv:162` |
| 75487 | dc | 2026-09-25 | v351 r0 c6 | 왜인지 몰겠는데 돌격덱으로 35% 스테가 그냥 밀리네 | Charge deck just pushes 35% stages, not sure why | `002/evidence/01-dc-arena/list-b.tsv:115` |
| 75468 | dc | 2026-09-25 | v1179 r0 c5 | 치케 35퍼 오토? 스테덱 공유 | Cheesecake 35% auto? Stage deck share | `001/evidence/17-kr-highscore/all_candidates.tsv:68` (+4) |
| 75227 | dc | 2026-09-25 | v450 r0 c1 | 아레나 셋으로 스테돌면 35퍼도 자동으로 돌아가네 | With the arena set even 35% stages run on auto | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:98` |
| 74924 | dc | 2026-09-24 | v71 r0 c0 | 슬슬 35퍼가 다가온다 | The 35% step is approaching | `002/evidence/01-dc-arena/list-d.tsv:38` |
| 74795 | dc | 2026-09-24 | v211 r0 c2 | 크 럼블 허브 55%컷 완화된거 적용된거임? | Has crumblehub applied the eased 55% cut? | `002/evidence/02-dc-rumble/01-list-rumble.tsv:22` |
| 74659 | dc | 2026-09-24 | v113 r0 c0 | 280이상 35퍼단들 덱 뭐쓰고있음? | 280+ at 35%: what decks do you use? | `001/evidence/02-dc-index.tsv:316` |
| 74351 | dc | 2026-09-24 | v567 r1 c1 | 방치형인데 차원 권장 전투력 1T ㅋㅋㅋㅋㅋㅋ | Idle game, yet Dimension recommended power is 1T lol | `001/evidence/10-dc-index-extra.tsv:29` |
| 74326 | dc | 2026-09-24 | v355 r0 c2 | 크 럼블 허브 사이트 스테 너프된거 권투 적용함? | Has crumblehub applied the stage nerf to recommended power? | `002/evidence/02-dc-rumble/01-list-rumble.tsv:28` |
| 73775 | dc | 2026-09-23 | v417 r0 c2 | 35퍼 치케 오토덱 하는 놈들 락 스타 써봐라 | 35% Cheesecake auto-deck users: try Rockstar | `001/evidence/16-top-players/01-dc-names.tsv:37` |
| 73663 | dc | 2026-09-23 | v324 r0 c1 | 권투력 이사이트 반영됐네 | The site now reflects recommended power | `001/evidence/16-top-players/02-dc-terms.tsv:125` |
| 73636 | dc | 2026-09-23 | v2555 r5 c3 | 변경된 권장 전투력 및 신규 컨텐츠 전투력 반영 | Changed recommended power and new-content power reflected (alkapa) | `001/evidence/16-top-players/02-dc-terms.tsv:127` |
| 72776 | dc | 2026-09-22 | v1511 r1 c0 | 너프전 248-30 801.5m 35% + 169~248 덱 정리&장비 | pre-nerf 248-30 801.5m 35% + 169~248 deck summary & gear | `001/evidence/17-kr-highscore/all_candidates.tsv:27` (+3) |
| 72094 | dc | 2026-09-22 | v208 r0 c3 | 한번 55퍼 보정맛보면 | Once you taste the 55% adjustment... | `002/evidence/01-dc-arena/list-d.tsv:67` |
| 71456 | dc | 2026-09-21 | v102 r0 c1 | 비겁이는 75퍼 오토안되네 | Cowardly Cookie won't auto at 75% | `002/evidence/01-dc-arena/list-d.tsv:76` |
| 71369 | dc | 2026-09-21 | v144 r0 c0 | 243-30 693.5m 35% | Stage 243-30 693.5m 35% | `001/evidence/02-dc-index.tsv:599` |
| 71293 | dc | 2026-09-20 | v306 r0 c2 | 243-10 688.4m 35% | Stage 243-10 688.4m 35% | `001/evidence/02-dc-index.tsv:615` |
| 71266 | dc | 2026-09-20 | v554 r0 c13 | 280-30 비겁 35퍼 명랑없이 해봄 | Stage 280-30 Cowardly Cookie at 35% without Cheerful | `001/evidence/02-dc-index.tsv:622` |
| 71100 | dc | 2026-09-20 | v82 r0 c0 | 287에서 막혔다.. 15%는 진짜 몸비틀어도안되네 | Stuck at 287; 15% is impossible however hard you try | `001/evidence/02-dc-index.tsv:648` |
| 70074 | dc | 2026-09-18 | v149 r0 c0 | 248이후 35% 스테 밀때 이 조합 맞나? | Is this comp right for 35% stages after 248? | `001/evidence/02-dc-index.tsv:812` |
| 69542 | dc | 2026-09-18 | v148 r0 c0 | 나는 35퍼단 하는 애들이 신기함 | Amazed at people who push at 35% | `001/evidence/16-top-players/03-dc-terms2.tsv:113` |
| 68752 | dc | 2026-09-17 | v343 r0 c3 | 219-10쥐돌이 35프로 카트! | Stage 219-10 rat bikers at 35%, cart! | `001/evidence/16-top-players/01-dc-names.tsv:78` |
| 68686 | dc | 2026-09-16 | v344 r0 c0 | 개인적으로 쓰는 35% 비겁이 덱 | My 35% Cowardly Cookie deck | `001/evidence/02-dc-index.tsv:1006` (+1) |
| 68579 | dc | 2026-09-16 | v455 r0 c2 | 264-30 35퍼 아레나 프리셋 으로 잡아봤는데 | Beat 264-30 at 35% with the arena preset | `002/evidence/01-dc-arena/list-b.tsv:236` |
| 68319 | dc | 2026-09-16 | v456 r0 c1 | 쥐토바이 35% 15초컷 | Rat bikers at 35%, 15 s cut | `001/evidence/02-dc-index.tsv:1049` |
| 68294 | dc | 2026-09-16 | v95 r0 c0 | 261-14인데 좀만 더가면 15퍼됨 | At 261-14; a bit further and it's 15% | `001/evidence/17-kr-highscore/q33.tsv:25` |
| 68128 | dc | 2026-09-16 | v6758 r21 c20 | 권장 전투력 과하게 초과하면 이런 이펙트 나오나봐 | Effect shown when far above recommended power | `002/evidence/01-dc-arena/list-rec.tsv:71` (+1) |
| 67229 | dc | 2026-09-14 | v414 r0 c8 | 226-30 428m / 227-30 463m 35% | Stage 226-30 428m / 227-30 463m 35% | `001/evidence/02-dc-index.tsv:1158` |
| 67059 | dc | 2026-09-14 | v276 r0 c5 | 35단 비겁이는 ㄹㅇ | 35% Cowardly Cookie is real | `001/evidence/16-top-players/03-dc-terms2.tsv:162` |
| 67046 | dc | 2026-09-14 | v1059 r0 c3 | 쥐돌이 쥐토바이 35퍼는 이덱이 제일 좋은듯 | Best deck for rat bikers at 35% | `001/evidence/18-kr-encounter/search-patterns8.tsv:30` |
| 66982 | dc | 2026-09-14 | v506 r0 c2 | 248-30 비겁이 35% 컷컷컷 | Stage 248-30 Cowardly Cookie 35% cut cut cut | `001/evidence/16-top-players/03-dc-terms2.tsv:164` |
| 66903 | dc | 2026-09-14 | v460 r0 c21 | 200스테 35퍼 이게 고점이였네 | Stage 200 at 35% was my peak | `001/evidence/02-dc-index.tsv:1209` |
| 60886 | dc | 2026-09-07 | v223 r0 c2 | 중요한건 투력컷이 아님 | What matters is not the power cut | `001/evidence/10-dc-index-extra.tsv:453` |
| 60729 | dc | 2026-09-07 | v868 r0 c5 | 208-30 비쿠 35% 클리어덱 | Stage 208-30 Cowardly Cookie 35% clear deck | `001/evidence/10-dc-index-extra.tsv:478` |
| 59490 | dc | 2026-09-04 | v4807 r44 c11 | 35퍼의 이기는 시간선 찾기 | Finding the winning timeline at 35% | `002/evidence/01-dc-arena/list-rec.tsv:194` (+1) |
| 59072 | dc | 2026-09-04 | v634 r0 c12 | 240 비겁 35퍼단형들 집단지성좀 | Stage 240 Cowardly Cookie: 35% pushers, pool ideas | `001/evidence/10-dc-index-extra.tsv:689` |
| 56679 | dc | 2026-09-01 | v10466 r15 c25 | 227-232 등반덱 35퍼 | Stage 227-232 climbing deck at 35% | `002/evidence/01-dc-arena/list-rec.tsv:216` (+1) |
| 50007 | dc | 2026-08-28 | v2329 r10 c12 | 스테이지 권투력이 얼마나 가파르게 늘어나는지 알아보자... | How steeply stage recommended power rises | `001/evidence/02-dc-index.tsv:1529` |
| 43436 | dc | 2026-08-25 | v12232 r25 c26 | 무과금 268지 오면서 썻던 이거저거 공략(35퍼투력) | F2P guide from the road to 268 (35% power) | `001/evidence/02-dc-index.tsv:1621` |
| 17035 | dc | 2026-08-07 | v18257 r21 c25 | 전투력 보정 정리 | power adjustment summary | `001/evidence/02-dc-index.tsv:1882` |
| 46541 | nv | 2026-09-26 | v95 l0 c0 | 15%... | 15%... | `001/evidence/16-top-players/06-nv-free-board.tsv:91` |
| 46336 | nv | 2026-09-26 | v490 l4 c28 | 열심히하는유저  스테이지 259-30  비겁한쿠키  찐 무과금덱 플레이    클리어 찐 노광제  겨우 클리어함  명중 집중 좀 버리고 전투력 보정빨인지 운으로 깸요   바리없어요  계정 스펙  스샷 사진도있어요 | F2P, no Gwangje: 259-30 Cowardly Cookie barely cleared, dropped acc/focus, power adjustment or luck | `001/evidence/16-top-players/06-nv-free-board.tsv:166` |
| 46234 | nv | 2026-09-25 | v97 l0 c0 | 권투15%도 클리어는 가능하다 | Clearing at the 15% rec.-power step is possible | `001/evidence/16-top-players/06-nv-free-board.tsv:197` |
| 46209 | nv | 2026-09-25 | v491 l9 c1 | 스테 완화 후 확실한 35퍼 비겁이 덱 | Sure-fire 35% Cowardly Cookie deck after the easing | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:52` (+2) |
| 45358 | nv | 2026-09-23 | v176 l0 c0 | 크럼블 허브 스테이지 투력컷 바로 업뎃 됐네 | crumblehub updated the stage power cuts at once | `001/evidence/16-top-players/06-nv-free-board.tsv:514` |
| 45336 | nv | 2026-09-23 | v773 l0 c0 | 현재 스테이지 난이도 완화 (crumblehub.co 사이트 업뎃전 15%까지 클리어가능) | Current stage easing (before crumblehub updated, clearable down to 15%) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:89` (+2) |
| 45278 | nv | 2026-09-23 | v51 l0 c0 | 크럼블허브 패치 안된거같은데 권장투력 어디서 봐요 | crumblehub not patched; where to see recommended power? | `001/evidence/16-top-players/06-nv-free-board.tsv:548` |
| 45109 | nv | 2026-09-23 | v199 l1 c0 | 막스테기준 권투력 36퍼 감소정도면 | If final-stage recommended power drops ~36%... | `001/evidence/16-top-players/06-nv-free-board.tsv:626` |
| 44928 | nv | 2026-09-23 | v711 l0 c2 | 난이도 하향전 35% 최소투력 온몸비틀기 등반 마침표 | Pre-nerf 35% minimum-power climb: done | `001/evidence/16-top-players/06-nv-free-board.tsv:647` |
| 44904 | nv | 2026-09-23 | v410 l0 c3 | 님들 투력55퍼 넘고안넘고가 | Whether power is over 55% or not... | `001/evidence/16-top-players/06-nv-free-board.tsv:653` |
| 44815 | nv | 2026-09-22 | v643 l4 c2 | 너프전 248-30 801.5m 35% + 169~248 덱 정리&장비 | pre-nerf 248-30 801.5m 35% + 169~248 deck summary & gear | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:105` (+2) |
| 44742 | nv | 2026-09-22 | v343 l1 c0 | 스테 15퍼 클 | Cleared a stage at 15% | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:110` (+2) |
| 44353 | nv | 2026-09-22 | v983 l9 c3 | 내가쓰는 연타관통덱 (독뿔버섯 다수잡몹) 35% | My rapid-fire/pierce deck (poison-horn mushroom, many mobs) at 35% | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:122` (+2) |
| 44238 | nv | 2026-09-21 | v159 l0 c3 | 혹시 권장투력은 어디서 보나요?? | Where do I see recommended power? | `001/evidence/16-top-players/06-nv-free-board.tsv:845` |
| 44131 | nv | 2026-09-21 | v480 l2 c1 | 비겁이 명쿠 안쓰는 NEW(?)덱 35% 최소투력컷. Ex)264-30 | New(?) Cowardly Cookie deck without Cheerful, 35% minimum cut, e.g. 264-30 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:135` (+2) |
| 43780 | nv | 2026-09-20 | v513 l4 c9 | 243 - 10 쥐토바이 688.4m 35% | Stage 243 - 10 rat bikers 688.4m 35% | `001/evidence/05-nv-guide-board-index.tsv:153` (+2) |
| 43025 | nv | 2026-09-18 | v222 l0 c1 | 224-30 55% 클덱 | Stage 224-30 55% clear deck | `001/evidence/05-nv-guide-board-index.tsv:209` (+2) |
| 42900 | nv | 2026-09-18 | v94 l0 c0 | 독거미 세마리 투력35% | Three spiders at 35% power | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:226` (+2) |
| 42898 | nv | 2026-09-18 | v165 l1 c0 | 독수리 두마리 투력 35% 5사격덱 (노전갈) | Two Eagles at 35% power, 5-ranged deck (no Scorpion) | `001/evidence/05-nv-guide-board-index.tsv:220` (+2) |
| 42897 | nv | 2026-09-18 | v261 l0 c0 | 쥐돌이 투력 55% 연타덱(노전갈, 노감초) | Rat bikers at 55% power, rapid-fire deck (no Scorpion, no Licorice) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:228` (+2) |
| 41429 | nv | 2026-09-15 | v128 l0 c2 | 권장 투력 | recommended power | `001/evidence/16-top-players/06-nv-free-board.tsv:1667` |
| 41372 | nv | 2026-09-15 | v94 l0 c0 | 56-30 11.6M  최저투력 3트클 | Stage 56-30 at 11.6M, lowest power, 3rd try | `001/evidence/05-nv-guide-board-index.tsv:318` (+2) |
| 41057 | nv | 2026-09-14 | v725 l0 c4 | 핵들때문에 35% 구간대 잠수함 패치한거냐 ? | Stealth patch on the 35% band because of hackers? | `001/evidence/16-top-players/06-nv-free-board.tsv:1753` |
| 40994 | nv | 2026-09-14 | v285 l3 c1 | 179-30  비겁이 덱기록용 35%보정 도전하시는분 참고하세용 | Stage 179-30 Cowardly Cookie deck, for 35%-adjustment challengers | `001/evidence/16-top-players/06-nv-free-board.tsv:1772` |
| 40661 | nv | 2026-09-13 | v61 l0 c0 | 쿨민 단장3렙 전투력보정 35 | Cool Mint, captain Lv3, power adjustment 35% | `001/evidence/16-top-players/06-nv-free-board.tsv:1877` |
| 40627 | nv | 2026-09-13 | v115 l0 c0 | 이거 권투력 좀 낮춰야하지않나? | Shouldn't this recommended power come down? | `001/evidence/16-top-players/06-nv-free-board.tsv:1887` |
| 40506 | nv | 2026-09-13 | v520 l0 c0 | 216-30 비겁 55퍼가 답이다 | Stage 216-30 Cowardly Cookie: 55% is the answer | `001/evidence/16-top-players/06-nv-free-board.tsv:1927` |
| 40431 | nv | 2026-09-13 | v619 l3 c14 | 안녕하세요 15퍼단입니다 | Hello, I'm a 15% pusher | `001/evidence/16-top-players/06-nv-free-board.tsv:1950` |
| 40283 | nv | 2026-09-12 | v600 l4 c4 | 192-30 35% 212M | Stage 192-30 35% 212M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:387` (+2) |
| 40161 | nv | 2026-09-12 | v866 l3 c4 | 235-30 비겁 최적덱 43%투력(588m) | Stage 235-30 Cowardly Cookie optimal deck at 43% power (588M) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:397` (+2) |
| 40074 | nv | 2026-09-12 | v208 l0 c4 | 200이후 비겁이 35퍼 덱좀 알려주세요.. | Cowardly Cookie 35% deck for 200+? | `001/evidence/16-top-players/06-nv-free-board.tsv:2026` |
| 40042 | nv | 2026-09-12 | v293 l2 c5 | 스테이지 보정 없애고 하향해라 | Remove the stage adjustment and lower difficulty | `001/evidence/16-top-players/06-nv-free-board.tsv:2036` |
| 39813 | nv | 2026-09-11 | v185 l1 c2 | 178-30 쿨민 덱기록용 149m 35%보정 최소컷 도전하시는분 참고용 | Stage 178-30 Cool Mint deck at 149M, 35% adjustment, for minimum-cut challengers | `001/evidence/16-top-players/06-nv-free-board.tsv:2096` |
| 39708 | nv | 2026-09-11 | v455 l2 c1 | 176-30 비겁이 최소컷 도전  참고용 덱입니당  영상o 135m 5트?클 | Stage 176-30 Cowardly Cookie minimum-cut deck, video, 135M, ~5 tries | `001/evidence/16-top-players/06-nv-free-board.tsv:2120` |
| 39638 | nv | 2026-09-11 | v407 l1 c1 | 232-30 권투1.261m  / 539m(43%) 클덱 | Stage 232-30 rec. power 1.261m / 539m(43%) clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:433` (+2) |
| 39570 | nv | 2026-09-11 | v114 l1 c0 | 권장 투력 55맞춰도 젤 거지같은개 | Even at 55% recommended power, the worst one | `001/evidence/16-top-players/06-nv-free-board.tsv:2152` |
| 39554 | nv | 2026-09-11 | v2304 l66 c15 | 232-1 551m(45%) 유저의 스테이지 등반덱 추천 | Stage 232-1 at 551M (45%): stage climbing deck recommendation | `001/evidence/16-top-players/05-nv-guide-board.tsv:430` (+2) |
| 39132 | nv | 2026-09-10 | v210 l2 c2 | 전투력 보정? 55%? 이게무슨뜻이죠 | Power adjustment? 55%? What does it mean? | `001/evidence/16-top-players/06-nv-free-board.tsv:2263` |
| 38769 | nv | 2026-09-10 | v268 l0 c3 | 권장투력? | recommended power ? | `001/evidence/16-top-players/06-nv-free-board.tsv:2427` |
| 37868 | nv | 2026-09-09 | v485 l0 c9 | 스테이지 확장에 따른 필요 권장전투력 요구 증가량 | Recommended-power increase needed with the stage expansion | `001/evidence/16-top-players/06-nv-free-board.tsv:2842` |
| 37858 | nv | 2026-09-09 | v206 l0 c0 | 지금 난이도 추세로 보면 328 스테 권장투력 | Stage 328 recommended power extrapolated from the current curve | `001/evidence/16-top-players/06-nv-free-board.tsv:2846` |
| 37788 | nv | 2026-09-09 | v894 l3 c0 | 195-30 비겁이 권투력 35% 공략 ( 개인적인 생각 ) | Stage 195-30 Cowardly Cookie guide at 35% recommended power (personal view) | `001/evidence/05-nv-guide-board-index.tsv:504` (+2) |
| 37552 | nv | 2026-09-08 | v520 l4 c1 | 이제는 너무 쉬워진 35퍼 쿨링민트 공략 (234-30) | 35% Cool Mint guide, now too easy (234-30) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:525` (+2) |
| 37387 | nv | 2026-09-08 | v642 l2 c6 | 232-30 이틀만에 클리어한 35퍼 비겁이 영상 | Stage 232-30 Cowardly Cookie at 35%, cleared in two days (video) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:538` (+2) |
| 37219 | nv | 2026-09-08 | v416 l3 c8 | 227-30 비겁이 30% 클리어덱 저장용 | Stage 227-30 Cowardly Cookie 30% clear deck for the record | `001/evidence/16-top-players/05-nv-guide-board.tsv:539` (+2) |
| 37045 | nv | 2026-09-08 | v203 l0 c1 | 226-30 쿨링민트 35%클 | Stage 226-30 Cool Mint 35% clear | `001/evidence/05-nv-guide-board-index.tsv:544` (+2) |
| 37018 | nv | 2026-09-07 | v1489 l11 c22 | 235-10 쥐돌이 35퍼 클 | Stage 235-10 rat bikers cleared at 35% | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:553` (+2) |
| 37010 | nv | 2026-09-07 | v531 l1 c0 | 224-30 비겁이 35% 클리어 | Stage 224-30 Cowardly Cookie 35% clear | `001/evidence/05-nv-guide-board-index.tsv:549` (+2) |
| 36840 | nv | 2026-09-07 | v609 l2 c1 | 192-30 비겁한 쿠키 35% 영상 | Stage 192-30 Cowardly Cookie 35% video | `001/evidence/05-nv-guide-board-index.tsv:559` (+2) |
| 36695 | nv | 2026-09-07 | v186 l1 c5 | 35퍼로 쥐세마리 바이크단 깨신분?? | Anyone beat the rat biker trio at 35%? | `001/evidence/16-top-players/06-nv-free-board.tsv:3176` |
| 36590 | nv | 2026-09-07 | v396 l0 c2 | 명중 부족한 35%는 힘든 비겁이 224-30 트라이중.. | Trying 224-30 Cowardly Cookie at 35% with low accuracy: hard | `001/evidence/16-top-players/06-nv-free-board.tsv:3202` |
| 36238 | nv | 2026-09-06 | v384 l3 c5 | 202-30 쿨민 35퍼 | Stage 202-30 Cool Mint at 35% | `001/evidence/05-nv-guide-board-index.tsv:592` (+2) |
| 35278 | nv | 2026-09-04 | v889 l13 c3 | 35% 투력컷 비겁이를 쉽게 잡아보자 (21630 378m) | Easy Cowardly Cookie at the 35% power cut (216-30, 378M) | `001/evidence/05-nv-guide-board-index.tsv:649` (+1) |
| 34874 | nv | 2026-09-04 | v1239 l4 c3 | 195-10 최소컷인듯? | Stage 195-10 minimum cut, I think | `001/evidence/16-top-players/05-nv-guide-board.tsv:665` (+1) |
| 34860 | nv | 2026-09-03 | v185 l2 c1 | 전투력에 따른 최종 데미지 보정 | Final-damage adjustment by power | `001/evidence/16-top-players/06-nv-free-board.tsv:3596` |
| 34626 | nv | 2026-09-03 | v568 l9 c9 | 226-30 쿨링민트 35퍼 클리어 영상 (596M) | Stage 226-30 Cool Mint cleared at 35% (video, 596M) | `001/evidence/05-nv-guide-board-index.tsv:675` (+1) |
| 34405 | nv | 2026-09-03 | v1426 l6 c13 | 216-30 비겁이 35% (용병단 4레벨) | Stage 216-30 Cowardly Cookie at 35% (merc Lv4) | `001/evidence/16-top-players/06-nv-free-board.tsv:3712` |
| 34395 | nv | 2026-09-03 | v6220 l135 c61 | 227~248 35% 클리어 덱 공유 (+일부 내용 추가) | Stage 227-248 clear decks at 35% (+ additions) | `001/evidence/05-nv-guide-board-index.tsv:683` (+1) |
| 33847 | nv | 2026-09-02 | v845 l3 c4 | 투력컷 75% 맛보고 확장 스테 접해보니 서둘러 깰 필요를 더 못느낌 | After tasting the 75% cut, no rush for expansion stages | `001/evidence/16-top-players/06-nv-free-board.tsv:3818` |
| 33650 | nv | 2026-09-02 | v189 l0 c4 | 비겁이 보정35퍼로 꺠지긴함? | Can Cowardly Cookie be beaten at 35% adjustment? | `001/evidence/16-top-players/06-nv-free-board.tsv:3857` |
| 33645 | nv | 2026-09-02 | v74 l0 c0 | 전투력 보정 | power adjustment | `001/evidence/16-top-players/06-nv-free-board.tsv:3860` |
| 33628 | nv | 2026-09-02 | v973 l1 c29 | 징징대는 애들 55%는 커녕 75%로이상으로 깨는애들일듯 | Complainers probably clear at 75%+, let alone 55% | `001/evidence/16-top-players/06-nv-free-board.tsv:3865` |
| 32955 | nv | 2026-09-01 | v1137 l2 c2 | 219-10 폭주단 바이커 최소컷(?) 영상 (용병단 3렙, 뻥투력) | Stage 219-10 Rowdy Biker minimum-cut video (merc Lv3, inflated power) | `001/evidence/05-nv-guide-board-index.tsv:744` (+1) |
| 32468 | nv | 2026-08-31 | v612 l2 c2 | 187-10 쥐돌이( 전투력 75% 참고 ) | Stage 187-10 rat bikers (75% power, for reference) | `001/evidence/05-nv-guide-board-index.tsv:768` (+1) |
| 30567 | nv | 2026-08-30 | v723 l4 c3 | 전투력 보정 35%구간을 위한 비겁한 쿠키 덱 | Cowardly Cookie deck for the 35% power-adjustment band | `001/evidence/05-nv-guide-board-index.tsv:838` (+1) |
| 28870 | nv | 2026-08-28 | v925 l2 c2 | 171-30 55% 비겁 온몸비틀기 | Stage 171-30 Cowardly Cookie at 55%, scraped through | `001/evidence/05-nv-guide-board-index.tsv:920` (+1) |
| 27042 | nv | 2026-08-27 | v630 l2 c0 | 169 ~ 248 스테이지 권장 전투력, 명중, 저항 추가 | Stage 169-248 recommended power, accuracy, resist added (alkapa) | `001/evidence/05-nv-guide-board-index.tsv:999` (+1) |
| 25032 | nv | 2026-08-25 | v229 l1 c0 | 168 - 30 79.8M 35%클 + 161 ~ 168 35% 모음집 | Stage 168-30 at 79.8M, 35% clear + 161-168 35% collection | `001/evidence/05-nv-guide-board-index.tsv:1098` (+1) |
| 24990 | nv | 2026-08-24 | v1042 l5 c2 | 권장전투력35%인 분들을 위한 67-30 비겁이클덱 | Stage 67-30 Cowardly Cookie clear deck for those at 35% recommended power | `001/evidence/05-nv-guide-board-index.tsv:1100` (+1) |
| 23158 | nv | 2026-08-21 | v570 l0 c2 | 94-20 41.6m 51% 클덱 | Stage 94-20 41.6m 51% clear deck | `001/evidence/05-nv-guide-board-index.tsv:1295` (+1) |
| 23012 | nv | 2026-08-21 | v468 l2 c2 | 91-30 40.9m 52%클덱 | Stage 91-30 40.9m 52% clear deck | `001/evidence/05-nv-guide-board-index.tsv:1305` (+1) |
| 22684 | nv | 2026-08-20 | v581 l0 c1 | 88-30 35.8m 48%클덱 | Stage 88-30 35.8m 48% clear deck | `001/evidence/05-nv-guide-board-index.tsv:1347` (+1) |
| 22582 | nv | 2026-08-20 | v325 l0 c1 | 86-30 34.8m 45% 클덱 | Stage 86-30 34.8m 45% clear deck | `001/evidence/05-nv-guide-board-index.tsv:1355` (+1) |
| 21677 | nv | 2026-08-19 | v177 l0 c0 | 76 스테 덱 및 최소투력 | Stage 76 deck and minimum power | `001/evidence/05-nv-guide-board-index.tsv:1438` (+1) |
| 21529 | nv | 2026-08-18 | v391 l0 c3 | 73스테 덱 및 최소투력 컷 | Stage 73 deck and minimum-power cut | `001/evidence/05-nv-guide-board-index.tsv:1460` (+1) |
| 21495 | nv | 2026-08-18 | v210 l0 c0 | 71ㅡ1~ 30덱 및 투력컷 | Stage 71-1 to 30 deck and power cut | `001/evidence/05-nv-guide-board-index.tsv:1465` (+1) |

### 6.2 Dimensional Rift titles

| Post | Site | Date | Stats | Title (KR) | EN gloss | Index row |
|---|---|---|---|---|---|---|
| 76862 | dc | 2026-09-27 22:04 | v66 r0 c1 | 아니 케이크 들개때 도와줘 이면 6단계 | Help with Cake Hound pack, Rift stage 6 | `002/evidence/01-dc-arena/list-b.tsv:6` |
| 76546 | dc | 2026-09-27 11:23 | v122 r0 c3 | 이면 스텟뻥되는거 어디적용임 | Where do the Rift's inflated stats apply? | `001/evidence/02-dc-index.tsv:34` |
| 75151 | dc | 2026-09-25 | v777 r3 c10 | 차원의 이면 전섭 1 1등 으로 진입 | Entered the Dimensional Rift 1st on all servers | `001/evidence/16-top-players/02-dc-terms.tsv:82` |
| 75058 | dc | 2026-09-24 | v464 r0 c6 | 근데 이면 실질적 투력 스펙업 없으면 좆같은데 | Rift is bad if it gives no real power/spec-up | `001/evidence/02-dc-index.tsv:252` |
| 74998 | dc | 2026-09-24 | v755 r0 c9 | 어제오늘 쌔빠지게 뚫어서 이면 도착햇는데 | Ground through and reached the Rift | `001/evidence/02-dc-index.tsv:260` |
| 72425 | dc | 2026-09-22 | v180 r0 c3 | 차원의 이면도 랭킹 보는거 섭통으로 나오려나 | Will Rift rankings be cross-server? | `001/evidence/16-top-players/02-dc-terms.tsv:174` |
| 72304 | dc | 2026-09-22 | v215 r0 c0 | 차원의 이면 = 세나키 악몽이네 | Dimensional Rift = Seven Knights' nightmare mode | `002/evidence/02-dc-rumble/03-list-wagle.tsv:211` |
| 71865 | dc | 2026-09-21 | v188 r0 c3 | 설마 차원의 문에서 밀치기 면역 +돌격형 이속이 중요해지나 | Will push immunity + charge move speed matter at the "dimension gate"? | `001/evidence/18-kr-encounter/search-patterns6.tsv:15` |
| 46584 | nv | 2026-09-26 | v232 l2 c2 | 차원의 이면 도착..!!! | Reached the Dimensional Rift! | `001/evidence/16-top-players/06-nv-free-board.tsv:71` |
| 45885 | nv | 2026-09-24 | v497 l1 c10 | 차원이면 도착 | Reached the Dimensional Rift | `001/evidence/16-top-players/06-nv-free-board.tsv:296` |
| 44563 | nv | 2026-09-22 | v168 l0 c5 | 스테 확장하면 이면도 막히나..? | Will a stage expansion lock the Rift again? | `001/evidence/16-top-players/06-nv-free-board.tsv:751` |
| 44554 | nv | 2026-09-22 | v325 l4 c3 | 차원에 이면? 징징이 또나오네 | Dimensional Rift? The whiners are back | `001/evidence/16-top-players/06-nv-free-board.tsv:757` |
| 44541 | nv | 2026-09-22 | v844 l0 c14 | 차원의 이면이 각 스테이지 모두 깨면 아닌가요? | Isn't the Rift unlocked by clearing all stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:762` |
| 44500 | nv | 2026-09-22 | v744 l4 c9 | 그냥 차원의 이면 딱 그거에요 | The Dimensional Rift is exactly that | `001/evidence/16-top-players/06-nv-free-board.tsv:785` |
| 44498 | nv | 2026-09-22 | v367 l0 c2 | 차원의이면 328스테이지 클리어 조건 | Dimensional Rift unlock condition: clear stage 328 | `001/evidence/16-top-players/06-nv-free-board.tsv:787` |
| 44496 | nv | 2026-09-22 | v406 l0 c2 | 차원의 이면은 모든스테이지 다깨야가능한건가? | Does the Rift need every stage cleared? | `001/evidence/16-top-players/06-nv-free-board.tsv:788` |
| 44483 | nv | 2026-09-22 | v1281 l1 c7 | 차원의 이면 내가 잘못본거냐? 매인스테 전부 클리어 한사람만 할수있는거라고? | Rift only for those who cleared every main stage? | `001/evidence/16-top-players/06-nv-free-board.tsv:797` |

### 6.3 Other stage titles (decks, bosses, gear, rewards, difficulty)

| Post | Site | Date | Stats | Title (KR) | EN gloss | Index row |
|---|---|---|---|---|---|---|
| 76805 | dc | 2026-09-27 20:28 | v132 r0 c6 | 이거 스테장비에도 스가 섞어야하는거같은데 맞음? | Should stage gear mix in skill haste too? | `001/evidence/17-kr-highscore/all_candidates.tsv:140` (+2) |
| 76789 | dc | 2026-09-27 20:09 | v97 r0 c1 | 요줌 치케 스테나 아레나 에서 씀? | Anyone still use Cheesecake in stages or arena? | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:10` (+1) |
| 76612 | dc | 2026-09-27 13:27 | v172 r0 c1 | 색동주머니 < 얘 덕에 쿨민이 훨씬 쉬워졌어 | Candy Shade Pouch made Cool Mint (boss) much easier | `001/evidence/17-kr-highscore/q21.tsv:2` |
| 76550 | dc | 2026-09-27 11:31 | v1124 r0 c6 | 스테 연쇄덱 | stage chain deck | `002/evidence/01-dc-arena/list-b.tsv:35` |
| 76323 | dc | 2026-09-26 | v95 r0 c0 | 더이상 스테가 안 밀려 | Stages won't push any more | `001/evidence/02-dc-index.tsv:71` |
| 76213 | dc | 2026-09-26 | v232 r0 c2 | 스테 바리 위치만잡아주면 다썰어버리내 | Bari in stages shreds everything if positioned | `002/evidence/01-dc-arena/list-b.tsv:64` |
| 76206 | dc | 2026-09-26 | v293 r0 c4 | 와 이제 스테덱 렙 올리기도 빡셈; | Levelling the stage decks is getting hard | `001/evidence/18-kr-encounter/search-patterns8.tsv:7` |
| 76188 | dc | 2026-09-26 | v145 r0 c7 | 246-30 쿨민 어캐꺠?.. | Stage 246-30 Cool Mint: how to beat? | `001/evidence/02-dc-index.tsv:90` |
| 76134 | dc | 2026-09-26 | v67 r0 c0 | 식쿠, ㅈ드베리, 거미, 폭탄 광 let's go | cookie-eating plant , Redberry Assassin , spider , Bomber let's go | `001/evidence/18-kr-encounter/search-patterns7.tsv:3` |
| 76119 | dc | 2026-09-26 | v282 r0 c4 | 시커 오방 없는 뉴비 딕질문 스테, 아레나 등등 | Newbie without Seeker/Oven: deck question for stages, arena | `002/evidence/01-dc-arena/list-a.tsv:51` (+2) |
| 76051 | dc | 2026-09-26 | v430 r0 c3 | 바리덱 스테에서 답답해서 못쓰겟다 | Bari deck too frustrating to use in stages | `002/evidence/01-dc-arena/list-c.tsv:35` |
| 75975 | dc | 2026-09-26 | v1918 r0 c4 | 스테덱은 바리+체콜 같이쓸거 아니면 체콜 비추함 | Stage decks: skip Cherry Cola unless paired with Bari | `001/evidence/17-kr-highscore/all_candidates.tsv:93` (+4) |
| 75879 | dc | 2026-09-26 | v136 r0 c5 | 172-18 폭탄 광 뭐냐ㅋㅋㅋ 떡벽이네ㅅㅂ | Stage 172-18 Bomber is a brick wall | `001/evidence/18-kr-encounter/search-patterns7.tsv:4` |
| 75766 | dc | 2026-09-26 | v1813 r5 c1 | 딱히 없는 것 같아서 메모해놓는 스테/ 아레나 /토벌 장비 옵션 (조언요) | Gear-option memo for stage / arena / conquest (advice wanted) | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:63` (+4) |
| 75754 | dc | 2026-09-25 | v254 r0 c6 | 스테 아레나 토벌 장비 따로 맞추는건 언제부터 하면 됨? | When to start separate stage/arena/conquest gear? | `002/evidence/01-dc-arena/list-a.tsv:65` (+2) |
| 75678 | dc | 2026-09-25 | v3075 r3 c9 | 내가쓰는 스테용 완전오토 바리덱 | My fully-auto Bari deck for stages | `002/evidence/01-dc-arena/list-c.tsv:46` |
| 75601 | dc | 2026-09-25 | v874 r0 c15 | 바리 스테 구리다는거 바없찐들 연막이냐? | Is "Bari is bad in stages" a smokescreen? | `002/evidence/01-dc-arena/list-b.tsv:106` (+4) |
| 75588 | dc | 2026-09-25 | v448 r0 c8 | 비겁이 국가권력급 버그 를 써서 잡아라 | Beat Cowardly Cookie with a game-breaking bug | `001/evidence/16-top-players/02-dc-terms.tsv:65` |
| 75582 | dc | 2026-09-25 | v158 r0 c0 | 이거 덱이쎈거냐 스테가 좆밥인거냐 | Is this deck strong or are stages easy now? | `001/evidence/02-dc-index.tsv:180` |
| 75540 | dc | 2026-09-25 | v2212 r9 c6 | 갠적으로 이덱이 스테 오토 제일 괜찮은듯 | This deck is the best for stage auto, personally | `001/evidence/17-kr-highscore/all_candidates.tsv:70` (+2) |
| 75482 | dc | 2026-09-25 | v47 r0 c0 | 피감치저 스테용 줄까 아레나 토벌용 줄까?? | DR/crit-RES piece: stage set or arena/conquest set? | `002/evidence/01-dc-arena/list-a.tsv:78` (+2) |
| 75418 | dc | 2026-09-25 | v161 r0 c0 | 이거 아레나로낄까요 스테로낄까요 | Put this in arena or stage set? | `001/evidence/17-kr-highscore/all_candidates.tsv:64` (+4) |
| 75393 | dc | 2026-09-25 | v416 r0 c2 | 명중 700대인데 스테 잘 밀리네 | Accuracy in the 700s and stages push fine | `001/evidence/02-dc-index.tsv:204` |
| 75392 | dc | 2026-09-25 | v539 r0 c2 | 내가 미는 스테덱 공유 | Sharing the stage deck I push with | `001/evidence/16-top-players/03-dc-terms2.tsv:18` (+1) |
| 75391 | dc | 2026-09-25 | v197 r0 c0 | 님들아 와레나 랭커 들 다 아레나셋이 아니라 스테셋쓰는거 같던데 이유기뭐임 | Why do Rumble rankers use stage sets, not arena sets? | `001/evidence/16-top-players/02-dc-terms.tsv:72` (+3) |
| 75298 | dc | 2026-09-25 | v240 r0 c4 | 장비 이건 스테에 해야겠죠 | This gear goes in the stage set, right? | `002/evidence/01-dc-arena/list-b.tsv:126` |
| 75278 | dc | 2026-09-25 | v151 r0 c0 | 뭐야 아레나 셋 스테에껴도 명중 970이네 | Arena set in stages still gives 970 accuracy | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:93` |
| 75142 | dc | 2026-09-25 | v1110 r0 c2 | 일던 잡몹 많은 곳 바궁-락 스타 좋네 | Daily dungeon mob-heavy floors: Wind Archer + Rockstar good | `001/evidence/16-top-players/01-dc-names.tsv:24` |
| 75084 | dc | 2026-09-24 | v468 r0 c1 | 이제 비겁이 이게 제일 잘 밀리네 | This pushes Cowardly Cookie best now | `001/evidence/16-top-players/03-dc-terms2.tsv:23` |
| 75056 | dc | 2026-09-24 | v3815 r15 c2 | 뉴비를 위한 공략집 1편 [스테이지편] | Newbie guide part 1 [stages] | `002/evidence/02-dc-rumble/04-list-targeted.tsv:17` (+7) |
| 74936 | dc | 2026-09-24 | v362 r0 c3 | 스테는 스가 명중 피감 / 아레나 는 치확 치피 스증 ? | stage skill haste accuracy DMG reduction / arena crit rate crit DMG skill amp ? | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:123` |
| 74919 | dc | 2026-09-24 | v333 r0 c5 | 이거 스테덱 안정성 질문좀 | Stage deck stability question | `001/evidence/02-dc-index.tsv:277` |
| 74914 | dc | 2026-09-24 | v490 r0 c6 | 아레나 프리셋 이 스테 젤 잘밀린다... | Arena preset pushes stages best | `002/evidence/01-dc-arena/list-b.tsv:142` (+1) |
| 74841 | dc | 2026-09-24 | v262 r0 c2 | 프리셋은 스테/ 아레나 이렇게 두개만 해두면 되나 | Are two presets (stage / arena) enough? | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:126` |
| 74781 | dc | 2026-09-24 | v222 r0 c1 | 토벌 돌리면 스테이지 멈추지? | Does running Conquest pause stage progress? | `001/evidence/02-dc-index.tsv:295` |
| 74761 | dc | 2026-09-24 | v208 r0 c1 | 스테 연타덱 석류 빨대 시커가 못받는거 정상임? | Stage rapid-fire deck: Seeker not getting Pomegranate's beam, normal? | `001/evidence/02-dc-index.tsv:300` |
| 74612 | dc | 2026-09-24 | v77 r0 c1 | 길드 들어가용 스테투력300m | Joining a guild, stage power 300M | `001/evidence/16-top-players/02-dc-terms.tsv:92` |
| 74577 | dc | 2026-09-24 | v114 r1 c0 | 어제 업뎃후로 안쉬고 스테이지랑 반죽까는데 | Grinding stages and dough nonstop since yesterday's update | `002/evidence/02-dc-rumble/03-list-wagle.tsv:96` |
| 74344 | dc | 2026-09-24 | v1155 r0 c1 | 전섭 아레나 아까 낮부터 스테 안 밀고 덱 연구했다!!! | Skipped stages all afternoon to research Rumble decks | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:142` (+1) |
| 74342 | dc | 2026-09-24 | v740 r0 c2 | 계속 켜두니까 255스테까지 오토로 밀렸네 | Left it on; pushed to stage 255 on auto | `001/evidence/17-kr-highscore/q33.tsv:9` |
| 74292 | dc | 2026-09-24 | v1316 r0 c2 | 제발 스테덱 아레나덱 던전덱 정리좀 | Please summarise stage / arena / dungeon decks | `002/evidence/01-dc-arena/list-c.tsv:82` (+1) |
| 74291 | dc | 2026-09-24 | v161 r0 c0 | 미 룬 숙제하는데 은근 스테많이안밀리네 | Doing rune chores; stages barely push | `001/evidence/02-dc-index.tsv:346` |
| 74202 | dc | 2026-09-23 | v377 r0 c2 | 스테셋 아레나 셋 | Stage set vs arena set | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:155` |
| 74185 | dc | 2026-09-23 | v673 r0 c3 | 비겁이 오토가 ㄹㅇ개꿀이다 | Cowardly Cookie on auto is a steal | `002/evidence/01-dc-arena/list-d.tsv:47` |
| 74081 | dc | 2026-09-23 | v239 r0 c1 | 우리섭 1등 도 200 후반대 스테이지네 | Our server's #1 is only in the high 200s | `001/evidence/16-top-players/02-dc-terms.tsv:112` |
| 74055 | dc | 2026-09-23 | v149 r0 c0 | 213스테 덱 ㄱㅊ? | Stage 213 deck OK? | `001/evidence/02-dc-index.tsv:360` |
| 74014 | dc | 2026-09-23 | v351 r0 c2 | 님들 마일리지 180스테 이후로도 잘 모임? | Does mileage still accrue past stage 180? | `001/evidence/18-kr-encounter/search-patterns7.tsv:7` (+1) |
| 73889 | dc | 2026-09-23 | v690 r0 c1 | 스테, 아레나덱 추천 해주실수 있나요 ㅠㅠ | Stage and arena deck recommendations? | `002/evidence/01-dc-arena/list-c.tsv:88` (+1) |
| 73830 | dc | 2026-09-23 | v146 r0 c0 | 쿨민 진짜 가만히 서있네 | Cool Mint (boss) just stands still | `001/evidence/16-top-players/02-dc-terms.tsv:119` |
| 73823 | dc | 2026-09-23 | v316 r0 c6 | 쿨민 버그 냐 | Cool Mint (boss) bug? | `001/evidence/16-top-players/02-dc-terms.tsv:120` |
| 73821 | dc | 2026-09-23 | v60 r0 c0 | 쿨민 이새끼 왜 스킬안씀? 그냥 샌드백이노 버그 임? | Why won't boss Cool Mint use skills? Sandbag bug? | `001/evidence/16-top-players/02-dc-terms.tsv:121` |
| 73813 | dc | 2026-09-23 | v478 r0 c1 | 스테덱 추천 좀 ㅇㅇ;; | Stage deck recommendation please | `001/evidence/02-dc-index.tsv:378` |
| 73804 | dc | 2026-09-23 | v310 r0 c0 | 바리공주 스테이지 계속 써보는데 좀 애매하네 | Testing Bari in stages; a bit meh | `001/evidence/18-kr-encounter/search-patterns4.tsv:13` |
| 73776 | dc | 2026-09-23 | v110 r0 c0 | 지금 뭔지 몰라도 보스 쿨민이 좆 버그 있네 | Boss Cool Mint has a big bug right now | `001/evidence/16-top-players/02-dc-terms.tsv:123` (+3) |
| 73764 | dc | 2026-09-23 | v974 r0 c2 | 달토끼 스테는 들개빼고 아레나 는 머뺌 | Moon Rabbit: drop Cake Hound in stages; what in arena? | `002/evidence/02-dc-rumble/02-list-arena-new.tsv:183` |
| 73630 | dc | 2026-09-23 | v1007 r0 c3 | 스테 너프된것도 있긴한데 이 덱 좋은듯 | Stages were nerfed, but this deck is good too | `001/evidence/02-dc-index.tsv:385` |
| 73608 | dc | 2026-09-23 | v159 r0 c0 | 쿠린이인데 스테이지 / 아레나 덱 추천 가능한 고수 구합니다. | Newbie seeks stage/arena deck advice | `002/evidence/01-dc-arena/list-a.tsv:97` |
| 73508 | dc | 2026-09-23 | v1123 r0 c15 | 스테 연타덱 바꿀거 있음? | Anything to change in my stage rapid-fire deck? | `001/evidence/02-dc-index.tsv:395` |
| 73493 | dc | 2026-09-23 | v307 r0 c2 | 뉴비 스테 덱좀 봐주세요 ㅠㅠㅠㅠㅠㅠㅠㅠ | Newbie: please check my stage deck | `001/evidence/02-dc-index.tsv:396` |
| 73327 | dc | 2026-09-23 | v110 r0 c0 | 스테보스 허벌이노 | Stage bosses are pushovers now | `002/evidence/01-dc-arena/list-d.tsv:54` |
| 73256 | dc | 2026-09-23 | v116 r0 c0 | 비겁이 이새끼 패치이후에 갑자기 허벌보지됌 | Cowardly Cookie suddenly pushover after patch | `001/evidence/16-top-players/03-dc-terms2.tsv:54` |
| 73191 | dc | 2026-09-23 | v873 r0 c7 | 근데 달토끼가 스테에서 필수급..인가? | Is Moon Rabbit near-mandatory in stages? | `001/evidence/18-kr-encounter/search-patterns7.tsv:8` |
| 72977 | dc | 2026-09-23 | v666 r2 c18 | 회피덱으로 첫 그마 2 등반 후 마무리 | First Grand Master 2 climb with an evasion deck (arena) | `002/evidence/01-dc-arena/list-b.tsv:169` (+3) |
| 72974 | dc | 2026-09-23 | v45 r0 c0 | 달토끼로 비겁이 따먹고싶다 | Want to beat Cowardly Cookie with Moon Rabbit | `002/evidence/01-dc-arena/list-d.tsv:58` |
| 72966 | dc | 2026-09-23 | v278 r0 c3 | 이거왜 아레나 스가셋이 스테 더 잘미냐 | Why does the arena haste set push stages better? | `001/evidence/02-dc-index.tsv:424` |
| 72763 | dc | 2026-09-22 | v260 r0 c4 | 스테이지 미는 도중에 아레나장비로 바꾸면 바로 안바뀌네? | Swapping to arena gear mid-stage doesn't apply at once? | `002/evidence/01-dc-arena/list-b.tsv:178` |
| 72717 | dc | 2026-09-22 | v119 r1 c3 | 뉴비 38-30 덱좀 도와줘 ㅠㅠ | Newbie: help with 38-30 deck | `001/evidence/16-top-players/03-dc-terms2.tsv:59` |
| 72688 | dc | 2026-09-22 | v232 r0 c3 | 스테이지에서 장비 적용 되는거 맞음? | Does gear actually apply in stages? | `001/evidence/02-dc-index.tsv:442` |
| 72681 | dc | 2026-09-22 | v275 r0 c4 | 프리셋 아레나 뭐 어케맞춰야하는지좀 알려줘 스테랑 | How to set up arena vs stage presets? | `002/evidence/01-dc-arena/list-b.tsv:179` |
| 72647 | dc | 2026-09-22 | v437 r0 c5 | 메인스테 진짜 명중 필요없는건가 | Is accuracy really unneeded in main stages? | `001/evidence/02-dc-index.tsv:445` |
| 72519 | dc | 2026-09-22 | v245 r0 c5 | 스테이지 완화가 신규 성장이란 뭔 상관임 ㅋㅋㅋ | What does stage easing have to do with new growth? | `001/evidence/16-top-players/02-dc-terms.tsv:169` |
| 72329 | dc | 2026-09-22 | v318 r0 c6 | 패치후 스테밀어야지 | Pushing stages after the patch | `002/evidence/01-dc-arena/list-d.tsv:63` |
| 72268 | dc | 2026-09-22 | v79 r0 c0 | 쥐돌이 트럭 비겁이 꼴조타 | Rat bikers, Truck, Cowardly Cookie: hate them | `002/evidence/01-dc-arena/list-d.tsv:65` |
| 72147 | dc | 2026-09-22 | v105 r0 c5 | 얘들아 240-30 비겁이 왜 안깨지냐 버그 있냐 이거? | Stage 240-30 Cowardly Cookie won't die; bug? | `001/evidence/16-top-players/02-dc-terms.tsv:182` |
| 72025 | dc | 2026-09-22 | v407 r0 c2 | 스테 덱 3개 다 만렙 찍으니까 삶의 질이 달라짐 | All 3 stage decks maxed: quality of life jump | `001/evidence/02-dc-index.tsv:502` |
| 72023 | dc | 2026-09-22 | v246 r0 c2 | 스테 밀수록 사막맵이 진짜 ㅈ같네 | The desert map gets worse the further you push | `001/evidence/18-kr-encounter/search-patterns7.tsv:9` |
| 71968 | dc | 2026-09-21 | v297 r0 c3 | 스테이지 많이 밀면 전투력도 잘 올라감? | Does pushing stages raise power a lot? | `001/evidence/17-kr-highscore/q33.tsv:12` |
| 71895 | dc | 2026-09-21 | v146 r0 c2 | 쥐돌이 좆같은거 달토끼나와도 계속 불쾌할듯 | Rat bikers will stay annoying even with Moon Rabbit | `001/evidence/16-top-players/03-dc-terms2.tsv:66` |
| 71862 | dc | 2026-09-21 | v226 r0 c2 | 그나마 무한스테이지 성장컨텐츠있네 | At least there's an infinite-stage growth content | `001/evidence/16-top-players/03-dc-terms2.tsv:68` |
| 71849 | dc | 2026-09-21 | v100 r0 c7 | 3일차 누비 32스테부터 막힌다 | Day-3 newbie stuck from stage 32 | `001/evidence/18-kr-encounter/search-patterns6.tsv:16` (+1) |
| 71787 | dc | 2026-09-21 | v175 r0 c1 | 지금스테 1등 몇스테냐 | What stage is #1 at now? | `001/evidence/16-top-players/02-dc-terms.tsv:205` |
| 71657 | dc | 2026-09-21 | v262 r0 c5 | 187-30 비겁이 시발련어케깸 | Stage 187-30 Cowardly Cookie: how to beat? | `001/evidence/18-kr-encounter/search-patterns4.tsv:19` |
| 71625 | dc | 2026-09-21 | v401 r0 c4 | 스테 보상 박살난거 체감 좃댄다 | Stage rewards gutted, really felt | `001/evidence/02-dc-index.tsv:551` |
| 71622 | dc | 2026-09-21 | v208 r0 c1 | 아직 클뜯 러가 유출한 무한스테이지?인가 뭔가는 안나왔지 | The datamined "infinite stage" isn't out yet? | `001/evidence/18-kr-encounter/search-patterns5.tsv:16` |
| 71467 | dc | 2026-09-21 | v51 r0 c0 | 쥐토바이 역겹다 진짜 | Rat bikers are disgusting | `002/evidence/01-dc-arena/list-d.tsv:75` |
| 71382 | dc | 2026-09-21 | v292 r0 c2 | 애들아 스테이지 석류 빨대관련 질문 | Question on Pomegranate's beam in stages | `001/evidence/02-dc-index.tsv:595` (+1) |
| 71326 | dc | 2026-09-21 | v358 r0 c5 | 너네 스테 장비 돌릴 때 | When you roll stage gear... | `001/evidence/02-dc-index.tsv:609` |
| 71187 | dc | 2026-09-20 | v199 r0 c7 | 저거 길드 토벌덱 90스테 뉴비도 1렙 해줘? | Should a stage-90 newbie also Lv.1 the conquest deck? | `001/evidence/16-top-players/02-dc-terms.tsv:234` (+1) |
| 71087 | dc | 2026-09-20 | v296 r0 c7 | 스테도 은근 스가 필요한것같애 | Stages quietly need skill haste too | `001/evidence/17-kr-highscore/all_candidates.tsv:19` (+2) |
| 71075 | dc | 2026-09-20 | v179 r0 c3 | 비겁이 259-30 계속 막히는데 뭔 조합을 써야하지 | Stuck on 259-30 Cowardly Cookie; which comp? | `001/evidence/02-dc-index.tsv:651` |
| 71013 | dc | 2026-09-20 | v86 r0 c0 | 230m 192 비겁이 컷 | 230m 192 Cowardly Cookie cut | `001/evidence/02-dc-index.tsv:663` |
| 70973 | dc | 2026-09-20 | v598 r0 c3 | 우리 섭 1등 이 비겁 상대할 때 오방 좋다는데 | Our server #1 says Oven Wanderer is good vs Cowardly Cookie | `001/evidence/16-top-players/02-dc-terms.tsv:249` (+1) |
| 70859 | dc | 2026-09-20 | v229 r0 c4 | 쿠럼블 스테 밀 때 특 | Traits of Crumble stage pushing | `001/evidence/02-dc-index.tsv:687` (+1) |
| 70855 | dc | 2026-09-20 | v75 r0 c0 | 어쭈 쥐돌이 이씹새끼 체콜 찍기 도 피하네? | Rat bikers even dodge Cherry Cola's strike | `001/evidence/18-kr-encounter/search-patterns8.tsv:17` |
| 70852 | dc | 2026-09-20 | v172 r0 c0 | 개씨발 스테이지 프리셋 이상한거 쓰고있었네 ㅋㅋㅋㅋ | Was using the wrong stage preset all along | `001/evidence/16-top-players/02-dc-terms.tsv:256` |
| 70845 | dc | 2026-09-20 | v214 r0 c0 | 쥐 트럭 비겁 | rat bikers Truck Cowardly Cookie | `002/evidence/01-dc-arena/list-d.tsv:82` |
| 70804 | dc | 2026-09-20 | v195 r0 c3 | 가방 스테 다 밀고 써야하나? | Spend bag items only after clearing stages? | `001/evidence/02-dc-index.tsv:695` |
| 70745 | dc | 2026-09-20 | v83 r0 c0 | 비겁이 한시간 정도 리트 하는건 걍 힐링체험 이네 | An hour of retries on Cowardly Cookie is "healing" | `001/evidence/16-top-players/03-dc-terms2.tsv:88` |
| 70582 | dc | 2026-09-19 | v58 r0 c0 | 스테 프리셋은 피감 명중에 뭐챙김? | Stage preset: DR, accuracy, what else? | `001/evidence/18-kr-encounter/search-patterns4.tsv:29` |
| 70514 | dc | 2026-09-19 | v454 r3 c20 | 현 268스테인데 | Currently at stage 268 | `001/evidence/16-top-players/02-dc-terms.tsv:268` |
| 70219 | dc | 2026-09-19 | v285 r0 c2 | 스테이지나 토벌 에는 치저 무의미 아님?? | Isn't crit RES useless in stages and conquest? | `001/evidence/02-dc-index.tsv:783` |
| 70173 | dc | 2026-09-19 | v213 r0 c3 | 쪼렙구간 쿨민이 얘 기가 막힌 조합 있음? | Any great comp for low-level Cool Mint (boss)? | `001/evidence/02-dc-index.tsv:796` (+1) |
| 70033 | dc | 2026-09-18 | v410 r0 c7 | 235-10 쥐토바이 씹련들카앗!!!! | Stage 235-10 rat bikers rant | `001/evidence/16-top-players/03-dc-terms2.tsv:100` |
| 69969 | dc | 2026-09-18 | v57 r0 c0 | 비겁 이새끼는 너프먹은건지도 모르겠네 | Can't tell if Cowardly Cookie got nerfed | `001/evidence/16-top-players/03-dc-terms2.tsv:102` |
| 69948 | dc | 2026-09-18 | v241 r0 c5 | 264-20 명중 600으로 미는중인데 | Pushing 264-20 with 600 accuracy | `002/evidence/01-dc-arena/list-b.tsv:210` |
| 69594 | dc | 2026-09-18 | v280 r0 c5 | 나 399서번데 스테 254 돌고 있거든? | Server 399, running stage 254 | `001/evidence/16-top-players/02-dc-terms.tsv:310` |
| 69380 | dc | 2026-09-17 | v290 r0 c1 | 아레나 장비 에서 스테이지 장비로 바꾸니 점수 1G떨어짐..;; | Arena gear to stage gear dropped my score 1G | `002/evidence/01-dc-arena/list-b.tsv:220` |
| 69364 | dc | 2026-09-17 | v79 r0 c0 | 비겁이 싫어 바요 내놔 | Hate Cowardly Cookie, give me Bari | `001/evidence/16-top-players/01-dc-names.tsv:73` |
| 69334 | dc | 2026-09-17 | v134 r0 c0 | 브시커 아레나 토벌 전 스테 다 스가가 좋은거임? | Brightseeker: skill haste best in arena, conquest, stages? | `001/evidence/02-dc-index.tsv:934` |
| 69297 | dc | 2026-09-17 | v128 r0 c0 | 184-30 비겁이 못잡겠다 | Can't beat 184-30 Cowardly Cookie | `002/evidence/01-dc-arena/list-d.tsv:86` |
| 69272 | dc | 2026-09-17 | v317 r0 c2 | 쥐토바이 체콜덱 질문 | rat bikers Cherry Cola deck question | `001/evidence/18-kr-encounter/search-patterns8.tsv:25` (+2) |
| 69176 | dc | 2026-09-17 | v91 r0 c0 | 272-30 비겁 또 떡벽이네 시발거 | Stage 272-30 Cowardly Cookie another brick wall | `001/evidence/16-top-players/03-dc-terms2.tsv:127` |
| 69125 | dc | 2026-09-17 | v98 r0 c0 | 180스테 개촙늅 마일리지 살거 추천점 | Stage-180 newbie: what to buy with mileage? | `001/evidence/02-dc-index.tsv:969` (+1) |
| 69121 | dc | 2026-09-17 | v370 r1 c12 | 나만 비겁이보다 쿨민 리트를 많이하나 | Am I the only one retrying Cool Mint more than Cowardly? | `001/evidence/16-top-players/03-dc-terms2.tsv:131` |
| 69032 | dc | 2026-09-17 | v1056 r1 c12 | 13:35수정) 경던덱 오토덱 공유 | EXP-dungeon auto deck share (edited 13:35) | `001/evidence/16-top-players/03-dc-terms2.tsv:132` (+1) |
| 69004 | dc | 2026-09-17 | v293 r1 c3 | 근데 다음 tssr 비겁이라고 하지않음? | Isn't the next TSSR said to be Cowardly Cookie? | `001/evidence/18-kr-encounter/search-patterns5.tsv:27` |
| 68869 | dc | 2026-09-17 | v99 r0 c0 | 이거 스테 조합 ㄱㅊ? | Is this stage comp OK? | `001/evidence/02-dc-index.tsv:994` |
| 68782 | dc | 2026-09-17 | v270 r0 c0 | 경던 오토덱 조합 | EXP dungeon auto deck comp | `001/evidence/02-dc-index.tsv:1003` |
| 68767 | dc | 2026-09-17 | v163 r0 c1 | 용병4렙이랑 3렙이랑 스테난이도 2배차이임 | Merc band Lv4 vs Lv3: a 2× difference in stage difficulty | `001/evidence/18-kr-encounter/search-patterns7.tsv:22` |
| 68739 | dc | 2026-09-17 | v130 r0 c2 | 3일차 뉴비 37-22에서 조금씩 더뎌지는데 | Day-3 newbie slowing at 37-22 | `001/evidence/17-kr-highscore/q33.tsv:24` |
| 68638 | dc | 2026-09-16 | v337 r0 c16 | 40스테 좆뉴빈데 고뽑 털이 ㄱㄱ? | Stage-40 newbie: spend premium pulls? | `001/evidence/02-dc-index.tsv:1011` |
| 68637 | dc | 2026-09-16 | v250 r0 c4 | 오븐까다 보면 스테에서 쿠키 죽어있는데 팁좀 ㅜ | Cookies dead in stages while opening the oven; tips? | `001/evidence/16-top-players/03-dc-terms2.tsv:137` |
| 68617 | dc | 2026-09-16 | v86 r0 c0 | 아레나 프리셋 업그레이드하는거 스테에 비해 아깝네 | Upgrading the arena preset feels wasteful vs stage | `002/evidence/01-dc-arena/list-b.tsv:235` |
| 68341 | dc | 2026-09-16 | v426 r0 c4 | 쿨민 레버 돌리기 알려준놈 ㅈㄴ 고맙다 | Thanks to whoever taught the Cool Mint lever-spin | `001/evidence/10-dc-index-extra.tsv:64` (+3) |
| 68247 | dc | 2026-09-16 | v55 r0 c0 | 비겁 십알련은 스킬 쿨타임만 있어도 쉬울 거 같은데 | Cowardly Cookie would be easy with just a skill cooldown | `001/evidence/16-top-players/01-dc-names.tsv:83` |
| 68044 | dc | 2026-09-15 | v262 r0 c4 | 260스테 폭탄 병 딜뭐냐 | What's the Bomber's damage at stage 260? | `001/evidence/18-kr-encounter/search-patterns7.tsv:26` |
| 68015 | dc | 2026-09-15 | v138 r0 c0 | 스테덱이랑 아레나덱 추천좀요 | Stage and arena deck recommendations | `002/evidence/01-dc-arena/list-c.tsv:125` |
| 67923 | dc | 2026-09-15 | v175 r0 c0 | 192-30 / 207.4m | Stage 192-30 / 207.4m | `001/evidence/17-kr-highscore/q33.tsv:27` |
| 67841 | dc | 2026-09-15 | v125 r0 c2 | 이번 업뎃때 방치보상으로 저 선물상자 추가해주려나? | Will idle rewards add that gift box this update? | `001/evidence/18-kr-encounter/search-patterns7.tsv:31` |
| 67805 | dc | 2026-09-15 | v107 r0 c1 | 179-30 비겁 너무 아픈데 ㅆㅂ? | Stage 179-30 Cowardly Cookie hits too hard | `001/evidence/16-top-players/03-dc-terms2.tsv:144` |
| 67739 | dc | 2026-09-15 | v66 r0 c1 | 35 비겁이 ㅈ같네 | 35% Cowardly Cookie is awful | `001/evidence/16-top-players/03-dc-terms2.tsv:146` |
| 67720 | dc | 2026-09-15 | v288 r0 c1 | 248-30 컷 | Stage 248-30 cut | `001/evidence/16-top-players/03-dc-terms2.tsv:147` |
| 67483 | dc | 2026-09-15 | v626 r0 c6 | 쿨민이 젤 쉬운거같은데 | Cool Mint (boss) seems the easiest | `001/evidence/16-top-players/03-dc-terms2.tsv:153` |
| 67407 | dc | 2026-09-15 | v231 r0 c0 | 비겁이 2트 ㅅㅅ | Cowardly Cookie in 2 tries | `001/evidence/16-top-players/03-dc-terms2.tsv:155` |
| 67322 | dc | 2026-09-14 | v295 r0 c2 | 뉴비 쿨민이에서 막힘... | newbie Cool Mint stuck ... | `001/evidence/16-top-players/01-dc-names.tsv:89` (+1) |
| 67192 | dc | 2026-09-14 | v571 r0 c12 | 사실 처음엔 168스테 이전 보상<<ㅈㄴ많은거 아닌가 싶었는데 | Pre-168 stage rewards seemed too generous at first | `001/evidence/17-kr-highscore/q33.tsv:30` |
| 67132 | dc | 2026-09-14 | v278 r0 c3 | 스테나 토벌 에서 진짜 시커3성이 밀키10성보다쌔냐? | Is 3★ Seeker really stronger than 10★ Milky Way in stages/conquest? | `001/evidence/02-dc-index.tsv:1174` |
| 67112 | dc | 2026-09-14 | v169 r0 c2 | 이겜 방치보상은 상자랑 슈가 룬 티켓외 미만잡것들임 | Idle rewards are junk except chests and rune tickets | `001/evidence/02-dc-index.tsv:1178` |
| 67105 | dc | 2026-09-14 | v160 r0 c1 | 방치형게임이라면서 방치보상 ㅂㅅ인것도 있는데 | Idle game with poor idle rewards | `001/evidence/02-dc-index.tsv:1180` |
| 67021 | dc | 2026-09-14 | v660 r0 c8 | 뉴비 스테덱 아레나덱 조언좀요 ㅜ | Newbie: stage/arena deck advice | `002/evidence/01-dc-arena/list-a.tsv:121` (+1) |
| 66997 | dc | 2026-09-14 | v74 r0 c0 | 스테장비는 어케맞춤 | How to set stage gear? | `002/evidence/01-dc-arena/list-b.tsv:245` |
| 66946 | dc | 2026-09-14 | v908 r0 c1 | 스테덱 이거 맞음? | Is this stage deck right? | `001/evidence/16-top-players/03-dc-terms2.tsv:165` |
| 66940 | dc | 2026-09-14 | v339 r0 c7 | 쥐돌이 안깨져서 공략 이것저것 찾아보는데 | Can't beat rat bikers; searching guides | `001/evidence/16-top-players/03-dc-terms2.tsv:166` |
| 66932 | dc | 2026-09-14 | v591 r0 c1 | 오토덱 이거 좋네 | This auto deck is good | `001/evidence/02-dc-index.tsv:1202` |
| 66906 | dc | 2026-09-14 | v226 r0 c0 | 이터널 장비 맞출때까지는 스테이지 장비 보강해주는게좋지? | Keep upgrading stage gear until Eternal gear? | `001/evidence/02-dc-index.tsv:1208` |
| 66783 | dc | 2026-09-14 | v288 r0 c1 | 너네 토벌 덱이랑 스테덱이랑 투력 얼마차이남? | Power gap between your conquest and stage decks? | `001/evidence/02-dc-index.tsv:1225` |
| 66778 | dc | 2026-09-14 | v250 r0 c1 | 쿨민 감초 슈가 룬 뭐줘 | Runes for Cool Mint and Licorice (auto deck)? | `001/evidence/02-dc-index.tsv:1227` |
| 65788 | dc | 2026-09-12 | v256 r0 c0 | 현 스테덱 토벌 덱 좀 알려주세요 | Current stage and conquest decks? | `001/evidence/10-dc-index-extra.tsv:195` |
| 65616 | dc | 2026-09-12 | v79 r0 c0 | 체콜 어차피 스테이지니 걍 공증 줌? | Cherry Cola is for stages anyway, so just ATK%? | `001/evidence/10-dc-index-extra.tsv:211` |
| 65410 | dc | 2026-09-12 | v62 r0 c0 | 토벌 돌리는 동안에도 스테 자동보상은 쌓이지? | Do stage auto rewards accrue during Conquest? | `001/evidence/10-dc-index-extra.tsv:224` |
| 65184 | dc | 2026-09-12 | v321 r0 c2 | 스테장비 --> 토벌 /아레나 장비 넘어가는 기준이 머노? | When to move from stage gear to conquest/arena gear? | `001/evidence/10-dc-index-extra.tsv:255` |
| 64806 | dc | 2026-09-11 | v3805 r27 c13 | 유저가 스테 징징거린다고해서 그걸 유저탓이라고 볼수없지 | Stage complaints aren't the users' fault | `001/evidence/02-dc-index.tsv:1266` (+1) |
| 64687 | dc | 2026-09-11 | v200 r0 c1 | 늅인데 스테덱은 공격력 순서 상관없이 풀렙 맞추나요? | Newbie: stage decks all max level regardless of ATK order? | `001/evidence/10-dc-index-extra.tsv:295` |
| 63310 | dc | 2026-09-10 | v618 r0 c6 | 우리서버는 스테랭킹 17위가 아레나 2위임 | Our server's stage #17 is arena #2 | `001/evidence/10-dc-index-extra.tsv:360` |
| 63144 | dc | 2026-09-10 | v474 r0 c8 | 스테에서도 전투력순위 우유 피겨 마카롱 순으로 1,2,3순위 줘야해? | In stages too, ATK order Milk > Skating Queen > Macaron? | `001/evidence/10-dc-index-extra.tsv:361` |
| 61791 | dc | 2026-09-08 | v297 r0 c8 | 100스테 뉴비 데려갈 갤길 있나요 | Any gallery guild for a stage-100 newbie? | `001/evidence/10-dc-index-extra.tsv:398` |
| 61784 | dc | 2026-09-08 | v3207 r29 c21 | 스테이지를 전부 화산맵 같이 바꿔야 함 | All stages should be like the volcano map | `001/evidence/02-dc-index.tsv:1313` (+1) |
| 61760 | dc | 2026-09-08 | v310 r0 c3 | 무좆금 201스테 후기 | F2P stage 201 review | `001/evidence/10-dc-index-extra.tsv:403` |
| 61511 | dc | 2026-09-08 | v123 r0 c0 | 스테 프리셋에 토벌 셋에 필요하던 거 떴네 | Got a conquest-set piece in the stage preset | `001/evidence/10-dc-index-extra.tsv:415` |
| 60990 | dc | 2026-09-07 | v2695 r13 c7 | 296섭)신쿠나오면 스텔라8인데 스테확장안하면 | Server 296: new cookie means Stella 8, but no stage expansion | `001/evidence/02-dc-index.tsv:1327` (+1) |
| 60902 | dc | 2026-09-07 | v101 r0 c0 | 스테이지는 안밀리고 임플란트랑 일던 다돌았고 토벌 은 끝났고 | Stages stalled; implant and dailies done; conquest over | `001/evidence/10-dc-index-extra.tsv:447` |
| 60626 | dc | 2026-09-06 | v122 r0 c0 | 스테 아레나 토벌 컨텐츠마다 장비 맞춰야되는데 | Need separate gear for stage, arena, conquest | `001/evidence/10-dc-index-extra.tsv:488` |
| 60406 | dc | 2026-09-06 | v201 r0 c0 | ㅋㅋㅋ시발 방구석찐따들이 나가지도않고 스테나 밀고있노 | Shut-ins pushing stages instead of going out | `001/evidence/10-dc-index-extra.tsv:542` |
| 59378 | dc | 2026-09-04 | v170 r0 c3 | 토벌 ,아레나,스테,크럼블 세팅 따로할수있게 해주지 | Let us save separate conquest/arena/stage/crumble setups | `001/evidence/10-dc-index-extra.tsv:644` |
| 59262 | dc | 2026-09-04 | v720 r0 c4 | 214스테까지오면서 JOAT 보스 | JOAT boss on the way to stage 214 | `001/evidence/10-dc-index-extra.tsv:663` |
| 58888 | dc | 2026-09-04 | v227 r0 c1 | 어떻게 스테 토벌 아레나 크럼블 다 랜덤기도메타냐 | Stages, conquest, arena, crumble are all RNG prayer | `001/evidence/10-dc-index-extra.tsv:715` |
| 58271 | dc | 2026-09-03 | v687 r2 c10 | 축복6 248-30 입성 ㅅㅅㅅㅅㅅ | Blessing 6, reached 248-30 | `001/evidence/10-dc-index-extra.tsv:810` |
| 57740 | dc | 2026-09-02 | v340 r0 c4 | 하루에 60스테씩만 미니까 즐거움 | Pushing only 60 stages a day keeps it fun | `001/evidence/10-dc-index-extra.tsv:828` |
| 57401 | dc | 2026-09-02 | v66 r0 c0 | 속성피해는 스테이지 밀때도 유효함? | Does element damage count when pushing stages? | `001/evidence/10-dc-index-extra.tsv:840` |
| 56872 | dc | 2026-09-01 | v301 r2 c2 | 방치형인데 스테이지를 이렇게 통제하는 게 이해가 안되네 | Idle game, yet stages are this gated | `001/evidence/10-dc-index-extra.tsv:863` |
| 56630 | dc | 2026-09-01 | v340 r0 c2 | 227-10에서 코인 1천시간치 깐 결과 | Result of opening 1,000 hours of coins at 227-10 | `001/evidence/10-dc-index-extra.tsv:888` |
| 56577 | dc | 2026-09-01 | v166 r0 c3 | 실론 이 비겁이랑 쿨민한테만이라도 적용됐으면 | Wish Tea Knight applied at least vs Cowardly Cookie and Cool Mint | `001/evidence/10-dc-index-extra.tsv:897` |
| 56571 | dc | 2026-09-01 | v373 r0 c3 | 실론은 스테이지에서 안씀? | Tea Knight not used in stages? | `001/evidence/10-dc-index-extra.tsv:900` |
| 56565 | dc | 2026-09-01 | v248 r1 c2 | 아 미친 7-6스텔라한다고 급발진 스텔라코인다샀는데 | Bought all stella coins for 7-6 Stella | `001/evidence/10-dc-index-extra.tsv:901` |
| 54999 | dc | 2026-08-31 | v116 r7 c0 | 그냥 난이도를 더 올려놨으면 스테보상 유지해도 상관없는거아님? | Harder stages would have been fine if rewards stayed | `001/evidence/10-dc-index-extra.tsv:951` |
| 54665 | dc | 2026-08-31 | v4651 r12 c18 | [안내] 신규 스테이지 퀘스트 보상 개편 및 향후 적용 계획 안내 | [Notice] New-stage quest reward revamp and plan (repost) | `002/evidence/01-dc-arena/list-rec.tsv:288` (+1) |
| 54656 | dc | 2026-08-31 | v1727 r13 c8 | 스테보상에 연구석 넣기만해봐라 | Don't you dare put research stones in stage rewards | `001/evidence/02-dc-index.tsv:1441` (+1) |
| 54439 | dc | 2026-08-31 | v668 r0 c4 | 토벌 치케덱으로 스테뚫어라 ㅈ된다 그냥 | Pushing stages with the conquest Cheesecake deck is great | `001/evidence/10-dc-index-extra.tsv:986` |
| 54119 | dc | 2026-08-31 | v322 r0 c3 | 실론 스테에선 안쓰는게 맞나? | Tea Knight not for stages, right? | `001/evidence/10-dc-index-extra.tsv:1024` |
| 53619 | dc | 2026-08-30 | v4155 r17 c36 | 248-30 덱 공유좀 어케들 꺳냐 ??.. | Stage 248-30 deck share? How did you clear? | `001/evidence/02-dc-index.tsv:1459` |
| 53400 | dc | 2026-08-30 | v7015 r10 c27 | 185-200스테이지 등반덱 공유 | Stage 185-200 stage climb deck share | `001/evidence/02-dc-index.tsv:1461` |
| 52099 | dc | 2026-08-29 | v1172 r18 c4 | 멍청해서 나쁜짓 못한다면 스테너프는 그럼 손가락 실수노? | If stage nerf wasn't malice, a finger slip? | `001/evidence/02-dc-index.tsv:1482` |
| 51713 | dc | 2026-08-29 | v128 r0 c0 | 쿨민 펫 판다넣으니까 걍 개좃밥인데? | Cool Mint (boss) trivial with Panda pet | `001/evidence/10-dc-index-extra.tsv:1126` |
| 50859 | dc | 2026-08-28 | v410 r0 c2 | 실론 나이트 스테 보스에서도 쓸만함? | Is Tea Knight useful vs stage bosses? | `001/evidence/10-dc-index-extra.tsv:1166` |
| 50473 | dc | 2026-08-28 | v6476 r16 c18 | [안내] 신규 스테이지 퀘스트 보상 관련 향후 대응 방향 안내 | [Notice] Follow-up on new-stage quest rewards (repost) | `001/evidence/02-dc-index.tsv:1522` |
| 50153 | dc | 2026-08-28 | v5326 r22 c20 | 스테보상 과했던거 맞습니다 | Stage rewards were excessive, agreed | `001/evidence/02-dc-index.tsv:1526` |
| 49967 | dc | 2026-08-28 | v2496 r26 c1 | 스테보상 많은건 ㅇㅈ | Stage rewards are plentiful, admittedly | `001/evidence/02-dc-index.tsv:1533` |
| 49940 | dc | 2026-08-28 | v2501 r18 c0 | 연구석 방치 수급량 크럼블 던전 보상 | Research-stone idle yield vs Crumble Dungeon rewards | `001/evidence/02-dc-index.tsv:1535` |
| 49249 | dc | 2026-08-28 | v4868 r35 c20 | 스테보상 뒤로가면 반토막도아니고 -97% | Later stage rewards cut not by half but -97% | `001/evidence/02-dc-index.tsv:1555` |
| 48515 | dc | 2026-08-27 | v3617 r24 c8 | 스테재화너프는 걍 이렇게넘어가는건가 | Stage currency nerf just gets a pass? | `001/evidence/02-dc-index.tsv:1562` |
| 48054 | dc | 2026-08-27 | v197 r0 c0 | 토벌 전 덱 테스트해 보고 있는데 나만 스테 자꾸 멈추냐? | Testing conquest decks; stages keep pausing? | `001/evidence/10-dc-index-extra.tsv:1230` |
| 47781 | dc | 2026-08-27 | v4997 r28 c8 | 진짜 스테보상 너프해라 더 어렵게 만들어라 노래부르던 새기들 | Those who begged for stage reward nerfs | `001/evidence/02-dc-index.tsv:1570` |
| 47534 | dc | 2026-08-27 | v235 r0 c0 | 스테연타덱 아레나덱 토벌 덱 연구소장없냐 | Stage rapid-fire / arena / conquest deck researchers? | `001/evidence/10-dc-index-extra.tsv:1253` |
| 47407 | dc | 2026-08-27 | v2246 r0 c0 | 토벌 이거 걍 스테조합 들고가면되나? | Can I just take the stage comp to Conquest? | `001/evidence/10-dc-index-extra.tsv:1264` |
| 47383 | dc | 2026-08-27 | v1765 r0 c0 | 피노누아 아레나랑 스테이지 둘다 좋은이유 | Why Pinot Noir is good in both arena and stages | `001/evidence/10-dc-index-extra.tsv:1271` |
| 44825 | dc | 2026-08-26 | v5187 r22 c28 | 80스테나 늘려준다고?! | They're adding 80 stages?! | `001/evidence/02-dc-index.tsv:1608` |
| 43512 | dc | 2026-08-25 | v12593 r23 c90 | 망치 오토덱 만든 갤럼인데 | Made a Choco Werehound Princess auto deck | `001/evidence/02-dc-index.tsv:1617` |
| 35313 | dc | 2026-08-17 | v27410 r35 c60 | 스펙 되는 사람이 쓰기 좋은 스테덱 3개통합 버전 | Merged 3-in-1 stage deck for well-specced players | `001/evidence/02-dc-index.tsv:1682` |
| 35023 | dc | 2026-08-17 | v15309 r14 c27 | 스테 등반 덱 + 보스별 조작 팁 | Stage climbing deck + per-boss control tips | `001/evidence/02-dc-index.tsv:1683` |
| 34060 | dc | 2026-08-16 | v17187 r23 c20 | [이거 공략쓴다고 몇시간동안 연구했다]110단 이상 고스테 쿨링민트 공략 | Cool Mint guide for high stages 110+ | `001/evidence/02-dc-index.tsv:1687` |
| 25258 | dc | 2026-08-12 | v9407 r10 c2 | 무과금용 44-10, 45-30, 46-20, 46-30, 48-30 | F2P 44-10, 45-30, 46-20, 46-30, 48-30 | `001/evidence/02-dc-index.tsv:1750` |
| 24715 | dc | 2026-08-11 | v10940 r15 c14 | 스테이지 주차 보상 정리☜ | stage parking rewards summary ☜ | `001/evidence/02-dc-index.tsv:1756` |
| 24544 | dc | 2026-08-11 | v1131 r10 c5 | 스테이지 진행 무한 2배속 버그 | Infinite 2× speed bug in stage progress | `001/evidence/02-dc-index.tsv:1759` |
| 22637 | dc | 2026-08-10 | v4328 r11 c0 | 스테 막힌김에 써보는 sr이하 유용한쿠키들 | Useful SR-and-below cookies (stuck in stages) | `001/evidence/02-dc-index.tsv:1779` |
| 21780 | dc | 2026-08-10 | v7817 r48 c42 | 168-30 클리어 갤최초냐 ? | First 168-30 clear on the gallery? | `001/evidence/02-dc-index.tsv:1788` |
| 18079 | dc | 2026-08-08 | v5808 r27 c29 | 146스테이지 통제합니노 | Stage 146 is gated | `001/evidence/02-dc-index.tsv:1875` |
| 46812 | nv | 2026-09-27 | v30 l1 c0 | 305-30 공략:-) | Stage 305-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:3` |
| 46809 | nv | 2026-09-27 | v218 l7 c0 | 300지 이상까지 가능한 모든 스테이지 조합 공략 | Guide: every stage comp that works to 300+ | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:4` |
| 46799 | nv | 2026-09-27 | v30 l0 c0 | 251-30 비겁이 | Stage 251-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:5` |
| 46781 | nv | 2026-09-27 | v21 l0 c0 | 262-10,20,30 레드베리 망치공주 쿨민 | Stage 262-10,20,30 Redberry Assassin Choco Werehound Princess Cool Mint | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:6` |
| 46777 | nv | 2026-09-27 | v77 l4 c4 | 304-30 공략:-) | Stage 304-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:7` |
| 46744 | nv | 2026-09-27 | v10 l0 c1 | 34-30 투력 좀 봐주실 분 계신가요 | Can someone check my power at 34-30? | `001/evidence/16-top-players/06-nv-free-board.tsv:3` |
| 46734 | nv | 2026-09-27 | v95 l1 c0 | 302-30 공략:-) | Stage 302-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:8` (+1) |
| 46727 | nv | 2026-09-27 | v63 l0 c10 | 스테이지 덱 알려주실 수 있나요? | Could you tell me a stage deck? | `001/evidence/16-top-players/06-nv-free-board.tsv:13` |
| 46714 | nv | 2026-09-27 | v47 l0 c0 | 67-30 비겁 클리어 덱 | Stage 67-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:9` (+2) |
| 46710 | nv | 2026-09-27 | v28 l0 c2 | 232-30 비겁이 덱 조언 부탁드립니다.. | Stage 232-30 Cowardly Cookie: deck advice please | `001/evidence/16-top-players/06-nv-free-board.tsv:19` |
| 46707 | nv | 2026-09-27 | v480 l9 c3 | 손컨 하기 싫어서 사용 중인 경험치 던전 오토덱 추천(580~) | EXP-dungeon auto deck I use to avoid manual control (580+) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:10` (+2) |
| 46695 | nv | 2026-09-27 | v17 l0 c0 | 64-30 비겁이 안깨짐 | Can't beat 64-30 Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:26` |
| 46675 | nv | 2026-09-27 | v105 l2 c9 | 302-20 공략:-) | Stage 302-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:11` (+2) |
| 46672 | nv | 2026-09-27 | v135 l0 c6 | [📝여론조사] 다들 스테이지 어디까지 깼나요? | [Poll] How far has everyone cleared? | `001/evidence/16-top-players/06-nv-free-board.tsv:33` |
| 46666 | nv | 2026-09-27 | v92 l0 c0 | 스테이지 바리 손컨 운영법 | Manual-control play for Bari in stages | `001/evidence/16-top-players/06-nv-free-board.tsv:36` |
| 46662 | nv | 2026-09-27 | v196 l0 c4 | 슬슬 스테에서 돌격덱 쓰기 힘듦.... | Charge decks getting hard to use in stages | `001/evidence/16-top-players/06-nv-free-board.tsv:38` |
| 46659 | nv | 2026-09-27 | v111 l5 c1 | 302-10 공략:-) | Stage 302-10 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:12` (+2) |
| 46643 | nv | 2026-09-27 | v239 l5 c8 | 301-20 공략:-) | Stage 301-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:14` (+2) |
| 46601 | nv | 2026-09-27 | v306 l6 c5 | 레드베리 암살자 공략 (302-18) | Redberry Assassin guide (302-18) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:17` (+2) |
| 46597 | nv | 2026-09-27 | v881 l24 c7 | 요즘 쓰는 스테이지 미는 덱 | The deck I push stages with lately | `001/evidence/16-top-players/06-nv-free-board.tsv:64` |
| 46587 | nv | 2026-09-26 | v78 l0 c1 | 광제유저 220스테이지 도착.. | Gwangje-pass user reached stage 220 | `001/evidence/16-top-players/06-nv-free-board.tsv:69` |
| 46565 | nv | 2026-09-26 | v108 l0 c11 | 83-30 스치면 죽어요ㅜㅜ | Stage 83-30: die at a graze | `001/evidence/16-top-players/06-nv-free-board.tsv:81` |
| 46554 | nv | 2026-09-26 | v63 l0 c0 | 스테이지 190 인데 명중 830대입니다 장비 뭐고를까요? | Stage 190 with 830 accuracy: which gear? | `001/evidence/16-top-players/06-nv-free-board.tsv:86` |
| 46544 | nv | 2026-09-26 | v919 l6 c3 | (현스테 578)이야 막깨진다.. 경던 경험치던전 공략, 치빠치빠가 돌아왔다 | (Stage 578) EXP-dungeon guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:24` (+2) |
| 46543 | nv | 2026-09-26 | v83 l0 c0 | 222-10 레드베리 암살자 클리어덱 기록 | Stage 222-10 Redberry Assassin clear deck record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:25` (+2) |
| 46533 | nv | 2026-09-26 | v175 l0 c0 | 256-30 비겁이 클리어덱 | Stage 256-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:26` (+2) |
| 46528 | nv | 2026-09-26 | v64 l0 c0 | 3번 보스 : 쿨링민트 쿠키 (2) | Boss #3: Cool Mint Cookie (2) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:27` (+2) |
| 46500 | nv | 2026-09-26 | v91 l2 c0 | 254-30 쿨민 클리어덱 | Stage 254-30 Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:29` (+2) |
| 46477 | nv | 2026-09-26 | v564 l0 c5 | 스테 다민사람들 대단.. | Respect to those who cleared all stages | `001/evidence/16-top-players/06-nv-free-board.tsv:116` |
| 46467 | nv | 2026-09-26 | v209 l0 c5 | (후발서버)바리 스테용 덱 조언 부탁드려요. | (Late server) Bari stage deck advice | `001/evidence/16-top-players/06-nv-free-board.tsv:121` |
| 46413 | nv | 2026-09-26 | v50 l0 c0 | 43-30 비겁한 쿠키 | Stage 43-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:33` (+2) |
| 46406 | nv | 2026-09-26 | v139 l0 c4 | 스테이지 명중 집중 관련해서 질문 있어요~ | Question on stage accuracy/focus | `001/evidence/16-top-players/06-nv-free-board.tsv:144` |
| 46403 | nv | 2026-09-26 | v48 l1 c1 | 59-30 비겁 클리어덱 ( + 60-10 독수리 덱 동일 ) | Stage 59-30 Cowardly Cookie clear deck (+ same for 60-10 Eagle) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:34` (+2) |
| 46398 | nv | 2026-09-26 | v28 l0 c0 | 43-20 폭주단 트럭 | Stage 43-20 Rowdy Truck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:35` (+2) |
| 46395 | nv | 2026-09-26 | v126 l1 c0 | 248-30 비겁이 클리어덱 | Stage 248-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:36` (+2) |
| 46377 | nv | 2026-09-26 | v36 l0 c0 | 43-10 폭주단바이커 | Stage 43-10 Rowdy Biker | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:37` (+2) |
| 46369 | nv | 2026-09-26 | v34 l1 c0 | 59-20 귀찮은 트럭 클리어덱 공략법 | Stage 59-20 annoying Truck clear deck guide | `001/evidence/05-nv-guide-board-index.tsv:31` (+2) |
| 46367 | nv | 2026-09-26 | v35 l0 c7 | 32-20 근처이신분들 | Anyone near 32-20? | `001/evidence/16-top-players/06-nv-free-board.tsv:154` |
| 46357 | nv | 2026-09-26 | v26 l0 c0 | 152층 비겁이 | Cowardly Cookie at 152 | `001/evidence/05-nv-guide-board-index.tsv:34` (+2) |
| 46348 | nv | 2026-09-26 | v2269 l51 c18 | 스테이지 기본 덱 공략 | Basic stage deck guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:42` (+2) |
| 46326 | nv | 2026-09-26 | v94 l0 c3 | 장비 능력 스테이지에선 적용이 안 되나요? | Does gear not apply in stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:170` |
| 46317 | nv | 2026-09-26 | v82 l0 c0 | 폭탄광 기록 | Bomber record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:43` (+2) |
| 46263 | nv | 2026-09-25 | v92 l0 c0 | 246-30 쿨민 클리어덱 | Stage 246-30 Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:47` (+2) |
| 46259 | nv | 2026-09-25 | v1334 l10 c0 | 귀여운소과금러의 바리공주를 사용하는 스테이지덱 | Light spender's stage deck using Princess Bari | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:48` (+2) |
| 46225 | nv | 2026-09-25 | v154 l0 c0 | 스테이지 너프 이후 | After the stage nerf | `001/evidence/16-top-players/06-nv-free-board.tsv:198` |
| 46206 | nv | 2026-09-25 | v513 l1 c3 | 스테이지는 아레나 덱이 가장 잘 밀리는 것 같다 | Arena decks push stages best | `001/evidence/16-top-players/06-nv-free-board.tsv:204` |
| 46202 | nv | 2026-09-25 | v2800 l79 c14 | 스테이지 덱 및 컨트롤 공략 | Stage deck and control guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:54` (+2) |
| 46195 | nv | 2026-09-25 | v132 l0 c5 | 뉴비 스테이지 덱 및 방향성 조언 부탁드립니다.. | Newbie: stage deck and direction advice | `001/evidence/16-top-players/06-nv-free-board.tsv:207` |
| 46163 | nv | 2026-09-25 | v4038 l118 c19 | 내가 만든 스테이지종결덱인데(수정) | My "end-game" stage deck (edited) | `001/evidence/16-top-players/06-nv-free-board.tsv:215` |
| 46107 | nv | 2026-09-25 | v147 l1 c0 | 243-30 비겁이 클리어덱 | Stage 243-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:57` (+2) |
| 46039 | nv | 2026-09-25 | v300 l1 c6 | 스테이지 덱 한번만 봐주시면 감사하겠습니당 | Please check my stage deck once | `001/evidence/16-top-players/06-nv-free-board.tsv:248` |
| 46033 | nv | 2026-09-25 | v191 l0 c3 | 저만 스테이지 깨기 어려운가요?(늅) | Is it just me finding stages hard? (newbie) | `001/evidence/16-top-players/06-nv-free-board.tsv:251` |
| 46029 | nv | 2026-09-25 | v127 l0 c1 | 스테무기 바꾸면 7m오르는데 바꿀까요 | Stage weapon swap gives +7M; swap? | `001/evidence/16-top-players/06-nv-free-board.tsv:252` |
| 46027 | nv | 2026-09-25 | v53 l0 c5 | 도대체 보스스테이지에 잡몹이 왜 나오는 거죠 | Why do mobs appear in boss stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:253` |
| 46019 | nv | 2026-09-25 | v941 l3 c7 | 열심히하는유저입니다 전투력 1G 68m 429k 달성  찐 무과금 노광제 스테이지덱 방치2일차  쿨민  막힘 | F2P no Gwangje: 1.068G power, day 2 idling, stuck on Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:256` |
| 46012 | nv | 2026-09-25 | v59 l0 c0 | 51-10 쥐토바이 클리어덱 공유 | Stage 51-10 rat bikers clear deck share | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:60` (+2) |
| 45990 | nv | 2026-09-25 | v95 l0 c0 | 168스테이후로 스테보상 90퍼이상 급감합니다 | Stage rewards drop over 90% after 168 | `001/evidence/16-top-players/06-nv-free-board.tsv:262` |
| 45984 | nv | 2026-09-25 | v161 l0 c1 | 고수 형님들 스테이지 덱 조언 부탁드립니다 | Stage deck advice please | `001/evidence/16-top-players/06-nv-free-board.tsv:263` |
| 45978 | nv | 2026-09-25 | v245 l0 c9 | 178-30 쿨링민트 어캐 조져요? | How to beat 178-30 Cool Mint? | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:62` (+2) |
| 45947 | nv | 2026-09-24 | v136 l0 c3 | 242-30 쿨민 클리어덱 | Stage 242-30 Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:63` (+2) |
| 45932 | nv | 2026-09-24 | v190 l0 c0 | 240-30 비겁이 클리어덱 | Stage 240-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:65` (+2) |
| 45894 | nv | 2026-09-24 | v178 l0 c2 | 238-10,20,30 레드베리 망치공주 쿨민 클리어덱 | Stage 238-10,20,30 Redberry Assassin Choco Werehound Princess Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:69` (+2) |
| 45890 | nv | 2026-09-24 | v990 l19 c4 | 경험치던전 오토덱 | EXP dungeon auto deck | `001/evidence/16-top-players/06-nv-free-board.tsv:294` |
| 45863 | nv | 2026-09-24 | v91 l0 c2 | 스테이지덱 조합 추천부탁드립니다 현재 66-30 | Stage deck comp advice, at 66-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:303` |
| 45857 | nv | 2026-09-24 | v579 l0 c5 | 심심해서 짜본 바리공주 스테이지덱 | Princess Bari stage deck made for fun | `001/evidence/16-top-players/06-nv-free-board.tsv:307` |
| 45799 | nv | 2026-09-24 | v71 l0 c0 | 스테덱 추천 좀 해주세요 | Stage deck recommendation please | `001/evidence/16-top-players/06-nv-free-board.tsv:328` |
| 45790 | nv | 2026-09-24 | v1001 l2 c5 | 바리공주 스테이지 덱은없나요? | Is there a Princess Bari stage deck? | `001/evidence/16-top-players/06-nv-free-board.tsv:332` |
| 45649 | nv | 2026-09-24 | v126 l1 c0 | 46-30 쿨민 클리어 | Stage 46-30 Cool Mint clear | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:74` (+2) |
| 45641 | nv | 2026-09-24 | v182 l0 c3 | 168스테이지 이후 스테이지 보상 | Stage rewards after 168 | `001/evidence/16-top-players/06-nv-free-board.tsv:389` |
| 45634 | nv | 2026-09-24 | v199 l0 c0 | 경험치 던전  500스테이지 이후 수동컨 공략 | EXP dungeon past stage 500: manual-control guide | `001/evidence/16-top-players/06-nv-free-board.tsv:395` |
| 45630 | nv | 2026-09-24 | v1025 l0 c13 | 찐 무과금 노광제  스테이지 근황   반죽 카페 노광제 안계시나여  스테이지덱 사진 올렸어요 제가 쓰는덱입니다  전갈사용해요  반죽 드디어0개입니다 | F2P no-Gwangje stage update; Scorpion stage deck photo | `001/evidence/16-top-players/06-nv-free-board.tsv:398` |
| 45549 | nv | 2026-09-23 | v234 l0 c1 | 스테이지 장비 이거 바꿔야하나요?? | Should I swap this stage gear? | `001/evidence/16-top-players/06-nv-free-board.tsv:431` |
| 45547 | nv | 2026-09-23 | v1278 l9 c11 | [기록?]꼴찌이던 우유,딸크 많이묵은날 그리고 요즘쓰는덱~.~(스테용,바리읎슴) | Deck I use lately (for stages, no Bari) | `001/evidence/16-top-players/06-nv-free-board.tsv:433` |
| 45542 | nv | 2026-09-23 | v428 l3 c0 | 경험치 던전 440스테 수동컨 덱 | EXP dungeon stage 440 manual deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:77` (+2) |
| 45541 | nv | 2026-09-23 | v1119 l12 c1 | 경험치 던전 오토덱 | EXP dungeon auto deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:78` (+2) |
| 45533 | nv | 2026-09-23 | v375 l0 c1 | 현재 최고스테이지 몇인가요? | What's the highest stage now? | `001/evidence/16-top-players/06-nv-free-board.tsv:437` |
| 45506 | nv | 2026-09-23 | v158 l0 c0 | 233-30 쿨민 클리어덱 | Stage 233-30 Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:80` (+2) |
| 45504 | nv | 2026-09-23 | v676 l0 c8 | 현상태에서 무과금 스테이지덱 어떻게 해야 최고의 조합인가요 | Best F2P stage comp from my current state? | `001/evidence/16-top-players/06-nv-free-board.tsv:452` |
| 45489 | nv | 2026-09-23 | v131 l0 c0 | 스테이지 장비 부옵 질문 | stage gear substats question | `001/evidence/16-top-players/06-nv-free-board.tsv:458` |
| 45485 | nv | 2026-09-23 | v619 l1 c11 | 스테덱 추천좀요 형님들 | Stage deck recommendation please | `001/evidence/16-top-players/06-nv-free-board.tsv:460` |
| 45456 | nv | 2026-09-23 | v200 l0 c2 | 198스테 막혔는데 혹시 명중탓일까요? | Stuck at 198: accuracy? | `001/evidence/16-top-players/06-nv-free-board.tsv:470` |
| 45451 | nv | 2026-09-23 | v5460 l41 c12 | 스테이지 방치덱 공략 | stage idle deck guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:82` (+2) |
| 45403 | nv | 2026-09-23 | v1307 l2 c8 | 달토끼 위치 추천좀 부탁드립니다 (스테이지) | Where to place Moon Rabbit? (stages) | `001/evidence/16-top-players/06-nv-free-board.tsv:490` |
| 45402 | nv | 2026-09-23 | v440 l0 c1 | 스테이지 완화가 아닌거같아요;; | Doesn't feel like the stages were eased | `001/evidence/16-top-players/06-nv-free-board.tsv:491` |
| 45385 | nv | 2026-09-23 | v320 l0 c1 | 완화된 스테이지가 아닌 계속막히던 60번대 스테이지에서 달토끼넣으니깐 쭉쭉밀리네요... | Moon Rabbit pushes the 60s stages I was stuck on (not the eased ones) | `001/evidence/16-top-players/06-nv-free-board.tsv:498` |
| 45378 | nv | 2026-09-23 | v386 l0 c1 | 스테이지 갑자기 개쉬운데 이유가있나요 | Stages suddenly very easy; why? | `001/evidence/16-top-players/06-nv-free-board.tsv:502` |
| 45370 | nv | 2026-09-23 | v466 l0 c6 | 스테이지 너무 쉽네 하.. | Stages are too easy now | `001/evidence/16-top-players/06-nv-free-board.tsv:509` |
| 45342 | nv | 2026-09-23 | v525 l0 c4 | 스테 난이도 너프 레전드긴 하네요 | Stage difficulty nerf is legendary | `001/evidence/16-top-players/06-nv-free-board.tsv:520` |
| 45326 | nv | 2026-09-23 | v169 l2 c0 | 스테이지 패치는 잘했네 | The stage patch was well done | `001/evidence/16-top-players/06-nv-free-board.tsv:528` |
| 45303 | nv | 2026-09-23 | v227 l0 c0 | 비겁한쿠키는 이제 비겁하지않다 | Cowardly Cookie is no longer cowardly | `001/evidence/16-top-players/06-nv-free-board.tsv:536` |
| 45259 | nv | 2026-09-23 | v188 l0 c0 | 스테덱 이렇게 끼고 있는데 유지하면 될까요? | Keep my stage deck like this? | `001/evidence/16-top-players/06-nv-free-board.tsv:560` |
| 45238 | nv | 2026-09-23 | v201 l0 c1 | 보스 쿨민 토네이도 안도는데 | Boss Cool Mint doesn't spin its tornado | `001/evidence/16-top-players/06-nv-free-board.tsv:568` |
| 45230 | nv | 2026-09-23 | v100 l0 c0 | 아레나 플레이트랑 스테이지 플레이트 | arena plate stage plate | `001/evidence/16-top-players/06-nv-free-board.tsv:571` |
| 45173 | nv | 2026-09-23 | v242 l2 c0 | 232-30 비겁이 클리어덱 | Stage 232-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:97` (+2) |
| 45148 | nv | 2026-09-23 | v428 l0 c0 | 스테이지 난이도 떡하락 | Stage difficulty plummeted | `001/evidence/16-top-players/06-nv-free-board.tsv:609` |
| 44891 | nv | 2026-09-23 | v585 l0 c1 | 이제 스테이지공략이 필요없겠네 | Stage guides no longer needed | `001/evidence/16-top-players/06-nv-free-board.tsv:655` |
| 44887 | nv | 2026-09-23 | v248 l0 c0 | 203-10 쥐토바이(바이커)련 클리어덱 (위치베리 처음써봄) | Stage 203-10 rat bikers clear deck (first time using Witchberry) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:98` (+2) |
| 44856 | nv | 2026-09-22 | v377 l3 c0 | 레드베리 암살자 클리어덱 | Redberry Assassin clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:100` (+2) |
| 44853 | nv | 2026-09-22 | v142 l0 c0 | 230-10,20,30 레드베리,망치공주,쿨민 | Stage 230-10,20,30 Redberry Assassin , Choco Werehound Princess , Cool Mint | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:101` (+2) |
| 44848 | nv | 2026-09-22 | v130 l1 c0 | 263-20 263-30 (1G181M) 와플 도마뱀 | Stage 263-20 263-30 (1G181M) Waffle Lizard | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:102` (+2) |
| 44840 | nv | 2026-09-22 | v222 l1 c13 | 267-30 공략:-) | Stage 267-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:103` (+2) |
| 44839 | nv | 2026-09-22 | v39 l0 c0 | 229-20,30 그루터기 클리어덱 | Stage 229-20,30 Tainted Ent clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:104` (+2) |
| 44803 | nv | 2026-09-22 | v348 l0 c4 | 찐무과금 노광제  스테이지 방치1일차  705m367 달성  다들 파이팅  사진은 쿨민에서 막힘요   지금은 비겁한쿠키 한테 막힘요 | F2P no-Gwangje day 1 idling: 705M power, stuck on Cool Mint then Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:677` |
| 44778 | nv | 2026-09-22 | v376 l3 c0 | 레드베리 암살자, 식쿠 (248 이후 스테이지) | Redberry Assassin, cookie-eating plant (stages after 248) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:106` (+2) |
| 44765 | nv | 2026-09-22 | v79 l2 c0 | 267-10 공략:-) | Stage 267-10 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:107` (+2) |
| 44743 | nv | 2026-09-22 | v91 l2 c3 | 266-30 공략:-) | Stage 266-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:109` (+2) |
| 44736 | nv | 2026-09-22 | v156 l0 c0 | 259-30 비겁이 클리어 덱 | Stage 259-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:111` (+2) |
| 44709 | nv | 2026-09-22 | v177 l0 c21 | 235-30 비겁이 클리어덱 | Stage 235-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:112` (+2) |
| 44689 | nv | 2026-09-22 | v160 l0 c0 | 7번 보스 : 레드베리 암살자 | Boss #7: Redberry Assassin | `001/evidence/05-nv-guide-board-index.tsv:106` (+2) |
| 44660 | nv | 2026-09-22 | v98 l1 c0 | 208-30 비겁이 클리어덱 공유 337M | Stage 208-30 Cowardly Cookie clear deck share 337M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:114` (+2) |
| 44658 | nv | 2026-09-22 | v471 l5 c6 | 스테이지 덱 (248 이후 반자동) | Stage deck (semi-auto, after 248) | `001/evidence/16-top-players/06-nv-free-board.tsv:710` |
| 44634 | nv | 2026-09-22 | v119 l0 c0 | 227-30 비겁이 601M 클리어 | Stage 227-30 Cowardly Cookie 601M clear | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:116` (+2) |
| 44584 | nv | 2026-09-22 | v52 l2 c6 | 203-20 도와주세요 ㅠㅠ!! | Stage 203-20 help ㅠㅠ!! | `001/evidence/16-top-players/06-nv-free-board.tsv:737` |
| 44569 | nv | 2026-09-22 | v83 l0 c3 | 168-30에서 막혔네요. | Stuck at 168-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:746` |
| 44540 | nv | 2026-09-22 | v232 l0 c1 | 스테이지 난이도 하향할거면 | If they're lowering stage difficulty... | `001/evidence/16-top-players/06-nv-free-board.tsv:763` |
| 44535 | nv | 2026-09-22 | v141 l1 c0 | 206-30 쿨링민트 클리어덱 공유 337M | Stage 206-30 Cool Mint clear deck share 337M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:117` (+2) |
| 44513 | nv | 2026-09-22 | v186 l1 c0 | 내일 스테이지 미느냐고 다들 바쁠듯 | Everyone will be busy pushing stages tomorrow | `001/evidence/16-top-players/06-nv-free-board.tsv:777` |
| 44508 | nv | 2026-09-22 | v1181 l2 c16 | 스테이지완화 | stage easing | `001/evidence/16-top-players/06-nv-free-board.tsv:779` |
| 44487 | nv | 2026-09-22 | v138 l0 c0 | 스테이지 너프 프리셋개선 인정 | Stage nerf and preset fix: approved | `001/evidence/16-top-players/06-nv-free-board.tsv:794` |
| 44484 | nv | 2026-09-22 | v142 l0 c0 | 메인스테이지 1~328 하향 패치 굿~ | Main stages 1-328 difficulty-down patch: good | `001/evidence/16-top-players/06-nv-free-board.tsv:796` |
| 44481 | nv | 2026-09-22 | v126 l0 c0 | 232-30 비겁이 클리어덱 | Stage 232-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:118` (+2) |
| 44451 | nv | 2026-09-22 | v228 l3 c0 | 268 선인장거미 | Stage 268 Cactus Spider | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:119` (+2) |
| 44407 | nv | 2026-09-22 | v183 l0 c4 | 바이커 그냥 삭제 안될까요 | Can't they just delete the Biker? | `001/evidence/16-top-players/06-nv-free-board.tsv:817` |
| 44390 | nv | 2026-09-22 | v177 l0 c0 | 243-30 비겁한쿠키 | Stage 243-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:121` (+2) |
| 44338 | nv | 2026-09-22 | v152 l0 c2 | 252스테 선인장거미덱 기록용 | Stage 252 stage Cactus Spider deck for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:123` (+2) |
| 44320 | nv | 2026-09-21 | v33 l0 c1 | 214-20 클리어덱 | Stage 214-20 clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:832` |
| 44319 | nv | 2026-09-21 | v112 l1 c0 | 265-30 공략:-) | Stage 265-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:124` (+2) |
| 44307 | nv | 2026-09-21 | v134 l2 c0 | 264-30 공략:-) | Stage 264-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:125` (+2) |
| 44290 | nv | 2026-09-21 | v133 l2 c0 | 227-30 비겁이 클리어덱 | Stage 227-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:126` (+2) |
| 44289 | nv | 2026-09-21 | v135 l0 c0 | 227-10,20 쥐토바이 트럭 클리어덱 | Stage 227-10,20 rat bikers Truck clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:127` (+2) |
| 44244 | nv | 2026-09-21 | v574 l1 c0 | 코인던전 공략 (현533스테) | Coin dungeon guide (at stage 533) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:130` (+2) |
| 44241 | nv | 2026-09-21 | v156 l1 c1 | 211-30 비겁  396m 5초남기고 클리어 | Stage 211-30 Cowardly Cookie, 396M, cleared with 5 s left | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:131` (+2) |
| 44235 | nv | 2026-09-21 | v72 l0 c0 | 226-30 쿨민 클리어덱 | Stage 226-30 Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:132` (+2) |
| 44214 | nv | 2026-09-21 | v117 l1 c2 | 262-30 공략:-) | Stage 262-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:133` (+2) |
| 44200 | nv | 2026-09-21 | v74 l1 c0 | 스테이지 에피소드 개념으로 가자 | Let's treat stages as episodes | `001/evidence/16-top-players/06-nv-free-board.tsv:856` |
| 44188 | nv | 2026-09-21 | v68 l1 c4 | 262-20 공략:-) | Stage 262-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:134` (+2) |
| 44170 | nv | 2026-09-21 | v196 l0 c4 | 스테 장비 질문... | stage gear question ... | `001/evidence/16-top-players/06-nv-free-board.tsv:862` |
| 44090 | nv | 2026-09-21 | v192 l0 c6 | 비겁이 공략다르게해야될까요? | Should I approach Cowardly Cookie differently? | `001/evidence/16-top-players/06-nv-free-board.tsv:895` |
| 44060 | nv | 2026-09-21 | v148 l0 c0 | 227-30 비겁한 쿠키 기록용 | Stage 227-30 Cowardly Cookie for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:136` (+2) |
| 44048 | nv | 2026-09-21 | v235 l0 c0 | 248-30 비겁이 클리어덱 기록용 | Stage 248-30 Cowardly Cookie clear deck for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:138` (+2) |
| 44041 | nv | 2026-09-21 | v380 l0 c4 | 스테이지 명중 집중 | stage accuracy focus | `001/evidence/16-top-players/06-nv-free-board.tsv:911` |
| 44035 | nv | 2026-09-21 | v141 l0 c4 | 지금 201스테이지인데 더 이상 자동컨 안되는거 맞나요? | At stage 201: auto no longer works? | `001/evidence/16-top-players/06-nv-free-board.tsv:914` |
| 44032 | nv | 2026-09-21 | v60 l0 c0 | 58-30 쿨링민트 7시 | Stage 58-30 Cool Mint: go to 7 o'clock | `001/evidence/05-nv-guide-board-index.tsv:132` (+2) |
| 44014 | nv | 2026-09-21 | v161 l0 c2 | 242-30 쿨링민트맛쿠키 | Stage 242-30 Cool Mint | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:140` (+2) |
| 43969 | nv | 2026-09-21 | v204 l0 c3 | 쥐토바이 겜망하는데 큰 일조를 할거임 | Rat bikers will help kill the game | `001/evidence/16-top-players/06-nv-free-board.tsv:933` |
| 43953 | nv | 2026-09-21 | v234 l1 c2 | 찐무과금덱 유저  227-30  비겁한쿠키 클리어덱  노광제    축복2렙  용병단 4렙 | F2P deck, 227-30 Cowardly Cookie clear deck, no Gwangje, blessing 2, merc Lv4 | `001/evidence/16-top-players/06-nv-free-board.tsv:937` |
| 43926 | nv | 2026-09-21 | v175 l0 c0 | 203-30 비겁이 클리어덱 공유 322M | Stage 203-30 Cowardly Cookie clear deck share 322M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:142` (+2) |
| 43925 | nv | 2026-09-21 | v154 l1 c0 | 203-10 바이커 클리어덱 공유 337M | Stage 203-10 Biker clear deck share 337M | `001/evidence/05-nv-guide-board-index.tsv:136` (+2) |
| 43924 | nv | 2026-09-21 | v150 l1 c1 | 200-30 비겁이 클리어덱 공유 285M | Stage 200-30 Cowardly Cookie clear deck share 285M | `001/evidence/05-nv-guide-board-index.tsv:137` (+2) |
| 43908 | nv | 2026-09-21 | v116 l1 c1 | 198-30 쿨링민트 클리어덱 공유 283M | Stage 198-30 Cool Mint clear deck share 283M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:145` (+2) |
| 43907 | nv | 2026-09-21 | v132 l0 c0 | 195-30 비겁이 클리어덱 공유 250M | Stage 195-30 Cowardly Cookie clear deck share 250M | `001/evidence/05-nv-guide-board-index.tsv:139` (+2) |
| 43883 | nv | 2026-09-21 | v231 l1 c0 | 224-30 비겁이 클리어덱 | Stage 224-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:147` (+2) |
| 43874 | nv | 2026-09-21 | v2076 l36 c20 | [일던 공략] 경험치던전 막힌 분들 필독,공략 및 경던3연뚫 영상(현526스테) | [Daily dungeon] EXP-dungeon guide and video (at stage 526) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:148` (+2) |
| 43873 | nv | 2026-09-21 | v42 l0 c0 | 223-20,30 클리어덱 | Stage 223-20,30 clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:149` (+2) |
| 43836 | nv | 2026-09-20 | v186 l2 c4 | 259-30 공략:-) | Stage 259-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:150` (+2) |
| 43828 | nv | 2026-09-20 | v102 l2 c2 | 259-10 공략:-) | Stage 259-10 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:151` (+2) |
| 43827 | nv | 2026-09-20 | v4792 l178 c12 | 일일 던전 보스별 오토덱 정리 | daily dungeon per boss auto deck summary | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:152` (+2) |
| 43824 | nv | 2026-09-20 | v216 l0 c1 | 248-30 비겁 클 | Stage 248-30 Cowardly Cookie clear | `001/evidence/16-top-players/06-nv-free-board.tsv:971` |
| 43823 | nv | 2026-09-20 | v144 l0 c0 | 222-20,30 망치공주 쿨민 클리어덱 | Stage 222-20,30 Choco Werehound Princess Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:153` (+2) |
| 43822 | nv | 2026-09-20 | v62 l0 c0 | 221-20,30 그루터기 클리어덱 | Stage 221-20,30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:147` (+2) |
| 43821 | nv | 2026-09-20 | v84 l2 c0 | 258-30 공략:-) | Stage 258-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:155` (+2) |
| 43815 | nv | 2026-09-20 | v114 l0 c0 | 251-30 (1G63M) 비겁 | Stage 251-30 (1G63M) Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:156` (+2) |
| 43792 | nv | 2026-09-20 | v62 l3 c0 | 257-30 공략:-) | Stage 257-30 guide | `001/evidence/05-nv-guide-board-index.tsv:151` (+2) |
| 43786 | nv | 2026-09-20 | v111 l0 c0 | 227-30 비겁이 클리어덱 | Stage 227-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:152` (+2) |
| 43766 | nv | 2026-09-20 | v32 l1 c1 | 82-30 쿨링민트 | Stage 82-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:154` (+2) |
| 43757 | nv | 2026-09-20 | v33 l0 c0 | 91-30 비겁 클리어 | Stage 91-30 Cowardly Cookie clear | `001/evidence/05-nv-guide-board-index.tsv:155` (+2) |
| 43736 | nv | 2026-09-20 | v18 l0 c0 | 81-30 쿨링민트 | Stage 81-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:156` (+2) |
| 43735 | nv | 2026-09-20 | v54 l0 c0 | 80-30 비겁이 | Stage 80-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:164` (+2) |
| 43719 | nv | 2026-09-20 | v131 l0 c0 | 219-30 비겁이 클리어덱 | Stage 219-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:165` (+2) |
| 43716 | nv | 2026-09-20 | v211 l0 c0 | 219-10,20 쥐토바이 트럭 클리어덱 | Stage 219-10,20 rat bikers Truck clear deck | `001/evidence/05-nv-guide-board-index.tsv:159` (+2) |
| 43708 | nv | 2026-09-20 | v236 l3 c0 | 256-30 공략:-) | Stage 256-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:167` (+2) |
| 43707 | nv | 2026-09-20 | v245 l1 c10 | 찐무과금  227-10 쥐토바이  클리어덱  노광제  더있나요 댓좀요 | F2P 227-10 rat bikers clear deck, no Gwangje | `001/evidence/16-top-players/06-nv-free-board.tsv:995` |
| 43696 | nv | 2026-09-20 | v151 l1 c0 | 227-10 쥐토바이 클리어덱 | Stage 227-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:162` (+2) |
| 43683 | nv | 2026-09-20 | v346 l0 c0 | 스테이지 5사격복지 덱 | stage 5-ranged perk deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:171` (+2) |
| 43680 | nv | 2026-09-20 | v3030 l69 c16 | 스테이지 덱 (~248 + 이후) | Stage deck (to 248 and after) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:172` (+2) |
| 43648 | nv | 2026-09-20 | v241 l0 c0 | 203-10 폭주단 바이커 공략 영상첨부 | Stage 203-10 Rowdy Biker guide with video | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:174` (+2) |
| 43639 | nv | 2026-09-20 | v110 l0 c2 | 246-30 쿨민 기록용 | Stage 246-30 Cool Mint for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1017` |
| 43611 | nv | 2026-09-20 | v212 l0 c0 | 248 30 비겁이 컷 | Stage 248 30 Cowardly Cookie cut | `001/evidence/16-top-players/06-nv-free-board.tsv:1023` |
| 43554 | nv | 2026-09-20 | v70 l0 c0 | 쥐토바이 비겁 = 폐사구간 | Rat bikers + Cowardly Cookie = the dying zone | `001/evidence/16-top-players/06-nv-free-board.tsv:1043` |
| 43545 | nv | 2026-09-20 | v65 l0 c1 | 내 폰 열받아 터질까봐 스테이지도 못밀겠네 | Phone too hot to push stages | `001/evidence/16-top-players/06-nv-free-board.tsv:1052` |
| 43535 | nv | 2026-09-20 | v11 l0 c0 | 155-10 | Stage 155-10 | `001/evidence/16-top-players/06-nv-free-board.tsv:1058` |
| 43509 | nv | 2026-09-20 | v147 l0 c1 | 아..., 도저히 비겁이 땜에 못해먹겠다.. | Can't stand Cowardly Cookie any more | `001/evidence/16-top-players/06-nv-free-board.tsv:1065` |
| 43489 | nv | 2026-09-19 | v59 l0 c0 | 78-30 쿨링민트 | Stage 78-30 Cool Mint | `001/evidence/16-top-players/05-nv-guide-board.tsv:173` (+2) |
| 43488 | nv | 2026-09-19 | v14 l0 c0 | 77-30 그루터기 | Stage 77-30 Tainted Ent | `001/evidence/05-nv-guide-board-index.tsv:173` (+2) |
| 43473 | nv | 2026-09-19 | v18 l0 c0 | 139-10 | Stage 139-10 | `001/evidence/05-nv-guide-board-index.tsv:174` (+2) |
| 43472 | nv | 2026-09-19 | v72 l0 c0 | 75-30 비겁이 | Stage 75-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:175` (+2) |
| 43471 | nv | 2026-09-19 | v15 l0 c0 | 137-30 | Stage 137-30 | `001/evidence/05-nv-guide-board-index.tsv:176` (+2) |
| 43469 | nv | 2026-09-19 | v62 l0 c0 | 217-20,30 쿨민 클리어덱 | Stage 217-20,30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:177` (+2) |
| 43465 | nv | 2026-09-19 | v173 l1 c0 | 254-30 공략:-) | Stage 254-30 guide | `001/evidence/05-nv-guide-board-index.tsv:179` (+2) |
| 43445 | nv | 2026-09-19 | v258 l0 c0 | 216-30 비겁이 클리어덱 | Stage 216-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:187` (+2) |
| 43443 | nv | 2026-09-19 | v106 l1 c0 | 254-20 공략:-) | Stage 254-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:189` (+2) |
| 43415 | nv | 2026-09-19 | v340 l1 c2 | 무과금 203-10 쥐토바이 손컨x 전갈x 난똥손이라 컨같은거 자신이 없다는분만 보세요 | F2P 203-10 rat bikers, no manual control, no Scorpion | `001/evidence/05-nv-guide-board-index.tsv:183` (+2) |
| 43398 | nv | 2026-09-19 | v275 l3 c1 | 243-10 기록용 | Stage 243-10 for the record | `001/evidence/16-top-players/05-nv-guide-board.tsv:185` (+2) |
| 43397 | nv | 2026-09-19 | v133 l1 c1 | 176-30 149m 저스펙 | Stage 176-30 149m low spec | `001/evidence/05-nv-guide-board-index.tsv:185` (+2) |
| 43396 | nv | 2026-09-19 | v53 l0 c0 | 88-30 비겁 클리어 | Stage 88-30 Cowardly Cookie clear | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:193` (+2) |
| 43387 | nv | 2026-09-19 | v92 l1 c0 | 253-20 공략:-) | Stage 253-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:194` (+2) |
| 43349 | nv | 2026-09-19 | v269 l0 c1 | 뭐야 ㅅㅂ 스테이지보상 | What the hell, stage rewards | `001/evidence/16-top-players/06-nv-free-board.tsv:1101` |
| 43339 | nv | 2026-09-19 | v55 l0 c0 | 215-10,20,30 클리어덱 | Stage 215-10,20,30 clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:195` (+2) |
| 43323 | nv | 2026-09-19 | v151 l0 c0 | 244-10 독수리 기록 | Stage 244-10 Cream Eagle record | `001/evidence/16-top-players/06-nv-free-board.tsv:1109` |
| 43294 | nv | 2026-09-19 | v417 l3 c1 | 240-30 645.8m 명쿠X | Stage 240-30 at 645.8M without Cheerful | `001/evidence/05-nv-guide-board-index.tsv:189` (+2) |
| 43281 | nv | 2026-09-19 | v289 l0 c0 | 무과금덱 노광제 224-30  비겁한쿠키  클리어덱  스펙 스샷 올렸어요  클리어 하시길 | F2P no-Gwangje 224-30 Cowardly Cookie clear deck with spec screenshots | `001/evidence/16-top-players/06-nv-free-board.tsv:1125` |
| 43280 | nv | 2026-09-19 | v254 l1 c5 | 243-30 비겁 기록용 | Stage 243-30 Cowardly Cookie for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1126` |
| 43244 | nv | 2026-09-19 | v119 l0 c0 | 243-30 비겁 두번째 벽 | Stage 243-30 Cowardly Cookie: the second wall | `001/evidence/16-top-players/06-nv-free-board.tsv:1135` |
| 43213 | nv | 2026-09-19 | v177 l0 c0 | 214-20,30 망치공주 쿨민 클리어덱 | Stage 214-20,30 Choco Werehound Princess Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:198` (+2) |
| 43207 | nv | 2026-09-19 | v261 l0 c0 | 243-10 쥐 바이커 기록용 | Stage 243-10 rat bikers for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1146` |
| 43196 | nv | 2026-09-19 | v224 l4 c0 | 251-30 공략:-) | Stage 251-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:199` (+2) |
| 43175 | nv | 2026-09-19 | v163 l1 c0 | 251-20 공략:-) | Stage 251-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:200` (+2) |
| 43169 | nv | 2026-09-18 | v152 l2 c7 | 251-10 공략:-) | Stage 251-10 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:201` (+2) |
| 43166 | nv | 2026-09-18 | v979 l22 c6 | 반죽던전 공략(현502스테이지) | Dough dungeon guide (at stage 502) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:202` (+2) |
| 43162 | nv | 2026-09-18 | v82 l0 c1 | 179-10 역대급으로 안 깨지네요...손가락 문젠가 | Stage 179-10 won't break; my fingers? | `001/evidence/16-top-players/06-nv-free-board.tsv:1158` |
| 43161 | nv | 2026-09-18 | v164 l2 c2 | 250-30 공략:-) | Stage 250-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:203` (+2) |
| 43154 | nv | 2026-09-18 | v108 l0 c0 | 243-10 바이커 벽느낌 | Stage 243-10 Biker feels like a wall | `001/evidence/16-top-players/06-nv-free-board.tsv:1161` |
| 43152 | nv | 2026-09-18 | v120 l1 c0 | 249-30 공략:-) | Stage 249-30 guide | `001/evidence/05-nv-guide-board-index.tsv:197` (+2) |
| 43151 | nv | 2026-09-18 | v35 l0 c0 | 75-10 폭주단 | Stage 75-10 Rowdy gang | `001/evidence/05-nv-guide-board-index.tsv:198` (+2) |
| 43150 | nv | 2026-09-18 | v24 l0 c0 | 74-30 쿨링민트 | Stage 74-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:199` (+2) |
| 43149 | nv | 2026-09-18 | v16 l0 c1 | 73-30 쿨링민트 | Stage 73-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:200` (+2) |
| 43142 | nv | 2026-09-18 | v24 l0 c0 | 134-30 | Stage 134-30 | `001/evidence/05-nv-guide-board-index.tsv:201` (+2) |
| 43138 | nv | 2026-09-18 | v594 l5 c11 | 248-30 공략:-) | Stage 248-30 guide | `001/evidence/05-nv-guide-board-index.tsv:203` (+2) |
| 43131 | nv | 2026-09-18 | v21 l0 c2 | 107-10 | Stage 107-10 | `001/evidence/05-nv-guide-board-index.tsv:204` (+2) |
| 43092 | nv | 2026-09-18 | v489 l2 c6 | 238 스테이지 레드베리 암살자 조합 공략 (영상O) | Stage 238 stage Redberry Assassin comp guide ( video O) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:213` (+2) |
| 43060 | nv | 2026-09-18 | v99 l0 c1 | 비겁이 이게 맞냐 뚱카롱 x뿔 룐들아!! | Is this right vs Cowardly Cookie? (Macaron rant) | `001/evidence/16-top-players/06-nv-free-board.tsv:1175` |
| 43055 | nv | 2026-09-18 | v94 l0 c2 | 비겁이 지긋지긋하다 정말.. | Sick of Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:1179` |
| 43039 | nv | 2026-09-18 | v124 l2 c0 | 72-30 비겁한쿠키 | Stage 72-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:214` (+2) |
| 43034 | nv | 2026-09-18 | v573 l5 c3 | 235-10 폭주단 바이커 | Stage 235-10 Rowdy Biker | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:215` (+2) |
| 43028 | nv | 2026-09-18 | v61 l0 c2 | 비겁한 쿠키 관련 질문 | Question about Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:1182` |
| 43014 | nv | 2026-09-18 | v37 l0 c0 | 104-30 | Stage 104-30 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:218` (+2) |
| 43010 | nv | 2026-09-18 | v44 l0 c0 | 104-30 비겁이 클리어덱 | Stage 104-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:220` (+2) |
| 43002 | nv | 2026-09-18 | v237 l0 c9 | 174스테인데 이거 왤캐 안밀리는거임? | Stage 174: why won't it push? | `001/evidence/16-top-players/06-nv-free-board.tsv:1189` |
| 43000 | nv | 2026-09-18 | v12 l0 c0 | 72-20 골렘 | Stage 72-20 Golem | `001/evidence/05-nv-guide-board-index.tsv:214` (+2) |
| 42999 | nv | 2026-09-18 | v41 l0 c0 | 70-30 쿨링민트 | Stage 70-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:215` (+2) |
| 42998 | nv | 2026-09-18 | v43 l0 c0 | 160-30 비겁덱(시커, 전갈, 체콜 포함) | Stage 160-30 Cowardly Cookie deck (with Seeker, Scorpion, Cherry Cola) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:223` (+2) |
| 42970 | nv | 2026-09-18 | v33 l0 c0 | 비겁이 ㅅㄲ | Cowardly Cookie rant | `001/evidence/16-top-players/06-nv-free-board.tsv:1197` |
| 42960 | nv | 2026-09-18 | v279 l1 c2 | 무과금 219-30 비겁한쿠키  클리어덱  스펙 사진 올려요  노광제 | F2P 219-30 Cowardly Cookie clear deck with spec photos, no Gwangje | `001/evidence/16-top-players/06-nv-free-board.tsv:1199` |
| 42953 | nv | 2026-09-18 | v196 l0 c3 | 235-10 하.. | Stage 235-10 sigh | `001/evidence/16-top-players/06-nv-free-board.tsv:1201` |
| 42946 | nv | 2026-09-18 | v195 l0 c2 | 248 탈출하고 249에서 쿨링민트 만났는데 | Escaped 248, then met Cool Mint at 249 | `001/evidence/16-top-players/06-nv-free-board.tsv:1203` |
| 42909 | nv | 2026-09-18 | v198 l0 c2 | 흠 스테 장비 의견좀ㅠ 선택장애 | Opinions on stage gear please | `001/evidence/16-top-players/06-nv-free-board.tsv:1211` |
| 42905 | nv | 2026-09-18 | v338 l0 c2 | 240-30 비겁 기록용 | Stage 240-30 Cowardly Cookie for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1213` |
| 42889 | nv | 2026-09-18 | v75 l0 c1 | 스테이지밀때 석류버프 | Pomegranate buff when pushing stages | `001/evidence/16-top-players/06-nv-free-board.tsv:1218` |
| 42864 | nv | 2026-09-18 | v199 l0 c2 | 227-30 (540M)  클덱 | Stage 227-30 (540M) clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1227` |
| 42859 | nv | 2026-09-18 | v430 l2 c0 | 232-30 비겁한쿠키 | Stage 232-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:231` (+2) |
| 42851 | nv | 2026-09-18 | v718 l1 c11 | 비겁한쿠키 깼어요 감사합니다  216-30   스샷 올릴게요 스펙  무과금덱 | Beat Cowardly Cookie 216-30, F2P deck, spec screenshots | `001/evidence/16-top-players/06-nv-free-board.tsv:1231` |
| 42843 | nv | 2026-09-18 | v17 l0 c0 | 99-10 | Stage 99-10 | `001/evidence/05-nv-guide-board-index.tsv:225` (+2) |
| 42836 | nv | 2026-09-18 | v1924 l4 c5 | 스테밀때 명집중 보다 투력이 우선인거같은 느낌져만 드나요?(생각 공유하고싶어요) | Does power feel more important than acc/focus when pushing? | `001/evidence/16-top-players/06-nv-free-board.tsv:1235` |
| 42827 | nv | 2026-09-18 | v211 l0 c5 | 비겁이 하,,ㅠㅠㅠㅠㅠ | Cowardly Cookie sigh | `001/evidence/16-top-players/06-nv-free-board.tsv:1238` |
| 42813 | nv | 2026-09-17 | v131 l0 c2 | 253-20 마오카이(수정) | Stage 253-20 'Maokai' tree boss (edited) | `001/evidence/16-top-players/06-nv-free-board.tsv:1244` |
| 42811 | nv | 2026-09-17 | v34 l0 c0 | 70-20 늑대망치 | Stage 70-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:227` (+2) |
| 42810 | nv | 2026-09-17 | v22 l0 c1 | 69-30 그루터기 | Stage 69-30 Tainted Ent | `001/evidence/05-nv-guide-board-index.tsv:228` (+2) |
| 42809 | nv | 2026-09-17 | v154 l1 c0 | 67-10 폭주단바이커 / 67-20 폭주단트럭 / 67-30 비겁이 | Stage 67-10 Rowdy Biker / 67-20 Rowdy Truck / 67-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:236` (+2) |
| 42807 | nv | 2026-09-17 | v48 l0 c0 | 66-30 쿨링민트 | Stage 66-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:230` (+2) |
| 42789 | nv | 2026-09-17 | v117 l0 c2 | 혹시 설인 무슨덱으로 잡으시나요?? | What deck for the Yeti? | `001/evidence/16-top-players/06-nv-free-board.tsv:1253` |
| 42754 | nv | 2026-09-17 | v217 l0 c1 | 248 이후 스테덱 추천좀 | Stage deck after 248? | `001/evidence/16-top-players/06-nv-free-board.tsv:1264` |
| 42744 | nv | 2026-09-17 | v31 l0 c0 | 65-30 쿨링민트 | Stage 65-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:231` (+2) |
| 42733 | nv | 2026-09-17 | v22 l0 c0 | 55-30 | Stage 55-30 | `001/evidence/05-nv-guide-board-index.tsv:232` (+2) |
| 42724 | nv | 2026-09-17 | v114 l0 c0 | 64-30 비겁이 | Stage 64-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:240` (+2) |
| 42723 | nv | 2026-09-17 | v7 l0 c0 | 81-30 쿨만 클리어 | Stage 81-30 Cool Mint clear | `001/evidence/05-nv-guide-board-index.tsv:234` (+2) |
| 42699 | nv | 2026-09-17 | v225 l0 c0 | 206-30 쿨민덱(209-30도 이덱으로) | Stage 206-30 Cool Mint deck (209-30 deck ) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:242` (+2) |
| 42680 | nv | 2026-09-17 | v175 l0 c1 | 보통 스테이지 조합 어떻게 가는건가요?... | What's the usual stage comp? | `001/evidence/16-top-players/06-nv-free-board.tsv:1280` |
| 42669 | nv | 2026-09-17 | v239 l0 c7 | 스테장비셋보다 토벌장비셋 투력이 너무 낮아요.. | Conquest gear set power far below stage gear set | `001/evidence/16-top-players/06-nv-free-board.tsv:1284` |
| 42665 | nv | 2026-09-17 | v323 l1 c0 | 248-30 구스테 돌파 기록용 | Stage 248-30 old final stage cleared, for the record | `001/evidence/05-nv-guide-board-index.tsv:236` (+2) |
| 42644 | nv | 2026-09-17 | v318 l3 c6 | 246-30 공략:-) | Stage 246-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:245` (+2) |
| 42611 | nv | 2026-09-17 | v293 l1 c0 | 235-30 비겁 기록용 | Stage 235-30 Cowardly Cookie for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1298` |
| 42593 | nv | 2026-09-17 | v594 l1 c4 | 스테장비가 왜 아레나장비보다 아레나 승률이 높죠? | Why does stage gear win more arena fights than arena gear? | `001/evidence/16-top-players/06-nv-free-board.tsv:1307` |
| 42584 | nv | 2026-09-17 | v83 l0 c0 | 무과금 118-30 쿨민덱 | F2P 118-30 Cool Mint deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:241` (+2) |
| 42581 | nv | 2026-09-17 | v408 l0 c0 | 235-10 쥐 바이커 기록용 | Stage 235-10 rat bikers for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1312` |
| 42565 | nv | 2026-09-17 | v130 l0 c0 | 234-30 쿨민 기록용 | Stage 234-30 Cool Mint for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1317` |
| 42554 | nv | 2026-09-17 | v275 l3 c0 | 230-18 레드베리 암살자 | Stage 230-18 Redberry Assassin | `001/evidence/05-nv-guide-board-index.tsv:241` (+2) |
| 42544 | nv | 2026-09-17 | v299 l0 c4 | 무과금입니다 211-30 비겁한쿠키 덱  필요하면 말해줘요 스펙 스샷 찍어드릴게요  무과금덱  광제 무과금님도 깰수있어요  도움은 안되겠죠 | F2P 211-30 Cowardly Cookie deck; spec screenshots on request | `001/evidence/16-top-players/06-nv-free-board.tsv:1321` |
| 42520 | nv | 2026-09-17 | v694 l5 c0 | 248지까지 클리어한 모든 스테이지 통합본 공략 | Combined guide for every stage cleared to 248 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:250` (+2) |
| 42508 | nv | 2026-09-17 | v354 l3 c0 | 216-30 비겁 | Stage 216-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:244` (+2) |
| 42502 | nv | 2026-09-17 | v168 l0 c3 | 스테 장비 봐주세용 | Please check my stage gear | `001/evidence/16-top-players/06-nv-free-board.tsv:1341` |
| 42492 | nv | 2026-09-17 | v298 l0 c0 | 235-30 비겁이 클리어덱 기록용 | Stage 235-30 Cowardly Cookie clear deck for the record | `001/evidence/16-top-players/05-nv-guide-board.tsv:246` (+2) |
| 42488 | nv | 2026-09-17 | v267 l0 c0 | 232-30 비겁 기록용 | Stage 232-30 Cowardly Cookie for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1347` |
| 42486 | nv | 2026-09-17 | v362 l3 c4 | 무과금 195-10 바이커 클리어덱 공유 259M | F2P 195-10 Biker clear deck share 259M | `001/evidence/05-nv-guide-board-index.tsv:246` (+2) |
| 42485 | nv | 2026-09-17 | v164 l0 c2 | 무과금 194-30 쿨민 클리어덱 공유 237M | F2P 194-30 Cool Mint clear deck share 237M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:254` (+2) |
| 42458 | nv | 2026-09-17 | v262 l0 c2 | 스테이지 막혔을때 켜두고 방치하나요? | Do you leave it idling when stuck? | `001/evidence/16-top-players/06-nv-free-board.tsv:1356` |
| 42453 | nv | 2026-09-17 | v386 l2 c0 | 211-10 쥐돌이 공략 덱 | Stage 211-10 rat bikers guide deck | `001/evidence/05-nv-guide-board-index.tsv:250` (+2) |
| 42449 | nv | 2026-09-17 | v417 l1 c2 | 208-30 비겁이 공략 덱 | Stage 208-30 Cowardly Cookie guide deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:258` (+2) |
| 42440 | nv | 2026-09-17 | v413 l2 c1 | 243-10 바이커 클 | Stage 243-10 Biker clear | `001/evidence/05-nv-guide-board-index.tsv:252` (+2) |
| 42413 | nv | 2026-09-17 | v498 l1 c6 | 219-10 쥐돌이 클덱 (460M) | Stage 219-10 rat bikers clear deck (460M) | `001/evidence/16-top-players/06-nv-free-board.tsv:1370` |
| 42406 | nv | 2026-09-17 | v262 l1 c0 | 203-10클덱 | Stage 203-10 clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1374` |
| 42399 | nv | 2026-09-16 | v111 l0 c4 | 쥐돌이 덱 이거 괜찮아요? | Is this rat-biker deck OK? | `001/evidence/16-top-players/06-nv-free-board.tsv:1376` |
| 42391 | nv | 2026-09-16 | v514 l2 c8 | 비겁이 만드신분은 퇴사하시길 | Whoever designed Cowardly Cookie should quit | `001/evidence/16-top-players/06-nv-free-board.tsv:1378` |
| 42390 | nv | 2026-09-16 | v229 l4 c0 | 246-20 공략:-) | Stage 246-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:260` (+2) |
| 42386 | nv | 2026-09-16 | v243 l0 c3 | 195-10 쥐토바이 기록 | Stage 195-10 rat bikers record | `001/evidence/05-nv-guide-board-index.tsv:255` (+2) |
| 42383 | nv | 2026-09-16 | v437 l0 c0 | 240-30 비겁이 클리어덱 | Stage 240-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:263` (+2) |
| 42382 | nv | 2026-09-16 | v184 l4 c11 | 246-10 공략:-) | Stage 246-10 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:264` (+2) |
| 42377 | nv | 2026-09-16 | v326 l0 c3 | 249이후 미시는 분들 스테보상 질문 | Stage reward question for those past 249 | `001/evidence/16-top-players/06-nv-free-board.tsv:1383` |
| 42368 | nv | 2026-09-16 | v87 l0 c0 | 스테넘어가는 버그 있는듯 | Bug that skips stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:1388` |
| 42349 | nv | 2026-09-16 | v97 l0 c5 | 40스테이지 덱 편성 알려주실분 구합니다 체콜10성보유 | Stage 40 lineup help (have 10★ Cherry Cola) | `001/evidence/16-top-players/06-nv-free-board.tsv:1395` |
| 42346 | nv | 2026-09-16 | v249 l0 c0 | 203-10 쥐토바이덱 | Stage 203-10 rat bikers deck | `001/evidence/05-nv-guide-board-index.tsv:259` (+2) |
| 42329 | nv | 2026-09-16 | v129 l0 c0 | 230-30 쿨민 기록용 | Stage 230-30 Cool Mint for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1402` |
| 42324 | nv | 2026-09-16 | v133 l0 c2 | 광제단으로 (구) 최대 스테이지 등반 완료! | Climbed to the (old) max stage with Gwangje | `001/evidence/16-top-players/06-nv-free-board.tsv:1404` |
| 42318 | nv | 2026-09-16 | v206 l1 c0 | 245-20 공략:-) | Stage 245-20 guide | `001/evidence/05-nv-guide-board-index.tsv:260` (+2) |
| 42303 | nv | 2026-09-16 | v433 l0 c2 | 281 스테이지 클리어!! 마일리지상점 오전안에 꼭 구매하시길!! | Cleared stage 281! Buy from the mileage shop before noon | `001/evidence/16-top-players/06-nv-free-board.tsv:1408` |
| 42299 | nv | 2026-09-16 | v196 l1 c1 | 40-30 비겁이(체리콜라덱) | Stage 40-30 Cowardly Cookie ( Cherry Cola deck ) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:268` (+2) |
| 42259 | nv | 2026-09-16 | v80 l0 c0 | 62-30 쿨링민트 | Stage 62-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:262` (+2) |
| 42253 | nv | 2026-09-16 | v185 l0 c0 | 195-10 쥐돌이 기록용 :) | Stage 195-10 rat bikers for the record :) | `001/evidence/05-nv-guide-board-index.tsv:263` (+2) |
| 42241 | nv | 2026-09-16 | v257 l0 c4 | 스테이지 169~248 난이도 | stage 169~248 difficulty | `001/evidence/16-top-players/06-nv-free-board.tsv:1426` |
| 42237 | nv | 2026-09-16 | v928 l1 c23 | 비겁이는 잘못 설계 된게 아닐까싶을정도네요 | Cowardly Cookie seems mis-designed | `001/evidence/16-top-players/06-nv-free-board.tsv:1429` |
| 42227 | nv | 2026-09-16 | v387 l0 c3 | 219-30 비겁이 477M | Stage 219-30 Cowardly Cookie 477M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:272` (+2) |
| 42213 | nv | 2026-09-16 | v411 l4 c0 | 스테이지덱 | stage deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1436` |
| 42204 | nv | 2026-09-16 | v78 l0 c0 | 64-30 비쿠컷 | Stage 64-30 Cowardly Cookie cut | `001/evidence/16-top-players/06-nv-free-board.tsv:1439` |
| 42197 | nv | 2026-09-16 | v186 l0 c0 | 195-10 클리어 덱 | Stage 195-10 clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1441` |
| 42192 | nv | 2026-09-16 | v286 l1 c0 | 211-30 437.25m 비겁한 쿠키 클리어덱 | Stage 211-30 437.25m Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:267` (+2) |
| 42189 | nv | 2026-09-16 | v165 l0 c2 | 차라리 현재 스테나온거 전부 난이도 하향하고 신스테부터 난이도 완화하는게 어떰? | Why not lower all current stages and ease new ones? | `001/evidence/16-top-players/06-nv-free-board.tsv:1444` |
| 42188 | nv | 2026-09-16 | v383 l2 c13 | 235-10 540.2m | Stage 235-10 540.2m | `001/evidence/05-nv-guide-board-index.tsv:268` (+2) |
| 42184 | nv | 2026-09-16 | v76 l0 c0 | 무과금덱  쿨민덱  209-30 무과금님  광제님  도움이될진 모르겠지만 올려봐요 깰수있을거예요  스펙 스샷이 필요하면 올려줄게요 | F2P Cool Mint deck for 209-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:1445` |
| 42183 | nv | 2026-09-16 | v191 l0 c0 | 176-30 클리어덱 | Stage 176-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:269` (+2) |
| 42177 | nv | 2026-09-16 | v458 l2 c0 | 무과금 192-30 비겁이 클리어덱 공유 219M | F2P 192-30 Cowardly Cookie clear deck share 219M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:277` (+2) |
| 42173 | nv | 2026-09-16 | v630 l1 c12 | 진짜 궁금한건데 왜 스테이지 돌려먹기는 뭐라 안함? | Why is nobody criticising recycled stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:1451` |
| 42167 | nv | 2026-09-16 | v188 l0 c0 | 248-30 깬후에 퀘스트보상 | Quest rewards after clearing 248-30 | `001/evidence/05-nv-guide-board-index.tsv:271` (+2) |
| 42164 | nv | 2026-09-16 | v194 l0 c4 | 혹시 저번주 확장 스테이지 보상개선되고 재탕인가요? | Last week's expansion stage rewards improved, or reruns? | `001/evidence/16-top-players/06-nv-free-board.tsv:1454` |
| 42162 | nv | 2026-09-16 | v262 l0 c1 | 레드베리암살자  쥐토바이보다 더역겹네 ㅋ | Redberry Assassin worse than the rat bikers | `001/evidence/16-top-players/06-nv-free-board.tsv:1456` |
| 42152 | nv | 2026-09-16 | v2141 l28 c25 | 오랜만에 스테이지 덱 공유합니다(에스프레소 밀키웨이 사격덱 전용) | Stage deck share (Espresso + Milky Way ranged deck) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:279` (+2) |
| 42151 | nv | 2026-09-16 | v342 l0 c7 | 스테이지보상 너프 얼마나됐길래 다들 원성인가 했는데 | How big was the stage-reward nerf? | `001/evidence/16-top-players/06-nv-free-board.tsv:1462` |
| 42148 | nv | 2026-09-16 | v62 l0 c4 | 102-20 망치공주 클리어덱 | Stage 102-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:273` (+2) |
| 42147 | nv | 2026-09-16 | v67 l0 c0 | 62-30 쿨민 컷 | Stage 62-30 Cool Mint cut | `001/evidence/16-top-players/06-nv-free-board.tsv:1463` |
| 42146 | nv | 2026-09-16 | v512 l5 c2 | 211-10 447.02m 폭주단바이커 클리어덱 | Stage 211-10 447.02m Rowdy Biker clear deck | `001/evidence/05-nv-guide-board-index.tsv:274` (+2) |
| 42117 | nv | 2026-09-16 | v815 l1 c15 | 248-30 비겁이 극적인탈출 ;; | Stage 248-30 Cowardly Cookie dramatic escape | `001/evidence/16-top-players/06-nv-free-board.tsv:1472` |
| 42113 | nv | 2026-09-16 | v579 l1 c2 | 비겁이,삼토바이? 그만해 형들~ | Cowardly Cookie, biker trio: enough | `001/evidence/16-top-players/06-nv-free-board.tsv:1473` |
| 42099 | nv | 2026-09-16 | v30 l0 c0 | 10-30 조언 부탁드립니다 | Stage 10-30 advice please | `001/evidence/16-top-players/06-nv-free-board.tsv:1481` |
| 42073 | nv | 2026-09-16 | v257 l0 c0 | 227-30 비겁 클 기록용 | Stage 227-30 Cowardly Cookie clear for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1489` |
| 42072 | nv | 2026-09-16 | v389 l0 c0 | 203-30 클덱 | Stage 203-30 clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1490` |
| 42069 | nv | 2026-09-16 | v230 l0 c2 | 203-10 클덱 | Stage 203-10 clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1491` |
| 42067 | nv | 2026-09-16 | v333 l1 c0 | 232-30 비겁이 클리어덱 기록용 | Stage 232-30 Cowardly Cookie clear deck for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:283` (+2) |
| 42052 | nv | 2026-09-16 | v579 l4 c4 | 243-30 공략:-) | Stage 243-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:284` (+2) |
| 42034 | nv | 2026-09-16 | v944 l1 c22 | 비겁한쿠키입니다  무과금 광제님 깰수있을거예요   208-30  드디어 깼어여  필요하면 스펙 스샷 필요하면 말해주세여    도와주신분 감사합니다   무과금덱  도움되셨나요? | F2P 208-30 Cowardly Cookie finally cleared; spec screenshots on request | `001/evidence/16-top-players/06-nv-free-board.tsv:1497` |
| 42016 | nv | 2026-09-16 | v788 l4 c5 | 200-30 비겁이덱(이후 비겁이는 이걸로 다 깨는 중) | Stage 200-30 Cowardly Cookie deck (clearing every Cowardly with it since) | `001/evidence/05-nv-guide-board-index.tsv:278` (+2) |
| 42012 | nv | 2026-09-16 | v273 l0 c1 | 선인장 거미 공략🌵 | Cactus Spider guide 🌵 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:286` (+2) |
| 42011 | nv | 2026-09-16 | v148 l0 c0 | 213-10,20,30 그루터기 클리어덱 | Stage 213-10,20,30 Tainted Ent clear deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:281` (+2) |
| 41996 | nv | 2026-09-16 | v199 l0 c0 | 230-30 쿨민이 클리어덱 기록용 | Stage 230-30 Cool Mint clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:281` (+2) |
| 41995 | nv | 2026-09-16 | v294 l1 c7 | 무과금 190-30 쿨민 클리어덱 공유 214M | F2P 190-30 Cool Mint clear deck share 214M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:289` (+2) |
| 41949 | nv | 2026-09-16 | v381 l1 c1 | 230-12 레드베리암살자 다수 클리어덱 기록용 | Stage 230-12 Redberry Assassin swarm clear deck | `001/evidence/05-nv-guide-board-index.tsv:284` (+2) |
| 41941 | nv | 2026-09-16 | v227 l1 c2 | 236-10 독수리 | Stage 236-10 Cream Eagle | `001/evidence/05-nv-guide-board-index.tsv:286` (+2) |
| 41933 | nv | 2026-09-16 | v72 l0 c0 | 67-30 드디어 클.. | Stage 67-30 finally clear .. | `001/evidence/05-nv-guide-board-index.tsv:287` (+2) |
| 41927 | nv | 2026-09-15 | v100 l0 c0 | 62-30 클리어 덱 | Stage 62-30 clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1521` |
| 41916 | nv | 2026-09-15 | v23 l0 c0 | 61-20 , 61-30 그루터기 | Stage 61-20 , 61-30 Tainted Ent | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:295` (+2) |
| 41905 | nv | 2026-09-15 | v468 l0 c2 | 227-10 쥐토바이 기록용 | Stage 227-10 rat bikers for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1527` |
| 41896 | nv | 2026-09-15 | v696 l7 c11 | 243-10 공략:-) | Stage 243-10 guide | `001/evidence/05-nv-guide-board-index.tsv:289` (+2) |
| 41892 | nv | 2026-09-15 | v358 l1 c4 | 232-30 507.5m | Stage 232-30 507.5m | `001/evidence/05-nv-guide-board-index.tsv:290` (+2) |
| 41886 | nv | 2026-09-15 | v153 l0 c2 | 비겁이깨다가 암걸려 뒤지겠네요 | Cowardly Cookie is giving me cancer | `001/evidence/16-top-players/06-nv-free-board.tsv:1531` |
| 41880 | nv | 2026-09-15 | v156 l0 c0 | 212-10,20,30 클리어덱 | Stage 212-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:291` (+2) |
| 41853 | nv | 2026-09-15 | v199 l1 c2 | 비겁한쿠키 248-30 | Cowardly Cookie 248-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:1534` |
| 41844 | nv | 2026-09-15 | v255 l4 c14 | 242-30 공략:-) | Stage 242-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:299` (+2) |
| 41839 | nv | 2026-09-15 | v308 l0 c0 | 211-10 쥐 삼형제 컷 411m | Stage 211-10 rat biker trio cut 411m | `001/evidence/05-nv-guide-board-index.tsv:293` (+2) |
| 41826 | nv | 2026-09-15 | v145 l0 c0 | 59-10 폭주단바이커 / 59-20 폭주단트럭 / 59-30 비겁이 | Stage 59-10 Rowdy Biker / 59-20 Rowdy Truck / 59-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:301` (+2) |
| 41824 | nv | 2026-09-15 | v404 l1 c0 | 221스테이지 연타덱 / 221-20, 221-30 그루터기 | Stage 221 stage rapid-fire deck / 221-20, 221-30 Tainted Ent | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:302` (+2) |
| 41806 | nv | 2026-09-15 | v95 l0 c0 | 229-30 그루터기 클리어덱 기록용 | Stage 229-30 Tainted Ent clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:297` (+2) |
| 41798 | nv | 2026-09-15 | v420 l2 c2 | 219-30 비겁이 클리어덱 | Stage 219-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:305` (+2) |
| 41791 | nv | 2026-09-15 | v127 l1 c0 | 241-30 공략:-) | Stage 241-30 guide | `001/evidence/05-nv-guide-board-index.tsv:299` (+2) |
| 41735 | nv | 2026-09-15 | v159 l1 c6 | 251 비겁이 피가안다는데.. | Stage 251 Cowardly Cookie HP won't drop | `001/evidence/16-top-players/06-nv-free-board.tsv:1563` |
| 41732 | nv | 2026-09-15 | v778 l6 c11 | 240-30 공략:-) | Stage 240-30 guide | `001/evidence/05-nv-guide-board-index.tsv:300` (+2) |
| 41691 | nv | 2026-09-15 | v79 l1 c1 | 58-30 쿨링민트 | Stage 58-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:301` (+2) |
| 41687 | nv | 2026-09-15 | v41 l0 c5 | 30-30 쿨민 공략좀 ㅠ | Stage 30-30 Cool Mint help | `001/evidence/16-top-players/06-nv-free-board.tsv:1582` |
| 41679 | nv | 2026-09-15 | v112 l0 c0 | 폭탄광(+영상추가) | Bomber (+video) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:309` (+2) |
| 41657 | nv | 2026-09-15 | v413 l1 c0 | 219-10 바이크 클리어덱 | Stage 219-10 Biker clear deck | `001/evidence/05-nv-guide-board-index.tsv:303` (+2) |
| 41639 | nv | 2026-09-15 | v621 l4 c6 | 224-30 비겁이 클리어 덱 / 550M 용병단 3렙 | Stage 224-30 Cowardly Cookie clear deck / 550M, merc Lv3 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:311` (+2) |
| 41603 | nv | 2026-09-15 | v53 l0 c0 | 179-10 바이커 막힘 | Stage 179-10 Biker stuck | `001/evidence/16-top-players/06-nv-free-board.tsv:1620` |
| 41596 | nv | 2026-09-15 | v174 l0 c6 | 스테 장비인데 전 후 ? | Stage gear: before or after? | `001/evidence/16-top-players/06-nv-free-board.tsv:1623` |
| 41583 | nv | 2026-09-15 | v304 l2 c2 | 176-30 비겁이 이 덱으로 드뎌 깼네요 | Finally beat 176-30 Cowardly Cookie with this deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1626` |
| 41581 | nv | 2026-09-15 | v71 l0 c0 | 3-20 어떻게 깨면 되나요??ㅠㅠㅠ | How to clear 3-20? | `001/evidence/16-top-players/06-nv-free-board.tsv:1627` |
| 41575 | nv | 2026-09-15 | v233 l1 c0 | 227-30 비겁이 클리어덱 기록용 | Stage 227-30 Cowardly Cookie clear deck for the record | `001/evidence/16-top-players/05-nv-guide-board.tsv:306` (+2) |
| 41562 | nv | 2026-09-15 | v172 l0 c1 | 176-30 비겁이 클리어덱 기록 | Stage 176-30 Cowardly Cookie clear deck record | `001/evidence/05-nv-guide-board-index.tsv:306` (+2) |
| 41537 | nv | 2026-09-15 | v298 l0 c8 | 대체 뭐가 문제일까요 187-10 | What's wrong at 187-10? | `001/evidence/16-top-players/06-nv-free-board.tsv:1640` |
| 41505 | nv | 2026-09-15 | v137 l0 c0 | 227-30 기록용 | Stage 227-30 for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1648` |
| 41479 | nv | 2026-09-15 | v216 l2 c1 | 쥐토바이(폭주단 바이커) 개선해야 하는 이유 | Why the rat bikers (Rowdy Biker) need fixing | `001/evidence/16-top-players/06-nv-free-board.tsv:1654` |
| 41476 | nv | 2026-09-15 | v350 l1 c1 | 224-30 비겁 | Stage 224-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:308` (+2) |
| 41475 | nv | 2026-09-15 | v304 l1 c2 | 224-30 비겁 클 기록용 | Stage 224-30 Cowardly Cookie clear for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1655` |
| 41472 | nv | 2026-09-15 | v54 l0 c3 | 57-30 쿨민 12.2M 클 | Stage 57-30 Cool Mint 12.2M clear | `001/evidence/05-nv-guide-board-index.tsv:309` (+2) |
| 41464 | nv | 2026-09-15 | v439 l0 c10 | 246-30 쿨민(시커x) | Stage 246-30 Cool Mint ( Brightseeker x) | `001/evidence/16-top-players/06-nv-free-board.tsv:1659` |
| 41462 | nv | 2026-09-15 | v462 l0 c0 | 227-10 삼토바이 클리어덱 기록용 | Stage 227-10 biker trio clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:310` (+2) |
| 41443 | nv | 2026-09-15 | v263 l0 c0 | 251-30 비겁이 | Stage 251-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:318` (+2) |
| 41436 | nv | 2026-09-15 | v328 l0 c5 | 211-30 비겁이 클리어덱 | Stage 211-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:312` (+2) |
| 41434 | nv | 2026-09-15 | v1032 l2 c5 | 이렇게 쓰니까 스테도 나름 잘밀리고 괜찮은듯 | This setup pushes stages fairly well | `001/evidence/16-top-players/06-nv-free-board.tsv:1664` |
| 41430 | nv | 2026-09-15 | v353 l2 c0 | 216-30 비겁이 클덱 | Stage 216-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:313` (+2) |
| 41427 | nv | 2026-09-15 | v480 l2 c1 | 235-10 바이커 클 | Stage 235-10 Biker clear | `001/evidence/05-nv-guide-board-index.tsv:314` (+2) |
| 41419 | nv | 2026-09-15 | v213 l0 c0 | 211-20 트럭 클리어덱 | Stage 211-20 Truck clear deck | `001/evidence/05-nv-guide-board-index.tsv:315` (+2) |
| 41416 | nv | 2026-09-15 | v384 l0 c8 | 비겁이 35로 클리어하시는분들 리스펙합니다 | Respect to those clearing Cowardly Cookie at 35% | `001/evidence/16-top-players/06-nv-free-board.tsv:1669` |
| 41406 | nv | 2026-09-15 | v550 l0 c4 | 243-30 비겁 잠수패치임? | Stage 243-30 Cowardly Cookie stealth-patched? | `001/evidence/16-top-players/06-nv-free-board.tsv:1672` |
| 41403 | nv | 2026-09-15 | v341 l0 c0 | 211-10 쥐토바이 클리어덱 | Stage 211-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:316` (+2) |
| 41400 | nv | 2026-09-15 | v176 l0 c0 | 226-30 쿨민이 클리어덱 기록용 | Stage 226-30 Cool Mint clear deck for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:324` (+2) |
| 41361 | nv | 2026-09-15 | v294 l0 c1 | 200-30 클덱 | Stage 200-30 clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1686` |
| 41359 | nv | 2026-09-15 | v13 l0 c0 | 57-30 쿨민 ㅋ | Stage 57-30 Cool Mint lol | `001/evidence/16-top-players/06-nv-free-board.tsv:1687` |
| 41350 | nv | 2026-09-15 | v121 l0 c5 | 181-20 그루터기 애들이 자꾸 끔살 당하는데 뭐가 문제일까요? | Stage 181-20 Tainted Ent keeps wiping my team; why? | `001/evidence/16-top-players/06-nv-free-board.tsv:1690` |
| 41349 | nv | 2026-09-15 | v333 l0 c5 | 스테보상 180이후로 적어짐?? | Stage rewards smaller after 180? | `001/evidence/16-top-players/06-nv-free-board.tsv:1691` |
| 41334 | nv | 2026-09-14 | v579 l1 c10 | 비겁이는 설계 자체가 미스같은데 | Cowardly Cookie's design is a mistake | `001/evidence/16-top-players/06-nv-free-board.tsv:1695` |
| 41324 | nv | 2026-09-14 | v243 l0 c0 | 210-30 쿨민 클리어덱 | Stage 210-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:319` (+2) |
| 41321 | nv | 2026-09-14 | v181 l1 c1 | 210-30 쿨민 클리어 조합 공유 | Stage 210-30 Cool Mint clear comp share | `001/evidence/05-nv-guide-board-index.tsv:320` (+2) |
| 41315 | nv | 2026-09-14 | v74 l0 c0 | 209-10,20,30 쿨민 클리어덱 | Stage 209-10,20,30 Cool Mint clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:328` (+2) |
| 41312 | nv | 2026-09-14 | v17 l0 c0 | 57-30 쿨링민트 / 우유5성 | Stage 57-30 Cool Mint / Milk 5★ | `001/evidence/05-nv-guide-board-index.tsv:323` (+2) |
| 41304 | nv | 2026-09-14 | v469 l1 c2 | 208-30 비겁이 클리어덱 | Stage 208-30 Cowardly Cookie clear deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:325` (+2) |
| 41303 | nv | 2026-09-14 | v77 l0 c0 | 208-10,20 클리어덱 | Stage 208-10,20 clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:332` (+2) |
| 41301 | nv | 2026-09-14 | v89 l0 c0 | 56-30 비겁이 돌파력300달성 | Stage 56-30 Cowardly Cookie, breakthrough 300 | `001/evidence/05-nv-guide-board-index.tsv:326` (+2) |
| 41284 | nv | 2026-09-14 | v61 l0 c1 | 207-10,20,30 클리어덱 | Stage 207-10,20,30 clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:334` (+2) |
| 41255 | nv | 2026-09-14 | v321 l0 c0 | 203-30 비겁이 클리어 조합 공유 | Stage 203-30 Cowardly Cookie clear comp share | `001/evidence/05-nv-guide-board-index.tsv:328` (+2) |
| 41245 | nv | 2026-09-14 | v265 l1 c0 | 206-20,30 망치공주 쿨민 클리어덱 | Stage 206-20,30 Choco Werehound Princess Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:329` (+2) |
| 41242 | nv | 2026-09-14 | v202 l0 c2 | 스테 보상 너프를 했으면 | If they nerfed stage rewards... | `001/evidence/16-top-players/06-nv-free-board.tsv:1712` |
| 41240 | nv | 2026-09-14 | v142 l1 c1 | 스테이지 273 도착! | Reached stage 273! | `001/evidence/16-top-players/06-nv-free-board.tsv:1713` |
| 41237 | nv | 2026-09-14 | v63 l0 c0 | 75-30 비겁 클리어. | Stage 75-30 Cowardly Cookie clear . | `001/evidence/05-nv-guide-board-index.tsv:330` (+2) |
| 41204 | nv | 2026-09-14 | v149 l0 c0 | 198-10 레드베리암살자 클덱 기록용 | Stage 198-10 Redberry Assassin clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:332` (+2) |
| 41173 | nv | 2026-09-14 | v101 l1 c4 | 10-30 도와주세요 | Stage 10-30 help | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:340` (+2) |
| 41168 | nv | 2026-09-14 | v76 l0 c0 | 40-30 스테이지 무슨 덱으로 하는게 제일 좋은가요? | Best deck for stage 40-30? | `001/evidence/16-top-players/06-nv-free-board.tsv:1723` |
| 41161 | nv | 2026-09-14 | v30 l0 c0 | 78-30 도와주세요 | Stage 78-30 help | `001/evidence/16-top-players/06-nv-free-board.tsv:1728` |
| 41159 | nv | 2026-09-14 | v285 l1 c0 | 224-30 비겁이 클리어덱 기록용 | Stage 224-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:334` (+2) |
| 41158 | nv | 2026-09-14 | v42 l0 c0 | 74-30 쿨민 클리어. | Stage 74-30 Cool Mint clear . | `001/evidence/05-nv-guide-board-index.tsv:335` (+2) |
| 41131 | nv | 2026-09-14 | v351 l2 c2 | 176-30 비겁이덱 (노컨) | Stage 176-30 Cowardly Cookie deck ( no control ) | `001/evidence/05-nv-guide-board-index.tsv:336` (+2) |
| 41122 | nv | 2026-09-14 | v916 l2 c16 | 스테 많이 미신분들 질문!! | Question for those far into stages | `001/evidence/16-top-players/06-nv-free-board.tsv:1735` |
| 41110 | nv | 2026-09-14 | v62 l0 c1 | 친구초대 이벤트 친구가 1-30 넘었는데 | Referral event: friend passed 1-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:1739` |
| 41098 | nv | 2026-09-14 | v118 l0 c0 | 246-20 망치공주 질문이요.. | Stage 246-20 Choco Werehound Princess question | `001/evidence/16-top-players/06-nv-free-board.tsv:1744` |
| 41096 | nv | 2026-09-14 | v105 l0 c4 | 224 스테 등반 중 인데 | Climbing stage 224 | `001/evidence/16-top-players/06-nv-free-board.tsv:1745` |
| 41092 | nv | 2026-09-14 | v129 l0 c2 | 100스테 명중 947인데 충분함? | Stage 100 with 947 accuracy: enough? | `001/evidence/16-top-players/06-nv-free-board.tsv:1747` |
| 41081 | nv | 2026-09-14 | v233 l0 c1 | 203-10 | Stage 203-10 | `001/evidence/16-top-players/06-nv-free-board.tsv:1749` |
| 41078 | nv | 2026-09-14 | v352 l0 c2 | 200-30 비겁이 덱 | Stage 200-30 Cowardly Cookie deck | `001/evidence/05-nv-guide-board-index.tsv:337` (+2) |
| 41065 | nv | 2026-09-14 | v196 l0 c2 | 스테이지 명중 어느정도 챙기시나요 | How much accuracy do you keep for stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:1752` |
| 41055 | nv | 2026-09-14 | v168 l1 c5 | 독수리x 대포o | No Eagle, cannon instead | `001/evidence/16-top-players/06-nv-free-board.tsv:1754` |
| 41023 | nv | 2026-09-14 | v201 l0 c2 | 폭주단 트럭 | Rowdy Truck | `001/evidence/16-top-players/06-nv-free-board.tsv:1763` |
| 41015 | nv | 2026-09-14 | v570 l10 c11 | 무과금 187-30 비겁이 클리어덱 공유 198M | F2P 187-30 Cowardly Cookie clear deck share 198M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:345` (+2) |
| 41011 | nv | 2026-09-14 | v238 l2 c4 | 200-30에서 진행이 막힘 | Stuck at 200-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:1765` |
| 41002 | nv | 2026-09-14 | v370 l1 c3 | 194-30 쿨민 클리어덱(그냥 놔둬도 깨짐) | Stage 194-30 Cool Mint clear deck (clears idle) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:346` (+2) |
| 40982 | nv | 2026-09-14 | v60 l0 c3 | 스테이지 100대 초중반 | Stage low-to-mid 100s | `001/evidence/16-top-players/06-nv-free-board.tsv:1777` |
| 40980 | nv | 2026-09-14 | v143 l0 c1 | 스테이지 난이도 점진적 상향으로 변경해주세요 | Please make stage difficulty rise gradually | `001/evidence/16-top-players/06-nv-free-board.tsv:1778` |
| 40978 | nv | 2026-09-14 | v516 l1 c10 | 211-10 투력 425M 쥐토바이 개극딜 클덱 | Stage 211-10 at 425M: rat bikers heavy-damage clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:1779` |
| 40974 | nv | 2026-09-14 | v498 l2 c6 | 243-30 비겁이(명랑,시커x) | Stage 243-30 Cowardly Cookie (no Cheerful, no Seeker) | `001/evidence/16-top-players/06-nv-free-board.tsv:1780` |
| 40973 | nv | 2026-09-14 | v129 l0 c5 | 무과금 조합 망치공주 조합 206-21 도움될까 올려봐요   스펙은 스샷 필요하면요 말좀해줘요       스샷 올릴게요  스테이지 올라가니까 어렵네요     전 광고  다봐요 | F2P Choco Werehound Princess comp for 206-21 | `001/evidence/16-top-players/06-nv-free-board.tsv:1781` |
| 40948 | nv | 2026-09-14 | v183 l1 c2 | 205-20,30 그루터기 클리어덱 | Stage 205-20,30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:341` (+2) |
| 40941 | nv | 2026-09-14 | v158 l0 c0 | 스테이지덱이랑 크럼블 던전은 어케 해야하나요 | Stage deck and Crumble dungeon: how? | `001/evidence/16-top-players/06-nv-free-board.tsv:1785` |
| 40925 | nv | 2026-09-14 | v150 l0 c1 | 400대 이후 서버중에 248스테 깬사람? | Anyone on a 400+ server cleared stage 248? | `001/evidence/16-top-players/06-nv-free-board.tsv:1791` |
| 40910 | nv | 2026-09-14 | v200 l0 c1 | 99퍼의 유저는 스테이지 난이도가 젤 최악임 | Stage difficulty is the worst part for 99% of players | `001/evidence/16-top-players/06-nv-free-board.tsv:1796` |
| 40908 | nv | 2026-09-14 | v183 l0 c5 | 235 쥐토바이 피드백 | Stage 235 rat bikers feedback | `001/evidence/16-top-players/06-nv-free-board.tsv:1798` |
| 40878 | nv | 2026-09-14 | v44 l0 c0 | 이제 163스테 진행중. 200스테 이후가 개빡이라는데 기대되네여 | At stage 163; heard 200+ is brutal | `001/evidence/16-top-players/06-nv-free-board.tsv:1805` |
| 40877 | nv | 2026-09-14 | v545 l0 c3 | 투력 11등유저가 갑자기 크럼블3등되고 스테도 하루만에 다올리는데 | Power #11 user suddenly Crumble #3 and all stages in a day | `001/evidence/16-top-players/06-nv-free-board.tsv:1806` |
| 40853 | nv | 2026-09-14 | v211 l0 c2 | 무과금 185-30 쿨민 클리어덱 공유 200M | F2P 185-30 Cool Mint clear deck share 200M | `001/evidence/05-nv-guide-board-index.tsv:342` (+2) |
| 40847 | nv | 2026-09-14 | v634 l0 c9 | 비겁이 잡다가 겜 접습니다 | Quitting over Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:1815` |
| 40844 | nv | 2026-09-14 | v115 l0 c0 | 86-30 쿨민 | Stage 86-30 Cool Mint | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:350` (+2) |
| 40837 | nv | 2026-09-14 | v47 l0 c0 | 249-1스테지 | Stage 249-1 stage | `001/evidence/16-top-players/06-nv-free-board.tsv:1820` |
| 40835 | nv | 2026-09-14 | v47 l0 c0 | 86-20 망치공주 | Stage 86-20 Choco Werehound Princess | `001/evidence/16-top-players/05-nv-guide-board.tsv:345` (+2) |
| 40831 | nv | 2026-09-14 | v541 l5 c9 | 무과금 184-30 비겁이 클리어덱 공유 191M | F2P 184-30 Cowardly Cookie clear deck share 191M | `001/evidence/05-nv-guide-board-index.tsv:345` (+2) |
| 40792 | nv | 2026-09-13 | v500 l0 c3 | 171-30 무과금 덱 | Stage 171-30 F2P deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:353` (+2) |
| 40787 | nv | 2026-09-13 | v92 l1 c1 | 54-10 암살자 / 54-20 늑대망치 / 54-30 쿨링민트 체리6성 | Stage 54-10 Assassin / 54-20 Werehound / 54-30 Cool Mint, Cherry 6★ | `001/evidence/05-nv-guide-board-index.tsv:347` (+2) |
| 40782 | nv | 2026-09-13 | v532 l2 c0 | 243-10 쥐토바이 (안죽는 세계선을 찾아서..시커x) | Stage 243-10 rat bikers (searching for a no-death timeline, no Seeker) | `001/evidence/16-top-players/06-nv-free-board.tsv:1840` |
| 40780 | nv | 2026-09-13 | v86 l0 c0 | 51-30 비겁이 허브5성 | Stage 51-30 Cowardly Cookie, Herb 5★ | `001/evidence/05-nv-guide-board-index.tsv:348` (+2) |
| 40777 | nv | 2026-09-13 | v564 l5 c4 | 222-30 쿨링민트 공략 덱(영상O) / 용병단 3렙 / 497M 537k | Stage 222-30 Cool Mint guide deck (video) / merc Lv3 / 497M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:356` (+2) |
| 40770 | nv | 2026-09-13 | v41 l0 c0 | 51-30 비쿠 캇 | Stage 51-30 Cowardly Cookie cut | `001/evidence/16-top-players/06-nv-free-board.tsv:1842` |
| 40730 | nv | 2026-09-13 | v96 l0 c0 | 64-30 드디어 클.. | Stage 64-30 finally clear .. | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:357` (+2) |
| 40719 | nv | 2026-09-13 | v302 l0 c0 | 211-30 비겁이덱 | Stage 211-30 Cowardly Cookie deck | `001/evidence/05-nv-guide-board-index.tsv:351` (+2) |
| 40717 | nv | 2026-09-13 | v234 l1 c3 | 본격! 스테이지에서 세계선을 찾던 내가 토벌전에서도 세계선을 찾게 된 건에 대하여 | From timeline-hunting in stages to timeline-hunting in Conquest | `001/evidence/16-top-players/06-nv-free-board.tsv:1862` |
| 40716 | nv | 2026-09-13 | v118 l0 c0 | 51-10 폭주단바이커 /51-20 폭주단트럭 | Stage 51-10 Rowdy Biker /51-20 Rowdy Truck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:359` (+2) |
| 40695 | nv | 2026-09-13 | v104 l0 c1 | 50-30 쿨링민트 | Stage 50-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:354` (+2) |
| 40693 | nv | 2026-09-13 | v165 l2 c2 | 241-30 쿨링민트 | Stage 241-30 Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:1869` |
| 40688 | nv | 2026-09-13 | v100 l0 c0 | 204-10,20,30 클리어덱 | Stage 204-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:355` (+2) |
| 40675 | nv | 2026-09-13 | v533 l5 c3 | 211-10 바이커 클리어덱 | Stage 211-10 Biker clear deck | `001/evidence/05-nv-guide-board-index.tsv:356` (+2) |
| 40673 | nv | 2026-09-13 | v202 l1 c2 | 스테이지 팁 게시물을보다보면 | Reading stage tip posts... | `001/evidence/16-top-players/06-nv-free-board.tsv:1876` |
| 40671 | nv | 2026-09-13 | v246 l0 c4 | 38-30 쿨링민트(체리콜라덱) | Stage 38-30 Cool Mint ( Cherry Cola deck ) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:364` (+2) |
| 40645 | nv | 2026-09-13 | v248 l0 c1 | 핵이고뭐고 283-30 비겁이 | Hackers or not: 283-30 Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:1883` |
| 40643 | nv | 2026-09-13 | v491 l0 c8 | 명량사용안함  노광제 무과금덱203-30 클리어덱 조합 공유  클리어 하시길 | No Cheerful, no Gwangje, F2P 203-30 clear deck share | `001/evidence/16-top-players/06-nv-free-board.tsv:1884` |
| 40632 | nv | 2026-09-13 | v83 l0 c0 | 203지 비겁한 쿠키에 막힘... | Stuck on Cowardly Cookie at 203 | `001/evidence/16-top-players/06-nv-free-board.tsv:1886` |
| 40624 | nv | 2026-09-13 | v399 l0 c0 | 203-30 비겁이 클리어덱 | Stage 203-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:359` (+2) |
| 40613 | nv | 2026-09-13 | v142 l0 c11 | 도움 좀 주실수있을까요 34-30에 쿨링민트 한테 막혔어요 | Stuck on Cool Mint at 34-30; help | `001/evidence/16-top-players/06-nv-free-board.tsv:1889` |
| 40610 | nv | 2026-09-13 | v297 l1 c0 | 219-30 비겁 컷 기록용 | Stage 219-30 Cowardly Cookie cut for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:1891` |
| 40597 | nv | 2026-09-13 | v33 l0 c1 | 24-30 공략 방법 좀요 ㅠ | Stage 24-30 guide please | `001/evidence/16-top-players/06-nv-free-board.tsv:1894` |
| 40594 | nv | 2026-09-13 | v138 l1 c1 | 쥐토바이 << 얘가 접은유저중 50퍼는 만들었음 ㄹㅇㅋㅋㅋ | Rat bikers caused half of all quits | `001/evidence/16-top-players/06-nv-free-board.tsv:1896` |
| 40559 | nv | 2026-09-13 | v47 l0 c0 | 49-30 쿨링민트 | Stage 49-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:360` (+2) |
| 40535 | nv | 2026-09-13 | v572 l0 c0 | 240-30 비겁이(명랑,시커x) | Stage 240-30 Cowardly Cookie (no Cheerful, no Seeker) | `001/evidence/16-top-players/06-nv-free-board.tsv:1916` |
| 40528 | nv | 2026-09-13 | v2258 l66 c14 | 스테이지 덱 공유 | stage deck share | `001/evidence/16-top-players/06-nv-free-board.tsv:1920` |
| 40523 | nv | 2026-09-13 | v237 l1 c0 | 187-30 | Stage 187-30 | `001/evidence/05-nv-guide-board-index.tsv:361` (+2) |
| 40520 | nv | 2026-09-13 | v92 l1 c0 | 48-30 비겁이 이온5성 | Stage 48-30 Cowardly Cookie, Ion 5★ | `001/evidence/16-top-players/05-nv-guide-board.tsv:363` (+2) |
| 40510 | nv | 2026-09-13 | v575 l0 c0 | 219-10 쥐돌이 클 | Stage 219-10 rat bikers clear | `001/evidence/16-top-players/06-nv-free-board.tsv:1924` |
| 40509 | nv | 2026-09-13 | v50 l0 c0 | 선생님들 3430 쿨링민트 도와주십쇼ㅜㅜㅜ | Stage 34-30 Cool Mint help please | `001/evidence/16-top-players/06-nv-free-board.tsv:1925` |
| 40490 | nv | 2026-09-13 | v139 l0 c0 | 72-30 비겁 쉽게 클리어하는 덱 | Easy deck for 72-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:370` (+2) |
| 40476 | nv | 2026-09-13 | v509 l5 c13 | 238-30 공략:-) | Stage 238-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:372` (+2) |
| 40466 | nv | 2026-09-13 | v926 l0 c10 | 203-10입니다 쥐토바이 깼어요 감사합니다   무과금에 슈가룬 언제부터해야되나요  스샷 추가하는게 도움될까요   2번째  3번째 쥐토바이  조합 올렸어요  깨신분있나요  전 광고  다봐요 | Stage 203-10 rat bikers cleared; when to start runes as F2P? | `001/evidence/16-top-players/06-nv-free-board.tsv:1936` |
| 40460 | nv | 2026-09-13 | v320 l3 c4 | 238-20 공략:-) | Stage 238-20 guide | `001/evidence/05-nv-guide-board-index.tsv:366` (+2) |
| 40453 | nv | 2026-09-13 | v125 l0 c1 | 246-30에서 멈췄어요 도와주세요 | Stopped at 246-30; help | `001/evidence/16-top-players/06-nv-free-board.tsv:1942` |
| 40443 | nv | 2026-09-13 | v430 l1 c0 | 216-30 비겁이 클리어덱 기록용 | Stage 216-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:367` (+2) |
| 40440 | nv | 2026-09-13 | v134 l1 c4 | 쥐돌이 때문에 하기가 싫어지네 | Rat bikers make me not want to play | `001/evidence/16-top-players/06-nv-free-board.tsv:1944` |
| 40438 | nv | 2026-09-13 | v44 l0 c0 | 쥐돌이 때문에 미치겠네 | Rat bikers driving me mad | `001/evidence/16-top-players/06-nv-free-board.tsv:1945` |
| 40430 | nv | 2026-09-13 | v166 l0 c0 | 스테이지 존버 해야겠어요 ㅠ ㅠ | Guess I'll wait it out on stages | `001/evidence/16-top-players/06-nv-free-board.tsv:1951` |
| 40429 | nv | 2026-09-13 | v329 l0 c2 | 다들 스테이지 보상 제대로 들어오시나요?? | Are stage rewards arriving properly? | `001/evidence/16-top-players/06-nv-free-board.tsv:1952` |
| 40415 | nv | 2026-09-13 | v216 l4 c0 | 소통도 시작했지만, 그럼에도 부족한 점이 많긴하네요. 스테 별 유저 이탈지점 파악해봐요 | Let's map where players quit, by stage | `001/evidence/16-top-players/06-nv-free-board.tsv:1958` |
| 40394 | nv | 2026-09-12 | v314 l3 c0 | 237-20 공략:-) | Stage 237-20 guide | `001/evidence/05-nv-guide-board-index.tsv:368` (+2) |
| 40387 | nv | 2026-09-12 | v470 l0 c0 | 248스테이지 이후 249스테이지부터는 좀 쉽다고했는대 저는 왜 그대로 인가요 ㅠㅠ | Heard 249+ is easier than 248; not for me | `001/evidence/16-top-players/06-nv-free-board.tsv:1967` |
| 40385 | nv | 2026-09-12 | v826 l2 c12 | 235-30 공략:-) | Stage 235-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:376` (+2) |
| 40384 | nv | 2026-09-12 | v160 l0 c0 | 10-30 쿨링민트 (우유×,체리콜라O) | Stage 10-30 Cool Mint ( Milk ×, Cherry Cola O) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:377` (+2) |
| 40380 | nv | 2026-09-12 | v162 l0 c1 | 201-10,20,30 쿨민 클리어덱 | Stage 201-10,20,30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:371` (+2) |
| 40375 | nv | 2026-09-12 | v794 l3 c9 | 243-10 쥐돌이 노전갈덱 | Stage 243-10 rat bikers no-Scorpion deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:379` (+2) |
| 40370 | nv | 2026-09-12 | v61 l0 c0 | 72-30 덱 | Stage 72-30 deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:380` (+2) |
| 40359 | nv | 2026-09-12 | v71 l0 c0 | 46-30 쿨민 ㅋ | Stage 46-30 Cool Mint lol | `001/evidence/16-top-players/06-nv-free-board.tsv:1972` |
| 40341 | nv | 2026-09-12 | v117 l0 c0 | 179-30 도와주세요 | Stage 179-30 help | `001/evidence/16-top-players/06-nv-free-board.tsv:1977` |
| 40338 | nv | 2026-09-12 | v456 l0 c3 | 200-30 비겁이 클리어덱 | Stage 200-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:374` (+2) |
| 40322 | nv | 2026-09-12 | v57 l0 c0 | 199-20,30 클리어덱 | Stage 199-20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:375` (+2) |
| 40311 | nv | 2026-09-12 | v182 l0 c0 | 203-30 기록용 | Stage 203-30 for the record | `001/evidence/05-nv-guide-board-index.tsv:376` (+2) |
| 40306 | nv | 2026-09-12 | v264 l0 c1 | 211-10 | Stage 211-10 | `001/evidence/05-nv-guide-board-index.tsv:377` (+2) |
| 40296 | nv | 2026-09-12 | v862 l5 c2 | 216-30 219-30 비겁이 공략 / 용병단 3렙 | Stage 216-30 and 219-30 Cowardly Cookie guide / merc Lv3 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:385` (+2) |
| 40291 | nv | 2026-09-12 | v447 l4 c2 | 235-20 공략:-) | Stage 235-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:386` (+2) |
| 40281 | nv | 2026-09-12 | v112 l0 c0 | 70-30 쿨민 그냥 무조건 7시가서 때리면 쉽게 클리어해요 | Stage 70-30 Cool Mint: go to 7 o'clock and hit, easy clear | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:388` (+2) |
| 40267 | nv | 2026-09-12 | v980 l8 c19 | 235-10 공략:-) | Stage 235-10 guide | `001/evidence/05-nv-guide-board-index.tsv:382` (+2) |
| 40223 | nv | 2026-09-12 | v709 l2 c2 | 208-30 비겁한 쿠키 386M | Stage 208-30 Cowardly Cookie 386M | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:390` (+2) |
| 40215 | nv | 2026-09-12 | v91 l0 c0 | 99-30 비겁이 클리어덱 | Stage 99-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:393` (+2) |
| 40200 | nv | 2026-09-12 | v351 l1 c0 | 198-10,20,30 망치공주 쿨민  클리어덱 | Stage 198-10,20,30 Choco Werehound Princess Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:387` (+2) |
| 40197 | nv | 2026-09-12 | v186 l0 c5 | 32-30 스테이지 공략 질문 | Stage 32-30 stage guide question | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:395` (+2) |
| 40170 | nv | 2026-09-12 | v24 l0 c0 | 98-30 쿨민 클리어덱 | Stage 98-30 Cool Mint clear deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:390` (+2) |
| 40149 | nv | 2026-09-12 | v322 l0 c6 | 스테이지에서 집중 명중 챙겨야 하는 게 대략 어느 스테이지부터인가요? | From which stage do focus/accuracy matter? | `001/evidence/16-top-players/06-nv-free-board.tsv:2011` |
| 40138 | nv | 2026-09-12 | v39 l0 c0 | 47-30 도마뱀 피노누아8성 | Stage 47-30 Lizard, Pinot Noir 8★ | `001/evidence/05-nv-guide-board-index.tsv:391` (+2) |
| 40131 | nv | 2026-09-12 | v219 l2 c2 | 234-30 공략:-) | Stage 234-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:399` (+2) |
| 40123 | nv | 2026-09-12 | v142 l0 c1 | 107-10 연타덱 자동 60M | Stage 107-10 rapid-fire deck auto 60M | `001/evidence/05-nv-guide-board-index.tsv:393` (+2) |
| 40109 | nv | 2026-09-12 | v46 l0 c0 | 68-30 무과금 보스덱 | Stage 68-30 F2P boss deck | `001/evidence/05-nv-guide-board-index.tsv:394` (+2) |
| 40106 | nv | 2026-09-12 | v54 l0 c0 | 56-30 드디어 클.. | Stage 56-30 finally clear .. | `001/evidence/05-nv-guide-board-index.tsv:395` (+2) |
| 40104 | nv | 2026-09-12 | v1929 l12 c0 | 체리콜라 활용 신규 스테이지 덱 추천 / 쿨링민트, 그루터기, 비겁한쿠키, 망치공주 덱 따로 공유 | Cherry Cola new stage deck + Cool Mint, Tainted Ent, Cowardly, Werehound decks | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:403` (+2) |
| 40098 | nv | 2026-09-12 | v155 l0 c0 | 비겁이컷 원래빡신가요? | Is the Cowardly Cookie cut normally this hard? | `001/evidence/16-top-players/06-nv-free-board.tsv:2020` |
| 40094 | nv | 2026-09-12 | v358 l2 c3 | 팀투 2g 스테이지 등반 | team power 2g stage climb | `001/evidence/16-top-players/06-nv-free-board.tsv:2021` |
| 40092 | nv | 2026-09-12 | v307 l2 c2 | 238-20 망치공주(시커x,체콜채용) | Stage 238-20 Choco Werehound Princess (no Seeker, with Cherry Cola) | `001/evidence/16-top-players/06-nv-free-board.tsv:2022` |
| 40087 | nv | 2026-09-12 | v92 l0 c0 | 폭쥬단 트럭 ㅋㅋㅋㅋㅅㅂ | Rowdy Truck rant | `001/evidence/16-top-players/06-nv-free-board.tsv:2023` |
| 40084 | nv | 2026-09-12 | v170 l0 c2 | 46-20 늑대망치 / 46-30 쿨링민트 체리콜라5성 | Stage 46-20 Werehound / 46-30 Cool Mint, Cherry Cola 5★ | `001/evidence/05-nv-guide-board-index.tsv:397` (+2) |
| 40080 | nv | 2026-09-12 | v1106 l16 c9 | 공공의 적 레드베리 암살자 파괴공략법(영상시청필수) | Redberry Assassin destruction guide (watch the video) | `001/evidence/05-nv-guide-board-index.tsv:398` (+2) |
| 40067 | nv | 2026-09-12 | v122 l0 c0 | 216-30 주차시작 | Parked at 216-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:2028` |
| 40039 | nv | 2026-09-12 | v133 l0 c4 | 삼토바이 개ㅈ까치 잘만들었다.. | Biker trio is well-made trash | `001/evidence/16-top-players/06-nv-free-board.tsv:2038` |
| 40027 | nv | 2026-09-12 | v24 l0 c0 | 97-30 쿨민 클리어덱 | Stage 97-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:401` (+2) |
| 40015 | nv | 2026-09-12 | v532 l0 c0 | 체리콜라를 사용한 레드베리암살자 사냥덱 | Redberry Assassin hunting deck with Cherry Cola | `001/evidence/16-top-players/06-nv-free-board.tsv:2044` |
| 40009 | nv | 2026-09-12 | v738 l4 c15 | 200-30 비겁한쿠키 입니다 무과금   광제  다들 여기까지 올수있어요  스펙이 궁금하면  스샷 추가할게요  도움이 되는가요  깨신분있나요   전 광고  다봐요 | F2P 200-30 Cowardly Cookie cleared; spec screenshots on request | `001/evidence/16-top-players/06-nv-free-board.tsv:2045` |
| 40000 | nv | 2026-09-12 | v92 l0 c0 | 열심히 스테이지 깨는걸 방해하는 그녀석 | The thing that blocks stage clears | `001/evidence/16-top-players/06-nv-free-board.tsv:2047` |
| 39997 | nv | 2026-09-12 | v92 l0 c0 | 693m 24030 비겁이 | 693m 24030 Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:2049` |
| 39990 | nv | 2026-09-12 | v74 l2 c3 | 쥐토바이 | rat bikers | `001/evidence/16-top-players/06-nv-free-board.tsv:2051` |
| 39958 | nv | 2026-09-12 | v190 l0 c0 | 67-30 비겁은 언제나 힘들어 체리콜라맛 | Stage 67-30 Cowardly Cookie always hard, Cherry Cola | `001/evidence/16-top-players/05-nv-guide-board.tsv:404` (+2) |
| 39954 | nv | 2026-09-12 | v494 l2 c8 | 무과금 179-30 비겁이 클리어덱 공유 161M | F2P 179-30 Cowardly Cookie clear deck share 161M | `001/evidence/05-nv-guide-board-index.tsv:404` (+2) |
| 39946 | nv | 2026-09-12 | v164 l0 c0 | 238-30 쿨민 잡기 | Taking down 238-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:405` (+2) |
| 39916 | nv | 2026-09-12 | v88 l1 c1 | 180-10 독수리 클리어덱 | Stage 180-10 Cream Eagle clear deck | `001/evidence/05-nv-guide-board-index.tsv:406` (+2) |
| 39897 | nv | 2026-09-12 | v134 l2 c0 | 238-20 망치부인 2트클 덱 공유 | Stage 238-20 Werehound Princess 2nd-try clear deck share | `001/evidence/05-nv-guide-board-index.tsv:407` (+2) |
| 39892 | nv | 2026-09-12 | v76 l0 c0 | 쥐토바이 의도가 대체 뭐냐? | What's the point of the rat bikers? | `001/evidence/16-top-players/06-nv-free-board.tsv:2069` |
| 39869 | nv | 2026-09-12 | v406 l0 c0 | 211-30 비겁이 클리어덱 기록용 | Stage 211-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:408` (+2) |
| 39866 | nv | 2026-09-12 | v39 l0 c0 | 46-10 암살자 | Stage 46-10 Redberry Assassin | `001/evidence/05-nv-guide-board-index.tsv:409` (+2) |
| 39858 | nv | 2026-09-12 | v177 l0 c0 | 비겁이 잠수패치함? | Cowardly Cookie stealth-patched? | `001/evidence/16-top-players/06-nv-free-board.tsv:2082` |
| 39856 | nv | 2026-09-12 | v29 l0 c0 | 46-20 ㅋ | Stage 46-20 lol | `001/evidence/16-top-players/06-nv-free-board.tsv:2084` |
| 39843 | nv | 2026-09-11 | v226 l0 c1 | 다음주 스테이지 완화 없으면 ㅈㅈ일듯 | Game's done if no stage easing next week | `001/evidence/16-top-players/06-nv-free-board.tsv:2087` |
| 39838 | nv | 2026-09-11 | v204 l0 c2 | 고수님들 스테이지덱 어떤게 나은지 부탁드립니다 | Which stage deck is better? | `001/evidence/16-top-players/06-nv-free-board.tsv:2088` |
| 39829 | nv | 2026-09-11 | v262 l0 c3 | 197-10,20,30 그루터기 클리어덱 | Stage 197-10,20,30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:410` (+2) |
| 39828 | nv | 2026-09-11 | v174 l2 c0 | 233-30 공략:-) | Stage 233-30 guide | `001/evidence/05-nv-guide-board-index.tsv:411` (+2) |
| 39824 | nv | 2026-09-11 | v326 l0 c0 | 비겁이는 정말 짜증난다. 184-30 클리어 성공 | Cowardly Cookie is annoying; 184-30 cleared | `001/evidence/16-top-players/06-nv-free-board.tsv:2091` |
| 39821 | nv | 2026-09-11 | v67 l1 c1 | 45-20 그루터기 / 45-30 그루터기 | Stage 45-20 Tainted Ent / 45-30 Tainted Ent | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:419` (+2) |
| 39818 | nv | 2026-09-11 | v848 l5 c9 | 232-30 공략:-) | Stage 232-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:420` (+2) |
| 39806 | nv | 2026-09-11 | v487 l2 c2 | 235-30 비겁이(체리콜라) | Stage 235-30 Cowardly Cookie ( Cherry Cola ) | `001/evidence/16-top-players/06-nv-free-board.tsv:2099` |
| 39795 | nv | 2026-09-11 | v262 l1 c8 | 43-30 비겁이 돌파력200달성 | Stage 43-30 Cowardly Cookie, breakthrough 200 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:421` (+2) |
| 39779 | nv | 2026-09-11 | v70 l0 c1 | 212스테이상 35투력으로 삼토 비겁 등 잡는거 찾고있는데 복지3렙으로 가는거 얼마나 있나.. 안보이는데 | Seeking 212+ at 35% power vs biker trio/Cowardly with perk Lv3 | `001/evidence/16-top-players/06-nv-free-board.tsv:2104` |
| 39771 | nv | 2026-09-11 | v292 l2 c1 | 237-10 독버섯 오토덱 | Stage 237-10 poison mushroom auto deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:422` (+2) |
| 39760 | nv | 2026-09-11 | v340 l0 c0 | 219-30 비겁한쿠키 클리어덱 | Stage 219-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:423` (+2) |
| 39742 | nv | 2026-09-11 | v160 l0 c0 | 66-30 쿨민 체리콜라맛 쿠키 | Stage 66-30 Cool Mint Cherry Cola | `001/evidence/05-nv-guide-board-index.tsv:418` (+2) |
| 39733 | nv | 2026-09-11 | v86 l0 c0 | 43-20 폭주단트럭 석류5성 | Stage 43-20 Rowdy Truck, Pomegranate 5★ | `001/evidence/05-nv-guide-board-index.tsv:419` (+2) |
| 39724 | nv | 2026-09-11 | v96 l0 c3 | 43-10 폭주단바이커 | Stage 43-10 Rowdy Biker | `001/evidence/16-top-players/05-nv-guide-board.tsv:421` (+2) |
| 39713 | nv | 2026-09-11 | v121 l1 c5 | 42-30 쿨링민트 | Stage 42-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:422` (+2) |
| 39710 | nv | 2026-09-11 | v8104 l223 c40 | NEW 스테이지 덱 | NEW stage deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:430` (+2) |
| 39702 | nv | 2026-09-11 | v841 l0 c12 | 259-10 폭주단 바이크 (쥐돌이, 쥐바이크) 하향?? | Stage 259-10 Rowdy Biker ( rat bikers , rat bikers ) nerf ?? | `001/evidence/05-nv-guide-board-index.tsv:424` (+2) |
| 39655 | nv | 2026-09-11 | v488 l4 c3 | 쥐토바이 200번대 이상 층에서 너무 기괴하지않나요? | Rat bikers too grotesque past stage 200 | `001/evidence/16-top-players/06-nv-free-board.tsv:2130` |
| 39585 | nv | 2026-09-11 | v183 l0 c2 | 38-30 쿨민 3.5M | Stage 38-30 Cool Mint 3.5M | `001/evidence/05-nv-guide-board-index.tsv:427` (+2) |
| 39576 | nv | 2026-09-11 | v574 l0 c2 | 체리콜라 스테이지 전용으로 좋네 | Cherry Cola good as a stage-only cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:2149` |
| 39569 | nv | 2026-09-11 | v104 l2 c0 | 최신덱))59-10(쥐 세 마리) | Latest deck: 59-10 (rat biker trio) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:435` (+2) |
| 39563 | nv | 2026-09-11 | v204 l0 c2 | 이 공격력으로 몇스테이지까지 깨지나요?? | How far can this ATK clear? | `001/evidence/16-top-players/06-nv-free-board.tsv:2155` |
| 39561 | nv | 2026-09-11 | v590 l0 c8 | 211-10 쥐돌이 ㅈ같은거 클 | Stage 211-10 rat bikers cleared | `001/evidence/16-top-players/06-nv-free-board.tsv:2156` |
| 39557 | nv | 2026-09-11 | v387 l0 c7 | 스테이지 제외 장비질문(토벌 타워 아레나등) | Gear question outside stages (conquest, tower, arena) | `001/evidence/16-top-players/06-nv-free-board.tsv:2158` |
| 39549 | nv | 2026-09-11 | v684 l2 c0 | 235-10 딜 부족 뜨면 이 덱을 해보세요 | Stage 235-10: try this deck if short on damage | `001/evidence/05-nv-guide-board-index.tsv:430` (+2) |
| 39527 | nv | 2026-09-11 | v745 l0 c3 | 체리콜라 스테이지에서는 좋은 것 같네요 | Cherry Cola seems good in stages | `001/evidence/16-top-players/06-nv-free-board.tsv:2163` |
| 39508 | nv | 2026-09-11 | v346 l1 c2 | 무과금 179-10 쥐돌이 클리어덱 공유 | F2P 179-10 rat bikers clear deck share | `001/evidence/05-nv-guide-board-index.tsv:431` (+2) |
| 39503 | nv | 2026-09-11 | v156 l0 c1 | 체리콜라 망치에선 쓸만한것같기도 | Cherry Cola usable vs Werehound Princess | `001/evidence/16-top-players/06-nv-free-board.tsv:2168` |
| 39494 | nv | 2026-09-11 | v214 l0 c1 | 월요일에 스테이지 핫픽스 해라 | Hotfix the stages on Monday | `001/evidence/16-top-players/06-nv-free-board.tsv:2172` |
| 39484 | nv | 2026-09-11 | v170 l0 c0 | 노명랑비겁 | Cowardly Cookie without Cheerful | `001/evidence/16-top-players/06-nv-free-board.tsv:2173` |
| 39480 | nv | 2026-09-11 | v334 l0 c0 | 200-30 기록용 | Stage 200-30 for the record | `001/evidence/05-nv-guide-board-index.tsv:432` (+2) |
| 39462 | nv | 2026-09-11 | v286 l0 c0 | 체콜 8성 써보는데 일단 스테에서는 딸크 상위호환인 듯 | Cherry Cola 8★ outclasses Strawberry Crepe in stages | `001/evidence/16-top-players/06-nv-free-board.tsv:2179` |
| 39449 | nv | 2026-09-11 | v644 l1 c6 | 235-10 쥐돌이(체리콜라) | Stage 235-10 rat bikers ( Cherry Cola ) | `001/evidence/16-top-players/06-nv-free-board.tsv:2182` |
| 39447 | nv | 2026-09-11 | v432 l0 c5 | 그래서 기존스테이지 너프 안하냐? | So no nerf to existing stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:2183` |
| 39438 | nv | 2026-09-11 | v212 l2 c0 | 196-10,20,30 클리어덱 | Stage 196-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:434` (+2) |
| 39424 | nv | 2026-09-11 | v240 l1 c3 | 32-30 비겁이 | Stage 32-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:443` (+2) |
| 39392 | nv | 2026-09-11 | v743 l2 c3 | 195-30 비겁이 킇리어덱 | Stage 195-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:444` (+2) |
| 39379 | nv | 2026-09-11 | v2114 l3 c18 | 어거지로 쓰고있지만 체리콜라를 스테에서조차도 쓰기가 어려운 이유는 이거때문입니다 | Why Cherry Cola is hard to use even in stages | `001/evidence/16-top-players/06-nv-free-board.tsv:2196` |
| 39365 | nv | 2026-09-11 | v619 l2 c0 | 232-30 (비겁) / 233-30(쿨민) / 234-30 (쿨민) | Stage 232-30 ( Cowardly Cookie ) / 233-30( Cool Mint ) / 234-30 ( Cool Mint ) | `001/evidence/16-top-players/06-nv-free-board.tsv:2200` |
| 39350 | nv | 2026-09-11 | v333 l3 c10 | 232-20 공략:-) | Stage 232-20 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:445` (+2) |
| 39315 | nv | 2026-09-10 | v514 l5 c4 | 230-30 공략:-) | Stage 230-30 guide | `001/evidence/05-nv-guide-board-index.tsv:440` (+2) |
| 39312 | nv | 2026-09-10 | v319 l5 c0 | 230-20 공략:-) | Stage 230-20 guide | `001/evidence/05-nv-guide-board-index.tsv:441` (+2) |
| 39311 | nv | 2026-09-10 | v255 l2 c2 | 229-20 / 229-30 공략:-) | Stage 229-20 / 229-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:449` (+2) |
| 39303 | nv | 2026-09-10 | v54 l0 c0 | 41-30 쿨민 컷 | Stage 41-30 Cool Mint cut | `001/evidence/16-top-players/06-nv-free-board.tsv:2213` |
| 39302 | nv | 2026-09-10 | v73 l0 c0 | 41-30 쿨링민트 | Stage 41-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:444` (+2) |
| 39294 | nv | 2026-09-10 | v840 l0 c11 | 비겁한쿠키 하.. 다들 스테이지어디인가요 광제유저   무과금 유저분들 어디까지가 최대인가요 스테이지요   전 광고  다봐요 | Cowardly Cookie sigh; how far is everyone? | `001/evidence/16-top-players/06-nv-free-board.tsv:2217` |
| 39291 | nv | 2026-09-10 | v971 l4 c0 | 227-30 공략:-) | Stage 227-30 guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:446` (+2) |
| 39290 | nv | 2026-09-10 | v175 l0 c1 | 223-30 (585M) 와플 도마뱀 | Stage 223-30 (585M) Waffle Lizard | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:453` (+2) |
| 39288 | nv | 2026-09-10 | v255 l2 c4 | 40-30 비겁이 | Stage 40-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:454` (+2) |
| 39282 | nv | 2026-09-10 | v128 l0 c0 | 40-30 비쿠련 컷 | Stage 40-30 Cowardly Cookie cut | `001/evidence/16-top-players/06-nv-free-board.tsv:2220` |
| 39279 | nv | 2026-09-10 | v1221 l2 c15 | 227-10 공략:-) | Stage 227-10 guide | `001/evidence/05-nv-guide-board-index.tsv:448` (+2) |
| 39268 | nv | 2026-09-10 | v65 l0 c0 | 40-29 체리콜라3성 | Stage 40-29 Cherry Cola 3★ | `001/evidence/05-nv-guide-board-index.tsv:449` (+2) |
| 39261 | nv | 2026-09-10 | v140 l0 c1 | 스테 전후..골라줘요.. | Stage gear before/after, pick one | `001/evidence/16-top-players/06-nv-free-board.tsv:2225` |
| 39257 | nv | 2026-09-10 | v42 l0 c0 | 40-26 / 40-28 활11강달성 | Stage 40-26 / 40-28, bow +11 | `001/evidence/05-nv-guide-board-index.tsv:450` (+2) |
| 39241 | nv | 2026-09-10 | v77 l0 c0 | 220-20 (565M) 망치부인 | Stage 220-20 (565M) Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:451` (+2) |
| 39234 | nv | 2026-09-10 | v54 l0 c0 | 40-19 피겨5성 (검10강달성) | Stage 40-19 Skating Queen 5★ (sword +10) | `001/evidence/05-nv-guide-board-index.tsv:452` (+2) |
| 39230 | nv | 2026-09-10 | v41 l0 c0 | 72-30  30.65M | Stage 72-30 30.65M | `001/evidence/05-nv-guide-board-index.tsv:453` (+2) |
| 39199 | nv | 2026-09-10 | v400 l4 c6 | 226-30 공략:-) | Stage 226-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:462` (+2) |
| 39197 | nv | 2026-09-10 | v68 l1 c0 | 96-30 비쿠 클리어 | Stage 96-30 Cowardly Cookie clear | `001/evidence/05-nv-guide-board-index.tsv:456` (+2) |
| 39171 | nv | 2026-09-10 | v239 l2 c5 | 225-30 공략:-) | Stage 225-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:465` (+2) |
| 39167 | nv | 2026-09-10 | v305 l0 c0 | 195-30 기록용 | Stage 195-30 for the record | `001/evidence/05-nv-guide-board-index.tsv:459` (+2) |
| 39149 | nv | 2026-09-10 | v492 l1 c0 | 64-30 비겁 클리어 체리콜라 맛 쿠키 으로 무과금 | Stage 64-30 Cowardly Cookie cleared F2P with Cherry Cola | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:467` (+2) |
| 39141 | nv | 2026-09-10 | v176 l0 c2 | 32-30 스팩부족인가 아이스크림 처럼 녹아버리네요 ...ㄷㄷ | Stage 32-30: melting; under-specced? | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:468` (+2) |
| 39134 | nv | 2026-09-10 | v375 l1 c0 | 202-30 쿨링민트맛 쿠키 317M | Stage 202-30 Cool Mint 317M | `001/evidence/05-nv-guide-board-index.tsv:462` (+2) |
| 39121 | nv | 2026-09-10 | v379 l2 c11 | 혹시 스테이지 덱 바꿔야 할 부분 있을까요? | Anything to change in my stage deck? | `001/evidence/16-top-players/06-nv-free-board.tsv:2266` |
| 39103 | nv | 2026-09-10 | v366 l0 c2 | 219-30 (520m) 비겁 | Stage 219-30 (520m) Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:464` (+2) |
| 39101 | nv | 2026-09-10 | v165 l0 c2 | 스테이지 덱 추천 해주세용 ㅠㅠ | Stage deck recommendation please | `001/evidence/16-top-players/06-nv-free-board.tsv:2271` |
| 39098 | nv | 2026-09-10 | v281 l3 c0 | 스테이지 이따위로 확장할거면 확장을 하지마세요 | Don't expand stages if it's like this | `001/evidence/16-top-players/06-nv-free-board.tsv:2272` |
| 39089 | nv | 2026-09-10 | v704 l5 c0 | 224-30 공략:-) | Stage 224-30 guide | `001/evidence/05-nv-guide-board-index.tsv:465` (+2) |
| 39075 | nv | 2026-09-10 | v728 l2 c1 | 219-10 (521M) 쥐돌이 | Stage 219-10 (521M) rat bikers | `001/evidence/05-nv-guide-board-index.tsv:467` (+2) |
| 39060 | nv | 2026-09-10 | v168 l0 c4 | 현재 110스테이지 조금 넘었습니다! | Just past stage 110! | `001/evidence/16-top-players/06-nv-free-board.tsv:2285` |
| 39056 | nv | 2026-09-10 | v190 l1 c0 | 전갈없이 밀어보기(잡스테) | Pushing without Scorpion (normal stages) | `001/evidence/16-top-players/06-nv-free-board.tsv:2286` |
| 39052 | nv | 2026-09-10 | v225 l0 c6 | 스테이지덱 알려주세요 ㅜㅠ | Stage deck please | `001/evidence/16-top-players/06-nv-free-board.tsv:2287` |
| 39048 | nv | 2026-09-10 | v519 l0 c4 | 신쿠 스테이지 성능은 어떤가요 | How does the new cookie do in stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:2290` |
| 39042 | nv | 2026-09-10 | v210 l0 c2 | 근데 스테이지 보상 한번에 받는거 나만 사라짐? | Bulk stage-reward claim gone for me only? | `001/evidence/16-top-players/06-nv-free-board.tsv:2294` |
| 38956 | nv | 2026-09-10 | v175 l0 c4 | 반죽 반퀘 어느스테까지 가먄 안올라가요?? | Up to which stage does the dough repeat quest scale? | `001/evidence/16-top-players/06-nv-free-board.tsv:2330` |
| 38932 | nv | 2026-09-10 | v123 l1 c1 | 스테이지 캐릭별 미터기는 안나오겠죠? | No per-cookie damage meter in stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:2341` |
| 38921 | nv | 2026-09-10 | v279 l0 c1 | 마일리지 10만개 소모시 스테이지 클리어권 어떰? | Stage-clear ticket for 100k mileage? | `001/evidence/16-top-players/06-nv-free-board.tsv:2349` |
| 38879 | nv | 2026-09-10 | v167 l2 c2 | 스테이지 난이도에 대한 개인적 의견 | Personal opinion on stage difficulty | `001/evidence/16-top-players/06-nv-free-board.tsv:2374` |
| 38867 | nv | 2026-09-10 | v102 l0 c1 | 걍 스테이지 첨부터 무한으로 열어버려라. | Just open infinite stages from the start | `001/evidence/16-top-players/06-nv-free-board.tsv:2381` |
| 38861 | nv | 2026-09-10 | v704 l7 c0 | 조합추천, 슈가룬추천, 스텔라시뮬레이션, 스테이지정보 도우미 사이트입니다 | Helper site: comps, runes, Stella sim, stage info | `001/evidence/16-top-players/06-nv-free-board.tsv:2384` |
| 38839 | nv | 2026-09-10 | v76 l0 c0 | 스테이지 깰 맛 안난다, 차라리 퀘스트없애라 | No joy in clearing stages; drop the quests | `001/evidence/16-top-players/06-nv-free-board.tsv:2398` |
| 38734 | nv | 2026-09-10 | v984 l1 c9 | 스테이지 구 말렙 클리어 | Cleared the old max stage | `001/evidence/16-top-players/06-nv-free-board.tsv:2440` |
| 38704 | nv | 2026-09-10 | v38 l0 c0 | 54-30쿨링 공략좀 알려주세요.. | Stage 54-30 Cool Mint guide please | `001/evidence/16-top-players/06-nv-free-board.tsv:2451` |
| 38690 | nv | 2026-09-10 | v84 l0 c0 | 38-20 소머리 컷 | Stage 38-20 'cow head' boss cut | `001/evidence/16-top-players/06-nv-free-board.tsv:2456` |
| 38669 | nv | 2026-09-10 | v376 l0 c2 | 200-30 299m 클리어 | Stage 200-30 299m clear | `001/evidence/16-top-players/06-nv-free-board.tsv:2466` |
| 38642 | nv | 2026-09-10 | v221 l0 c1 | 스테이지 너무 안밀었나 | Haven't pushed stages enough? | `001/evidence/16-top-players/06-nv-free-board.tsv:2476` |
| 38620 | nv | 2026-09-10 | v93 l0 c0 | 94-30 쿨민 클리어덱 | Stage 94-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:470` (+2) |
| 38606 | nv | 2026-09-10 | v193 l2 c3 | 개레전드알바저능아 김상만73세 << 스테 투력 축복 인증하세요 | Troll: show your stage, power, blessing | `001/evidence/16-top-players/06-nv-free-board.tsv:2490` |
| 38591 | nv | 2026-09-10 | v68 l0 c0 | 248-30부터 이번에 확장되는 스테이지까지 보상도 궁금하네 | Curious about rewards from 248-30 through the new stages | `001/evidence/16-top-players/06-nv-free-board.tsv:2496` |
| 38587 | nv | 2026-09-10 | v400 l1 c6 | 내가 생각하는 스테이지 난이도 상승 문제 | The stage difficulty-ramp problem as I see it | `001/evidence/16-top-players/06-nv-free-board.tsv:2498` |
| 38580 | nv | 2026-09-10 | v207 l0 c2 | 방치형 이 스테이지를 자동으로 밀어줍니다 여기서 의견이 갈리는 거 같네 | Idle genre = stages auto-push; that's where opinions split | `001/evidence/16-top-players/06-nv-free-board.tsv:2500` |
| 38575 | nv | 2026-09-10 | v542 l1 c0 | 192-30  기록용 | Stage 192-30 for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:478` (+2) |
| 38523 | nv | 2026-09-09 | v599 l1 c6 | 스테 확장 전 248-30 비겁이 클 (838M) | Pre-expansion 248-30 Cowardly Cookie cleared (838M) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:480` (+2) |
| 38504 | nv | 2026-09-09 | v214 l0 c22 | 30-30 뉴비 조언 해주실분 계신가용ㅠㅠ | Stage 30-30 newbie advice | `001/evidence/16-top-players/06-nv-free-board.tsv:2528` |
| 38503 | nv | 2026-09-09 | v66 l0 c1 | 대충 45-20 무과금덱 | Rough 45-20 F2P deck | `001/evidence/16-top-players/06-nv-free-board.tsv:2529` |
| 38491 | nv | 2026-09-09 | v305 l1 c2 | 247-30 용암 슈가 와플 도마뱀 (화산지대) | Stage 247-30 Lava Sugar Waffle Lizard ( volcano ) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:481` (+2) |
| 38489 | nv | 2026-09-09 | v142 l2 c5 | 246-20(816M) | Stage 246-20(816M) | `001/evidence/16-top-players/06-nv-free-board.tsv:2534` |
| 38483 | nv | 2026-09-09 | v185 l1 c0 | 38-30 쿨링민트 | Stage 38-30 Cool Mint | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:482` (+2) |
| 38481 | nv | 2026-09-09 | v288 l4 c4 | 246-30 쿨링민트(쿨민) 광장, 쫄 | Stage 246-30 Cool Mint ( Cool Mint ) plaza , adds | `001/evidence/05-nv-guide-board-index.tsv:476` (+2) |
| 38480 | nv | 2026-09-09 | v242 l0 c0 | 246-29 식쿠식물 | Stage 246-29 cookie-eating plant | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:484` (+2) |
| 38477 | nv | 2026-09-09 | v161 l1 c0 | 246-20 망치공주 | Stage 246-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:478` (+2) |
| 38476 | nv | 2026-09-09 | v21 l0 c0 | 37-30 마오캇 | Stage 37-30 'Maokai' (tree boss) | `001/evidence/16-top-players/06-nv-free-board.tsv:2540` |
| 38475 | nv | 2026-09-09 | v79 l0 c0 | 46-30 드디어 클.. | Stage 46-30 finally clear .. | `001/evidence/05-nv-guide-board-index.tsv:479` (+2) |
| 38474 | nv | 2026-09-09 | v435 l0 c0 | 216-30 비겁이 클리어 덱 | Stage 216-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:480` (+2) |
| 38471 | nv | 2026-09-09 | v484 l3 c4 | 246-10 레드베리 암살자 12(닌자) | Stage 246-10 Redberry Assassin 12( ninja ) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:488` (+2) |
| 38468 | nv | 2026-09-09 | v368 l2 c0 | 243-30 비겁한쿠키(비겁이) | Stage 243-30 Cowardly Cookie ( Cowardly Cookie ) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:489` (+2) |
| 38465 | nv | 2026-09-09 | v651 l2 c1 | 243-10 폭주단바이커(쥐돌이) | Stage 243-10 Rowdy Biker ( rat bikers ) | `001/evidence/05-nv-guide-board-index.tsv:483` (+2) |
| 38459 | nv | 2026-09-09 | v154 l0 c0 | 식쿠식물 공략 (238-7) | cookie-eating plant guide (238-7) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:491` (+2) |
| 38454 | nv | 2026-09-09 | v108 l0 c1 | 170스테부터 | From stage 170... | `001/evidence/16-top-players/06-nv-free-board.tsv:2544` |
| 38453 | nv | 2026-09-09 | v214 l0 c0 | 218-30 (505M) 쿨민 | Stage 218-30 (505M) Cool Mint | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:492` (+2) |
| 38430 | nv | 2026-09-09 | v309 l0 c0 | 195-30 클리어덱 | Stage 195-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:486` (+2) |
| 38420 | nv | 2026-09-09 | v76 l1 c2 | 246-10(793M) | Stage 246-10(793M) | `001/evidence/16-top-players/05-nv-guide-board.tsv:488` (+2) |
| 38417 | nv | 2026-09-09 | v412 l3 c10 | 레드베리 암살자 공략 (238-2) | Redberry Assassin guide (238-2) | `001/evidence/05-nv-guide-board-index.tsv:488` (+2) |
| 38412 | nv | 2026-09-09 | v102 l0 c1 | 32-30 이거 스펙부족인가요? 컨트롤안하긴해요 | Stage 32-30: under-specced? I don't control | `001/evidence/16-top-players/06-nv-free-board.tsv:2563` |
| 38408 | nv | 2026-09-09 | v164 l0 c1 | 쥐토바이 개빡치긴하는데. | Rat bikers are infuriating | `001/evidence/16-top-players/06-nv-free-board.tsv:2566` |
| 38405 | nv | 2026-09-09 | v254 l0 c3 | 194-30 쿨민 클리어덱 | Stage 194-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:490` (+2) |
| 38400 | nv | 2026-09-09 | v154 l0 c1 | 삼토바이 만든 새끼 누구임?? | Who made the biker trio? | `001/evidence/16-top-players/06-nv-free-board.tsv:2571` |
| 38392 | nv | 2026-09-09 | v592 l0 c0 | 195-10 클리어덱 | Stage 195-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:491` (+2) |
| 38380 | nv | 2026-09-09 | v188 l3 c0 | 내일 게임이 망하더라도 나는 오늘 하나의 스테를 더 밀겠다 | Even if the game dies tomorrow I'll push one more stage | `001/evidence/16-top-players/06-nv-free-board.tsv:2578` |
| 38355 | nv | 2026-09-09 | v89 l0 c0 | 62-30 생존신고용 | Stage 62-30 still alive | `001/evidence/05-nv-guide-board-index.tsv:493` (+2) |
| 38353 | nv | 2026-09-09 | v2031 l16 c19 | 스테이지 난이도 문제는 이 그래프만 봐도 심각해요 | This graph shows how bad stage difficulty is | `001/evidence/16-top-players/06-nv-free-board.tsv:2587` |
| 38342 | nv | 2026-09-09 | v28 l0 c0 | 37-20 마오캇 | Stage 37-20 'Maokai' (tree boss) | `001/evidence/16-top-players/06-nv-free-board.tsv:2592` |
| 38327 | nv | 2026-09-09 | v290 l4 c3 | 168이하 스테돌던애들 저번패치때 쉴드치다가 | Those farming under-168 stages defended the last patch | `001/evidence/16-top-players/06-nv-free-board.tsv:2600` |
| 38325 | nv | 2026-09-09 | v215 l0 c2 | 신규 스테이지 이왕하는거 쥐토바이 4마리로 늘리자 | New stages: make it 4 rat bikers | `001/evidence/16-top-players/06-nv-free-board.tsv:2602` |
| 38313 | nv | 2026-09-09 | v170 l5 c1 | 결국 스테이지 미는게 개노잼이라 그런거임 | Because pushing stages is boring | `001/evidence/16-top-players/06-nv-free-board.tsv:2609` |
| 38299 | nv | 2026-09-09 | v92 l0 c0 | 뭔 스테이지360?? 압축해도 모자랄판에 일반 하드 지옥 이렇게 하던가 감도 안잡히네.. | Stage 360 stages? Should be normal/hard/hell tiers | `001/evidence/16-top-players/06-nv-free-board.tsv:2613` |
| 38290 | nv | 2026-09-09 | v277 l3 c3 | 스테이지만 완화만 했어도 이렇게 불만없다 | No complaints if they'd only eased stages | `001/evidence/16-top-players/06-nv-free-board.tsv:2615` |
| 38270 | nv | 2026-09-09 | v275 l0 c0 | 190-30 쿨링민트 쿨민 기록용 | Stage 190-30 Cool Mint Cool Mint for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:501` (+2) |
| 38265 | nv | 2026-09-09 | v84 l0 c0 | 94-20 망치공주 클리어덱 | Stage 94-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:495` (+2) |
| 38258 | nv | 2026-09-09 | v128 l0 c0 | 194-30 클리어덱 | Stage 194-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:496` (+2) |
| 38217 | nv | 2026-09-09 | v163 l1 c1 | 마일리지 스테이지 보상 상향해라 낼 패치 보고 걍 접음 | Buff mileage stage rewards or I quit after tomorrow's patch | `001/evidence/16-top-players/06-nv-free-board.tsv:2648` |
| 38211 | nv | 2026-09-09 | v319 l0 c6 | 179-30 비겁이 뭐가 문제여 조언좀 | Stage 179-30 Cowardly Cookie: what's wrong? | `001/evidence/16-top-players/06-nv-free-board.tsv:2652` |
| 38207 | nv | 2026-09-09 | v282 l0 c0 | 200-30 클 | Stage 200-30 clear | `001/evidence/05-nv-guide-board-index.tsv:497` (+2) |
| 38195 | nv | 2026-09-09 | v123 l0 c1 | ●▅▇█▇▆▅▄▇ 스테이지 난이도 너프하라! | Nerf stage difficulty! | `001/evidence/16-top-players/06-nv-free-board.tsv:2661` |
| 38165 | nv | 2026-09-09 | v104 l0 c0 | 194-10,20 클리어덱 | Stage 194-10,20 clear deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:499` (+2) |
| 38119 | nv | 2026-09-09 | v46 l0 c0 | 36-30 클리어덱 (유지력+전갈) | Stage 36-30 clear deck (sustain + Scorpion) | `001/evidence/05-nv-guide-board-index.tsv:499` (+2) |
| 38097 | nv | 2026-09-09 | v108 l0 c1 | 신규 스테이지는 안바래 | Don't want new stages | `001/evidence/16-top-players/06-nv-free-board.tsv:2709` |
| 38082 | nv | 2026-09-09 | v36 l0 c0 | 10-30 못 깨고 있는데 어떻게 하면 좋을까요? | Can't beat 10-30; what to do? | `001/evidence/16-top-players/06-nv-free-board.tsv:2720` |
| 38073 | nv | 2026-09-09 | v152 l0 c2 | 쿨민사태때 기싸움에서 지고 끝났음 | Lost the standoff over the Cool Mint affair | `001/evidence/16-top-players/06-nv-free-board.tsv:2727` |
| 38068 | nv | 2026-09-09 | v69 l0 c0 | 스테이지 팍팍 늘려도 좋아~~!! | Add as many stages as you like! | `001/evidence/16-top-players/06-nv-free-board.tsv:2729` |
| 38036 | nv | 2026-09-09 | v49 l0 c0 | ㅋㅋㅋ스테확장 쿠키출시 끝 ㅋㅋㅋㅋㅋ | Stage expansion + cookie release, that's it | `001/evidence/16-top-players/06-nv-free-board.tsv:2747` |
| 38015 | nv | 2026-09-09 | v307 l0 c1 | 243-30 비겁이 클 (760M) | Stage 243-30 Cowardly Cookie clear (760M) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:507` (+2) |
| 37950 | nv | 2026-09-09 | v127 l0 c1 | 쥐토바이 개선은없고 10번 더 잡으라노?ㅋㅋㅋㅋ | No rat-biker fix, and 10 more of them? | `001/evidence/16-top-players/06-nv-free-board.tsv:2803` |
| 37922 | nv | 2026-09-09 | v245 l2 c1 | 전섭1위분이 접으셔도 스테90 무소과금분들이 크럼블 지킴이 해주시니 든든합니다! | Top player quit, but stage-90 F2P players keep Crumble going | `001/evidence/16-top-players/06-nv-free-board.tsv:2818` |
| 37900 | nv | 2026-09-09 | v323 l0 c1 | 216-30 (481M) 비겁 | Stage 216-30 (481M) Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:501` (+2) |
| 37874 | nv | 2026-09-09 | v556 l0 c1 | 비겁이 연타덱으로 컷 | Cowardly Cookie rapid-fire deck cut | `001/evidence/16-top-players/06-nv-free-board.tsv:2840` |
| 37871 | nv | 2026-09-09 | v164 l0 c7 | 스테 90따리도 징징 분탕보다는 머리가 좋아서 다행 | Stage-90 players smarter than trolls | `001/evidence/16-top-players/06-nv-free-board.tsv:2841` |
| 37864 | nv | 2026-09-09 | v176 l1 c2 | 스테 90따리 미는애가 갓겜수호단질하는거 웃김 | Stage-90 pusher defending the game is funny | `001/evidence/16-top-players/06-nv-free-board.tsv:2843` |
| 37833 | nv | 2026-09-09 | v188 l0 c2 | 스테이지 난이도 개떡같이 올려놓고 스테이지는 왜늘림? | Why add stages after making them so hard? | `001/evidence/16-top-players/06-nv-free-board.tsv:2861` |
| 37827 | nv | 2026-09-09 | v64 l0 c0 | 188-10 | Stage 188-10 | `001/evidence/05-nv-guide-board-index.tsv:502` (+2) |
| 37814 | nv | 2026-09-09 | v117 l0 c1 | 248지까지 난이도 개같은거는 완화하고 신규스테 추가하는거지?? | Ease the awful difficulty to 248 and then add stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:2871` |
| 37809 | nv | 2026-09-09 | v335 l2 c2 | 205-20 205-30 그루터기 정령 공략 (찌질함 주의..) | Stage 205-20 / 205-30 Tainted Ent guide | `001/evidence/05-nv-guide-board-index.tsv:503` (+2) |
| 37803 | nv | 2026-09-09 | v186 l0 c2 | 에이 설마~ 또 체력만 늘린 스테이지 확장이겠어 ㅋㅋ | Surely not another HP-only stage expansion | `001/evidence/16-top-players/06-nv-free-board.tsv:2875` |
| 37799 | nv | 2026-09-09 | v265 l0 c4 | 248 온사람 얼마나된다고  스테확장을하나 | How many have even reached 248, to expand stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:2877` |
| 37797 | nv | 2026-09-09 | v114 l2 c9 | 스테이지 인증하고 낫베드 갓패치 이정도면 글써라 | Show your stage before calling it a god patch | `001/evidence/16-top-players/06-nv-free-board.tsv:2879` |
| 37796 | nv | 2026-09-09 | v58 l1 c0 | 패치노트에 스테이지보상 얼마나 상향되는지 적어주는 게 어렵나 | Is it hard to state the stage-reward increase in patch notes? | `001/evidence/16-top-players/06-nv-free-board.tsv:2880` |
| 37785 | nv | 2026-09-09 | v202 l0 c4 | 168 스테 이후에 불쾌한거는 안고침? | No fix for the unpleasant stuff after 168? | `001/evidence/16-top-players/06-nv-free-board.tsv:2885` |
| 37760 | nv | 2026-09-09 | v36 l0 c0 | 이번 스테이지도 돌려막기?? | Recycled stages again this time? | `001/evidence/16-top-players/06-nv-free-board.tsv:2891` |
| 37752 | nv | 2026-09-09 | v45 l0 c0 | 쥐토바이/암살자 같은 불쾌감 주는것좀 패치하라고!!!!!!!!!!!!!!!!!! | Patch the rat bikers / Assassin annoyances! | `001/evidence/16-top-players/06-nv-free-board.tsv:2893` |
| 37738 | nv | 2026-09-09 | v90 l0 c0 | 스테이지 완화 언급 없노 | No mention of stage easing | `001/evidence/16-top-players/06-nv-free-board.tsv:2902` |
| 37731 | nv | 2026-09-09 | v418 l2 c8 | 243-10 쥐돌이 컷 | Stage 243-10 rat bikers cut | `001/evidence/16-top-players/06-nv-free-board.tsv:2907` |
| 37717 | nv | 2026-09-09 | v173 l0 c0 | 194-30 쿨민이 클리어덱 기록용 | Stage 194-30 Cool Mint clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:505` (+2) |
| 37716 | nv | 2026-09-09 | v317 l2 c4 | 광제,유니크만 샀고 202-30 | Only bought Gwangje and Unique pack; at 202-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:2917` |
| 37710 | nv | 2026-09-09 | v630 l2 c2 | 203-10 더러운 바이크 년 클 | Stage 203-10 filthy Biker cleared | `001/evidence/16-top-players/06-nv-free-board.tsv:2921` |
| 37697 | nv | 2026-09-09 | v214 l1 c0 | 6번 보스 : 그루터기 정령, 초코 왕방불, 스노우볼 설인 (조작감 개편) | Boss #6: Tainted Ent, Choco Big Drop, Snowball Yeti (controls rework) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:513` (+2) |
| 37675 | nv | 2026-09-09 | v721 l0 c16 | 쥐돌이는 진짜 짜증 243-10 1시간 ㅡㅡ | Rat bikers so annoying; 243-10 for an hour | `001/evidence/16-top-players/06-nv-free-board.tsv:2934` |
| 37669 | nv | 2026-09-09 | v173 l1 c4 | 193-30 쿨민 클리어덱 | Stage 193-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:507` (+2) |
| 37667 | nv | 2026-09-09 | v97 l0 c0 | 193-10,20 클리어덱 | Stage 193-10,20 clear deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:509` (+2) |
| 37658 | nv | 2026-09-09 | v608 l1 c0 | 192-30 비겁이 클리어덱 기록용 | Stage 192-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:509` (+2) |
| 37634 | nv | 2026-09-09 | v550 l2 c3 | 192-30 비겁이 클리어덱 | Stage 192-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:517` (+2) |
| 37631 | nv | 2026-09-09 | v76 l0 c0 | 192-10,20 클리어덱 | Stage 192-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:511` (+2) |
| 37617 | nv | 2026-09-09 | v139 l0 c2 | 스테이지 보상 안들어오는데? | Stage rewards not arriving? | `001/evidence/16-top-players/06-nv-free-board.tsv:2949` |
| 37589 | nv | 2026-09-09 | v195 l0 c1 | 32-30 비겁한 쿠키 도와주세요ㅠㅠ | Stage 32-30 Cowardly Cookie help ㅠㅠ | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:521` (+2) |
| 37568 | nv | 2026-09-08 | v116 l0 c2 | 35-30  컷 | Stage 35-30 cut | `001/evidence/16-top-players/06-nv-free-board.tsv:2960` |
| 37565 | nv | 2026-09-08 | v499 l4 c4 | 242-30 쿨링민트(쿨민) 해안, 쫄몹 | Stage 242-30 Cool Mint ( Cool Mint ) coast , adds | `001/evidence/05-nv-guide-board-index.tsv:515` (+2) |
| 37563 | nv | 2026-09-08 | v1151 l7 c4 | 203-30 비겁이 공략 / 328M | Stage 203-30 Cowardly Cookie guide / 328M | `001/evidence/05-nv-guide-board-index.tsv:516` (+2) |
| 37559 | nv | 2026-09-08 | v164 l0 c6 | 아 쥐토바이 진짜 누구 머리에서 나온겨 | Who came up with the rat bikers? | `001/evidence/16-top-players/06-nv-free-board.tsv:2965` |
| 37558 | nv | 2026-09-08 | v528 l2 c13 | 227-30 비겁이(석가모니아니면 절대비추/명랑없음) | Stage 227-30 Cowardly Cookie (not recommended unless saintly; no Cheerful) | `001/evidence/16-top-players/06-nv-free-board.tsv:2966` |
| 37553 | nv | 2026-09-08 | v112 l1 c0 | 241-30 쿨링민트(쿨민) 노쫄 쿨민 | Stage 241-30 Cool Mint, no adds | `001/evidence/05-nv-guide-board-index.tsv:517` (+2) |
| 37544 | nv | 2026-09-08 | v47 l0 c0 | 31-30 | Stage 31-30 | `001/evidence/05-nv-guide-board-index.tsv:519` (+2) |
| 37536 | nv | 2026-09-08 | v89 l2 c0 | 38-20 늑대망치공주 (용병단레벨3) | Stage 38-20 Choco Werehound Princess (merc Lv3) | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:528` (+2) |
| 37530 | nv | 2026-09-08 | v364 l3 c0 | 198-30 쿨링민트 | Stage 198-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:522` (+2) |
| 37528 | nv | 2026-09-08 | v167 l0 c0 | 198-20 망치공주 | Stage 198-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:523` (+2) |
| 37522 | nv | 2026-09-08 | v65 l0 c0 | 30-30 | Stage 30-30 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:531` (+2) |
| 37519 | nv | 2026-09-08 | v54 l0 c0 | 35-20 트럭컷 | Stage 35-20 Truck cut | `001/evidence/16-top-players/06-nv-free-board.tsv:2977` |
| 37514 | nv | 2026-09-08 | v133 l0 c0 | 88-30 비겁덱 | Stage 88-30 Cowardly Cookie deck | `001/evidence/16-top-players/06-nv-free-board.tsv:2978` |
| 37495 | nv | 2026-09-08 | v227 l0 c3 | 168-30 이후는 보상이 짜여?? | Rewards stingy after 168-30? | `001/evidence/16-top-players/06-nv-free-board.tsv:2985` |
| 37489 | nv | 2026-09-08 | v66 l0 c1 | 38-10 레드베리암살자 | Stage 38-10 Redberry Assassin | `001/evidence/05-nv-guide-board-index.tsv:525` (+2) |
| 37449 | nv | 2026-09-08 | v268 l2 c2 | 192 스테 연타덱인데 수정할곳 있어? | Stage 192 rapid-fire deck: anything to fix? | `001/evidence/16-top-players/06-nv-free-board.tsv:2996` |
| 37445 | nv | 2026-09-08 | v91 l0 c0 | 37-30 그루터기 (펫3마리) | Stage 37-30 Tainted Ent (3 pets) | `001/evidence/05-nv-guide-board-index.tsv:526` (+2) |
| 37436 | nv | 2026-09-08 | v168 l1 c2 | 스테이지 공격 우선순위 기준이 뭐에요 대체???????? | What decides attack priority in stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:2999` |
| 37417 | nv | 2026-09-08 | v166 l2 c1 | 191-10,20,30 그루터기 클리어덱 | Stage 191-10,20,30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:527` (+2) |
| 37415 | nv | 2026-09-08 | v820 l1 c0 | 203-10 쥐돌이 클리어 공략 / 325M 23k | Stage 203-10 rat bikers clear guide / 325M 23k | `001/evidence/05-nv-guide-board-index.tsv:528` (+2) |
| 37406 | nv | 2026-09-08 | v113 l2 c2 | 193-30 클리어덱 | Stage 193-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:529` (+2) |
| 37404 | nv | 2026-09-08 | v38 l0 c0 | 93-20 그루터기 클리어덱 | Stage 93-20 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:530` (+2) |
| 37385 | nv | 2026-09-08 | v106 l2 c0 | 83-30 비겁덱 | Stage 83-30 Cowardly Cookie deck | `001/evidence/16-top-players/06-nv-free-board.tsv:3004` |
| 37373 | nv | 2026-09-08 | v521 l1 c8 | 190-20,30 망치공주 쿨민 클리어덱 | Stage 190-20,30 Choco Werehound Princess Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:532` (+2) |
| 37360 | nv | 2026-09-08 | v41 l0 c0 | 37-20 그루터기 | Stage 37-20 Tainted Ent | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:540` (+2) |
| 37357 | nv | 2026-09-08 | v492 l4 c0 | 비겁이는 이거로 그냥 깸 | Just beat Cowardly Cookie with this | `001/evidence/05-nv-guide-board-index.tsv:534` (+2) |
| 37347 | nv | 2026-09-08 | v376 l1 c0 | 187-30 기록용 | Stage 187-30 for the record | `001/evidence/05-nv-guide-board-index.tsv:535` (+2) |
| 37334 | nv | 2026-09-08 | v682 l0 c2 | 227-10 쥐톲밦잆 ..^^ (시커x) | Stage 227-10 rat bikers ..^^ ( Brightseeker x) | `001/evidence/16-top-players/06-nv-free-board.tsv:3019` |
| 37309 | nv | 2026-09-08 | v1309 l0 c6 | 스테확장은 안했으면 좋겠다.. | Hope they don't expand stages | `001/evidence/16-top-players/06-nv-free-board.tsv:3022` |
| 37305 | nv | 2026-09-08 | v28 l1 c0 | 81-30 쿨민 | Stage 81-30 Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:3023` |
| 37284 | nv | 2026-09-08 | v194 l0 c3 | 걍 다른 키우기 겜처럼 스테 쫙 늘리고 난이도 점차적으로 높이면 안되나 | Why not add lots of stages with a gradual difficulty ramp? | `001/evidence/16-top-players/06-nv-free-board.tsv:3031` |
| 37282 | nv | 2026-09-08 | v158 l1 c0 | 80-30 36m | Stage 80-30 36m | `001/evidence/05-nv-guide-board-index.tsv:536` (+2) |
| 37261 | nv | 2026-09-08 | v255 l0 c0 | 226-30 쿨링민트 | Stage 226-30 Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:3039` |
| 37257 | nv | 2026-09-08 | v106 l2 c2 | 80-30 비겁덱 | Stage 80-30 Cowardly Cookie deck | `001/evidence/16-top-players/06-nv-free-board.tsv:3041` |
| 37240 | nv | 2026-09-08 | v925 l2 c14 | 224-30 비겁 500m 언더로 깼어요 | Stage 224-30 Cowardly Cookie cleared under 500M | `001/evidence/16-top-players/06-nv-free-board.tsv:3047` |
| 37231 | nv | 2026-09-08 | v150 l1 c1 | 34-30 민트련 클덱 | Stage 34-30 Cool Mint clear deck | `001/evidence/16-top-players/06-nv-free-board.tsv:3051` |
| 37215 | nv | 2026-09-08 | v260 l1 c0 | 더러운 200-30 클 | Filthy 200-30 cleared | `001/evidence/16-top-players/06-nv-free-board.tsv:3056` |
| 37201 | nv | 2026-09-08 | v110 l0 c2 | 230-12 암살자 도움좀요 | Stage 230-12 Assassin help | `001/evidence/16-top-players/06-nv-free-board.tsv:3060` |
| 37195 | nv | 2026-09-08 | v543 l1 c5 | 200-30 비겁이 공략 / 299M 362K | Stage 200-30 Cowardly Cookie guide / 299M 362K | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:546` (+2) |
| 37185 | nv | 2026-09-08 | v863 l1 c11 | 스테이지 조합 | stage comp | `001/evidence/16-top-players/06-nv-free-board.tsv:3065` |
| 37182 | nv | 2026-09-08 | v194 l1 c3 | 쥐토바이 한화면 넘어가는건 에바아님? | Rat bikers leaving the screen is too much | `001/evidence/16-top-players/06-nv-free-board.tsv:3066` |
| 37175 | nv | 2026-09-08 | v586 l8 c6 | 222-30 공략:-) | Stage 222-30 guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:547` (+2) |
| 37166 | nv | 2026-09-08 | v412 l5 c8 | 222-20 공략:-) | Stage 222-20 guide | `001/evidence/05-nv-guide-board-index.tsv:541` (+2) |
| 37149 | nv | 2026-09-08 | v86 l1 c2 | 78-30 | Stage 78-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:3072` |
| 37061 | nv | 2026-09-08 | v442 l0 c0 | 187-30 비겁이 클리어덱 기록용 | Stage 187-30 Cowardly Cookie clear deck for the record | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:550` (+2) |
| 37049 | nv | 2026-09-08 | v482 l1 c0 | 240-30 비겁이 클 | Stage 240-30 Cowardly Cookie clear | `001/evidence/16-top-players/06-nv-free-board.tsv:3105` |
| 37035 | nv | 2026-09-08 | v105 l0 c0 | 64-30 비겁이 길드 없으면 못깨는 버그 있나요..? | Stage 64-30 Cowardly Cookie: bug if you have no guild? | `001/evidence/16-top-players/06-nv-free-board.tsv:3108` |
| 37023 | nv | 2026-09-07 | v123 l0 c1 | 35-30 비겁이 | Stage 35-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:545` (+2) |
| 37015 | nv | 2026-09-07 | v496 l2 c1 | 베테랑 용병단의 생크림콘 독수리 최신 공략 | Veteran merc band's latest Cream Eagle guide | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:554` (+2) |
| 36987 | nv | 2026-09-07 | v93 l1 c0 | 43-30 드디어 클.. | Stage 43-30 finally clear .. | `001/evidence/05-nv-guide-board-index.tsv:550` (+2) |
| 36986 | nv | 2026-09-07 | v450 l0 c1 | 214-30 413.83M 클리어덱 공유 | Stage 214-30 413.83M clear deck share | `001/evidence/16-top-players/05-nv-guide-board.tsv:552` (+2) |
| 36977 | nv | 2026-09-07 | v415 l6 c1 | 쿨링민트맛 쿠키 공략 | Cool Mint guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:553` (+2) |
| 36962 | nv | 2026-09-07 | v119 l0 c0 | 뭐노 이거 던전 370스테가 끝임?? | Dungeon ends at stage 370? | `001/evidence/16-top-players/06-nv-free-board.tsv:3121` |
| 36949 | nv | 2026-09-07 | v645 l2 c0 | 219-30 비겁이 복지3 명랑x덱 | Stage 219-30 Cowardly Cookie, perk Lv3, no-Cheerful deck | `001/evidence/05-nv-guide-board-index.tsv:553` (+2) |
| 36944 | nv | 2026-09-07 | v216 l1 c2 | 스테이지 난이도가 이게 줜나 큰 문제인게 | Why stage difficulty is a big problem | `001/evidence/16-top-players/06-nv-free-board.tsv:3124` |
| 36929 | nv | 2026-09-07 | v67 l0 c0 | 35-20 드디어 우유나왔다!!!!! | Stage 35-20: finally got Milk! | `001/evidence/05-nv-guide-board-index.tsv:554` (+2) |
| 36928 | nv | 2026-09-07 | v504 l0 c0 | 192-30 클리어덱 | Stage 192-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:555` (+2) |
| 36916 | nv | 2026-09-07 | v232 l1 c1 | 스테이지 난이도 하향 없으면 수명 끝 | Game's life is over without a stage difficulty cut | `001/evidence/16-top-players/06-nv-free-board.tsv:3131` |
| 36903 | nv | 2026-09-07 | v25 l0 c0 | 48-30 도와주새요 ㅜ | Stage 48-30 help | `001/evidence/16-top-players/06-nv-free-board.tsv:3135` |
| 36873 | nv | 2026-09-07 | v145 l0 c0 | 34-30  쿨링민트 피노누아7성 | Stage 34-30 Cool Mint, Pinot Noir 7★ | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:563` (+2) |
| 36862 | nv | 2026-09-07 | v1311 l0 c11 | 스테이지 막히신 분들 | For those stuck on stages | `001/evidence/16-top-players/06-nv-free-board.tsv:3143` |
| 36853 | nv | 2026-09-07 | v377 l3 c1 | 187-20 트럭 기록용 | Stage 187-20 Truck for the record | `001/evidence/05-nv-guide-board-index.tsv:557` (+2) |
| 36846 | nv | 2026-09-07 | v527 l7 c1 | 168스테이지까지 밀면서 쓴 덱들 | Decks I used pushing to stage 168 | `001/evidence/16-top-players/05-nv-guide-board.tsv:559` (+2) |
| 36838 | nv | 2026-09-07 | v151 l0 c0 | 196-10 | Stage 196-10 | `001/evidence/05-nv-guide-board-index.tsv:560` (+2) |
| 36837 | nv | 2026-09-07 | v401 l0 c2 | 192-30 비겁한쿠키, 193-30 쿨링민트맛쿠키 | Stage 192-30 Cowardly Cookie , 193-30 Cool Mint | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:568` (+2) |
| 36831 | nv | 2026-09-07 | v308 l3 c4 | 221-20 공략:-) | Stage 221-20 guide | `001/evidence/05-nv-guide-board-index.tsv:562` (+2) |
| 36801 | nv | 2026-09-07 | v135 l0 c0 | 91-30 비겁 클리어덱 | Stage 91-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:563` (+2) |
| 36794 | nv | 2026-09-07 | v130 l0 c0 | 215-30 (464M) 와플도마뱀 | Stage 215-30 (464M) Waffle Lizard | `001/evidence/05-nv-guide-board-index.tsv:564` (+2) |
| 36772 | nv | 2026-09-07 | v316 l1 c1 | 드디어 스테이지 200대 | Finally in the 200s | `001/evidence/16-top-players/06-nv-free-board.tsv:3158` |
| 36762 | nv | 2026-09-07 | v505 l3 c9 | 220-10 공략:-) | Stage 220-10 guide | `001/evidence/05-nv-guide-board-index.tsv:565` (+2) |
| 36743 | nv | 2026-09-07 | v592 l6 c6 | 219-30 공략:-) | Stage 219-30 guide | `001/evidence/05-nv-guide-board-index.tsv:566` (+2) |
| 36735 | nv | 2026-09-07 | v929 l6 c8 | 224-30 비겁이 (명랑x) | Stage 224-30 Cowardly Cookie (no Cheerful) | `001/evidence/16-top-players/06-nv-free-board.tsv:3170` |
| 36690 | nv | 2026-09-07 | v328 l0 c0 | 195-30 비겁한쿠키 | Stage 195-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:567` (+2) |
| 36687 | nv | 2026-09-07 | v2042 l19 c12 | 200스테위분들 막히시면 이 쿠키 써보세요! | Stuck past 200? Try this cookie | `001/evidence/05-nv-guide-board-index.tsv:568` (+2) |
| 36684 | nv | 2026-09-07 | v41 l1 c0 | 74-30 | Stage 74-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:3179` |
| 36666 | nv | 2026-09-07 | v105 l0 c0 | 83-30 32m | Stage 83-30 32m | `001/evidence/05-nv-guide-board-index.tsv:570` (+2) |
| 36660 | nv | 2026-09-07 | v268 l1 c0 | 214-20 (460M) 망치부인 | Stage 214-20 (460M) Choco Werehound Princess | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:578` (+2) |
| 36616 | nv | 2026-09-07 | v21 l0 c0 | 73-30 | Stage 73-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:3194` |
| 36613 | nv | 2026-09-07 | v53 l0 c0 | 48-30에서 막힙니다 도와주세요 ㅜㅜ | Stuck at 48-30, help | `001/evidence/16-top-players/06-nv-free-board.tsv:3196` |
| 36591 | nv | 2026-09-07 | v80 l0 c0 | 90-10 바이커 클리어덱 | Stage 90-10 Biker clear deck | `001/evidence/05-nv-guide-board-index.tsv:572` (+2) |
| 36573 | nv | 2026-09-07 | v79 l0 c2 | 30-30 도와주실분..ㅠ | Stage 30-30 help | `001/evidence/05-nv-guide-board-index.tsv:573` (+2) |
| 36570 | nv | 2026-09-07 | v26 l0 c0 | 75-10 간단한덱추천ㄴ좀... | Simple deck for 75-10? | `001/evidence/16-top-players/06-nv-free-board.tsv:3204` |
| 36563 | nv | 2026-09-07 | v77 l0 c0 | 90-30 쿨민 클리어덱 | Stage 90-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:574` (+2) |
| 36555 | nv | 2026-09-07 | v25 l0 c0 | 48-30이 벽인데 어떻게 깨나요 조언 부탁드립니다! | Stage 48-30 is a wall; advice please | `001/evidence/16-top-players/06-nv-free-board.tsv:3209` |
| 36554 | nv | 2026-09-07 | v1198 l1 c20 | 스테이지핵 있는거죠? | Stage hackers exist, right? | `001/evidence/16-top-players/06-nv-free-board.tsv:3210` |
| 36522 | nv | 2026-09-07 | v227 l0 c0 | 187-30 기록용 | Stage 187-30 for the record | `001/evidence/05-nv-guide-board-index.tsv:576` (+2) |
| 36495 | nv | 2026-09-07 | v128 l0 c6 | 10-30부터 막히는데 덱 뭐해야하나요?? | Stuck from 10-30; which deck? | `001/evidence/16-top-players/06-nv-free-board.tsv:3229` |
| 36480 | nv | 2026-09-06 | v49 l0 c0 | 최종스테이지 | final stage | `001/evidence/16-top-players/06-nv-free-board.tsv:3233` |
| 36476 | nv | 2026-09-06 | v71 l0 c0 | 다른건 다 용서해도 쥐토바이 화면밖으로 나가버리는건 ㅅㅂ | Rat bikers leaving the screen is unforgivable | `001/evidence/16-top-players/06-nv-free-board.tsv:3234` |
| 36467 | nv | 2026-09-06 | v1903 l42 c8 | 스테이지 덱 9/7 | stage deck 9/7 | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:584` (+2) |
| 36465 | nv | 2026-09-06 | v357 l2 c2 | 189-10,20,30 그루터기 클리어덱 | Stage 189-10,20,30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:578` (+2) |
| 36437 | nv | 2026-09-06 | v186 l0 c0 | 188-10,20,30 클리어덱 | Stage 188-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:579` (+2) |
| 36436 | nv | 2026-09-06 | v1132 l5 c5 | 208-30 10트 클리어 덱 | Stage 208-30 clear deck in 10 tries | `001/evidence/16-top-players/05-nv-guide-board.tsv:581` (+2) |
| 36417 | nv | 2026-09-06 | v289 l2 c2 | 212-10 (430M) 생크림콘 독수리 | Stage 212-10 (430M) Cream Eagle | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:588` (+2) |
| 36404 | nv | 2026-09-06 | v696 l4 c1 | 211-30 (416M) 비겁 | Stage 211-30 (416M) Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:582` (+2) |
| 36403 | nv | 2026-09-06 | v65 l0 c0 | 82-30 31m | Stage 82-30 31m | `001/evidence/05-nv-guide-board-index.tsv:583` (+2) |
| 36398 | nv | 2026-09-06 | v720 l0 c0 | 211-10 쥐돌이 클리어덱 | Stage 211-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:584` (+2) |
| 36384 | nv | 2026-09-06 | v60 l0 c0 | 89-30 쿨민 클리어덱 | Stage 89-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:586` (+2) |
| 36341 | nv | 2026-09-06 | v86 l0 c0 | 장비 질문요 스테밀때는 방어구 옵션 뭐뭐해야람? 체력 피감?? | Gear question: armor options for stages? HP, DR? | `001/evidence/16-top-players/06-nv-free-board.tsv:3261` |
| 36291 | nv | 2026-09-06 | v170 l0 c4 | 37-20 그루터기 무과금 | Stage 37-20 Tainted Ent F2P | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:596` (+2) |
| 36272 | nv | 2026-09-06 | v179 l0 c0 | 32-10 / 32-30 비겁이 | Stage 32-10 / 32-30 Cowardly Cookie | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:597` (+2) |
| 36266 | nv | 2026-09-06 | v213 l1 c0 | 비겁한쿠키는 그냥 설계가 잘못됨 | Cowardly Cookie is just badly designed | `001/evidence/16-top-players/06-nv-free-board.tsv:3282` |
| 36264 | nv | 2026-09-06 | v769 l2 c5 | 스테이지 보상 줄었다고하지 않았나요? | Weren't stage rewards cut? | `001/evidence/16-top-players/06-nv-free-board.tsv:3284` |
| 36258 | nv | 2026-09-06 | v89 l1 c0 | 62-20 | Stage 62-20 | `001/evidence/16-top-players/06-nv-free-board.tsv:3287` |
| 36252 | nv | 2026-09-06 | v98 l0 c0 | 58-30 쿨민 클리어 | Stage 58-30 Cool Mint clear | `001/evidence/05-nv-guide-board-index.tsv:591` (+2) |
| 36251 | nv | 2026-09-06 | v86 l0 c0 | 비겁이 개같아서 짜증나네 | Cowardly Cookie is infuriating | `001/evidence/16-top-players/06-nv-free-board.tsv:3288` |
| 36193 | nv | 2026-09-06 | v616 l0 c2 | 187-30 비겁이 클리어덱 | Stage 187-30 Cowardly Cookie clear deck | `002/evidence/04-naver-global/05-nv-guide-menu9.tsv:601` (+2) |
| 36184 | nv | 2026-09-06 | v1070 l4 c5 | 187-10,20 쥐토바이 트럭 클리어덱 | Stage 187-10,20 rat bikers Truck clear deck | `001/evidence/05-nv-guide-board-index.tsv:595` (+1) |
| 36182 | nv | 2026-09-06 | v168 l0 c4 | 120-1부터 보상 더 안좋아지잖아 | Rewards get worse from 120-1 | `001/evidence/16-top-players/06-nv-free-board.tsv:3300` |
| 36146 | nv | 2026-09-06 | v168 l0 c0 | 189-30 오염된 그루터기 정령 216M | Stage 189-30 Tainted Ent 216M | `001/evidence/16-top-players/05-nv-guide-board.tsv:597` (+1) |
| 36135 | nv | 2026-09-06 | v95 l0 c4 | 57-30 쿨민 클리어. 7시가서 때리세요 | Stage 57-30 Cool Mint cleared: go to 7 o'clock and hit | `001/evidence/05-nv-guide-board-index.tsv:597` (+1) |
| 36133 | nv | 2026-09-06 | v298 l2 c0 | 망치공주 꿀팁🔨 (174-20 / 약 144M) | Werehound Princess tip (174-20 / ~144M) | `001/evidence/05-nv-guide-board-index.tsv:598` (+1) |
| 36111 | nv | 2026-09-06 | v94 l0 c0 | 56-30 | Stage 56-30 | `001/evidence/05-nv-guide-board-index.tsv:599` (+1) |
| 36110 | nv | 2026-09-06 | v165 l1 c0 | 스테이지 밀린거 12시시간 방치 보상 | Stage 12 hours of idle rewards from pushed stages | `001/evidence/16-top-players/06-nv-free-board.tsv:3316` |
| 36103 | nv | 2026-09-06 | v45 l0 c0 | 폭주단 she발 | Rowdy gang rant | `001/evidence/16-top-players/06-nv-free-board.tsv:3317` |
| 36102 | nv | 2026-09-06 | v194 l1 c0 | 170-30 쿨민 클덱 | Stage 170-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:600` (+1) |
| 36083 | nv | 2026-09-06 | v98 l0 c0 | 59-30 | Stage 59-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:3322` |
| 36071 | nv | 2026-09-06 | v243 l0 c4 | 5번 보스 : 비겁한 쿠키 (조작감 개편) | Boss #5: Cowardly Cookie (controls rework) | `001/evidence/05-nv-guide-board-index.tsv:601` (+1) |
| 36067 | nv | 2026-09-06 | v55 l0 c2 | 스테이지 질문 있어요 | Stage question | `001/evidence/16-top-players/06-nv-free-board.tsv:3324` |
| 36061 | nv | 2026-09-06 | v139 l1 c2 | 86-30 쿨민 클리어덱 | Stage 86-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:603` (+1) |
| 36045 | nv | 2026-09-06 | v27 l0 c1 | 초반 3-18 인데 덱좀 추천해주세요 | Early 3-18: deck please | `001/evidence/16-top-players/06-nv-free-board.tsv:3333` |
| 36024 | nv | 2026-09-06 | v162 l0 c0 | 115-30 비겁 원클 | Stage 115-30 Cowardly Cookie first try | `001/evidence/05-nv-guide-board-index.tsv:604` (+1) |
| 36022 | nv | 2026-09-06 | v88 l1 c0 | 205-30 | Stage 205-30 | `001/evidence/05-nv-guide-board-index.tsv:605` (+1) |
| 36019 | nv | 2026-09-06 | v411 l1 c3 | 235-10 쥐토바이 3일만에 클 .. | Stage 235-10 rat bikers cleared after 3 days | `001/evidence/16-top-players/06-nv-free-board.tsv:3344` |
| 36007 | nv | 2026-09-06 | v62 l1 c0 | 59-20 | Stage 59-20 | `001/evidence/16-top-players/06-nv-free-board.tsv:3349` |
| 35978 | nv | 2026-09-05 | v671 l1 c1 | 184-30 | Stage 184-30 | `001/evidence/05-nv-guide-board-index.tsv:606` (+1) |
| 35976 | nv | 2026-09-05 | v193 l0 c0 | 56-30 비겁 무과금 원트에 클리어 | Stage 56-30 Cowardly Cookie F2P first try | `001/evidence/05-nv-guide-board-index.tsv:607` (+1) |
| 35972 | nv | 2026-09-05 | v508 l6 c6 | 187-30 비겁한 쿠키 190M | Stage 187-30 Cowardly Cookie 190M | `001/evidence/05-nv-guide-board-index.tsv:608` (+1) |
| 35966 | nv | 2026-09-05 | v906 l4 c6 | 187-10 폭주단 바이커 207M | Stage 187-10 Rowdy Biker 207M | `001/evidence/05-nv-guide-board-index.tsv:609` (+1) |
| 35965 | nv | 2026-09-05 | v205 l0 c0 | 202-30 딱렙 클리어덱 | Stage 202-30 clear deck at exact level | `001/evidence/05-nv-guide-board-index.tsv:610` (+1) |
| 35955 | nv | 2026-09-05 | v1701 l9 c20 | 219-10 공략:-) | Stage 219-10 guide | `001/evidence/05-nv-guide-board-index.tsv:611` (+1) |
| 35953 | nv | 2026-09-05 | v657 l0 c0 | 208-30 비겁이 클리어덱 | Stage 208-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:613` (+1) |
| 35949 | nv | 2026-09-05 | v76 l0 c2 | 비겁 | Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:3354` |
| 35937 | nv | 2026-09-05 | v62 l0 c1 | 58-30 기록용! | Stage 58-30 for the record ! | `001/evidence/16-top-players/06-nv-free-board.tsv:3358` |
| 35921 | nv | 2026-09-05 | v154 l0 c0 | 187-30 클리어덱 | Stage 187-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:614` (+1) |
| 35919 | nv | 2026-09-05 | v686 l1 c1 | 211-10 (419M) 쥐트리오 | Stage 211-10 (419M) rat biker trio | `001/evidence/05-nv-guide-board-index.tsv:615` (+1) |
| 35910 | nv | 2026-09-05 | v566 l7 c9 | 218-30 공략:-) | Stage 218-30 guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:617` (+1) |
| 35882 | nv | 2026-09-05 | v3420 l95 c29 | 스테이지 덱 추천 (쿨링민트, 비겁한 쿠키 등) | Stage deck recommendations (Cool Mint, Cowardly Cookie, etc.) | `001/evidence/16-top-players/05-nv-guide-board.tsv:618` (+1) |
| 35881 | nv | 2026-09-05 | v155 l0 c0 | 99-10 폭주단 바이커 기록용 전갈x | Stage 99-10 Rowdy Biker for the record Scorpion x | `001/evidence/05-nv-guide-board-index.tsv:618` (+1) |
| 35880 | nv | 2026-09-05 | v33 l0 c0 | 31-10 / 31-30 돌파력100달성 | Stage 31-10 / 31-30, breakthrough 100 | `001/evidence/16-top-players/05-nv-guide-board.tsv:620` (+1) |
| 35875 | nv | 2026-09-05 | v167 l0 c0 | 112-30 비겁이 소과금컷 | Stage 112-30 Cowardly Cookie light spender cut | `001/evidence/05-nv-guide-board-index.tsv:620` (+1) |
| 35872 | nv | 2026-09-05 | v109 l0 c0 | 안뇽하십니까 스테이지 덱 질문 드립니다 | Stage deck question | `001/evidence/16-top-players/06-nv-free-board.tsv:3368` |
| 35862 | nv | 2026-09-05 | v994 l0 c2 | 195-10,195-30 기록용 | Stage 195-10,195-30 for the record | `001/evidence/16-top-players/05-nv-guide-board.tsv:622` (+1) |
| 35860 | nv | 2026-09-05 | v244 l5 c0 | 설원 2가지 덱(저스테까지채용가능) | Two snowfield decks (usable from low stages) | `001/evidence/16-top-players/06-nv-free-board.tsv:3375` |
| 35857 | nv | 2026-09-05 | v225 l0 c4 | 근데 왜 169스테부터 퀘스트 양이 확 줄어요?? | Why do quests shrink from stage 169? | `001/evidence/16-top-players/06-nv-free-board.tsv:3376` |
| 35852 | nv | 2026-09-05 | v974 l0 c17 | 이거 레벨디자인 박살나서 스테보상 줄인거죠? | Level design broke, so they cut stage rewards? | `001/evidence/16-top-players/06-nv-free-board.tsv:3378` |
| 35845 | nv | 2026-09-05 | v53 l0 c0 | 174-12 자객떼거리 | Stage 174-12 assassin swarm | `001/evidence/16-top-players/06-nv-free-board.tsv:3380` |
| 35841 | nv | 2026-09-05 | v903 l11 c8 | 비겁한 쿠키 공략 | Cowardly Cookie guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:623` (+1) |
| 35840 | nv | 2026-09-05 | v301 l6 c5 | 217-30 공략:-) | Stage 217-30 guide | `001/evidence/05-nv-guide-board-index.tsv:623` (+1) |
| 35822 | nv | 2026-09-05 | v84 l0 c1 | 176비겁이 힘드네요 | Stage 176 Cowardly Cookie is hard | `001/evidence/16-top-players/06-nv-free-board.tsv:3383` |
| 35813 | nv | 2026-09-05 | v440 l1 c2 | 179-10 183M937K 수원 | Stage 179-10 at 183.9M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:624` (+1) |
| 35811 | nv | 2026-09-05 | v514 l1 c0 | 187-10 엿같은 바이커덱 | Stage 187-10 nasty Biker deck | `001/evidence/05-nv-guide-board-index.tsv:625` (+1) |
| 35808 | nv | 2026-09-05 | v26 l0 c0 | 81-30 27m | Stage 81-30 27m | `001/evidence/05-nv-guide-board-index.tsv:626` (+1) |
| 35779 | nv | 2026-09-05 | v1179 l8 c20 | 216-30 공략:-) | Stage 216-30 guide | `001/evidence/05-nv-guide-board-index.tsv:627` (+1) |
| 35748 | nv | 2026-09-05 | v123 l0 c0 | 80-30 26m | Stage 80-30 26m | `001/evidence/16-top-players/06-nv-free-board.tsv:3397` |
| 35702 | nv | 2026-09-05 | v882 l2 c3 | 240-30 비겁한쿠키(비쿠) 클리어 영상 | Stage 240-30 Cowardly Cookie ( Cowardly Cookie ) clear video | `001/evidence/05-nv-guide-board-index.tsv:629` (+1) |
| 35642 | nv | 2026-09-05 | v34 l0 c0 | 의외로 80-10에서 고전함 | Surprisingly stuck at 80-10 | `001/evidence/16-top-players/06-nv-free-board.tsv:3411` |
| 35625 | nv | 2026-09-05 | v63 l0 c1 | 180-30 | Stage 180-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:3418` |
| 35620 | nv | 2026-09-05 | v494 l2 c2 | 186-30 클리어덱 | Stage 186-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:630` (+1) |
| 35615 | nv | 2026-09-05 | v896 l3 c1 | 비겁이는 왜 이렇게 비겁한 걸까🤔(171-30 129M 클) | Why so cowardly? (171-30 cleared at 129M) | `001/evidence/05-nv-guide-board-index.tsv:631` (+1) |
| 35607 | nv | 2026-09-05 | v83 l0 c0 | 30-30  쿨링민트 (나만없어우유!) | Stage 30-30 Cool Mint (no Milk) | `001/evidence/05-nv-guide-board-index.tsv:632` (+1) |
| 35573 | nv | 2026-09-05 | v329 l0 c3 | 177-30 쿨민  사진으로 보이는덱으로 깼어요  도움이될까해서요 올려봐요  무과금 광제  파이팅 | Stage 177-30 Cool Mint cleared with the pictured deck | `001/evidence/16-top-players/06-nv-free-board.tsv:3428` |
| 35567 | nv | 2026-09-05 | v385 l0 c2 | 190-30 공략 | Stage 190-30 guide | `001/evidence/05-nv-guide-board-index.tsv:633` (+1) |
| 35559 | nv | 2026-09-05 | v583 l1 c0 | 208-30 (384M) 비겁 | Stage 208-30 (384M) Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:634` (+1) |
| 35535 | nv | 2026-09-05 | v331 l0 c1 | 스테 장비도 스증>>치확,치피 인가요? | Stage gear also skill amp over crit rate/crit DMG? | `001/evidence/16-top-players/06-nv-free-board.tsv:3439` |
| 35523 | nv | 2026-09-05 | v156 l0 c1 | 235-10 쥐토바이 때메 접고싶네 | Stage 235-10 rat bikers make me want to quit | `001/evidence/16-top-players/06-nv-free-board.tsv:3443` |
| 35510 | nv | 2026-09-05 | v969 l0 c1 | 203-10 노답 바이커 클 | Stage 203-10 hopeless Biker cleared | `001/evidence/05-nv-guide-board-index.tsv:635` (+1) |
| 35506 | nv | 2026-09-05 | v446 l1 c2 | 203-30 클리어 조합 | Stage 203-30 clear comp | `001/evidence/05-nv-guide-board-index.tsv:636` (+1) |
| 35464 | nv | 2026-09-05 | v118 l0 c0 | 스테이지 보상좀 원상복구좀.. | Restore stage rewards please | `001/evidence/16-top-players/06-nv-free-board.tsv:3459` |
| 35460 | nv | 2026-09-05 | v406 l0 c0 | 171-30 | Stage 171-30 | `001/evidence/16-top-players/06-nv-free-board.tsv:3462` |
| 35458 | nv | 2026-09-05 | v680 l8 c11 | 222 스테이지 레드베리 암살자 | Stage 222 stage Redberry Assassin | `001/evidence/16-top-players/06-nv-free-board.tsv:3464` |
| 35452 | nv | 2026-09-04 | v931 l0 c6 | 211-30 비겁이공략 /명랑x덱 | Stage 211-30 Cowardly Cookie guide / no-Cheerful deck | `001/evidence/05-nv-guide-board-index.tsv:637` (+1) |
| 35449 | nv | 2026-09-04 | v395 l3 c0 | 221-20 마오카이 + 마오카이 나오는 맵 사용덱 | Stage 221-20 'Maokai' + deck for maps with it | `001/evidence/16-top-players/06-nv-free-board.tsv:3467` |
| 35421 | nv | 2026-09-04 | v921 l0 c5 | 184-30 클리어덱 | Stage 184-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:639` (+1) |
| 35412 | nv | 2026-09-04 | v1772 l16 c16 | 219-30 비겁이, 그다음 220 사막 풀오토 | Stage 219-30 Cowardly Cookie, then 220 desert on full auto | `001/evidence/16-top-players/06-nv-free-board.tsv:3474` |
| 35406 | nv | 2026-09-04 | v54 l0 c0 | 대충 41-30 무과금덱 | Rough 41-30 F2P deck | `001/evidence/16-top-players/06-nv-free-board.tsv:3478` |
| 35402 | nv | 2026-09-04 | v451 l2 c1 | 베테랑 용병단의 망치 공주 최신 공략 | Veteran merc band's latest Werehound Princess guide | `001/evidence/05-nv-guide-board-index.tsv:640` (+1) |
| 35383 | nv | 2026-09-04 | v200 l1 c1 | 75-30 25m | Stage 75-30 25m | `001/evidence/05-nv-guide-board-index.tsv:641` (+1) |
| 35370 | nv | 2026-09-04 | v80 l0 c0 | 59-30 클리어!! | Stage 59-30 clear !! | `001/evidence/16-top-players/06-nv-free-board.tsv:3490` |
| 35362 | nv | 2026-09-04 | v257 l1 c2 | 75-20 연타덱 27.42M | Stage 75-20 rapid-fire deck 27.42M | `001/evidence/05-nv-guide-board-index.tsv:643` (+1) |
| 35350 | nv | 2026-09-04 | v1086 l1 c3 | 슈가룬+스테이지템수치질문 | Sugar runes and stage gear values question | `001/evidence/16-top-players/06-nv-free-board.tsv:3494` |
| 35345 | nv | 2026-09-04 | v286 l2 c0 | 베테랑 용병단의 그루터기 정령 최신 공략 | Veteran merc band's latest Tainted Ent guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:645` (+1) |
| 35336 | nv | 2026-09-04 | v212 l0 c0 | 54-30 쿨만 공략 | Stage 54-30 Cool Mint guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:646` (+1) |
| 35315 | nv | 2026-09-04 | v190 l3 c1 | 4번 보스 : 망치공주 (조작감 개편) | Boss #4: Werehound Princess (controls rework) | `001/evidence/05-nv-guide-board-index.tsv:647` (+1) |
| 35271 | nv | 2026-09-04 | v465 l3 c4 | 200-30.... 하..... 정말 집어 던질 뻔 했습니다.. | Stage 200-30... nearly threw my phone | `001/evidence/16-top-players/06-nv-free-board.tsv:3516` |
| 35227 | nv | 2026-09-04 | v102 l0 c0 | 33-30 투력 1.95M 클리어 | Stage 33-30 power 1.95M clear | `001/evidence/05-nv-guide-board-index.tsv:652` (+1) |
| 35222 | nv | 2026-09-04 | v1302 l28 c11 | [비쿠] 비겁한 쿠키 전 구간 통용 클리어영상 | [Cowardly] clear video valid for all Cowardly Cookie stages | `001/evidence/05-nv-guide-board-index.tsv:653` (+1) |
| 35207 | nv | 2026-09-04 | v130 l2 c3 | 86-20 42m (망치공주) | Stage 86-20 42m ( Choco Werehound Princess ) | `001/evidence/05-nv-guide-board-index.tsv:654` (+1) |
| 35146 | nv | 2026-09-04 | v421 l4 c0 | 186-30 쿨민 클리어덱 | Stage 186-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:655` (+1) |
| 35139 | nv | 2026-09-04 | v59 l0 c0 | 64-20 설탕골렘 | Stage 64-20 Sugar Golem | `001/evidence/05-nv-guide-board-index.tsv:656` (+1) |
| 35133 | nv | 2026-09-04 | v378 l0 c6 | 비겁한 쿠키 공포 후에 돌아올 때 | When Cowardly Cookie returns after its fear | `001/evidence/16-top-players/06-nv-free-board.tsv:3550` |
| 35096 | nv | 2026-09-04 | v102 l3 c0 | 75-10 쿨민 25m 클리어 | Stage 75-10 Cool Mint 25m clear | `001/evidence/16-top-players/06-nv-free-board.tsv:3555` |
| 35095 | nv | 2026-09-04 | v133 l0 c2 | 스테이지 상승에 따른 보상 | Rewards by stage progress | `001/evidence/16-top-players/06-nv-free-board.tsv:3556` |
| 35078 | nv | 2026-09-04 | v103 l0 c0 | 82-30 쿨민 클리어덱 | Stage 82-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:657` (+1) |
| 35054 | nv | 2026-09-04 | v559 l0 c19 | 179-10에서 막혔어요 ㅠ 조언 좀 | Stuck at 179-10; advice | `001/evidence/16-top-players/06-nv-free-board.tsv:3564` |
| 35046 | nv | 2026-09-04 | v150 l0 c1 | 비겁이 잡을때 명랑이 왜케 띠리하죠 | Why is Cheerful so dumb vs Cowardly Cookie? | `001/evidence/16-top-players/06-nv-free-board.tsv:3565` |
| 35034 | nv | 2026-09-04 | v714 l1 c15 | 형들 173-10 에서 진도가 안나가 | No progress at 173-10 | `001/evidence/16-top-players/06-nv-free-board.tsv:3566` |
| 35018 | nv | 2026-09-04 | v147 l0 c0 | 186-10,20 클리어덱 | Stage 186-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:658` (+1) |
| 35017 | nv | 2026-09-04 | v232 l4 c2 | 185-30 쿨민 클리어덱 | Stage 185-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:659` (+1) |
| 34982 | nv | 2026-09-04 | v37 l0 c0 | 쥐돌이 | rat bikers | `001/evidence/16-top-players/06-nv-free-board.tsv:3574` |
| 34959 | nv | 2026-09-04 | v842 l6 c2 | 219-10 쥐돌이 | Stage 219-10 rat bikers | `001/evidence/16-top-players/06-nv-free-board.tsv:3576` |
| 34942 | nv | 2026-09-04 | v847 l4 c3 | 214-30 공략:-) | Stage 214-30 guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:662` (+1) |
| 34930 | nv | 2026-09-04 | v851 l5 c27 | 214-20 공략:-) | Stage 214-20 guide | `001/evidence/05-nv-guide-board-index.tsv:662` (+1) |
| 34905 | nv | 2026-09-04 | v390 l4 c2 | 213-30 공략:-) | Stage 213-30 guide | `001/evidence/05-nv-guide-board-index.tsv:663` (+1) |
| 34900 | nv | 2026-09-04 | v71 l0 c4 | 쿨민 | Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:3588` |
| 34873 | nv | 2026-09-04 | v3363 l104 c14 | 보스별 덱 정리 (비겁/쿨민) | per boss deck summary ( Cowardly Cookie / Cool Mint ) | `001/evidence/05-nv-guide-board-index.tsv:665` (+1) |
| 34871 | nv | 2026-09-04 | v282 l1 c2 | 비겁이 ㅈ밥컷 | Cowardly Cookie trivial cut | `001/evidence/16-top-players/06-nv-free-board.tsv:3594` |
| 34866 | nv | 2026-09-03 | v259 l0 c2 | 179-20 잔혹한 교통사고의 현장 | Stage 179-20 brutal traffic-accident scene (Truck) | `001/evidence/16-top-players/06-nv-free-board.tsv:3595` |
| 34853 | nv | 2026-09-03 | v790 l1 c2 | 179-10 쥐돌이 폭주단 바이커 공략 / 207M 680k | Stage 179-10 rat bikers Rowdy Biker guide / 207M 680k | `001/evidence/05-nv-guide-board-index.tsv:666` (+1) |
| 34852 | nv | 2026-09-03 | v403 l0 c1 | 178-30 쿨민 공략 / 197M 206k | Stage 178-30 Cool Mint guide / 197M 206k | `001/evidence/05-nv-guide-board-index.tsv:667` (+1) |
| 34810 | nv | 2026-09-03 | v180 l2 c0 | 72-30 저스펙 클리어 | Stage 72-30 low spec clear | `001/evidence/16-top-players/06-nv-free-board.tsv:3606` |
| 34807 | nv | 2026-09-03 | v88 l0 c0 | 169스테이지 이후 퀘스트보상 | Quest rewards after stage 169 | `001/evidence/16-top-players/06-nv-free-board.tsv:3608` |
| 34759 | nv | 2026-09-03 | v848 l2 c1 | 베테랑 용병단의 바이커 최신 공략 (227-10) | Veteran merc band's latest Biker guide (227-10) | `001/evidence/05-nv-guide-board-index.tsv:668` (+1) |
| 34734 | nv | 2026-09-03 | v28 l0 c0 | 쿨민 | Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:3617` |
| 34725 | nv | 2026-09-03 | v440 l0 c0 | 216-30 주차 2일차.. | Parked at 216-30, day 2 | `001/evidence/16-top-players/06-nv-free-board.tsv:3621` |
| 34721 | nv | 2026-09-03 | v119 l1 c1 | 쥐돌이때문에 접어요 | Quitting because of the rat bikers | `001/evidence/16-top-players/06-nv-free-board.tsv:3624` |
| 34706 | nv | 2026-09-03 | v792 l2 c1 | 211-30 비겁 | Stage 211-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:669` (+1) |
| 34688 | nv | 2026-09-03 | v333 l2 c0 | 217-30 쿨민덱 *길토전땜에 느림 | Stage 217-30 Cool Mint deck (slow due to Conquest) | `001/evidence/16-top-players/06-nv-free-board.tsv:3633` |
| 34680 | nv | 2026-09-03 | v86 l0 c0 | 53-30 그루지기 클리어 무과금덱 | Stage 53-30 Tainted Ent clear F2P deck | `001/evidence/05-nv-guide-board-index.tsv:671` (+1) |
| 34679 | nv | 2026-09-03 | v48 l0 c0 | 53-20 그루지기 클리어 무과금덱 | Stage 53-20 Tainted Ent clear F2P deck | `001/evidence/05-nv-guide-board-index.tsv:672` (+1) |
| 34667 | nv | 2026-09-03 | v335 l2 c0 | 베테랑 용병단의 쿨민 최신 공략 (225-30) | Veteran merc band's latest Cool Mint guide (225-30) | `001/evidence/05-nv-guide-board-index.tsv:673` (+1) |
| 34651 | nv | 2026-09-03 | v342 l1 c2 | 64-30 비겁이 안깨져요 | Can't beat 64-30 Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:3639` |
| 34620 | nv | 2026-09-03 | v676 l3 c12 | 시커없는 스테이지 덱좀요 ㅠ | Stage deck without Seeker please | `001/evidence/16-top-players/06-nv-free-board.tsv:3646` |
| 34593 | nv | 2026-09-03 | v193 l3 c0 | 214-30쿨민 | Stage 214-30 Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:3654` |
| 34588 | nv | 2026-09-03 | v179 l2 c0 | 70-30 20m  클려 | Stage 70-30 20m clear | `001/evidence/16-top-players/06-nv-free-board.tsv:3656` |
| 34587 | nv | 2026-09-03 | v175 l0 c0 | 178-30 클리어덱 | Stage 178-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:677` (+1) |
| 34585 | nv | 2026-09-03 | v315 l0 c3 | 스테덱 710M,총투 2G743M 매물입니다 | Selling account: stage deck 710M, total 2.743G | `001/evidence/16-top-players/06-nv-free-board.tsv:3657` |
| 34582 | nv | 2026-09-03 | v191 l0 c8 | 34-30 진짜 너무 어렵네여 | Stage 34-30 is really hard | `001/evidence/16-top-players/06-nv-free-board.tsv:3659` |
| 34573 | nv | 2026-09-03 | v820 l1 c3 | 179-30 비겁이 | Stage 179-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:678` (+1) |
| 34542 | nv | 2026-09-03 | v109 l1 c4 | 쿨민 어떻게 잡아야하나요 ㅠㅠ | How to beat Cool Mint? | `001/evidence/16-top-players/06-nv-free-board.tsv:3667` |
| 34535 | nv | 2026-09-03 | v31 l0 c0 | 스테가 안밀려요 | Stages won't push | `001/evidence/16-top-players/06-nv-free-board.tsv:3669` |
| 34513 | nv | 2026-09-03 | v141 l0 c1 | 168 이후 스테덱 이제 어케 짜야해? | How to build stage decks after 168? | `001/evidence/16-top-players/06-nv-free-board.tsv:3674` |
| 34490 | nv | 2026-09-03 | v159 l1 c1 | 185-10,20 클리어덱 | Stage 185-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:680` (+1) |
| 34444 | nv | 2026-09-03 | v193 l0 c0 | 203-11 (339M) 쥐트리오 | Stage 203-11 (339M) rat biker trio | `001/evidence/05-nv-guide-board-index.tsv:681` (+1) |
| 34409 | nv | 2026-09-03 | v555 l0 c2 | 비겁은 방깎을 얼마나 잘 묻히냐에 따라 나뉨. | Cowardly Cookie depends on how well DEF-down lands | `001/evidence/05-nv-guide-board-index.tsv:682` (+1) |
| 34404 | nv | 2026-09-03 | v161 l0 c2 | 이제 93스테이지인데 명중률 슬슬 필요한가요? | Stage 93: need accuracy yet? | `001/evidence/16-top-players/06-nv-free-board.tsv:3713` |
| 34296 | nv | 2026-09-03 | v781 l2 c1 | 179-30 비겁이 (166M) | Stage 179-30 Cowardly Cookie (166M) | `001/evidence/05-nv-guide-board-index.tsv:684` (+1) |
| 34275 | nv | 2026-09-03 | v617 l0 c1 | 200-30 (307M) 비겁 | Stage 200-30 (307M) Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:685` (+1) |
| 34258 | nv | 2026-09-03 | v891 l0 c2 | 184-30 비겁이 클리어덱 | Stage 184-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:686` (+1) |
| 34257 | nv | 2026-09-03 | v129 l0 c1 | 184-10,20 클리어덱 | Stage 184-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:687` (+1) |
| 34195 | nv | 2026-09-03 | v734 l0 c5 | 10시간 넘게 방치보상받아도 티도안나네 | 10+ hours of idle rewards barely noticeable | `001/evidence/16-top-players/06-nv-free-board.tsv:3762` |
| 34191 | nv | 2026-09-03 | v292 l0 c0 | 174-20 망치공주 | Stage 174-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:688` (+1) |
| 34189 | nv | 2026-09-03 | v499 l1 c1 | 179-20 연타덱 | Stage 179-20 rapid-fire deck | `001/evidence/05-nv-guide-board-index.tsv:689` (+1) |
| 34174 | nv | 2026-09-03 | v332 l0 c2 | 비겁이 10스택 꿀팁. (pc 애뮬 이용자) | Cowardly Cookie 10-stack tip (PC emulator users) | `001/evidence/05-nv-guide-board-index.tsv:690` (+1) |
| 34156 | nv | 2026-09-03 | v8257 l274 c50 | 230스테까지 민 각 보스별 덱(망치공주/비겁이/쥐돌이/쿨링민트/폭주단트럭), 방치덱 | Per-boss decks to stage 230 (Werehound, Cowardly, rat bikers, Cool Mint, Truck) + idle deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:692` (+1) |
| 34123 | nv | 2026-09-03 | v709 l6 c1 | 203-30 비겁이 클리어덱 | Stage 203-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:692` (+1) |
| 34077 | nv | 2026-09-02 | v917 l0 c3 | 203-10 혐돌이 클리어덱 | Stage 203-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:693` (+1) |
| 34050 | nv | 2026-09-02 | v420 l0 c0 | 174 스테이지 공략 (레드베리 암살자, 쿨민) | Stage 174 stage guide ( Redberry Assassin , Cool Mint ) | `001/evidence/05-nv-guide-board-index.tsv:694` (+1) |
| 34047 | nv | 2026-09-02 | v468 l0 c0 | 200-30 비겁이덱 | Stage 200-30 Cowardly Cookie deck | `001/evidence/05-nv-guide-board-index.tsv:695` (+1) |
| 34021 | nv | 2026-09-02 | v401 l4 c0 | 213-20 공략:-) | Stage 213-20 guide | `001/evidence/05-nv-guide-board-index.tsv:696` (+1) |
| 33993 | nv | 2026-09-02 | v86 l1 c0 | 10-30 쿨링민트 | Stage 10-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:697` (+1) |
| 33990 | nv | 2026-09-02 | v303 l0 c0 | 비겁 | Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:3785` |
| 33987 | nv | 2026-09-02 | v153 l0 c2 | 183-20,30 클리어덱 | Stage 183-20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:698` (+1) |
| 33928 | nv | 2026-09-02 | v117 l1 c0 | 234-30 쿨민 | Stage 234-30 Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:3795` |
| 33920 | nv | 2026-09-02 | v137 l0 c0 | 아 ㅡㅡ 진짜 누워버릴라. 지금 내 오븐에 아레나용 무기가 쌓여있는데 프리셋은 스테용 프리셋임 뭐하자는거냐? 주작아니냐 이정도면 | Oven drops arena weapons while the preset is the stage preset | `001/evidence/16-top-players/06-nv-free-board.tsv:3799` |
| 33916 | nv | 2026-09-02 | v212 l0 c3 | 3번 보스 : 쿨링민트 쿠키 (조작감 개편) | Boss #3: Cool Mint Cookie (controls rework) | `001/evidence/05-nv-guide-board-index.tsv:699` (+1) |
| 33911 | nv | 2026-09-02 | v1485 l5 c10 | 176-30 클리어덱 | Stage 176-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:700` (+1) |
| 33909 | nv | 2026-09-02 | v95 l0 c1 | 210 스테 이후 | After stage 210 | `001/evidence/16-top-players/06-nv-free-board.tsv:3803` |
| 33904 | nv | 2026-09-02 | v264 l2 c2 | 46-30 덱 | Stage 46-30 deck | `001/evidence/05-nv-guide-board-index.tsv:701` (+1) |
| 33902 | nv | 2026-09-02 | v115 l0 c1 | 스테덱659M,총투2G530M 계정 | Account: stage deck 659M, total 2.530G | `001/evidence/16-top-players/06-nv-free-board.tsv:3805` |
| 33868 | nv | 2026-09-02 | v57 l0 c0 | 158-20 망치맨 | Stage 158-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:702` (+1) |
| 33844 | nv | 2026-09-02 | v324 l5 c5 | 64-30 비겁이 | Stage 64-30 Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:3819` |
| 33835 | nv | 2026-09-02 | v260 l0 c3 | 216-30 비쿱이 말인데 | About 216-30 Cowardly Cookie | `001/evidence/16-top-players/06-nv-free-board.tsv:3822` |
| 33826 | nv | 2026-09-02 | v118 l0 c1 | 제발 34-30 쿨민 스펙좀봐주세여ㅠㅠ | Stage 34-30 Cool Mint: please check my spec | `001/evidence/16-top-players/06-nv-free-board.tsv:3828` |
| 33818 | nv | 2026-09-02 | v41 l5 c0 | 데브 직원들은 꼭 쥐토바이 닮은 자식 갖길 | Rat-biker rant | `001/evidence/16-top-players/06-nv-free-board.tsv:3829` |
| 33814 | nv | 2026-09-02 | v151 l1 c5 | 쥐토바이덕에 | Thanks to the rat bikers... | `001/evidence/16-top-players/06-nv-free-board.tsv:3831` |
| 33812 | nv | 2026-09-02 | v405 l1 c3 | 232-30 비겁 5시간만에 클.. | Stage 232-30 Cowardly Cookie cleared after 5 hours | `001/evidence/16-top-players/06-nv-free-board.tsv:3832` |
| 33801 | nv | 2026-09-02 | v1043 l3 c5 | 211-10 쥐토바이 | Stage 211-10 rat bikers | `001/evidence/05-nv-guide-board-index.tsv:703` (+1) |
| 33797 | nv | 2026-09-02 | v138 l0 c2 | 스테가 막히기 시작하니 | Once stages start blocking... | `001/evidence/16-top-players/06-nv-free-board.tsv:3835` |
| 33768 | nv | 2026-09-02 | v193 l0 c0 | 51-30 무과금 비겁이 클리어 | Stage 51-30 F2P Cowardly Cookie clear | `001/evidence/05-nv-guide-board-index.tsv:704` (+1) |
| 33759 | nv | 2026-09-02 | v583 l0 c2 | 171-10 쥐돌이 클리어 덱 / 160M 331K | Stage 171-10 rat bikers clear deck / 160M 331K | `001/evidence/05-nv-guide-board-index.tsv:705` (+1) |
| 33734 | nv | 2026-09-02 | v4329 l118 c11 | 업데이트 이후 스테이지/보스별 덱 2종 | Two stage/per-boss decks after the update | `001/evidence/16-top-players/05-nv-guide-board.tsv:707` (+1) |
| 33732 | nv | 2026-09-02 | v141 l1 c0 | 다음 스테이지 확장 예상. | Next stage expansion prediction | `001/evidence/16-top-players/06-nv-free-board.tsv:3841` |
| 33706 | nv | 2026-09-02 | v233 l0 c6 | 하..80-30 비겁이 클리어덱?? 기록 | Stage 80-30 Cowardly Cookie clear deck, record | `001/evidence/16-top-players/06-nv-free-board.tsv:3846` |
| 33684 | nv | 2026-09-02 | v97 l0 c0 | 다음업뎃에 스테이지 너프 ㄱㄱ | Nerf stages next update | `001/evidence/16-top-players/06-nv-free-board.tsv:3848` |
| 33662 | nv | 2026-09-02 | v1297 l2 c2 | 초보를 위한 스테이지 초고속팁 | Speed tips for beginners on stages | `001/evidence/05-nv-guide-board-index.tsv:707` (+1) |
| 33642 | nv | 2026-09-02 | v220 l1 c0 | 214-20 망취 | Stage 214-20 Choco Werehound Princess | `001/evidence/16-top-players/06-nv-free-board.tsv:3861` |
| 33586 | nv | 2026-09-02 | v244 l0 c6 | 전갈 20스택 비겁이 빠르게 쌓는데 피가 왜 안닳아? | Scorpion 20 stacks fast on Cowardly Cookie, but HP won't drop? | `001/evidence/16-top-players/06-nv-free-board.tsv:3874` |
| 33584 | nv | 2026-09-02 | v105 l0 c0 | 107-10 바이크덱 공유합니다 | Stage 107-10 Biker deck share | `001/evidence/05-nv-guide-board-index.tsv:709` (+1) |
| 33577 | nv | 2026-09-02 | v754 l6 c2 | 195스테 중과금 유저 푸념 | Mid-spender rant at stage 195 | `001/evidence/16-top-players/06-nv-free-board.tsv:3875` |
| 33576 | nv | 2026-09-02 | v883 l2 c1 | 182-30 쿨민 클리어덱 | Stage 182-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:711` (+1) |
| 33571 | nv | 2026-09-02 | v238 l0 c6 | 무과금,광제 유져분들 중에 168-30 깨신 분 계신가요? | Any F2P/Gwangje players cleared 168-30? | `001/evidence/16-top-players/06-nv-free-board.tsv:3876` |
| 33563 | nv | 2026-09-02 | v81 l0 c2 | 33-30 덱 공유 | Stage 33-30 deck share | `001/evidence/05-nv-guide-board-index.tsv:712` (+1) |
| 33550 | nv | 2026-09-02 | v164 l1 c1 | 이 겜은 스테 168전까지가 제일 재밌음 | Most fun before stage 168 | `001/evidence/16-top-players/06-nv-free-board.tsv:3880` |
| 33535 | nv | 2026-09-02 | v931 l3 c15 | 211-30 공략:-) | Stage 211-30 guide | `001/evidence/05-nv-guide-board-index.tsv:713` (+1) |
| 33517 | nv | 2026-09-02 | v90 l0 c0 | 168스테이지 이후 너무 도파민이 없다 | No thrill at all after stage 168 | `001/evidence/16-top-players/06-nv-free-board.tsv:3884` |
| 33509 | nv | 2026-09-02 | v253 l0 c6 | 본인 전투력으로 스테이지 어디까지 밀릴지 | How far can your power push? | `001/evidence/16-top-players/06-nv-free-board.tsv:3885` |
| 33507 | nv | 2026-09-02 | v557 l4 c0 | 공원스테 덱(레드베리암살자,식쿠식물등) | Park-stage deck (Redberry Assassin, cookie-eating plant, etc.) | `001/evidence/16-top-players/06-nv-free-board.tsv:3886` |
| 33500 | nv | 2026-09-02 | v181 l0 c5 | 생크림콘 독수리 너무 아파 | Cream Eagle hits too hard | `001/evidence/16-top-players/06-nv-free-board.tsv:3887` |
| 33498 | nv | 2026-09-02 | v138 l0 c4 | 아 영자님아 쥐토바이좀 어케해봐요 | Please do something about the rat bikers | `001/evidence/16-top-players/06-nv-free-board.tsv:3888` |
| 33468 | nv | 2026-09-02 | v306 l0 c0 | 214-30 쿨민 덱공유 | Stage 214-30 Cool Mint deck share | `001/evidence/05-nv-guide-board-index.tsv:714` (+1) |
| 33443 | nv | 2026-09-02 | v47 l0 c0 | 쿨민 | Cool Mint | `001/evidence/16-top-players/06-nv-free-board.tsv:3896` |
| 33441 | nv | 2026-09-02 | v290 l1 c1 | 182-20 | Stage 182-20 | `001/evidence/05-nv-guide-board-index.tsv:715` (+1) |
| 33375 | nv | 2026-09-02 | v409 l1 c0 | 182-10,20 망치공주 클리어덱 | Stage 182-10,20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:717` (+1) |
| 33353 | nv | 2026-09-02 | v1307 l4 c8 | 176-30 비겁이 그냥 늘 하던대로 제가 최저컷인듯요? 149m | Stage 176-30 Cowardly Cookie: lowest cut at 149M? | `001/evidence/16-top-players/06-nv-free-board.tsv:3910` |
| 33340 | nv | 2026-09-02 | v252 l2 c0 | 2번 보스 : 폭주단 트럭 + 도마뱀 (조작감 개편) | Boss #2: Rowdy Truck + Lizard (controls rework) | `001/evidence/05-nv-guide-board-index.tsv:718` (+1) |
| 33313 | nv | 2026-09-02 | v57 l1 c2 | 쿨민 때문에 개 열받는다 | Cool Mint makes me furious | `001/evidence/16-top-players/06-nv-free-board.tsv:3918` |
| 33308 | nv | 2026-09-02 | v231 l0 c5 | 가방에서 코인이랑 쿠키경험치 최대한 스테 밀고 쓰는게 맞죠? | Use bag coins/cookie EXP only after pushing stages? | `001/evidence/16-top-players/06-nv-free-board.tsv:3919` |
| 33275 | nv | 2026-09-02 | v853 l0 c0 | 171-30 클리어덱 | Stage 171-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:720` (+1) |
| 33258 | nv | 2026-09-02 | v1430 l4 c26 | 211-10 공략:-) | Stage 211-10 guide | `001/evidence/05-nv-guide-board-index.tsv:721` (+1) |
| 33247 | nv | 2026-09-02 | v254 l2 c0 | 181-30 그루터기 클리어덱 | Stage 181-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:722` (+1) |
| 33246 | nv | 2026-09-02 | v214 l1 c0 | 181-10,20 클리어덱 | Stage 181-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:723` (+1) |
| 33245 | nv | 2026-09-02 | v417 l1 c1 | 초보유저용 쥐토바이 자동사냥 꿀팁 | Rat-biker auto-hunt tip for beginners | `001/evidence/05-nv-guide-board-index.tsv:724` (+1) |
| 33231 | nv | 2026-09-02 | v669 l1 c1 | 베테랑 용병단의 비겁이 최신 공략 (219-30) | Veteran merc band's latest Cowardly Cookie guide (219-30) | `001/evidence/05-nv-guide-board-index.tsv:726` (+1) |
| 33222 | nv | 2026-09-02 | v198 l0 c3 | 스테 어디까지 밀릴까요 | How far can I push? | `001/evidence/16-top-players/06-nv-free-board.tsv:3939` |
| 33196 | nv | 2026-09-01 | v102 l1 c0 | 168-30 기록만 ㅠ | Stage 168-30 record ㅠ | `001/evidence/16-top-players/06-nv-free-board.tsv:3946` |
| 33193 | nv | 2026-09-01 | v897 l0 c0 | 195-10 쥐돌이 클리어덱 | Stage 195-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:727` (+1) |
| 33192 | nv | 2026-09-01 | v103 l0 c0 | 37-20 | Stage 37-20 | `001/evidence/05-nv-guide-board-index.tsv:728` (+1) |
| 33184 | nv | 2026-09-01 | v1478 l5 c4 | 211-30 비겁이 덱 (용병단 4레벨) | Stage 211-30 Cowardly Cookie deck (merc Lv4) | `001/evidence/16-top-players/06-nv-free-board.tsv:3950` |
| 33176 | nv | 2026-09-01 | v250 l0 c0 | 스테이지 주차 할때 | When parking on a stage | `001/evidence/16-top-players/06-nv-free-board.tsv:3951` |
| 33175 | nv | 2026-09-01 | v277 l3 c2 | 173-20 그루터기 공략 덱 | Stage 173-20 Tainted Ent guide deck | `001/evidence/05-nv-guide-board-index.tsv:729` (+1) |
| 33160 | nv | 2026-09-01 | v604 l2 c3 | 174-30 쿨민 145m | Stage 174-30 Cool Mint 145m | `001/evidence/16-top-players/06-nv-free-board.tsv:3954` |
| 33144 | nv | 2026-09-01 | v786 l0 c12 | 210-30 공략:-) | Stage 210-30 guide | `001/evidence/05-nv-guide-board-index.tsv:730` (+1) |
| 33140 | nv | 2026-09-01 | v243 l1 c2 | 32-30 비겁이 상대할 때 중요한게 뭔가요 | What matters vs 32-30 Cowardly Cookie? | `001/evidence/16-top-players/06-nv-free-board.tsv:3960` |
| 33133 | nv | 2026-09-01 | v197 l0 c2 | 172-10 생크림콘 독수리 공략 덱 | Stage 172-10 Cream Eagle guide deck | `001/evidence/05-nv-guide-board-index.tsv:731` (+1) |
| 33128 | nv | 2026-09-01 | v373 l2 c3 | 비겁이 보스 Cookie No Move 버전?(64-30) | Cowardly Cookie boss "cookie no move" version (64-30) | `001/evidence/05-nv-guide-board-index.tsv:733` (+1) |
| 33124 | nv | 2026-09-01 | v222 l0 c1 | 174-20 망치부인 140m 컷 | Stage 174-20 Choco Werehound Princess 140m cut | `001/evidence/16-top-players/06-nv-free-board.tsv:3963` |
| 33087 | nv | 2026-09-01 | v426 l2 c0 | 211-10 쥐토바이 기록용 | Stage 211-10 rat bikers for the record | `001/evidence/16-top-players/06-nv-free-board.tsv:3977` |
| 33082 | nv | 2026-09-01 | v239 l2 c1 | 보상 너프에다 스테이지 어려워지고 할맛이 안남 | Reward nerf + harder stages: no motivation | `001/evidence/16-top-players/06-nv-free-board.tsv:3980` |
| 33064 | nv | 2026-09-01 | v121 l3 c1 | 180-20,30 클리어덱 | Stage 180-20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:734` (+1) |
| 33044 | nv | 2026-09-01 | v208 l2 c1 | 난이도 잔뜩 올려놓고 보상 창렬내 놨으니 올라갈 이유가 없네 ㅋㅋㅋ 스테이지 확장 무새들 입틀어 막기 성공했네 ㅋㅋㅋ | Harder and stingier; no reason to climb | `001/evidence/16-top-players/06-nv-free-board.tsv:3986` |
| 33041 | nv | 2026-09-01 | v257 l1 c1 | 50-30 쿨민 무과금덱 | Stage 50-30 Cool Mint F2P deck | `001/evidence/05-nv-guide-board-index.tsv:735` (+1) |
| 33019 | nv | 2026-09-01 | v388 l1 c9 | 209-30 공략:-) | Stage 209-30 guide | `001/evidence/05-nv-guide-board-index.tsv:737` (+1) |
| 33018 | nv | 2026-09-01 | v270 l1 c3 | 스테이지 보상이 쓰레기라 재미가없다 | Stage rewards are trash, no fun | `001/evidence/16-top-players/06-nv-free-board.tsv:3992` |
| 33011 | nv | 2026-09-01 | v349 l0 c0 | 투력 41M의 88-30 비겁이 온몸비틀기 | Stage 88-30 Cowardly Cookie scraped through at 41M power | `001/evidence/05-nv-guide-board-index.tsv:738` (+1) |
| 33009 | nv | 2026-09-01 | v152 l0 c1 | 35-30 드디어 클.. | Stage 35-30 finally clear .. | `001/evidence/05-nv-guide-board-index.tsv:739` (+1) |
| 33007 | nv | 2026-09-01 | v4825 l159 c44 | 보스덱 (쿨링민트/비겁/그루터기/망치공주) | boss deck ( Cool Mint / Cowardly Cookie / Tainted Ent / Choco Werehound Princess ) | `001/evidence/16-top-players/05-nv-guide-board.tsv:741` (+1) |
| 32987 | nv | 2026-09-01 | v162 l0 c0 | 180-10 클리어덱 | Stage 180-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:741` (+1) |
| 32969 | nv | 2026-09-01 | v650 l3 c1 | 179-30 비겁이 클리어덱 | Stage 179-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:742` (+1) |
| 32958 | nv | 2026-09-01 | v1370 l9 c20 | 208-30 공략:-) | Stage 208-30 guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:744` (+1) |
| 32948 | nv | 2026-09-01 | v89 l0 c0 | 37-30 노컨 클 | Stage 37-30 no control clear | `001/evidence/05-nv-guide-board-index.tsv:745` (+1) |
| 32924 | nv | 2026-09-01 | v478 l2 c2 | 219-30 비겁이 클 | Stage 219-30 Cowardly Cookie clear | `001/evidence/05-nv-guide-board-index.tsv:748` (+1) |
| 32918 | nv | 2026-09-01 | v85 l0 c0 | 173-20 | Stage 173-20 | `001/evidence/05-nv-guide-board-index.tsv:749` (+1) |
| 32850 | nv | 2026-09-01 | v2047 l18 c0 | 임플란트 타워 850층 등반완료[기록용] | Implant Tower floor 850 done (record) | `001/evidence/16-top-players/05-nv-guide-board.tsv:752` (+1) |
| 32825 | nv | 2026-09-01 | v652 l3 c3 | 198-30 (282m) 쿨민 | Stage 198-30 (282m) Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:752` (+1) |
| 32797 | nv | 2026-09-01 | v277 l0 c0 | 40-30 비겁이 덱 추천좀 해주세요 | Stage 40-30 Cowardly Cookie deck please | `001/evidence/05-nv-guide-board-index.tsv:753` (+1) |
| 32794 | nv | 2026-09-01 | v598 l0 c0 | 184-30 비겁이 기록용 | Stage 184-30 Cowardly Cookie for the record | `001/evidence/05-nv-guide-board-index.tsv:754` (+1) |
| 32783 | nv | 2026-09-01 | v565 l2 c1 | 179-30 비겁이 175M 클리어덱 | Stage 179-30 Cowardly Cookie 175M clear deck | `001/evidence/05-nv-guide-board-index.tsv:755` (+1) |
| 32773 | nv | 2026-09-01 | v386 l2 c7 | 179-20 트럭 클리어덱 | Stage 179-20 Truck clear deck | `001/evidence/05-nv-guide-board-index.tsv:756` (+1) |
| 32770 | nv | 2026-09-01 | v294 l3 c0 | 198-20 (280M) 망치 | Stage 198-20 (280M) Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:757` (+1) |
| 32701 | nv | 2026-09-01 | v656 l0 c5 | 179-10 쥐토바이 클리어덱 | Stage 179-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:758` (+1) |
| 32680 | nv | 2026-09-01 | v310 l0 c2 | 178-30 쿨민 클리어덱 | Stage 178-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:759` (+1) |
| 32630 | nv | 2026-09-01 | v821 l4 c3 | 171-30 비겁이 클리어덱 | Stage 171-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:760` (+1) |
| 32616 | nv | 2026-09-01 | v311 l0 c3 | 178-10,20 클리어덱 | Stage 178-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:761` (+1) |
| 32533 | nv | 2026-09-01 | v295 l0 c0 | 177-30 쿨민 클리어덱 | Stage 177-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:762` (+1) |
| 32509 | nv | 2026-08-31 | v54 l0 c0 | 177-10,20 클리어덱 | Stage 177-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:763` (+1) |
| 32501 | nv | 2026-08-31 | v998 l0 c3 | 176-30 비겁이 클리어덱 | Stage 176-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:764` (+1) |
| 32496 | nv | 2026-08-31 | v95 l0 c0 | 176-20 클리어덱 | Stage 176-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:765` (+1) |
| 32490 | nv | 2026-08-31 | v204 l0 c0 | 175-10,20,30 클리어덱 | Stage 175-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:766` (+1) |
| 32456 | nv | 2026-08-31 | v554 l0 c3 | 174-30 쿨민 클리어덱 | Stage 174-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:769` (+1) |
| 32454 | nv | 2026-08-31 | v787 l3 c2 | 195-30 (259M) 비겁 | Stage 195-30 (259M) Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:770` (+1) |
| 32435 | nv | 2026-08-31 | v911 l5 c6 | 206-30 공략:-) | Stage 206-30 guide | `001/evidence/05-nv-guide-board-index.tsv:771` (+1) |
| 32422 | nv | 2026-08-31 | v290 l0 c2 | 62-20 절대 안깨짐 | Stage 62-20 never breaks | `001/evidence/05-nv-guide-board-index.tsv:772` (+1) |
| 32421 | nv | 2026-08-31 | v231 l0 c0 | 174-20 망치공주 클리어덱 | Stage 174-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:773` (+1) |
| 32406 | nv | 2026-08-31 | v624 l5 c2 | 206-20 공략:-) | Stage 206-20 guide | `001/evidence/05-nv-guide-board-index.tsv:774` (+1) |
| 32364 | nv | 2026-08-31 | v699 l6 c3 | 205-20 공략:-) | Stage 205-20 guide | `001/evidence/05-nv-guide-board-index.tsv:775` (+1) |
| 32362 | nv | 2026-08-31 | v268 l0 c0 | 78-20 망치공주 클리어덱 | Stage 78-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:776` (+1) |
| 32339 | nv | 2026-08-31 | v735 l1 c3 | 216-30 비겁이 클리어덱 | Stage 216-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:777` (+1) |
| 32312 | nv | 2026-08-31 | v508 l3 c2 | 204-10 공략:-) | Stage 204-10 guide | `001/evidence/05-nv-guide-board-index.tsv:778` (+1) |
| 32295 | nv | 2026-08-31 | v868 l1 c13 | 203-30 공략:-) | Stage 203-30 guide | `001/evidence/05-nv-guide-board-index.tsv:779` (+1) |
| 32261 | nv | 2026-08-31 | v511 l2 c2 | 32-30 깻습니다 흐하 | Cleared 32-30! | `001/evidence/05-nv-guide-board-index.tsv:780` (+1) |
| 32222 | nv | 2026-08-31 | v796 l10 c8 | 219-20 교통사고급 폭주단트럭 공략(이건꼭보면좋음) | Stage 219-20 Rowdy Truck guide (must see) | `001/evidence/05-nv-guide-board-index.tsv:781` (+1) |
| 32214 | nv | 2026-08-31 | v681 l2 c2 | 216-30 비겁한쿠키(비쿠) | Stage 216-30 Cowardly Cookie ( Cowardly Cookie ) | `001/evidence/05-nv-guide-board-index.tsv:782` (+1) |
| 32190 | nv | 2026-08-31 | v6649 l114 c79 | 200스테이지까지 민 스테이지 덱 구성 | Stage deck build to stage 200 | `001/evidence/05-nv-guide-board-index.tsv:783` (+1) |
| 32180 | nv | 2026-08-31 | v1504 l3 c12 | 203-10 공략:-) | Stage 203-10 guide | `001/evidence/05-nv-guide-board-index.tsv:784` (+1) |
| 32163 | nv | 2026-08-31 | v640 l3 c3 | 축복4 211-10 인증 | Blessing 4, 211-10 proof | `001/evidence/05-nv-guide-board-index.tsv:785` (+1) |
| 32067 | nv | 2026-08-31 | v652 l3 c3 | 120~145 스테 원덱 다밀림 비겁이는 컨트롤해야험ㅇㅇ | One deck pushes 120-145; Cowardly Cookie needs control | `001/evidence/05-nv-guide-board-index.tsv:786` (+1) |
| 32064 | nv | 2026-08-31 | v519 l5 c12 | 202-30 공략:-) | Stage 202-30 guide | `001/evidence/05-nv-guide-board-index.tsv:787` (+1) |
| 32022 | nv | 2026-08-31 | v247 l6 c2 | 173-30 그루터기 클리어덱 | Stage 173-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:788` (+1) |
| 32021 | nv | 2026-08-31 | v109 l0 c1 | 173-20 그루터기  클리어덱 | Stage 173-20 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:789` (+1) |
| 31505 | nv | 2026-08-31 | v17975 l44 c163 | 신규 스테이지 퀘스트 보상 개편 및 향후 적용 계획 안내 | New-stage quest reward revamp and plan (notice) | `002/evidence/04-naver-global/01-nv-notices-menu1.tsv:13` (+1) |
| 31492 | nv | 2026-08-31 | v1026 l1 c0 | 195-10 (257M) 쥐트리오 | Stage 195-10 (257M) rat biker trio | `001/evidence/05-nv-guide-board-index.tsv:792` (+1) |
| 31480 | nv | 2026-08-31 | v474 l0 c1 | 201-30 공략:-) | Stage 201-30 guide | `001/evidence/05-nv-guide-board-index.tsv:794` (+1) |
| 31433 | nv | 2026-08-31 | v374 l0 c4 | 34-30 쿨민 계속 실패하는데 덱 좀 봐주세요.. | Stage 34-30 Cool Mint keeps failing; check my deck | `001/evidence/05-nv-guide-board-index.tsv:795` (+1) |
| 31417 | nv | 2026-08-31 | v426 l1 c2 | 비겁한쿠키 전투력 영끌덱 | Cowardly Cookie deck squeezing every bit of power | `001/evidence/05-nv-guide-board-index.tsv:796` (+1) |
| 31394 | nv | 2026-08-31 | v368 l3 c1 | 83-20 덱 기록 | Stage 83-20 deck record | `001/evidence/05-nv-guide-board-index.tsv:797` (+1) |
| 31290 | nv | 2026-08-31 | v171 l0 c0 | 172-20,30 클리어덱 | Stage 172-20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:799` (+1) |
| 31274 | nv | 2026-08-31 | v538 l3 c2 | 62-30 클리어덱(겨우 클리어) | Stage 62-30 clear deck (barely) | `001/evidence/05-nv-guide-board-index.tsv:800` (+1) |
| 31252 | nv | 2026-08-31 | v1334 l12 c9 | 216-30 원펀맨급 비겁 허리꺾어잡은 덱 공유 | Stage 216-30 Cowardly Cookie broken in half: deck share | `001/evidence/05-nv-guide-board-index.tsv:801` (+1) |
| 31207 | nv | 2026-08-31 | v3282 l15 c7 | 모든 스테이지 조합 공략 (시커 버전) | Every stage comp guide (Seeker version) | `001/evidence/05-nv-guide-board-index.tsv:802` (+1) |
| 31193 | nv | 2026-08-30 | v245 l0 c0 | 126-30 쿨민 공략 / 90-400k | Stage 126-30 Cool Mint guide / 90-400k | `001/evidence/05-nv-guide-board-index.tsv:803` (+1) |
| 31175 | nv | 2026-08-30 | v103 l0 c0 | 172-10 클리어덱 | Stage 172-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:805` (+1) |
| 31166 | nv | 2026-08-30 | v300 l1 c4 | 50-30 클리어덱(시커 쿠키 사용) | Stage 50-30 clear deck (with Seeker) | `001/evidence/05-nv-guide-board-index.tsv:806` (+1) |
| 31163 | nv | 2026-08-30 | v1260 l3 c9 | 200-30 공략:-) | Stage 200-30 guide | `001/evidence/05-nv-guide-board-index.tsv:807` (+1) |
| 31097 | nv | 2026-08-30 | v564 l0 c0 | 38-20 무과금 클리어덱(사진 3장) | Stage 38-20 F2P clear deck (3 photos) | `001/evidence/05-nv-guide-board-index.tsv:809` (+1) |
| 31092 | nv | 2026-08-30 | v1186 l25 c5 | 새로운 쿨링민트 공략법, "이것"을 챙겨라 | New Cool Mint method: bring "this" | `001/evidence/05-nv-guide-board-index.tsv:810` (+1) |
| 31025 | nv | 2026-08-30 | v348 l3 c2 | 185-30 쿨민 클리어 덱 | Stage 185-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:814` (+1) |
| 30973 | nv | 2026-08-30 | v898 l5 c4 | 198-30 공략:-) | Stage 198-30 guide | `001/evidence/05-nv-guide-board-index.tsv:815` (+1) |
| 30972 | nv | 2026-08-30 | v515 l1 c0 | 187-30 (229M) 비겁이 | Stage 187-30 (229M) Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:816` (+1) |
| 30957 | nv | 2026-08-30 | v280 l3 c1 | 비겁, 쿨민을 제외한 까다로운 보스들 컨트롤 공략 | Control guide for tricky bosses other than Cowardly/Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:817` (+1) |
| 30952 | nv | 2026-08-30 | v526 l4 c6 | 198-20 공략:-) | Stage 198-20 guide | `001/evidence/05-nv-guide-board-index.tsv:818` (+1) |
| 30930 | nv | 2026-08-30 | v841 l1 c0 | 184-30 비겁이 공략 | Stage 184-30 Cowardly Cookie guide | `001/evidence/05-nv-guide-board-index.tsv:820` (+1) |
| 30929 | nv | 2026-08-30 | v448 l5 c2 | 59-30 클리어덱(시커버전) | Stage 59-30 clear deck (Seeker version) | `001/evidence/05-nv-guide-board-index.tsv:821` (+1) |
| 30865 | nv | 2026-08-30 | v529 l1 c6 | 197-20 공략:-) | Stage 197-20 guide | `001/evidence/05-nv-guide-board-index.tsv:823` (+1) |
| 30857 | nv | 2026-08-30 | v828 l5 c2 | 171-20 트럭 클리어덱 | Stage 171-20 Truck clear deck | `001/evidence/05-nv-guide-board-index.tsv:824` (+1) |
| 30855 | nv | 2026-08-30 | v336 l0 c1 | 48-30 꾸역꾸역 비겁 클리어 무과금 | Stage 48-30 Cowardly Cookie scraped through F2P | `001/evidence/05-nv-guide-board-index.tsv:825` (+1) |
| 30845 | nv | 2026-08-30 | v466 l1 c0 | 171-10 쥐토바이 클리어덱 | Stage 171-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:826` (+1) |
| 30834 | nv | 2026-08-30 | v100 l0 c3 | 30-30 어떻게 클리어해야할지.. | How to clear 30-30? | `001/evidence/05-nv-guide-board-index.tsv:827` (+1) |
| 30813 | nv | 2026-08-30 | v516 l2 c2 | 170-30 쿨민 클리어덱 | Stage 170-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:828` (+1) |
| 30810 | nv | 2026-08-30 | v128 l0 c1 | 33-30 쿨민 안밀리는데 덱 짜는거좀 도와주십쇼.. | Stage 33-30 Cool Mint won't push; help with deck | `001/evidence/05-nv-guide-board-index.tsv:829` (+1) |
| 30805 | nv | 2026-08-30 | v881 l0 c3 | 스테이지 미는 덱추해주세요ㅠ | Recommend a stage-pushing deck | `001/evidence/05-nv-guide-board-index.tsv:830` (+1) |
| 30802 | nv | 2026-08-30 | v282 l1 c4 | ㅇㄴ 평균 79렙에 51-20 폭주단트럭 못벗어나는거 정상임? | Avg Lv79 stuck at 51-20 Rowdy Truck: normal? | `001/evidence/05-nv-guide-board-index.tsv:831` (+1) |
| 30738 | nv | 2026-08-30 | v1233 l4 c5 | 195-30 공략:-) | Stage 195-30 guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:833` (+1) |
| 30694 | nv | 2026-08-30 | v1402 l7 c7 | 195-10 공략:-) | Stage 195-10 guide | `001/evidence/16-top-players/05-nv-guide-board.tsv:834` (+1) |
| 30689 | nv | 2026-08-30 | v234 l0 c5 | 뉴비 10-30 보스 깨지를못해요 | Newbie can't beat the 10-30 boss | `001/evidence/05-nv-guide-board-index.tsv:834` (+1) |
| 30677 | nv | 2026-08-30 | v531 l3 c2 | 194-30 267M 9초클 | Stage 194-30 at 267M, cleared with 9 s left | `001/evidence/05-nv-guide-board-index.tsv:835` (+1) |
| 30676 | nv | 2026-08-30 | v1967 l25 c5 | 손컨 없이 편하게 스테이지 자동 날먹덱 | Effortless stage auto deck, no manual control | `001/evidence/05-nv-guide-board-index.tsv:836` (+1) |
| 30499 | nv | 2026-08-30 | v2943 l42 c0 | 보스 유형별 스테이지 정리 (쿨민 잠수함 패치 이후 시점) | Stages sorted by boss type (after the Cool Mint stealth patch) | `001/evidence/05-nv-guide-board-index.tsv:840` (+1) |
| 30486 | nv | 2026-08-30 | v226 l0 c0 | 169-30 쿨민 클리어덱 | Stage 169-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:841` (+1) |
| 30477 | nv | 2026-08-30 | v42 l0 c0 | 169-20 클러이덱 | Stage 169-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:842` (+1) |
| 30461 | nv | 2026-08-30 | v262 l0 c0 | 168-30 비겁이 클리어덱 | Stage 168-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:843` (+1) |
| 30457 | nv | 2026-08-30 | v504 l1 c0 | 195-30 비겁 | Stage 195-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:844` (+1) |
| 30441 | nv | 2026-08-30 | v526 l0 c3 | 195-10 바이커 | Stage 195-10 Biker | `001/evidence/05-nv-guide-board-index.tsv:845` (+1) |
| 30435 | nv | 2026-08-29 | v860 l4 c8 | 190-30 쿨민 오토덱 | Stage 190-30 Cool Mint auto deck | `001/evidence/05-nv-guide-board-index.tsv:846` (+1) |
| 30356 | nv | 2026-08-29 | v660 l10 c8 | 194-30 공략:-) | Stage 194-30 guide | `001/evidence/05-nv-guide-board-index.tsv:848` (+1) |
| 30338 | nv | 2026-08-29 | v433 l1 c9 | 193-30 공략:-) | Stage 193-30 guide | `001/evidence/05-nv-guide-board-index.tsv:849` (+1) |
| 30333 | nv | 2026-08-29 | v178 l0 c1 | 166-30 쿨민 클리어덱 | Stage 166-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:850` (+1) |
| 30317 | nv | 2026-08-29 | v204 l1 c0 | 166-20 망치공주 클리어덱 | Stage 166-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:851` (+1) |
| 30314 | nv | 2026-08-29 | v180 l1 c1 | 163-30 비겁이 클리어덱 | Stage 163-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:852` (+1) |
| 30313 | nv | 2026-08-29 | v147 l0 c0 | 163-10,20 쥐토바이 트럭 클리어덱 | Stage 163-10,20 rat bikers Truck clear deck | `001/evidence/05-nv-guide-board-index.tsv:853` (+1) |
| 30312 | nv | 2026-08-29 | v64 l0 c0 | 162-30 쿨민 클리어덱 | Stage 162-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:854` (+1) |
| 30310 | nv | 2026-08-29 | v41 l0 c0 | 161-30 쿨민 클리어덱 | Stage 161-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:855` (+1) |
| 30309 | nv | 2026-08-29 | v209 l1 c1 | 160-20,30 비겁이 클리어덱 | Stage 160-20,30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:856` (+1) |
| 30307 | nv | 2026-08-29 | v107 l1 c0 | 158-30 쿨민 클리어덱 | Stage 158-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:857` (+1) |
| 30305 | nv | 2026-08-29 | v204 l2 c0 | 157-30 그루터기 클리어덱 | Stage 157-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:858` (+1) |
| 30304 | nv | 2026-08-29 | v73 l0 c0 | 155-30 비겁이 클리어덱 | Stage 155-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:859` (+1) |
| 30303 | nv | 2026-08-29 | v71 l0 c0 | 155-10,20 쥐토바이 트럭클리어덱 | Stage 155-10,20 rat bikers Truck clear deck | `001/evidence/05-nv-guide-board-index.tsv:860` (+1) |
| 30302 | nv | 2026-08-29 | v42 l0 c0 | 154-30 쿨민 클리어덱 | Stage 154-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:861` (+1) |
| 30301 | nv | 2026-08-29 | v22 l1 c0 | 153-30 쿨민 클리어덱 | Stage 153-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:862` (+1) |
| 30300 | nv | 2026-08-29 | v89 l0 c0 | 152-30 비겁이 클리어덱 | Stage 152-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:863` (+1) |
| 30299 | nv | 2026-08-29 | v126 l0 c0 | 148-30 클리어덱 | Stage 148-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:864` (+1) |
| 30269 | nv | 2026-08-29 | v374 l4 c0 | 67-10 쥐토바이 덱(24m 59k) | Stage 67-10 rat bikers deck (24m 59k) | `001/evidence/05-nv-guide-board-index.tsv:865` (+1) |
| 30260 | nv | 2026-08-29 | v1345 l5 c11 | 192-30 공략:-) | Stage 192-30 guide | `001/evidence/05-nv-guide-board-index.tsv:866` (+1) |
| 30200 | nv | 2026-08-29 | v255 l3 c1 | 은행강도 폭탄광 최신 공략 (영상) | Bank Robber Bomber latest guide ( video ) | `001/evidence/05-nv-guide-board-index.tsv:867` (+1) |
| 30156 | nv | 2026-08-29 | v144 l0 c2 | 38-19 무과금 클리어덱 | Stage 38-19 F2P clear deck | `001/evidence/05-nv-guide-board-index.tsv:868` (+1) |
| 30151 | nv | 2026-08-29 | v469 l0 c0 | 190 스테이지 등반 중인 신캐 넣은 빛속성 덱 | Light-element deck with new cookie, climbing stage 190 | `001/evidence/05-nv-guide-board-index.tsv:869` (+1) |
| 30117 | nv | 2026-08-29 | v1274 l5 c1 | 211-10 삼토바이 5시간만에 깬 덱공유 | Stage 211-10 biker trio: deck that won after 5 hours | `001/evidence/05-nv-guide-board-index.tsv:871` (+1) |
| 30116 | nv | 2026-08-29 | v551 l1 c3 | 190-30 공략:-) | Stage 190-30 guide | `001/evidence/05-nv-guide-board-index.tsv:872` (+1) |
| 30093 | nv | 2026-08-29 | v433 l1 c2 | 190-20 공략:-) | Stage 190-20 guide | `001/evidence/05-nv-guide-board-index.tsv:873` (+1) |
| 30059 | nv | 2026-08-29 | v174 l1 c0 | 78-30 방법 알려주세요 | How to do 78-30? | `001/evidence/05-nv-guide-board-index.tsv:875` (+1) |
| 30028 | nv | 2026-08-29 | v636 l6 c4 | 43-30, 48-30 클리어덱 | Stage 43-30, 48-30 clear deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:877` (+1) |
| 29977 | nv | 2026-08-29 | v3214 l26 c24 | 시커 & 피노 들어간 스테이지덱 추천 | Stage deck with Seeker & Pinot | `001/evidence/16-top-players/05-nv-guide-board.tsv:879` (+1) |
| 29924 | nv | 2026-08-29 | v436 l1 c4 | 189-20 공략:-) | Stage 189-20 guide | `001/evidence/05-nv-guide-board-index.tsv:879` (+1) |
| 29871 | nv | 2026-08-29 | v141 l0 c1 | 47-30 클리어 트위즐젤리 무시하지마라 | Stage 47-30 cleared: don't ignore Twizzly Gummy | `001/evidence/05-nv-guide-board-index.tsv:881` (+1) |
| 29729 | nv | 2026-08-29 | v727 l1 c4 | 187-30 공략:-) | Stage 187-30 guide | `001/evidence/05-nv-guide-board-index.tsv:883` (+1) |
| 29615 | nv | 2026-08-29 | v444 l0 c0 | 195-30 온몸 비틀기 클리어 덱 | Stage 195-30 scraped-through clear deck | `001/evidence/05-nv-guide-board-index.tsv:886` (+1) |
| 29535 | nv | 2026-08-29 | v417 l0 c0 | 179-30 클리어 덱 | Stage 179-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:888` (+1) |
| 29516 | nv | 2026-08-29 | v106 l0 c0 | 98-30 | Stage 98-30 | `001/evidence/05-nv-guide-board-index.tsv:889` (+1) |
| 29444 | nv | 2026-08-29 | v1112 l26 c33 | 190-20 망치공주 노컨덱 | Stage 190-20 Choco Werehound Princess no-control deck | `001/evidence/05-nv-guide-board-index.tsv:890` (+1) |
| 29426 | nv | 2026-08-29 | v719 l4 c2 | 폭주단 바이커 최신 공략 (영상) | Rowdy Biker latest guide ( video ) | `001/evidence/05-nv-guide-board-index.tsv:891` (+1) |
| 29384 | nv | 2026-08-29 | v633 l3 c2 | 112-30 비겁 초간단 | Stage 112-30 Cowardly Cookie, super simple | `001/evidence/05-nv-guide-board-index.tsv:892` (+1) |
| 29309 | nv | 2026-08-28 | v1283 l10 c3 | 영상 하나로 끝내는 모든 스테이지 최신 공략 (영상) | One video: latest guide for every stage | `001/evidence/05-nv-guide-board-index.tsv:894` (+1) |
| 29277 | nv | 2026-08-28 | v782 l2 c0 | 스테이지 정리 1차 수정본 보고드립니다! | Stage summary, first revision | `001/evidence/05-nv-guide-board-index.tsv:895` (+1) |
| 29268 | nv | 2026-08-28 | v331 l4 c2 | 46-20 망치공주클리어 | Stage 46-20 Choco Werehound Princess clear | `001/evidence/05-nv-guide-board-index.tsv:896` (+1) |
| 29232 | nv | 2026-08-28 | v1336 l5 c8 | 187-10 공략:-) | Stage 187-10 guide | `001/evidence/05-nv-guide-board-index.tsv:898` (+1) |
| 29231 | nv | 2026-08-28 | v125 l0 c0 | 망치공주 기록용 (174_190_198) | Choco Werehound Princess for the record (174_190_198) | `001/evidence/05-nv-guide-board-index.tsv:899` (+1) |
| 29203 | nv | 2026-08-28 | v287 l0 c0 | 118-20 망치공주 덱 기록용 | Stage 118-20 Choco Werehound Princess deck for the record | `001/evidence/05-nv-guide-board-index.tsv:900` (+1) |
| 29173 | nv | 2026-08-28 | v131 l0 c0 | 그루터기 기록용 (173_189) | Tainted Ent for the record (173_189) | `001/evidence/05-nv-guide-board-index.tsv:903` (+1) |
| 29154 | nv | 2026-08-28 | v450 l0 c2 | 96-30 비겁한 52m 245k | Stage 96-30 Cowardly Cookie 52m 245k | `001/evidence/05-nv-guide-board-index.tsv:904` (+1) |
| 29138 | nv | 2026-08-28 | v245 l0 c0 | 147-30 비겁이 클리어덱 | Stage 147-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:905` (+1) |
| 29135 | nv | 2026-08-28 | v96 l0 c0 | 147-10,20 클리어덱 | Stage 147-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:906` (+1) |
| 29133 | nv | 2026-08-28 | v180 l0 c0 | 146-30 쿨민 클리어덱 | Stage 146-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:907` (+1) |
| 29097 | nv | 2026-08-28 | v395 l0 c0 | 비겁 기록용 (171_176_184_187_192_200) | Cowardly Cookie for the record (171_176_184_187_192_200) | `001/evidence/05-nv-guide-board-index.tsv:909` (+1) |
| 29023 | nv | 2026-08-28 | v261 l0 c0 | 115-30 어둡맵 비겁한 쿠키 기록용 | Stage 115-30 dark map Cowardly Cookie for the record | `001/evidence/05-nv-guide-board-index.tsv:912` (+1) |
| 28983 | nv | 2026-08-28 | v216 l1 c0 | 45-30 클리어 무과금덱 | Stage 45-30 clear F2P deck | `001/evidence/05-nv-guide-board-index.tsv:914` (+1) |
| 28917 | nv | 2026-08-28 | v317 l1 c0 | 8번 보스 : 폭주단 바이커 3인방 | Boss #8: Rowdy Biker trio | `001/evidence/05-nv-guide-board-index.tsv:916` (+1) |
| 28889 | nv | 2026-08-28 | v298 l0 c0 | 쿨민 기록용 (169_170_174_177_182_185_186_190) | Cool Mint for the record (169_170_174_177_182_185_186_190) | `001/evidence/05-nv-guide-board-index.tsv:917` (+1) |
| 28884 | nv | 2026-08-28 | v786 l2 c1 | 186-30 공략:-) | Stage 186-30 guide | `001/evidence/05-nv-guide-board-index.tsv:918` (+1) |
| 28880 | nv | 2026-08-28 | v480 l0 c2 | 102-30 쿨링 신덱 반자동 | Stage 102-30 Cool Mint new semi-auto deck | `001/evidence/05-nv-guide-board-index.tsv:919` (+1) |
| 28854 | nv | 2026-08-28 | v590 l2 c9 | 102-20 망치공주 새삥덱 자동 | Stage 102-20 Choco Werehound Princess new deck auto | `001/evidence/05-nv-guide-board-index.tsv:921` (+1) |
| 28771 | nv | 2026-08-28 | v6646 l173 c34 | 스테이지 정리 (조금씩 의견 받고 수정할 예정) 비겁/쿨링민트/망치공주/그루터기 | Stage summary (Cowardly / Cool Mint / Werehound / Tainted Ent) | `001/evidence/16-top-players/05-nv-guide-board.tsv:924` (+1) |
| 28717 | nv | 2026-08-28 | v15568 l48 c116 | 신규 스테이지 퀘스트 보상 관련 향후 대응 방향 안내 | New-stage quest reward follow-up (notice) | `002/evidence/04-naver-global/01-nv-notices-menu1.tsv:15` (+1) |
| 28666 | nv | 2026-08-28 | v382 l0 c0 | 185-30 공략:-) | Stage 185-30 guide | `001/evidence/05-nv-guide-board-index.tsv:924` (+1) |
| 28606 | nv | 2026-08-28 | v545 l3 c1 | 144-30 비겁이 클리어덱 | Stage 144-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:926` (+1) |
| 28530 | nv | 2026-08-28 | v312 l5 c4 | 174-20 (166M) 망치 | Stage 174-20 (166M) Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:927` (+1) |
| 28467 | nv | 2026-08-28 | v1659 l2 c13 | 184-30 공략:-) | Stage 184-30 guide | `001/evidence/05-nv-guide-board-index.tsv:928` (+1) |
| 28337 | nv | 2026-08-28 | v8417 l81 c19 | 피노누아 연타덱으로 영원히 방치중 | Idling forever with a Pinot Noir rapid-fire deck | `001/evidence/05-nv-guide-board-index.tsv:929` (+1) |
| 28320 | nv | 2026-08-28 | v345 l0 c0 | 142-30 쿨민 클리어덱 | Stage 142-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:930` (+1) |
| 28276 | nv | 2026-08-28 | v159 l0 c0 | 140,141-10,20,30 클리어덱 | 140,141-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:931` (+1) |
| 28271 | nv | 2026-08-28 | v332 l1 c0 | 139-10,20,30 비겁이 클리어덱 | Stage 139-10,20,30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:932` (+1) |
| 28192 | nv | 2026-08-28 | v79 l0 c0 | 53-30 | Stage 53-30 | `001/evidence/05-nv-guide-board-index.tsv:933` (+1) |
| 28115 | nv | 2026-08-28 | v185 l1 c5 | 138-10,20,30 쿨민 클리어덱 | Stage 138-10,20,30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:934` (+1) |
| 28108 | nv | 2026-08-28 | v210 l0 c0 | 112-30 비겁이 | Stage 112-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:935` (+1) |
| 28107 | nv | 2026-08-28 | v211 l2 c0 | 61-20 오염된 그루터기 클리어덱 기록용 | Stage 61-20 Tainted Ent clear deck, record | `001/evidence/05-nv-guide-board-index.tsv:936` (+1) |
| 27969 | nv | 2026-08-28 | v1285 l5 c10 | 182-30 공략:-) | Stage 182-30 guide | `001/evidence/05-nv-guide-board-index.tsv:939` (+1) |
| 27938 | nv | 2026-08-28 | v158 l0 c0 | 137-10,20,30 쿨민 클리어덱 | Stage 137-10,20,30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:940` (+1) |
| 27920 | nv | 2026-08-28 | v541 l4 c2 | 182-20 공략:-) | Stage 182-20 guide | `001/evidence/05-nv-guide-board-index.tsv:941` (+1) |
| 27913 | nv | 2026-08-28 | v279 l2 c0 | 51-30 클리어덱 | Stage 51-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:942` (+1) |
| 27872 | nv | 2026-08-28 | v1208 l9 c2 | 에어본 보스 자동컨으로 잡는 피노덱 공략 (그루터기, 망치공주) (영상) | Pinot deck for airborne bosses on auto (Tainted Ent, Werehound) (video) | `001/evidence/05-nv-guide-board-index.tsv:946` (+1) |
| 27870 | nv | 2026-08-28 | v239 l0 c0 | 136-30 비겁이 클리어덱 | Stage 136-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:947` (+1) |
| 27868 | nv | 2026-08-28 | v117 l1 c0 | 136-10,20 클리어덱 | Stage 136-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:948` (+1) |
| 27836 | nv | 2026-08-28 | v578 l5 c0 | 181-20 공략:-) | Stage 181-20 guide | `001/evidence/05-nv-guide-board-index.tsv:949` (+1) |
| 27820 | nv | 2026-08-28 | v2404 l8 c1 | 방치용으로 최고인 연타덱 공략 (영상) | Best rapid-fire deck for idling (video) | `001/evidence/05-nv-guide-board-index.tsv:950` (+1) |
| 27779 | nv | 2026-08-28 | v128 l0 c0 | 135-10,20,30 클리어덱 | Stage 135-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:951` (+1) |
| 27765 | nv | 2026-08-28 | v934 l10 c5 | 40-30 클리어덱 | Stage 40-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:952` (+1) |
| 27746 | nv | 2026-08-28 | v193 l0 c0 | 134-30 쿨민 클리어덱 | Stage 134-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:953` (+1) |
| 27745 | nv | 2026-08-28 | v167 l0 c0 | 134-10,20 클리어덱 | Stage 134-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:954` (+1) |
| 27742 | nv | 2026-08-28 | v813 l1 c1 | 179-30 공략:-) | Stage 179-30 guide | `001/evidence/05-nv-guide-board-index.tsv:955` (+1) |
| 27734 | nv | 2026-08-28 | v1042 l9 c2 | 생존 특화 최신 명랑덱 공략 (트럭, 비겁, 쿨민) (영상) | Survival-focused Cheerful deck (Truck, Cowardly, Cool Mint) (video) | `001/evidence/05-nv-guide-board-index.tsv:957` (+1) |
| 27722 | nv | 2026-08-28 | v273 l1 c0 | 110-30 민쿨 | Stage 110-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:958` (+1) |
| 27719 | nv | 2026-08-28 | v1029 l1 c6 | 179-10 공략:-) | Stage 179-10 guide | `001/evidence/05-nv-guide-board-index.tsv:959` (+1) |
| 27702 | nv | 2026-08-27 | v1574 l29 c4 | 스테이지 무난한덱. 막히면 덱체인지 (추가) | Solid stage deck; switch when stuck (updated) | `001/evidence/05-nv-guide-board-index.tsv:960` (+1) |
| 27699 | nv | 2026-08-27 | v1308 l2 c2 | 176-30 클리어 덱 | Stage 176-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:961` (+1) |
| 27690 | nv | 2026-08-27 | v125 l0 c0 | 133-30 그루터기 클리어덱 | Stage 133-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:962` (+1) |
| 27677 | nv | 2026-08-27 | v148 l0 c2 | 132-10,20 클리어덱 | Stage 132-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:964` (+1) |
| 27676 | nv | 2026-08-27 | v356 l0 c0 | 131-10,20,30 쥐토바이 비겁이 클리어덱 | Stage 131-10,20,30 rat bikers Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:965` (+1) |
| 27675 | nv | 2026-08-27 | v116 l0 c1 | 130-30 쿨민 클리어덱 | Stage 130-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:966` (+1) |
| 27674 | nv | 2026-08-27 | v94 l0 c0 | 130-10,20 클리어덱 | Stage 130-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:967` (+1) |
| 27672 | nv | 2026-08-27 | v51 l0 c0 | 129-30 쿨민 클리어덱 | Stage 129-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:968` (+1) |
| 27671 | nv | 2026-08-27 | v136 l0 c0 | 129-10,20 클리어덱 | Stage 129-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:969` (+1) |
| 27654 | nv | 2026-08-27 | v672 l2 c3 | 178-30 공략:-) | Stage 178-30 guide | `001/evidence/05-nv-guide-board-index.tsv:970` (+1) |
| 27638 | nv | 2026-08-27 | v1189 l7 c14 | 88-30 비겁한 쿠키 auto덱 45M | Stage 88-30 Cowardly Cookie auto deck 45M | `001/evidence/05-nv-guide-board-index.tsv:971` (+1) |
| 27631 | nv | 2026-08-27 | v415 l0 c5 | 177-30 공략:-) | Stage 177-30 guide | `001/evidence/05-nv-guide-board-index.tsv:972` (+1) |
| 27620 | nv | 2026-08-27 | v377 l1 c0 | 110-20 망치공주 | Stage 110-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:973` (+1) |
| 27611 | nv | 2026-08-27 | v161 l0 c0 | 128-30 클리어덱 | Stage 128-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:974` (+1) |
| 27561 | nv | 2026-08-27 | v1735 l4 c19 | 176-30 공략:-) | Stage 176-30 guide | `001/evidence/05-nv-guide-board-index.tsv:975` (+1) |
| 27549 | nv | 2026-08-27 | v118 l0 c0 | 128-20 클리어덱 | Stage 128-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:977` (+1) |
| 27534 | nv | 2026-08-27 | v73 l1 c0 | 128-10 | Stage 128-10 | `001/evidence/05-nv-guide-board-index.tsv:978` (+1) |
| 27521 | nv | 2026-08-27 | v118 l0 c0 | 109-30 그루터기 | Stage 109-30 Tainted Ent | `001/evidence/05-nv-guide-board-index.tsv:979` (+1) |
| 27475 | nv | 2026-08-27 | v95 l0 c0 | 127-30 클리어덱 | Stage 127-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:980` (+1) |
| 27446 | nv | 2026-08-27 | v13173 l246 c47 | 피노누아 활용 + 연타, 관통시너지 스테, 아레나덱 | Pinot Noir with rapid-fire/pierce synergy: stage and arena decks | `001/evidence/16-top-players/05-nv-guide-board.tsv:983` (+1) |
| 27389 | nv | 2026-08-27 | v860 l4 c2 | 174-30 공략:-) | Stage 174-30 guide | `001/evidence/05-nv-guide-board-index.tsv:983` (+1) |
| 27382 | nv | 2026-08-27 | v11099 l271 c73 | 스테이지 덱 | stage deck | `001/evidence/05-nv-guide-board-index.tsv:984` (+1) |
| 27356 | nv | 2026-08-27 | v418 l1 c6 | 174-20 공략:-) | Stage 174-20 guide | `001/evidence/05-nv-guide-board-index.tsv:985` (+1) |
| 27354 | nv | 2026-08-27 | v400 l0 c0 | 88-30 비겁한 클리어덱 기록용입니다 | Stage 88-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:986` (+1) |
| 27332 | nv | 2026-08-27 | v743 l4 c2 | 쿨링민트 노컨트롤 잡는 덱 | Deck for Cool Mint with no control | `001/evidence/05-nv-guide-board-index.tsv:988` (+1) |
| 27272 | nv | 2026-08-27 | v602 l2 c6 | 173-30 공략:-) | Stage 173-30 guide | `001/evidence/05-nv-guide-board-index.tsv:990` (+1) |
| 27240 | nv | 2026-08-27 | v311 l2 c4 | 173-20 공략:-) | Stage 173-20 guide | `001/evidence/05-nv-guide-board-index.tsv:992` (+1) |
| 27210 | nv | 2026-08-27 | v2278 l18 c0 | 스테이지, 아레나 전부 가능한 시커덱 공략 (영상) | Seeker deck for stages and arena (video) | `001/evidence/05-nv-guide-board-index.tsv:994` (+1) |
| 27149 | nv | 2026-08-27 | v3489 l22 c17 | 피노+연타시너지 쓰는 스테덱 | Stage deck using Pinot + rapid-fire synergy | `001/evidence/05-nv-guide-board-index.tsv:995` (+1) |
| 27105 | nv | 2026-08-27 | v2969 l18 c7 | 새로운 스테이지 기본덱 추천 | New basic stage deck recommendation | `001/evidence/05-nv-guide-board-index.tsv:997` (+1) |
| 27033 | nv | 2026-08-27 | v1134 l6 c7 | 171-30 공략:-) | Stage 171-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1000` (+1) |
| 26956 | nv | 2026-08-27 | v650 l5 c4 | 171-20 공략:-) | Stage 171-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1006` (+1) |
| 26919 | nv | 2026-08-27 | v601 l2 c6 | 171-10 공략:-) | Stage 171-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1007` (+1) |
| 26865 | nv | 2026-08-27 | v539 l1 c4 | 170-30 공략:-) | Stage 170-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1008` (+1) |
| 26837 | nv | 2026-08-27 | v1071 l5 c1 | 94-20 망치공주 피노누아덱 | Stage 94-20 Choco Werehound Princess Pinot Noir deck | `001/evidence/05-nv-guide-board-index.tsv:1009` (+1) |
| 26767 | nv | 2026-08-27 | v321 l0 c5 | 169-30 공략:-) | Stage 169-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1012` (+1) |
| 26624 | nv | 2026-08-27 | v547 l2 c1 | 7번 보스 : 스노우볼 설인 컨트롤 공략 | Boss #7: Snowball Yeti control guide | `001/evidence/05-nv-guide-board-index.tsv:1014` (+1) |
| 26500 | nv | 2026-08-27 | v132 l0 c0 | 127-10,20 클리어덱 | Stage 127-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1015` (+1) |
| 26455 | nv | 2026-08-27 | v235 l1 c0 | 126-30 쿨민 클리어덱 | Stage 126-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1016` (+1) |
| 26448 | nv | 2026-08-27 | v335 l0 c1 | 82-30 해변 쿨링민트맛 클 | Stage 82-30 beach Cool Mint cleared | `001/evidence/05-nv-guide-board-index.tsv:1017` (+1) |
| 26420 | nv | 2026-08-27 | v363 l0 c0 | 126-10,20 망치공주 클리어덱 | Stage 126-10,20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1018` (+1) |
| 26407 | nv | 2026-08-27 | v1670 l7 c4 | 스테이지 덱 조합 | stage deck comp | `001/evidence/05-nv-guide-board-index.tsv:1019` (+1) |
| 26389 | nv | 2026-08-27 | v138 l1 c0 | 125-30 그루터기 클리어덱 | Stage 125-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1020` (+1) |
| 26363 | nv | 2026-08-27 | v144 l0 c0 | 125-10,20 그루터기 클리어덱 | Stage 125-10,20 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1021` (+1) |
| 26358 | nv | 2026-08-27 | v56 l0 c0 | 124-20,30 클리어덱 | Stage 124-20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1022` (+1) |
| 26309 | nv | 2026-08-26 | v215 l0 c7 | 32-20 | Stage 32-20 | `001/evidence/16-top-players/05-nv-guide-board.tsv:1024` (+1) |
| 26284 | nv | 2026-08-26 | v295 l1 c1 | 41-30 무과금덱 민트클리어 | Stage 41-30 F2P deck Cool Mint clear | `001/evidence/05-nv-guide-board-index.tsv:1024` (+1) |
| 26249 | nv | 2026-08-26 | v145 l0 c0 | 101-30 클리어덱 | Stage 101-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1025` (+1) |
| 26244 | nv | 2026-08-26 | v504 l1 c0 | 104-30 비겁한쿠키 | Stage 104-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:1026` (+1) |
| 26243 | nv | 2026-08-26 | v233 l0 c0 | 105-30, 106-30 쿨링민트 | Stage 105-30, 106-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:1027` (+1) |
| 26242 | nv | 2026-08-26 | v255 l2 c0 | 110-20 망치공주 공략 덱 | Stage 110-20 Choco Werehound Princess guide deck | `001/evidence/05-nv-guide-board-index.tsv:1028` (+1) |
| 26229 | nv | 2026-08-26 | v84 l0 c1 | 124-10 클리어덱 | Stage 124-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1029` (+1) |
| 26218 | nv | 2026-08-26 | v518 l1 c1 | 94-20 망치공주 가망있는 현실적 공략 | Stage 94-20 Werehound Princess: realistic guide | `001/evidence/05-nv-guide-board-index.tsv:1030` (+1) |
| 26211 | nv | 2026-08-26 | v297 l2 c3 | 123-30 비겁이 클리어덱 | Stage 123-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1031` (+1) |
| 26180 | nv | 2026-08-26 | v159 l2 c1 | 123-20 클리어덱 | Stage 123-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1034` (+1) |
| 26167 | nv | 2026-08-26 | v221 l1 c0 | 123-10 쥐토바이 클리어덱 | Stage 123-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:1035` (+1) |
| 26163 | nv | 2026-08-26 | v458 l1 c0 | 56-30 비겁이 클리어덱 기록용 | Stage 56-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:1036` (+1) |
| 26154 | nv | 2026-08-26 | v120 l0 c0 | 122-30 쿨민 클리어덱 | Stage 122-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1037` (+1) |
| 26150 | nv | 2026-08-26 | v36 l0 c0 | 122-10,20 클리어덱 | Stage 122-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1038` (+1) |
| 26117 | nv | 2026-08-26 | v730 l0 c2 | 40-30 비겁한 쿠키 공략덱 | Stage 40-30 Cowardly Cookie guide deck | `001/evidence/05-nv-guide-board-index.tsv:1039` (+1) |
| 26103 | nv | 2026-08-26 | v84 l0 c0 | 121-30 쿨민 클리어덱 | Stage 121-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1040` (+1) |
| 26102 | nv | 2026-08-26 | v45 l0 c0 | 121-10,20 클리어덱 | Stage 121-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1041` (+1) |
| 26081 | nv | 2026-08-26 | v482 l2 c1 | 24.94m 66-30 쿨링민트 클리어 영상 | 24.94m 66-30 Cool Mint clear video | `001/evidence/05-nv-guide-board-index.tsv:1042` (+1) |
| 26024 | nv | 2026-08-26 | v572 l1 c0 | 67-10 바이커 클리어덱 | Stage 67-10 Biker clear deck | `001/evidence/05-nv-guide-board-index.tsv:1044` (+1) |
| 26021 | nv | 2026-08-26 | v319 l1 c0 | 120-30 비겁이 클리어덱 | Stage 120-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1045` (+1) |
| 25927 | nv | 2026-08-26 | v543 l3 c1 | 86-30 쿨링민트 클리어덱입니다 | Stage 86-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1047` (+1) |
| 25893 | nv | 2026-08-26 | v64 l0 c4 | 119-10,20,30 클리어덱 | Stage 119-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1048` (+1) |
| 25884 | nv | 2026-08-26 | v307 l0 c1 | 46-20 | Stage 46-20 | `001/evidence/05-nv-guide-board-index.tsv:1049` (+1) |
| 25873 | nv | 2026-08-26 | v187 l0 c1 | 뉴비 2일차 10-30 깨는 법 좀요 ㅠㅠ | Day-2 newbie: how to beat 10-30? | `001/evidence/05-nv-guide-board-index.tsv:1050` (+1) |
| 25823 | nv | 2026-08-26 | v270 l1 c0 | 118-30 쿨민 클리어덱 | Stage 118-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1051` (+1) |
| 25781 | nv | 2026-08-26 | v319 l1 c0 | 118-20 망치공주 클리어덱 | Stage 118-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1052` (+1) |
| 25777 | nv | 2026-08-26 | v509 l1 c0 | 78-20 33M 775K 클리어 망치공주 | Stage 78-20 33M 775K clear Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:1053` (+1) |
| 25740 | nv | 2026-08-26 | v830 l18 c6 | 115-10 바이커 쥐돌이 삼총사 종결 자동덱 | Stage 115-10 rat biker trio: definitive auto deck | `001/evidence/05-nv-guide-board-index.tsv:1054` (+1) |
| 25678 | nv | 2026-08-26 | v202 l1 c3 | 117-30 그루터기 클리어덱 | Stage 117-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1056` (+1) |
| 25674 | nv | 2026-08-26 | v451 l3 c1 | 43-30 자동클리어 | Stage 43-30 auto clear | `001/evidence/05-nv-guide-board-index.tsv:1057` (+1) |
| 25666 | nv | 2026-08-26 | v432 l0 c0 | 54-30  쿨링민트 클리어덱 기록용 | Stage 54-30 Cool Mint clear deck for the record | `001/evidence/16-top-players/05-nv-guide-board.tsv:1059` (+1) |
| 25664 | nv | 2026-08-26 | v149 l4 c3 | 6번 보스 : 초코 왕방울 컨트롤 공략 | Boss #6: Choco Big Drop control guide | `001/evidence/05-nv-guide-board-index.tsv:1059` (+1) |
| 25663 | nv | 2026-08-26 | v48 l0 c0 | 117-10 클리어덱 | Stage 117-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1060` (+1) |
| 25650 | nv | 2026-08-26 | v125 l0 c0 | 37-10 기록용 | Stage 37-10 for the record | `001/evidence/05-nv-guide-board-index.tsv:1061` (+1) |
| 25640 | nv | 2026-08-26 | v379 l1 c0 | 54-20 망치공주 클리어덱 기록용 | Stage 54-20 Choco Werehound Princess clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:1063` (+1) |
| 25624 | nv | 2026-08-26 | v127 l0 c0 | 134-20 | Stage 134-20 | `001/evidence/05-nv-guide-board-index.tsv:1064` (+1) |
| 25612 | nv | 2026-08-26 | v116 l0 c4 | 116-10,20,30 클리어덱 | Stage 116-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1065` (+1) |
| 25597 | nv | 2026-08-26 | v517 l2 c1 | 56-30 비겁, 13.04M 최저 투력 | Stage 56-30 Cowardly Cookie , 13.04M lowest power | `001/evidence/05-nv-guide-board-index.tsv:1066` (+1) |
| 25585 | nv | 2026-08-25 | v413 l2 c1 | 48-30 저장용 | Stage 48-30 for the record | `001/evidence/05-nv-guide-board-index.tsv:1067` (+1) |
| 25581 | nv | 2026-08-25 | v289 l1 c0 | 115-30 비겁이 클리어덱 | Stage 115-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1068` (+1) |
| 25577 | nv | 2026-08-25 | v189 l0 c0 | 115-20 클리어덱 | Stage 115-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1069` (+1) |
| 25547 | nv | 2026-08-25 | v221 l2 c1 | 5번 보스 : 그루터기 정령 컨트롤 공략 | Boss #5: Tainted Ent control guide | `001/evidence/05-nv-guide-board-index.tsv:1070` (+1) |
| 25537 | nv | 2026-08-25 | v113 l0 c0 | 53-30 12.7M | Stage 53-30 12.7M | `001/evidence/05-nv-guide-board-index.tsv:1071` (+1) |
| 25535 | nv | 2026-08-25 | v135 l1 c1 | 114-30 클리어덱 | Stage 114-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1072` (+1) |
| 25534 | nv | 2026-08-25 | v20 l0 c0 | 114-10,20 클리어덱 | Stage 114-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1073` (+1) |
| 25531 | nv | 2026-08-25 | v361 l0 c0 | 102-30 쿨링민트 공략 덱 | Stage 102-30 Cool Mint guide deck | `001/evidence/05-nv-guide-board-index.tsv:1074` (+1) |
| 25510 | nv | 2026-08-25 | v301 l1 c0 | 74-30 클리어덱 | Stage 74-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1075` (+1) |
| 25484 | nv | 2026-08-25 | v126 l0 c0 | 113-30 쿨민 클리어덱 | Stage 113-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1076` (+1) |
| 25437 | nv | 2026-08-25 | v73 l0 c0 | 113-10 왕방울 클리어덱 | Stage 113-10 Big Drop clear deck | `001/evidence/05-nv-guide-board-index.tsv:1079` (+1) |
| 25325 | nv | 2026-08-25 | v402 l1 c2 | 107-30 클리어덱 | Stage 107-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1081` (+1) |
| 25324 | nv | 2026-08-25 | v84 l0 c0 | 112-10,20 클리어덱 | Stage 112-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1082` (+1) |
| 25323 | nv | 2026-08-25 | v57 l1 c0 | 111-10,20,30 클리어덱 | Stage 111-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1083` (+1) |
| 25322 | nv | 2026-08-25 | v433 l2 c3 | 34-30 저스펙 | Stage 34-30 low spec | `001/evidence/05-nv-guide-board-index.tsv:1084` (+1) |
| 25246 | nv | 2026-08-25 | v222 l0 c0 | 86-21 망치공주 클리어덱 | Stage 86-21 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1086` (+1) |
| 25155 | nv | 2026-08-25 | v313 l0 c0 | 110-30 쿨민 클리어덱 | Stage 110-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1087` (+1) |
| 25153 | nv | 2026-08-25 | v123 l0 c0 | 37-30 | Stage 37-30 | `001/evidence/05-nv-guide-board-index.tsv:1088` (+1) |
| 25121 | nv | 2026-08-25 | v221 l0 c0 | 110-10,20 클리어덱 | Stage 110-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1089` (+1) |
| 25102 | nv | 2026-08-25 | v981 l22 c0 | 70스테 이후 쓰는 몇가지 스테이지덱 | Stage decks I use after 70 | `001/evidence/05-nv-guide-board-index.tsv:1090` (+1) |
| 25101 | nv | 2026-08-25 | v202 l1 c0 | 109-10,20,30 클리어덱 | Stage 109-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1091` (+1) |
| 25098 | nv | 2026-08-25 | v262 l2 c1 | 4번 보스 : 쿨링민트 쿠키 컨트롤 공략 | Boss #4: Cool Mint Cookie control guide | `001/evidence/05-nv-guide-board-index.tsv:1092` (+1) |
| 25078 | nv | 2026-08-25 | v83 l1 c2 | 108-20,30 클리어덱 | Stage 108-20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1093` (+1) |
| 25053 | nv | 2026-08-25 | v92 l0 c1 | 108-10 클리어덱 | Stage 108-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1094` (+1) |
| 25046 | nv | 2026-08-25 | v323 l2 c1 | 107-30 비겁이 클리어덱 | Stage 107-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1095` (+1) |
| 25045 | nv | 2026-08-25 | v379 l1 c2 | 65-30 쿨민 / 19.38M | Stage 65-30 Cool Mint / 19.38M | `001/evidence/05-nv-guide-board-index.tsv:1096` (+1) |
| 25040 | nv | 2026-08-25 | v295 l2 c0 | 107-20 클리어덱 | Stage 107-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1097` (+1) |
| 24991 | nv | 2026-08-24 | v329 l0 c1 | 107-10 클리어덱 | Stage 107-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1099` (+1) |
| 24975 | nv | 2026-08-24 | v274 l0 c1 | 106-30 쿨민 클리어덱 | Stage 106-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1102` (+1) |
| 24974 | nv | 2026-08-24 | v31 l0 c0 | 106-10,20 클리어덱 | Stage 106-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1103` (+1) |
| 24953 | nv | 2026-08-24 | v124 l0 c0 | 105-20,30 쿨민 클리어덱 | Stage 105-20,30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1104` (+1) |
| 24915 | nv | 2026-08-24 | v77 l0 c0 | 105-10 왕방울 클리어덱 | Stage 105-10 Big Drop clear deck | `001/evidence/05-nv-guide-board-index.tsv:1105` (+1) |
| 24910 | nv | 2026-08-24 | v452 l0 c3 | 104-30 비겁이 클리어덱 | Stage 104-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1106` (+1) |
| 24900 | nv | 2026-08-24 | v873 l1 c1 | 70-20 망치공주 클리어덱 | Stage 70-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1107` (+1) |
| 24899 | nv | 2026-08-24 | v262 l0 c6 | 10-30 안깨지는데 도와주실 선생님들 계신가요 ? | Can't beat 10-30; help | `001/evidence/05-nv-guide-board-index.tsv:1108` (+1) |
| 24840 | nv | 2026-08-24 | v584 l1 c1 | 83-10 바이커 클리어덱입니다 | Stage 83-10 Biker clear deck | `001/evidence/16-top-players/05-nv-guide-board.tsv:1113` (+1) |
| 24839 | nv | 2026-08-24 | v205 l0 c0 | 98-30 쿨링민트 | Stage 98-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:1113` (+1) |
| 24802 | nv | 2026-08-24 | v402 l1 c0 | 96-30 비겁한쿠키 | Stage 96-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:1114` (+1) |
| 24783 | nv | 2026-08-24 | v179 l2 c1 | 독뿔버섯 보스전에서 살아남기 (ex. 61-10) | Surviving the poison-horn mushroom boss (e.g. 61-10) | `001/evidence/05-nv-guide-board-index.tsv:1115` (+1) |
| 24781 | nv | 2026-08-24 | v312 l3 c0 | 3번 보스 : 비겁한 쿠키 컨트롤 공략 | Boss #3: Cowardly Cookie control guide | `001/evidence/05-nv-guide-board-index.tsv:1116` (+1) |
| 24747 | nv | 2026-08-24 | v782 l10 c2 | 69-20 69-30 77-20 그루터기 정령 공략 | Stage 69-20 69-30 77-20 Tainted Ent guide | `001/evidence/05-nv-guide-board-index.tsv:1117` (+1) |
| 24736 | nv | 2026-08-24 | v433 l0 c0 | 94-30 쿨링민트 | Stage 94-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:1118` (+1) |
| 24724 | nv | 2026-08-24 | v484 l0 c0 | 94-20 망치공주 | Stage 94-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:1119` (+1) |
| 24720 | nv | 2026-08-24 | v116 l0 c0 | 104-20 클리어덱 | Stage 104-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1120` (+1) |
| 24719 | nv | 2026-08-24 | v39 l0 c0 | 104-10 클리어덱 | Stage 104-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1121` (+1) |
| 24680 | nv | 2026-08-24 | v1058 l2 c3 | 62-30 쿨민 클리어덱 | Stage 62-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1123` (+1) |
| 24677 | nv | 2026-08-24 | v406 l1 c0 | 93-20, 93-30 그루터기 | Stage 93-20, 93-30 Tainted Ent | `001/evidence/05-nv-guide-board-index.tsv:1125` (+1) |
| 24627 | nv | 2026-08-24 | v96 l0 c0 | 103-10,20,30 클리어덱 | Stage 103-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1128` (+1) |
| 24625 | nv | 2026-08-24 | v313 l2 c0 | 102-30 쿨민 클리어덱 | Stage 102-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1129` (+1) |
| 24605 | nv | 2026-08-24 | v171 l0 c0 | 101-30 / 109-30 그루터기 클리어덱 | Stage 101-30 / 109-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1130` (+1) |
| 24551 | nv | 2026-08-24 | v684 l3 c1 | 91-30 비겁한쿠키 | Stage 91-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:1131` (+1) |
| 24533 | nv | 2026-08-24 | v774 l1 c1 | 102-20 망치공주 클리어덱 | Stage 102-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1132` (+1) |
| 24512 | nv | 2026-08-24 | v76 l0 c0 | 102-10 클리어덱 | Stage 102-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1133` (+1) |
| 24485 | nv | 2026-08-24 | v151 l0 c0 | 101-30 그루터기 클리어덱 | Stage 101-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1135` (+1) |
| 24443 | nv | 2026-08-23 | v309 l1 c0 | 101-20 클리어덱 | Stage 101-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1136` (+1) |
| 24441 | nv | 2026-08-23 | v846 l2 c1 | 46-30 쿨링민트/ 클리어 덱 | Stage 46-30 Cool Mint / clear deck | `001/evidence/05-nv-guide-board-index.tsv:1137` (+1) |
| 24427 | nv | 2026-08-23 | v420 l0 c2 | 91-20 폭주단트럭 | Stage 91-20 Rowdy Truck | `001/evidence/05-nv-guide-board-index.tsv:1138` (+1) |
| 24422 | nv | 2026-08-23 | v102 l0 c0 | 101-10 클리어덱 | Stage 101-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1139` (+1) |
| 24416 | nv | 2026-08-23 | v379 l0 c0 | 89-30, 90-30 쿨링민트 | Stage 89-30, 90-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:1140` (+1) |
| 24412 | nv | 2026-08-23 | v78 l1 c0 | 100-30 클리어덱 | Stage 100-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1141` (+1) |
| 24387 | nv | 2026-08-23 | v41 l0 c0 | 100-20 클리어덱 | Stage 100-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1142` (+1) |
| 24379 | nv | 2026-08-23 | v104 l1 c0 | 100-10 클리어덱 | Stage 100-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1143` (+1) |
| 24365 | nv | 2026-08-23 | v621 l1 c1 | 99-30 비겁이 클리어덱 | Stage 99-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1144` (+1) |
| 24356 | nv | 2026-08-23 | v375 l0 c1 | 99-20 클리어덱 | Stage 99-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1146` (+1) |
| 24354 | nv | 2026-08-23 | v150 l0 c0 | 93-30 그루터기 공략 덱 | Stage 93-30 Tainted Ent guide deck | `001/evidence/05-nv-guide-board-index.tsv:1147` (+1) |
| 24346 | nv | 2026-08-23 | v565 l1 c3 | 99-10 쥐토바이 클리어덱 | Stage 99-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:1150` (+1) |
| 24337 | nv | 2026-08-23 | v171 l3 c1 | 98-10,20,30 쿨민 클리어덱 | Stage 98-10,20,30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1152` (+1) |
| 24324 | nv | 2026-08-23 | v189 l1 c1 | 97-10,20,30 쿨민 클리어덱 | Stage 97-10,20,30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1153` (+1) |
| 24300 | nv | 2026-08-23 | v459 l1 c1 | 96-10,20,30 비겁이 클리어덱 | Stage 96-10,20,30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1155` (+1) |
| 24276 | nv | 2026-08-23 | v111 l1 c0 | 95-10,20,30 클리어덱 | Stage 95-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1157` (+1) |
| 24266 | nv | 2026-08-23 | v555 l2 c0 | 168 스테이지 완등, 펫 활용법 총 정리 | Stage 168 fully cleared: complete pet-use guide | `001/evidence/05-nv-guide-board-index.tsv:1158` (+1) |
| 24252 | nv | 2026-08-23 | v486 l1 c1 | 94-30 쿨민 클리어덱 | Stage 94-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1159` (+1) |
| 24241 | nv | 2026-08-23 | v415 l0 c0 | 65-30 공략 / 21M 550 | Stage 65-30 guide / 21M 550 | `001/evidence/05-nv-guide-board-index.tsv:1160` (+1) |
| 24228 | nv | 2026-08-23 | v461 l8 c2 | 2번 보스 : 폭주단 트럭 컨트롤 공략 ( 도마뱀도 포함) | Boss #2: Rowdy Truck control guide (Lizard included) | `001/evidence/05-nv-guide-board-index.tsv:1161` (+1) |
| 24219 | nv | 2026-08-23 | v678 l1 c2 | 94-20 망치공주 클리어덱 | Stage 94-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1162` (+1) |
| 24206 | nv | 2026-08-23 | v214 l3 c0 | 99-30 클리어덱 | Stage 99-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1164` (+1) |
| 24181 | nv | 2026-08-23 | v852 l7 c4 | 88-30 | Stage 88-30 | `001/evidence/05-nv-guide-board-index.tsv:1166` (+1) |
| 24115 | nv | 2026-08-23 | v696 l1 c2 | 86-30 | Stage 86-30 | `001/evidence/05-nv-guide-board-index.tsv:1168` (+1) |
| 24113 | nv | 2026-08-23 | v2541 l45 c4 | 임플란트 타워 등반 덱2종 풀 오토 | Implant Tower climbing: two full-auto decks | `001/evidence/05-nv-guide-board-index.tsv:1169` (+1) |
| 24086 | nv | 2026-08-23 | v3240 l34 c72 | 168-30 공략:-) 드디어 끝나따 야호!! | Stage 168-30 guide: finally done! | `001/evidence/05-nv-guide-board-index.tsv:1170` (+1) |
| 24085 | nv | 2026-08-23 | v793 l0 c3 | 86-20 | Stage 86-20 | `001/evidence/05-nv-guide-board-index.tsv:1171` (+1) |
| 24042 | nv | 2026-08-23 | v1072 l5 c4 | 40-30 자동 클리어 | Stage 40-30 auto clear | `001/evidence/05-nv-guide-board-index.tsv:1172` (+1) |
| 24039 | nv | 2026-08-23 | v647 l4 c10 | 40-30 비겁한쿠키 덱 추천해주실 고수님들 찾아요 | Stage 40-30 Cowardly Cookie deck please | `001/evidence/05-nv-guide-board-index.tsv:1173` (+1) |
| 24030 | nv | 2026-08-23 | v331 l1 c2 | 166-30 공략:-) | Stage 166-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1174` (+1) |
| 24021 | nv | 2026-08-23 | v287 l0 c0 | 99-10 쥐 클리어덱 | Stage 99-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:1175` (+1) |
| 24020 | nv | 2026-08-23 | v700 l1 c18 | 166-20 공략:-) | Stage 166-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1176` (+1) |
| 23980 | nv | 2026-08-23 | v654 l2 c1 | 14m 56-30 비겁한 쿠키 클리어 영상 | 14m 56-30 Cowardly Cookie clear video | `001/evidence/16-top-players/05-nv-guide-board.tsv:1179` (+1) |
| 23975 | nv | 2026-08-23 | v180 l1 c0 | 93-30 그루터기 클리어덱 | Stage 93-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1179` (+1) |
| 23961 | nv | 2026-08-23 | v204 l1 c0 | 93-10,20 클리어덱 | Stage 93-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1180` (+1) |
| 23955 | nv | 2026-08-23 | v165 l1 c0 | 92-10,20,30 클리어덱 | Stage 92-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1181` (+1) |
| 23943 | nv | 2026-08-22 | v268 l1 c2 | 163-30 공략:-) | Stage 163-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1182` (+1) |
| 23942 | nv | 2026-08-22 | v485 l3 c4 | 91-30 비겁이 클리어덱 | Stage 91-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1183` (+1) |
| 23939 | nv | 2026-08-22 | v255 l0 c2 | 163-10 공략:-) | Stage 163-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1184` (+1) |
| 23936 | nv | 2026-08-22 | v149 l1 c2 | 162-30 공략:-) | Stage 162-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1185` (+1) |
| 23934 | nv | 2026-08-22 | v489 l5 c2 | 91-20 클리어덱 | Stage 91-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1186` (+1) |
| 23932 | nv | 2026-08-22 | v610 l7 c1 | 85-20, 85-30 | Stage 85-20, 85-30 | `001/evidence/05-nv-guide-board-index.tsv:1187` (+1) |
| 23928 | nv | 2026-08-22 | v73 l1 c0 | 161-30 공략:-) | Stage 161-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1188` (+1) |
| 23927 | nv | 2026-08-22 | v639 l0 c1 | 91-10 쥐토바이 클리어덱 | Stage 91-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:1189` (+1) |
| 23919 | nv | 2026-08-22 | v184 l1 c0 | 160-30 공략:-) | Stage 160-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1190` (+1) |
| 23907 | nv | 2026-08-22 | v299 l0 c0 | 90-30 쿨민 클리어덱 | Stage 90-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1191` (+1) |
| 23906 | nv | 2026-08-22 | v60 l0 c0 | 90-10,20 클리어덱 | Stage 90-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1192` (+1) |
| 23905 | nv | 2026-08-22 | v487 l6 c0 | 43-30 비겁이 6.85M 클리어덱 | Stage 43-30 Cowardly Cookie 6.85M clear deck | `001/evidence/05-nv-guide-board-index.tsv:1193` (+1) |
| 23889 | nv | 2026-08-22 | v312 l0 c0 | 40-20 무과금 클리어덱 | Stage 40-20 F2P clear deck | `001/evidence/05-nv-guide-board-index.tsv:1194` (+1) |
| 23885 | nv | 2026-08-22 | v352 l0 c0 | 86-30 쿨링민트 공략 덱 | Stage 86-30 Cool Mint guide deck | `001/evidence/05-nv-guide-board-index.tsv:1195` (+1) |
| 23884 | nv | 2026-08-22 | v651 l0 c0 | 83-30 | Stage 83-30 | `001/evidence/05-nv-guide-board-index.tsv:1196` (+1) |
| 23873 | nv | 2026-08-22 | v416 l2 c0 | 83-20 | Stage 83-20 | `001/evidence/05-nv-guide-board-index.tsv:1198` (+1) |
| 23867 | nv | 2026-08-22 | v243 l1 c2 | 158-30 공략:-) | Stage 158-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1199` (+1) |
| 23860 | nv | 2026-08-22 | v513 l1 c0 | 83-10 | Stage 83-10 | `001/evidence/05-nv-guide-board-index.tsv:1201` (+1) |
| 23858 | nv | 2026-08-22 | v218 l0 c0 | 89-30 쿨민 클리어덱 | Stage 89-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1202` (+1) |
| 23856 | nv | 2026-08-22 | v271 l2 c2 | 158-20 공략:-) | Stage 158-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1203` (+1) |
| 23851 | nv | 2026-08-22 | v246 l0 c1 | 43-30 비겁이 클리어덱 기록용 | Stage 43-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:1204` (+1) |
| 23848 | nv | 2026-08-22 | v111 l0 c0 | 89-20 클리어덱 | Stage 89-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1205` (+1) |
| 23835 | nv | 2026-08-22 | v66 l1 c1 | 89-10 왕방울 클리어덱 | Stage 89-10 Big Drop clear deck | `001/evidence/05-nv-guide-board-index.tsv:1206` (+1) |
| 23834 | nv | 2026-08-22 | v497 l0 c10 | 86-20 제발 깨는 방법좀 알려주세요 . . . | Stage 86-20: how to beat it, please | `001/evidence/05-nv-guide-board-index.tsv:1207` (+1) |
| 23833 | nv | 2026-08-22 | v705 l0 c6 | 32-30에서 막혔습니다 덱어떻게 짜야할까요 ㅠㅠ | Stuck at 32-30; how to build? | `001/evidence/05-nv-guide-board-index.tsv:1208` (+1) |
| 23831 | nv | 2026-08-22 | v146 l1 c0 | 157-20 공략:-) | Stage 157-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1209` (+1) |
| 23828 | nv | 2026-08-22 | v30 l0 c1 | 89-2 클리어덱 | Stage 89-2 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1210` (+1) |
| 23823 | nv | 2026-08-22 | v39 l1 c1 | 89-1 클리어덱 | Stage 89-1 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1211` (+1) |
| 23818 | nv | 2026-08-22 | v452 l0 c0 | 88-30 비겁이 클리어덱 | Stage 88-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1212` (+1) |
| 23808 | nv | 2026-08-22 | v182 l0 c0 | 88-20 클리어덱 | Stage 88-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1214` (+1) |
| 23802 | nv | 2026-08-22 | v148 l0 c0 | 155-30 공략:-) | Stage 155-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1215` (+1) |
| 23792 | nv | 2026-08-22 | v602 l2 c1 | 48-30 클리어(뱀파이어 덱) | Stage 48-30 clear ( Vampire deck ) | `001/evidence/16-top-players/05-nv-guide-board.tsv:1217` (+1) |
| 23789 | nv | 2026-08-22 | v659 l2 c0 | 75-30 31M 비겁 | Stage 75-30 31M Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:1217` (+1) |
| 23786 | nv | 2026-08-22 | v530 l1 c4 | 58-30 (15M) | Stage 58-30 (15M) | `001/evidence/05-nv-guide-board-index.tsv:1218` (+1) |
| 23780 | nv | 2026-08-22 | v202 l1 c0 | 155-10 공략:-) | Stage 155-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1219` (+1) |
| 23778 | nv | 2026-08-22 | v47 l0 c2 | 88-10 클리어덱 | Stage 88-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1220` (+1) |
| 23764 | nv | 2026-08-22 | v5499 l193 c44 | 스테이지/보스별 적당스펙 덱 정리 | Deck summary with reasonable spec per stage/boss | `001/evidence/05-nv-guide-board-index.tsv:1221` (+1) |
| 23752 | nv | 2026-08-22 | v381 l3 c2 | 86-30 클리어덱 | Stage 86-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1222` (+1) |
| 23741 | nv | 2026-08-22 | v658 l0 c0 | 83-30 비겁이 1트 컷 (저투력) | Stage 83-30 Cowardly Cookie first-try cut (low power) | `001/evidence/05-nv-guide-board-index.tsv:1223` (+1) |
| 23740 | nv | 2026-08-22 | v312 l1 c0 | 72-18 설인 자동클리어 | Stage 72-18 Yeti auto clear | `001/evidence/05-nv-guide-board-index.tsv:1224` (+1) |
| 23735 | nv | 2026-08-22 | v84 l0 c0 | 153-30 공략:-) | Stage 153-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1225` (+1) |
| 23729 | nv | 2026-08-22 | v1175 l2 c0 | 38-30 무과금 클리어덱 | Stage 38-30 F2P clear deck | `001/evidence/05-nv-guide-board-index.tsv:1227` (+1) |
| 23717 | nv | 2026-08-22 | v177 l0 c3 | 152-30 공략:-) | Stage 152-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1228` (+1) |
| 23683 | nv | 2026-08-22 | v284 l0 c2 | 150-30 공략:-) | Stage 150-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1229` (+1) |
| 23672 | nv | 2026-08-22 | v440 l2 c4 | 150-20 공략:-) | Stage 150-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1230` (+1) |
| 23638 | nv | 2026-08-22 | v162 l0 c0 | 149-20 공략:-) | Stage 149-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1232` (+1) |
| 23608 | nv | 2026-08-22 | v204 l0 c0 | 81-30 | Stage 81-30 | `001/evidence/05-nv-guide-board-index.tsv:1234` (+1) |
| 23573 | nv | 2026-08-22 | v895 l2 c2 | 86-20 망치공주 공략 덱 | Stage 86-20 Choco Werehound Princess guide deck | `001/evidence/05-nv-guide-board-index.tsv:1236` (+1) |
| 23570 | nv | 2026-08-22 | v163 l2 c0 | 147-30 공략:-) | Stage 147-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1238` (+1) |
| 23569 | nv | 2026-08-22 | v841 l2 c0 | 80-30 | Stage 80-30 | `001/evidence/05-nv-guide-board-index.tsv:1239` (+1) |
| 23560 | nv | 2026-08-22 | v33 l0 c0 | 28-10 쿸린이 | Stage 28-10 newbie | `001/evidence/05-nv-guide-board-index.tsv:1240` (+1) |
| 23558 | nv | 2026-08-22 | v329 l0 c8 | 85-30 그루터기 공략 덱 | Stage 85-30 Tainted Ent guide deck | `001/evidence/05-nv-guide-board-index.tsv:1241` (+1) |
| 23554 | nv | 2026-08-22 | v217 l0 c0 | 147-10 공략:-) | Stage 147-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1242` (+1) |
| 23550 | nv | 2026-08-22 | v379 l0 c2 | 85-20 그루터기 공략 덱 | Stage 85-20 Tainted Ent guide deck | `001/evidence/05-nv-guide-board-index.tsv:1243` (+1) |
| 23546 | nv | 2026-08-22 | v652 l3 c0 | 12.84m 54-30 쿨링민트 클리어 영상 | 12.84m 54-30 Cool Mint clear video | `001/evidence/16-top-players/05-nv-guide-board.tsv:1246` (+1) |
| 23538 | nv | 2026-08-22 | v163 l3 c6 | 85-10 독버섯 공략 덱 | Stage 85-10 poison mushroom guide deck | `001/evidence/05-nv-guide-board-index.tsv:1246` (+1) |
| 23518 | nv | 2026-08-22 | v138 l1 c0 | 145-30 공략:-) | Stage 145-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1247` (+1) |
| 23516 | nv | 2026-08-22 | v547 l1 c4 | 83-30 비겁이 공략 덱 | Stage 83-30 Cowardly Cookie guide deck | `001/evidence/05-nv-guide-board-index.tsv:1249` (+1) |
| 23500 | nv | 2026-08-22 | v167 l0 c0 | 144-30 공략:-) | Stage 144-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1250` (+1) |
| 23496 | nv | 2026-08-22 | v158 l0 c4 | 초보입니다 32-22 클리어 할 수있는 조합 알려주세요. | Beginner: comp for 32-22? | `001/evidence/05-nv-guide-board-index.tsv:1251` (+1) |
| 23468 | nv | 2026-08-22 | v391 l0 c0 | 110-20 망치공주 | Stage 110-20 Choco Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:1253` (+1) |
| 23449 | nv | 2026-08-22 | v141 l0 c0 | 87-10,20 클리어덱 | Stage 87-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1254` (+1) |
| 23444 | nv | 2026-08-21 | v355 l0 c0 | 86-30 쿨민 클리어덱 | Stage 86-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1255` (+1) |
| 23440 | nv | 2026-08-21 | v522 l0 c0 | 86-20 망치공주 클리어덱 | Stage 86-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1256` (+1) |
| 23435 | nv | 2026-08-21 | v267 l0 c0 | 69-30 초간단 | Stage 69-30 super simple | `001/evidence/05-nv-guide-board-index.tsv:1257` (+1) |
| 23426 | nv | 2026-08-21 | v394 l1 c0 | 83-20 폭주단 트럭 공략 덱 | Stage 83-20 Rowdy Truck guide deck | `001/evidence/05-nv-guide-board-index.tsv:1264` (+1) |
| 23421 | nv | 2026-08-21 | v860 l2 c0 | 망치공주 스테 클리어 38-20 | Choco Werehound Princess stage clear 38-20 | `001/evidence/05-nv-guide-board-index.tsv:1266` (+1) |
| 23411 | nv | 2026-08-21 | v107 l0 c0 | 86-10 클리어덱 | Stage 86-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1267` (+1) |
| 23410 | nv | 2026-08-21 | v255 l0 c0 | 142-30 공략:-) | Stage 142-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1268` (+1) |
| 23408 | nv | 2026-08-21 | v152 l0 c0 | 85-30 그루터기 클리어덱 | Stage 85-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1269` (+1) |
| 23406 | nv | 2026-08-21 | v515 l3 c2 | 142-20 공략:-) | Stage 142-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1270` (+1) |
| 23403 | nv | 2026-08-21 | v221 l0 c0 | 85-20 그루터기 클리어덱 | Stage 85-20 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1271` (+1) |
| 23395 | nv | 2026-08-21 | v91 l0 c1 | 85-10 클리어덱 | Stage 85-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1272` (+1) |
| 23390 | nv | 2026-08-21 | v141 l0 c0 | 84-30 클리어덱 | Stage 84-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1273` (+1) |
| 23370 | nv | 2026-08-21 | v218 l1 c4 | 141-20 공략:-) | Stage 141-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1274` (+1) |
| 23363 | nv | 2026-08-21 | v211 l0 c0 | 84-10,20 클리어덱 | Stage 84-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1275` (+1) |
| 23321 | nv | 2026-08-21 | v612 l2 c0 | 11.92m 53-20 / 53-30 오염된 그루터기 정령 클리어 영상 | 11.92m 53-20 / 53-30 Tainted Ent clear video | `001/evidence/05-nv-guide-board-index.tsv:1276` (+1) |
| 23319 | nv | 2026-08-21 | v201 l0 c0 | 139-30 공략:-) | Stage 139-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1277` (+1) |
| 23318 | nv | 2026-08-21 | v161 l0 c2 | 기록용 40-25 설인 클리어덱 | for the record 40-25 Yeti clear deck | `001/evidence/05-nv-guide-board-index.tsv:1278` (+1) |
| 23299 | nv | 2026-08-21 | v208 l0 c0 | 139-10 공략:-) | Stage 139-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1279` (+1) |
| 23293 | nv | 2026-08-21 | v125 l0 c7 | 138-30 공략:-) | Stage 138-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1280` (+1) |
| 23292 | nv | 2026-08-21 | v1223 l6 c4 | 72-30 클리어덱(비겁이) | Stage 72-30 clear deck ( Cowardly Cookie ) | `001/evidence/05-nv-guide-board-index.tsv:1281` (+1) |
| 23267 | nv | 2026-08-21 | v638 l2 c1 | 34-30 | Stage 34-30 | `001/evidence/16-top-players/05-nv-guide-board.tsv:1283` (+1) |
| 23263 | nv | 2026-08-21 | v118 l1 c0 | 137-30 공략:-) | Stage 137-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1283` (+1) |
| 23259 | nv | 2026-08-21 | v874 l0 c1 | 기록용 38-20 망치공주 클리어 덱 | for the record 38-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1284` (+1) |
| 23252 | nv | 2026-08-21 | v425 l0 c0 | 75-30 33m31k 수원 | Stage 75-30 at 33.03M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1285` (+1) |
| 23250 | nv | 2026-08-21 | v337 l0 c0 | 75-10 32m584k 수원 | Stage 75-10 at 32.58M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1286` (+1) |
| 23249 | nv | 2026-08-21 | v360 l2 c2 | 74-30 30m629k 수원 | Stage 74-30 at 30.63M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1287` (+1) |
| 23248 | nv | 2026-08-21 | v160 l0 c0 | 73-30 30m107k 수원 | Stage 73-30 at 30.11M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1288` (+1) |
| 23247 | nv | 2026-08-21 | v352 l1 c0 | 72-30 28m699k 수원 | Stage 72-30 at 28.70M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1289` (+1) |
| 23246 | nv | 2026-08-21 | v736 l0 c1 | 70-30 27m202k 수원 | Stage 70-30 at 27.20M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1290` (+1) |
| 23242 | nv | 2026-08-21 | v104 l0 c0 | 69-30 26m579k 수원 | Stage 69-30 at 26.58M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1291` (+1) |
| 23222 | nv | 2026-08-21 | v218 l0 c0 | 136-30 공략:-) | Stage 136-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1292` (+1) |
| 23165 | nv | 2026-08-21 | v375 l4 c6 | 77-30 | Stage 77-30 | `001/evidence/05-nv-guide-board-index.tsv:1293` (+1) |
| 23159 | nv | 2026-08-21 | v305 l0 c0 | 134-30 공략:-) | Stage 134-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1294` (+1) |
| 23156 | nv | 2026-08-21 | v657 l2 c0 | 10.65 51-30 비겁한 쿠키 클리어 영상 | 10.65 51-30 Cowardly Cookie clear video | `001/evidence/05-nv-guide-board-index.tsv:1296` (+1) |
| 23152 | nv | 2026-08-21 | v520 l0 c5 | 134-20 공략:-) | Stage 134-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1297` (+1) |
| 23146 | nv | 2026-08-21 | v443 l3 c3 | 83-30 비겁이 클리어덱 | Stage 83-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1298` (+1) |
| 23108 | nv | 2026-08-21 | v261 l0 c4 | 133-20 공략:-) | Stage 133-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1301` (+1) |
| 23107 | nv | 2026-08-21 | v73 l0 c0 | 은행강도 폭탄광 공략 (영상) | Bank Robber Bomber guide ( video ) | `001/evidence/05-nv-guide-board-index.tsv:1302` (+1) |
| 23056 | nv | 2026-08-21 | v309 l0 c0 | 생크림콘 독수리 공략 (영상) | Cream Eagle guide ( video ) | `001/evidence/05-nv-guide-board-index.tsv:1303` (+1) |
| 23002 | nv | 2026-08-21 | v580 l3 c4 | 83-20 폭주단 클리어덱 | Stage 83-20 Rowdy gang clear deck | `001/evidence/05-nv-guide-board-index.tsv:1306` (+1) |
| 22985 | nv | 2026-08-21 | v643 l3 c0 | 83-10 폭주단 클리어덱 | Stage 83-10 Rowdy gang clear deck | `001/evidence/05-nv-guide-board-index.tsv:1308` (+1) |
| 22968 | nv | 2026-08-21 | v472 l2 c1 | 82-30 쿨민 클리어덱 | Stage 82-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1309` (+1) |
| 22958 | nv | 2026-08-21 | v1149 l1 c3 | 70-20 클리어덱(망공) | Stage 70-20 clear deck ( Choco Werehound Princess ) | `001/evidence/05-nv-guide-board-index.tsv:1310` (+1) |
| 22900 | nv | 2026-08-20 | v564 l1 c1 | 54-30 클리어덱 | Stage 54-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1313` (+1) |
| 22899 | nv | 2026-08-20 | v912 l2 c2 | 78-30 / 86-30 분수대 쿨민 클리어덱 | Stage 78-30 / 86-30 fountain Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1314` (+1) |
| 22895 | nv | 2026-08-20 | v1439 l10 c4 | 78-20 / 86-20 망치공주 클리어덱 | Stage 78-20 / 86-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1315` (+1) |
| 22888 | nv | 2026-08-20 | v1082 l4 c2 | 75-30 / 83-30 / 91-30 / 99-30 / 107-30 전용맵 비겁이 클리어덱 | Stage 75-30 / 83-30 / 91-30 / 99-30 / 107-30 dedicated map Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1316` (+1) |
| 22887 | nv | 2026-08-20 | v348 l1 c2 | 131-30 공략:-) | Stage 131-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1317` (+1) |
| 22882 | nv | 2026-08-20 | v357 l0 c0 | 131-10 공략:-) | Stage 131-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1318` (+1) |
| 22881 | nv | 2026-08-20 | v404 l2 c0 | 75-10 3쥐 클리어덱 기록용 | Stage 75-10 rat biker trio clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:1319` (+1) |
| 22880 | nv | 2026-08-20 | v128 l0 c3 | 82-10,20 클리어덱 | Stage 82-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1320` (+1) |
| 22875 | nv | 2026-08-20 | v223 l1 c2 | 81-30 쿨민 클리어덱 | Stage 81-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1321` (+1) |
| 22869 | nv | 2026-08-20 | v587 l0 c0 | 80-30 공략 | Stage 80-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1322` (+1) |
| 22868 | nv | 2026-08-20 | v156 l1 c2 | 130-30 공략:-) | Stage 130-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1323` (+1) |
| 22856 | nv | 2026-08-20 | v1096 l9 c4 | 43-10 폭주단 바이크 클리어 덱 | Stage 43-10 Rowdy Biker clear deck | `001/evidence/05-nv-guide-board-index.tsv:1324` (+1) |
| 22855 | nv | 2026-08-20 | v101 l0 c0 | 81-20 클리어덱 | Stage 81-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1325` (+1) |
| 22851 | nv | 2026-08-20 | v141 l0 c0 | 129-30 공략:-) | Stage 129-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1326` (+1) |
| 22832 | nv | 2026-08-20 | v787 l4 c3 | 78-30 쿨링민트 클리어덱 | Stage 78-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1327` (+1) |
| 22825 | nv | 2026-08-20 | v271 l1 c0 | 128-30 공략:-) | Stage 128-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1328` (+1) |
| 22821 | nv | 2026-08-20 | v86 l1 c0 | 81-10 클리어덱 | Stage 81-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1329` (+1) |
| 22782 | nv | 2026-08-20 | v694 l2 c2 | 56-30 13.53m 비겁 | Stage 56-30 13.53m Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:1331` (+1) |
| 22769 | nv | 2026-08-20 | v909 l9 c7 | 50-30 / 9M 558 클리어 덱 공유 | Stage 50-30 / 9M 558 clear deck share | `001/evidence/05-nv-guide-board-index.tsv:1332` (+1) |
| 22768 | nv | 2026-08-20 | v542 l1 c0 | 43-10 폭주단 바이크 클리어 덱 | Stage 43-10 Rowdy Biker clear deck | `001/evidence/05-nv-guide-board-index.tsv:1333` (+1) |
| 22766 | nv | 2026-08-20 | v982 l4 c3 | 80-30 비겁이 클리어덱 | Stage 80-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1334` (+1) |
| 22765 | nv | 2026-08-20 | v257 l0 c0 | 80-10,20 클리어덱 | Stage 80-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1335` (+1) |
| 22764 | nv | 2026-08-20 | v248 l0 c0 | 37-30 클리어 힘들다 | Stage 37-30 hard to clear | `001/evidence/05-nv-guide-board-index.tsv:1336` (+1) |
| 22763 | nv | 2026-08-20 | v474 l6 c2 | 10.52m 51-20 폭주단 트럭 클리어 영상 | 10.52m 51-20 Rowdy Truck clear video | `001/evidence/05-nv-guide-board-index.tsv:1337` (+1) |
| 22752 | nv | 2026-08-20 | v442 l0 c0 | 37-20 클리어덱 무과금 | Stage 37-20 clear deck F2P | `001/evidence/05-nv-guide-board-index.tsv:1338` (+1) |
| 22737 | nv | 2026-08-20 | v339 l0 c0 | 126-30 공략:-) | Stage 126-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1341` (+1) |
| 22724 | nv | 2026-08-20 | v512 l2 c0 | 74-30 / 82-30 해변맵 쿨민 클리어덱 | Stage 74-30 / 82-30 beach-map Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1342` (+1) |
| 22723 | nv | 2026-08-20 | v288 l0 c1 | 73-30 / 81-30 초원맵 쿨민 클리어덱 | Stage 73-30 / 81-30 grassland map Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1343` (+1) |
| 22715 | nv | 2026-08-20 | v519 l3 c2 | 126-20 공략:-) | Stage 126-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1344` (+1) |
| 22712 | nv | 2026-08-20 | v1294 l4 c3 | 67-30 클리어덱 ( 비겁이) | Stage 67-30 clear deck ( Cowardly Cookie ) | `001/evidence/05-nv-guide-board-index.tsv:1345` (+1) |
| 22703 | nv | 2026-08-20 | v522 l2 c3 | 51-30 비겁이 클리어덱(11m) | Stage 51-30 Cowardly Cookie clear deck (11m) | `001/evidence/05-nv-guide-board-index.tsv:1346` (+1) |
| 22666 | nv | 2026-08-20 | v1001 l12 c3 | 10.01m 51-10 폭주단 바이커 클리어 영상 | 10.01m 51-10 Rowdy Biker clear video | `001/evidence/05-nv-guide-board-index.tsv:1348` (+1) |
| 22611 | nv | 2026-08-20 | v286 l2 c0 | 125-20 공략:-) | Stage 125-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1351` (+1) |
| 22601 | nv | 2026-08-20 | v882 l0 c1 | 64-30 비겁한 클리어덱 기록용 | Stage 64-30 Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:1352` (+1) |
| 22594 | nv | 2026-08-20 | v913 l3 c3 | 72-30 / 80-30 / 88-30 빙판맵 비겁이 클리어덱 기록용 | Stage 72-30 / 80-30 / 88-30 ice map Cowardly Cookie clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:1354` (+1) |
| 22580 | nv | 2026-08-20 | v698 l1 c3 | 86-20 35.8m 클덱 | Stage 86-20 35.8m clear deck | `001/evidence/05-nv-guide-board-index.tsv:1356` (+1) |
| 22577 | nv | 2026-08-20 | v2305 l39 c25 | 스테이지별 추천덱 공략 그니 | Recommended decks per stage | `001/evidence/05-nv-guide-board-index.tsv:1357` (+1) |
| 22570 | nv | 2026-08-20 | v504 l0 c8 | 9.99m 50-30 쿨링민트 클리어덱 | 9.99m 50-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1358` (+1) |
| 22538 | nv | 2026-08-20 | v209 l2 c0 | 79-10,20,30클리어덱 | Stage 79-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1359` (+1) |
| 22519 | nv | 2026-08-20 | v360 l2 c0 | 78-30 쿨민 클리어덱 | Stage 78-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1360` (+1) |
| 22515 | nv | 2026-08-20 | v189 l0 c0 | 38-20 어케깨나요 | How to beat 38-20? | `001/evidence/05-nv-guide-board-index.tsv:1361` (+1) |
| 22502 | nv | 2026-08-20 | v401 l1 c6 | 123-30 공략:-) | Stage 123-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1363` (+1) |
| 22477 | nv | 2026-08-20 | v401 l1 c6 | 123-10 공략:-) | Stage 123-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1364` (+1) |
| 22471 | nv | 2026-08-20 | v583 l1 c0 | 83-10, 83-30 클리어덱 공유 | Stage 83-10, 83-30 clear deck share | `001/evidence/05-nv-guide-board-index.tsv:1365` (+1) |
| 22455 | nv | 2026-08-20 | v224 l2 c7 | 122-30 공략:-) | Stage 122-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1367` (+1) |
| 22451 | nv | 2026-08-20 | v1261 l2 c3 | 78-20 망치공주 클리어덱 | Stage 78-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1368` (+1) |
| 22388 | nv | 2026-08-20 | v432 l2 c3 | 9.22m 49-30 쿨링민트 클리어 영상 | 9.22m 49-30 Cool Mint clear video | `001/evidence/05-nv-guide-board-index.tsv:1370` (+1) |
| 22385 | nv | 2026-08-20 | v9804 l323 c54 | 마지막 스테이지까지 활용 가능한 범용 덱 추천 | General-purpose deck usable to the last stage | `001/evidence/05-nv-guide-board-index.tsv:1371` (+1) |
| 22380 | nv | 2026-08-20 | v841 l2 c0 | 67-30 비겁이 공략 덱 | Stage 67-30 Cowardly Cookie guide deck | `001/evidence/05-nv-guide-board-index.tsv:1372` (+1) |
| 22368 | nv | 2026-08-20 | v1160 l10 c3 | 46-20 망치공주 클리어덱 (8.7M) | Stage 46-20 Choco Werehound Princess clear deck (8.7M) | `001/evidence/05-nv-guide-board-index.tsv:1373` (+1) |
| 22363 | nv | 2026-08-20 | v1187 l7 c7 | 스테이지 완등/ 쿨링민트 보스 상대 덱, 무빙 팁 | Full clear / deck and movement tips vs Cool Mint boss | `001/evidence/05-nv-guide-board-index.tsv:1375` (+1) |
| 22360 | nv | 2026-08-20 | v716 l2 c4 | 77-10,20,30 클리어덱 | Stage 77-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1376` (+1) |
| 22337 | nv | 2026-08-20 | v1004 l5 c9 | 66-30 클리어덱( 쿨민) | Stage 66-30 clear deck ( Cool Mint ) | `001/evidence/05-nv-guide-board-index.tsv:1377` (+1) |
| 22331 | nv | 2026-08-20 | v969 l1 c6 | 8.86m 48-30 비겁한 쿠키 클리어 영상 | 8.86m 48-30 Cowardly Cookie clear video | `001/evidence/05-nv-guide-board-index.tsv:1378` (+1) |
| 22322 | nv | 2026-08-20 | v983 l12 c4 | 쥐토바이, 망치공주 완전 공략 | Complete guide: rat bikers, Werehound Princess | `001/evidence/05-nv-guide-board-index.tsv:1379` (+1) |
| 22320 | nv | 2026-08-19 | v1174 l2 c3 | 임플란트타워 등반 | Implant Tower climb | `001/evidence/05-nv-guide-board-index.tsv:1380` (+1) |
| 22306 | nv | 2026-08-19 | v170 l1 c4 | 121-30 공략:-) | Stage 121-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1381` (+1) |
| 22303 | nv | 2026-08-19 | v86 l0 c0 | 76-30 클리어덱 | Stage 76-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1382` (+1) |
| 22297 | nv | 2026-08-19 | v45 l1 c0 | 76-20 클리어덱 | Stage 76-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1383` (+1) |
| 22294 | nv | 2026-08-19 | v399 l1 c5 | 120-30 공략:-) | Stage 120-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1384` (+1) |
| 22280 | nv | 2026-08-19 | v221 l0 c2 | 76-10 클리어덱 | Stage 76-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1385` (+1) |
| 22273 | nv | 2026-08-19 | v1404 l0 c1 | 67-30, 67-20, 67-10 수원 | Stage 67-30, 67-20, 67-10 (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1386` (+1) |
| 22272 | nv | 2026-08-19 | v422 l0 c4 | 118-30 공략:-) | Stage 118-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1387` (+1) |
| 22266 | nv | 2026-08-19 | v228 l0 c0 | 66-30 수원 | Stage 66-30 (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1388` (+1) |
| 22265 | nv | 2026-08-19 | v215 l0 c0 | 78스테덱 | Stage 78 stage deck | `001/evidence/05-nv-guide-board-index.tsv:1389` (+1) |
| 22264 | nv | 2026-08-19 | v790 l3 c10 | 75-30 비겁이 클리어덱 | Stage 75-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1390` (+1) |
| 22263 | nv | 2026-08-19 | v663 l1 c2 | 118-20 공략:-) | Stage 118-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1391` (+1) |
| 22247 | nv | 2026-08-19 | v324 l1 c0 | 117-20 공략:-) | Stage 117-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1392` (+1) |
| 22237 | nv | 2026-08-19 | v717 l0 c3 | 32-30 조언 부탁드립니다..🥺🙇‍♀️ | Stage 32-30 advice please | `001/evidence/05-nv-guide-board-index.tsv:1394` (+1) |
| 22227 | nv | 2026-08-19 | v627 l10 c1 | 비겁이, 쿨찐이 공통 공략법 (봐두면 무조건 도움됨) | Common method for Cowardly Cookie and Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:1395` (+1) |
| 22171 | nv | 2026-08-19 | v889 l2 c5 | 78-20 망치공주 클리어 | Stage 78-20 Choco Werehound Princess clear | `001/evidence/05-nv-guide-board-index.tsv:1396` (+1) |
| 22160 | nv | 2026-08-19 | v178 l0 c0 | 63-30 쿨링민트 클리어 기록용 | Stage 63-30 Cool Mint clear for the record | `001/evidence/05-nv-guide-board-index.tsv:1397` (+1) |
| 22157 | nv | 2026-08-19 | v344 l5 c3 | 43-20 6.3M 클리어 | Stage 43-20 6.3M clear | `001/evidence/05-nv-guide-board-index.tsv:1398` (+1) |
| 22146 | nv | 2026-08-19 | v681 l0 c0 | 35-30 비겁한쿠키 클리어 덱 | Stage 35-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1399` (+1) |
| 22144 | nv | 2026-08-19 | v1221 l2 c0 | 62-20 20.43m 망치공주 클리어 덱 공유합니다 | Stage 62-20 20.43m Choco Werehound Princess clear deck share | `001/evidence/05-nv-guide-board-index.tsv:1400` (+1) |
| 22135 | nv | 2026-08-19 | v148 l0 c0 | 65-30 23M63K 수원 | Stage 65-30 at 23.06M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1402` (+1) |
| 22113 | nv | 2026-08-19 | v357 l0 c0 | 115-30 공략:-) | Stage 115-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1404` (+1) |
| 22106 | nv | 2026-08-19 | v273 l2 c0 | 160-30 비겁한 쿠키 | Stage 160-30 Cowardly Cookie | `001/evidence/05-nv-guide-board-index.tsv:1405` (+1) |
| 22086 | nv | 2026-08-19 | v470 l0 c0 | 64-30 23M814k 수원 | Stage 64-30 at 23.81M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1406` (+1) |
| 22012 | nv | 2026-08-19 | v243 l2 c0 | 8.63m 47-20 / 47-30 용암 와플슈가 도마뱀 클리어 영상 | 8.63m 47-20 / 47-30 Lava Sugar Waffle Lizard clear video | `001/evidence/05-nv-guide-board-index.tsv:1407` (+1) |
| 22009 | nv | 2026-08-19 | v221 l1 c0 | 65-30 쿨링민트 | Stage 65-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:1408` (+1) |
| 21979 | nv | 2026-08-19 | v496 l2 c12 | 115-10 공략:-) | Stage 115-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1409` (+1) |
| 21976 | nv | 2026-08-19 | v377 l0 c6 | 10-30 제발 도와주세요 몰넣든 안깨지네요 캐릭이랑 펫 모넣어야되나요..ㅠㅠㅠ | Stage 10-30 help; which cookies and pets? | `001/evidence/05-nv-guide-board-index.tsv:1411` (+1) |
| 21973 | nv | 2026-08-19 | v855 l0 c1 | 69-20 오염된 그루터기 컨X 클리어덱 | Stage 69-20 Tainted Ent no-control clear deck | `001/evidence/05-nv-guide-board-index.tsv:1412` (+1) |
| 21936 | nv | 2026-08-19 | v1089 l3 c5 | 8.4m 46-30 쿨링민트 클리어 영상 | 8.4m 46-30 Cool Mint clear video | `001/evidence/05-nv-guide-board-index.tsv:1413` (+1) |
| 21935 | nv | 2026-08-19 | v948 l8 c3 | 75-20 폭주단 클리어덱 | Stage 75-20 Rowdy gang clear deck | `001/evidence/05-nv-guide-board-index.tsv:1414` (+1) |
| 21912 | nv | 2026-08-19 | v846 l1 c0 | 8.48m 46-20 망치공주 클리어 영상 | 8.48m 46-20 Choco Werehound Princess clear video | `001/evidence/05-nv-guide-board-index.tsv:1415` (+1) |
| 21905 | nv | 2026-08-19 | v313 l0 c9 | 114-30 공략:-) | Stage 114-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1416` (+1) |
| 21900 | nv | 2026-08-19 | v651 l2 c2 | 75-10 바이커쥐 클리어덱 | Stage 75-10 rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:1417` (+1) |
| 21881 | nv | 2026-08-19 | v1128 l2 c6 | 64-30 클리어덱( 비겁이) | Stage 64-30 clear deck ( Cowardly Cookie ) | `001/evidence/05-nv-guide-board-index.tsv:1418` (+1) |
| 21865 | nv | 2026-08-19 | v501 l5 c4 | 74-30 쿨민 클리어덱 | Stage 74-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1419` (+1) |
| 21860 | nv | 2026-08-19 | v194 l2 c2 | 113-30 공략:-) | Stage 113-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1420` (+1) |
| 21835 | nv | 2026-08-19 | v565 l2 c4 | 112-30 공략:-) | Stage 112-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1421` (+1) |
| 21829 | nv | 2026-08-19 | v510 l4 c0 | 45-20 클리어덱 | Stage 45-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1422` (+1) |
| 21827 | nv | 2026-08-19 | v366 l0 c0 | 43-30 클리어덱 | Stage 43-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1423` (+1) |
| 21801 | nv | 2026-08-19 | v367 l1 c0 | 67-30 기록 | Stage 67-30 record | `001/evidence/05-nv-guide-board-index.tsv:1425` (+1) |
| 21797 | nv | 2026-08-19 | v856 l3 c0 | 54-20 | Stage 54-20 | `001/evidence/05-nv-guide-board-index.tsv:1426` (+1) |
| 21788 | nv | 2026-08-19 | v435 l0 c0 | 80-30 덱공유 | Stage 80-30 deck share | `001/evidence/05-nv-guide-board-index.tsv:1427` (+1) |
| 21781 | nv | 2026-08-19 | v46 l0 c0 | 74-10,20 클리어덱 | Stage 74-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1428` (+1) |
| 21780 | nv | 2026-08-19 | v342 l0 c0 | 75-30 | Stage 75-30 | `001/evidence/05-nv-guide-board-index.tsv:1429` (+1) |
| 21764 | nv | 2026-08-19 | v425 l1 c2 | 73-30 쿨민 클리어덱 | Stage 73-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1431` (+1) |
| 21757 | nv | 2026-08-19 | v826 l0 c2 | 67-10 이게되네 NO 허브덱 | Stage 67-10: works with no Herb | `001/evidence/05-nv-guide-board-index.tsv:1432` (+1) |
| 21755 | nv | 2026-08-19 | v219 l1 c0 | 73-10,20 클리어덱 | Stage 73-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1433` (+1) |
| 21713 | nv | 2026-08-19 | v101 l1 c0 | 65-30 아무튼 깼죠 덱(이유 0.167 하고 거의다죽고 깨서) | Stage 65-30 cleared somehow (nearly wiped) | `001/evidence/05-nv-guide-board-index.tsv:1435` (+1) |
| 21700 | nv | 2026-08-19 | v661 l5 c2 | 72-30 비겁이 클리어덱 | Stage 72-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1436` (+1) |
| 21695 | nv | 2026-08-19 | v590 l4 c4 | 64-30클리어덱 | Stage 64-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1437` (+1) |
| 21660 | nv | 2026-08-18 | v643 l4 c3 | 110-30 공략:-) | Stage 110-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1439` (+1) |
| 21658 | nv | 2026-08-18 | v785 l3 c14 | 110-20 공략:-) | Stage 110-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1440` (+1) |
| 21655 | nv | 2026-08-18 | v406 l2 c0 | 88-30 비겁이 클리어덱 | Stage 88-30 Cowardly Cookie clear deck | `001/evidence/05-nv-guide-board-index.tsv:1441` (+1) |
| 21654 | nv | 2026-08-18 | v421 l2 c8 | 109-20 공략:-) | Stage 109-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1442` (+1) |
| 21648 | nv | 2026-08-18 | v407 l2 c0 | 107-30 공략:) | Stage 107-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1443` (+1) |
| 21644 | nv | 2026-08-18 | v713 l4 c6 | 107-10 공략:-) | Stage 107-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1444` (+1) |
| 21640 | nv | 2026-08-18 | v376 l2 c2 | 106-30 공략:-) | Stage 106-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1445` (+1) |
| 21630 | nv | 2026-08-18 | v225 l1 c4 | 105-30 공략:-) | Stage 105-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1446` (+1) |
| 21620 | nv | 2026-08-18 | v528 l0 c2 | 65-30 / 66-30 쿨민 클리어덱 기록용 | Stage 65-30 / 66-30 Cool Mint clear deck for the record | `001/evidence/05-nv-guide-board-index.tsv:1448` (+1) |
| 21601 | nv | 2026-08-18 | v272 l0 c0 | 67-30 공략 | Stage 67-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1449` (+1) |
| 21600 | nv | 2026-08-18 | v650 l1 c0 | 35-10 바이커 쥐 클리어덱 | Stage 35-10 Biker rat bikers clear deck | `001/evidence/05-nv-guide-board-index.tsv:1450` (+1) |
| 21587 | nv | 2026-08-18 | v641 l3 c11 | 104-30 공략:-) | Stage 104-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1451` (+1) |
| 21585 | nv | 2026-08-18 | v181 l0 c4 | 71-30 클리어덱 | Stage 71-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1452` (+1) |
| 21584 | nv | 2026-08-18 | v132 l1 c0 | 71-10,20 클리어덱 | Stage 71-10,20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1453` (+1) |
| 21582 | nv | 2026-08-18 | v375 l0 c1 | 75ㅡ10(쥐돌이) | 75ㅡ10( rat bikers ) | `001/evidence/05-nv-guide-board-index.tsv:1454` (+1) |
| 21552 | nv | 2026-08-18 | v935 l5 c2 | 59-30 클리어덱(비겁이) | Stage 59-30 clear deck ( Cowardly Cookie ) | `001/evidence/05-nv-guide-board-index.tsv:1456` (+1) |
| 21548 | nv | 2026-08-18 | v687 l8 c5 | 기록용 37-20 오염된 그루터기 클리어덱 | Stage 37-20 Tainted Ent clear deck, record | `001/evidence/05-nv-guide-board-index.tsv:1457` (+1) |
| 21543 | nv | 2026-08-18 | v110 l0 c0 | 54-1~쭉 | Stage 54-1 onwards | `001/evidence/05-nv-guide-board-index.tsv:1458` (+1) |
| 21536 | nv | 2026-08-18 | v422 l1 c1 | 78-30 덱공유 | Stage 78-30 deck share | `001/evidence/05-nv-guide-board-index.tsv:1459` (+1) |
| 21526 | nv | 2026-08-18 | v998 l5 c0 | 70-30 쿨민 클리어덱 | Stage 70-30 Cool Mint clear deck | `001/evidence/05-nv-guide-board-index.tsv:1461` (+1) |
| 21525 | nv | 2026-08-18 | v705 l0 c0 | 7.85m 45-20 / 8.22m 45-30 오염된 그루터기 정령 클리어덱 | 7.85m 45-20 / 8.22m 45-30 Tainted Ent clear deck | `001/evidence/05-nv-guide-board-index.tsv:1462` (+1) |
| 21506 | nv | 2026-08-18 | v633 l3 c4 | 102-30 공략 :-) | Stage 102-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1463` (+1) |
| 21502 | nv | 2026-08-18 | v256 l0 c3 | 스테이지 37-10 기록용 | stage 37-10 for the record | `001/evidence/05-nv-guide-board-index.tsv:1464` (+1) |
| 21488 | nv | 2026-08-18 | v1193 l4 c14 | 102-20 공략:-) | Stage 102-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1466` (+1) |
| 21460 | nv | 2026-08-18 | v890 l0 c1 | 67-10 바이크 기록용 | Stage 67-10 Biker for the record | `001/evidence/16-top-players/05-nv-guide-board.tsv:1468` (+1) |
| 21447 | nv | 2026-08-18 | v86 l0 c0 | 71스테 클리어 덱 | Stage 71 stage clear deck | `001/evidence/05-nv-guide-board-index.tsv:1468` (+1) |
| 21423 | nv | 2026-08-18 | v206 l0 c0 | 83-20 클리어 덱 | Stage 83-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1470` (+1) |
| 21392 | nv | 2026-08-18 | v683 l1 c8 | 101-20 공략:-) | Stage 101-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1473` (+1) |
| 21378 | nv | 2026-08-18 | v231 l2 c2 | 100-30 공략:-) | Stage 100-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1476` (+1) |
| 21315 | nv | 2026-08-18 | v1721 l1 c4 | 70-20 망치공주 클리어덱 | Stage 70-20 Choco Werehound Princess clear deck | `001/evidence/05-nv-guide-board-index.tsv:1478` (+1) |
| 21304 | nv | 2026-08-18 | v646 l4 c9 | 99-30 공략:-) | Stage 99-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1479` (+1) |
| 21286 | nv | 2026-08-18 | v540 l5 c6 | 99-20 공략:-) | Stage 99-20 guide | `001/evidence/05-nv-guide-board-index.tsv:1480` (+1) |
| 21277 | nv | 2026-08-18 | v609 l4 c10 | 99-10 공략:-) | Stage 99-10 guide | `001/evidence/05-nv-guide-board-index.tsv:1481` (+1) |
| 21274 | nv | 2026-08-18 | v335 l0 c0 | 66-30 공략 | Stage 66-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1482` (+1) |
| 21268 | nv | 2026-08-18 | v424 l0 c0 | 72-30 27.7m 클리어덱 | Stage 72-30 27.7m clear deck | `001/evidence/05-nv-guide-board-index.tsv:1483` (+1) |
| 21257 | nv | 2026-08-18 | v223 l0 c1 | 기록용 37-10 독뿔버섯 클리어 덱 | for the record 37-10 poison-horn mushroom clear deck | `001/evidence/05-nv-guide-board-index.tsv:1484` (+1) |
| 21232 | nv | 2026-08-18 | v139 l1 c0 | 63-30 | Stage 63-30 | `001/evidence/05-nv-guide-board-index.tsv:1485` (+1) |
| 21226 | nv | 2026-08-18 | v420 l4 c6 | 98-30 공략:-) | Stage 98-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1486` (+1) |
| 21216 | nv | 2026-08-18 | v126 l1 c0 | 63-20 수원 | Stage 63-20 (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1487` (+1) |
| 21214 | nv | 2026-08-18 | v817 l3 c3 | 6.6m 43-30 비겁한 쿠키 클리어 영상 | 6.6m 43-30 Cowardly Cookie clear video | `001/evidence/05-nv-guide-board-index.tsv:1488` (+1) |
| 21209 | nv | 2026-08-18 | v66 l1 c0 | 63-10 수원 | Stage 63-10 (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1489` (+1) |
| 21194 | nv | 2026-08-18 | v533 l0 c0 | 67-10 바이커 | Stage 67-10 Biker | `001/evidence/16-top-players/05-nv-guide-board.tsv:1491` (+1) |
| 21192 | nv | 2026-08-18 | v1543 l3 c4 | 62-30 20M88K 수원 | Stage 62-30 at 20.09M (Suwon) | `001/evidence/05-nv-guide-board-index.tsv:1491` (+1) |
| 21170 | nv | 2026-08-18 | v413 l2 c1 | 134-30 쿨링민트 | Stage 134-30 Cool Mint | `001/evidence/05-nv-guide-board-index.tsv:1492` (+1) |
| 21159 | nv | 2026-08-18 | v8811 l248 c79 | 168 등반하며 사용했던 덱 공유 | Decks used climbing to 168 | `001/evidence/05-nv-guide-board-index.tsv:1493` (+1) |
| 21154 | nv | 2026-08-18 | v352 l5 c2 | 6.82m 43-20 폭주단 트럭 클리어 영상 | 6.82m 43-20 Rowdy Truck clear video | `001/evidence/05-nv-guide-board-index.tsv:1494` (+1) |
| 21143 | nv | 2026-08-18 | v278 l1 c1 | 75-10 클리어덱 | Stage 75-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1495` (+1) |
| 21140 | nv | 2026-08-18 | v132 l0 c0 | 70-10 클리어덱 | Stage 70-10 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1496` (+1) |
| 21109 | nv | 2026-08-18 | v1100 l3 c7 | 35-30 자동 클리어 | Stage 35-30 auto clear | `001/evidence/05-nv-guide-board-index.tsv:1497` (+1) |
| 21100 | nv | 2026-08-18 | v1091 l7 c7 | 69-10,20,30 클리어덱 | Stage 69-10,20,30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1498` (+1) |
| 21098 | nv | 2026-08-18 | v1289 l8 c10 | 62-20 19M153K | Stage 62-20 19M153K | `001/evidence/05-nv-guide-board-index.tsv:1499` (+1) |
| 21083 | nv | 2026-08-18 | v347 l0 c0 | 69-20 | Stage 69-20 | `001/evidence/05-nv-guide-board-index.tsv:1500` (+1) |
| 21076 | nv | 2026-08-18 | v2707 l27 c23 | 축복 5 총과금 25미만 소과금 유저 풀스테 스펙 | Blessing 5, light spender (<250k won): full-stage spec | `001/evidence/05-nv-guide-board-index.tsv:1501` (+1) |
| 21068 | nv | 2026-08-17 | v144 l0 c0 | 68-30 클리어덱 | Stage 68-30 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1502` (+1) |
| 21061 | nv | 2026-08-17 | v719 l0 c2 | 78-20 클리어 덱 | Stage 78-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1504` (+1) |
| 21056 | nv | 2026-08-17 | v155 l0 c0 | 68-20 클리어덱 | Stage 68-20 clear deck | `001/evidence/05-nv-guide-board-index.tsv:1505` (+1) |
| 21055 | nv | 2026-08-17 | v293 l1 c6 | 97-30 공략:-) | Stage 97-30 guide | `001/evidence/05-nv-guide-board-index.tsv:1506` |

## 7. Where the repo is silent

- **Teams at the 15% step.** No captured post body describes a team that clears in the 15% step (20-40% of recommended power). The repo holds only titles: nv:46234 "권투15%도 클리어는 가능하다", nv:44742 "스테 15퍼 클", nv:46541 "15%...", nv:40431 "안녕하세요 15퍼단입니다", nv:45336 (easing "15%까지 클리어가능"), dc:76825 "시커 바리 체콜은 15퍼를 찢어", dc:76779 "바리 5성이상은 15퍼 밀림?", dc:71100 "287에서 막혔다.. 15%는 진짜 몸비틀어도안되네", dc:68294 (§6).
- **Teams at the 35% step, in full.** The 35% material in bodies is thread talk and preset advice (§1.3); the complete lineups (cookies, levels, runes, pets) of the 35% clear posts are in images (`001/evidence/17-kr-highscore/dc/img/72776-*.jpg`, `001/evidence/03-dc-posts/img/70308-*.jpg`) or in uncaptured posts (nv:30567, nv:24990, nv:37788, nv:44131, nv:46209, nv:34395, nv:25032, dc:56679, dc:59490, dc:43436 and the rest of §6.1). No 35% deck is in any `curated/*.json`.
- **Where each step starts, per stage, before and after 2026-09-23.** The bracket fractions (10/20/40/60/80/100/120%) are stated by crumblehub, the 17035 image and eog.gg, but the repo has no per-stage recommended-power table: crumb.gg gives one row per chapter with no statement of which sub-stage it is, eog.gg's capture holds World 1 only, and the 17035 image holds 42-14 to 42-17. These disagree on chapter 42: crumb.gg's chapter-42 row puts 100% at 10.16M (`001/evidence/15-crumbgg/30-stages.txt:399`), while the image gives 42-17 at 8,093,303, and cookieruncrumbles says "about 6 million power on Chapter 42-1 dealt roughly 55% damage" (`001/evidence/14-global/13-cookieruncrumbles-gear-runes.html:6`). crumb.gg's chapter-328 row (9.766G) differs from crumb.gg's own patch digest (328-30 → 10.00B, `001/evidence/15-crumbgg/33-patches-read.txt:81`). No pre-easing table is captured, so the "36% lower at the end" claim (`001/evidence/03-dc-posts/73113.md:13`, `33-patches-read.txt:81`) cannot be checked in the repo.
- **What "team power" means for the gate.** crumblehub says 팀 전투력 (team power); the question "파티 기준임 총 전투력 기준임?" (`001/evidence/03-dc-posts/17035.md:39`) is unanswered, and no source says whether the power compared is the stage preset's displayed team power, whether 돌파력 counts, or how gear-preset switching mid-stage interacts (a player notes the switch doesn't apply at once: dc:72763 title only).
- **What the gate touches besides damage.** crumblehub and alkapa say it lowers damage dealt only (not healing or damage taken). Only cookieruncrumbles claims it also affects debuff landing (`001/evidence/14-global/14-cookieruncrumbles-equipment-choice.html:13`); nothing else in the repo confirms or denies that, and no game-data formula for the gate is captured (the Sugar Pocket `stageBosses` block has resist rates, not recommended power).
- **The Dimensional Rift as a stage mode.** No Rift recommended power, boss list, boss stats, stage count, bracket rule or deck is captured. crumb.gg's "Dimensional Rift" tab exists but was not opened (`001/evidence/15-crumbgg/30-stages.txt:11`). Whether the power adjustment applies in the Rift is unstated; one title claims a 1T Rift recommended power (dc:74351, body not captured). Whether Dimensional Energy stats count toward the power compared is unstated. The 무한바퀴 value is given as +50% (lowest grade, DC 74998 and crumb.gg) and +150% (max, game text); per-grade values are not captured. Rift ranking/reward rules beyond "daily and weekly all-server rewards" (`002/evidence/04-naver-global/nv/nv-43444.md:1353`) are not captured.
- **"Dimension stages past 328" as normal stages.** Record 003's README describes "the new dimension stages added recently past stage 328"; the repo's sources describe the Rift as a separate boss-only content unlocked after 328-30 (§3), and one comment calls it a replacement for adding stages (`001/evidence/14-global/nv-patchnotes/nv-44477.md:193`). No source in the repo describes main stages beyond 328-30.
- **Stage types, elements and boss stages.** The repo names the recurring bosses and their control tips (§2) and eog.gg's "elite slot" note (`19-eoggg-home.html:8987`), but has no per-stage element data, no boss element list, and no statement of how element advantage changes stage pushing (the element multiplier is stated only generally: `001/evidence/08-extract/sites.json:1158`, from crumblehub, "Advantage multiplier = 1 + 15% + element-damage bonus"). Multi-boss vs single-boss stages are named only in deck titles.
- **Pets for stages.** Pet choices appear as asides (Panda Dumpling, 갓방울, 핫도그, 얼음과자새, 초코왕방울, 건전지, 색동주머니 in §2); there is no stage pet ranking or pet level data.
- **Levels.** No stage deck in the repo carries a level for every cookie with a reason; the only level rules are the Milk-ATK-first rule, Pinot kept low, and the stage-vs-conquest levelling asides (§2.4).
- **Global (non-KR) stage pushing.** The only English sources are site pages (eog.gg, cookieruncrumbles, OSLink, Pocket Gamer mentions). No global forum or Reddit thread on stage pushing or the 35%/15% steps is captured (the Reddit probe returned 403: `001/evidence/14-global/02-reddit-probe.tsv`).
- **Uncaptured posts that the index points at.** Every §6 row is a title only unless a capture is cited in §§1-3; e.g. the eog.gg/crumblehub-style stage tables posted to the cafe (nv:27042 "169 ~ 248 스테이지 권장 전투력, 명중, 저항 추가", nv:34860 "전투력에 따른 최종 데미지 보정", nv:37868, nv:37858, dc:50007 "스테이지 권투력이 얼마나 가파르게 늘어나는지 알아보자...", dc:68128 "권장 전투력 과하게 초과하면 이런 이펙트 나오나봐", dc:73636 "변경된 권장 전투력 및 신규 컨텐츠 전투력 반영") and the DC post linked from 75854 (dc:75607) are not in the repo.
