"""Condense 08-extract/*.json into one digest per facet for synthesis.

Usage:
    python digest.py <facet> [min_relevance]
        facet: scores | teams | runes | gear | rng | mechanics | disagreements | summaries | glossary | timeline
        Prints one compact line per item, prefixed with its source id (dc:<id>, nv:<id>, web:<id>).

Reads every *.json in 08-extract/; files that fail to parse are reported on stderr and skipped.
"""
import glob, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load():
    """Yield (batch_name, parsed_json) for each extraction file that parses."""
    for f in sorted(glob.glob(os.path.join(HERE, "08-extract", "*.json"))):
        try:
            yield os.path.basename(f)[:-5], json.load(open(f, encoding="utf-8"))
        except (OSError, ValueError) as e:
            print(f"skip {f}: {e}", file=sys.stderr)


def sid(post):
    """Source id for a post: dc:<id>, nv:<id> or web:<id>."""
    src = post.get("source", "")
    pid = str(post.get("id", "")).replace("nv-", "")
    return {"dc": "dc:", "naver": "nv:"}.get(src, "web:") + pid


def compact(x):
    return json.dumps(x, ensure_ascii=False, separators=(",", ":"))


def main():
    facet = sys.argv[1]
    min_rel = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    for batch, data in load():
        if facet in ("glossary", "timeline", "patches", "score_distribution"):
            for item in data.get(facet, []) or []:
                print(f"[{batch}] {compact(item)}")
            continue
        for p in data.get("posts", []):
            if (p.get("relevance") or 0) < min_rel:
                continue
            key = sid(p)
            if facet == "summaries":
                print(f"{key} {p.get('date','')} r{p.get('relevance')} | {p.get('title_en') or p.get('title_kr')} | {p.get('summary_en','')}")
                continue
            for item in p.get(facet, []) or []:
                if item:
                    print(f"{key} {p.get('date','')} {compact(item)}")


if __name__ == "__main__":
    main()
