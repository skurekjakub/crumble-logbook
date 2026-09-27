# Extraction brief (shared by every extraction subagent)

Record: `Games/crumble/research/001-guild-conquest-meta/`. Topic: **Cookie Run: Crumble, 길드 토벌전 (Guild Conquest / Guild Subjugation), boss 지나치게 무거워진 피냐타 (Extra Stuffed Piñata)**. The user has a whale account with every cookie built, and KR and Global run the same version. They want the tryhard KR tech that gets from ~1T to 2T+ damage.

## What to pull out, in priority order

1. **Sugar rune builds per cookie** for raids: the exact stats (스증 skill amp, 스가 skill haste, 공증/공퍼 ATK%, 치확 crit rate, 치피 crit dmg, 피감 dmg reduction, 치저 crit res, 집중 focus, 명중 accuracy, 체력 HP…), how many lines of each, and target thresholds (e.g. "시커 스가 45–50").
2. **Gear substats per slot**: 무기/왼쪽 위 (top-left), 방어구 (armor), 우상단 (top-right), 우하단 (bottom-right), and presets (장비 프리셋, added in the 9/23 patch). Note arena-vs-raid differences.
3. **Team compositions**: every cookie, its level (**Lv.1 fillers are deliberate**), stars, position/formation, pets (pet names + what they give), the **ATK-order (공격력 순서)** used to steer 석류 Pomegranate's buff (빨대), 복지/perks, and substitutions. Flag **unorthodox** choices explicitly (Lv.1 cookies, deliberately weak runes, Cherry used only for formation, etc.) along with the stated reason.
4. **Scores**: damage (G = 1e9, T = 1e12), team power (투력/전투력), the multiple 배 (= damage ÷ power), and what deck/rarity produced it. Keep each as a separate claim with its source.
5. **RNG**: how many retries (리트) people needed, variance between runs, what the random factors are (Pomegranate target, positioning, crit, Dark Choco debuff proc, Milk AI, the 17 s super-jump / 30 s slam wipe), and any "lottery deck" (로또덱) framing.
6. **Mechanics** people measured or datamined (클뜯): skill coefficients, skill-amp stacking, how Pomegranate picks targets, boss element (Dark → Light advantage), the 17 s / 30 s boss patterns, lift resistance (띄우기 저항).
7. **Disagreements**: when commenters contradict the author, record both sides.

Read every image referenced in a post (`img/` beside the .md). Team screenshots carry the levels, stars, pets and power, and rune/gear screenshots carry the exact stats. **Transcribe what the image shows. Do not guess.** If you can't read or identify something, write `"?"` and say what's visible.

Cookie names: keep the Korean name exactly as written, and add an English name only if you're sure (`"en": null` otherwise). Common gallery shorthand: 브시커/시커 = Bright Seeker, 석류 = Pomegranate, 우유 = Milk (Crunchy Strong Pediatrician alt), 마카롱 = Macaron, 피겨 = Skating Queen?, 치케 = Cheesecake, 실론 = Ceylon?, 전갈 = Scorpion, 메소 = Melon Soda, 체리/체콜 = Cherry / Cherry Cola?, 닼초 = Dark Choco, 피노 = Pinot Noir, 정전 = 정글전사 Jungle Warrior?, 바리/바궁 = Princess Bari, 달토 = Moon Rabbit, 판다 = Panda Dumpling pet, 색동주머니 = new pet, 와사비문어 = Wasabi Octopus pet, 핫도그 = Hot Doggie pet. Names with `?` are unconfirmed. Confirm or correct them from the images or context, and record corrections in `glossary`.

## Output

Write **one JSON file** at the path your task names (UTF-8, valid JSON, no comments):

```json
{
  "batch": "<name>",
  "posts": [
    {
      "source": "dc|naver|other",
      "id": "76135",
      "url": "...",
      "date": "2026-09-26",
      "title_kr": "...",
      "title_en": "...",
      "relevance": 0,
      "summary_en": "2–4 sentences",
      "scores": [{"damage": "700G", "power": "1.2G", "ratio": "700배", "deck": "체리덱", "note": ""}],
      "teams": [{
        "name": "체리덱", "cookies": [{"kr": "우유", "en": "Milk", "level": "100", "stars": "5", "note": ""}],
        "pets": ["와사비문어", "핫도그", "색동주머니"], "atk_order": ["우유", "브시커", "..."],
        "perks": "", "formation": "", "substitutions": [""], "unorthodox": [""]
      }],
      "sugar_runes": [{"cookie": "브시커", "stats": "스가 all (45–50%), rest 스증/치피", "why": ""}],
      "gear": [{"slot": "우하단", "substats": "스가 + 피감", "context": "raid", "why": ""}],
      "rng": [""],
      "mechanics": [""],
      "disagreements": [""],
      "quotes": [{"kr": "verbatim line", "en": "translation"}]
    }
  ],
  "glossary": [{"kr": "", "en": "", "kind": "cookie|pet|stat|slot|term", "confidence": "high|low", "evidence": ""}]
}
```

`relevance` runs 0–3 (0 = off-topic or a recruitment post; 3 = a guide or measured data). Include every post you were assigned, even the 0s, with a one-line summary. Put anything load-bearing in `quotes`, verbatim. Your final chat reply should be ≤10 lines: the path you wrote, how many posts had relevance ≥2, and the single most surprising finding. Don't recommend anything; you are extracting.
