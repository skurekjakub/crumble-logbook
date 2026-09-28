"""Derive the stage tables of record 003 from the crumblehub captures in ../03-sites.

Usage:
    python derive_stage_data.py

Reads (never edits) the captures and writes, into this folder:
    brackets.json            the power-gate bracket table from crumblehub's stage tool code
    stage-table.json         every main stage: boss, recommended power, accuracy and focus
                             requirement, and the minimum team power of each bracket
    chapter-summary.json     one row per chapter: its -30 stage and the 35%/15% entry powers
    rift-table.json          Dimensional Rift levels: recommended power and bracket entry powers
    clear-decks-stage.json   crumblehub's shared stage clear decks with cookie and pet names
Each file written gets one line in ../captures.jsonl (url null: derived).
Failure: a missing or reshaped capture raises; nothing is written after the failing step.
"""
import datetime, glob, hashlib, json, math, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SITES = os.path.join(HERE, "..", "03-sites")
GLOSS_SRC = os.path.join(HERE, "..", "..", "..", "001-guild-conquest-meta", "evidence", "12-glossary-src")
LEDGER = os.path.join(HERE, "..", "captures.jsonl")
SUB = os.path.basename(HERE)


def write(name, obj):
    """Write obj as pretty UTF-8 JSON to name and append its ledger line."""
    data = (json.dumps(obj, ensure_ascii=False, indent=1) + "\n").encode("utf-8")
    with open(os.path.join(HERE, name), "wb") as f:
        f.write(data)
    stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps({"path": f"evidence/{SUB}/{name}", "url": None, "captured_at": stamp,
                            "tool": "python:evidence/06-derived/derive_stage_data.py",
                            "sha256": hashlib.sha256(data).hexdigest()}) + "\n")
    print("wrote", name)


def rsc_payload(path):
    """Concatenate the React Server Component chunks embedded in a crumblehub page."""
    s = open(path, encoding="utf-8").read()
    pat = re.compile(r'__VINEXT_RSC_CHUNKS__\.push\(("(?:[^"\\]|\\.)*")\)')
    return "".join(json.loads(m.group(1)) for m in pat.finditer(s))


def json_value_after(text, key):
    """Parse the JSON value that follows `"key":` in text (first occurrence)."""
    i = text.index(f'"{key}":') + len(key) + 3
    return json.JSONDecoder().raw_decode(text, i)[0]


def entry_power(recommended, ratio_pct):
    """Minimum team power that reaches ratio_pct of recommended (crumblehub's rounding: ceil)."""
    return (recommended * ratio_pct + 99) // 100


