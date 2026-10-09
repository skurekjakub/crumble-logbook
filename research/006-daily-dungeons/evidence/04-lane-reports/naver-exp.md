## Bottom line
A clean, hands-off clear at ~700 is still rare. The posted decks that come closest all use the same frame. Brightseeker (브라이트시커) is the only real damage dealer. Pediatrician Milk (소아과 의사 우유) is captain and the heal. 석류, 치즈케이크 and usually 락스타 buff Brightseeker. Three tanks (들개, 이온, 달토끼) turn on the "3 tanks → +10% damage reduction" mercenary perk. 허브 is also in. The last 2–3 slots are flex.
- The best evidence for full auto at 680+ is nv:47333 (683, "아직까진 오토로 타율 괜찮네요"). Next is 비쿠's deck (nv:48705, video at 724). The cafe summary nv:49847 labels it "경던 오토덱".
- The 716 clear (nv:48828) is semi-auto: you nudge the team down after 달토끼's skill and go in at 48s.
- The game updates tomorrow, 10/8 (official notice nv:50417). It nerfs this boss: lower base ATK, longer cooldown on the push AoE, smaller inner-book attack range. nv:49847 claims ATK goes 500→350 (~30%); that figure is not in the official text.

Nothing was committed; the repo is untouched. Captures are in `<scratchpad>/expdeck/naver/`:
- `nv-<id>.json` (raw API answer) and `nv-<id>.md` (text and comments)
- `img/` (post images, cafe video thumbnails, YouTube frames)
- `yt/` (YouTube watch pages)
- `list-9.tsv` (guide board, 09-20→10-07), `list-1.tsv` and `list-3.tsv` (notices and patch notes)
- `manifest.jsonl`: one line per file, as `{file,url,captured_at,source_id,tool}`. `captured_at` is the file's write time in UTC.
- Helper scripts, not captures: `nv.mjs`, `manifest.mjs`, `grab.sh`, `ytdesc.mjs`. The contact sheets used to identify icons are `sheet.png` and `pets.png`, built from the repo's icons.

**Capture notes**
- `pnpm capture naver fetch` only writes into a record's `evidence/`, so I didn't use it. `nv.mjs` copies its API calls.
- I deleted sticker images that came back empty.
- The YouTube frames came from the `<video>` element via canvas in agent-browser. They show the deck and burned-in subtitles; there is no audio transcript.

## Decks (all cookies Lv100 unless noted; dates in KST)
Mercenary perks (복지) used below:
- 방특 (armour repair special): 3+ tanks → ally damage reduction +10%
- 의료보험 (medical insurance): 2+ supports → max HP +5%
- 열페 (열정페이, passion pay): highest-ATK ally +20% ATK, −20% max HP
- 초고속 승진 (express promotion)

The perk text comes from the screenshots in nv:48174 and nv:46544.

