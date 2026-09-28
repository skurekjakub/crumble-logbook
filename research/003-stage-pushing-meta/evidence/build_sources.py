"""Build curated/sources.json from every source id the curated files cite.

Usage:
    python build_sources.py

Walks ../curated/*.json (except sources.json) for every "sources" list, then writes one entry
per cited id. dc:/nv: entries take url, title and date from the capture's own header (this
record's captures first, then records 002 and 001) and title_en and relevance from this
record's 08-extract lanes; web: entries come from WEB below. An id with no capture and no
WEB entry stops the run with its name, so nothing uncited or unknown gets written.
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REC = os.path.dirname(HERE)
RESEARCH = os.path.dirname(REC)
CAPTURE_DIRS = {
    "dc": [os.path.join(HERE, "02-dc", "dc"), os.path.join(RESEARCH, "002-pvp-meta", "evidence", "01-dc-arena", "dc"),
           os.path.join(RESEARCH, "002-pvp-meta", "evidence", "02-dc-rumble", "dc"),
           os.path.join(RESEARCH, "001-guild-conquest-meta", "evidence", "03-dc-posts"),
           os.path.join(RESEARCH, "001-guild-conquest-meta", "evidence", "11-dc-posts-extra")],
    "nv": [os.path.join(HERE, "04-naver", "nv"), os.path.join(RESEARCH, "002-pvp-meta", "evidence", "04-naver-global", "nv"),
           os.path.join(RESEARCH, "001-guild-conquest-meta", "evidence", "07-nv-posts")],
}
YT = "https://www.youtube.com/watch?v="
WEB = {
    "web:crumblehub-stages": ("https://crumblehub.co/stages", "스테이지 정보: 권장 스탯·전투력 보정 (크럼블 허브)",
                              "Stage information: recommended power, accuracy/focus requirement and the power-damage brackets, game data 1.4.002 (crumblehub)", "2026-09-28", "relevance 3/3"),
    "web:crumblehub-stage-boss-index": ("https://crumblehub.co/data/stage-boss-index-v2.json", "스테이지 보스 색인 (크럼블 허브)",
                                        "Every main stage's boss, boss count and recommended power (crumblehub, generated 2026-09-23)", "2026-09-23", "relevance 3/3"),
    "web:crumblehub-stage-tool": ("https://crumblehub.co/assets/StageBossIndex-C8_ZZo3q.js", "스테이지 도구 코드 (크럼블 허브)",
                                  "crumblehub's stage tool code: the bracket table and its reach presets", "2026-09-28", "relevance 3/3"),
    "web:crumblehub-formulas": ("https://crumblehub.co/assets/formulas-B0zZ21YN.js", "데미지 공식 코드 (크럼블 허브)",
                                "crumblehub's damage formula: the power penalty is the last multiplier", "2026-09-28", "relevance 2/3"),
    "web:crumblehub-stage-guide": ("https://crumblehub.co/guides/stage", "스테이지 가이드 (크럼블 허브)",
                                   "crumblehub's stage guide: park at the highest clear; 55% and 35% as practical targets", "2026-08-20", "relevance 2/3"),
    "web:crumblehub-clear-decks-stage": ("https://crumblehub.co/api/clear-decks?mode=stage", "유저 공유 스테이지 클리어 덱 (크럼블 허브)",
                                         "User-shared stage clear decks (crumblehub), all pages", "2026-09-28", "relevance 2/3"),
    "web:sugarpocket-stages": ("https://cookieruncrumble.app/stages/", "스테이지 공략 (슈가포켓)",
                               "Sugar Pocket's stage page: the same bracket table worked for 1-1, 8-30, 328-30", "2026-09-28", "relevance 2/3"),
    "web:gsheet-power-correction": ("https://docs.google.com/spreadsheets/d/1wqIKXyt-btnhiLZuw9bEbzevL2XULE3qVljavcOU63w", "Power correction sheet (dc:17487 link)",
                                    "Community sheet of bracket entry powers per stage, 1-1 to 100-30", "2026-08-08", "relevance 2/3"),
    "web:alkapa-stage-check": ("https://alkapa.gg/lab/crumble/stage-check", "스테이지 계산 (KAPA LAB)",
                               "alkapa's stage and Rift calculator (power, accuracy, focus)", "2026-09-28", "relevance 2/3"),
    "web:pocketgamer-2026-09-23": ("https://www.pocketgamer.com/cookierun-crumble/new-update-sept-2026/", "CookieRun: Crumble sees you take on all bosses in its Dimensional Rift mode",
                                   "Pocket Gamer on the 2026-09-23 update: the Dimensional Rift", "2026-09-23", "relevance 2/3"),
    "web:zdnet-2026-09-23": ("https://zdnet.co.kr/view/?no=20260923112635", "데브시스터즈, '쿠키런: 킹덤·크럼블' 추석 업데이트",
                             "ZDNet Korea on the 2026-09-23 update", "2026-09-23", "relevance 1/3"),
    "web:crumbgg-stages": ("https://crumb.gg/data/stages.json", "crumb.gg stage data (client 1.4.002)",
                           "crumb.gg's datamined stage data: the damage-bracket table and every stage's recommended power; identical to crumblehub's (evidence/06-derived/crumbgg-comparison.json)", "2026-09-23", "relevance 3/3"),
    "web:crumbgg-patches": ("https://crumb.gg/data/patches.json?v=5", "crumb.gg patch digest",
                            "crumb.gg's patch digest (evidence/03-sites/crumbgg_data_patches_v5.json): the 9/23 easing lowered recommended power, enemy ATK and HP from ~0% at 169-1 to 30% at 248-30 and 36% at the end; 328-30 went from 15.61B to 10.00B", "2026-09-23", "relevance 3/3"),
}


def cited_ids():
    """Every source id cited anywhere in the curated files."""
    ids = set()

    def walk(x):
        if isinstance(x, dict):
            for k, v in x.items():
                if k == "sources" and isinstance(v, list):
                    ids.update(i for i in v if isinstance(i, str))
                else:
                    walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)

    for f in glob.glob(os.path.join(REC, "curated", "*.json")):
        if os.path.basename(f) != "sources.json":
            walk(json.load(open(f, encoding="utf-8")))
    return ids


def extraction_index():
    """Map post id to (title_en, relevance) from this record's extraction lanes."""
    idx = {}
    for f in glob.glob(os.path.join(HERE, "08-extract", "*.json")):
        for p in json.load(open(f, encoding="utf-8")).get("posts", []):
            idx.setdefault(p.get("id"), (p.get("title_en"), p.get("relevance")))
    return idx


