"""Build curated/sources.json from every source id record 005's curated files cite.

Usage (from the repository root):
    PYTHONIOENCODING=utf-8 python research/005-team-power-growth/evidence/build_sources_2.py

Replaces build_sources.py, whose id pattern only matched ids that fill a whole JSON string and so
skipped ids cited inside prose. Walks ../curated/*.json (except sources.json) for every "dc:", "nv:"
and "web:" id, whether it is a list item or sits inside text, then writes one
entry per id. dc:/nv: entries take url, title and date from the capture's own header (this record's
captures first, then records 003, 002 and 001) and title_en and relevance from this record's
08-extract lanes. web:yt-<id> entries take title and upload date from 05-youtube/<id>.info.json, or
from the youtube lane when there is none. Other web: entries come from WEB below. An id that records
001–003 already define is copied from their curated/sources.json (the first record's entry), so a
shared source stays identical across records. An id with no capture and no entry stops the run with
its name.
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REC = os.path.dirname(HERE)
RESEARCH = os.path.dirname(REC)
CAPTURE_DIRS = {
    "dc": [
        os.path.join(HERE, "02-dc", "dc"),
        os.path.join(RESEARCH, "003-stage-pushing-meta", "evidence", "02-dc", "dc"),
        os.path.join(RESEARCH, "002-pvp-meta", "evidence", "01-dc-arena", "dc"),
        os.path.join(RESEARCH, "002-pvp-meta", "evidence", "02-dc-rumble", "dc"),
        os.path.join(RESEARCH, "001-guild-conquest-meta", "evidence", "03-dc-posts"),
        os.path.join(RESEARCH, "001-guild-conquest-meta", "evidence", "11-dc-posts-extra"),
    ],
    "nv": [
        os.path.join(HERE, "03-naver", "nv"),
        os.path.join(RESEARCH, "003-stage-pushing-meta", "evidence", "04-naver", "nv"),
        os.path.join(RESEARCH, "002-pvp-meta", "evidence", "04-naver-global", "nv"),
        os.path.join(RESEARCH, "001-guild-conquest-meta", "evidence", "07-nv-posts"),
    ],
}
SHARED = [os.path.join(RESEARCH, r, "curated", "sources.json")
          for r in ("001-guild-conquest-meta", "002-pvp-meta", "003-stage-pushing-meta")]
YT = "https://www.youtube.com/watch?v="
WEB = {
    "web:appstore-us": ("https://apps.apple.com/us/app/cookierun-crumble-idle-rpg/id6749251466", "CookieRun: Crumble - Idle RPG (App Store, US)",
                        "US App Store listing: top in-app purchases with USD prices (evidence/06-store/)", "2026-09-28", "relevance 3/3"),
    "web:appstore-kr": ("https://apps.apple.com/kr/app/id6749251466", "쿠키런: 크럼블 (App Store, KR)",
                        "KR App Store listing: top in-app purchases with KRW prices (evidence/06-store/)", "2026-09-28", "relevance 3/3"),
    "web:cookieruncrumbles-progression": ("https://www.cookieruncrumbles.com/guides/cookie-run-crumble-beginner-progression-guide/", "CookieRun: Crumble Beginner Guide: Fix Your Progression Route",
                                          "A global guide site's beginner progression route (Resolve, Fame, lab, Stellar, guild)", "2026-08-21", "relevance 2/3"),
    "web:crumbgg-leaderboard": ("https://crumb.gg/pub/leaderboard", "crumb.gg combat power leaderboard",
                                "crumb.gg's all-server combat power board (account total power), top 500", "2026-09-28", "relevance 2/3"),
    "web:crumbgg-patches-20260928": ("https://crumb.gg/data/patches.json", "crumb.gg patch digest (captured 2026-09-28)",
                                     "crumb.gg's patch digest through 1.4.002: Resolve, Fame, Gnome Lab and plating caps and changes", "2026-09-28", "relevance 3/3"),
    "web:crumblehub-api-efficiency": ("https://crumblehub.co/api/efficiency", "패키지 효율 데이터 (크럼블 허브 API)",
                                      "crumblehub's package list with KRW prices and contents, and its conversion settings", "2026-09-28", "relevance 3/3"),
    "web:crumblehub-currency": ("https://crumblehub.co/guides/currency", "재화 가이드 (크럼블 허브)",
                                "crumblehub's currency guide: Crystal, victory medal, guild medal and mileage priorities", "2026-09-01", "relevance 3/3"),
    "web:crumblehub-efficiency": ("https://crumblehub.co/#efficiency", "패키지 효율표 (크럼블 허브)",
                                  "crumblehub's package value table as rendered: Crystal value per KRW for each package", "2026-09-28", "relevance 3/3"),
    "web:crumblehub-plate-upgrade": ("https://crumblehub.co/guides/plate-upgrade", "플레이트 강화 가이드 (크럼블 허브)",
                                     "crumblehub's plating guide: steps of 5, weapons first, cap 25 in 1.4.002", "2026-09-23", "relevance 3/3"),
    "web:crumblehub-spending": ("https://crumblehub.co/guides/spending", "과금 가이드 (크럼블 허브)",
                                "crumblehub's spending plan: light, medium and whale package sets with KRW totals", "2026-08-20", "relevance 3/3"),
    "web:pocketgamer-best-packs": ("https://www.pocketgamer.com/cookierun-crumble/best-packs/", "CookieRun: Crumble best packs to invest in",
                                   "Pocket Gamer's global pack advice: Ad Removal and the Crumble Pass", "2026-09", "relevance 2/3"),
    "web:sugarpocket-catalog": ("https://cookieruncrumble.app/api/catalog/gameplay", "슈가포켓 게임 데이터 카탈로그 (record 001 capture)",
                                "Sugar Pocket's game-data catalogs, game 1.4.002, captured by record 001 and tabulated in evidence/07-derived/", "2026-09-23", "relevance 3/3"),
    "web:sugarpocket-guides": ("https://cookieruncrumble.app/guides/", "쿠키런 크럼블 플레이 가이드 (슈가포켓)",
                               "Sugar Pocket's play guide: bracket arithmetic and what Arena applies", "2026-09-12", "relevance 2/3"),
    "web:sugarpocket-stella": ("https://cookieruncrumble.app/stella/", "스텔라 시뮬레이션 (슈가포켓)",
                               "Sugar Pocket's Stellar simulator: reroll cost by locked points", "2026-09-28", "relevance 3/3"),
}


def cited_ids():
    """Every source id the curated files cite, sorted."""
    ids = set()
    for path in glob.glob(os.path.join(REC, "curated", "*.json")):
        if os.path.basename(path) == "sources.json":
            continue
        text = open(path, encoding="utf-8").read()
        ids.update(re.findall(r"(?<![A-Za-z0-9])((?:dc|nv):\d+|web:[A-Za-z0-9_-]*[A-Za-z0-9_])", text))
    return sorted(ids)


def extract_index():
    """title_en and relevance per id from this record's extraction lanes."""
    index = {}
    for path in glob.glob(os.path.join(HERE, "08-extract", "*.json")):
        data = json.load(open(path, encoding="utf-8"))
        for post in data.get("posts", []):
            site = {"yt": "web", "web": "web"}.get(post["source"], post["source"])
            key = f"{site}:yt-{post['id']}" if post["source"] == "yt" else f"{site}:{post['id']}"
            index[key] = post
    return index


