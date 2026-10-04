'use strict';

(function installWalliShare(){
  function monthConfig(monthKey){
    const source=appState?.petShare?.months?.[monthKey];
    return source || {baseCents:0,calculationMode:'proportional',dailyRateCents:0,updatedAt:null};
  }

  function rangeDays(startDate,endDate){
    const start=cleanDateKey(startDate);
    const end=cleanDateKey(endDate);
    const diff=civilDayDiff(start,end);
    if(!start||!end||!Number.isInteger(diff)||diff<0||diff>370)return [];
    const days=[];
    for(let offset=0;offset<=diff;offset+=1){
      const key=addCivilDays(start,offset);
      if(key)days.push(key);
    }
    return days;
  }

  function recordDaysInMonth(record,monthKey){
    return rangeDays(record.startDate,record.endDate).filter(day=>day.startsWith(monthKey));
  }

  function targetCents(config,careDays,daysInMonth){
    if(!Number.isSafeInteger(careDays)||careDays<0||!Number.isSafeInteger(daysInMonth)||daysInMonth<1)return 0;
    if(config.calculationMode==='daily-fixed'){
      const total=BigInt(config.dailyRateCents||0)*BigInt(careDays);
      return total>BigInt(MAX_MONEY_CENTS)?MAX_MONEY_CENTS:Number(total);
    }
    const numerator=BigInt(config.baseCents||0)*BigInt(careDays);
    const denominator=BigInt(daysInMonth);
    const rounded=(numerator+(denominator/2n))/denominator;
    return rounded>BigInt(MAX_MONEY_CENTS)?MAX_MONEY_CENTS:Number(rounded);
  }

  function snapshot(monthKey=selectedMonth){
    const parts=String(monthKey).split('-').map(Number);
    const year=parts[0],month=parts[1];
    const daysInMonth=Number.isInteger(year)&&Number.isInteger(month)&&month>=1&&month<=12?new Date(year,month,0).getDate():30;
    const config=monthConfig(monthKey);
    const records=(appState?.petShare?.records||[]).filter(record=>recordDaysInMonth(record,monthKey).length>0);
    const careSet=new Set();
    records.forEach(record=>recordDaysInMonth(record,monthKey).forEach(day=>careSet.add(day)));
    const careDays=[...careSet].sort();
    const shareCents=targetCents(config,careDays.length,daysInMonth);
    const paidCents=sumCents((appState?.petShare?.payments||[]).filter(payment=>payment.monthKey===monthKey).map(payment=>payment.amountCents));
    return {
      monthKey,
      daysInMonth,
      config,
      records,
      careDays,
      shareCents,
      paidCents,
      outstandingCents:Math.max(0,shareCents-paidCents),
      overpaidCents:Math.max(0,paidCents-shareCents),
      ownerShareCents:config.calculationMode==='proportional'?Math.max(0,config.baseCents-shareCents):0
    };
  }

  function monthLabel(monthKey){
    const parts=String(monthKey).split('-').map(Number);
    if(!Number.isInteger(parts[0])||!Number.isInteger(parts[1]))return String(monthKey);
    const value=new Intl.DateTimeFormat('pt-PT',{month:'long',year:'numeric'}).format(new Date(parts[0],parts[1]-1,1));
    return value.replace(/^./,char=>char.toUpperCase());
  }

  function renderCalendar(data){
    const parts=data.monthKey.split('-').map(Number);
    const first=new Date(parts[0],parts[1]-1,1);
    const offset=(first.getDay()+6)%7;
    const marked=new Set(data.careDays);
    const cells=[];
    for(let index=0;index<offset;index+=1)cells.push('<span class="walli-day blank" aria-hidden="true"></span>');
    for(let day=1;day<=data.daysInMonth;day+=1){
      const key=data.monthKey+'-'+pad2(day);
      const active=marked.has(key);
      const aria=active?'Dia '+day+', com o Nuno':'Dia '+day;
      cells.push('<span class="walli-day'+(active?' active':'')+'" aria-label="'+attr(aria)+'"><strong>'+day+'</strong></span>');
    }
    const heads=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(label=>'<span>'+esc(label)+'</span>').join('');
    setHTML('#walliShareCalendar',
      '<div class="walli-calendar-head">'+heads+'</div>'+
      '<div class="walli-calendar-grid">'+cells.join('')+'</div>'+
      '<div class="walli-calendar-legend"><span><i class="walli-legend-dot"></i> Dia com o Nuno</span><strong>'+data.careDays.length+' de '+data.daysInMonth+' dias</strong></div>'
    );
  }

  function render(){
    if(!appState?.petShare)return;
    const data=snapshot(selectedMonth);
    const petName=appState.petShare.petName||'Walli';
    const caregiver=appState.petShare.caregiverName||'Nuno';
    let status='';
    if(data.outstandingCents>0){
      status='<article class="walli-summary-card walli-status-card warning"><span>Por receber</span><strong data-money>'+money(data.outstandingCents)+'</strong><button class="btn primary" type="button" data-walli-receive>Marcar como recebido</button></article>';
    }else if(data.overpaidCents>0){
      status='<article class="walli-summary-card walli-status-card warning"><span>Recebido acima do valor atual</span><strong data-money>'+money(data.overpaidCents)+'</strong><small>Reveja a configuração ou os registos do mês.</small></article>';
    }else{
      status='<article class="walli-summary-card walli-status-card success"><span>Estado</span><strong>'+(data.paidCents>0?'Liquidado':'Sem valor em falta')+'</strong><small>Reembolsos ficam separados da base mensal.</small></article>';
    }

    let summary=
      '<article class="walli-summary-card primary"><span>Base mensal</span><strong data-money>'+money(data.config.baseCents)+'</strong><small>'+esc(monthLabel(data.monthKey))+'</small></article>'+
      '<article class="walli-summary-card"><span>Dias com '+esc(caregiver)+'</span><strong>'+data.careDays.length+'</strong><small>de '+data.daysInMonth+' dias</small></article>'+
      '<article class="walli-summary-card"><span>Valor de '+esc(caregiver)+'</span><strong data-money>'+money(data.shareCents)+'</strong><small>'+(data.config.calculationMode==='proportional'?'Proporcional ao mês':'Valor diário fixo')+'</small></article>'+
      '<article class="walli-summary-card"><span>Recebido</span><strong data-money>'+money(data.paidCents)+'</strong><small>Reembolso registado separadamente</small></article>';
    if(data.config.calculationMode==='proportional'){
      summary+='<article class="walli-summary-card"><span>Parte do proprietário</span><strong data-money>'+money(data.ownerShareCents)+'</strong><small>Base menos a parte de '+esc(caregiver)+'</small></article>';
    }
    summary+=status;
    setHTML('#walliShareSummary',summary);

    const mode=$('#walliShareMode');
    const base=$('#walliShareBase');
    const daily=$('#walliShareDailyRate');
    const dailyLabel=$('#walliShareDailyRateLabel');
    if(mode)mode.value=data.config.calculationMode;
    if(base)base.value=data.config.baseCents?(data.config.baseCents/100).toFixed(2).replace('.',','):'';
    if(daily)daily.value=data.config.dailyRateCents?(data.config.dailyRateCents/100).toFixed(2).replace('.',','):'';
    if(dailyLabel)dailyLabel.hidden=data.config.calculationMode!=='daily-fixed';

    const today=currentLocalDateKey();
    const fallback=today.startsWith(selectedMonth)?today:selectedMonth+'-01';
    const careForm=$('#walliCareForm');
    const start=$('#walliCareStart');
    const end=$('#walliCareEnd');
    if(!careForm?.dataset.editingId){
      if(start&&start.dataset.monthKey!==selectedMonth){start.value=fallback;start.dataset.monthKey=selectedMonth;}
      if(end&&end.dataset.monthKey!==selectedMonth){end.value=fallback;end.dataset.monthKey=selectedMonth;}
    }

    renderCalendar(data);

    const records=data.records.slice().sort((a,b)=>a.startDate.localeCompare(b.startDate)).map(record=>{
      const days=recordDaysInMonth(record,data.monthKey).length;
      const walks=Number.isSafeInteger(Number(record.walksCount))?Number(record.walksCount):0;
      const note=record.note?' · '+esc(record.note):'';
      const period=esc(fmtDate(record.startDate))+(record.startDate!==record.endDate?' a '+esc(fmtDate(record.endDate)):'');
      const walksText=walks+' ida'+(walks===1?'':'s')+' à rua';
      return '<div class="list-row walli-record-row">'+
        '<div class="list-main"><strong>'+period+'</strong><small>'+days+' dia'+(days===1?'':'s')+' neste mês · '+walksText+note+'</small></div>'+
        '<div class="list-side"><button class="btn secondary" type="button" data-walli-edit="'+attr(record.id)+'">Editar</button><button class="btn secondary" type="button" data-walli-delete="'+attr(record.id)+'">Eliminar</button></div>'+
      '</div>';
    }).join('');
    setHTML('#walliShareRecords',records||empty('Ainda não há dias de '+petName+' com '+caregiver+' neste mês.'));
  }

  function ensureMonth(monthKey){
    appState.petShare ||= {petName:'Walli',caregiverName:'Nuno',months:{},records:[],payments:[]};
    appState.petShare.months ||= {};
    appState.petShare.months[monthKey] ||= {baseCents:0,calculationMode:'proportional',dailyRateCents:0,updatedAt:new Date().toISOString()};
    return appState.petShare.months[monthKey];
  }

  async function saveSettings(event){
    event.preventDefault();
    const mode=$('#walliShareMode')?.value==='daily-fixed'?'daily-fixed':'proportional';
    const base=parseCents($('#walliShareBase')?.value||'');
    const daily=parseCents($('#walliShareDailyRate')?.value||'');
    if(!validCents(base,0)||!validCents(daily,0)){toast('Valores da partilha inválidos.');return;}
    const config=ensureMonth(selectedMonth);
    config.baseCents=base;
    config.calculationMode=mode;
    config.dailyRateCents=daily;
    config.updatedAt=new Date().toISOString();
    await commit('updated','general');
    toast('Configuração da partilha guardada.');
  }

  function readWalksCount(){
    const raw=String($('#walliCareWalks')?.value||'').trim();
    if(!raw)return 0;
    const value=Number(raw);
    return Number.isSafeInteger(value)&&value>=0&&value<=200?value:NaN;
  }

  function resetCareForm(){
    const form=$('#walliCareForm');
    if(!form)return;
    delete form.dataset.editingId;
    const submit=$('#walliCareSubmitBtn');
    const cancel=$('#walliCareCancelEditBtn');
    if(submit)submit.textContent='Guardar entrega';
    if(cancel)cancel.hidden=true;
    const today=currentLocalDateKey();
    const fallback=today.startsWith(selectedMonth)?today:selectedMonth+'-01';
    const start=$('#walliCareStart');
    const end=$('#walliCareEnd');
    if(start){start.value=fallback;start.dataset.monthKey=selectedMonth;}
    if(end){end.value=fallback;end.dataset.monthKey=selectedMonth;}
    const walks=$('#walliCareWalks');
    const note=$('#walliCareNote');
    if(walks)walks.value='';
    if(note)note.value='';
  }

  function editCare(id){
    const record=(appState.petShare.records||[]).find(item=>item.id===id);
    const form=$('#walliCareForm');
    if(!record||!form)return;
    form.dataset.editingId=id;
    const start=$('#walliCareStart');
    const end=$('#walliCareEnd');
    const walks=$('#walliCareWalks');
    const note=$('#walliCareNote');
    if(start){start.value=record.startDate;start.dataset.monthKey=record.startDate.slice(0,7);}
    if(end){end.value=record.endDate;end.dataset.monthKey=record.endDate.slice(0,7);}
    if(walks)walks.value=String(Number.isSafeInteger(Number(record.walksCount))?Number(record.walksCount):0);
    if(note)note.value=record.note||'';
    const submit=$('#walliCareSubmitBtn');
    const cancel=$('#walliCareCancelEditBtn');
    if(submit)submit.textContent='Guardar alterações';
    if(cancel)cancel.hidden=false;
    form.scrollIntoView({behavior:'smooth',block:'center'});
  }

  async function saveCare(event){
    event.preventDefault();
    const form=$('#walliCareForm');
    const editingId=form?.dataset.editingId||'';
    const start=cleanDateKey($('#walliCareStart')?.value);
    const end=cleanDateKey($('#walliCareEnd')?.value);
    const walksCount=readWalksCount();
    const days=rangeDays(start,end);
    if(!days.length){toast('Período inválido.');return;}
    if(!Number.isSafeInteger(walksCount)){toast('Indique um número de idas à rua entre 0 e 200.');return;}
    const existing=new Set();
    (appState.petShare.records||[])
      .filter(record=>record.id!==editingId)
      .forEach(record=>rangeDays(record.startDate,record.endDate).forEach(day=>existing.add(day)));
    const duplicate=days.find(day=>existing.has(day));
    if(duplicate){toast('Já existe um registo para '+fmtDate(duplicate)+'.');return;}
    const now=new Date().toISOString();
    appState.petShare.records ||= [];
    if(editingId){
      const index=appState.petShare.records.findIndex(record=>record.id===editingId);
      if(index<0){resetCareForm();toast('O registo já não existe.');return;}
      const current=appState.petShare.records[index];
      appState.petShare.records[index]={
        ...current,
        startDate:start,
        endDate:end,
        walksCount,
        note:cleanMultiline($('#walliCareNote')?.value||'',500),
        updatedAt:now,
        syncResolvedAt:null
      };
      await commit('updated','general');
      resetCareForm();
      toast('Registo do Walli atualizado.');
      return;
    }
    appState.petShare.records.push({
      id:uid(),
      startDate:start,
      endDate:end,
      walksCount,
      note:cleanMultiline($('#walliCareNote')?.value||'',500),
      createdAt:now,
      updatedAt:now,
      syncResolvedAt:null
    });
    await commit('created','general');
    resetCareForm();
    toast('Entrega ao Nuno registada.');
  }

  async function deleteCare(id,button){
    const record=(appState.petShare.records||[]).find(item=>item.id===id);
    if(!record)return;
    if(!confirm('Eliminar este registo de dias com o Nuno?'))return;
    if(button)button.disabled=true;
    if(typeof recordSyncDeletion==='function')recordSyncDeletion('pet-care',id);
    appState.petShare.records=appState.petShare.records.filter(item=>item.id!==id);
    if($('#walliCareForm')?.dataset.editingId===id)resetCareForm();
    await commit('deleted','general');
    toast('Registo eliminado.');
  }

  async function receive(button){
    if(button?.disabled)return;
    if(button)button.disabled=true;
    const data=snapshot(selectedMonth);
    if(data.outstandingCents<=0){render();return;}
    if(!confirm('Registar '+money(data.outstandingCents)+' como reembolso recebido do Nuno?')){if(button)button.disabled=false;return;}
    const now=new Date().toISOString();
    appState.petShare.payments ||= [];
    appState.petShare.payments.push({
      id:uid(),
      monthKey:selectedMonth,
      amountCents:data.outstandingCents,
      paidAt:now,
      note:'Reembolso da partilha do Walli',
      createdAt:now,
      updatedAt:now,
      syncResolvedAt:null
    });
    await commit('created','general');
    toast('Reembolso registado.');
  }

  let wired=false;
  function wire(){
    if(wired)return;
    const page=$('#page-petshare');
    if(!page)return;
    wired=true;
    $('#walliShareSettingsForm')?.addEventListener('submit',saveSettings);
    $('#walliCareForm')?.addEventListener('submit',saveCare);
    $('#walliCareCancelEditBtn')?.addEventListener('click',resetCareForm);
    $('#walliShareMode')?.addEventListener('change',event=>{
      const label=$('#walliShareDailyRateLabel');
      if(label)label.hidden=event.target.value!=='daily-fixed';
    });
    page.addEventListener('click',event=>{
      const edit=event.target.closest('[data-walli-edit]');
      if(edit){editCare(edit.dataset.walliEdit);return;}
      const del=event.target.closest('[data-walli-delete]');
      if(del){void deleteCare(del.dataset.walliDelete,del);return;}
      const receiveButton=event.target.closest('[data-walli-receive]');
      if(receiveButton)void receive(receiveButton);
    });
  }

  window.renderPetShare=render;
  window.wireWalliShareEvents=wire;
  window.walliShareSnapshot=snapshot;
  window.walliShareRangeDays=rangeDays;
  window.walliShareTargetCents=targetCents;
})(window);
