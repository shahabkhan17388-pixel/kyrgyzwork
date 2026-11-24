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
 en:{bad:'Please select a valid visa expiry date.',badPlan:'Please select a valid planned exit date.',valid:'Your planned exit is within the permitted stay.',last:'Your planned exit is on the last permitted day.',left:n=>n+' day(s) remaining before the visa expiry date.',over:'Your planned exit is after the visa expiry date.',days:n=>n+' day(s) overdue',none:'No overstay fine is estimated for this planned date.',fine:'Estimated fine if you exit on the selected date',brackets:['Up to 1 month','More than 1 month to 3 months','More than 3 months to 6 months','More than 6 months to 12 months','More than 12 months'],wa:(e,p,d,f)=>'Hello KYRGYZ WORK. Please review my overstay estimate. Visa expiry: '+e+'. Planned exit: '+p+'. Days overdue: '+d+'. Indicative fine: '+f+'. Please explain the official process and confirmed charges.'},
 ur:{bad:'براہِ کرم ویزا ختم ہونے کی درست تاریخ منتخب کریں۔',badPlan:'براہِ کرم روانگی کی درست تاریخ منتخب کریں۔',valid:'آپ کی متوقع روانگی اجازت شدہ مدت کے اندر ہے۔',last:'آپ کی روانگی آخری مجاز دن پر ہے۔',left:n=>'ویزا ختم ہونے میں '+n+' دن باقی ہیں۔',over:'آپ کی متوقع روانگی ویزا ختم ہونے کے بعد ہے۔',days:n=>n+' دن زائد قیام',none:'منتخب تاریخ کے لیے زائد قیام کا جرمانہ نہیں بنتا۔',fine:'منتخب تاریخ پر روانگی کی صورت میں تخمینی جرمانہ',brackets:['ایک ماہ تک','ایک سے تین ماہ سے زائد','تین سے چھ ماہ سے زائد','چھ سے بارہ ماہ سے زائد','بارہ ماہ سے زیادہ'],wa:(e,p,d,f)=>'السلام علیکم KYRGYZ WORK۔ میرے زائد قیام کے تخمینے کا جائزہ لیں۔ ویزا ختم: '+e+'۔ متوقع روانگی: '+p+'۔ زائد دن: '+d+'۔ تخمینی جرمانہ: '+f+'۔ براہ کرم سرکاری طریقہ اور تصدیق شدہ اخراجات بتائیں۔'},
 ru:{bad:'Укажите корректную дату окончания визы.',badPlan:'Укажите корректную планируемую дату выезда.',valid:'Планируемый выезд находится в пределах разрешённого срока.',last:'Планируемый выезд приходится на последний разрешённый день.',left:n=>'До окончания визы осталось '+n+' дн.',over:'Планируемый выезд позже даты окончания визы.',days:n=>'Просрочка: '+n+' дн.',none:'Для выбранной даты штраф за просрочку не рассчитывается.',fine:'Ориентировочный штраф при выезде в выбранную дату',brackets:['До 1 месяца','Свыше 1 до 3 месяцев','Свыше 3 до 6 месяцев','Свыше 6 до 12 месяцев','Более 12 месяцев'],wa:(e,p,d,f)=>'Здравствуйте, KYRGYZ WORK. Проверьте мой расчёт просрочки. Окончание визы: '+e+'. Планируемый выезд: '+p+'. Дней просрочки: '+d+'. Ориентировочный штраф: '+f+'. Прошу объяснить официальный порядок и подтверждённые платежи.'}
};
const protocolError=(key)=>{const c=copy[language()];error('protocol',c[key]);result('protocol',false)};
const calcProtocol=()=>{
 const c=copy[language()],expiryDate=parseDate($('#protocolExpiry')?.value||''),planDate=parseDate($('#protocolPlan')?.value||'');
 if(!expiryDate){protocolError('bad');$('#protocolExpiry')?.focus();return}
 if(!planDate){protocolError('badPlan');$('#protocolPlan')?.focus();return}
 error('protocol','');
 const overdue=Math.max(0,Math.floor((planDate-expiryDate)/day));
 const remaining=Math.max(0,Math.floor((expiryDate-planDate)/day));
 let fine=0,bracket='—',status='';
 if(overdue===0){
   status=remaining===0?c.last:c.valid+' '+c.left(remaining);
   set('protocol-days',remaining===0?c.last:c.left(remaining));
   set('protocol-duration','—');
   set('protocol-total',c.none);
 }else{
   if(planDate<=addMonths(expiryDate,1)){fine=5500;bracket=c.brackets[0]}
   else if(planDate<=addMonths(expiryDate,3)){fine=10000;bracket=c.brackets[1]}
   else if(planDate<=addMonths(expiryDate,6)){fine=15000;bracket=c.brackets[2]}
   else if(planDate<=addMonths(expiryDate,12)){fine=17500;bracket=c.brackets[3]}
   else{fine=20000;bracket=c.brackets[4]}
   status=c.over+' '+c.days(overdue);
   set('protocol-days',c.days(overdue));
   set('protocol-duration',duration(expiryDate,planDate));
   set('protocol-total',fmt(fine));
 }
 set('protocol-status',status);
 const statusEl=$('[data-out="protocol-status"]');if(statusEl)statusEl.dataset.state=overdue?'over':'ok';
 set('protocol-expiry',$('#protocolExpiry').value);
 set('protocol-plan',$('#protocolPlan').value);
 set('protocol-bracket',bracket);
 const link=$('[data-out="protocol-wa"]');
 if(link){const message=c.wa($('#protocolExpiry').value,$('#protocolPlan').value,overdue,overdue?fmt(fine):c.none);link.href='https://wa.me/996555746401?text='+encodeURIComponent(message)}
 result('protocol',true);
};
const expiry=name=>{const input=$('#'+(name==='protocol'?'protocolExpiry':'exitExpiry'));const a=parseDate(input?.value||''),b=today();if(!a){error(name,'Please select a valid visa expiry date.');input?.focus();return null}if(a>=b){error(name,'The expiry date must be earlier than today.');input?.focus();return null}error(name,'');return{a,b,days:Math.floor((b-a)/day)}};
const calcExit=()=>{const x=expiry('exit');if(!x)return;const {a,b,days}=x;let fee,feeUsd,bracket;if(b<=addMonths(a,3)){fee=17500;feeUsd=200;bracket='Up to 3 months'}else if(b<=addMonths(a,12)){fee=96250;feeUsd=1100;bracket='3 months to 1 year'}else if(b<=addMonths(a,24)){fee=192500;feeUsd=2200;bracket='1 to 2 years'}else{let extra=0;while(b>addMonths(a,24+12*extra))extra++;fee=192500+96250*extra;feeUsd=2200+1100*extra;bracket='Over 2 years · '+(2+extra-1)+'+ years'}set('exit-duration',duration(a,b));set('exit-days',days.toLocaleString('en-US')+' days');set('exit-bracket',bracket);set('exit-usd',usd(feeUsd));set('exit-kgs',fmt(fee));result('exit',true)};
const calcVisa=()=>{const amount=Number($('#visaUsd')?.value),rate=Number($('#visaRate')?.value),service=Number($('#visaService')?.value);if(!Number.isFinite(amount)||amount<0||!Number.isFinite(rate)||rate<=0||!Number.isFinite(service)||service<0){error('visa','Enter a valid government amount, positive exchange rate and non-negative additional charge.');return}error('visa','');const base=amount*rate;set('visa-type',$('#visaType').value);set('visa-gov',usd(amount)+' · '+fmt(base));set('visa-rate',rate.toLocaleString('en-US')+' KGS / USD');set('visa-service',fmt(service));set('visa-total',fmt(base+service));result('visa',true)};
const calcTax=()=>{const gross=Number($('#grossSalary')?.value),pit=Number($('#pitRate')?.value),emp=Number($('#employeeRate')?.value),er=Number($('#employerRate')?.value);if(!Number.isFinite(gross)||gross<=0||[pit,emp,er].some(v=>!Number.isFinite(v)||v<0||v>100)){error('tax','Enter a salary greater than zero and valid rates from 0% to 100%.');return}error('tax','');const pitAmt=gross*pit/100,empAmt=gross*emp/100,erAmt=gross*er/100;set('tax-pit',fmt(pitAmt));set('tax-employee',fmt(empAmt));set('tax-net',fmt(gross-pitAmt-empAmt));set('tax-employer',fmt(erAmt));set('tax-cost',fmt(gross+erAmt));result('tax',true)};
const runners={protocol:calcProtocol,exit:calcExit,visa:calcVisa,tax:calcTax};
const plan=$('#protocolPlan');if(plan)plan.value=dateValue(today());
$$('[data-calc-tab]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.calcTab;$$('[data-calc-tab]').forEach(b=>{const active=b===btn;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});$$('[data-calc-panel]').forEach(p=>p.hidden=p.dataset.calcPanel!==name);$$('[data-calc-error]').forEach(e=>e.textContent='')}));
$$('[data-calc-run]').forEach(btn=>btn.addEventListener('click',()=>runners[btn.dataset.calcRun]?.()));
$$('[data-calc-reset]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.calcReset,panel=$('[data-calc-panel="'+name+'"]');if(!panel)return;$$('input',panel).forEach(i=>{if(i.type==='date')i.value=i.id==='protocolPlan'?dateValue(today()):'';else if(i.id==='visaRate')i.value='';else if(i.id==='visaService')i.value='0';else if(i.id==='pitRate')i.value='10';else if(i.id==='employeeRate')i.value='10';else if(i.id==='employerRate')i.value='2.25';else i.value=''});const s=$('select',panel);if(s)s.selectedIndex=0;error(name,'');result(name,false)}));
$$('[data-calc-tab]').forEach((b,i)=>{b.tabIndex=i===0?0:-1;b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=$$('[data-calc-tab]'),next=(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;tabs[next].focus();tabs[next].click()})});
})();