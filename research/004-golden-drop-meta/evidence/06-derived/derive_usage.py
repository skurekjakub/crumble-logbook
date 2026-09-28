"""Count how often each cookie appears in the published Crumble Dungeon lineups.

Usage:
    python derive_usage.py

Reads ../08-extract/lineups.json and writes lineup-usage.json beside this script:
for every cookie, the share of full 40-cookie lineups published on or after
2026-09-10 (the update that removed manual control and fixed stacked-buff
priority) that keep it in the top 40, and the share of lineups with an
exclusion list that set it to Lv.1. Refuses to overwrite an existing output,
since evidence files are never edited after capture.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(HERE), "08-extract", "lineups.json")
OUT = os.path.join(HERE, "lineup-usage.json")
SINCE = "2026-09-10"

if os.path.exists(OUT):
    sys.exit(f"{OUT} exists; write a new numbered file instead")

with open(SRC, encoding="utf-8") as f:
    lineups = json.load(f)["lineups"]

full = [l for l in lineups if len(l.get("first40", [])) >= 40 and l["date"] >= SINCE]
with_excl = [l for l in lineups if l.get("excluded") and l["date"] >= SINCE]

def tally(groups, key):
    counts = {}
    for l in groups:
        for kr in {c["kr"] for c in l[key]}:
            counts.setdefault(kr, []).append(l["id"])
    return counts

kept = tally(full, "first40")
dropped = tally(with_excl, "excluded")

rows = []
for kr in sorted(set(kept) | set(dropped)):
    k, d = kept.get(kr, []), dropped.get(kr, [])
    rows.append({
        "kr": kr,
        "kept_pct": round(100 * len(k) / len(full), 1),
        "kept_in": sorted(k),
        "excluded_pct": round(100 * len(d) / len(with_excl), 1) if with_excl else None,
        "excluded_in": sorted(d),
    })
rows.sort(key=lambda r: (-r["kept_pct"], r["excluded_pct"] or 0, r["kr"]))

out = {
    "generated_from": "evidence/08-extract/lineups.json",
    "since": SINCE,
    "full_lineups": sorted(l["id"] for l in full),
    "exclusion_lineups": sorted(l["id"] for l in with_excl),
    "cookies": rows,
}
with open(OUT, "w", encoding="utf-8", newline="\n") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
    f.write("\n")
print(f"wrote {len(rows)} cookies from {len(full)} lineups to {OUT}")
