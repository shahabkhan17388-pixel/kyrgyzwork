(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const DAY=86400000, NBKR_USD_RATE=87.45, NBKR_RATE_DATE='24 Nov 2026';
const utc=(y,m,d)=>new Date(Date.UTC(y,m,d));
const parseDate=s=>{if(!s)return null;const p=s.split('-').map(Number);if(p.length!==3)return null;const d=utc(p[0],p[1]-1,p[2]);return d.getUTCFullYear()===p[0]&&d.getUTCMonth()===p[1]-1&&d.getUTCDate()===p[2]?d:null};
const today=()=>{const d=new Date();return utc(d.getFullYear(),d.getMonth(),d.getDate())};
const dateValue=d=>[d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')].join('-');
const addDays=(d,n)=>utc(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+n);
const addMonths=(d,n)=>{const first=utc(d.getUTCFullYear(),d.getUTCMonth()+n,1),last=utc(first.getUTCFullYear(),first.getUTCMonth()+1,0).getUTCDate();return utc(first.getUTCFullYear(),first.getUTCMonth(),Math.min(d.getUTCDate(),last))};
const language=()=>['en','ur','ru'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const fmt=n=>Math.round(n).toLocaleString('en-US')+' KGS';
const usd=n=>'$'+Math.round(n).toLocaleString('en-US');
const dateFmt=d=>new Intl.DateTimeFormat(language()==='ur'?'en-GB':language()==='ru'?'ru-RU':'en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(d);
const duration=(a,b)=>{
 let m=Math.max(0,(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth());
 if(addMonths(a,m)>b)m--;
 const anchor=addMonths(a,m),days=Math.floor((b-anchor)/DAY),years=Math.floor(m/12),months=m%12,lang=language();
 if(lang==='ur'){const parts=[];if(years)parts.push(years+' سال');if(months)parts.push(months+' ماہ');if(days)parts.push(days+' دن');return parts.join('، ')||'ایک ماہ سے کم'}
 if(lang==='ru'){const parts=[];if(years)parts.push(years+' г.');if(months)parts.push(months+' мес.');if(days)parts.push(days+' дн.');return parts.join(' ')||'Менее месяца'}
 const parts=[];if(years)parts.push(years+' year'+(years===1?'':'s'));if(months)parts.push(months+' month'+(months===1?'':'s'));if(days)parts.push(days+' day'+(days===1?'':'s'));return parts.join(', ')||'Less than one month';
};
const set=(key,value)=>{const el=$('[data-out="'+key+'"]');if(el)el.textContent=value};
const error=(name,msg)=>{const el=$('[data-calc-error="'+name+'"]');if(el)el.textContent=msg};
const result=(name,show)=>{const el=$('[data-calc-result="'+name+'"]');if(el)el.hidden=!show};
const copy={
 en:{
  bad:'Please select a valid visa expiry date.',valid:'Your visa is still valid. Days remaining: ',expired:'Your visa expired ',days:' day(s) ago.',noFine:'0 KGS',fineLabel:'Estimated Article 431 fine today',startFine:'If you remain after your visa expires on ',mayStart:', an indicative fine may start at 5,500 KGS.',nextFine:'The estimated fine may increase to ',on:' from ',last:'The highest listed individual fine band is 20,000 KGS. Confirm the actual amount with the authorities.',fineBands:['Up to 1 month','More than 1 to 3 months','More than 3 to 6 months','More than 6 months to 1 year','More than 1 year'],wa:(e,d,f,n)=>'Hello KYRGYZ WORK. My visa expiry date is '+e+'. Overstay: '+d+' day(s). Indicative Article 431 fine today: '+f+'. '+n+' Please explain the official process and your service fee before I proceed.',
  exitValid:'Your visa has not expired. No overstay fine or exit-visa fee is estimated today.',exitExpired:n=>'Visa expired '+n+' day(s) ago. Estimated overstay: ',protocol:'Article 431 protocol fine',exitFee:'Exit-visa fee',total:'Estimated government total',noExit:'No exit-visa fee is estimated while your visa remains valid.',exitBands:['Up to 3 months','More than 3 months to 1 year','More than 1 to 2 years','Each additional year'],usdAlt:'USD amount shown as an alternative, not an extra charge.',extraRate:'Additional years are converted at the NBKR official rate of 87.45 KGS/USD dated 24 Nov 2026. The payment-day rate may differ.',extraYearNext:'The additional-year fee may rise by $1,100 from ',scheduleExpired:'The published temporary exit-visa schedule was stated to apply through 31 Dec 2026. Please contact us to confirm the current fee before relying on an estimate.',nextExit:'The exit-visa fee may move to the next band after ',nextExitAmount:'. The next band is ',serviceNote:'KYRGYZ WORK service fee is separate and agreed before work begins.',waExit:(e,d,p,x,t)=>'Hello KYRGYZ WORK. Visa expiry date: '+e+'. Overstay: '+d+' day(s). Article 431 fine estimate: '+p+'. Exit-visa fee estimate: '+x+'. Estimated government total: '+t+'. Please confirm current official charges and your service fee before I proceed.'
 },
 ur:{
  bad:'براہِ کرم ویزا ختم ہونے کی درست تاریخ منتخب کریں۔',valid:'آپ کا ویزا ابھی درست ہے۔ باقی دن: ',expired:'آپ کا ویزا ختم ہوئے ',days:' دن ہو چکے ہیں۔',noFine:'0 KGS',fineLabel:'آرٹیکل 431 کے تحت آج کا تخمینی جرمانہ',startFine:'اگر آپ ',mayStart:' کے بعد بھی قیام کرتے ہیں تو تخمینی جرمانہ 5,500 KGS سے شروع ہو سکتا ہے۔',nextFine:'تخمینی جرمانہ بڑھ کر ',on:' سے ',last:'افراد کے لیے درج آخری جرمانہ 20,000 KGS ہے۔ اصل رقم متعلقہ حکام سے تصدیق کریں۔',fineBands:['ایک ماہ تک','ایک سے تین ماہ','تین سے چھ ماہ','چھ ماہ سے ایک سال','ایک سال سے زیادہ'],wa:(e,d,f,n)=>'السلام علیکم KYRGYZ WORK۔ میرے ویزا کی آخری تاریخ '+e+' ہے۔ زائد قیام: '+d+' دن۔ آرٹیکل 431 کا تخمینی جرمانہ: '+f+'۔ '+n+' براہ کرم سرکاری طریقہ اور سروس فیس پہلے بتائیں۔',
  exitValid:'آپ کا ویزا ختم نہیں ہوا۔ آج پروٹوکول جرمانہ یا ایگزٹ ویزا فیس کا تخمینہ نہیں ہے۔',exitExpired:n=>'ویزا ختم ہوئے '+n+' دن ہو چکے ہیں۔ زائد قیام: ',protocol:'آرٹیکل 431 پروٹوکول جرمانہ',exitFee:'ایگزٹ ویزا فیس',total:'کل تخمینی سرکاری رقم',noExit:'ویزا درست ہونے کی صورت میں ایگزٹ ویزا فیس نہیں بنتی۔',exitBands:['تین ماہ تک','تین ماہ سے ایک سال','ایک سے دو سال','ہر اضافی سال'],usdAlt:'ڈالر کی رقم متبادل ہے، اضافی فیس نہیں۔',extraRate:'اضافی سالوں کی رقم 24 نومبر 2026 کے NBKR سرکاری ریٹ 87.45 KGS/USD سے تبدیل کی گئی ہے۔ ادائیگی کے دن ریٹ مختلف ہو سکتا ہے۔',extraYearNext:'ہر اضافی سال کی فیس میں $1,100 کا اضافہ ہو سکتا ہے، تاریخ: ',scheduleExpired:'شائع شدہ عارضی ایگزٹ ویزا شیڈول 31 دسمبر 2026 تک بتایا گیا تھا۔ تخمینہ استعمال کرنے سے پہلے موجودہ فیس ہم سے تصدیق کریں۔',nextExit:'ایگزٹ ویزا فیس اگلے درجے میں جا سکتی ہے: ',nextExitAmount:'۔ اگلا درجہ: ',serviceNote:'KYRGYZ WORK کی سروس فیس الگ ہے اور کام شروع کرنے سے پہلے طے ہوگی۔',waExit:(e,d,p,x,t)=>'السلام علیکم KYRGYZ WORK۔ ویزا ختم ہونے کی تاریخ: '+e+'۔ زائد قیام: '+d+' دن۔ آرٹیکل 431 جرمانہ: '+p+'۔ ایگزٹ ویزا فیس: '+x+'۔ کل تخمینی سرکاری رقم: '+t+'۔ براہ کرم موجودہ سرکاری رقم اور اپنی سروس فیس کی تصدیق کریں۔'
 },
 ru:{
  bad:'Укажите корректную дату окончания визы.',valid:'Ваша виза ещё действует. Осталось дней: ',expired:'Срок визы истёк ',days:' дн. назад.',noFine:'0 KGS',fineLabel:'Ориентировочный штраф по статье 431 на сегодня',startFine:'Если вы останетесь после ',mayStart:', ориентировочный штраф может составить от 5 500 KGS.',nextFine:'Ориентировочный штраф может вырасти до ',on:' с ',last:'Максимальная указанная категория штрафа для физлиц — 20 000 KGS. Уточните сумму у компетентных органов.',fineBands:['До 1 месяца','Свыше 1 до 3 месяцев','Свыше 3 до 6 месяцев','Свыше 6 месяцев до 1 года','Более 1 года'],wa:(e,d,f,n)=>'Здравствуйте, KYRGYZ WORK. Срок моей визы: '+e+'. Просрочка: '+d+' дн. Ориентировочный штраф по статье 431: '+f+'. '+n+' Прошу сообщить официальный порядок и стоимость вашей услуги до начала работы.',
  exitValid:'Срок визы не истёк. На сегодня штраф и сбор за выездную визу не рассчитываются.',exitExpired:n=>'Срок визы истёк '+n+' дн. назад. Просрочка: ',protocol:'Штраф по статье 431',exitFee:'Сбор за выездную визу',total:'Общая ориентировочная сумма',noExit:'Пока виза действует, сбор за выездную визу не рассчитывается.',exitBands:['До 3 месяцев','Свыше 3 месяцев до 1 года','Свыше 1 до 2 лет','Каждый дополнительный год'],usdAlt:'Сумма в долларах указана как эквивалент, а не дополнительный сбор.',extraRate:'Дополнительные годы пересчитаны по официальному курсу НБКР 87,45 KGS/USD на 24 ноября 2026 года. На день оплаты курс может отличаться.',extraYearNext:'Сбор за каждый дополнительный год может вырасти ещё на $1 100 с ',scheduleExpired:'Опубликованный временный тариф выездной визы был установлен до 31 декабря 2026 года. Свяжитесь с нами, чтобы уточнить действующую сумму.',nextExit:'Сбор за выездную визу может перейти в следующую категорию после ',nextExitAmount:'. Следующая категория: ',serviceNote:'Сервисная плата KYRGYZ WORK согласуется отдельно до начала работы.',waExit:(e,d,p,x,t)=>'Здравствуйте, KYRGYZ WORK. Срок визы: '+e+'. Просрочка: '+d+' дн. Штраф по статье 431: '+p+'. Сбор за выездную визу: '+x+'. Общая ориентировочная сумма: '+t+'. Прошу подтвердить действующие официальные платежи и стоимость вашей услуги до начала работы.'
 }
};
const fineInfo=(expiry,now)=>{
 const days=Math.max(0,Math.floor((now-expiry)/DAY));
 const bands=[{months:1,amount:5500},{months:3,amount:10000},{months:6,amount:15000},{months:12,amount:17500},{months:Infinity,amount:20000}];
 if(!days)return{days,amount:0,index:-1,nextDate:addDays(expiry,1),nextAmount:5500};
 const index=bands.findIndex(x=>x.months===Infinity||now<=addMonths(expiry,x.months));
 const band=bands[Math.max(0,index)];
 const nextDate=index<bands.length-1?addDays(addMonths(expiry,band.months),1):null;
 return{days,amount:band.amount,index:Math.max(0,index),nextDate,nextAmount:index<bands.length-1?bands[index+1].amount:null};
};
const protocolNextText=(info,c,expiry)=>{
 if(!info.days)return c.startFine+dateFmt(expiry)+c.mayStart;
 if(info.nextDate)return c.nextFine+fmt(info.nextAmount)+c.on+dateFmt(info.nextDate)+'.';
 return c.last;
};
const calcProtocol=()=>{
 const lang=language(),c=copy[lang],input=$('#protocolExpiry'),expiry=parseDate(input?.value||''),now=today();
 if(!expiry){error('protocol',c.bad);result('protocol',false);input?.focus();return}
 error('protocol','');
 const info=fineInfo(expiry,now);
 set('protocol-status',info.days?c.expired+info.days+c.days:c.valid+Math.max(0,Math.ceil((expiry-now)/DAY)));
 const status=$('[data-out="protocol-status"]');if(status)status.dataset.state=info.days?'over':'ok';
 set('protocol-total',info.days?fmt(info.amount):c.noFine);
 const next=protocolNextText(info,c,expiry);set('protocol-next',next);
 const msg=c.wa(dateValue(expiry),info.days,info.days?fmt(info.amount):c.noFine,next);
 const link=$('[data-out="protocol-wa"]');if(link)link.href='https://wa.me/996555746401?text='+encodeURIComponent(msg);
 result('protocol',true);
};
const exitFeeInfo=(expiry,now)=>{
 const days=Math.max(0,Math.floor((now-expiry)/DAY));
 if(!days)return{days,kgs:0,usd:0,band:-1,extraYears:0,nextDate:null,nextKgs:17500,nextUsd:200};
 if(now<=addMonths(expiry,3))return{days,kgs:17500,usd:200,band:0,extraYears:0,nextDate:addDays(addMonths(expiry,3),1),nextKgs:96250,nextUsd:1100};
 if(now<=addMonths(expiry,12))return{days,kgs:96250,usd:1100,band:1,extraYears:0,nextDate:addDays(addMonths(expiry,12),1),nextKgs:192500,nextUsd:2200};
 if(now<=addMonths(expiry,24))return{days,kgs:192500,usd:2200,band:2,extraYears:0,nextDate:addDays(addMonths(expiry,24),1),nextKgs:Math.round(192500+1100*NBKR_USD_RATE),nextUsd:3300};
 let extra=0;while(now>addMonths(expiry,24+12*extra))extra++;
 const kgs=192500+Math.round(extra*1100*NBKR_USD_RATE),usdAmount=2200+1100*extra;
 const nextDate=addDays(addMonths(expiry,24+12*extra),1);
 return{days,kgs,usd:usdAmount,band:3,extraYears:extra,nextDate,nextKgs:kgs+Math.round(1100*NBKR_USD_RATE),nextUsd:usdAmount+1100};
};
const calcExit=()=>{
 const lang=language(),c=copy[lang],input=$('#exitExpiry'),expiry=parseDate(input?.value||''),now=today();
 if(!expiry){error('exit',c.bad);result('exit',false);input?.focus();return}
 error('exit','');
 if(now>utc(2026,11,31)){set('exit-status',c.scheduleExpired);set('exit-protocol','—');set('exit-visa','—');set('exit-total','—');set('exit-usd-note',c.scheduleExpired);set('exit-next','');result('exit',true);return}
 const fine=fineInfo(expiry,now),fee=exitFeeInfo(expiry,now),overdue=fine.days;
 const total=fine.amount+fee.kgs;
 set('exit-status',overdue?c.exitExpired(overdue)+duration(expiry,now):c.exitValid);
 const status=$('[data-out="exit-status"]');if(status)status.dataset.state=overdue?'over':'ok';
 set('exit-protocol',overdue?fmt(fine.amount):c.noFine);
 set('exit-visa',overdue?fmt(fee.kgs):c.noExit);
 set('exit-total',fmt(total));
 let note=overdue?c.exitBands[fee.band]+': '+usd(fee.usd)+' · '+c.usdAlt:c.noExit;
 if(overdue&&fee.extraYears)note+=' '+c.extraRate;
 set('exit-usd-note',note);
 let nextText='';
 if(!overdue)nextText=c.startFine+dateFmt(expiry)+c.mayStart;
 else if(fine.nextDate)nextText=c.nextFine+fmt(fine.nextAmount)+c.on+dateFmt(fine.nextDate)+'.';
 else nextText=c.last;
 if(overdue&&fee.nextDate&&fee.band<3)nextText+=' '+c.nextExit+dateFmt(fee.nextDate)+c.nextExitAmount+c.exitBands[fee.band+1]+'.';
 else if(overdue&&fee.band===3&&fee.nextDate)nextText+=' '+c.extraYearNext+dateFmt(fee.nextDate)+'.';
 set('exit-next',nextText);
 const message=c.waExit(dateValue(expiry),overdue,overdue?fmt(fine.amount):c.noFine,overdue?fmt(fee.kgs)+' ('+usd(fee.usd)+')':c.noExit,fmt(total));
 const link=$('[data-out="exit-wa"]');if(link)link.href='https://wa.me/996555746401?text='+encodeURIComponent(message);
 result('exit',true);
};
const calcVisa=()=>{
 const amount=Number($('#visaUsd')?.value),rate=Number($('#visaRate')?.value),service=Number($('#visaService')?.value);
 if(!Number.isFinite(amount)||amount<0||!Number.isFinite(rate)||rate<=0||!Number.isFinite(service)||service<0){error('visa','Enter a valid government amount, positive exchange rate and non-negative additional charge.');return}
 error('visa','');const base=amount*rate;set('visa-type',$('#visaType').value);set('visa-gov',usd(amount)+' · '+fmt(base));set('visa-rate',rate.toLocaleString('en-US')+' KGS / USD');set('visa-service',fmt(service));set('visa-total',fmt(base+service));result('visa',true)
};
const calcTax=()=>{
 const gross=Number($('#grossSalary')?.value),pit=Number($('#pitRate')?.value),emp=Number($('#employeeRate')?.value),er=Number($('#employerRate')?.value);
 if(!Number.isFinite(gross)||gross<=0||[pit,emp,er].some(v=>!Number.isFinite(v)||v<0||v>100)){error('tax','Enter a salary greater than zero and valid rates from 0% to 100%.');return}
 error('tax','');const pitAmt=gross*pit/100,empAmt=gross*emp/100,erAmt=gross*er/100;set('tax-pit',fmt(pitAmt));set('tax-employee',fmt(empAmt));set('tax-net',fmt(gross-pitAmt-empAmt));set('tax-employer',fmt(erAmt));set('tax-cost',fmt(gross+erAmt));result('tax',true)
};
const runners={protocol:calcProtocol,exit:calcExit,visa:calcVisa,tax:calcTax};
$$('[data-calc-tab]').forEach((btn,i)=>{btn.addEventListener('click',()=>{const name=btn.dataset.calcTab;$$('[data-calc-tab]').forEach(b=>{const active=b===btn;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});$$('[data-calc-panel]').forEach(p=>p.hidden=p.dataset.calcPanel!==name);$$('[data-calc-error]').forEach(e=>e.textContent='')});btn.tabIndex=i===0?0:-1;btn.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=$$('[data-calc-tab]'),next=(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;tabs[next].focus();tabs[next].click()})});
$$('[data-calc-run]').forEach(btn=>btn.addEventListener('click',()=>runners[btn.dataset.calcRun]?.()));
$$('[data-calc-reset]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.calcReset,panel=$('[data-calc-panel="'+name+'"]');if(!panel)return;$$('input',panel).forEach(i=>{if(i.type==='date')i.value='';else if(i.id==='visaRate')i.value='';else if(i.id==='visaService')i.value='0';else if(i.id==='pitRate')i.value='10';else if(i.id==='employeeRate')i.value='10';else if(i.id==='employerRate')i.value='2.25';else i.value=''});const select=$('select',panel);if(select)select.selectedIndex=0;error(name,'');result(name,false)}));
$$('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>{if(!$('[data-calc-result="protocol"]')?.hidden)calcProtocol();if(!$('[data-calc-result="exit"]')?.hidden)calcExit()}));
$$('input[type="date"]').forEach(input=>input.addEventListener('change',()=>{const panel=input.closest('[data-calc-panel]');if(!panel)return;const name=panel.dataset.calcPanel;if(!$('[data-calc-result="'+name+'"]')?.hidden)runners[name]?.()}));
})();