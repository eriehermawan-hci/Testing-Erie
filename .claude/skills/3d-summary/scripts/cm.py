import re,json,subprocess,time,sys
def page(s):
    for i in range(4):
        h=subprocess.run(['curl','-sS','-m','40','-L','-A','Mozilla/5.0',f'https://www.ruparupa.com/p/{s}'],capture_output=True,text=True).stdout
        m=re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',h,re.S)
        if m: return json.loads(m.group(1))['props']['pageProps']['results']['productDetail']
        time.sleep(2*(i+1))
for s in sys.argv[1:]:
    pd=page(s)
    if not pd: print(s,'FAILED'); continue
    st=json.dumps(pd,ensure_ascii=False)
    hits=sorted(set(re.findall(r'[^"<>{}]{0,50}\d+[.,]?\d*\s?(?:cm|CM|mm|ml|ML)\b[^"<>{}]{0,40}',st)))
    print(s,[x.strip() for x in hits][:12])
