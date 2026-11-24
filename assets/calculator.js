(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const day=86400000,fmt=n=>Math.round(n).toLocaleString('en-US')+' KGS',usd=n=>'$'+Math.round(n).toLocaleString('en-US');
const utc=(y,m,d)=>new Date(Date.UTC(y,m,d));
const parseDate=s=>{if(!s)return null;const p=s.split('-').map(Number);if(p.length!==3)return null;const d=utc(p[0],p[1]-1,p[2]);return d.getUTCFullYear()===p[0]&&d.getUTCMonth()===p[1]-1&&d.getUTCDate()===p[2]?d:null};
const today=()=>{const d=new Date();return utc(d.getFullYear(),d.getMonth(),d.getDate())};
const dateValue=d=>[d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')].join('-');
const addMonths=(d,n)=>{const first=utc(d.getUTCFullYear(),d.getUTCMonth()+n,1);const last=utc(first.getUTCFullYear(),first.getUTCMonth()+1,0).getUTCDate();return utc(first.getUTCFullYear(),first.getUTCMonth(),Math.min(d.getUTCDate(),last))};
const duration=(a,b)=>{let m=Math.max(0,(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth());if(addMonths(a,m)>b)m--;const anchor=addMonths(a,m),days=Math.floor((b-anchor)/day),y=Math.floor(m/12),mo=m%12;return [y?y+' year'+(y===1?'':'s'):'',mo?mo+' month'+(mo===1?'':'s'):'',days?days+' day'+(days===1?'':'s'):''].filter(Boolean).join(', ')||'Less than one month'};
const set=(key,value)=>{const el=$('[data-out="'+key+'"]');if(el)el.textContent=value};
const error=(name,msg)=>{const el=$('[data-calc-error="'+name+'"]');if(el)el.textContent=msg};
const result=(name,show)=>{const el=$('[data-calc-result="'+name+'"]');if(el)el.hidden=!show};
const language=()=>['en','ur','ru'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const copy={
 en:{bad:'Please select a valid visa expiry date.',valid:'Your visa is still valid for ',upcoming:'If you stay after this date, an overstay fine may apply and may increase the longer you stay.',expired:'Your visa expired ',days:' day(s) ago.',none:'No overstay fine is estimated today.',fine:'Estimated fine today',next:'Your estimated fine may increase to ',on:' on ',after:' if you remain in the country.',last:'No higher estimate is listed after this band. Contact the authorities to confirm the amount.',wa:(e,d,f,n)=>'Hello KYRGYZ WORK. My visa expiry date is '+e+'. It expired '+d+' day(s) ago. The website estimate today is '+f+'. '+n+' Please explain the official process and confirmed charges.'},
 ur:{bad:'براہِ کرم ویزا ختم ہونے کی درست تاریخ منتخب کریں۔',valid:'آپ کا ویزا ابھی درست ہے۔ باقی دن: ',upcoming:'اس تاریخ کے بعد قیام کرنے پر جرمانہ لگ سکتا ہے، اور قیام جاری رکھنے سے بڑھ بھی سکتا ہے۔',expired:'آپ کا ویزا ختم ہوئے ',days:' دن ہو چکے ہیں۔',none:'آج زائد قیام کا کوئی جرمانہ ظاہر نہیں ہوتا۔',fine:'آج کا تخمینی جرمانہ',next:'اگر آپ قیام جاری رکھتے ہیں تو تخمینی جرمانہ بڑھ کر ',on:' کو ',after:' ہو سکتا ہے۔',last:'اس کے بعد کی رقم کی تصدیق متعلقہ حکام سے کریں۔',wa:(e,d,f,n)=>'السلام علیکم KYRGYZ WORK۔ میرے ویزا کی آخری تاریخ '+e+' ہے۔ ویزا ختم ہوئے '+d+' دن ہو چکے ہیں۔ آج کا تخمینہ '+f+' ہے۔ '+n+' براہ کرم سرکاری طریقہ اور تصدیق شدہ اخراجات بتائیں۔'},
 ru:{bad:'Укажите корректную дату окончания визы.',valid:'Ваша виза ещё действует. Осталось дней: ',upcoming:'После этой даты может применяться штраф, который может увеличиваться с продолжением пребывания.',expired:'Срок визы истёк ',days:' дн. назад.',none:'На сегодня штраф за просрочку не рассчитывается.',fine:'Ориентировочный штраф на сегодня',next:'Если вы останетесь, ориентировочный штраф может вырасти до ',on:' ',after:' при дальнейшем пребывании.',last:'Уточните дальнейшую сумму в компетентных органах.',wa:(e,d,f,n)=>'Здравствуйте, KYRGYZ WORK. Срок моей визы истёк '+e+'. Просрочка '+d+' дн. Ориентировочная сумма на сегодня '+f+'. '+n+' Прошу объяснить официальный порядок и подтверждённые платежи.'}
};
const protocolError=()=>{error('protocol',copy[language()].bad);result('protocol',false);$('#protocolExpiry')?.focus()};
const calcProtocol=()=>{
 const c=copy[language()],expiryDate=parseDate($('#protocolExpiry')?.value||''),now=today();
 if(!expiryDate){protocolError();return}
 error('protocol','');
 const overdue=Math.max(0,Math.floor((now-expiryDate)/day));
 let fine=0,nextText='',nextMessage='';
 if(overdue===0){
   const left=Math.max(0,Math.ceil((expiryDate-now)/day));
   set('protocol-status',c.valid+left);
   set('protocol-total',c.none);
   nextText='';
   nextMessage=c.none;
 }else{
   const bands=[
     {months:1,amount:5500},{months:3,amount:10000},{months:6,amount:15000},{months:12,amount:17500},{months:Infinity,amount:20000}
   ];
   let index=bands.findIndex(x=>x.months===Infinity||now<=addMonths(expiryDate,x.months));
   if(index<0)index=bands.length-1;
   fine=bands[index].amount;
   set('protocol-status',c.expired+overdue+c.days);
   set('protocol-total',fmt(fine));
   if(index<bands.length-1){
     const raiseDate=utc(addMonths(expiryDate,bands[index].months).getUTCFullYear(),addMonths(expiryDate,bands[index].months).getUTCMonth(),addMonths(expiryDate,bands[index].months).getUTCDate()+1);
     const raiseText=c.next+fmt(bands[index+1].amount)+c.on+dateValue(raiseDate)+c.after;
     nextText=raiseText;nextMessage=raiseText;
   }else{nextText=c.last;nextMessage=c.last}
 }
 const next=$('[data-out="protocol-next"]');if(next)next.textContent=nextText;
 const statusEl=$('[data-out="protocol-status"]');if(statusEl)statusEl.dataset.state=overdue?'over':'ok';
 const message=c.wa($('#protocolExpiry').value,overdue,overdue?fmt(fine):c.none,nextMessage);
 const link=$('[data-out="protocol-wa"]');if(link)link.href='https://wa.me/996555746401?text='+encodeURIComponent(message);
 result('protocol',true);
};
const expiry=name=>{const input=$('#'+(name==='protocol'?'protocolExpiry':'exitExpiry'));const a=parseDate(input?.value||''),b=today();if(!a){error(name,'Please select a valid visa expiry date.');input?.focus();return null}if(a>=b){error(name,'The expiry date must be earlier than today.');input?.focus();return null}error(name,'');return{a,b,days:Math.floor((b-a)/day)}};
const calcExit=()=>{const x=expiry('exit');if(!x)return;const {a,b,days}=x;let fee,feeUsd,bracket;if(b<=addMonths(a,3)){fee=17500;feeUsd=200;bracket='Up to 3 months'}else if(b<=addMonths(a,12)){fee=96250;feeUsd=1100;bracket='3 months to 1 year'}else if(b<=addMonths(a,24)){fee=192500;feeUsd=2200;bracket='1 to 2 years'}else{let extra=0;while(b>addMonths(a,24+12*extra))extra++;fee=192500+96250*extra;feeUsd=2200+1100*extra;bracket='Over 2 years · '+(2+extra-1)+'+ years'}set('exit-duration',duration(a,b));set('exit-days',days.toLocaleString('en-US')+' days');set('exit-bracket',bracket);set('exit-usd',usd(feeUsd));set('exit-kgs',fmt(fee));result('exit',true)};
const calcVisa=()=>{const amount=Number($('#visaUsd')?.value),rate=Number($('#visaRate')?.value),service=Number($('#visaService')?.value);if(!Number.isFinite(amount)||amount<0||!Number.isFinite(rate)||rate<=0||!Number.isFinite(service)||service<0){error('visa','Enter a valid government amount, positive exchange rate and non-negative additional charge.');return}error('visa','');const base=amount*rate;set('visa-type',$('#visaType').value);set('visa-gov',usd(amount)+' · '+fmt(base));set('visa-rate',rate.toLocaleString('en-US')+' KGS / USD');set('visa-service',fmt(service));set('visa-total',fmt(base+service));result('visa',true)};
const calcTax=()=>{const gross=Number($('#grossSalary')?.value),pit=Number($('#pitRate')?.value),emp=Number($('#employeeRate')?.value),er=Number($('#employerRate')?.value);if(!Number.isFinite(gross)||gross<=0||[pit,emp,er].some(v=>!Number.isFinite(v)||v<0||v>100)){error('tax','Enter a salary greater than zero and valid rates from 0% to 100%.');return}error('tax','');const pitAmt=gross*pit/100,empAmt=gross*emp/100,erAmt=gross*er/100;set('tax-pit',fmt(pitAmt));set('tax-employee',fmt(empAmt));set('tax-net',fmt(gross-pitAmt-empAmt));set('tax-employer',fmt(erAmt));set('tax-cost',fmt(gross+erAmt));result('tax',true)};
const runners={protocol:calcProtocol,exit:calcExit,visa:calcVisa,tax:calcTax};

$$('[data-calc-tab]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.calcTab;$$('[data-calc-tab]').forEach(b=>{const active=b===btn;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});$$('[data-calc-panel]').forEach(p=>p.hidden=p.dataset.calcPanel!==name);$$('[data-calc-error]').forEach(e=>e.textContent='')}));
$$('[data-calc-run]').forEach(btn=>btn.addEventListener('click',()=>runners[btn.dataset.calcRun]?.()));
$$('[data-calc-reset]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.calcReset,panel=$('[data-calc-panel="'+name+'"]');if(!panel)return;$$('input',panel).forEach(i=>{if(i.type==='date')i.value='';else if(i.id==='visaRate')i.value='';else if(i.id==='visaService')i.value='0';else if(i.id==='pitRate')i.value='10';else if(i.id==='employeeRate')i.value='10';else if(i.id==='employerRate')i.value='2.25';else i.value=''});const s=$('select',panel);if(s)s.selectedIndex=0;error(name,'');result(name,false)}));
$('[data-lang]').forEach(b=>b.addEventListener('click',()=>{if(!$('[data-calc-result="protocol"]')?.hidden)calcProtocol()}));
$('[data-calc-tab]').forEach((b,i)=>{b.tabIndex=i===0?0:-1;b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=$$('[data-calc-tab]'),next=(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;tabs[next].focus();tabs[next].click()})});
})();