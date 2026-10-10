# Extraction brief: record 005, round 2026-10-10

The DCInside lanes (`dc-*.json`) were written by Opus subagents, one batch of posts each, from the posts in `../02-dc/dc/` and their local images; the session agent wrote `naver.json`, `youtube.json` and `sites.json` from `../03-naver/nv/`, `../05-youtube/` (watch digests, frames and subtitle-band sheets) and `../04-sites/`, `../06-store/`.

The shape is the first round's (`../../08-extract/BRIEF.md`) with one added list per post:

```json
"damage": [{ "system": "…", "mode": "conquest|arena|rumble|rift|stage|crumble_dungeon", "text": "what it says raises or doesn't raise damage, with any figure" }]
```

This round asks, beside team power, which upgrade systems raise damage in Guild Conquest, PvP, the Rift and the Crumble Dungeon.

- `system` is a power source id from `../../../curated/power-sources.json`, `spending` for a package or purchase order, or `account` for an account snapshot.
- `relevance`: 0 off topic; 1 a mention or opinion; 2 a stated figure or reasoned priority; 3 a guide, a measured before/after, or game data on screen.
- Figures are copied as written; a figure the poster infers, remembers or guesses is marked in `note`, with the kind of power (team or account total) when the post says it.
- Comments are quoted as "(comment) …". No player nicknames or guild names.
- `youtube.json` posts carry `source: "web"` and `id: "yt-<video id>"`, and `naver.json` posts `source: "naver"`, so the importer keys their summaries as the curated `web:yt-<id>` and `nv:<id>` sources.
