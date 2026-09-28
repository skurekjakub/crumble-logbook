# Research trail — 005 team power growth

The web rounds (iterative-research: three rounds of three WebSearch queries), run 2026-09-28. Search results are leads, not findings: every claim that reached the README was captured into `evidence/` first. The DCInside, Naver cafe and YouTube searches ran through the capture tools and are listed in `evidence/02-dc/*.tsv`, `evidence/03-naver/01-nv-guide-menu9.tsv` and `evidence/05-youtube/ytq-*.html`.

## Before the rounds: what the repo already gave

- Record 003's bracket table and its 2.2G reach (55% to 288-3, 35% to 304-19), and its "power is padded" practice.
- Record 002's captures of the cafe's intro guide (nv:33130) and newbie guidebook (nv:43444): the growth systems by name, what Arena applies, purchase tiers, Stellar shapes, plating order, shop orders.
- Record 001's Sugar Pocket game-data catalogs (game 1.4.002): level, star and plating curves, oven gear progression, collection boosts, rune reroll costs.
- `evidence/01-repo-grounding/repo-grounding.md` holds the locators.

## Round 1 — survey

Queries:
- 쿠키런 크럼블 전투력 올리는 법 성장 요소 효율
- Cookie Run Crumble how to increase combat power guide breakthrough stellar link gnome lab
- 쿠키런 크럼블 패키지 가격 효율 과금 추천

Synthesis: the KR query surfaced DC threads asking the same question (dc:23689, dc:17489) and generic guide sites; the English one surfaced global guide sites (cookieruncrumbles.com, cookierun-crumble.wiki) that restate the systems (Resolve, Fame, Gnome Laboratory, Stellar Link) with no numbers; the spending query surfaced crumblehub's spending guide with KRW budget tiers and its package value table (Crystal value per KRW), plus a DC "package value roundup" (dc:1905, which no longer loads; the gallery manager's later series dc:68116–68148 does). Strongest lead: crumblehub's `/api/efficiency` and the gallery's own threads for before/after numbers. Gap: USD prices and any measured power gain per system.

## Round 2 — deepen

Queries:
- Cookie Run Crumble best packages to buy USD "$4.99" OR "$9.99" sugarcoating membership pass value
- CookieRun Crumble Resolve Fame Gnome Laboratory Stellar Link power priority F2P guide
- 쿠키런 크럼블 도감 효과 전투력 펫 보유효과 동행효과 길드 연구소

Synthesis: Pocket Gamer's global pack guide (Ad Removal, Crumble Pass, "about $10 for both") but no per-item USD prices; the English progression guide restates priorities without figures; the collection query found namu.wiki's collection page, which returned a Cloudflare challenge in the browser and was not used (not circumvented). No site measures the guild lab. The measured gains all come from DCInside (dc:68732, dc:77329, dc:75684, dc:76718) and the patch digest (Resolve per-level values).

## Round 3 — verify

Queries:
- "Crumble" cookierun "Special Sugarcoating Membership" price $
- reddit CookieRunCrumble which packs are worth it permanent membership crumble pass price dollars
- 쿠키런 크럼블 길드 연구소 효과 전투력 증가량

Synthesis: the first query surfaced the App Store product page, whose top in-app purchases carry prices; captured for the US and KR storefronts, matching names give the KRW↔USD tiers (`evidence/07-derived/price-tiers.json`). No USD price for the 55,000 KRW membership exists on the open web; Reddit has nothing on packs. The guild lab's size stays a single claim (dc:76461: research 13 ≈ +20% total power); no web source quantifies it.

## After the rounds

- The plating odds table for 0→20 is an image in dc:53079, transcribed into `evidence/08-extract/plate-rates.json`; 20→25 and the restore costs come from the official notice reposted as dc:72150.
- crumb.gg's current patch digest (`evidence/04-sites/data-patches.json`) gave the Resolve, Fame, Gnome Lab and plating cap changes by date.
- Sugar Pocket's catalog API now answers 403 to plain requests; record 001's copies of the same game version serve.
- English subtitles hit YouTube's 429 limit after one video (`6DFlOgeXLds`); the other global videos are cited by title only or not at all.

## Final takeaways (each verified against a capture before use)

- Measured before/after gains: Stellar (dc:68732, dc:77329), plating (dc:75684), Resolve versus gear (dc:76718), gear rarity (dc:72901), the 2G → 4G path (dc:76290, record 003).
- Costs: plating odds (dc:53079, dc:72150), Stellar shapes (nv:43444, nv:5693, dc:55570, dc:56417), TSSR stars (dc:50913), KRW prices (crumblehub, App Store KR), USD prices (App Store US).
- Orders: the cafe guidebook (nv:43444), ND러너's and 서신우's videos, crumblehub's currency and plating guides.
