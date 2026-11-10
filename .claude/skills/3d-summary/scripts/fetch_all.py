import re,json,subprocess,html,os,sys
from concurrent.futures import ThreadPoolExecutor
mm=json.load(open('mm.json')); os.makedirs('ref',exist_ok=True)
def get(a):
    s=a['k']
    h=subprocess.run(['curl','-sS','-m','40','-L','-A','Mozilla/5.0',f'https://www.ruparupa.com/p/{s}'],capture_output=True,text=True).stdout
    r={'sku':s,'sheet_name':a['nm'],'pr':a['pr'],'code':a['code'],'qd':a['qd']}
    t=re.search(r'<title>([^<]*)',h); r['title']=html.unescape(t.group(1)).replace(' Terbaru | Ruparupa','').replace('Jual ','') if t else None
    m=re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',h,re.S)
    if not m or '404' in (r['title'] or '')[:20] or 'Tidak Ditemukan' in (r['title'] or ''): r['err']='not found'; return r
    st=json.dumps(json.loads(m.group(1)),ensure_ascii=False)
    r['dim']=sorted(set(re.findall(r'Dimensi[^:<"]{0,25}:\s*[^<"]{0,70}',st)))
    r['other']=sorted(set(re.findall(r'(?:Isi set|Isi paket|Ukuran|Diameter|Kapasitas|Material|Bahan|Warna)[^:<"]{0,20}:\s*[^<"]{0,70}',st)))[:8]
    imgs=re.findall(r'ruparupa-com/image/upload/Products/'+s+r'_\d+\.jpg',st)
    r['imgs']=sorted(set(imgs))
    return r
with ThreadPoolExecutor(6) as ex: res=list(ex.map(get,mm))
json.dump(res,open('rr.json','w'),indent=1,ensure_ascii=False)
for r in res: print(r['sku'],r.get('title') or r.get('err'),'|',r.get('dim'),'|',len(r.get('imgs',[])),'imgs')
