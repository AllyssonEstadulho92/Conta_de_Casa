'use strict';

(function installWalliShare(){
  function monthConfig(monthKey){
    const source=appState?.petShare?.months?.[monthKey];
    return source || {baseCents:0,calculationMode:'proportional',dailyRateCents:0,walksPerDay:1,walkRateCents:800,updatedAt:null};
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

  function walkCostCents(walkRateCents,walkCount){
    if(!Number.isSafeInteger(walkRateCents)||walkRateCents<0||!Number.isSafeInteger(walkCount)||walkCount<0)return 0;
    const total=BigInt(walkRateCents)*BigInt(walkCount);
    return total>BigInt(MAX_MONEY_CENTS)?MAX_MONEY_CENTS:Number(total);
  }

  function splitPaymentCents(totalCents,parts){
    if(!Number.isSafeInteger(totalCents)||totalCents<=0)return [];
    if(!Number.isSafeInteger(parts)||parts<2||parts>4)return [totalCents];
    const quotient=Math.floor(totalCents/parts);
    const remainder=totalCents%parts;
    return Array.from({length:parts},(_value,index)=>quotient+(index<remainder?1:0));
  }

  function renderPaymentSplitPreview(){
    const data=snapshot(selectedMonth);
    const select=$('[data-walli-split-count]');
    const target=$('[data-walli-split-preview]');
    if(!select||!target||data.outstandingCents<=0)return;
    const parts=Number(select.value);
    const plan=splitPaymentCents(data.outstandingCents,parts);
    if(plan.length<2)return;
    const previousDates=[...target.querySelectorAll('[data-walli-split-date]')].map(input=>cleanDateKey(input.value));
    const nowCents=plan[0];
    const laterCents=Math.max(0,data.outstandingCents-nowCents);
    const dateRows=plan.map((value,index)=>{
      const dateValue=previousDates[index]||(index===0?currentLocalDateKey():'');
      return '<label class="walli-split-date"><span>'+(index+1)+'.ª parte · '+money(value)+'</span><input type="date" data-walli-split-date data-index="'+index+'" value="'+attr(dateValue)+'" aria-label="Data da '+(index+1)+'.ª parte"></label>';
    }).join('');
    setHTML('[data-walli-split-preview]',
      '<div><small>Pagar agora</small><strong data-money>'+money(nowCents)+'</strong></div>'+
      '<div><small>Fica por pagar</small><strong data-money>'+money(laterCents)+'</strong></div>'+
      '<p>'+plan.map(value=>money(value)).join(' + ')+'</p>'+
      '<div class="walli-split-dates">'+dateRows+'</div>'
    );
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
    const walksPerDay=config.walksPerDay===2?2:1;
    const walkRateCents=Number.isSafeInteger(config.walkRateCents)?config.walkRateCents:800;
    const walkCount=careDays.length*walksPerDay;
    const walksCostCents=walkCostCents(walkRateCents,walkCount);
    const totalPayableCents=Math.min(MAX_MONEY_CENTS,shareCents+walksCostCents);
    const monthPayments=(appState?.petShare?.payments||[]).filter(payment=>payment.monthKey===monthKey);
    const reversalIds=new Set(monthPayments.filter(payment=>payment.direction==='outbound-reversal'&&payment.reversalOfId).map(payment=>payment.reversalOfId));
    const paidCents=sumCents(monthPayments.filter(payment=>payment.direction==='outbound'&&!reversalIds.has(payment.id)).map(payment=>payment.amountCents));
    const legacyReceivedCents=sumCents(monthPayments.filter(payment=>payment.direction!=='outbound'&&payment.direction!=='outbound-reversal').map(payment=>payment.amountCents));
    const plan=(appState?.petShare?.plans||[])
      .filter(item=>item.monthKey===monthKey&&!item.cancelledAt)
      .sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0))[0]||null;
    return {
      monthKey,
      daysInMonth,
      config,
      records,
      careDays,
      shareCents,
      walksPerDay,
      walkRateCents,
      walkCount,
      walksCostCents,
      totalPayableCents,
      paidCents,
      legacyReceivedCents,
      plan,
      outstandingCents:Math.max(0,totalPayableCents-paidCents),
      overpaidCents:Math.max(0,paidCents-totalPayableCents),
      ownerShareCents:config.calculationMode==='proportional'?Math.max(0,config.baseCents-shareCents):0
    };
  }

  function previousMonthKey(monthKey){
    const parts=String(monthKey).split('-').map(Number);
    if(!Number.isInteger(parts[0])||!Number.isInteger(parts[1])||parts[1]<1||parts[1]>12)return '';
    const date=new Date(parts[0],parts[1]-2,1);
    return date.getFullYear()+'-'+pad2(date.getMonth()+1);
  }

  function activePlan(monthKey=selectedMonth){
    return (appState?.petShare?.plans||[])
      .filter(item=>item.monthKey===monthKey&&!item.cancelledAt)
      .sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0))[0]||null;
  }

  function expenseIdsForWalliPayment(paymentId){
    const safe=cleanString(paymentId,60);
    return {
      billId:cleanString('walli_bill_'+safe,80),
      paymentId:cleanString('walli_pay_'+safe,80)
    };
  }

  function mirrorWalliPaymentToExpenses(petPayment){
    if(!petPayment||petPayment.direction!=='outbound'||!Number.isSafeInteger(petPayment.amountCents)||petPayment.amountCents<=0)return;
    appState.bills ||= [];
    appState.payments ||= [];
    const ids=expenseIdsForWalliPayment(petPayment.id);
    const existingBill=appState.bills.find(item=>item.id===ids.billId);
    const existingPayment=appState.payments.find(item=>item.id===ids.paymentId);
    if(existingBill&&existingPayment){
      petPayment.linkedBillId=ids.billId;
      petPayment.linkedPaymentId=ids.paymentId;
      return;
    }
    const paidAt=cleanIso(petPayment.paidAt,new Date().toISOString());
    const dueDate=dateKeyFromValue(paidAt)||currentLocalDateKey();
    const dueTime=timeKeyFromValue(paidAt)||'23:59';
    const dueAt=composeLocalDateTimeIso(dueDate,dueTime);
    const caregiver=cleanString(appState?.petShare?.caregiverName||'Nuno',80)||'Nuno';
    const now=new Date().toISOString();
    const bill=existingBill||{
      id:ids.billId,
      title:'Walli · pagamento ao '+caregiver,
      provider:caregiver,
      category:'Animais',
      totalCents:petPayment.amountCents,
      dueDate,dueTime,dueAt,
      issueAt:paidAt,
      method:'Outro',
      recurrence:'none',
      reference:'Walli/'+petPayment.id,
      notes:'Criado automaticamente a partir da Partilha do Walli. Não duplicar manualmente.',
      createdAt:now,
      updatedAt:now,
      cancelled:false,
      archived:false
    };
    const payment=existingPayment||{
      id:ids.paymentId,
      billId:bill.id,
      amountCents:petPayment.amountCents,
      paidAt,
      method:'Outro',
      notes:'Pagamento ligado à Partilha do Walli · '+petPayment.id,
      createdAt:now,
      updatedAt:now
    };
    if(!existingBill){
      appState.bills.push(bill);
      if(typeof recordBillAudit==='function')recordBillAudit(bill.id,'bill-created',{},billAuditSnapshot(bill));
    }
    if(!existingPayment){
      appState.payments.push(payment);
      if(typeof recordBillAudit==='function')recordBillAudit(bill.id,'payment-created',billAuditSnapshot(bill),{...billAuditSnapshot(bill),...paymentAuditSnapshot(payment)},payment.id);
    }
    petPayment.linkedBillId=bill.id;
    petPayment.linkedPaymentId=payment.id;
  }

  function removeMirroredWalliExpense(petPayment){
    if(!petPayment)return;
    const ids=expenseIdsForWalliPayment(petPayment.id);
    const billId=petPayment.linkedBillId||ids.billId;
    const paymentId=petPayment.linkedPaymentId||ids.paymentId;
    const bill=appState?.bills?.find(item=>item.id===billId);
    const payment=appState?.payments?.find(item=>item.id===paymentId);
    if(payment&&typeof recordSyncDeletion==='function')recordSyncDeletion('payment',payment.id);
    if(bill&&typeof recordSyncDeletion==='function')recordSyncDeletion('bill',bill.id);
    if(bill&&typeof recordBillAudit==='function'){
      const before={...billAuditSnapshot(bill),...paymentAuditSnapshot(payment)};
      recordBillAudit(bill.id,'payment-deleted',before,billAuditSnapshot(bill),payment?.id||'');
      recordBillAudit(bill.id,'bill-deleted',billAuditSnapshot(bill),{});
    }
    if(payment)appState.payments=appState.payments.filter(item=>item.id!==payment.id);
    if(bill)appState.bills=appState.bills.filter(item=>item.id!==bill.id);
  }

  function addOutboundPayment(amountCents,note,planInstallment=null){
    if(!validCents(amountCents,1))return null;
    const now=new Date().toISOString();
    appState.petShare.payments ||= [];
    const payment={
      id:uid(),
      monthKey:selectedMonth,
      direction:'outbound',
      amountCents,
      paidAt:now,
      note:cleanMultiline(note,300),
      createdAt:now,
      updatedAt:now,
      syncResolvedAt:null
    };
    appState.petShare.payments.push(payment);
    mirrorWalliPaymentToExpenses(payment);
    if(planInstallment){
      planInstallment.paidAt=now;
      planInstallment.paymentId=payment.id;
    }
    return payment;
  }

  function planRemainingCents(plan){
    if(!plan)return 0;
    return sumCents((plan.installments||[]).filter(item=>!item.paidAt).map(item=>item.amountCents));
  }

  function renderPaymentPanel(data){
    const root=$('#walliPaymentTimeline');
    if(!root)return;
    const caregiver=appState.petShare.caregiverName||'Nuno';
    const plan=data.plan;
    let planHtml='';
    if(plan){
      const remaining=planRemainingCents(plan);
      const matches=remaining===data.outstandingCents;
      const installments=(plan.installments||[]).map((item,index)=>{
        const isPaid=Boolean(item.paidAt);
        const overdue=!isPaid&&cleanDateKey(item.dueDate)&&item.dueDate<currentLocalDateKey();
        return '<div class="walli-plan-row'+(isPaid?' is-paid':'')+(overdue?' is-overdue':'')+'">'+
          '<span class="walli-plan-index">'+(index+1)+'</span>'+
          '<div class="walli-plan-copy"><strong data-money>'+money(item.amountCents)+'</strong><small>'+fmtDate(item.dueDate)+(isPaid?' · pago '+fmtDateTime(item.paidAt):(overdue?' · em atraso':' · por pagar'))+'</small></div>'+
          (!isPaid&&matches?'<button class="btn secondary" type="button" data-walli-plan-pay="'+attr(plan.id)+'" data-walli-installment="'+attr(item.id)+'">'+icon('check',16)+'<span>Pagar</span></button>':'')+
        '</div>';
      }).join('');
      planHtml='<div class="walli-plan-card">'+
        '<div class="walli-plan-head"><div><strong>Plano em '+plan.parts+' partes</strong><small>'+money(plan.totalCents)+' planeados · '+money(remaining)+' ainda previstos</small></div>'+
        '<button class="btn secondary" type="button" data-walli-plan-cancel="'+attr(plan.id)+'">'+icon('close',16)+'<span>Cancelar plano</span></button></div>'+
        (!matches?'<div class="walli-plan-warning" role="status">'+icon('alert',16)+'<span>O total mudou desde a criação do plano. Cancele e crie um novo plano com o valor atual.</span></div>':'')+
        '<div class="walli-plan-list">'+installments+'</div>'+
      '</div>';
    }else{
      planHtml='<div class="walli-plan-empty">'+icon('calendar',20)+'<div><strong>Sem plano com datas</strong><small>Use “Dividir pagamento” no resumo para guardar as datas das próximas partes.</small></div></div>';
    }

    const reversals=new Set((appState.petShare.payments||[]).filter(item=>item.monthKey===selectedMonth&&item.direction==='outbound-reversal'&&item.reversalOfId).map(item=>item.reversalOfId));
    const history=(appState.petShare.payments||[])
      .filter(item=>item.monthKey===selectedMonth&&(item.direction==='outbound'||item.direction==='outbound-reversal'||item.direction==='inbound'))
      .sort((a,b)=>new Date(b.paidAt)-new Date(a.paidAt))
      .map(item=>{
        if(item.direction==='outbound-reversal'){
          return '<div class="walli-payment-row is-reversal"><span class="walli-payment-icon">'+icon('alert',16)+'</span><div><strong>Anulação</strong><small>'+fmtDateTime(item.paidAt)+' · '+money(item.amountCents)+'</small></div></div>';
        }
        if(item.direction==='inbound'){
          return '<div class="walli-payment-row is-legacy"><span class="walli-payment-icon">'+icon('receipt',16)+'</span><div><strong>Histórico anterior recebido</strong><small>'+fmtDateTime(item.paidAt)+' · '+money(item.amountCents)+'</small></div></div>';
        }
        const reversed=reversals.has(item.id);
        return '<div class="walli-payment-row'+(reversed?' is-reversed':'')+'"><span class="walli-payment-icon">'+icon(reversed?'alert':'wallet',16)+'</span><div class="walli-payment-copy"><strong>'+esc(reversed?'Pagamento anulado':'Pagamento ao '+caregiver)+'</strong><small>'+fmtDateTime(item.paidAt)+' · '+money(item.amountCents)+(item.linkedBillId?' · em Despesas':'')+'</small></div>'+
          (!reversed?'<button class="btn secondary" type="button" data-walli-reverse-payment="'+attr(item.id)+'">'+icon('trash',16)+'<span>Anular</span></button>':'')+
        '</div>';
      }).join('');

    setHTML('#walliPaymentTimeline',
      '<div class="walli-payment-plan-section"><div class="walli-panel-subhead"><strong>Plano de pagamento</strong><small>Datas e partes futuras</small></div>'+planHtml+'</div>'+
      '<div class="walli-payment-history-section"><div class="walli-panel-subhead"><strong>Movimentos</strong><small>Pagamentos e anulações</small></div><div class="walli-payment-history">'+(history||'<p class="muted">Ainda não existem pagamentos neste mês.</p>')+'</div></div>'
    );
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
    const metricHead=(iconName,label)=>'<div class="walli-card-head"><span class="walli-card-icon">'+icon(iconName,18)+'</span><span>'+label+'</span></div>';
    setHTML('#walliHeroIcon',icon('paw',30));
    const copyIcon=$('[data-walli-copy-icon]');
    if(copyIcon)copyIcon.innerHTML=icon('copy',16);
    let status='';
    if(data.outstandingCents>0){
      status='<article class="walli-summary-card walli-status-card warning">'+
        metricHead('alert','Por pagar ao '+esc(caregiver))+
        '<strong data-money>'+money(data.outstandingCents)+'</strong>'+
        '<small>Não precisa pagar tudo de uma vez. Pode liquidar por partes.</small>'+
        '<div class="walli-payment-actions">'+
          '<button class="btn primary walli-pay-action" type="button" data-walli-receive>'+icon('check',17)+'<span>Pagar tudo</span></button>'+
        '</div>'+
        '<div class="walli-payment-split">'+
          '<div class="walli-split-head"><strong>Dividir pagamento</strong><small>Escolha 2, 3 ou 4 partes. Sem juros, apenas organização do valor em aberto.</small></div>'+
          '<label>Dividir em<select data-walli-split-count aria-label="Número de partes do pagamento"><option value="2">2 partes</option><option value="3">3 partes</option><option value="4">4 partes</option></select></label>'+
          '<div class="walli-split-preview" data-walli-split-preview aria-live="polite"></div>'+
          '<div class="walli-split-actions"><button class="btn secondary walli-partial-action" type="button" data-walli-partial>'+icon('wallet',17)+'<span>Pagar primeira parte agora</span></button><button class="btn secondary walli-plan-save" type="button" data-walli-plan-save>'+icon('calendar',17)+'<span>Guardar plano com datas</span></button></div>'+
        '</div>'+
      '</article>';
    }else if(data.overpaidCents>0){
      status='<article class="walli-summary-card walli-status-card warning">'+
        metricHead('alert','Pago acima do valor atual')+
        '<strong data-money>'+money(data.overpaidCents)+'</strong>'+
        '<small>Reveja a configuração ou os registos do mês.</small>'+
      '</article>';
    }else{
      status='<article class="walli-summary-card walli-status-card success">'+
        metricHead('check','Estado do mês')+
        '<strong>'+(data.paidCents>0?'Liquidado':'Sem valor em falta')+'</strong>'+
        '<small>O pagamento fica separado da base mensal.</small>'+
      '</article>';
    }

    let summary=
      '<article class="walli-summary-card walli-total-card primary">'+
        metricHead('wallet','Total a pagar a '+esc(caregiver))+
        '<strong data-money>'+money(data.totalPayableCents)+'</strong>'+
        '<small>Parte base + custo dos passeios</small>'+
      '</article>'+
      status+
      '<article class="walli-summary-card walli-metric-card">'+
        metricHead('calendar','Dias com '+esc(caregiver))+
        '<strong>'+data.careDays.length+'</strong>'+
        '<small>de '+data.daysInMonth+' dias no mês</small>'+
      '</article>'+
      '<article class="walli-summary-card walli-metric-card">'+
        metricHead('paw','Passeios automáticos')+
        '<strong>'+data.walkCount+'</strong>'+
        '<small>'+data.walksPerDay+' por dia × '+money(data.walkRateCents)+'</small>'+
      '</article>'+
      '<article class="walli-summary-card walli-metric-card">'+
        metricHead('report','Parte base de '+esc(caregiver))+
        '<strong data-money>'+money(data.shareCents)+'</strong>'+
        '<small>'+(data.config.calculationMode==='proportional'?'Proporcional aos dias':'Valor diário fixo')+'</small>'+
      '</article>'+
      '<article class="walli-summary-card walli-metric-card">'+
        metricHead('paw','Custo dos passeios')+
        '<strong data-money>'+money(data.walksCostCents)+'</strong>'+
        '<small>'+data.walkCount+' passeio'+(data.walkCount===1?'':'s')+'</small>'+
      '</article>'+
      '<article class="walli-summary-card walli-metric-card">'+
        metricHead('wallet','Base mensal')+
        '<strong data-money>'+money(data.config.baseCents)+'</strong>'+
        '<small>'+esc(monthLabel(data.monthKey))+'</small>'+
      '</article>'+
      '<article class="walli-summary-card walli-metric-card">'+
        metricHead('check','Já pago')+
        '<strong data-money>'+money(data.paidCents)+'</strong>'+
        '<small>Pagamentos registados nesta secção</small>'+
      '</article>';
    if(data.config.calculationMode==='proportional'){
      summary+='<article class="walli-summary-card walli-metric-card walli-muted-card">'+
        metricHead('report','Parte do proprietário')+
        '<strong data-money>'+money(data.ownerShareCents)+'</strong>'+
        '<small>Base menos a parte de '+esc(caregiver)+'</small>'+
      '</article>';
    }
    if(data.legacyReceivedCents>0){
      summary+='<article class="walli-summary-card walli-metric-card warning">'+
        metricHead('alert','Histórico anterior recebido')+
        '<strong data-money>'+money(data.legacyReceivedCents)+'</strong>'+
        '<small>Não é abatido ao total a pagar ao '+esc(caregiver)+'.</small>'+
      '</article>';
    }
    setHTML('#walliShareSummary',summary);
    renderPaymentSplitPreview();
    renderPaymentPanel(data);

    const mode=$('#walliShareMode');
    const base=$('#walliShareBase');
    const daily=$('#walliShareDailyRate');
    const dailyLabel=$('#walliShareDailyRateLabel');
    const walksPerDay=$('#walliWalksPerDay');
    const walkRate=$('#walliWalkRate');
    if(mode)mode.value=data.config.calculationMode;
    if(base)base.value=data.config.baseCents?(data.config.baseCents/100).toFixed(2).replace('.',','):'';
    if(daily)daily.value=data.config.dailyRateCents?(data.config.dailyRateCents/100).toFixed(2).replace('.',','):'';
    if(walksPerDay)walksPerDay.value=String(data.walksPerDay);
    if(walkRate)walkRate.value=(data.walkRateCents/100).toFixed(2).replace('.',',');
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

    renderCarePreview();
    renderCalendar(data);

    const records=data.records.slice().sort((a,b)=>a.startDate.localeCompare(b.startDate)).map(record=>{
      const days=recordDaysInMonth(record,data.monthKey).length;
      const walks=days*data.walksPerDay;
      const period=esc(fmtDate(record.startDate))+(record.startDate!==record.endDate?' a '+esc(fmtDate(record.endDate)):'');
      const note=record.note?'<p class="walli-record-note">'+esc(record.note)+'</p>':'';
      return '<div class="walli-record-row">'+
        '<div class="walli-record-main">'+
          '<span class="walli-record-icon" aria-hidden="true">'+icon('calendar',18)+'</span>'+
          '<div class="walli-record-copy">'+
            '<strong>'+period+'</strong>'+
            '<div class="walli-record-meta">'+
              '<span>'+days+' dia'+(days===1?'':'s')+'</span>'+
              '<span>'+walks+' passeio'+(walks===1?'':'s')+'</span>'+
            '</div>'+
            note+
          '</div>'+
        '</div>'+
        '<div class="walli-record-actions">'+
          '<button class="btn secondary" type="button" data-walli-edit="'+attr(record.id)+'">'+icon('edit',16)+'<span>Editar</span></button>'+
          '<button class="btn secondary walli-delete-action" type="button" data-walli-delete="'+attr(record.id)+'"><span>Eliminar</span></button>'+
        '</div>'+
      '</div>';
    }).join('');
    setHTML('#walliShareRecords',records||empty('Ainda não há dias de '+petName+' com '+caregiver+' neste mês.'));
  }

  function ensureMonth(monthKey){
    appState.petShare ||= {petName:'Walli',caregiverName:'Nuno',months:{},records:[],payments:[],plans:[]};
    appState.petShare.months ||= {};
    appState.petShare.months[monthKey] ||= {baseCents:0,calculationMode:'proportional',dailyRateCents:0,walksPerDay:1,walkRateCents:800,updatedAt:new Date().toISOString()};
    return appState.petShare.months[monthKey];
  }

  async function saveSettings(event){
    event.preventDefault();
    const mode=$('#walliShareMode')?.value==='daily-fixed'?'daily-fixed':'proportional';
    const base=parseCents($('#walliShareBase')?.value||'');
    const daily=parseCents($('#walliShareDailyRate')?.value||'');
    const walksPerDay=Number($('#walliWalksPerDay')?.value||1);
    const walkRate=parseCents($('#walliWalkRate')?.value||'8,00');
    if(!validCents(base,0)||!validCents(daily,0)||!validCents(walkRate,0)){toast('Valores da partilha inválidos.');return;}
    if(walksPerDay!==1&&walksPerDay!==2){toast('Escolha 1 ou 2 passeios por dia.');return;}
    const config=ensureMonth(selectedMonth);
    config.baseCents=base;
    config.calculationMode=mode;
    config.dailyRateCents=daily;
    config.walksPerDay=walksPerDay;
    config.walkRateCents=walkRate;
    config.updatedAt=new Date().toISOString();
    await commit('updated','general');
    toast('Configuração da partilha guardada.');
  }

  function renderCarePreview(){
    const target=$('#walliCareAutoWalks');
    if(!target)return;
    const start=cleanDateKey($('#walliCareStart')?.value);
    const end=cleanDateKey($('#walliCareEnd')?.value);
    const days=rangeDays(start,end);
    const config=monthConfig(selectedMonth);
    const selectedPerDay=Number($('#walliWalksPerDay')?.value);
    const perDay=selectedPerDay===2?2:(selectedPerDay===1?1:(config.walksPerDay===2?2:1));
    const enteredRate=parseCents($('#walliWalkRate')?.value||'');
    const rate=validCents(enteredRate,0)?enteredRate:(Number.isSafeInteger(config.walkRateCents)?config.walkRateCents:800);
    const count=days.length*perDay;
    const cost=walkCostCents(rate,count);
    setHTML('#walliCareAutoWalks',
      '<div class="walli-auto-head"><span class="walli-auto-icon">'+icon('paw',18)+'</span><span>Cálculo automático</span></div>'+
      '<div class="walli-auto-values">'+
        '<div><small>Passeios</small><strong>'+count+'</strong></div>'+
        '<div><small>Custo estimado</small><strong data-money>'+money(cost)+'</strong></div>'+
      '</div>'+
      '<small class="walli-auto-rule">'+days.length+' dia'+(days.length===1?'':'s')+' × '+perDay+' passeio'+(perDay===1?'':'s')+' por dia</small>'
    );
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
    const note=$('#walliCareNote');
    if(note)note.value='';
    renderCarePreview();
  }

  function editCare(id){
    const record=(appState.petShare.records||[]).find(item=>item.id===id);
    const form=$('#walliCareForm');
    if(!record||!form)return;
    form.dataset.editingId=id;
    const start=$('#walliCareStart');
    const end=$('#walliCareEnd');
    const note=$('#walliCareNote');
    if(start){start.value=record.startDate;start.dataset.monthKey=record.startDate.slice(0,7);}
    if(end){end.value=record.endDate;end.dataset.monthKey=record.endDate.slice(0,7);}
    if(note)note.value=record.note||'';
    renderCarePreview();
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
    const days=rangeDays(start,end);
    if(!days.length){toast('Período inválido.');return;}
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

  async function copyPreviousConfig(button){
    if(button?.disabled)return;
    const previous=previousMonthKey(selectedMonth);
    const source=appState?.petShare?.months?.[previous];
    if(!source){toast('O mês anterior ainda não tem configuração para copiar.');return;}
    if(!confirm('Usar em '+monthLabel(selectedMonth)+' a configuração de '+monthLabel(previous)+'?'))return;
    if(button)button.disabled=true;
    const target=ensureMonth(selectedMonth);
    target.baseCents=source.baseCents;
    target.calculationMode=source.calculationMode;
    target.dailyRateCents=source.dailyRateCents;
    target.walksPerDay=source.walksPerDay;
    target.walkRateCents=source.walkRateCents;
    target.updatedAt=new Date().toISOString();
    await commit('updated','general');
    toast('Configuração do mês anterior aplicada.');
  }

  async function savePaymentPlan(button){
    if(button?.disabled)return;
    const data=snapshot(selectedMonth);
    if(data.outstandingCents<=0){toast('Não existe valor em aberto para dividir.');return;}
    const parts=Number($('[data-walli-split-count]')?.value||2);
    const amounts=splitPaymentCents(data.outstandingCents,parts);
    const dateInputs=[...$('[data-walli-split-date]')];
    const dates=dateInputs.map(input=>cleanDateKey(input.value));
    if(amounts.length!==parts||dates.length!==parts||dates.some(date=>!date)){toast('Defina a data de todas as partes do plano.');return;}
    for(let index=1;index<dates.length;index+=1){
      if(dates[index]<dates[index-1]){toast('As datas do plano devem estar por ordem cronológica.');return;}
    }
    const now=new Date().toISOString();
    const current=activePlan(selectedMonth);
    if(current&&!confirm('Já existe um plano ativo. Substituir pelo novo plano?'))return;
    if(button)button.disabled=true;
    if(current){current.cancelledAt=now;current.updatedAt=now;}
    appState.petShare.plans ||= [];
    const planId=uid();
    appState.petShare.plans.push({
      id:planId,
      monthKey:selectedMonth,
      totalCents:data.outstandingCents,
      parts,
      installments:amounts.map((amountCents,index)=>({id:cleanString(planId+'_'+(index+1),80),amountCents,dueDate:dates[index],paidAt:null,paymentId:undefined})),
      cancelledAt:null,
      createdAt:now,
      updatedAt:now,
      syncResolvedAt:null
    });
    await commit('created','general');
    toast('Plano de pagamento guardado.');
  }

  async function cancelPaymentPlan(planId,button){
    const plan=(appState.petShare.plans||[]).find(item=>item.id===planId&&!item.cancelledAt);
    if(!plan)return;
    if(!confirm('Cancelar este plano? Os pagamentos já efetuados permanecem registados.'))return;
    if(button)button.disabled=true;
    plan.cancelledAt=new Date().toISOString();
    plan.updatedAt=plan.cancelledAt;
    await commit('updated','general');
    toast('Plano cancelado.');
  }

  async function payPlanInstallment(planId,installmentId,button){
    const plan=(appState.petShare.plans||[]).find(item=>item.id===planId&&!item.cancelledAt);
    const installment=plan?.installments?.find(item=>item.id===installmentId);
    if(!plan||!installment||installment.paidAt)return;
    const data=snapshot(selectedMonth);
    if(planRemainingCents(plan)!==data.outstandingCents){toast('O total mudou. Cancele e recrie o plano antes de pagar.');return;}
    if(installment.amountCents>data.outstandingCents){toast('A parcela é superior ao valor atualmente em aberto.');return;}
    const caregiver=appState.petShare.caregiverName||'Nuno';
    if(!confirm('Registar '+money(installment.amountCents)+' como pago ao '+caregiver+'?'))return;
    if(button)button.disabled=true;
    addOutboundPayment(installment.amountCents,'Parcela do plano da Partilha do Walli · '+fmtDate(installment.dueDate),installment);
    plan.updatedAt=new Date().toISOString();
    await commit('created','payment');
    toast('Parcela paga e registada também em Despesas.');
  }

  async function reverseWalliPayment(paymentId,button){
    const payment=(appState.petShare.payments||[]).find(item=>item.id===paymentId&&item.direction==='outbound');
    if(!payment)return;
    const already=(appState.petShare.payments||[]).some(item=>item.direction==='outbound-reversal'&&item.reversalOfId===payment.id);
    if(already){toast('Este pagamento já está anulado.');return;}
    if(!confirm('Anular este pagamento de '+money(payment.amountCents)+'? O valor voltará a ficar por pagar e a despesa ligada será removida.'))return;
    if(button)button.disabled=true;
    const now=new Date().toISOString();
    removeMirroredWalliExpense(payment);
    for(const plan of appState.petShare.plans||[]){
      const installment=(plan.installments||[]).find(item=>item.paymentId===payment.id);
      if(installment){installment.paymentId=undefined;installment.paidAt=null;plan.updatedAt=now;}
    }
    appState.petShare.payments.push({
      id:uid(),monthKey:payment.monthKey,direction:'outbound-reversal',reversalOfId:payment.id,
      amountCents:payment.amountCents,paidAt:now,note:'Anulação do pagamento '+payment.id,
      createdAt:now,updatedAt:now,syncResolvedAt:null
    });
    await commit('updated','payment');
    toast('Pagamento anulado sem apagar o histórico.');
  }

  async function receive(button){
    if(button?.disabled)return;
    if(button)button.disabled=true;
    const data=snapshot(selectedMonth);
    if(data.outstandingCents<=0){render();return;}
    if(!confirm('Registar '+money(data.outstandingCents)+' como pago ao '+(appState.petShare.caregiverName||'Nuno')+'?')){if(button)button.disabled=false;return;}
    const plan=activePlan(selectedMonth);
    if(plan){plan.cancelledAt=new Date().toISOString();plan.updatedAt=plan.cancelledAt;}
    addOutboundPayment(data.outstandingCents,'Pagamento total da partilha e passeios do Walli');
    await commit('created','payment');
    toast('Pagamento total registado e lançado em Despesas.');
  }

  async function payPartial(button){
    if(button?.disabled)return;
    const data=snapshot(selectedMonth);
    if(data.outstandingCents<=0){render();return;}
    const select=$('[data-walli-split-count]');
    const parts=Number(select?.value||2);
    const paymentParts=splitPaymentCents(data.outstandingCents,parts);
    if(paymentParts.length<2||paymentParts[0]<=0){toast('Não foi possível dividir este valor.');return;}
    const amountCents=paymentParts[0];
    const remainingCents=Math.max(0,data.outstandingCents-amountCents);
    if(button)button.disabled=true;
    const caregiver=appState.petShare.caregiverName||'Nuno';
    const message='Registar '+money(amountCents)+' como pagamento parcial ao '+caregiver+'? Depois ficam '+money(remainingCents)+' por pagar.';
    if(!confirm(message)){if(button)button.disabled=false;return;}
    const plan=activePlan(selectedMonth);
    if(plan){plan.cancelledAt=new Date().toISOString();plan.updatedAt=plan.cancelledAt;}
    addOutboundPayment(amountCents,'Pagamento parcial da partilha e passeios do Walli · divisão rápida em '+parts+' partes');
    await commit('created','payment');
    toast('Pagamento parcial registado em Despesas. O restante continua por pagar.');
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
    $('#walliCareStart')?.addEventListener('change',renderCarePreview);
    $('#walliCareEnd')?.addEventListener('change',renderCarePreview);
    $('#walliWalksPerDay')?.addEventListener('change',renderCarePreview);
    $('#walliWalkRate')?.addEventListener('input',renderCarePreview);
    $('[data-walli-copy-previous]')?.addEventListener('click',event=>void copyPreviousConfig(event.currentTarget));
    $('#walliShareMode')?.addEventListener('change',event=>{
      const label=$('#walliShareDailyRateLabel');
      if(label)label.hidden=event.target.value!=='daily-fixed';
    });
    page.addEventListener('change',event=>{
      if(event.target.closest('[data-walli-split-count]'))renderPaymentSplitPreview();
    });
    page.addEventListener('click',event=>{
      const savePlan=event.target.closest('[data-walli-plan-save]');
      if(savePlan){void savePaymentPlan(savePlan);return;}
      const cancelPlan=event.target.closest('[data-walli-plan-cancel]');
      if(cancelPlan){void cancelPaymentPlan(cancelPlan.dataset.walliPlanCancel,cancelPlan);return;}
      const planPay=event.target.closest('[data-walli-plan-pay]');
      if(planPay){void payPlanInstallment(planPay.dataset.walliPlanPay,planPay.dataset.walliInstallment,planPay);return;}
      const reversePayment=event.target.closest('[data-walli-reverse-payment]');
      if(reversePayment){void reverseWalliPayment(reversePayment.dataset.walliReversePayment,reversePayment);return;}
      const edit=event.target.closest('[data-walli-edit]');
      if(edit){editCare(edit.dataset.walliEdit);return;}
      const del=event.target.closest('[data-walli-delete]');
      if(del){void deleteCare(del.dataset.walliDelete,del);return;}
      const partialButton=event.target.closest('[data-walli-partial]');
      if(partialButton){void payPartial(partialButton);return;}
      const receiveButton=event.target.closest('[data-walli-receive]');
      if(receiveButton)void receive(receiveButton);
    });
  }

  window.renderPetShare=render;
  window.wireWalliShareEvents=wire;
  window.walliShareSnapshot=snapshot;
  window.walliShareRangeDays=rangeDays;
  window.walliShareTargetCents=targetCents;
  window.walliShareWalkCostCents=walkCostCents;
  window.walliShareSplitPaymentCents=splitPaymentCents;
  window.walliSharePreviousMonthKey=previousMonthKey;
})(window);
