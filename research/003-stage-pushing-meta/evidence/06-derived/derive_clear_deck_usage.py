"""Count cookie and pet use in crumblehub's shared stage clear decks, by stage band.

Usage:
    python derive_clear_deck_usage.py

Reads clear-decks-stage.json (this folder), drops exact duplicates (same stage, deck name,
nickname and lineup), and writes clear-deck-usage.json: for each band (all decks; decks for
stage 169-1 or later; decks for 229-1 or later) the deck count and every cookie's and pet's
share of decks. Appends a ledger line to ../captures.jsonl.
Failure: a missing input raises and nothing is written.
"""
import collections, datetime, hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "..", "captures.jsonl")
BANDS = {"all": 0, "169-1+": (169 - 1) * 30 + 1, "229-1+": (229 - 1) * 30 + 1}


def main():
    """Build and write clear-deck-usage.json."""
    decks = json.load(open(os.path.join(HERE, "clear-decks-stage.json"), encoding="utf-8"))["decks"]
    seen, unique = set(), []
    for d in decks:
        key = (d["stage"], d["deck_name"], d["nickname"], tuple(d["cookies"]))
        if key not in seen:
            seen.add(key)
            unique.append(d)
    out = {"source": "clear-decks-stage.json (crumblehub /api/clear-decks?mode=stage, captured 2026-09-28)",
           "duplicates_dropped": len(decks) - len(unique), "bands": {}}
    for band, floor in BANDS.items():
        rows = [d for d in unique if d["order"] >= floor]
        cookies = collections.Counter(c for d in rows for c in set(d["cookies"]))
        pets = collections.Counter(p for d in rows for p in set(d["pets"]))
        n = len(rows)
        out["bands"][band] = {
            "decks": n,
            "cookies": [{"name": k, "decks": v, "pct": round(100 * v / n, 1)} for k, v in cookies.most_common()],
            "pets": [{"name": k, "decks": v, "pct": round(100 * v / n, 1)} for k, v in pets.most_common()]}
    data = (json.dumps(out, ensure_ascii=False, indent=1) + "\n").encode("utf-8")
    with open(os.path.join(HERE, "clear-deck-usage.json"), "wb") as f:
        f.write(data)
    stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps({"path": "evidence/06-derived/clear-deck-usage.json", "url": None, "captured_at": stamp,
                            "tool": "python:evidence/06-derived/derive_clear_deck_usage.py",
                            "sha256": hashlib.sha256(data).hexdigest()}) + "\n")
    for band, b in out["bands"].items():
        print(band, b["decks"], [(c["name"], c["pct"]) for c in b["cookies"][:16]], [(p["name"], p["pct"]) for p in b["pets"][:6]])


if __name__ == "__main__":
    main()
