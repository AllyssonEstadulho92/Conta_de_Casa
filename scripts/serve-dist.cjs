'use strict';

const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..','dist');
const PORT=Number(process.env.PORT||4173);
const HOST=process.env.HOST||'127.0.0.1';

const TYPES=Object.freeze({
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp',
  '.txt':'text/plain; charset=utf-8'
});

function resolveFile(urlPath){
  const pathname=decodeURIComponent(String(urlPath||'/').split('?')[0].split('#')[0]);
  const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/, '');
  const absolute=path.resolve(ROOT,relative);
  if(!absolute.startsWith(ROOT+path.sep)&&absolute!==ROOT)return null;
  return absolute;
}

const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method||'')){
    res.writeHead(405,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
    res.end('Method Not Allowed');
    return;
  }

  const file=resolveFile(req.url);
  if(!file||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
    res.end('Not Found');
    return;
  }

  const type=TYPES[path.extname(file).toLowerCase()]||'application/octet-stream';
  const headers={
    'Content-Type':type,
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'no-referrer'
  };
  res.writeHead(200,headers);
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT,HOST,()=>{
  console.log(`Conta de Casa E2E server: http://${HOST}:${PORT}`);
});

function shutdown(){
  server.close(()=>process.exit(0));
  setTimeout(()=>process.exit(1),2000).unref();
}
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);
