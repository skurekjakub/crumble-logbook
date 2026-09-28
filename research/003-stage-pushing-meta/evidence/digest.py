"""Condense 08-extract/*.json into one digest per facet (adapted from record 001's digest.py).

Usage:
    python digest.py <facet> [min_relevance]
        facet: clears | teams | builds | mechanics | rift | stage_types | disagreements | quotes |
               summaries | glossary
        Prints one compact line per item, prefixed with the post's source id (dc:<no>, nv:<id>,
        yt:<id>) and date.

Record 003's lanes already write prefixed ids, so this doesn't rebuild them. Reads every
*.json in 08-extract/; a file that fails to parse is reported on stderr and skipped.
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


def compact(x):
    """One-line JSON without ASCII escaping."""
    return json.dumps(x, ensure_ascii=False, separators=(",", ":"))


def main():
    """Print the requested facet across every lane."""
    facet = sys.argv[1]
    min_rel = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    for batch, data in load():
        if facet == "glossary":
            for item in data.get("glossary", []) or []:
                print(f"[{batch}] {compact(item)}")
            continue
        for p in data.get("posts", []):
            if (p.get("relevance") or 0) < min_rel:
                continue
            key, date = p.get("id", "?"), p.get("date", "")
            if facet == "summaries":
                print(f"{key} {date} r{p.get('relevance')} | {p.get('title_en') or p.get('title_kr')} | {p.get('summary_en', '')}")
                continue
            for item in p.get(facet, []) or []:
                if item:
                    print(f"{key} {date} {compact(item)}")


if __name__ == "__main__":
    main()
