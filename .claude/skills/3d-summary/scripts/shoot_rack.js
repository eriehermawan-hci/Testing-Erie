const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname, outDir=process.argv[2], only=process.argv[3]||'';
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end()}else{r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d)}})}).listen(0,async()=>{
  const port=srv.address().port; const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  fs.mkdirSync(outDir,{recursive:true}); let n=0;
  const jobs=[['wall-p1','Wall1_P1',1100,1500],['wall-p2','Wall2_P2',1100,1500],['pallet-1-piring','Pallet1_P1_Piring',1300,1000],['pallet-1-mangkuk','Pallet1_P1_Mangkuk',1300,1000],['pallet-1-mug','Pallet1_P1_Mug',1300,1000],['pallet-2','Pallet2_P2',1300,1000]].filter(j=>!only||only.split(',').includes(j[0]));
  for(const [id,name,w,h] of jobs) for(const view of ['front','angle']){
    const pg=await b.newPage({viewport:{width:w,height:h}}); pg.on('pageerror',e=>console.log('ERR',e.message)); pg.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
    await pg.goto(`http://localhost:${port}/rack_local.html?shot=${view}&t=${n++}#${id}`,{timeout:900000}); await pg.waitForFunction('window.__ready',null,{timeout:900000}); await pg.waitForTimeout(800);
    await pg.screenshot({timeout:600000,path:path.join(outDir,`${name}_${view==='front'?'depan':'miring'}.png`)}); console.log('ok',id,view); await pg.close();
  }
  await b.close(); srv.close();
});
