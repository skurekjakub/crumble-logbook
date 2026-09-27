# 03-sites: capture sources

Lane: structured data from stats and datamine sites. Every file here is the response body exactly as fetched (curl or urllib, `User-Agent: Mozilla/5.0 ...`, no auth, no cookies), except the one marked "rendered", which is the page text read from a headed agent-browser session. Times are UTC fetch times.

| File | URL | Fetched (UTC) | Notes |
|---|---|---|---|
| `crumbgg_pub-live-rumble_arena.json` | https://crumb.gg/pub/live?board=rumble_arena | 2026-09-27T14:34:16Z | Body `fetched_at` 2026-09-27T14:33:45Z. Top 100, 12-slot `grid`, `team`, `pets`. |
| `crumbgg_pub-stats.json` | https://crumb.gg/pub/stats | 2026-09-27T14:34:18Z | The Rumble Arena tab's "arena stats" (top-100 cookie and pet counts). |
| `crumbgg_pub-live-history-rumble_arena-2000h.json` | https://crumb.gg/pub/live-history?board=rumble_arena&hours=2000 | 2026-09-27T14:34:29Z | 480 snapshots, rows `[id, name, rating, rank]`, no teams. |
| `crumbgg_pub-leaderboard.json` | https://crumb.gg/pub/leaderboard | 2026-09-27T14:34:32Z | Combat-power top 500 (not mode-specific). |
| `crumbgg_data-meta.json` | https://crumb.gg/data/meta.json | 2026-09-27T14:34:34Z | Cookie/pet/perk id to name map (client 1.4.002). |
| `crumbgg_api-lookup-suggest_rumble-rankNN.json` | https://api.crumb.gg/api/lookup/suggest?q=<name> | 2026-09-27T15:11:45Z to 15:12:47Z | One per Rumble top-20 player (NN = rank at 14:33Z): account level, server, guild, `cp`. Rank 14 returned no player. Names with several matches were disambiguated by guild. |
| `cookieruncrumble_app_api_pvp-signals.json` | https://cookieruncrumble.app/api/pvp-signals | 2026-09-27T14:41:31Z | `{"cookies":{}}`: empty. |
| `cookieruncrumble_app_api_decks.json` | https://cookieruncrumble.app/api/decks | 2026-09-27T14:41:34Z | Community decks (all modes; PvP ones tagged `category: pvp`). |
| `cookieruncrumble_app_pvp.html` | https://cookieruncrumble.app/pvp/ | 2026-09-27T14:41:36Z | Client-rendered shell. |
| `cookieruncrumble_app_pvp_rendered.txt` | https://cookieruncrumble.app/pvp/ | 2026-09-27T15:11:07Z | Rendered, via agent-browser (headed Chrome), as printed by `agent-browser read`. |
| `cookieruncrumble_app_tier.html` | https://cookieruncrumble.app/tier/ | 2026-09-27T14:41:40Z | Pre-rendered general tier list (aggregated 2026-09-27T14:40:03Z). |
| `cookieruncrumble_app_rune-recommendations.html` | https://cookieruncrumble.app/rune-recommendations/ | 2026-09-27T14:58:05Z | Embeds `<script id="public-rune-snapshot">` JSON. |
| `crumblehub_api_clear-decks_arena.json` | https://crumblehub.co/api/clear-decks?mode=arena&sort=recommended&limit=50&roster=4 | 2026-09-27T14:47:27Z | Page 1 of 4 (server returns 24 per page, total 80). |
| `crumblehub_api_clear-decks_arena_p2.json` .. `_p4.json` | same URL plus `&cursor=<nextCursor of the previous page>` | 2026-09-27T14:50:34Z, 14:50:38Z, 14:50:43Z | The cursor strings are in each previous page's `nextCursor`. |
| `crumblehub_api_clear-decks_rumble_arena.json` | https://crumblehub.co/api/clear-decks?mode=rumble_arena&sort=recommended&limit=50&roster=4 | 2026-09-27T14:47:30Z | `{"error":"Invalid mode"}`: crumblehub has no Rumble mode. |
| `crumblehub_api_meta-decks.json` | https://crumblehub.co/api/meta-decks | 2026-09-27T14:47:34Z | Curated decks; category `arena` has the Rye and Espresso decks. |
| `alkapa_option-consult_ko.html` | https://alkapa.gg/lab/crumble/option-consult | 2026-09-27T14:52:31Z | States that it's PvE only (see SYNTHESIS). |
| `crumbleguides_arena.html` | https://crumbleguides.com/guides/cookie-run-crumble-arena | 2026-09-27T14:56:53Z | Placeholder guide, no data. |

## Tried and not kept (the response carried no mode data)

- https://crumb.gg/pub/live?board=arena: 404 `{"error":"not found"}` (14:34:21Z).
- https://crumb.gg/pub/rankings?kind=arena and `kind=rumble_arena`: 200 but the body is the guild rankings (`"kind":"guilds"`), identical for both (14:34:24Z, 14:34:26Z).
- https://alkapa.gg/lab (14:52:36Z) and https://crumbleguides.com/guides/cookie-run-crumble-crumb-clash (14:56:56Z): off-topic.

## Id maps used (not captures)

- crumb.gg ids: `crumbgg_data-meta.json` (`key` joined to `resource_key` in `research/001-guild-conquest-meta/evidence/12-glossary.json` for Korean names).
- crumblehub cookie/pet indexes: the order of the `{grade,name,image}` arrays in https://crumblehub.co/assets/CookieCodex-CfPeHG29.js and https://crumblehub.co/assets/PetCodex-B-Ms2Wi8.js (fetched 2026-09-27 ~14:45Z; the copies in record 001's `12-glossary-src/` are the same builds).
- Sugar Pocket cookie ids: `rows[].id` in the rune snapshot above. Pet ids: the `{"id":N,...,"resourceKey":"petNNNN","name":{"ko":...}}` entries in https://cookieruncrumble.app/sugar-pocket/assets/index-CAL2QT8S.js (the same build as the local copy at `C:\Users\skure\crumble-re\crc\index-CAL2QT8S.js`).
