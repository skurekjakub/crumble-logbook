"""Write the stage mode's table-shaped curated files from this folder's derived tables.

Usage:
    python curate_stage_tables.py

Reads stage-table.json, zone-cycle.json and rift-table.json (this folder) and writes into
../../curated/:
    stage-chapters.json   one row per chapter: zone, its -30 boss, recommended power, accuracy
                          and focus requirement, and the team power that enters 55%, 35%, 15%
    rift-levels.json      one row per Rift level: recommended power and the 35%/15% entry powers
The hand-curated facts (bosses seen per Rift level, rules) live in other curated files; this
script only moves numbers. Failure: a missing input raises and nothing is written.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CURATED = os.path.join(HERE, "..", "..", "curated")
SOURCES = ["web:crumblehub-stages", "web:crumblehub-stage-boss-index"]


def load(name):
    """Parse a JSON file in this folder."""
    return json.load(open(os.path.join(HERE, name), encoding="utf-8"))


def dump(name, obj):
    """Write obj as UTF-8 JSON into the curated folder."""
    with open(os.path.join(CURATED, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=1) + "\n")
    print("wrote", name)


def main():
    """Build both files."""
    stages = load("stage-table.json")["stages"]
    zones = {z["zone_index"]: z["zone"] for z in load("zone-cycle.json")["zones"]}
    last = {}
    for s in stages:
        last[s["chapter"]] = s
    chapters = [{"chapter": c, "zone_index": (c - 1) % 8 + 1, "zone": zones[(c - 1) % 8 + 1],
                 "last_stage": s["label"], "boss_kr": s["boss"], "boss_en": s["boss_en"],
                 "recommended_power": s["recommended_power"], "accuracy_req": s["accuracy_req"],
                 "focus_req": s["focus_req"], "power_for_55": s["entry_power"]["55"],
                 "power_for_35": s["entry_power"]["35"], "power_for_15": s["entry_power"]["15"]}
                for c, s in sorted(last.items())]
    dump("stage-chapters.json", {
        "about": "Main-stage chapters (30 stages each) with their last stage's numbers, game data 1.4.002 "
                 "after the 2026-09-23 easing. power_for_N is the minimum team power for the N% damage "
                 "bracket (N% of damage kept): 60%, 40% and 20% of recommended power, rounded up. "
                 "zone_index = ((chapter - 1) mod 8) + 1. From chapter 169 every chapter of a zone has the same "
                 "30-stage boss layout (evidence/06-derived/zone-cycle.json); earlier chapters vary within a zone.",
        "measured": "2026-09-28", "sources": SOURCES, "chapters": chapters})

    rift = load("rift-table.json")
    dump("rift-levels.json", {
        "about": "Dimensional Rift (차원의 이면) levels with recommended power and the 35%/15% entry powers, "
                 "game data 1.4.002. Season 1 (2026-09-23 to 2026-10-08) runs levels 1-100; later seasons "
                 "use 101-200. Inside the Rift, displayed team power is inflated by the 차원의 힘 level "
                 "(see mechanics.json), so compare these numbers with the power shown in the Rift.",
        "measured": "2026-09-28", "sources": ["web:crumblehub-stages"],
        "groups": rift["groups"], "seasons": rift["seasons"],
        "levels": [{"level": l["level"], "recommended_power": l["recommended_power"],
                    "power_for_35": l["entry_power"]["35"], "power_for_15": l["entry_power"]["15"]}
                   for l in rift["levels"]]})


if __name__ == "__main__":
    main()
