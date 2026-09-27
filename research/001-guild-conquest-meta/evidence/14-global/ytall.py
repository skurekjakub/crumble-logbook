"""Search YouTube for each query (relevance and upload-date order), save raw result pages, and print every
video and Short found as: id <TAB> title <TAB> channel <TAB> published <TAB> views.

usage: ytall.py <outdir> <query> [<query> ...]
Network errors on one query are reported and skipped.
"""
import sys, re, json, urllib.parse, os
import requests

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
S = requests.Session()
S.headers.update({"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9"})
S.cookies.set("CONSENT", "YES+1", domain=".youtube.com")


def walk(o, out):
    if isinstance(o, dict):
        if "videoRenderer" in o:
            v = o["videoRenderer"]
            t = "".join(r.get("text", "") for r in v.get("title", {}).get("runs", []))
            ch = "".join(r.get("text", "") for r in v.get("ownerText", {}).get("runs", []))
            out.append((v["videoId"], t, ch, v.get("publishedTimeText", {}).get("simpleText", ""),
                        v.get("viewCountText", {}).get("simpleText", "")))
        for k in ("reelItemRenderer", "shortsLockupViewModel"):
            if k in o:
                s = json.dumps(o[k], ensure_ascii=False)
                vid = re.search(r'"videoId":\s*"([^"]+)"', s)
                t = re.search(r'"accessibilityText":\s*"([^"]{5,300})"', s)
                out.append((vid.group(1) if vid else "?", "[SHORT] " + (t.group(1) if t else ""), "", "", ""))
        for x in o.values():
            walk(x, out)
    elif isinstance(o, list):
        for x in o:
            walk(x, out)


outdir = sys.argv[1]
seen = {}
for q in sys.argv[2:]:
    for sp in ("", "&sp=CAI%253D"):
        try:
            h = S.get("https://www.youtube.com/results?search_query=" + urllib.parse.quote(q) + sp, timeout=30).text
        except requests.RequestException as e:
            print("ERR", q, e, file=sys.stderr)
            continue
        fn = os.path.join(outdir, "ytq-" + re.sub(r"[^A-Za-z0-9가-힣一-龥]+", "_", q)[:40] + ("-new" if sp else "") + ".html")
        open(fn, "w", encoding="utf-8").write(h)
        m = re.search(r"var ytInitialData = (\{.*?\});</script>", h)
        out = []
        if m:
            walk(json.loads(m.group(1)), out)
        for r in out:
            seen.setdefault(r[0], r)
for r in seen.values():
    print("\t".join(r))
