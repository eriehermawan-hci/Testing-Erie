import json,sys,re
variant=sys.argv[1]; out=sys.argv[2]
data=json.load(open('rack_data.json'))
models=open('models.js').read().replace("import * as THREE from 'three';\n","").replace("export function","function").replace("export const","const")
viewer=open('viewer.js').read().replace("/*DATA*/null",json.dumps({'skus':data['skus'],'fixtures':data['fixtures'],'trayMax':data['trayMax']},ensure_ascii=False,separators=(',',':')))
t=open('template.html').read()
if variant=='cdn':
    three='https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js'; addons='https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/'
else:
    three='/node_modules/three/build/three.module.js'; addons='/node_modules/three/examples/jsm/'
t=t.replace('{{THREE}}',three).replace('{{ADDONS}}',addons).replace('{{DITARIK}}',data['ditarik']).replace('{{MODELS}}',models).replace('{{VIEWER}}',viewer)
open(out,'w').write(t); print(out,len(t))