| src | date | stage | power (rec.) | auto | 12 cookies | captain | pets | perks / preset | mechanism, notes |
|---|---|---|---|---|---|---|---|---|---|
| nv:47333 롤로노아 | 09-29 | 683 | 4.08G (5.05G) | yes, "타율 괜찮" | 마카롱 치케 피겨여왕 락스타 들개 허브 / 시커 석류 치약초코 우유 이온 달토 | 우유 | 얼음과자새20, 초코왕방울20, 핫도그20 | Guild Conquest (토벌) preset | "Only Brightseeker needs to live". Stuck → swap 피겨 for 포도넝쿨. |
| nv:48705 비쿠 (deck repeated in nv:49847 img7) | 10-02 | 724 (video) | 4.5G (img7) | labelled 오토덱 in 49847; commenters cleared hands-off | 시커 치케 석류 포도넝쿨 라임 락스타 우유 들개 이온 허브 다크초코 달토 | 우유 | 초코왕방울, 얼음과자새, 핫도그 (49847 variant: 털뭉치멍뭉이 instead of 핫도그) | support HP+5% + DR10% (의료보험 + 방특); "스테이지" preset in video | Not working → drop 닼초 for 피겨, or use a projectile-speed pet. Comments: Brightseeker 4★ works for one player; another fails at 698 with 6★ and says +20 gear is needed. |
| nv:48828 가방은 항상 두개 (deck = nv:49847 img8) | 10-02 | 716 | 4.54G | semi | 마카롱 시커 치케 석류 피겨 라임 락스타 우유 들개 이온 허브 달토 | 우유 | 얼음과자새, 갓난갓방울, 초코왕방울 | 열페 + 3-tank DR; preset "아레나&토벌전" | No control early. After 달토 skill go down, keep nudging down to catch Milk's skill, enter at 48s; goal is keeping Brightseeker alive. Comment: 2nd hit comes at 48s and 38s. |
| nv:49978 하츠 | 10-06 | 659 (video) | – | semi | 시커 치케 석류 피겨 포도 라임 락스타 우유 들개 이온 허브 달토 | 우유 | 뽀글방울, 핫도그, 얼음과자새 | 방특/열페; preset "뻥투력" | From 655, drag the first row a little so 포도넝쿨 isn't hit, then go hands-off at the 2nd row. Shield-and-stack in the centre or re-entering both failed. |
| nv:47793 용사맛 쿠키 (text only) | 09-30 | 651 | 2.97G | yes, "난 오토 되는데? → 투력이 남는거" | 마카롱 시커 치케 석류 피겨 락스타 우유 들개 이온 체리콜라 허브 달토끼 | 우유 | 뽀글방울 (초코왕방울 if Lv20), 얼음과자새, 핫도그 | 방특 + 열페 | Auto fails → go in after the 2nd slam. Under 50% boss HP even then → raise power. |
| nv:48076 튜브1919 | 09-30 | 632 | 1.79G (2.97G) | yes, "놔두면 대체로 원트" | 시커 호밀 석류 락스타 들개 허브 / 전갈 Lv80, 치케 포도 우유 이온 달토 | 우유 | 얼음과자새20, 초코왕방울10, 색동주머니12 | 방특 + 의료보험 | Comments: one says a single hit-and-run is still needed; 1.2G at 595 fails; 이온 and 락스타 sugar runes matter. No 초코왕방울 → maybe an SR slime pet. |
| nv:46250 도미 | 09-26 | 605 | 1.55G (2.25G) | yes, "No손컨" | 마카롱 치케 피겨 락스타 들개 딸기크레페 / 시커 석류 포도 우유 이온 Lv95, 허브 | 우유 | 초코왕방울10, 핫도그20, 얼음과자새19 | DR + 5% HP (방특 + 의료); gear per nv:44654: Conquest preset, skill haste (스가) / skill amp (스증) / crit dmg (치피) | Shields block the damage. 3 tanks for the perk; the rest healers and Brightseeker buffers; other dealers unneeded. Skill-amp pets beat ATK pets (갓방울). 이온 kept at 95 so it stops stealing 석류's buff from Brightseeker. Manual control makes it worse. Comments: needs plates at all +15 or more. |
| nv:46707 푸에리 | 09-27 | 583→601 | 1.27G→1.38G | yes | 마카롱 치케 피겨 라임 들개 허브 / 시커 석류 포도 우유 이온 달토 | 우유 | 갓난갓방울20, 핫도그20, 얼음과자새19 | 방특 + 열페 | Brightseeker as sole dealer gave the fewest retries; keep him even at low stars. Brightseeker dies → retry. |
| nv:45715 하츠 | 09-24 | 566→581 | – | yes | 시커 호밀 석류 라임 들개 허브 / 전갈 치케 포도 우유 이온 달토 | 우유 | 핫도그, 갓난갓방울, 색동주머니 → at 581: 얼음과자새, 색동, 뽀글 | 의료 + 방특 (in comments: 방특 + 열페) | – |
| nv:45541 행운쿠키 | 09-24 | 554 | 1.33G (1.32G) | yes | 시커 석류 포도 락스타81 들개96 허브 / 전갈 피겨 라임99 우유 이온91 달토 | 우유 | 얼음과자새19, 갓난갓방울, 핫도그 | – | – |
| nv:43827 눈 | 09-21 | 524 | 795M (973M) | yes, 3–4 retries per run | 마카롱 전갈 피겨 우유 이온97 허브 / 시커 석류 락스타 들개 딸크 다크초코 | 우유 | 초코왕방울10, 와사비문어20, 핫도그19 | 초고속 승진 + 방특 | No 초코방울 pet → 얼음과자새. Also lists coin, dough, research-stone and sugar-rune auto decks. |
| nv:48174 동농까마귀 | 10-01 | – | – | partial | deck not shown | – | 꼬마유령 (knockback resistance) | 방특 + 의료 | Not a sure auto clear: 20+ tries for 9 runs. |

