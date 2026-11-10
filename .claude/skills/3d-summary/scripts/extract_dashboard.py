"""Ambil data Summary Accs dari Dashboard.html (Drive) -> dash.html + mm.json.
Pemakaian: python3 extract_dashboard.py <file hasil download_file_content (JSON base64)> ["MAKAN & MINUM"]
Hasil: dash.html (HTML terdekode, dipakai build_data.py) dan mm.json (daftar SKU grup terpilih)."""
import base64, json, sys
raw = json.load(open(sys.argv[1]))['content']
html = base64.b64decode(raw).decode('utf-8', 'replace')
open('dash.html', 'w').write(html)
i = html.find('const D = ') + len('const D = ')
D, _ = json.JSONDecoder().raw_decode(html[i:])
grup = sys.argv[2] if len(sys.argv) > 2 else 'MAKAN & MINUM'
arts = [a for a in D['arts'] if a['grup'] == grup]
json.dump(arts, open('mm.json', 'w'), indent=1, ensure_ascii=False)
print(len(D['arts']), 'SKU total;', len(arts), 'SKU grup', grup)
