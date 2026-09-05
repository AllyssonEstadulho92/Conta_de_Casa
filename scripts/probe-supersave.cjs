'use strict';

const ORIGIN='https://allyssonestadulho92.github.io';
const TIMEOUT=12000;
const base='https://supersave.pt';
const headers={'User-Agent':'ContaDeCasa-MarketSourceAudit/1.0',Origin:ORIGIN};

async function get(url){
  const res=await fetch(url,{headers,redirect:'follow',signal:AbortSignal.timeout(TIMEOUT)});
  const text=await res.text();
  console.log('\nGET',url,'status',res.status,'acao',res.headers.get('access-control-allow-origin'),'type',res.headers.get('content-type'));
  return {res,text};
}

(async()=>{
  const {text}=await get(`${base}/web/`);
  const scripts=[...text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>new URL(m[1],`${base}/web/`).href);
  console.log('scripts',JSON.stringify(scripts,null,2));
  for(const url of scripts){
    try{
      const {text:js}=await get(url);
      const hints=[...new Set((js.match(/https?:\\?\/\\?\/[^"'`\\s)]+|(?:api|graphql)[a-z0-9_./?=&:-]*/gi)||[]).map(x=>x.replace(/\\\//g,'/')))];
      const interesting=hints.filter(x=>/api|supersave|firebase|cloud|mercadona|product|search/i.test(x));
      if(interesting.length) console.log('hints for',url,JSON.stringify(interesting.slice(0,100),null,2));
      for(const needle of ['axios','fetch(','baseURL','firebase','api.','Mercadona','mercadona']){
        const idx=js.indexOf(needle);
        if(idx>=0) console.log('snippet',needle,js.slice(Math.max(0,idx-400),idx+1000).replace(/\s+/g,' '));
      }
    }catch(error){console.log('ERROR',url,error.name,error.message);}
  }
})();
