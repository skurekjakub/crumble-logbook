"""Crop a region from frames and tile into sheets. usage: sheet.py outprefix x0 y0 x1 y1 cols rows frame..."""
import sys
from PIL import Image,ImageDraw
pre=sys.argv[1]; x0,y0,x1,y1,cols,rows=map(int,sys.argv[2:8]); fs=sys.argv[8:]
w,h=x1-x0,y1-y0; per=cols*rows
for k in range(0,len(fs),per):
    grp=fs[k:k+per]; sh=Image.new('RGB',(w*cols,(h+20)*rows),'white'); d=ImageDraw.Draw(sh)
    for i,f in enumerate(grp):
        im=Image.open(f).crop((x0,y0,x1,y1)); cx,cy=(i%cols)*w,(i//cols)*(h+20)
        sh.paste(im,(cx,cy+20)); d.text((cx+4,cy+4),f.split('/')[-1],fill='black')
    sh.save(f"{pre}-{k//per:02d}.jpg",quality=90)
