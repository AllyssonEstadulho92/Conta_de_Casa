'use strict';

const ORIGIN='https://allyssonestadulho92.github.io';
const TIMEOUT_MS=15000;
const EXAMPLES={
  continente:'https://www.continente.pt/produto/compressas-gaze-20-x-20-cm-continente-8167440.html',
  pingodoce:'https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html'
};

function headers(extra={}){
  return {Origin:ORIGIN,'User-Agent':'ContaDeCasa-MarketSourceAudit/1.1',...extra};
}
function parseSse(text){
  const events=[];
  for(const block of String(text||'').split(/\n\n+/)){
    const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trim()).join('\n');
    if(!data)continue;
    try{events.push(JSON.parse(data));}catch(_error){events.push({raw:data});}
  }
  return events;
}
async function request(url,init={}){
  const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(TIMEOUT_MS),...init,headers:headers(init.headers||{})});
  const text=await response.text();
  return {response,text,events:parseSse(text)};
}
async function probe(name,url,init={}){
  try{
    const {response,text}=await request(url,init);
    console.log(`\n=== ${name} ===`);
    console.log('url:',response.url);
    console.log('status:',response.status);
    console.log('content-type:',response.headers.get('content-type'));
    console.log('access-control-allow-origin:',response.headers.get('access-control-allow-origin'));
    console.log('body:',text.slice(0,2200).replace(/\s+/g,' '));
    return {response,text};
  }catch(error){
    console.log(`\n=== ${name} ===`);
    console.log('ERROR:',error?.name,error?.message);
    return null;
  }
}
function htmlImageCandidates(html){
  const values=[];
  const patterns=[
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/gi,
    /"image"\s*:\s*"(https?:\\?\/\\?\/[^"\\]+)"/gi,
    /https?:\\?\/\\?\/[^"'<>\s]+\.(?:jpe?g|png|webp)(?:\?[^"'<>\s]*)?/gi
  ];
  for(const pattern of patterns){
    let match;
    while((match=pattern.exec(html))){
      const value=(match[1]||match[0]||'').replace(/\\\//g,'/').replace(/&amp;/g,'&');
      if(value&&!values.includes(value))values.push(value);
      if(values.length>=25)return values;
    }
  }
  return values;
}
async function inspectRetailerPage(name,url){
  const result=await probe(`${name} product page`,url);
  if(!result)return;
  console.log(`${name} image candidates:`,JSON.stringify(htmlImageCandidates(result.text).slice(0,12),null,2));
}
async function inspectMicrolink(name,url){
  const api=`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true&screenshot=false&video=false&audio=false`;
  const result=await probe(`Microlink ${name}`,api);
  if(!result)return;
  try{
    const payload=JSON.parse(result.text);
    console.log(`${name} microlink image:`,payload?.data?.image?.url||payload?.data?.image||'');
    console.log(`${name} microlink canonical:`,payload?.data?.url||'');
  }catch(_error){}
}
async function inspectJina(name,url){
  const reader=`https://r.jina.ai/${url}`;
  const result=await probe(`Jina Reader ${name}`,reader,{headers:{Accept:'text/plain'}});
  if(!result)return;
  console.log(`${name} jina image candidates:`,JSON.stringify(htmlImageCandidates(result.text).slice(0,12),null,2));
}
async function probeCestaMcp(){
  const init=await request('https://cesta.pt/mcp',{
    method:'POST',headers:{Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'},
    body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa source audit',version:'1.1.0'}}})
  });
  console.log('\n=== cesta MCP initialize ===');
  console.log('status:',init.response.status,'acao:',init.response.headers.get('access-control-allow-origin'));
  console.log('events:',JSON.stringify(init.events).slice(0,1800));
  const common={Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'};
  await request('https://cesta.pt/mcp',{method:'POST',headers:common,body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})}).catch(()=>null);
  const called=await request('https://cesta.pt/mcp',{method:'POST',headers:common,body:JSON.stringify({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'search_products',arguments:{query:'leite meio gordo',limit:5}}})});
  console.log('\n=== cesta sample live search ===');
  console.log('status:',called.response.status,'events:',JSON.stringify(called.events,null,2).slice(0,12000));
}

(async()=>{
  await probeCestaMcp();
  await inspectRetailerPage('Continente',EXAMPLES.continente);
  await inspectRetailerPage('Pingo Doce',EXAMPLES.pingodoce);
  await inspectMicrolink('Continente',EXAMPLES.continente);
  await inspectMicrolink('Pingo Doce',EXAMPLES.pingodoce);
  await inspectJina('Continente',EXAMPLES.continente);
  await inspectJina('Pingo Doce',EXAMPLES.pingodoce);
})();
