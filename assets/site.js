(()=>{
'use strict';
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const PHONE='996555746401';
const labels={
 en:{duration:'Overstay period',days:'Days overdue',day:'days',protocol:'Estimated protocol fine',exit:'Estimated exit-visa fee',total:'Estimated total',back:'Back · Change date',apply:'Apply through KYRGYZ WORK on WhatsApp',date:'Please select your visa expiry date.',invalid:'The expiry date must be earlier than today.'},
 ur:{duration:'مدتِ زائد قیام',days:'تاخیر کے دن',day:'دن',protocol:'تخمینی پروٹوکول جرمانہ',exit:'ایگزٹ ویزا کی تخمینی فیس',total:'کل تخمینی رقم',back:'واپس جائیں · تاریخ تبدیل کریں',apply:'ایگزٹ ویزا کے لیے واٹس ایپ پر درخواست دیں',date:'براہِ کرم ویزا ختم ہونے کی تاریخ منتخب کریں۔',invalid:'ویزا ختم ہونے کی تاریخ آج سے پہلے ہونی چاہیے۔'},
 ru:{duration:'Период просрочки',days:'Дней просрочки',day:'дней',protocol:'Оценка штрафа',exit:'Оценка стоимости выездной визы',total:'Общая оценка',back:'Назад · Изменить дату',apply:'Подать заявку через WhatsApp',date:'Выберите дату окончания визы.',invalid:'Дата окончания визы должна быть раньше сегодняшнего дня.'}
};
function getLang(){try{return localStorage.getItem('kw-language')||'ur'}catch(e){return 'ur'}}
function setLang(lang){if(!labels[lang])lang='ur';try{localStorage.setItem('kw-language',lang)}catch(e){};document.documentElement.lang=lang;document.documentElement.dir=lang==='ur'?'rtl':'ltr';document.body.dir=lang==='ur'?'rtl':'ltr';qsa('[data-lang]').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang))});qsa('[data-locale]').forEach(el=>{el.hidden=el.dataset.locale!==lang});qsa('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(labels[lang][k])el.textContent=labels[lang][k]});}
qsa('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));setLang(getLang());
const menu=qs('.menu');if(menu){menu.setAttribute('aria-expanded','false');menu.addEventListener('click',()=>{const nav=qs('.navlinks');if(!nav)return;const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});qsa('.navlinks a').forEach(a=>a.addEventListener('click',()=>{qs('.navlinks')?.classList.remove('open');menu.setAttribute('aria-expanded','false')}));}
qsa('[data-wa]').forEach(b=>b.addEventListener('click',()=>{location.href='https://wa.me/'+PHONE+'?text='+encodeURIComponent(b.dataset.wa||'Hello KYRGYZ WORK')}));
qsa('[data-whatsapp-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form),lines=[form.dataset.title||'KYRGYZ WORK enquiry'];for(const [k,v] of data.entries()){const value=String(v).trim();if(value)lines.push(k+': '+value)}const url='https://wa.me/'+PHONE+'?text='+encodeURIComponent(lines.join('\n'));window.location.assign(url)}));
const calc=qs('#visaCalc');if(calc){
 const date=qs('#expiryDate',calc),err=qs('#calcError',calc),card=qs('#calcCard',calc),front=qs('#calcFront',calc),out=qs('#calcOutput',calc),back=qs('#backCalc',calc),wa=qs('#applyExit',calc);
 const today=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())};
 const addM=(d,m)=>{const first=new Date(d.getFullYear(),d.getMonth()+m,1);return new Date(first.getFullYear(),first.getMonth(),Math.min(d.getDate(),new Date(first.getFullYear(),first.getMonth()+1,0).getDate()))};
 const months=(a,b)=>Math.max(0,(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth()-(b.getDate()<a.getDate()?1:0));
 const formatDur=(a,b,lang)=>{let m=months(a,b),anchor=addM(a,m),days=Math.max(0,Math.round((b-anchor)/86400000)),y=Math.floor(m/12),rm=m%12,parts=[];if(lang==='ur'){if(y)parts.push(y+' سال');if(rm)parts.push(rm+' ماہ');if(days)parts.push(days+' دن');return parts.join('، ')||'ایک ماہ سے کم'}if(lang==='ru'){if(y)parts.push(y+' г.');if(rm)parts.push(rm+' мес.');if(days)parts.push(days+' дн.');return parts.join(' ')||'Менее месяца'}if(y)parts.push(y+' year'+(y===1?'':'s'));if(rm)parts.push(rm+' month'+(rm===1?'':'s'));if(days)parts.push(days+' day'+(days===1?'':'s'));return parts.join(', ')||'Less than one month'};
 const fine=(a,b)=>{if(b<=addM(a,1))return 5500;if(b<=addM(a,3))return 10000;if(b<=addM(a,6))return 15000;if(b<=addM(a,12))return 17500;return 20000};
 const exit=(a,b)=>{if(b<=addM(a,3))return {usd:200,kgs:17500};if(b<=addM(a,12))return {usd:1100,kgs:96250};if(b<=addM(a,24))return {usd:2200,kgs:192500};let extra=1;while(b>addM(a,24+12*extra))extra++;return {usd:2200+1100*extra,kgs:192500+96250*extra}};
 const money=n=>Number(n).toLocaleString('en-US');
 const parse=()=>{const lang=getLang();if(!date?.value){err.textContent=labels[lang].date;return null}const [y,m,d]=date.value.split('-').map(Number),a=new Date(y,m-1,d),b=today();if(Number.isNaN(a.getTime())||a>=b){err.textContent=labels[lang].invalid;return null}err.textContent='';return {a,b,days:Math.floor((b-a)/86400000)}};
 const show=mode=>{const x=parse();if(!x)return;const lang=getLang(),w=labels[lang],f=fine(x.a,x.b),duration=formatDur(x.a,x.b,lang);const title=qs('#calcTitle',calc),summary=qs('#calcSummary',calc),amount=qs('#mainAmount',calc),protocol=qs('#protocolAmount',calc),fee=qs('#exitAmount',calc),total=qs('#totalAmount',calc),feeBox=qs('#exitAmountBox',calc),totalBox=qs('#totalAmountBox',calc),mainLabel=qs('#mainAmountLabel',calc);
 title.textContent=mode==='exit'?w.exit:w.protocol;summary.textContent=duration+' · '+money(x.days)+' '+w.day;qs('#durationOut',calc).textContent=duration;qs('#daysOut',calc).textContent=money(x.days)+' '+w.day;if(mainLabel)mainLabel.textContent=w.protocol;amount.textContent=money(f)+' KGS';
 if(protocol)protocol.textContent=money(f)+' KGS';
 if(mode==='protocol'){if(protocol)protocol.hidden=true;feeBox.hidden=true;totalBox.hidden=true;wa.hidden=true}
 else{const ex=exit(x.a,x.b);if(protocol)protocol.hidden=true;feeBox.hidden=false;fee.textContent='$'+money(ex.usd)+' · '+money(ex.kgs)+' KGS';totalBox.hidden=false;total.textContent=money(f+ex.kgs)+' KGS';wa.hidden=false;wa.href='https://wa.me/'+PHONE+'?text='+encodeURIComponent('Hello KYRGYZ WORK. I want to apply through KYRGYZ WORK for exit-visa assistance. My visa expiry date is '+date.value+'. Please contact me with the next steps and required documents.');}
 front.hidden=true;out.hidden=false;card.classList.add('show-result');out.scrollIntoView({behavior:'smooth',block:'start'});
 };
 qs('#protocolBtn',calc)?.addEventListener('click',()=>show('protocol'));qs('#exitBtn',calc)?.addEventListener('click',()=>show('exit'));
 back?.addEventListener('click',()=>{card.classList.remove('show-result');out.hidden=true;front.hidden=false;err.textContent='';front.scrollIntoView({behavior:'smooth',block:'start'})});date?.addEventListener('change',()=>{err.textContent=''});
}
})();
