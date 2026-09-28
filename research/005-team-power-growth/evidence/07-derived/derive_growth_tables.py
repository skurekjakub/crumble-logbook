"""Derive the growth tables of record 005 from captures already in the repo.

Run from the repository root:

    PYTHONIOENCODING=utf-8 python research/005-team-power-growth/evidence/07-derived/derive_growth_tables.py

Inputs (read only, never modified):
- record 001's Sugar Pocket game-data catalogs (game 1.4.002):
  research/001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_gameplay.json
  research/001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_database.json
- record 003's per-stage recommended power table:
  research/003-stage-pushing-meta/evidence/06-derived/stage-table.json
- this record's captures of crumblehub's package value table and the App Store listings.

Every output is written beside this script as JSON, one file per table.
"""

import html
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
RECORD = HERE.parent.parent
RESEARCH = RECORD.parent
GAMEPLAY = RESEARCH / "001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_gameplay.json"
DATABASE = RESEARCH / "001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_database.json"
STAGES = RESEARCH / "003-stage-pushing-meta/evidence/06-derived/stage-table.json"
PACKAGE_TEXT = RECORD / "evidence/04-sites/crumblehub_home_efficiency_rendered_en.txt"
APPSTORE_US = RECORD / "evidence/06-store/appstore_us_id6749251466.html"
APPSTORE_KR = RECORD / "evidence/06-store/appstore_kr_id6749251466.html"


def load(path):
    """Read a JSON file as UTF-8."""
    return json.loads(path.read_text(encoding="utf-8"))