def capture_header(site, key):
    """url, title and date from a dc/nv capture's header, or None when no capture exists."""
    name = f"{key}.md" if site == "dc" else f"nv-{key}.md"
    for folder in CAPTURE_DIRS[site]:
        path = os.path.join(folder, name)
        if not os.path.exists(path):
            continue
        lines = open(path, encoding="utf-8").read().splitlines()
        title = lines[0].lstrip("# ").strip() if lines else None
        url = next((l.split(": ", 1)[1] for l in lines if l.startswith("- url: ")), None)
        date = None
        for l in lines:
            m = re.match(r"- (?:author/date: .* |written: )(\d{4})[.-](\d{2})[.-](\d{2})", l)
            if m:
                date = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
                break
        return url, title, date
    return None


def youtube_entry(vid, extract):
    """A web:yt-<id> entry from the video's info.json, or from the youtube lane."""
    info = os.path.join(HERE, "05-youtube", f"{vid}.info.json")
    post = extract.get(f"web:yt-{vid}")
    if os.path.exists(info):
        data = json.load(open(info, encoding="utf-8"))
        d = data.get("upload_date") or ""
        date = f"{d[:4]}-{d[4:6]}-{d[6:]}" if len(d) == 8 else None
        title = data.get("title")
        channel = data.get("channel") or data.get("uploader")
        title = f"{title} ({channel})" if channel else title
    elif post:
        date, title = post.get("date"), post.get("title_kr") or post.get("title_en")
    else:
        return None
    return {"url": YT + vid, "title": title, "title_en": post.get("title_en") if post else None,
            "date": date, "signal": f"relevance {post['relevance']}/3" if post else None}


def main():
    """Write curated/sources.json."""
    extract = extract_index()
    shared = {}
    for path in SHARED:
        for sid, entry in json.load(open(path, encoding="utf-8")).items():
            shared.setdefault(sid, entry)
    out, missing = {}, []
    for sid in cited_ids():
        site, key = sid.split(":", 1)
        if sid in shared:
            out[sid] = shared[sid]
        elif site in ("dc", "nv"):
            head = capture_header(site, key)
            if head is None:
                missing.append(sid)
                continue
            url, title, date = head
            post = extract.get(sid)
            out[sid] = {"url": url, "title": title, "title_en": post.get("title_en") if post else None,
                        "date": date, "signal": f"relevance {post['relevance']}/3" if post else "captured in an earlier record"}
        elif sid.startswith("web:yt-"):
            entry = youtube_entry(sid[len("web:yt-"):], extract)
            if entry is None:
                missing.append(sid)
                continue
            out[sid] = entry
        elif sid in WEB:
            url, title, title_en, date, signal = WEB[sid]
            out[sid] = {"url": url, "title": title, "title_en": title_en, "date": date, "signal": signal}
        else:
            missing.append(sid)
    if missing:
        sys.exit("no capture or entry for: " + ", ".join(missing))
    path = os.path.join(REC, "curated", "sources.json")
    open(path, "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote {len(out)} sources")


if __name__ == "__main__":
    main()
