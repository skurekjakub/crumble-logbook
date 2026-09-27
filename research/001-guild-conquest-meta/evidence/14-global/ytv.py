"""Fetch YouTube watch pages: save raw HTML + a text digest (title, date, description, captions list, top comments)."""
import sys,re,json,requests,os,time
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
S=requests.Session(); S.headers.update({"User-Agent":UA,"Accept-Language":"ko-KR,ko;q=0.9"}); S.cookies.set("CONSENT","YES+1",domain=".youtube.com")
def J(h,name):
    m=re.search(r'(?:var |window\[")'+name+r'"?\]? = (\{.*?\});(?:var |</script>)',h)
    return json.loads(m.group(1)) if m else {}
def find(o,key,out):
    if isinstance(o,dict):
        for k,v in o.items():
            if k==key: out.append(v)
            find(v,key,out)
    elif isinstance(o,list):
        for x in o: find(x,key,out)
    return out
def comments(h,data):
    key=re.search(r'"INNERTUBE_API_KEY":"([^"]+)"',h); ver=re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"',h)
    if not key: return []
    toks=[c for c in find(data,'continuationCommand',[]) if isinstance(c,dict)]
    tok=None
    for sec in find(data,'itemSectionRenderer',[]):
        if sec.get('sectionIdentifier')=='comment-item-section':
            t=find(sec,'token',[]); tok=t[0] if t else None
    if not tok: return []
    r=S.post(f"https://www.youtube.com/youtubei/v1/next?key={key.group(1)}",json={"context":{"client":{"clientName":"WEB","clientVersion":ver.group(1),"hl":"ko"}},"continuation":tok},timeout=30).json()
    out=[]
    for m in find(r,'commentEntityPayload',[]):
        p=m.get('properties',{}); a=m.get('author',{})
        out.append((a.get('displayName',''),p.get('content',{}).get('content',''),m.get('toolbar',{}).get('likeCountNotliked','')))
    pinned=[x for x in find(r,'pinnedCommentBadge',[])]
    return out
outdir=sys.argv[1]
for vid in sys.argv[2:]:
    fn=os.path.join(outdir,f"yt-{vid}.html")
    if os.path.exists(fn): h=open(fn,encoding='utf-8').read()
    else:
        h=S.get(f"https://www.youtube.com/watch?v={vid}&hl=ko",timeout=30).text
        open(fn,'w',encoding='utf-8').write(h)
    pr=J(h,'ytInitialPlayerResponse'); data=J(h,'ytInitialData')
    vd=pr.get('videoDetails',{}); mf=pr.get('microformat',{}).get('playerMicroformatRenderer',{})
    caps=[(c.get('languageCode'),c.get('kind',''),c.get('baseUrl')) for c in find(pr,'captionTracks',[[]])[0]] if find(pr,'captionTracks',[]) else []
    try: cm=comments(h,data)
    except Exception as e: cm=[("ERR",str(e),"")]
    dig=os.path.join(outdir,f"yt-{vid}.txt")
    with open(dig,'w',encoding='utf-8') as f:
        f.write(f"# {vd.get('title')}\n- url: https://www.youtube.com/watch?v={vid}\n- channel: {vd.get('author')}\n- published: {mf.get('publishDate')}\n- views: {vd.get('viewCount')}\n- length_s: {vd.get('lengthSeconds')}\n- captions: {[(c[0],c[1]) for c in caps]}\n\n## Description\n{vd.get('shortDescription')}\n\n## Top comments ({len(cm)})\n")
        for a,t,l in cm: f.write(f"- {a} [{l}]: {t}\n")
    print(open(dig,encoding='utf-8').read()); print("==========")
    time.sleep(0.5)
