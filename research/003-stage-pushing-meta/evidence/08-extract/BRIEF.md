# Extraction brief: stage pushing (shared by every lane in record 003)

Game: Cookie Run: Crumble (쿠키런: 크럼블, 쿠키런 키우기). Scope: **main stages** (메인 스테이지, chapter-stage labels like `243-30`; 30 stages per chapter, 328-30 the last since 2026-09-10) and the **Dimensional Rift** (차원의 이면, 이면; seasonal boss-only levels 1–200 opened 2026-09-23 for players who cleared 328-30). Daily dungeons (일일 던전, 경던/코던/반죽/연구석/룬결정) and the Implant Tower (임플란트 타워) are out of scope except where a post compares them to stages. Tag every item with its `scope`: `stage`, `rift`, or `both`.

The user has a whale account with every cookie built (a 2.2G conquest team) and wants the tryhard KR tech for pushing stages **while under-powered**: the power gate (전투력 보정, 권장 전투력 = recommended power, 권투/권투력 for short) multiplies final damage by a bracket of team power ÷ recommended power: <10% → 1%, ≥10% → 5%, ≥20% → 15%, ≥40% → 35%, ≥60% → 55%, ≥80% → 75%, ≥100% → 100%, ≥120% → 120% (crumblehub). The community calls a bracket by its damage: "35% 단" (pushing at 40–59% power), "15%" or "15퍼" (20–39% power), "55%". The user cares most about the **35%** and **15%** brackets.

## What to pull out, in priority order

1. **Clears and attempts at a bracket**: stage label, boss (비겁이 = 비겁한 쿠키 Coward Cookie, 쿨민 = 쿨링민트, 쥐토바이/바이커/폭주단, 트럭, 망치공주, 그루터기, 레드베리 암살자, 독수리, 케이크 들개떼, …), team power (as written: "693.5m", "1G63M", "4g"), bracket (35/15/55…), cleared or failed, auto (오토/방치) or manual (손컨), retries, date. A "record" is the lowest power or lowest bracket for a stage.
2. **Teams**: every cookie (Korean name exactly as written), level (Lv.1 fillers are deliberate), stars (성), position/slot, role, pets, perks (용병단 복지, e.g. 열정페이, 초고속승진), captain (단장), the reason for each choice, and which bosses or stage types it is for. Flag unorthodox choices. Note what a missing cookie is replaced with.
3. **Builds for stages**: sugar-rune lines (스증, 스가, 공증, 치확, 치피, 피감, 명중, 집중, 치저, …), gear substats per slot for the stage preset (장비 프리셋), and thresholds (e.g. 명중 1200). Note where the stage build differs from arena/conquest.
4. **Mechanics**: the power gate and what it does and does not affect (boss damage to you, stats), accuracy (명중) and focus (집중) requirements per stage, boss behaviours that decide a clear (fleeing, knockback, adds), the 2026-09-23 relief (what changed: recommended power, HP/ATK multipliers, bosses), the Rift's rules (차원의 힘 level, whether the power gate applies there, 무한바퀴 pet, fragments, rankings), when to push vs park (주차) vs farm.
5. **Stage-type play**: how the team or play changes for single boss vs multi-mob (잡몹) stages, specific bosses, elements.
6. **Disagreements**: record both sides with who said what.

Read every image in a post (`img/` beside the .md): formation, result and power screenshots carry levels, stars, pets, team power and the bracket shown in battle. **Transcribe what the image shows; don't guess.** Write `"?"` for what you can't read.

## Output: one JSON file per lane at the path your task names (UTF-8, valid JSON)

```json
{
  "batch": "<lane>",
  "posts": [
    {
      "source": "dc|naver|youtube|other", "id": "…", "url": "…", "date": "YYYY-MM-DD",
      "title_kr": "…", "title_en": "…", "relevance": 0, "scope": "stage|rift|both",
      "summary_en": "2–4 sentences",
      "clears": [{ "stage": "243-30", "boss": "…", "team_power": "…", "recommended_power": "…", "bracket": "35|15|55|…|?",
                   "result": "clear|fail|?", "play": "auto|manual|?", "retries": "", "team": "name of a team below or ''", "note": "" }],
      "teams": [{ "name": "…", "scope": "…", "for": "which stages/bosses/brackets",
                  "cookies": [{ "kr": "…", "en": "…|null", "level": "…", "stars": "…", "position": "…", "role": "…", "note": "" }],
                  "pets": ["…"], "perks": "", "captain": "", "formation": "", "why": "", "substitutions": [""], "unorthodox": [""] }],
      "builds": [{ "cookie": "…", "scope": "…", "sugar_runes": "…", "gear": "…", "thresholds": "…", "why": "" }],
      "mechanics": [""], "rift": [""], "stage_types": [""], "disagreements": [""],
      "quotes": [{ "kr": "verbatim line", "en": "translation" }]
    }
  ],
  "glossary": [{ "kr": "", "en": "", "kind": "cookie|pet|stat|slot|term|boss", "confidence": "high|low", "evidence": "" }]
}
```

`relevance` runs 0–3 (0 = off-topic or recruitment; 3 = a guide, a documented clear with team and power, or measured data). Skip posts at relevance 0 with a one-line entry. Glossary: reuse `research/001-guild-conquest-meta/evidence/12-glossary.json` and `research/002-pvp-meta/curated/glossary.json` (e.g. 정전 = Tiger Lily, 실론 = Tea Knight, 피겨 = Skating Queen, 브시커 = Brightseeker, 바리 = Princess Bari); add only new names, bosses included.
