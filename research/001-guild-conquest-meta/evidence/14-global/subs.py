"""Detect burned-in subtitle changes in a band and build contact sheets. usage: subs.py video outprefix y0 y1 [x0 x1] [step]"""
import sys,av,numpy as np
from PIL import Image,ImageDraw
v,pre,y0,y1=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
x0=int(sys.argv[5]) if len(sys.argv)>5 else 0; x1=int(sys.argv[6]) if len(sys.argv)>6 else None
step=float(sys.argv[7]) if len(sys.argv)>7 else 0.5
c=av.open(v); s=c.streams.video[0]; nxt=0; last=None; strips=[]
for f in c.decode(s):
    t=float(f.pts*s.time_base)
    if t<nxt: continue
    nxt=t+step
    img=f.to_image(); W=img.width; band=img.crop((x0,y0,x1 or W,y1))
    a=np.asarray(band.convert('L').resize((200,20)),dtype=np.float32)
    if last is None or np.abs(a-last).mean()>8:
        strips.append((t,band)); last=a
per=14; k=0
for i in range(0,len(strips),per):
    grp=strips[i:i+per]; w=900; h=int(grp[0][1].height*w/grp[0][1].width)
    sheet=Image.new('RGB',(w+90,h*len(grp)),'white'); d=ImageDraw.Draw(sheet)
    for j,(t,b) in enumerate(grp):
        sheet.paste(b.resize((w,h)),(90,j*h)); d.text((4,j*h+h//3),f"{int(t//60)}:{t%60:04.1f}",fill='black')
    sheet.save(f"{pre}-{k:02d}.jpg",quality=85); k+=1
print(len(strips),"strips",k,"sheets")
