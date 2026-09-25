'use strict';

/* Conta de Casa — extração semântica de faturas a partir de texto reconhecido.
 * 76-invoice-hierarchy1:
 * - hierarquia de autoridade: manual > QR estruturado > OCR rotulado > regra de fornecedor > defaults;
 * - regras de reconhecimento são carregadas de invoice-extraction-rules.json com no-store,
 *   permitindo ajustar fornecedores/rótulos sem trocar o runtime da aplicação;
 * - o módulo não grava dados nem toca no DOM.
 */
(function installInvoiceExtractor(root){
  const RULES_URL='./invoice-extraction-rules.json';
  const MAX_TEXT_LENGTH=30000;
  let cachedRules=null;

  const FALLBACK_RULES=Object.freeze({
    schemaVersion:1,
    revision:'fallback-1',
    hierarchy:['manual','structured-qr','ocr-labeled','provider-rule','form-default'],
    fields:Object.freeze({
      amount:Object.freeze({labels:['total a pagar','valor a pagar','montante','saldo atual','total faturado no período','total faturado no periodo','total da fatura','total fatura','total']}),
      dueDate:Object.freeze({labels:['data limite','data de vencimento','data vencimento','vencimento','pagar até','pagar ate','limite de pagamento']}),
      issueDate:Object.freeze({labels:['data emissão','data emissao','data de emissão','data de emissao','emitida em','data documento']}),
      reference:Object.freeze({labels:['referência','referencia','ref. multibanco','referência multibanco','referencia multibanco']}),
      entity:Object.freeze({labels:['entidade','entidade multibanco']}),
      clientNumber:Object.freeze({labels:['cliente nº','cliente n°','cliente no','nº cliente','n° cliente','numero cliente','número cliente']}),
      issuerNif:Object.freeze({labels:['nif','nif emitente','contribuinte','número de contribuinte','numero de contribuinte']})
    }),
    methods:[],
    providers:[]
  });

  function clean(value,max=240){
    return String(value??'')
      .replace(/[\u0000-\u001f\u007f]/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .slice(0,max);
  }

  function normalize(value){
    return String(value??'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .replace(/[º°]/g,'o')
      .replace(/[^a-z0-9€%/.,:+\-\s]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function validRules(value){
    if(!value||typeof value!=='object'||Number(value.schemaVersion)!==1)return null;
    const fields=value.fields&&typeof value.fields==='object'?value.fields:{};
    const providers=Array.isArray(value.providers)?value.providers:[];
    const methods=Array.isArray(value.methods)?value.methods:[];
    return Object.freeze({
      schemaVersion:1,
      revision:clean(value.revision,80)||'runtime',
      hierarchy:Array.isArray(value.hierarchy)?value.hierarchy.map(item=>clean(item,40)).filter(Boolean):FALLBACK_RULES.hierarchy,
      fields,
      providers,
      methods
    });
  }

  async function loadRules(options={}){
    if(cachedRules&&!options.fresh)return cachedRules;
    if(typeof fetch!=='function')return cachedRules||FALLBACK_RULES;
    try{
      const stamp=Date.now().toString(36);
      const response=await fetch(`${RULES_URL}?ts=${stamp}`,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok)throw new Error('invoice-rules-http');
      const parsed=validRules(await response.json());
      if(!parsed)throw new Error('invoice-rules-invalid');
      cachedRules=parsed;
      return parsed;
    }catch(_error){
      return cachedRules||FALLBACK_RULES;
    }
  }

  function textLines(text){
    return String(text??'')
      .slice(0,MAX_TEXT_LENGTH)
      .split(/\r?\n/)
      .map(line=>clean(line,360))
      .filter(Boolean)
      .map((original,index)=>({index,original,normalized:normalize(original)}));
  }

  function parseMoneyCents(raw){
    let value=String(raw??'').trim().replace(/\u00a0/g,' ');
    if(!value)return null;
    value=value.replace(/[^0-9,.-]/g,'');
    if(!value||!/[0-9]/.test(value))return null;
    const negative=value.startsWith('-');
    value=value.replace(/-/g,'');
    const lastComma=value.lastIndexOf(',');
    const lastDot=value.lastIndexOf('.');
    const decimalPos=Math.max(lastComma,lastDot);
    let whole=value;
    let fraction='';
    if(decimalPos>=0&&value.length-decimalPos-1===2){
      whole=value.slice(0,decimalPos).replace(/[.,]/g,'');
      fraction=value.slice(decimalPos+1);
    }else{
      whole=value.replace(/[.,]/g,'');
    }
    if(!/^\d{1,12}$/.test(whole)||!/^\d{0,2}$/.test(fraction))return null;
    const cents=Number(whole)*100+Number((fraction+'00').slice(0,2));
    if(!Number.isSafeInteger(cents))return null;
    return negative?-cents:cents;
  }

  function parseDate(raw){
    const text=String(raw??'').trim();
    let match=/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/.exec(text);
    let year,month,day;
    if(match){
      day=Number(match[1]);month=Number(match[2]);year=Number(match[3]);
    }else{
      match=/\b(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})\b/.exec(text);
      if(!match)return '';
      year=Number(match[1]);month=Number(match[2]);day=Number(match[3]);
    }
    const date=new Date(Date.UTC(year,month-1,day));
    if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return '';
    return `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }

  function moneyTokens(line){
    const matches=String(line||'').match(/(?:\d{1,3}(?:[ .]\d{3})+|\d{1,12})[,.]\d{2}\s*(?:€|eur)?/gi)||[];
    return matches.map(token=>({token:clean(token,40),value:parseMoneyCents(token)})).filter(item=>Number.isSafeInteger(item.value));
  }

  function dateTokens(line){
    const matches=String(line||'').match(/\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g)||[];
    return matches.map(token=>({token,value:parseDate(token)})).filter(item=>item.value);
  }

  function labeledCandidates(lines,labels,tokenizer){
    const out=[];
    const normalizedLabels=(Array.isArray(labels)?labels:[]).map((label,index)=>({label:clean(label,80),normalized:normalize(label),priority:index})).filter(item=>item.normalized);
    for(const line of lines){
      for(const label of normalizedLabels){
        if(!line.normalized.includes(label.normalized))continue;
        for(const item of tokenizer(line.original)){
          out.push({...item,label:label.label,lineIndex:line.index,priority:label.priority,distance:0});
        }
        const next=lines.find(candidate=>candidate.index===line.index+1);
        if(next){
          for(const item of tokenizer(next.original)){
            out.push({...item,label:label.label,lineIndex:next.index,priority:label.priority,distance:1});
          }
        }
      }
    }
    out.sort((a,b)=>a.priority-b.priority||a.distance-b.distance||a.lineIndex-b.lineIndex);
    return out;
  }

  function chooseCandidate(candidates){
    if(!candidates.length)return {value:null,confidence:'none',ambiguous:false,label:''};
    const best=candidates[0];
    const comparable=candidates.filter(item=>item.priority===best.priority&&item.distance===best.distance);
    const values=[...new Set(comparable.map(item=>String(item.value)))];
    return {
      value:best.value,
      token:best.token||'',
      label:best.label||'',
      confidence:best.distance===0?'high':'medium',
      ambiguous:values.length>1
    };
  }

  function digitGroups(line,min=5,max=20){
    const matches=String(line||'').match(/\d(?:[\s.\-]*\d){4,24}/g)||[];
    return matches.map(raw=>{
      const digits=raw.replace(/\D/g,'');
      return digits.length>=min&&digits.length<=max?digits:'';
    }).filter(Boolean);
  }

  function labeledDigits(lines,labels,min,max){
    const candidates=labeledCandidates(lines,labels,line=>digitGroups(line,min,max).map(value=>({value,token:value})));
    return chooseCandidate(candidates);
  }

  function labeledClient(lines,labels){
    const candidates=labeledCandidates(lines,labels,line=>{
      const found=String(line||'').match(/\b[A-Z]?[A-Z0-9][A-Z0-9._\/-]{4,24}\b/gi)||[];
      return found
        .map(value=>clean(value,32))
        .filter(value=>/[0-9]/.test(value)&&!/^(cliente|numero|número|data|total)$/i.test(value))
        .map(value=>({value,token:value}));
    });
    return chooseCandidate(candidates);
  }

  function providerFromRules(text,rules){
    const haystack=normalize(text);
    for(const rule of Array.isArray(rules.providers)?rules.providers:[]){
      const terms=(Array.isArray(rule.match)?rule.match:[]).map(normalize).filter(Boolean);
      if(!terms.length||!terms.some(term=>haystack.includes(term)))continue;
      return {
        id:clean(rule.id,50),
        name:clean(rule.name,80),
        category:clean(rule.category,80),
        title:clean(rule.title,80)
      };
    }
    return null;
  }

  function methodFromRules(text,rules){
    const haystack=normalize(text);
    for(const rule of Array.isArray(rules.methods)?rules.methods:[]){
      const all=(Array.isArray(rule.matchAll)?rule.matchAll:[]).map(normalize).filter(Boolean);
      const any=(Array.isArray(rule.matchAny)?rule.matchAny:[]).map(normalize).filter(Boolean);
      if(all.length&&!all.every(term=>haystack.includes(term)))continue;
      if(any.length&&!any.some(term=>haystack.includes(term)))continue;
      const value=clean(rule.value,60);
      if(value)return value;
    }
    return '';
  }

  function formatReference(reference,entity){
    const ref=String(reference||'').replace(/\D/g,'');
    const ent=String(entity||'').replace(/\D/g,'');
    const prettyRef=ref.length===9?`${ref.slice(0,3)} ${ref.slice(3,6)} ${ref.slice(6)}`:ref;
    if(ent&&prettyRef)return `Entidade ${ent} · Referência ${prettyRef}`;
    return prettyRef||ent;
  }

  function extract(text,rulesInput){
    const raw=String(text??'').slice(0,MAX_TEXT_LENGTH);
    const rules=validRules(rulesInput)||cachedRules||FALLBACK_RULES;
    const lines=textLines(raw);
    const fields=rules.fields||{};

    const amount=chooseCandidate(labeledCandidates(lines,fields.amount?.labels,moneyTokens));
    const dueDate=chooseCandidate(labeledCandidates(lines,fields.dueDate?.labels,dateTokens));
    const issueDate=chooseCandidate(labeledCandidates(lines,fields.issueDate?.labels,dateTokens));
    const reference=labeledDigits(lines,fields.reference?.labels,6,18);
    const entity=labeledDigits(lines,fields.entity?.labels,5,8);
    const issuerNif=labeledDigits(lines,fields.issuerNif?.labels,9,9);
    const clientNumber=labeledClient(lines,fields.clientNumber?.labels);
    const provider=providerFromRules(raw,rules);
    const method=methodFromRules(raw,rules);

    const amountCents=Number.isSafeInteger(amount.value)&&amount.value>0?amount.value:null;
    const refText=formatReference(reference.value,entity.value);
    const title=provider?.title||provider?.name?clean(provider?.title||`Fatura ${provider.name}`,80):'';
    const notes=[];
    if(issueDate.value)notes.push(`Data de emissão: ${issueDate.value.split('-').reverse().join('/')}`);
    if(clientNumber.value)notes.push(`Cliente: ${clean(clientNumber.value,32)}`);

    const ambiguities=[];
    if(amount.ambiguous)ambiguities.push('amount');
    if(dueDate.ambiguous)ambiguities.push('dueDate');
    if(reference.ambiguous)ambiguities.push('reference');

    return Object.freeze({
      kind:'generic-text',
      source:'ocr-labeled',
      rulesRevision:rules.revision,
      title,
      provider:provider?.name||'',
      category:provider?.category||'',
      amountCents,
      dueDate:dueDate.value||'',
      issueDate:issueDate.value||'',
      reference:refText,
      entity:entity.value||'',
      paymentReference:reference.value||'',
      clientNumber:clientNumber.value||'',
      issuerNif:issuerNif.value||'',
      method,
      notes:notes.join(' · '),
      confidence:Object.freeze({
        amount:amount.confidence,
        dueDate:dueDate.confidence,
        issueDate:issueDate.confidence,
        reference:reference.confidence,
        entity:entity.confidence,
        clientNumber:clientNumber.confidence,
        issuerNif:issuerNif.confidence,
        provider:provider?'high':'none',
        method:method?'high':'none'
      }),
      ambiguities:Object.freeze(ambiguities),
      hasUsefulData:Boolean(title||provider?.name||amountCents||dueDate.value||refText||issuerNif.value)
    });
  }

  root.CDCInvoiceExtractor=Object.freeze({
    loadRules,
    extract,
    parseMoneyCents,
    parseDate,
    normalize,
    FALLBACK_RULES
  });
})(typeof window!=='undefined'?window:globalThis);