**Manual or hit-and-run decks (for completeness)**
- nv:48303 쿠크다스s004, 657, 2.61G: 시커 치케 피겨 라임 들개 허브 / 전갈 석류 포도 우유 이온 달토. Pets 핫도그, 뽀글방울 (interchangeable with 초코왕방울), 얼음과자새. Hit once and pull to 7 o'clock. Take buffs at 53s. Enter between book rows 1–2 at 47.5–47s, pull out after Brightseeker's 2nd drone, re-enter at 32s.
- nv:46851 서신우 (YouTube FhBEadxPWWs), 638, 2.67G: 마카롱 석류 포도 락스타 들개 허브 / 시커 피겨 라임 우유 이온 달토. Pets 갓난갓방울, 와사비문어, 초코왕방울. Hands-off at the start; recover outside the books, re-enter on the next turn.
- nv:46607 서신우, 2.58G: 시커 치케 포도 락스타 들개 허브 / 전갈 석류 라임 우유 이온 달토. Pets 갓난갓방울, 초코왕방울, 얼음과자새. 방특 + 의료. Hands-off, pull back when pushed, re-enter.
- nv:45930 서신우, 606, 2.25G: 마카롱 전갈 석류 라임 들개 허브 / 시커 메론소다 포도 우유 이온 달토. Pets 갓난갓방울, 초코왕방울, 얼음과자새; use a survival pet instead of 전지멜로우. Mentions Princess Bari's knockback immunity.
- nv:46895 YOLO2, 679, 3.12G: 시커 전갈 석류 락스타 들개 허브 / 호밀 치케 피겨 우유 이온 달토. Pets 얼음과자새, 초코왕방울10, 갓난갓방울. Pull back to the 2nd book, go in at 47–48s on the double push.
- nv:46544 고기파이, 578, 1.11G, hit-and-run. Cookies: 마카롱 호밀 석류 포도90 우유 이온90 / 시커 치케 피겨 락스타70 들개 허브. Pets 갓난갓방울, 핫도그, 와사비문어 (all damage). 열페 + 의료.
- nv:46179 고기파이, 557, 1.07G, manual. 피노누아 and 다크초코 in; 감초 and 바리 out. Daily preset: hit (명중) 1000+ with 스가 / 스증 / 피감 / 치피 / 치확.
- nv:45344 연두 (526), early.

**Posts covering other daily dungeons**
- nv:43827, nv:47793, nv:48344, nv:49847: all of them (coin, dough, research stone, rune crystal, sugar rune).
- nv:46179: EXP + research stone.
- nv:46607, nv:48705: EXP + dough.

