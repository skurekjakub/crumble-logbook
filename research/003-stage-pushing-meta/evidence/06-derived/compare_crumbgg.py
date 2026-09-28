"""Compare crumb.gg's stage data with crumblehub's, as derived in stage-table.json and brackets.json.

Usage:
    python compare_crumbgg.py

Reads ../03-sites/crumbgg_data_stages.json and this folder's stage-table.json and brackets.json,
and writes crumbgg-comparison.json: whether the bracket tables agree, how many stages' recommended
powers differ (and the first differences), and the shape of crumb.gg's acc/foc arrays. Appends a
ledger line to ../captures.jsonl. Failure: a missing input raises and nothing is written.
"""
import datetime, hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "..", "captures.jsonl")


def main():
    """Build and write crumbgg-comparison.json."""
    cg = json.load(open(os.path.join(HERE, "..", "03-sites", "crumbgg_data_stages.json"), encoding="utf-8"))
    stages = json.load(open(os.path.join(HERE, "stage-table.json"), encoding="utf-8"))["stages"]
    brackets = json.load(open(os.path.join(HERE, "brackets.json"), encoding="utf-8"))["brackets"]
    hub_steps = [[b["min_ratio_pct"] / 100, b["damage_pct"]] for b in brackets if b["min_ratio_pct"] > 0]
    diffs = [{"label": s["label"], "crumblehub": s["recommended_power"], "crumbgg": cp}
             for s, cp in zip(stages, cg["cp"]) if s["recommended_power"] != cp]
    out = {"crumbgg_version": cg["v"], "crumbgg_made": cg["made"],
           "bracket_steps_crumbgg": cg["dmg"], "bracket_steps_crumblehub": hub_steps,
           "bracket_steps_agree": [list(x) for x in cg["dmg"]] == hub_steps,
           "note_below_first_step": "crumb.gg lists no step under 10%; crumblehub gives 1% there.",
           "stages_compared": min(len(stages), len(cg["cp"])),
           "recommended_power_differences": len(diffs), "first_differences": diffs[:20],
           "acc_len": len(cg["acc"]), "foc_len": len(cg["foc"]), "acc_head": cg["acc"][:12], "foc_head": cg["foc"][:12]}
    data = (json.dumps(out, ensure_ascii=False, indent=1) + "\n").encode("utf-8")
    with open(os.path.join(HERE, "crumbgg-comparison.json"), "wb") as f:
        f.write(data)
    stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps({"path": "evidence/06-derived/crumbgg-comparison.json", "url": None, "captured_at": stamp,
                            "tool": "python:evidence/06-derived/compare_crumbgg.py",
                            "sha256": hashlib.sha256(data).hexdigest()}) + "\n")
    print(json.dumps({k: v for k, v in out.items() if k != "first_differences"}, ensure_ascii=False))
    print(diffs[:5])


if __name__ == "__main__":
    main()
