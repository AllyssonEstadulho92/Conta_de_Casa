'use strict';

/* Conta de Casa v64 — runtime de precisão para compras e ciclos mensais.
 *
 * Objetivos:
 * - scanner de código de barras: uma loja preferida, correspondência conservadora,
 *   adição automática apenas quando a confiança é alta e incremento por GTIN repetido;
 * - faturas recorrentes: novas ocorrências começam como rascunho sem valor/referência/notas;
 * - preservar a separação entre preço estimado da loja e preço efetivamente pago.
 */
(function installV64Runtime(root){
  const VERSION='v64';
  const RETAILER_KEY='cdc.market.scan.retailer.v1';
  const RETAILERS=Object.freeze({
    'pingo-doce':'Pingo Doce',
    'continente':'Continente'
  });
  const STOP_WORDS=new Set(['a','o','as','os','de','da','do','das','dos','e','em','com','sem','para','por','un','unid','unidade','unidades','pack','embalagem']);
  const AUTO_MATCH_MIN=0.84;
  const AUTO_MATCH_GAP=0.10;

  let pendingScan=null;
  let resolveTimer=0;
  let retailerApplying=false;
  let migrationStarted=false;

  function normalized(value){
    return String(value??'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLocaleLowerCase('pt-PT')
      .replace(/[^a-z0-9]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function tokenSet(value){
    return new Set(normalized(value).split(' ').filter(token=>token.length>1&&!STOP_WORDS.has(token)&&!/^\d+$/.test(token)));
  }

  function overlapRatio(reference,candidate){
    const a=reference instanceof Set?reference:tokenSet(reference);
    const b=candidate instanceof Set?candidate:tokenSet(candidate);
    if(!a.size)return 1;
    let hit=0;
    for(const token of a)if(b.has(token))hit+=1;
    return hit/a.size;
  }

  function quantityProfile(value){
    const text=normalized(value).replace(/(\d),(\d)/g,'$1.$2');
    const units=new Set();
    const multi=new Set();
    const unitRegex=/(\d+(?:\.\d+)?)\s*(kg|mg|g|ml|cl|l|unid|unidade|unidades|un)\b/g;
    let match;
    while((match=unitRegex.exec(text))){
      const amount=Number(match[1]);
      const unit=match[2];
      if(!Number.isFinite(amount)||amount<=0)continue;
      if(unit==='kg')units.add(`mass:${Math.round(amount*1000000)}`);
      else if(unit==='g')units.add(`mass:${Math.round(amount*1000)}`);
      else if(unit==='mg')units.add(`mass:${Math.round(amount)}`);
      else if(unit==='l')units.add(`volume:${Math.round(amount*1000)}`);
      else if(unit==='cl')units.add(`volume:${Math.round(amount*10)}`);
      else if(unit==='ml')units.add(`volume:${Math.round(amount)}`);
      else units.add(`count:${Math.round(amount*1000)}`);
    }
    const multiRegex=/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(kg|mg|g|ml|cl|l|unid|unidade|unidades|un)\b/g;
    while((match=multiRegex.exec(text))){
      const count=Number(match[1]);
      const amount=Number(match[2]);
      const unit=match[3];
      if(!Number.isFinite(count)||!Number.isFinite(amount)||count<=0||amount<=0)continue;
      let base='';
      if(unit==='kg')base=`mass:${Math.round(amount*1000000)}`;
      else if(unit==='g')base=`mass:${Math.round(amount*1000)}`;
      else if(unit==='mg')base=`mass:${Math.round(amount)}`;
      else if(unit==='l')base=`volume:${Math.round(amount*1000)}`;
      else if(unit==='cl')base=`volume:${Math.round(amount*10)}`;
      else if(unit==='ml')base=`volume:${Math.round(amount)}`;
      else base=`count:${Math.round(amount*1000)}`;
      multi.add(`${count}x${base}`);
    }
    return {units,multi};
  }

  function quantityCompatible(reference,candidate){
    const a=quantityProfile(reference);
    const b=quantityProfile(candidate);
    if(a.multi.size||b.multi.size){
      if(!a.multi.size||!b.multi.size)return false;
      return [...a.multi].some(value=>b.multi.has(value));
    }
    if(!a.units.size)return true;
    if(!b.units.size)return false;
    return [...a.units].some(value=>b.units.has(value));
  }

  function scanParts(detail){
    const parts=String(detail||'').split(' · ').map(value=>value.trim()).filter(Boolean);
    if(parts.length>=3)return {brand:parts[0],name:parts[1],quantity:parts.slice(2).join(' · ')};
    if(parts.length===2){
      const secondHasQuantity=quantityProfile(parts[1]).units.size||quantityProfile(parts[1]).multi.size;
      return secondHasQuantity?{brand:'',name:parts[0],quantity:parts[1]}:{brand:parts[0],name:parts[1],quantity:''};
    }
    return {brand:'',name:parts[0]||'',quantity:''};
  }

  function scoreBarcodeCandidate(scan,candidate){
    if(!scan||!candidate||scan.retailerId!==candidate.retailerId)return 0;
    const parts=scanParts(scan.detail);
    const candidateText=`${candidate.name||''} ${candidate.pack||''}`;
    const quantityText=parts.quantity||scan.detail||'';
    if(!quantityCompatible(quantityText,candidateText))return 0;

    const nameTokens=tokenSet(parts.name||scan.detail);
    const brandTokens=tokenSet(parts.brand);
    const allTokens=tokenSet(scan.detail);
    const candidateTokens=tokenSet(candidateText);
    const nameOverlap=overlapRatio(nameTokens,candidateTokens);
    const brandOverlap=brandTokens.size?overlapRatio(brandTokens,candidateTokens):1;
    const allOverlap=overlapRatio(allTokens,candidateTokens);
    if(nameTokens.size&&nameOverlap<0.60)return 0;
    if(brandTokens.size&&brandOverlap<0.60)return 0;

    const normalizedName=normalized(parts.name);
    const exactName=normalizedName&&normalized(candidateText).includes(normalizedName)?1:0;
    const quantityBonus=(quantityProfile(quantityText).units.size||quantityProfile(quantityText).multi.size)?1:0.7;
    return Math.min(1,(nameOverlap*0.58)+(brandOverlap*0.20)+(allOverlap*0.12)+(exactName*0.06)+(quantityBonus*0.04));
  }

  function pickBarcodeCandidate(scan,candidates){
    const ranked=(candidates||[])
      .map(candidate=>({candidate,score:scoreBarcodeCandidate(scan,candidate)}))
      .filter(entry=>entry.score>0)
      .sort((a,b)=>b.score-a.score);
    const first=ranked[0]||null;
    const second=ranked[1]||null;
    const gap=first?(first.score-(second?.score||0)):0;
    const accepted=Boolean(first&&first.score>=AUTO_MATCH_MIN&&(!second||gap>=AUTO_MATCH_GAP));
    return {accepted,match:accepted?first.candidate:null,score:first?.score||0,gap,ranked};
  }

  function parseBarcodeStatus(value){
    const match=/^Código\s+(\d{8,14}):\s*(.*?)\.\s*A pesquisar preço/i.exec(String(value||'').trim());
    return match?{code:match[1],detail:match[2].trim()}:null;
  }

  function parseMoneyCents(value){
    const text=String(value||'').replace(/\s+/g,'');
    const match=/(\d{1,7})(?:[.,](\d{2}))?€/.exec(text);
    if(!match)return 0;
    const cents=(Number(match[1])*100)+Number(match[2]||0);
    return Number.isSafeInteger(cents)&&cents>0?cents:0;
  }

  root.CDCV64=Object.freeze({VERSION,normalized,quantityProfile,quantityCompatible,scoreBarcodeCandidate,pickBarcodeCandidate,parseBarcodeStatus});
  if(typeof document==='undefined')return;

  function readRetailerPreference(){
    try{
      const value=localStorage.getItem(RETAILER_KEY)||'';
      return RETAILERS[value]?value:'';
    }catch(_error){return '';}
  }

  function writeRetailerPreference(value){
    if(!RETAILERS[value])return;
    try{localStorage.setItem(RETAILER_KEY,value);}catch(_error){}
  }

  function selectedRetailerButtons(){
    return [...document.querySelectorAll('#formDialog[data-mode="market-browser"] [data-market-source][aria-pressed="true"]')];
  }

  function applyPreferredRetailer(){
    if(retailerApplying)return;
    const preferred=readRetailerPreference();
    if(!preferred)return;
    const rootPanel=document.querySelector('#formDialog[data-mode="market-browser"]');
    if(!rootPanel)return;
    const preferredButton=rootPanel.querySelector(`[data-market-source="${preferred}"]`);
    if(!preferredButton)return;
    retailerApplying=true;
    try{
      if(preferredButton.getAttribute('aria-pressed')!=='true'){
        preferredButton.click();
        setTimeout(applyPreferredRetailer,0);
        return;
      }
      const other=rootPanel.querySelector(`[data-market-source][aria-pressed="true"]:not([data-market-source="${preferred}"])`);
      if(other)other.click();
    }finally{retailerApplying=false;}
  }

  function rememberRetailerAfterSelection(event){
    if(!event.target.closest?.('[data-market-source]'))return;
    setTimeout(()=>{
      const selected=selectedRetailerButtons();
      if(selected.length===1)writeRetailerPreference(selected[0].dataset.marketSource||'');
    },0);
  }

  function guardBarcodeOpen(event){
    if(!event.target.closest?.('[data-market-barcode-open]'))return;
    applyPreferredRetailer();
    const selected=selectedRetailerButtons();
    if(selected.length!==1){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if(typeof toast==='function')toast('Para uma leitura precisa, selecione apenas um supermercado antes de abrir a câmara.');
      return;
    }
    writeRetailerPreference(selected[0].dataset.marketSource||'');
  }

  function retailerIdFromCard(card){
    const text=card?.querySelector('.market-product-copy p')?.textContent||'';
    if(/Pingo Doce/i.test(text))return 'pingo-doce';
    if(/Continente/i.test(text))return 'continente';
    return '';
  }

  function candidateFromCard(card){
    const name=card?.querySelector('.market-product-copy h3')?.textContent?.trim()||'';
    const pack=card?.querySelector('.market-product-copy p')?.textContent?.trim()||'';
    const button=card?.querySelector('[data-market-add-product]')||null;
    const priceCents=parseMoneyCents(card?.querySelector('.market-product-price')?.textContent||'');
    return {name,pack,retailerId:retailerIdFromCard(card),priceCents,button,card};
  }

  function setScanStatus(message,tone='warning'){
    const status=document.querySelector('#formDialog[data-mode="market-browser"] #marketBarcodeStatus');
    if(!status)return;
    status.hidden=false;
    status.className=`market-barcode-status ${tone}`;
    status.textContent=String(message||'');
  }

  function addOneQuantity(value){
    if(typeof marketQuantityMilli!=='function'||typeof canonicalMarketQuantity!=='function')return String((Number(String(value).replace(',','.'))||1)+1);
    const milli=marketQuantityMilli(value||'1');
    return canonicalMarketQuantity(String((milli+1000)/1000));
  }

  async function incrementExistingBarcodeItem(scan,candidate){
    if(typeof appState==='undefined'||!appState?.market)return false;
    const existing=[...appState.market]
      .filter(item=>!item.purchased&&String(item.productCode||'')===scan.code)
      .sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0))[0];
    if(!existing)return false;
    existing.quantity=addOneQuantity(existing.quantity);
    if(candidate.priceCents>0)existing.estimatedCents=candidate.priceCents;
    existing.updatedAt=new Date().toISOString();
    if(typeof commit==='function')await commit('updated','market');
    if(typeof closeDialog==='function')closeDialog();
    if(typeof showPage==='function')showPage('market');
    if(typeof toast==='function')toast(`${existing.name} lido novamente. Quantidade atualizada para ${existing.quantity}.`);
    return true;
  }

  function waitForNewMarketItem(beforeIds,timeoutMs=3500){
    const started=Date.now();
    return new Promise(resolve=>{
      const tick=()=>{
        const item=(typeof appState!=='undefined'&&appState?.market||[]).find(entry=>!beforeIds.has(entry.id));
        const dialog=document.querySelector('#formDialog');
        if(item&&(!dialog||!dialog.open)){resolve(item);return;}
        if(Date.now()-started>=timeoutMs){resolve(item||null);return;}
        setTimeout(tick,70);
      };
      tick();
    });
  }

  async function addMatchedBarcode(scan,candidate){
    if(await incrementExistingBarcodeItem(scan,candidate))return;
    if(typeof appState==='undefined'||!appState?.market||!candidate.button)return;
    const beforeIds=new Set(appState.market.map(item=>item.id));
    candidate.button.click();
    const created=await waitForNewMarketItem(beforeIds);
    if(!created)return;
    created.productCode=scan.code;
    created.updatedAt=new Date().toISOString();
    if(candidate.priceCents>0)created.estimatedCents=candidate.priceCents;
    if(typeof saveState==='function')await saveState();
    if(typeof renderCurrentPage==='function')renderCurrentPage();
    if(typeof toast==='function')toast(`${created.name} identificado e adicionado automaticamente com o preço encontrado no ${RETAILERS[scan.retailerId]}.`);
  }

  async function resolvePendingScanFromDom(){
    if(!pendingScan)return;
    const resultRoot=document.querySelector('#formDialog[data-mode="market-browser"] #marketCatalogResults');
    const meta=document.querySelector('#formDialog[data-mode="market-browser"] #marketResultsMeta')?.textContent||'';
    if(!resultRoot)return;
    const cards=[...resultRoot.querySelectorAll('.market-catalog-card')];
    if(!cards.length){
      if(/^0 resultado/i.test(meta)){
        setScanStatus('Produto identificado, mas não foi encontrado um preço suficientemente correspondente nesta loja. Pesquise ou registe manualmente.','warning');
        pendingScan=null;
      }
      return;
    }
    const scan=pendingScan;
    const candidates=cards.map(candidateFromCard).filter(candidate=>candidate.button&&candidate.priceCents>0);
    const result=pickBarcodeCandidate(scan,candidates);
    if(!result.accepted){
      setScanStatus('O código foi lido, mas a correspondência entre nome, embalagem e loja não atingiu confiança suficiente. Confirme um dos resultados antes de adicionar.','warning');
      pendingScan=null;
      return;
    }
    pendingScan=null;
    try{await addMatchedBarcode(scan,result.match);}
    catch(_error){
      setScanStatus('O produto foi identificado, mas não foi possível adicioná-lo automaticamente. Confirme o resultado manualmente.','warning');
    }
  }

  function schedulePendingResolution(){
    if(!pendingScan)return;
    clearTimeout(resolveTimer);
    resolveTimer=setTimeout(()=>resolvePendingScanFromDom().catch(()=>{}),120);
  }

  function handleBarcodeSearchInput(event){
    if(event.target?.id!=='marketCatalogSearch'||event.isTrusted)return;
    const status=document.querySelector('#formDialog[data-mode="market-browser"] #marketBarcodeStatus')?.textContent||'';
    const parsed=parseBarcodeStatus(status);
    if(!parsed)return;
    const selected=selectedRetailerButtons();
    const retailerId=selected.length===1?(selected[0].dataset.marketSource||''):readRetailerPreference();
    if(!RETAILERS[retailerId])return;
    pendingScan={...parsed,retailerId};
    setScanStatus(`Código ${parsed.code} lido. A validar nome, embalagem e preço no ${RETAILERS[retailerId]}…`,'success');
    schedulePendingResolution();
  }

  function installBarcodeAutomation(){
    document.addEventListener('click',guardBarcodeOpen,true);
    document.addEventListener('click',rememberRetailerAfterSelection);
    document.addEventListener('input',handleBarcodeSearchInput,true);
    const observer=new MutationObserver(()=>{
      applyPreferredRetailer();
      schedulePendingResolution();
    });
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-pressed','data-mode']});
    applyPreferredRetailer();
  }

  function installBillDraftFilter(){
    const filter=document.querySelector('#billStatusFilter');
    if(filter&&!filter.querySelector('option[value="draft"]')){
      const option=document.createElement('option');
      option.value='draft';
      option.textContent='Por preencher';
      const invalid=filter.querySelector('option[value="invalid"]');
      filter.insertBefore(option,invalid||null);
    }
  }

  function isUntouchedGeneratedOccurrence(bill){
    if(!bill?.recurrenceParentId||bill.cancelled||bill.archived)return false;
    if((typeof appState!=='undefined'&&appState?.payments||[]).some(payment=>payment.billId===bill.id))return false;
    if(bill.totalCents===0&&!bill.reference&&!bill.issueAt)return true;
    if(bill.reference||bill.issueAt)return false;
    const created=Date.parse(bill.createdAt||'');
    const updated=Date.parse(bill.updatedAt||'');
    return Number.isFinite(created)&&Number.isFinite(updated)&&Math.abs(updated-created)<=1500;
  }

  function migrateGeneratedOccurrencesToDrafts(){
    if(typeof appState==='undefined'||!appState?.bills||typeof currentLocalMonthKey!=='function')return false;
    const floor=`${currentLocalMonthKey()}-01`;
    let changed=false;
    const now=new Date().toISOString();
    for(const bill of appState.bills){
      const due=typeof billDueDateKey==='function'?billDueDateKey(bill):String(bill.dueDate||'');
      if(!due||due<floor||!isUntouchedGeneratedOccurrence(bill))continue;
      if(bill.draft&&bill.totalCents===0&&!bill.reference&&!bill.notes)continue;
      bill.draft=true;
      bill.totalCents=0;
      bill.issueAt=null;
      bill.reference='';
      bill.notes='';
      bill.updatedAt=now;
      changed=true;
    }
    return changed;
  }

  function installFinanceCyclePatches(){
    if(typeof normalizeBill==='function'){
      const baseNormalizeBill=normalizeBill;
      normalizeBill=function v64NormalizeBill(value={}){
        const normalizedBill=baseNormalizeBill(value);
        normalizedBill.draft=Boolean(value?.draft);
        return normalizedBill;
      };
    }

    if(typeof billLedger==='function'){
      const baseBillLedger=billLedger;
      billLedger=function v64BillLedger(bill){
        if(bill?.draft){
          const paid=typeof paidForBill==='function'?paidForBill(bill?.id):0;
          const valid=Number.isSafeInteger(paid)&&paid===0;
          return {totalCents:0,paidCents:paid,remainingCents:0,overpaidCents:Math.max(0,paid),valid,draft:true};
        }
        return baseBillLedger(bill);
      };
    }

    if(typeof billStatus==='function'){
      const baseBillStatus=billStatus;
      billStatus=function v64BillStatus(bill,now=new Date()){
        if(bill?.draft)return 'draft';
        return baseBillStatus(bill,now);
      };
    }

    if(typeof billUrgency==='function'){
      const baseBillUrgency=billUrgency;
      billUrgency=function v64BillUrgency(bill,now=new Date()){
        if(bill?.draft)return 'normal';
        return baseBillUrgency(bill,now);
      };
    }

    if(typeof statusLabel==='function'){
      const baseStatusLabel=statusLabel;
      statusLabel=function v64StatusLabel(status){return status==='draft'?'Por preencher':baseStatusLabel(status);};
    }

    if(typeof dueText==='function'){
      const baseDueText=dueText;
      dueText=function v64DueText(bill,now=new Date()){
        if(bill?.draft)return 'Introduzir valor da nova fatura';
        return baseDueText(bill,now);
      };
    }

    if(typeof billDueSignal==='function'){
      const baseBillDueSignal=billDueSignal;
      billDueSignal=function v64BillDueSignal(bill,status=billStatus(bill),urgency=billUrgency(bill)){
        if(bill?.draft||status==='draft')return ['Por preencher','normal'];
        return baseBillDueSignal(bill,status,urgency);
      };
    }

    if(typeof billActionsHtml==='function'){
      const baseBillActionsHtml=billActionsHtml;
      billActionsHtml=function v64BillActionsHtml(bill,compact=false){
        if(!bill?.draft)return baseBillActionsHtml(bill,compact);
        const detail=`<button class="btn secondary" type="button" data-bill-id="${attr(bill.id)}">${compact?'Detalhes':'Abrir'}</button>`;
        const fill=`<button class="btn primary" type="button" data-edit-bill="${attr(bill.id)}">Preencher</button>`;
        return detail+fill;
      };
    }

    if(typeof billRowHtml==='function'){
      const baseBillRowHtml=billRowHtml;
      billRowHtml=function v64BillRowHtml(bill){
        if(!bill?.draft)return baseBillRowHtml(bill);
        return `<button class="list-row row-button" data-bill-id="${attr(bill.id)}" type="button"><div class="list-main"><strong>${esc(bill.title)}</strong><small>${fmtDate(billDueDateKey(bill))} · ${esc(bill.provider||bill.category||'Sem entidade')}</small></div><div class="list-side"><strong class="bill-draft-placeholder">Por preencher</strong><br><span class="status-chip draft">Nova fatura</span></div></button>`;
      };
    }

    if(typeof billTableRowHtml==='function'){
      const baseBillTableRowHtml=billTableRowHtml;
      billTableRowHtml=function v64BillTableRowHtml(bill){
        if(!bill?.draft)return baseBillTableRowHtml(bill);
        return `<tr class="bill-table-row bill-draft-row">
          <td><div class="bill-identity"><strong>${esc(bill.title)}</strong><small>${esc(bill.provider||'Sem fornecedor')} · ${esc(bill.category||'Outros')}</small></div></td>
          <td><span class="status-chip draft">Por preencher</span></td>
          <td><div class="bill-due-cell"><strong>${fmtDate(billDueDateKey(bill))}</strong><span class="bill-due-signal normal">Nova ocorrência</span></div></td>
          <td class="money-col"><span class="bill-draft-placeholder">—</span></td>
          <td class="money-col"><span class="bill-draft-placeholder">—</span></td>
          <td class="money-col"><span class="bill-draft-placeholder">—</span></td>
          <td><div class="bill-table-actions">${billActionsHtml(bill)}</div></td>
        </tr>`;
      };
    }

    if(typeof billCardHtml==='function'){
      const baseBillCardHtml=billCardHtml;
      billCardHtml=function v64BillCardHtml(bill){
        if(!bill?.draft)return baseBillCardHtml(bill);
        return `<article class="bill-mobile-card bill-draft-card">
          <div class="bill-mobile-head"><div><h3>${esc(bill.title)}</h3><small>${esc(bill.provider||'Sem fornecedor')}</small></div><span class="status-chip draft">Por preencher</span></div>
          <div class="bill-mobile-focus"><div><span>Nova fatura</span><strong class="bill-draft-placeholder">Introduzir valor</strong></div><span class="bill-due-signal normal">Sem valor herdado</span></div>
          <div class="bill-mobile-due"><span>Vencimento previsto</span><strong>${fmtDate(billDueDateKey(bill))}</strong></div>
          <div class="bill-mobile-finance"><div><span>Total</span><strong class="bill-draft-placeholder">—</strong></div><div><span>Referência</span><strong class="bill-draft-placeholder">—</strong></div><div><span>Categoria</span><strong>${esc(bill.category||'Outros')}</strong></div></div>
          <div class="bill-mobile-actions">${billActionsHtml(bill,true)}</div>
        </article>`;
      };
    }

    if(typeof billFormHtml==='function'){
      const baseBillFormHtml=billFormHtml;
      billFormHtml=function v64BillFormHtml(bill=null){
        let html=baseBillFormHtml(bill);
        if(!bill?.draft)return html;
        html=html.replace('<form id="billForm" class="form-grid two">','<form id="billForm" class="form-grid two"><p class="bill-draft-note full-row">Nova ocorrência mensal. A descrição, entidade e categoria foram mantidas; introduza o valor e a referência da fatura recebida.</p>');
        html=html.replace(/(<input name="amount"[^>]*\bvalue=")[^"]*(")/,'$1$2');
        html=html.replace(/(<input name="reference"[^>]*\bvalue=")[^"]*(")/,'$1$2');
        html=html.replace(/(<textarea name="notes"[^>]*>)[\s\S]*?(<\/textarea>)/,'$1$2');
        return html;
      };
    }

    if(typeof handleBillSubmit==='function'){
      handleBillSubmit=async function v64HandleBillSubmit(event){
        return withFormSubmissionLock(event,async form=>{
          const fd=new FormData(form);
          const title=cleanString(fd.get('title'),80);
          if(!title){toast('Indique uma descrição para a fatura.');return false;}
          const total=parseCents(fd.get('amount'));
          if(!validCents(total,1)){toast('Introduza o valor da nova fatura, superior a zero e com no máximo 2 casas decimais.');return false;}
          const dueDate=cleanDateKey(fd.get('dueDate'));
          const dueTime=cleanTimeKey(fd.get('dueTime'),'23:59');
          const dueAt=composeLocalDateTimeIso(dueDate,dueTime);
          if(!dueDate||!dueAt){toast('Data de vencimento inválida.');return false;}
          const id=String(fd.get('id')||'');
          if(id&&total<paidForBill(id)){
            toast(`O valor total não pode ficar abaixo do montante já pago (${money(paidForBill(id))}). Desfaça primeiro o pagamento incorreto.`);
            return false;
          }
          const data={title,provider:cleanString(fd.get('provider'),80),category:cleanString(fd.get('category'),80)||'Outros',totalCents:total,dueDate,dueTime,dueAt,method:cleanString(fd.get('method'),60),recurrence:cleanRecurrence(String(fd.get('recurrence'))),reference:cleanString(fd.get('reference'),160),notes:cleanMultiline(fd.get('notes'),1200),draft:false,updatedAt:new Date().toISOString()};
          if(id){
            const bill=appState.bills.find(item=>item.id===id);
            if(!bill){toast('A fatura já não existe. Atualize a lista.');return false;}
            const before=billAuditSnapshot(bill);
            Object.assign(bill,data);
            recordBillAudit(bill.id,'bill-updated',before,billAuditSnapshot(bill));
            await commit('updated','bill');
          }else{
            const bill={id:uid(),...data,createdAt:new Date().toISOString(),cancelled:false,archived:false};
            appState.bills.push(bill);
            recordBillAudit(bill.id,'bill-created',{},billAuditSnapshot(bill));
            await commit('created','bill');
          }
          closeDialog();
          toast('Fatura guardada.');
          return true;
        });
      };
    }

    if(typeof syncRecurringBills==='function'){
      syncRecurringBills=async function v64SyncRecurringBills(){
        if(!appState)return;
        const horizon=addCivilMonthsClamped(`${currentLocalMonthKey()}-01`,2);
        let changed=false;
        for(let loops=0;loops<24;loops+=1){
          let loopChanged=false;
          const sources=[...appState.bills].filter(bill=>bill.recurrence&&bill.recurrence!=='none'&&!bill.cancelled&&!bill.archived);
          for(const bill of sources){
            const currentDate=billDueDateKey(bill);
            if(!currentDate)continue;
            const nextDate=nextRecurrenceDateKey(currentDate,bill.recurrence);
            if(!nextDate||civilDayDiff(nextDate,horizon)<0)continue;
            const seriesId=recurrenceSeriesIdFor(bill);
            const occurrenceKey=recurrenceOccurrenceKey(seriesId,nextDate);
            const exists=appState.bills.some(item=>{
              const sameKey=item.recurrenceKey===occurrenceKey;
              const sameSeriesDate=recurrenceSeriesIdFor(item)===seriesId&&billDueDateKey(item)===nextDate;
              return sameKey||sameSeriesDate;
            });
            if(exists)continue;
            if(!bill.recurrenceSeriesId){bill.recurrenceSeriesId=seriesId;changed=true;}
            if(!bill.recurrenceKey){bill.recurrenceKey=recurrenceOccurrenceKey(seriesId,currentDate);changed=true;}
            const nextTime=billDueTimeKey(bill);
            const now=new Date().toISOString();
            const recurringBill={
              ...bill,
              id:cleanString(`rec_${seriesId}_${nextDate}`,80),
              totalCents:0,
              dueDate:nextDate,
              dueTime:nextTime,
              dueAt:composeLocalDateTimeIso(nextDate,nextTime),
              issueAt:null,
              reference:'',
              notes:'',
              draft:true,
              createdAt:now,
              updatedAt:now,
              recurrenceParentId:bill.id,
              recurrenceSeriesId:seriesId,
              recurrenceKey:occurrenceKey,
              archived:false,
              cancelled:false
            };
            appState.bills.push(recurringBill);
            recordBillAudit(recurringBill.id,'bill-recurring-created',{},billAuditSnapshot(recurringBill));
            loopChanged=changed=true;
          }
          if(!loopChanged)break;
        }
        if(changed)await saveState();
      };
    }

    if(typeof financialDiagnostics==='function'){
      const baseFinancialDiagnostics=financialDiagnostics;
      financialDiagnostics=function v64FinancialDiagnostics(month,now=new Date()){
        if(!appState?.bills)return baseFinancialDiagnostics(month,now);
        const bills=appState.bills;
        appState.bills=bills.filter(bill=>!bill.draft);
        try{return baseFinancialDiagnostics(month,now);}
        finally{appState.bills=bills;}
      };
    }
  }

  function startDraftMigrationWhenReady(){
    if(migrationStarted)return;
    migrationStarted=true;
    let tries=0;
    const timer=setInterval(async()=>{
      tries+=1;
      if(typeof appState!=='undefined'&&appState?.bills){
        clearInterval(timer);
        const changed=migrateGeneratedOccurrencesToDrafts();
        if(changed&&typeof saveState==='function'){
          try{await saveState();}catch(_error){}
          if(typeof renderCurrentPage==='function')renderCurrentPage();
          if(typeof toast==='function')toast('As próximas faturas recorrentes ficaram prontas para preencher com os novos valores.');
        }
      }else if(tries>=120)clearInterval(timer);
    },250);
  }

  installFinanceCyclePatches();
  installBillDraftFilter();
  installBarcodeAutomation();
  startDraftMigrationWhenReady();
})(typeof window!=='undefined'?window:globalThis);
