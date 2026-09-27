"""Build the dashboard's sources collection from the extraction files.

Usage:
    python build_sources.py <out.json> [extra.json ...]
        Writes {"dc:<id>": {url, title, title_en, date, signal}, "nv:<id>": ...} for every
        extracted post, then merges any extra JSON objects given (later files win), which is
        how non-forum sources such as crumb.gg pages are added by hand.

`signal` is "relevance N/3". Posts whose extraction file fails to parse are skipped with a
message on stderr (see digest.load).
"""
import json, sys
from digest import load, sid


def main():
    out = {}
    for _, data in load():
        for p in data.get("posts", []):
            key = sid(p)
            if not key.split(":", 1)[1]:
                continue
            out[key] = {
                "url": p.get("url", ""),
                "title": p.get("title_kr", ""),
                "title_en": p.get("title_en", ""),
                "date": p.get("date", ""),
                "signal": f"relevance {p.get('relevance', 0)}/3",
            }
    for extra in sys.argv[2:]:
        out.update(json.load(open(extra, encoding="utf-8")))
    with open(sys.argv[1], "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(out)} sources to {sys.argv[1]}", file=sys.stderr)


if __name__ == "__main__":
    main()