def main():
    js = open(os.path.join(SITES, "crumblehub_assets_StageBossIndex-C8_ZZo3q.js"), encoding="utf-8").read()
    table = re.search(r"var A=(\[\{ratio:0.*?\}\]),j=", js).group(1)
    brackets = [{"min_ratio_pct": round(float(r) * 100), "damage_pct": int(d), "label": l}
                for r, d, l in re.findall(r"\{ratio:([\d.]+),damage:(\d+),label:`([^`]*)`\}", table)]
    write("brackets.json", {
        "source": "crumblehub.co stage tool, assets/StageBossIndex-C8_ZZo3q.js (game data 1.4.002)",
        "rule": "final damage = base damage x damage_pct/100 for the highest bracket whose min_ratio_pct <= team power / recommended power x 100; stepwise, no interpolation",
        "brackets": brackets})
    by_damage = {b["damage_pct"]: b["min_ratio_pct"] for b in brackets}

    t = rsc_payload(os.path.join(SITES, "crumblehub_stages_ko.html"))
    power_chapters = json_value_after(t, "initialPowerChapters")
    stat_chapters = {c["chapter"]: c for c in json_value_after(t, "initialStageStatChapters")}
    rift = json_value_after(t, "initialDimensionPowerIndex")
    idx = json.load(open(os.path.join(SITES, "crumblehub_data_stage-boss-index-v2.json"), encoding="utf-8"))
    bosses = {c["chapter"]: c["stages"] for c in idx["chapters"]}

    stages, summary, index_diffs = [], [], 0
    for ch in power_chapters:
        c = ch["chapter"]
        for k, rec in enumerate(ch["recommendedPowers"], 1):
            b = bosses[c][k - 1]
            if b["recommendedPower"] != rec:
                index_diffs += 1
            row = {"label": f"{c}-{k}", "chapter": c, "stage": k, "boss": b["boss"], "boss_en": b["bossEn"],
                   "boss_count": b["count"], "recommended_power": rec,
                   "accuracy_req": stat_chapters[c]["accuracyRequirements"][k - 1],
                   "focus_req": stat_chapters[c]["focusRequirements"][k - 1],
                   "entry_power": {str(d): entry_power(rec, r) for d, r in by_damage.items() if r > 0}}
            stages.append(row)
        last = stages[-1]
        summary.append({"chapter": c, "last_stage": last["label"], "boss": last["boss"], "boss_en": last["boss_en"],
                        "recommended_power": last["recommended_power"], "accuracy_req": last["accuracy_req"],
                        "focus_req": last["focus_req"], "power_for_35": last["entry_power"]["35"],
                        "power_for_15": last["entry_power"]["15"]})
    meta = {"source": "crumblehub.co/stages (initialPowerChapters, initialStageStatChapters) joined with "
                      "crumblehub.co/data/stage-boss-index-v2.json (boss, count)",
            "index_generated_at": idx["generatedAt"],
            "stages_where_index_power_differs_from_page": index_diffs,
            "entry_power": "minimum team power for each damage bracket, keyed by the bracket's damage %"}
    write("stage-table.json", {**meta, "stages": stages})
    write("chapter-summary.json", {**meta, "chapters": summary})

    levels = [{"level": s["stage"], "recommended_power": s["recommendedPower"],
               "entry_power": {str(d): entry_power(s["recommendedPower"], r) for d, r in by_damage.items() if r > 0}}
              for s in rift["stages"]]
    write("rift-table.json", {"source": "crumblehub.co/stages initialDimensionPowerIndex",
                              "data_source": rift.get("source"), "groups": rift["groups"],
                              "seasons": rift["seasons"], "levels": levels})

    cc = open(os.path.join(GLOSS_SRC, "crumblehub_assets_CookieCodex-CfPeHG29.js"), encoding="utf-8").read()
    pc = open(os.path.join(GLOSS_SRC, "crumblehub_assets_PetCodex-B-Ms2Wi8.js"), encoding="utf-8").read()
    cookie_names = [m.group(1) for m in re.finditer(r"\{grade:`[^`]*`,name:`([^`]*)`", cc)]
    pet_names = [m.group(1) for m in re.finditer(r"\{grade:`[^`]*`,name:`([^`]*)`", pc)]
    decks = []
    for path in sorted(glob.glob(os.path.join(SITES, "crumblehub_api_clear-decks_stage_p*.json"))):
        for d in json.load(open(path, encoding="utf-8"))["decks"]:
            ch, _, st = d["stage"].partition("-")
            decks.append({"stage": d["stage"], "order": (int(ch) - 1) * 30 + int(st), "deck_name": d["deckName"],
                          "nickname": d["nickname"],
                          "cookies": [cookie_names[i] if i < len(cookie_names) else f"#{i}" for i in d["cookies"]],
                          "pets": [pet_names[i] if i < len(pet_names) else f"#{i}" for i in d["pets"]],
                          "captain_slot": d["captainSlot"], "merc_band_level": d["mercenaryBandLevel"],
                          "perk_ids": d["mercenaryBandPerkIds"], "recommendations": d["recommendations"],
                          "oppositions": d["oppositions"], "created_at": d["createdAt"],
                          "file": os.path.basename(path)})
    decks.sort(key=lambda x: (-x["order"], -x["recommendations"]))
    write("clear-decks-stage.json", {"source": "crumblehub.co/api/clear-decks?mode=stage (all pages); names by "
                                               "index into crumblehub's CookieCodex/PetCodex arrays",
                                     "count": len(decks), "decks": decks})


if __name__ == "__main__":
    main()
