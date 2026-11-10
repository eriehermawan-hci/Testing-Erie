const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end()}else{r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d)}})}).listen(0,async()=>{
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:700}}); pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto(`http://localhost:${srv.address().port}/rack_local.html#wall-p1`,{timeout:240000}); await pg.waitForFunction('window.__ready',null,{timeout:240000});
  fs.writeFileSync(process.argv[2],JSON.stringify(await pg.evaluate('window.__report()'),null,1)); console.log('report ok');
  await b.close(); srv.close();});
