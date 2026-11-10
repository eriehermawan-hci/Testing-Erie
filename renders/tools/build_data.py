import json
h=open('dash.html').read(); i=h.find('const D = ')+len('const D = ')
D,_=json.JSONDecoder().raw_decode(h[i:])
P=json.load(open('products.json')); rr={r['sku']:r for r in json.load(open('rr.json'))}
arts=[a for a in D['arts'] if a['grup']=='MAKAN & MINUM']
STACK={'10554839':(0.9,12),'10554840':(0.9,12),'10559642':(1.0,12),'10554842':(1.1,16),'10581181':(0.8,16),'10559641':(0.8,16),'10590319':(1.2,8),'10590320':(1.2,8)}
skus={}
for a in arts:
    k=a['k']; st=STACK.get(k)
    skus[k]={'nm':a['nm'].replace('  ',' '),'pr':a['pr'],'code':a['code'],'cfg':P[k],'stack':{'inc':st[0],'max':st[1]} if st else None,
             'dim':None}
def shelves(fx,pr,codes,kind):
    out=[]
    for c in codes:
        its=[a for a in arts if a['fx']==fx and a['pr']==pr and a['code']==c]
        out.append({'code':c,'media':c=='S0','items':[{'k':a['k'],'qd':int(a['qd'])} for a in its]})
    return out
fixtures=[
 {'id':'wall-p1','kind':'wall','tab':'Wall 1 · P1','title':'Wall ke-1 · SKU prioritas P1','size':{'w':120,'d':50,'h':270},'zones':[45,45,45,45,45,45],'label':'WALL 5 RACK',
  'shelves':shelves('WALL','P1',['S0','S1','S2','S3','S4','S5'],'wall')},
 {'id':'wall-p2','kind':'wall','tab':'Wall 2 · P2','title':'Wall ke-2 · SKU prioritas P2','size':{'w':120,'d':50,'h':270},'zones':[45,45,45,45,45,45],'label':'WALL 5 RACK',
  'shelves':shelves('WALL','P2',['S0','S1','S2','S3','S4','S5'],'wall')},
 {'id':'pallet-1','kind':'pallet','tab':'Pallet 1 · P1','title':'Pallet ke-1 · SKU prioritas P1','size':{'w':90,'d':90,'h':100},'zones':[100],'label':'PALLET 90x90',
  'shelves':shelves('PALLET','P1',['PLT1'],'pallet')},
 {'id':'pallet-2','kind':'pallet','tab':'Pallet 2 · P2','title':'Pallet ke-2 · SKU prioritas P2','size':{'w':90,'d':90,'h':100},'zones':[100],'label':'PALLET 90x90',
  'shelves':shelves('PALLET','P2',['PLT2'],'pallet')},
]
fixtures=[f for f in fixtures if f['kind']=='wall']
used={i['k'] for f in fixtures for sh in f['shelves'] for i in sh['items']}
skus={k:v for k,v in skus.items() if k in used}

# ---------- mode display (kolom "Display w/Packing" dari pengguna) ----------
import base64, io
from PIL import Image
DW={'10566440':'DISPLAY + PACKING','10587677':'DISPLAY ONLY','10587678':'DISPLAY ONLY',
 '10560521':'PDQ 12','10560522':'PDQ 12','10560523':'PDQ 12','10560524':'PDQ 12',
 '10554839':'DISPLAY ONLY','10554840':'DISPLAY ONLY','10554842':'DISPLAY ONLY','10581181':'DISPLAY ONLY',
 '10137002':'DISPLAY + PACKING','10612063':'DISPLAY + PACKING',
 '10631044':'PDQ 12','10631045':'PDQ 12','10631046':'PDQ 12','10631047':'PDQ 12',
 '10542394':'PDQ 12','10542395':'PDQ 12','10542396':'PDQ 12','10565042':'PDQ 12',
 '10568377':'DISPLAY + PACKING','10568378':'DISPLAY + PACKING','10100885':'DISPLAY + PACKING','10497060':'DISPLAY + PACKING','10519116':'DISPLAY + PACKING',
 '10559641':'PDQ 54','10559642':'PDQ 32','10559812':'PDQ 30','10590319':'PDQ 25','10590320':'PDQ 25'}
PDQ={12:(4,3,1),54:(3,3,6),32:(4,4,2),30:(6,5,1),25:(5,5,1)}     # N: (kolom, baris/dalam, tumpuk)
# dimensi kotak packing (cm) dari data kemasan ruparupa/SAP: (L,W,T) mentah; flat pack = berdiri menghadap depan
BOXRAW={'10566440':((19.5,15,23),False),'10137002':((46.5,12.6,28),True),'10612063':((14,35,30),True),
 '10568377':((25,8,14),False),'10568378':((25,8,14),False),'10100885':((27.5,9,23.5),False),'10497060':((31,10.5,12),False),'10519116':((36.2,12.4,12.2),False)}
BOXIMG={'10566440':'10566440_3','10137002':'10137002_1','10612063':'10612063_1','10568377':'10568377_1','10568378':'10568378_1','10100885':'10100885_1','10497060':'10497060_1','10519116':'10519116_2'}
def standing(d):                      # tipis = kedalaman, sisi lebar = lebar, sisanya = tinggi
    a=sorted(d); return {'w':max(a[1],a[2]),'d':a[0],'h':min(a[1],a[2])}
for k,v in skus.items():
    t=DW[k]; v['dw']=t
    if t=='DISPLAY ONLY': v['mode']='open'
    elif t.startswith('PDQ'):
        n=int(t.split()[1]); gx,gy,st=PDQ[n]; v['mode']='pdq'; v['pdq']={'n':n,'gx':gx,'gy':gy,'s':st}
    else:
        v['mode']='pack'; raw,flat=BOXRAW[k]
        if flat: b=standing(raw)
        else: b={'w':raw[0],'d':raw[1],'h':raw[2]}
        im=Image.open(f'ref/{BOXIMG[k]}.jpg').convert('RGB'); im.thumbnail((300,300)); buf=io.BytesIO(); im.save(buf,'JPEG',quality=78)
        v['box']=dict(b,flat=flat,img='data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode())
   # Pallet & Dumbin dikecualikan dulu, fokus Wall
for f in fixtures:
    for s in f['shelves']: print(f['id'],s['code'],[ (i['k'],i['qd']) for i in s['items']])
json.dump({'skus':skus,'fixtures':fixtures,'ditarik':D['meta']['ditarik']},open('rack_data.json','w'),ensure_ascii=False)
