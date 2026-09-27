"""Save scene-change frames from a video between t0 and t1 seconds. usage: frames.py video outdir prefix t0 t1 [step] [thresh]"""
import sys,av,numpy as np,os
v,out,pre,t0,t1=sys.argv[1],sys.argv[2],sys.argv[3],float(sys.argv[4]),float(sys.argv[5])
step=float(sys.argv[6]) if len(sys.argv)>6 else 0.5; th=float(sys.argv[7]) if len(sys.argv)>7 else 6.0
os.makedirs(out,exist_ok=True)
c=av.open(v); s=c.streams.video[0]
c.seek(int(t0/ s.time_base), stream=s, backward=True)
last=None; nxt=t0; n=0; cand=None
for f in c.decode(s):
    t=float(f.pts*s.time_base)
    if t<nxt: continue
    if t>t1: break
    nxt=t+step
    img=f.to_image(); small=np.asarray(img.convert('L').resize((160,90)),dtype=np.float32)
    if last is None or np.abs(small-last).mean()>th:
        # wait for the frame to settle: store as candidate, save when next sample is similar
        cand=(t,img,small); last=small; 
        fn=os.path.join(out,f"{pre}-{int(t//60):02d}m{t%60:04.1f}s.jpg"); img.save(fn,quality=88); n+=1
print("saved",n)
