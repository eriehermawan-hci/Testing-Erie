import re,json,subprocess,sys
skus=sys.argv[1:]
out={}
for s in skus:
    h=subprocess.run(['curl','-sS','-m','30','-L','-A','Mozilla/5.0',f'https://www.ruparupa.com/p/{s}'],capture_output=True,text=True).stdout
    t=re.search(r'<title>([^<]*)',h); 
    m=re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',h,re.S)
    if not m: out[s]={'title':t.group(1) if t else None,'err':'no data'}; continue
    d=json.loads(m.group(1)); pd=d['props']['pageProps']['results']['productDetail']
    attrs={}
    def walk(o):
        if isinstance(o,dict):
            if 'attribute_name' in o and 'attribute_value' in o: attrs[o['attribute_label']+'|'+o['attribute_name']]=o['attribute_value']
            for v in o.values(): walk(v)
        elif isinstance(o,list):
            for v in o: walk(v)
    walk(pd)
    imgs=sorted(set(re.findall(r'https?://[^"\s]+?\.(?:jpg|jpeg|png|webp)',json.dumps(pd))))
    out[s]={'title':t.group(1) if t else None,'name':pd.get('name'),'attrs':attrs,'imgs':imgs[:8],
            'ph':pd.get('product_height'),'keys':[k for k in pd.keys()][:60]}
json.dump(out,open('skus.json','w'),indent=1,ensure_ascii=False)
for s,v in out.items():
    print(s,v.get('title')); 
    for k,a in v.get('attrs',{}).items(): print('   ',k,a)
    print('   imgs',v.get('imgs')[:3] if v.get('imgs') else None)
