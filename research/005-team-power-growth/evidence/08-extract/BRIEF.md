# Extraction brief: team power growth (record 005)

Game: Cookie Run: Crumble (쿠키런: 크럼블, 쿠키런 키우기). Question: what raises team power (전투력; 팀투, 덱투, 파티투력 for the team, 총투 for the account total), at what cost, free and paid, and how efficiently at each account stage. Power matters because stages and the Dimensional Rift scale damage by team power ÷ recommended power in steps (record 003).

The extractions in this folder were written by the session agent (no subagents), reading every post in `../02-dc/dc/`, `../03-naver/nv/` and the subtitle files in `../05-youtube/`, plus the site captures in `../04-sites/` and `../06-store/`. A post that says nothing about power growth or spending is left out.

## Shape (one JSON file per lane)

```json
{
  "lane": "dc|naver|youtube|sites",
  "read": "YYYY-MM-DD",
  "posts": [
    {
      "source": "dc|nv|yt|web", "id": "…", "url": "…", "date": "YYYY-MM-DD",
      "title_kr": "…", "title_en": "…", "relevance": 1,
      "summary_en": "what the post says about power growth or spending",
      "datapoints": [{ "system": "…", "account": "stage, power, spend tier as stated", "before": "…", "after": "…", "cost": "…", "note": "" }],
      "advice": [{ "system": "…", "text": "…" }],
      "quotes": [{ "kr": "verbatim", "en": "translation", "at": "timestamp for video" }]
    }
  ]
}
```

- `system` is a power source id from `../../curated/power-sources.json`, or `spending` for a package or a purchase order.
- `relevance`: 1 = a mention or an opinion; 2 = a stated figure or a reasoned priority; 3 = a guide, a measured before/after, or game data.
- Power figures are copied as written (`1.5g`, `680m`, `2G 500M`). A figure the poster infers or remembers is marked in `note`.
- Video timestamps are the start of the subtitle paragraph the quote sits in (`../05-youtube/*.vtt`).