def capture(site, key):
    """Return (url, title, date) from the first capture of dc:/nv: key found, or None."""
    name = f"{key}.md" if site == "dc" else f"nv-{key}.md"
    for d in CAPTURE_DIRS[site]:
        p = os.path.join(d, name)
        if os.path.exists(p):
            head = open(p, encoding="utf-8").read(3000)
            title = re.search(r"^# (.*)$", head, re.M).group(1).strip()
            url = re.search(r"^- url: (\S+)", head, re.M).group(1)
            m = re.search(r"(\d{4})[.-](\d{2})[.-](\d{2})", re.search(r"^- (?:author/date|written): (.*)$", head, re.M).group(1))
            return url, title, "-".join(m.groups()) if m else None
    return None


def main():
    """Write curated/sources.json."""
    idx, out, missing = extraction_index(), {}, []
    for sid in sorted(cited_ids()):
        site, _, key = sid.partition(":")
        if sid in WEB:
            url, title, title_en, date, signal = WEB[sid]
        elif site == "web" and key.startswith("yt-"):
            vid = key[3:]
            info = json.load(open(os.path.join(HERE, "05-youtube", f"{vid}.info.json"), encoding="utf-8"))
            up = info.get("upload_date") or ""
            title_en, rel = idx.get(f"yt:{vid}", (None, None))
            url, title, date = YT + vid, info.get("title"), f"{up[:4]}-{up[4:6]}-{up[6:]}" if up else None
            signal = f"relevance {rel}/3" if rel is not None else "video"
        elif site in CAPTURE_DIRS and capture(site, key):
            url, title, date = capture(site, key)
            title_en, rel = idx.get(sid, (None, None))
            signal = f"relevance {rel}/3" if rel is not None else "captured in an earlier record"
        else:
            missing.append(sid)
            continue
        out[sid] = {"url": url, "title": title, "title_en": title_en, "date": date, "signal": signal}
    if missing:
        sys.exit(f"no capture or WEB entry for: {', '.join(missing)}")
    with open(os.path.join(REC, "curated", "sources.json"), "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote {len(out)} sources")


if __name__ == "__main__":
    main()
