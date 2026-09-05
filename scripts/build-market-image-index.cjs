'use strict';

const fs=require('node:fs');
const path=require('node:path');

const CESTA_URL='https://cesta.pt/mcp';
const TIMEOUT_MS=18000;
const SEARCH_LIMIT=12;
const CONCURRENCY=10;
const OUTPUT=path.resolve(process.argv[2]||'dist/market-image-index.json');
const QUERIES=Object.freeze([
  'leite','arroz','massa','farinha','azeite','café','água','ovos','iogurte','queijo',
  'frango','atum','detergente loiça','detergente roupa','papel higiénico','champô',
  'fraldas','chocolate','bolachas','cereais'
]);

function clean(value,max=180){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
function events(text){return String(text||'').split(/\n\n+/).flatMap(block=>{const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trim()).join('\n');if(!data)return[];try{return[JSON.parse(data)]}catch{return[];}});}
async function rpc(payload){
  const response=await fetch(CESTA_URL,{method:'POST',headers:{Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'},body:JSON.stringify(payload),signal:AbortSignal.timeout(TIMEOUT_MS)});
  if(!response.ok)throw new Error(`cesta-http-${response.status}`);
  const event=events(await response.text())[0]||null;
  if(event?.error)throw new Error('cesta-rpc-error');
  return event;
}
async function initCesta(){
  await rpc({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa image index',version:'58'}}});
  await rpc({jsonrpc:'2.0',method:'notifications/initialized'});
}
function safeRetailerUrl(value,marketId){
  try{
    const url=new URL(String(value||''));
    if(url.protocol!=='https:')return '';
    const allowed=marketId==='continente'?new Set(['continente.pt','www.continente.pt']):new Set(['pingodoce.pt','www.pingodoce.pt']);
    return allowed.has(url.hostname.toLowerCase())?url.href:'';
  }catch{return '';}
}
function parseSearch(text){
  const lines=String(text||'').split('\n');
  const out=[];
  for(let index=0;index<lines.length;index+=1){
    const line=lines[index].trim();
    if(!line.startsWith('- '))continue;
    const parts=line.slice(2).split(' · ').map(part=>part.trim()).filter(Boolean);
    if(parts.length<4)continue;
    const marketId=parts[0]==='Continente'?'continente':parts[0]==='Pingo Doce'?'pingo-doce':'';
    if(!marketId)continue;
    const pid=clean(line.match(/\bpid\s+([^·\s]+)/i)?.[1]||'',32);
    if(!pid)continue;
    const possible=(lines[index+1]||'').trim();
    const sourceUrl=safeRetailerUrl(possible,marketId);
    if(sourceUrl)index+=1;
    out.push({marketId,pid,name:clean(parts[1],120),pack:clean(parts[2],80),sourceUrl});
  }
  return out;
}
async function search(query){
  const event=await rpc({jsonrpc:'2.0',id:`search-${query}`,method:'tools/call',params:{name:'search_products',arguments:{query,stores:['pingodoce','continente'],limit:SEARCH_LIMIT}}});
  return parseSearch(event?.result?.content?.find(item=>item?.type==='text')?.text||'');
}
function decodeHtml(value=''){
  return String(value).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
function absolute(raw,base){try{return new URL(decodeHtml(raw),base).href;}catch{return '';}}
function candidateScore(url,product){
  let parsed;try{parsed=new URL(url);}catch{return -999;}
  const host=parsed.hostname.toLowerCase();
  const pathname=parsed.pathname.toLowerCase();
  const pid=product.pid.toLowerCase();
  if(product.marketId==='continente'){
    if(!['www.continente.pt','continente.pt'].includes(host))return -999;
  }else if(!['static.pingodoce.pt','www.pingodoce.pt','pingodoce.pt'].includes(host))return -999;
  if(/noimage|transparent|footer|navigation|referenceentities|categories|app-store|google-play|payment|logo/i.test(pathname))return -50;
  let score=0;
  if(url.toLowerCase().includes(pid))score+=12;
  if(product.marketId==='continente'&&/\/images\/col\//i.test(pathname))score+=8;
  if(product.marketId==='continente'&&/-frente\.(?:jpe?g|png|webp)$/i.test(pathname))score+=8;
  if(product.marketId==='pingo-doce'&&host==='static.pingodoce.pt')score+=8;
  if(product.marketId==='pingo-doce'&&new RegExp(`/images/(?:large|medium)/${pid}[_-]`,'i').test(pathname))score+=12;
  if(/\/dw\/image\//i.test(pathname))score+=4;
  if(/\.(?:jpe?g|png|webp)$/i.test(pathname))score+=2;
  return score;
}
function extractOfficialImage(html,product){
  const candidates=[];
  const add=raw=>{const url=absolute(raw,product.sourceUrl);if(url&&!candidates.includes(url))candidates.push(url);};
  for(const match of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi))add(match[1]);
  for(const match of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/gi))add(match[1]);
  for(const match of html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi))add(match[1]);
  let best='',bestScore=0;
  for(const url of candidates){const score=candidateScore(url,product);if(score>bestScore){best=url;bestScore=score;}}
  return bestScore>=12?best:'';
}
async function resolve(product){
  if(!product.sourceUrl)return null;
  try{
    const response=await fetch(product.sourceUrl,{headers:{'User-Agent':'ContaDeCasa-OfficialImageIndex/58',Accept:'text/html,application/xhtml+xml'},redirect:'follow',signal:AbortSignal.timeout(TIMEOUT_MS)});
    if(!response.ok)return null;
    const imageUrl=extractOfficialImage(await response.text(),product);
    return imageUrl?{...product,key:`${product.marketId}:${product.pid}`,imageUrl}:null;
  }catch{return null;}
}
async function mapLimit(items,limit,worker){
  const output=new Array(items.length);let cursor=0;
  async function run(){while(true){const index=cursor++;if(index>=items.length)return;output[index]=await worker(items[index],index);}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));
  return output;
}
(async()=>{
  await initCesta();
  const products=new Map();
  for(const query of QUERIES){
    try{for(const item of await search(query))products.set(`${item.marketId}:${item.pid}`,item);}catch(error){console.warn(`Pesquisa ${query} ignorada: ${error.message}`);}
  }
  const resolved=(await mapLimit([...products.values()],CONCURRENCY,resolve)).filter(Boolean);
  resolved.sort((a,b)=>a.marketId.localeCompare(b.marketId)||a.name.localeCompare(b.name,'pt-PT'));
  if(resolved.length<20)throw new Error(`Índice oficial insuficiente: apenas ${resolved.length} imagens válidas.`);
  const payload={version:58,generatedAt:new Date().toISOString(),queries:QUERIES,entries:resolved};
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  fs.writeFileSync(OUTPUT,JSON.stringify(payload));
  console.log(`Official market image index: ${resolved.length}/${products.size} products -> ${OUTPUT}`);
})().catch(error=>{console.error(error);process.exitCode=1;});