def write(name, data):
    """Write one derived table beside this script."""
    (HERE / name).write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def level_curve(gameplay):
    """Cookie level: EXP to reach each level, the cumulative EXP, and the ATK/DEF/HP % the level gives."""
    rows, total, prev = [], 0, 0.0
    for row in gameplay["cookieLevels"]:
        total += row["required"]
        pct = row["attackPercent"]
        rows.append({
            "level": row["level"],
            "exp_for_level": row["required"],
            "exp_cumulative": total,
            "stat_pct": pct,
            "stat_pct_gain": round(pct - prev, 2),
            "stat_pct_gain_per_million_exp": round((pct - prev) / (row["required"] / 1e6), 3) if row["required"] else None,
        })
        prev = pct
    return {
        "about": "Cookie level curve from the game data (ATK, DEF and HP % are equal at every level). exp_for_level is the EXP needed to reach the level from the one before.",
        "source": str(GAMEPLAY.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "game_version": gameplay["metadata"]["gameVersion"],
        "levels": rows,
    }


def star_growth(gameplay):
    """Star growth per rarity: copies needed per star, cumulative copies, and the stat % of each star."""
    by_grade = {}
    for cookie in gameplay["cookies"]:
        grade = cookie.get("grade")
        if grade in by_grade:
            continue
        stars, total = [], 0
        for row in cookie["starGrowth"]:
            total += row["required"] if row["star"] > 0 else 0
            stars.append({
                "star": row["star"],
                "copies_for_star": row["required"] if row["star"] > 0 else 0,
                "copies_cumulative": total,
                "atk_hp_pct": row["attackPercent"],
                "def_pct": row["defensePercent"],
                "accuracy_focus_evasion_res": row["accuracy"],
                "crit_rate_pct": row["criticalRatePercent"],
                "skill_step": row["skillStep"],
            })
        by_grade[grade] = {"example_cookie": cookie["name"]["en"], "stars": stars}
    return {
        "about": "Star (성급) growth from the game data, one example cookie per rarity grade; star 0 is owning the cookie. copies are duplicate copies of the cookie (the star-0 copy excluded).",
        "source": str(GAMEPLAY.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "grades": by_grade,
    }


def plate_curve(gameplay):
    """Plating: the main-stat and sub-stat amplification of each plate level, in percent."""
    rows, prev_main, prev_sub = [], 0, 0
    for row in gameplay["plateEnhancement"]["rates"]:
        main, sub = row["mainRate"] / 100, row["subRate"] / 100
        rows.append({
            "level": row["grade"],
            "main_pct": main,
            "main_gain": round(main - prev_main, 2),
            "sub_pct": sub,
            "sub_gain": round(sub - prev_sub, 2),
        })
        prev_main, prev_sub = main, sub
    return {
        "about": "Plating (플레이트 강화) amplification per level from the game data: mainRate and subRate divided by 100 give percent. Sub-stats step up only at every fifth level.",
        "source": str(GAMEPLAY.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "levels": rows,
    }


def oven_gear(database):
    """Oven level: gear level range and the rarity odds of each draw."""
    weights = {}
    for row in database["equipmentProgression"]["rarityWeights"]:
        weights.setdefault(row["ovenLevel"], {})[row["rarity"]] = row["weight"]
    rows = []
    for row in database["equipmentProgression"]["levels"]:
        w = weights.get(row["ovenLevel"], {})
        total = sum(w.values()) or 1
        rows.append({
            "oven_level": row["ovenLevel"],
            "gear_level_min": row["min"],
            "gear_level_max": row["max"],
            "rarity_pct": {k: round(v * 100 / total, 4) for k, v in w.items() if v},
        })
    return {
        "about": "Oven level → gear level range and the chance of each rarity per draw, from the game data. Gear power follows level as well as rarity.",
        "source": str(DATABASE.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "levels": rows,
    }


def codex_summary(database):
    """Collection (도감) entries: members, boost types, and the boost at the first and last step."""
    rows = []
    for codex in database["codexes"]:
        boosts = [{
            "type": b["type"],
            "roles": b["targetRoles"],
            "elements": b["targetElements"],
            "first": b["values"][0],
            "last": b["values"][-1],
            "steps": len(b["values"]),
        } for b in codex["boosts"]]
        rows.append({
            "type": codex["type"],
            "name_ko": codex["name"]["ko"],
            "name_en": codex["name"]["en"],
            "members": len(codex["memberGameIds"]),
            "boosts": boosts,
        })
    return {
        "about": "Collection entries from the game data. Boosts are flat additions (AttackPointAddition and so on) to cookies of the listed roles or elements; the raw values are kept as the data states them, and their unit is not documented by the source.",
        "source": str(DATABASE.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "entries": rows,
    }


def rune_reroll(database):
    """Sugar Rune crafting: Rune Crystals per reroll by the number of locked lines."""
    return {
        "about": "Rune Crystals per Sugar Rune reroll (세공) by the number of locked lines, from the game data.",
        "source": str(DATABASE.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "costs": [{"locked_lines": r["lockedSlots"], "rune_crystals": r["amount"]} for r in database["sugarRunes"]["rerollCosts"]],
    }


def package_value():
    """crumblehub's package value table: rank, name, KRW price and Crystal value per KRW."""
    lines = [l.strip() for l in PACKAGE_TEXT.read_text(encoding="utf-8").splitlines() if l.strip()]
    rows, rank = [], None
    price_re = re.compile(r"^(.*?)([0-9][0-9,]*) KRW(?: · Based on 30 days)?$")
    i = 0
    while i < len(lines):
        line = lines[i]
        if line in ("★",) or re.fullmatch(r"[0-9]+", line):
            rank = None if line == "★" else int(line)
            m = price_re.match(lines[i + 1]) if i + 1 < len(lines) else None
            if m:
                name, price = m.group(1).strip(), int(m.group(2).replace(",", ""))
                value = None
                if i + 2 < len(lines) and lines[i + 2].startswith("Value per KRW"):
                    value = float(lines[i + 2].replace("Value per KRW", "").replace("💎", "").strip())
                rows.append({
                    "rank": rank,
                    "name_en": name,
                    "price_krw": price,
                    "membership_30_days": "Based on 30 days" in lines[i + 1],
                    "crystals_per_krw": value,
                    "value_pct_of_crystal_pack": round(value / 0.25 * 100) if value is not None else None,
                    "crystals_total": round(value * price) if value is not None else None,
                })
                i += 2
        i += 1
    return {
        "about": "crumblehub's package value table as rendered on 2026-09-28: package contents converted to Crystals at the site's rates, divided by the KRW price. 100% is the plain Crystal pack (375 Crystals for 1,500 KRW, 0.25 per KRW). Rank is null for the pinned memberships and for excluded packages. A Crystal value is not team power: it prices gacha currency and growth materials at the site's exchange rates.",
        "rates": "1 Cookie pull 200, 1 Pet pull 100, Light of Knowledge / Wisp 0.5, Chocosteel 200, Syrup Metal 500, Guild Medal 1.25, SSR Cookie 180 pulls, SSR Pet 100 pulls, TSSR Cookie 18,000 Light of Knowledge, Lucky Dough 3.75, Rune Crystal 1.25, Stellar Point 2.5 Crystals",
        "source": str(PACKAGE_TEXT.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "packages": rows,
    }


def appstore_prices(path, currency):
    """In-app purchase names and prices listed on an App Store page."""
    text = path.read_text(encoding="utf-8")
    pairs = re.findall(r'<div class="text-pair[^"]*"><span>([^<]+)</span> <span>([^<]+)</span>', text)
    out = []
    for name, price in pairs:
        price = html.unescape(price).strip()
        if currency == "USD" and not price.startswith("$"):
            continue
        if currency == "KRW" and not price.startswith(("￦", "₩")):
            continue
        out.append({"name": html.unescape(name).strip(), "price": price})
    return out


def price_tiers():
    """Pair the KR and US App Store listings where the same package appears on both."""
    us = appstore_prices(APPSTORE_US, "USD")
    kr = appstore_prices(APPSTORE_KR, "KRW")
    return {
        "about": "Top in-app purchases on the App Store product pages (US and KR storefronts), as listed on 2026-09-28. Apple lists them in its own order; the pairing column is by package name and is an inference.",
        "us": us,
        "kr": kr,
    }


def bracket_reach(stage_table):
    """For team power targets, the furthest main stage still reachable at each damage bracket."""
    stages = stage_table["stages"]
    thresholds = {"120": 1.2, "100": 1.0, "75": 0.8, "55": 0.6, "35": 0.4, "15": 0.2}
    targets = [1.0e9, 1.5e9, 2.0e9, 2.2e9, 2.4e9, 2.6e9, 2.8e9, 3.0e9, 3.5e9, 4.0e9, 5.0e9, 6.0e9]
    rows = []
    for power in targets:
        reach = {}
        for bracket, ratio in thresholds.items():
            last = None
            for s in stages:
                if power >= s["recommended_power"] * ratio:
                    last = s["label"]
                else:
                    break
            reach[bracket] = last
        first_short = {}
        for bracket, ratio in thresholds.items():
            nxt = next((s for s in stages if power < s["recommended_power"] * ratio), None)
            first_short[bracket] = {"stage": nxt["label"], "power_needed": round(nxt["recommended_power"] * ratio)} if nxt else None
        rows.append({"team_power": power, "last_stage_in_bracket_or_better": reach, "first_stage_below_bracket": first_short})
    return {
        "about": "Team power → the last main stage (in stage order) whose bracket is at least N% of damage, and the first stage that falls below it with the power that stage needs. Stage recommended power is game data 1.4.002 after the 2026-09-23 easing, from record 003. Recommended power rises almost monotonically, so 'last stage in order' is the reach.",
        "source": str(STAGES.relative_to(RESEARCH.parent)).replace("\\", "/"),
        "rows": rows,
    }


def main():
    """Build every table."""
    gameplay, database = load(GAMEPLAY), load(DATABASE)
    write("level-curve.json", level_curve(gameplay))
    write("star-growth.json", star_growth(gameplay))
    write("plate-curve.json", plate_curve(gameplay))
    write("oven-gear.json", oven_gear(database))
    write("codex-summary.json", codex_summary(database))
    write("rune-reroll.json", rune_reroll(database))
    write("package-value.json", package_value())
    write("price-tiers.json", price_tiers())
    write("bracket-reach.json", bracket_reach(load(STAGES)))


if __name__ == "__main__":
    main()
