"""Derive the zone cycle of the main stages from stage-table.json.

Usage:
    python derive_zone_cycle.py

Groups chapters by (chapter - 1) mod 8 and writes zone-cycle.json: for each residue, the
boss and boss count of every stage slot 1-30, and how many chapters from 169 on (and over
all chapters) share that exact 30-stage pattern. Zone names are the ones 그니 uses in
yt:RLuI96lGgGg's chapter list, matched by the bosses each chapter names. Appends a
ledger line to ../captures.jsonl. Failure: a missing stage-table.json raises.
"""
import collections, datetime, hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "..", "captures.jsonl")
ZONES = {1: "초원 (grassland)", 2: "해변 (beach)", 3: "폐허 도시 (ruined city)", 4: "사막 (desert)",
         5: "버섯지대 (mushroom zone)", 6: "광장 (plaza)", 7: "용암지대 (lava zone)", 8: "설원지대 (snowfield)"}


def main():
    """Build and write zone-cycle.json."""
    stages = json.load(open(os.path.join(HERE, "stage-table.json"), encoding="utf-8"))["stages"]
    by_chapter = collections.defaultdict(dict)
    for s in stages:
        by_chapter[s["chapter"]][s["stage"]] = (s["boss"], s["boss_en"], s["boss_count"])
    out = []
    for r in range(8):
        chapters = [c for c in sorted(by_chapter) if (c - 1) % 8 == r]
        pattern = lambda c: tuple(by_chapter[c][k] for k in range(1, 31))
        late = collections.Counter(pattern(c) for c in chapters if c >= 169)
        every = collections.Counter(pattern(c) for c in chapters)
        top, n_late = late.most_common(1)[0]
        out.append({"zone_index": r + 1, "zone": ZONES[r + 1],
                    "chapters_from_169_matching": n_late,
                    "chapters_from_169_total": sum(late.values()),
                    "chapters_all_matching": every[top], "chapters_all_total": len(chapters),
                    "stages": [{"stage": k, "boss": b, "boss_en": e, "boss_count": n}
                               for k, (b, e, n) in enumerate(top, 1)]})
    data = (json.dumps({"rule": "zone_index = ((chapter - 1) mod 8) + 1",
                        "source": "stage-table.json (crumblehub game data 1.4.002)", "zones": out},
                       ensure_ascii=False, indent=1) + "\n").encode("utf-8")
    with open(os.path.join(HERE, "zone-cycle.json"), "wb") as f:
        f.write(data)
    stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps({"path": "evidence/06-derived/zone-cycle.json", "url": None, "captured_at": stamp,
                            "tool": "python:evidence/06-derived/derive_zone_cycle.py",
                            "sha256": hashlib.sha256(data).hexdigest()}) + "\n")
    for z in out:
        print(z["zone_index"], z["zone"], z["chapters_from_169_matching"], "/", z["chapters_from_169_total"],
              "all:", z["chapters_all_matching"], "/", z["chapters_all_total"])


if __name__ == "__main__":
    main()
