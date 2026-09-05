'use strict';

const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const OUTPUT_DIR=path.join(ROOT,'retailer-images');
const REQUEST_TIMEOUT_MS=25000;
const MAX_XML_BYTES=16*1024*1024;
const MIN_EXPECTED_PRODUCTS=5000;
const USER_AGENT='ContaDeCasa-OfficialImageIndex/1.0';

const RETAILERS=Object.freeze({
  continente:Object.freeze({
    id:'continente',
    index:'https://www.continente.pt/sitemap_index.xml',
    child:url=>/sitemap-custom_sitemap_\d+-image\.xml(?:$|\?)/i.test(url),
    imageHost:'www.continente.pt'
  }),
  'pingo-doce':Object.freeze({
    id:'pingo-doce',
    index:'https://www.pingodoce.pt/home/sitemap_index.xml',
    child:url=>/\/home\/sitemap_\d+-product\.xml(?:$|\?)/i.test(url),
    imageHost:'static.pingodoce.pt'
  })
});

function decodeXml(value=''){
  return String(value)
    .replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"')
    .replace(/&apos;|&#39;/g,"'")
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>');
}

function xmlLocs(xml){
  return [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/gi)].map(match=>decodeXml(match[1].trim()));
}

function productIdFromUrl(value){
  try{
    const url=new URL(String(value));
    const match=url.pathname.match(/-(\d{2,32})\.html$/i);
    return match?.[1]||'';
  }catch(_error){return '';}
}

function officialImageUrl(retailerId,value){
  if(!value)return '';
  try{
    const url=new URL(decodeXml(value));
    if(url.protocol!=='https:')return '';
    const host=url.hostname.toLowerCase();
    if(retailerId==='continente'){
      const allowed=new Set(['www.continente.pt','continente.pt','bdvs-prd.my.commercecloud.salesforce.com']);
      if(!allowed.has(host))return '';
      if(!url.pathname.includes('/Sites-col-master-catalog/')||!url.pathname.includes('/images/col/'))return '';
      url.protocol='https:';
      url.hostname='www.continente.pt';
      url.port='';
      url.searchParams.set('sw','900');
      url.searchParams.set('sh','900');
      return url.href;
    }
    if(retailerId==='pingo-doce'){
      if(host!=='static.pingodoce.pt')return '';
      if(!url.pathname.includes('/Sites-pingo-doce-master/')||!url.pathname.includes('/images/'))return '';
      return url.href;
    }
    return '';
  }catch(_error){return '';}
}

function parseProductImages(retailerId,xml){
  const products=new Map();
  for(const match of String(xml).matchAll(/<url>([\s\S]*?)<\/url>/gi)){
    const block=match[1];
    const pageMatch=block.match(/<loc>([^<]+)<\/loc>/i);
    const imageMatch=block.match(/<image:loc>([^<]+)<\/image:loc>/i);
    if(!pageMatch||!imageMatch)continue;
    const pid=productIdFromUrl(decodeXml(pageMatch[1]));
    const image=officialImageUrl(retailerId,imageMatch[1]);
    if(pid&&image&&!products.has(pid))products.set(pid,image);
  }
  return products;
}

async function fetchText(url,attempt=1){
  try{
    const response=await fetch(url,{
      redirect:'follow',
      signal:AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers:{'User-Agent':USER_AGENT,Accept:'application/xml,text/xml,text/plain;q=0.9,*/*;q=0.1'}
    });
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const declared=Number(response.headers.get('content-length')||0);
    if(declared>MAX_XML_BYTES)throw new Error(`XML demasiado grande (${declared} bytes)`);
    const bytes=new Uint8Array(await response.arrayBuffer());
    if(bytes.byteLength>MAX_XML_BYTES)throw new Error(`XML demasiado grande (${bytes.byteLength} bytes)`);
    const text=new TextDecoder().decode(bytes);
    if(!/<(?:sitemapindex|urlset)\b/i.test(text))throw new Error('Resposta não é um sitemap XML reconhecido');
    return text;
  }catch(error){
    if(attempt<2)return fetchText(url,attempt+1);
    throw new Error(`${url}: ${error?.message||'falha de rede'}`);
  }
}

async function mapLimit(items,limit,worker){
  const results=new Array(items.length);
  let cursor=0;
  async function run(){
    while(cursor<items.length){
      const index=cursor++;
      results[index]=await worker(items[index],index);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));
  return results;
}

async function buildRetailer(retailer){
  const indexXml=await fetchText(retailer.index);
  const children=xmlLocs(indexXml).filter(retailer.child);
  if(!children.length)throw new Error(`${retailer.id}: sitemap de produtos/imagens não encontrado`);
  const maps=await mapLimit(children,3,async url=>({url,products:parseProductImages(retailer.id,await fetchText(url))}));
  const merged=new Map();
  for(const map of maps){
    for(const [pid,image] of map.products){if(!merged.has(pid))merged.set(pid,image);}
  }
  if(merged.size<MIN_EXPECTED_PRODUCTS)throw new Error(`${retailer.id}: catálogo oficial incompleto (${merged.size} produtos)`);
  return {retailer,children,products:merged};
}

function shardPrefix(pid){return String(pid).padStart(2,'0').slice(0,2);}

function writeRetailerShards(result,generatedAt){
  const retailerDir=path.join(OUTPUT_DIR,result.retailer.id);
  fs.mkdirSync(retailerDir,{recursive:true});
  const shards=new Map();
  for(const [pid,image] of result.products){
    const prefix=shardPrefix(pid);
    if(!shards.has(prefix))shards.set(prefix,{});
    shards.get(prefix)[pid]=image;
  }
  const names=[...shards.keys()].sort();
  for(const prefix of names){
    const products=shards.get(prefix);
    const ordered={};
    for(const pid of Object.keys(products).sort((a,b)=>Number(a)-Number(b)))ordered[pid]=products[pid];
    fs.writeFileSync(path.join(retailerDir,`${prefix}.json`),JSON.stringify({v:1,r:result.retailer.id,g:generatedAt,p:ordered}));
  }
  return names;
}

async function main(){
  const generatedAt=new Date().toISOString();
  const results=[];
  for(const retailer of Object.values(RETAILERS))results.push(await buildRetailer(retailer));

  const continente=results.find(item=>item.retailer.id==='continente')?.products;
  const pingo=results.find(item=>item.retailer.id==='pingo-doce')?.products;
  if(!continente?.has('8167440'))throw new Error('Continente: SKU de controlo 8167440 sem imagem oficial no sitemap');
  if(!pingo?.has('739490'))throw new Error('Pingo Doce: SKU de controlo 739490 sem imagem oficial no sitemap');

  fs.rmSync(OUTPUT_DIR,{recursive:true,force:true});
  fs.mkdirSync(OUTPUT_DIR,{recursive:true});
  const meta={version:1,generatedAt,retailers:{}};
  for(const result of results){
    const shards=writeRetailerShards(result,generatedAt);
    meta.retailers[result.retailer.id]={count:result.products.size,shards,sitemaps:result.children.length};
  }
  fs.writeFileSync(path.join(OUTPUT_DIR,'index.json'),JSON.stringify(meta));
  console.log(`Official image index: Continente ${continente.size} produtos; Pingo Doce ${pingo.size} produtos; ${Object.values(meta.retailers).reduce((n,r)=>n+r.shards.length,0)} shards.`);
}

main().catch(error=>{
  console.error(`Official image index failed: ${error?.message||error}`);
  process.exitCode=1;
});
