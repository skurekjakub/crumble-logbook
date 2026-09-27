# Extraction brief: PvP (shared by every research lane in record 002)

Game: Cookie Run: Crumble (쿠키런: 크럼블). Modes: **Arena** (아레나, regular PvP) and **Rumble Arena** (럼블 아레나, the new mode). Tag every item with its `mode`: `arena`, `rumble_arena`, or `both`. The user has every cookie built and wants reproducible top teams and counters. KR and Global run the same version (client 1.4.002 as of 2026-09-23).

## What to pull out, in priority order

1. **Teams**: every cookie (Korean name exactly as written), level (Lv.1 fillers are deliberate), stars, position/row/slot in formation, role in the team, pets, perks (용병단 복지), and the reason for each choice. Flag unorthodox choices.
2. **Counters**: which team beats which, and why (the mechanism: burst vs sustain, lift/knockback, CC, range, element, targeting). Record "X beats Y" edges with their conditions (power gap, stars, specific cookie).
3. **Builds per cookie** for PvP: sugar-rune lines (스증, 스가, 공증, 치확, 치피, 피감, 체력, 방어, 치저, 집중, 저항, 명중, 회피, 이속…), gear substats per slot, and target thresholds. Note where PvP differs from PvE/raid, and arena presets (장비 프리셋).
4. **Mechanics that decide PvP**: targeting rules, who hits first, move speed and positioning, lift/knockback resistance, CC immunity, shields, healing reduction, PvP damage modifiers, and the power-gap penalty (전투력 보정, PvP brackets).
5. **Rumble Arena rules**: format, team size, bans/picks, rounds, timers, rewards, season structure, and what makes it different from Arena.
6. **Rankings and results**: win rates, usage rates, top-player teams (crumb.gg Rumble Arena board, arena stats), power levels, dates.
7. **Disagreements**: record both sides.

Read every image in a post (`img/` beside the .md). Formation and result screenshots carry levels, stars, pets and positions. **Transcribe what the image shows; don't guess.** Write `"?"` for what you can't read.

## Output: one JSON file per lane at the path your task names (UTF-8, valid JSON)

```json
{
  "batch": "<lane>",
  "mode_scope": "arena|rumble_arena|both",
  "posts": [
    {
      "source": "dc|naver|other", "id": "…", "url": "…", "date": "YYYY-MM-DD",
      "title_kr": "…", "title_en": "…", "relevance": 0, "mode": "arena|rumble_arena|both",
      "summary_en": "2–4 sentences",
      "teams": [{ "name": "…", "mode": "…", "cookies": [{ "kr": "…", "en": "…|null", "level": "…", "stars": "…", "position": "…", "role": "…", "note": "" }],
                  "pets": ["…"], "perks": "", "formation": "", "why": "", "unorthodox": [""] }],
      "counters": [{ "team": "…", "beaten_by": "…", "mode": "…", "why": "", "conditions": "" }],
      "builds": [{ "cookie": "…", "mode": "…", "sugar_runes": "…", "gear": "…", "why": "" }],
      "mechanics": [""], "rules": [""], "results": [{ "team": "…", "win_rate": "", "usage": "", "power": "", "note": "" }],
      "disagreements": [""], "quotes": [{ "kr": "verbatim line", "en": "translation" }]
    }
  ],
  "glossary": [{ "kr": "", "en": "", "kind": "cookie|pet|stat|slot|term", "confidence": "high|low", "evidence": "" }]
}
```

`relevance` runs 0–3 (0 = off-topic or recruitment; 3 = a guide or measured data). Glossary: reuse `research/001-guild-conquest-meta/evidence/12-glossary.json` (e.g. 정전 = Tiger Lily, 실론 = Tea Knight, 피겨 = Skating Queen, 브시커 = Brightseeker); add only new names.
