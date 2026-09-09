'use strict';

/* Conta de Casa — resolvedor direto e limitado de fotografias oficiais (75-catalog2). */
(function installCatalogImageResolver(root){
  const REVISION='75-catalog2';
  const JINA_READER_ORIGIN='https://r.jina.ai';
  const REQUEST_TIMEOUT_MS=8000;
  const MAX_CONCURRENT=2;
  const queue=[];
  const inFlight=new Map();
  let active=0;

  const clean=(value,max=180)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);

  function identity(target={}){
    const marketId=clean(target.marketId,24).toLowerCase();
    const pid=String(target.pid??'').replace(/\D/g,'').slice(0,32);
    if(!pid||!['continente','pingo-doce'].includes(marketId))return null;
    return {marketId,pid,key:`${marketId}|${pid}`};
  }

  function extractUrls(value){
    const source=String(value||'').replace(/\\\//g,'/').replace(/&amp;/g,'&');
    const found=source.match(/https?:\/\/[^\s"'<>\\)]+/g)||[];
    return [...new Set(found.map(item=>item.replace(/[},\]]+$/g,'')))].slice(0,260);
  }

  function selectOfficialImage(body,target){
    const official=root.CDCOfficialMarketImages;
    if(!official?.safeOfficialImageUrl)return '';
    const candidates=[];
    for(const raw of extractUrls(body)){
      const safe=official.safeOfficialImageUrl(raw,target.marketId,target.pid);
      if(!safe)continue;
      let priority=0;
      if(target.marketId==='continente'){
        if(/-frente\./i.test(safe))priority+=8;
        if(/[?&]sw=2000\b/i.test(safe))priority+=3;
        if(/\/dw\/image\/v2\//i.test(safe))priority+=2;
      }else{
        if(/\/images\/large\//i.test(safe))priority+=8;
        if(/\/images\/medium\//i.test(safe))priority+=3;
      }
      candidates.push({url:safe,priority});
    }
    candidates.sort((a,b)=>b.priority-a.priority||a.url.length-b.url.length);
    return candidates[0]?.url||'';
  }

  async function timedFetch(url){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    try{
      return await fetch(url,{method:'GET',headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
    }finally{clearTimeout(timer);}
  }

  function queued(task){return new Promise((resolve,reject)=>{queue.push({task,resolve,reject});runQueue();});}
  function runQueue(){
    while(active<MAX_CONCURRENT&&queue.length){
      const entry=queue.shift();active+=1;
      Promise.resolve().then(entry.task).then(entry.resolve,entry.reject).finally(()=>{active-=1;runQueue();});
    }
  }

  async function resolveUnqueued(target){
    const id=identity(target);if(!id)return null;
    const official=root.CDCOfficialMarketImages;
    if(!official?.safeProductUrl||!official?.safeOfficialImageUrl)return null;
    const sourceUrl=official.safeProductUrl(target.sourceUrl,id.marketId,id.pid);
    if(!sourceUrl)return null;
    const response=await timedFetch(`${JINA_READER_ORIGIN}/${sourceUrl}`);
    if(!response.ok)throw new Error(`catalog-image-reader-${response.status}`);
    const imageUrl=selectOfficialImage(await response.text(),id);
    if(!imageUrl)return null;

    /*
     * Não fazemos aqui um segundo carregamento visual bloqueante.
     * O URL já foi obtido da página oficial exata e passou host/path/PID. No Safari,
     * esse preflight visual podia ficar até 10 s à espera e transformar uma fotografia
     * válida num falso negativo. O componente visual é quem testa o carregamento real;
     * se falhar, a biblioteca elimina a entrada e mantém o fallback.
     */
    return {
      imageUrl,sourceUrl,marketId:id.marketId,pid:id.pid,
      name:clean(target.name,140),pack:clean(target.pack,100),
      source:`${id.marketId==='continente'?'Continente':'Pingo Doce'} · imagem oficial`
    };
  }

  function resolve(target={}){
    const id=identity(target);if(!id)return Promise.resolve(null);
    if(inFlight.has(id.key))return inFlight.get(id.key);
    const promise=queued(()=>resolveUnqueued(target)).catch(()=>null).finally(()=>inFlight.delete(id.key));
    inFlight.set(id.key,promise);
    return promise;
  }

  root.CDCMarketCatalogImageResolver=Object.freeze({revision:REVISION,resolve,identity,selectOfficialImage});

  const base=root.CDCOfficialMarketImages;
  if(base?.resolve&&base?.safeProductUrl&&base?.safeOfficialImageUrl&&!base.catalogDirectResolver){
    root.CDCOfficialMarketImages=Object.freeze({
      ...base,
      catalogDirectResolver:REVISION,
      resolve(target={}){
        if(!target?.sourceUrl)return base.resolve(target);
        return resolve(target).then(result=>result||base.resolve(target));
      }
    });
  }
})(globalThis);
