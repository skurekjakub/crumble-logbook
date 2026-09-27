# KR high-score levers: raising the median (not just the peak), Cherry deck

Captured 2026-09-27. Question: beyond luck/retries, what specific tech pushes a
Cherry-deck run from a ~550G median (2.2G team power, ~250x) toward 1-1.5T+,
and what separates a 600-780x run from a 250x run at similar power? New posts
are in `17-kr-highscore/dc/` and `17-kr-highscore/nv/`; extraction is
`08-extract/kr-highscore.json` (`levers` array has the machine-readable form).

## Levers ranked by evidence strength

### High confidence

1. **ATK-order discipline, checked in-battle, not just in the lobby.** Every
   non-carry cookie (fillers, Scorpion, Dark Choco) must sit strictly below
   the six named buffers (Milk-Brightseeker-Macaron/Skating Queen-...-Tea
   Knight-Cheesecake) in ATK, or it silently steals Pomegranate's beam. One
   player's forgotten Scorpion level (not reset after an experiment) was
   capping their score below 400x; resetting it alone got them to 400x
   immediately. `dc:74994`, `dc:74911`, `dc:75400`, `dc:76135`.
2. **Brightseeker's 5-star "6th drone" is a hard gate, not a nice-to-have.**
   Community consensus is you cannot reach ~500x without it. `dc:74911`.

### Medium confidence

3. **Convert non-Milk cookies from ATK% to skill amp once the ATK order is
   locked.** A documented account at 1.88G power / 500G damage (265x) on an
   ATK%-heavy build was projected by its own author and by commenters to
   reach ~600-700G (~372-460x) on the same or lower power by switching to
   skill amp and fixing the ATK order — i.e. the SAME account, same power
   tier, nearly double the multiple from a stat-quality change alone.
   `dc:70064`. Disagreement: the author questions whether the sugar-rune
   reroll cost is worth it for someone already deep into ATK%; two commenters
   (including a recognized poster, 캔디애플) say switching is objectively
   worth it, especially for anyone not yet fully invested.
4. **Skill haste has a low ceiling on multi-hit ("연타") dealers** (named:
   Cherry Cola/딸크, Dark Cacao/호두) because their real attack rate is capped
   by the combo animation, not the nominal cooldown haste shortens — skill
   amp is the better investment for those specific cookies. This does NOT
   apply to Brightseeker (single-cast; the existing ~40-haste breakpoint
   model still holds). `dc:68867`.
5. **Score variance (30x-500x+ on similar accounts) is explained by the
   *conditional* nature of the Milk/Pomegranate/Macaron/Tea Knight buffs**,
   not primarily by raw stat gaps: because these buffs only land on the
   correct cookie by ATK order or formation, score measures "how well the
   buff chain landed this run" as much as it measures investment. This is
   the community's own explanation for why the same account can swing from a
   ~550G median to a 1T+ peak. `dc:69923`; corroborated by one account's own
   4-5G floor vs 14.4G peak, `dc:71066`.
6. **Survival past the 17s wipe needs a specific 3-pet combo, not just
   HP/DR runes**: Choco King Bell (raw HP) + Ice Bird + Candy Shade Pouch
   (lift resistance + HP) is called the emerging "survival meta"; Candy
   Shade Pouch's 30% lift resistance alone (without Pinot) was shown
   insufficient in a direct test. Reconfirms the dashboard's existing ~9M
   HP / 45% DR threshold. `dc:72559`, `dc:73742` (new); `dc:74801`,
   `dc:69856` (existing).
7. **Move-speed-tuned formation (Melon Soda-style) has a materially higher
   ceiling than Cherry's forced-line formation at equal power** — multiple
   posters say this outright while admitting they stay on Cherry because the
   tuning is too fragile to reliably execute. This is a real lever left on
   the table by risk-averse players, including a 10-star-Brightseeker,
   463x account. `dc:71110`, `dc:74994`.

### Lower confidence / single-source, worth checking against the datamined formula

8. **Pet star investment (Candy Shade Pouch) has sharply diminishing returns
   past 10-15 stars** — direct contradiction of "grind pet stars for more
   damage." Community consensus (4 replies) is 10-15★ is enough; nobody
   argues for 20★. `dc:74440`.
9. **Macaron's own skill amp ≈ +1.1% ally crit rate per 1% skill amp**
   (unverified single claim, agreed to in-thread by others but no independent
   second source). `dc:69390`.
10. **Milk's star-breakthrough investment may matter more than Brightseeker's
    late stars**: one account felt Brightseeker 7★→8★ gave only ~10% (on a
    ~340G baseline) while Milk's own star-up felt bigger. Single data point.
    `dc:71155`.
11. **Lab HP research, independent of runes/gear, raises 30s-slam survival**
    — a lever not previously logged in the dashboard's mechanics/gear notes.
    `dc:67350`.
12. **A pre-nerf (8/23, before the 8/27 skill-amp change) reverse-engineered
    exchange rate**: 1% ATK% ≈ 0.617% skill amp in damage terms, derived
    against a Stage boss. Likely stale for the current raid meta — flagged as
    a historical baseline, not a live number. `nv:24362`.

## Contradicts "it's mostly luck + retries"?

Partially, in a specific way: the *floor-to-peak spread on a single account*
does look like it's dominated by conditional-buff RNG (lever 5), which is
consistent with "luck and retries." But several of these levers are
non-luck, one-time fixes that raise the WHOLE distribution rather than just
letting you fish for a lucky run: fixing a stray filler level (`dc:74994`,
immediate +100x-ish), hitting the Brightseeker 5-star drone gate (`dc:74911`),
and converting stat allocation to skill amp (`dc:70064`, up to ~2x on the
same account) are all deterministic, verifiable, and don't require more
retries — they require checking the build. The community's own framing in
`dc:69923` is the most useful reconciliation: retries matter because the
buffs are positional/conditional, but the WIDTH of your floor-to-peak range
(and therefore how many retries you need) is itself a function of how well
the build is tuned.

## Coverage note

35 new posts read this session (34 DC, 1 Naver); stopped here because new
searches (2nd round of DC list queries) started returning mostly Stage/Arena
content or posts already captured, matching the stop condition. DCInside had
a ~10-minute total outage mid-session (all requests time out); retried
successfully afterward, no data lost.
