'use strict';

const ORIGIN='https://allyssonestadulho92.github.io';
const TIMEOUT_MS=12000;
const EXAMPLES=[
  {
    name:'Continente',
    pid:'8167440',
    url:'https://www.continente.pt/produto/compressas-gaze-20-x-20-cm-continente-8167440.html',
    imageHost:'www.continente.pt',
    imagePath:'/Sites-col-master-catalog/'
  },
  {
    name:'Pingo Doce',
    pid:'739490',
    url:'https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html',
    imageHost:'static.pingodoce.pt',
    imagePath:'/Sites-pingo-doce-master/'
  }
];

function headers(extra={}){return {Origin:ORIGIN,'User-Agent':'ContaDeCasa-MarketSourceAudit/1.3',...extra};}
function parseSse(text){
  const events=[];
  for(const block of String(text||'').split(/\n\n+/)){
    const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trim()).join('\n');
    if(!data)continue;
    try{events.push(JSON.parse(data));}catch(_error){}
  }
  return events;
}
async function request(url,init={}){
  const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(TIMEOUT_MS),...init,headers:headers(init.headers||{})});
  const text=await response.text();
  return {response,text,events:parseSse(text)};
}
function urlsFrom(value){
  return [...new Set((String(value||'').replace(/\\\//g,'/').match(/https?:\/\/[^\s"'<>\\)]+/g)||[]).map(url=>url.replace(/[},\]]+$/g,'')))];
}
async function probeCesta(){
  try{
    const common={Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'};
    const init=await request('https://cesta.pt/mcp',{method:'POST',headers:common,body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa source audit',version:'1.3.0'}}})});
    await request('https://cesta.pt/mcp',{method:'POST',headers:common,body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})}).catch(()=>null);
    const called=await request('https://cesta.pt/mcp',{method:'POST',headers:common,body:JSON.stringify({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'search_products',arguments:{query:'leite meio gordo',limit:20}}})});
    const text=called.events?.[0]?.result?.content?.find(item=>item?.type==='text')?.text||'';
    const hasContinente=/Continente\s*·/.test(text),hasPingo=/Pingo Doce\s*·/.test(text);
    console.log(`cesta.pt: status ${init.response.status}/${called.response.status}; Continente=${hasContinente}; PingoDoce=${hasPingo}`);
  }catch(error){
    console.warn(`cesta.pt probe indisponível: ${error?.name||'Error'} ${error?.message||''}`);
  }
}
async function probeRetailerImage(example){
  try{
    const reader=`https://r.jina.ai/${example.url}`;
    const result=await request(reader,{headers:{Accept:'application/json','X-With-Images-Summary':'true','X-Retain-Images':'true'}});
    const urls=urlsFrom(result.text);
    const exact=urls.find(raw=>{
      try{
        const url=new URL(raw);
        return url.hostname===example.imageHost&&decodeURIComponent(url.pathname).includes(example.imagePath)&&decodeURIComponent(url.pathname).includes(example.pid)&&/\.(?:jpe?g|png|webp)$/i.test(url.pathname);
      }catch(_error){return false;}
    });
    console.log(`${example.name}: reader ${result.response.status}; CORS=${result.response.headers.get('access-control-allow-origin')||'n/a'}; exact-image=${Boolean(exact)}`);
  }catch(error){
    console.warn(`${example.name} image probe indisponível: ${error?.name||'Error'} ${error?.message||''}`);
  }
}

(async()=>{
  await probeCesta();
  for(const example of EXAMPLES)await probeRetailerImage(example);
})();
