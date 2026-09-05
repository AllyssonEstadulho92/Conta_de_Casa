'use strict';

const URL='https://cesta.pt/mcp';
const COMMON={Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'};
function events(text){return String(text||'').split(/\n\n+/).flatMap(block=>{const data=block.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trim()).join('\n');if(!data)return[];try{return[JSON.parse(data)]}catch{return[]}})}
async function rpc(payload){const r=await fetch(URL,{method:'POST',headers:COMMON,body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)});const text=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status}`);return events(text)[0]||null}
(async()=>{
  await rpc({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa detail audit',version:'1.0'}}});
  await rpc({jsonrpc:'2.0',method:'notifications/initialized'});
  for(const [store,pid] of [['continente','6927230'],['pingodoce','48150']]){
    const event=await rpc({jsonrpc:'2.0',id:store==='continente'?2:3,method:'tools/call',params:{name:'get_product',arguments:{store,pid}}});
    console.log(`\n=== cesta get_product ${store} ${pid} ===`);
    console.log(JSON.stringify(event,null,2));
  }
})().catch(error=>{console.error(error);process.exitCode=1});
