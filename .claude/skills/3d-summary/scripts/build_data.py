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
        out.append({'code':c,'items':[{'k':a['k'],'qd':int(a['qd'])} for a in its]})
    return out
fixtures=[
 {'id':'wall-p1','kind':'wall','tab':'Wall 1 · P1','title':'Wall ke-1 · SKU prioritas P1','size':{'w':120,'d':50,'h':270},'zones':[35,35,70,35,35],'label':'WALL 5 RACK',
  'shelves':shelves('WALL','P1',['S1','S2','S3','S4','S5'],'wall')},
 {'id':'wall-p2','kind':'wall','tab':'Wall 2 · P2','title':'Wall ke-2 · SKU prioritas P2','size':{'w':120,'d':50,'h':270},'zones':[35,35,70,35,35],'label':'WALL 5 RACK',
  'shelves':shelves('WALL','P2',['S1','S2','S3','S4','S5'],'wall')},
 {'id':'pallet-1','kind':'pallet','tab':'Pallet 1 · P1','title':'Pallet ke-1 · SKU prioritas P1','size':{'w':90,'d':90,'h':100},'zones':[100],'label':'PALLET 90x90',
  'shelves':shelves('PALLET','P1',['PLT1'],'pallet')},
 {'id':'pallet-2','kind':'pallet','tab':'Pallet 2 · P2','title':'Pallet ke-2 · SKU prioritas P2','size':{'w':90,'d':90,'h':100},'zones':[100],'label':'PALLET 90x90',
  'shelves':shelves('PALLET','P2',['PLT2'],'pallet')},
]
fixtures=[f for f in fixtures if f['kind']=='wall']   # Pallet & Dumbin dikecualikan dulu, fokus Wall
used={i['k'] for f in fixtures for sh in f['shelves'] for i in sh['items']}
skus={k:v for k,v in skus.items() if k in used}
for f in fixtures:
    for s in f['shelves']: print(f['id'],s['code'],[ (i['k'],i['qd']) for i in s['items']])
json.dump({'skus':skus,'fixtures':fixtures,'ditarik':D['meta']['ditarik']},open('rack_data.json','w'),ensure_ascii=False)
