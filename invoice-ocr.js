'use strict';

/* Conta de Casa — OCR local e sob demanda para faturas.
 * 76-invoice-local-ocr1:
 * - Tesseract.js, core WebAssembly e dados "por" são servidos pela própria aplicação;
 * - o worker só é criado quando Ler fatura precisa de OCR;
 * - fotografias grandes são reduzidas antes do OCR para limitar memória no iPhone;
 * - nenhuma imagem ou texto reconhecido é enviado para serviços externos.
 */
(function installInvoiceOcr(root){
  const SCRIPT_URL='./vendor/ocr/tesseract.min.js';
  const WORKER_URL='./vendor/ocr/worker.min.js';
  const CORE_URL='./vendor/ocr/core';
  const LANG_URL='./vendor/ocr/lang';
  const MAX_DIMENSION=2200;
  const MAX_PIXELS=4_500_000;
  const WORKER_IDLE_MS=90_000;
  let enginePromise=null;
  let workerPromise=null;
  let worker=null;
  let idleTimer=0;
  let progressListener=null;

  function sameOriginUrl(value){
    try{
      const url=new URL(value,document.baseURI);
      return url.origin===location.origin?url.href:'';
    }catch(_error){return '';}
  }

  function scheduleWorkerRelease(){
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{
      const current=worker;
      worker=null;
      workerPromise=null;
      if(current?.terminate)Promise.resolve(current.terminate()).catch(()=>undefined);
    },WORKER_IDLE_MS);
  }

  function loadEngine(){
    if(root.Tesseract?.createWorker)return Promise.resolve(root.Tesseract);
    if(enginePromise)return enginePromise;
    enginePromise=new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-invoice-ocr-engine]');
      const finish=()=>root.Tesseract?.createWorker?resolve(root.Tesseract):reject(new Error('ocr-engine-unavailable'));
      if(existing){
        existing.addEventListener('load',finish,{once:true});
        existing.addEventListener('error',()=>reject(new Error('ocr-engine-load-failed')),{once:true});
        setTimeout(finish,200);
        return;
      }
      const src=sameOriginUrl(SCRIPT_URL);
      if(!src){reject(new Error('ocr-engine-source-invalid'));return;}
      const script=document.createElement('script');
      script.src=src;
      script.async=true;
      script.dataset.invoiceOcrEngine='';
      script.referrerPolicy='no-referrer';
      script.addEventListener('load',finish,{once:true});
      script.addEventListener('error',()=>reject(new Error('ocr-engine-load-failed')),{once:true});
      document.head.appendChild(script);
    }).catch(error=>{enginePromise=null;throw error;});
    return enginePromise;
  }

  function emitProgress(message){
    try{progressListener?.(message);}catch(_error){}
  }

  async function ensureWorker(){
    if(worker)return worker;
    if(workerPromise)return workerPromise;
    workerPromise=(async()=>{
      const engine=await loadEngine();
      const workerPath=sameOriginUrl(WORKER_URL);
      const corePath=sameOriginUrl(CORE_URL);
      const langPath=sameOriginUrl(LANG_URL);
      if(!workerPath||!corePath||!langPath)throw new Error('ocr-runtime-source-invalid');
      const created=await engine.createWorker('por',1,{
        workerPath,
        corePath,
        langPath:langPath.replace(/\/$/,''),
        workerBlobURL:false,
        logger:message=>emitProgress(message)
      });
      worker=created;
      scheduleWorkerRelease();
      return created;
    })().catch(error=>{
      workerPromise=null;
      worker=null;
      throw error;
    });
    return workerPromise;
  }

  async function canvasBlob(canvas,type='image/jpeg',quality=.9){
    return new Promise(resolve=>{
      try{canvas.toBlob(blob=>resolve(blob||null),type,quality);}
      catch(_error){resolve(null);}
    });
  }

  async function prepareImage(file){
    if(typeof root.createImageBitmap!=='function')return {input:file,release:()=>{}};
    let bitmap=null;
    try{
      bitmap=await root.createImageBitmap(file);
      const width=Number(bitmap.width)||0;
      const height=Number(bitmap.height)||0;
      if(!width||!height)return {input:file,release:()=>{try{bitmap?.close?.();}catch(_error){}}};
      const dimensionScale=Math.min(1,MAX_DIMENSION/Math.max(width,height));
      const pixelScale=Math.min(1,Math.sqrt(MAX_PIXELS/(width*height)));
      const scale=Math.min(dimensionScale,pixelScale);
      if(scale>=.995)return {input:file,release:()=>{try{bitmap?.close?.();}catch(_error){}}};

      const targetWidth=Math.max(1,Math.round(width*scale));
      const targetHeight=Math.max(1,Math.round(height*scale));
      const canvas=document.createElement('canvas');
      canvas.width=targetWidth;
      canvas.height=targetHeight;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)return {input:file,release:()=>{try{bitmap?.close?.();}catch(_error){}}};
      ctx.fillStyle='#fff';
      ctx.fillRect(0,0,targetWidth,targetHeight);
      ctx.drawImage(bitmap,0,0,targetWidth,targetHeight);
      const blob=await canvasBlob(canvas);
      return {
        input:blob||file,
        release:()=>{try{bitmap?.close?.();}catch(_error){} canvas.width=1;canvas.height=1;}
      };
    }catch(_error){
      try{bitmap?.close?.();}catch(_closeError){}
      return {input:file,release:()=>{}};
    }
  }

  function progressText(message){
    const status=String(message?.status||'').toLowerCase();
    const pct=Math.max(0,Math.min(100,Math.round(Number(message?.progress||0)*100)));
    if(status.includes('recognizing text'))return `A reconhecer texto da fatura… ${pct}%`;
    if(status.includes('loading language'))return `A preparar português… ${pct}%`;
    if(status.includes('loading tesseract core'))return 'A preparar o leitor local…';
    if(status.includes('initializing'))return `A iniciar OCR local… ${pct}%`;
    return pct>0?`A analisar a fatura… ${pct}%`:'A analisar a fatura…';
  }

  async function recognize(file,options={}){
    if(!(file instanceof Blob))throw new Error('ocr-image-required');
    const prepared=await prepareImage(file);
    progressListener=message=>{
      const text=progressText(message);
      options.onProgress?.({status:String(message?.status||''),progress:Number(message?.progress||0),text});
    };
    try{
      const activeWorker=await ensureWorker();
      scheduleWorkerRelease();
      const result=await activeWorker.recognize(prepared.input,{rotateAuto:true});
      scheduleWorkerRelease();
      const text=String(result?.data?.text||'').trim();
      if(!text)throw new Error('ocr-empty');
      return {
        text,
        confidence:Number(result?.data?.confidence||0)
      };
    }finally{
      progressListener=null;
      prepared.release();
    }
  }

  async function terminate(){
    clearTimeout(idleTimer);
    const current=worker;
    worker=null;
    workerPromise=null;
    if(current?.terminate)await Promise.resolve(current.terminate()).catch(()=>undefined);
  }

  root.CDCInvoiceOcr=Object.freeze({
    recognize,
    terminate,
    progressText,
    config:Object.freeze({maxDimension:MAX_DIMENSION,maxPixels:MAX_PIXELS,language:'por'})
  });
})(typeof window!=='undefined'?window:globalThis);