## Consensus core (auto decks at 600+)
- **In every deck:** 브라이트시커 (sole carry; Light hits the boss's weakness), 바삭튼튼 소아과 의사 우유 (always captain), 석류, 이름 모를 케이크 들개, 이온맛 쿠키로봇, 허브.
- **In nearly every deck:** 치즈케이크; 감감술래 달토끼 (all but nv:46250). The tanks are there to turn on the 3-tank DR perk.
- **Most decks:** 락스타 (the shield in 도미's "block it with shields" deck, nv:46250 / nv:49978).
- **Flex slots (2–3):** 마카롱, 피겨여왕, 포도넝쿨, 라임, with 다크초코, 치약초코, 체리콜라 or 딸기크레페 as variants.
- **Pets:** 얼음과자새 plus 초코왕방울 and/or 핫도그도그; 갓난갓방울 or 뽀글방울 as alternates.
- **Perks:** 방특 plus 열페 or 의료보험.

## Disagreements
- **Extra dealers.** 호밀 and 전갈 appear in nv:48076, 45715, 46895. nv:46250 and nv:46707 say a Brightseeker-only deck is more stable.
- **달토끼.** 도미 skips it (nv:46250). 고기파이 asked whether its debuff even lands; 용사맛 쿠키 says it works but isn't displayed (nv:48705 comments).
- **Pets.** Skill amp over ATK (nv:46250), all-damage pets (nv:46544), or survival pets (nv:45930, nv:43827).
- **Last perk.** 열페 or 의료보험.
- **Preset.** Guild Conquest (nv:47333, nv:44654), Arena (nv:49847, nv:48828), or a dedicated daily preset with 1000+ hit (nv:46179).
- **Can it be fully auto at all?**
  - nv:46250 says manual control hurts.
  - nv:46179 says low-power or later-server accounts can't clear without control.
  - nv:46895: "권투보다 높아도 컨 안하면 녹음" (even above recommended power, no control and the team melts).
  - nv:47793: auto works only with power to spare.

## Boss mechanics (악몽을 꾸는 도서관 사서, Nightmare-ridden Librarian)
- **Element:** Dark, weak to Light. Every stage-select screenshot shows a moon element and a sun weakness (nv:46250, 47333, 48076 …).
- **Same boss at every stage and date.** Every capture from 09-21 to 10-07, stages 524–724, shows it. The daily-dungeon menu (nv:46895 img1) gives each dungeon a fixed boss and element (EXP dark, coin light, dough water). No source shows a daily or per-stage rotation.
- **Timer and slams:** a ~58s timer. A 1st slam at ~53s (nv:48303; nv:45882 says ~49s), then a double push/slam ("2쿵쿵") at ~48s. The usual entry window is 47–48s, right after it (nv:46179, 48303, 46895, 48828, 46205). Another hit around 38s (comment on nv:48828), re-entry at ~32s (nv:48303).
- **Pushes:** a push ("밀격") every ~4s (nv:46851 video). It shoves the team out of the book ring; the team heals safely outside the books (nv:46851). Knockback resistance or immunity helps: Bari (nv:45930), the 꼬마유령 pet (nv:48174).
- **Books:** book circles / inner-book attack (nv:45882; nv:50417).
- **What fails runs:** Brightseeker or Milk dying means retry (nv:46544, nv:46707). Watch Milk's HP (nv:45882).
- **Recommended power by stage, from screenshots:**

| stage | rec. power | source |
|---|---|---|
| 524 | 973M | nv:43827 |
| 554 | 1.32G | nv:45541 |
| 578 | 1.7G | nv:46544 |
| 601 | 2.16G | nv:46707 |
| 632 | 2.97G | nv:48076 |
| 657 | 3.85G | nv:48303 |
| 679 | 4.84G | nv:46895 |
| 683 | 5.05G | nv:47333 |

  Nothing captured shows 700+. Players at 716–724 run 4.5G-class decks, so auto at 700 means running below recommended power.
- **10/8 nerf** (nv:50417, posted 10-07): lower base ATK, longer cooldown on the push AoE, smaller inner-book range. Dough and research-stone dungeons are eased too. The 10/1 notice (nv:48486) first promised daily-dungeon easing. 49847's 500→350 figure is unofficial.

**Gaps**
- Videos were read only as thumbnails or frames. nv:45715, 49978, 48828 and 48705 show their deck in the thumbnail.
- 48705 never says "auto" in its own text; only 49847's label and the comments do.
- Nothing posted 10-03→10-07 shows a new full-auto deck at 700+. The newest are nv:49978 (semi, 659) and the nv:49847 summary.