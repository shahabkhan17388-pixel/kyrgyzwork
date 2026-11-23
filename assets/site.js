(()=>{
'use strict';
const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const PHONE='996555746401';
const labels={
 en:{duration:'Overstay period',days:'Days overdue',day:'days',protocol:'Estimated protocol fine',exit:'Estimated exit-visa fee',total:'Estimated total',date:'Please select your visa expiry date.',invalid:'The expiry date must be earlier than today.',apply:'Apply through KYRGYZ WORK on WhatsApp'},
 ur:{duration:'مدتِ زائد قیام',days:'تاخیر کے دن',day:'دن',protocol:'تخمینی پروٹوکول جرمانہ',exit:'ایگزٹ ویزا کی تخمینی فیس',total:'کل تخمینی رقم',date:'براہِ کرم ویزا ختم ہونے کی تاریخ منتخب کریں۔',invalid:'ویزا ختم ہونے کی تاریخ آج سے پہلے ہونی چاہیے۔',apply:'ایگزٹ ویزا کے لیے واٹس ایپ پر درخواست دیں'},
 ru:{duration:'Период просрочки',days:'Дней просрочки',day:'дней',protocol:'Оценка штрафа',exit:'Оценка стоимости выездной визы',total:'Общая оценка',date:'Выберите дату окончания визы.',invalid:'Дата окончания визы должна быть раньше сегодняшнего дня.',apply:'Подать заявку через WhatsApp'}
};
function getLang(){try{return localStorage.getItem('kw-language')||'en'}catch(e){return 'en'}}
function setLang(lang){if(!labels[lang])lang='en';try{localStorage.setItem('kw-language',lang)}catch(e){}document.documentElement.lang=lang;document.documentElement.dir=lang==='ur'?'rtl':'ltr';document.body.dir=lang==='ur'?'rtl':'ltr';qsa('[data-lang]').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang))});qsa('[data-locale]').forEach(el=>{el.hidden=el.dataset.locale!==lang});}
qsa('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));setLang(getLang());
const menu=qs('.menu');if(menu){
 const nav=qs('.navlinks');
 if(nav&&!nav.id)nav.id='primary-navigation';
 if(nav)menu.setAttribute('aria-controls',nav.id);
 menu.setAttribute('aria-expanded','false');
 const closeMenu=()=>{nav?.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu')};
 menu.addEventListener('click',()=>{if(!nav)return;const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
 qsa('.navlinks a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
}
qsa('[data-wa]').forEach(b=>b.addEventListener('click',()=>{location.href='https://wa.me/'+PHONE+'?text='+encodeURIComponent(b.dataset.wa||'Hello KYRGYZ WORK')}));
qsa('[data-whatsapp-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form),lines=[form.dataset.title||'KYRGYZ WORK enquiry'];for(const [k,v] of data.entries()){const value=String(v).trim();if(value)lines.push(k+': '+value)}location.href='https://wa.me/'+PHONE+'?text='+encodeURIComponent(lines.join('\n'))}));
const calc=qs('#visaCalc');
if(calc){
 const date=qs('#expiryDate',calc),err=qs('#calcError',calc),front=qs('#calcFront',calc),out=qs('#calcOutput',calc),back=qs('#backCalc',calc),wa=qs('#applyExit',calc);
 const utc=(y,m,d)=>new Date(Date.UTC(y,m,d));
 const fromInput=s=>{const p=s.split('-').map(Number);return p.length===3?utc(p[0],p[1]-1,p[2]):null};
 const today=()=>{const n=new Date();return utc(n.getFullYear(),n.getMonth(),n.getDate())};
 const addMonths=(d,n)=>{const y=d.getUTCFullYear(),m=d.getUTCMonth()+n,day=d.getUTCDate(),first=utc(y,m,1);return utc(first.getUTCFullYear(),first.getUTCMonth(),Math.min(day,utc(first.getUTCFullYear(),first.getUTCMonth()+1,0).getUTCDate()))};
 const wholeMonths=(a,b)=>Math.max(0,(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth()-(b.getUTCDate()<a.getUTCDate()?1:0));
 const duration=(a,b,lang)=>{const m=wholeMonths(a,b),anchor=addMonths(a,m),days=Math.max(0,Math.round((b-anchor)/86400000)),y=Math.floor(m/12),rm=m%12,parts=[];if(lang==='ur'){if(y)parts.push(y+' سال');if(rm)parts.push(rm+' ماہ');if(days)parts.push(days+' دن');return parts.join('، ')||'ایک ماہ سے کم'}if(lang==='ru'){if(y)parts.push(y+' г.');if(rm)parts.push(rm+' мес.');if(days)parts.push(days+' дн.');return parts.join(' ')||'Менее месяца'}if(y)parts.push(y+' year'+(y===1?'':'s'));if(rm)parts.push(rm+' month'+(rm===1?'':'s'));if(days)parts.push(days+' day'+(days===1?'':'s'));return parts.join(', ')||'Less than one month'};
 // Existing configured estimate brackets retained; confirm current official tariffs before payment.
 const protocolFine=(a,b)=>b<=addMonths(a,1)?5500:b<=addMonths(a,3)?10000:b<=addMonths(a,6)?15000:b<=addMonths(a,12)?17500:20000;
 const exitFee=(a,b)=>{if(b<=addMonths(a,3))return{usd:200,kgs:17500};if(b<=addMonths(a,12))return{usd:1100,kgs:96250};if(b<=addMonths(a,24))return{usd:2200,kgs:192500};const extra=Math.ceil(((b-addMonths(a,24))/86400000)/(365.2425));return{usd:2200+1100*extra,kgs:192500+96250*extra}};
 const money=n=>Math.round(n).toLocaleString('en-US');
 const parse=()=>{const lang=getLang();if(!date.value){err.textContent=labels[lang].date;date.focus();return null}const a=fromInput(date.value),b=today();if(!a||!Number.isFinite(a.getTime())||a>=b){err.textContent=labels[lang].invalid;return null}err.textContent='';return{a,b,days:Math.floor((b-a)/86400000)}};
 const show=mode=>{const x=parse();if(!x)return;const lang=getLang(),w=labels[lang],fine=protocolFine(x.a,x.b),ex=exitFee(x.a,x.b),days=money(x.days);
 qs('#calcTitle',calc).textContent=mode==='exit'?w.exit:w.protocol;
 qs('#calcSummary',calc).textContent=duration(x.a,x.b,lang)+' · '+days+' '+w.day;
 qs('#durationOut',calc).textContent=duration(x.a,x.b,lang);
 qs('#daysOut',calc).textContent=days+' '+w.day;
 qs('#mainAmountLabel',calc).textContent=w.protocol;
 qs('#mainAmount',calc).textContent=money(fine)+' KGS';
 const feeBox=qs('#exitAmountBox',calc),totalBox=qs('#totalAmountBox',calc);
 feeBox.hidden=mode!=='exit';totalBox.hidden=mode!=='exit';
 if(mode==='exit'){qs('#exitAmount',calc).textContent='$'+money(ex.usd)+' · '+money(ex.kgs)+' KGS';qs('#totalAmount',calc).textContent=money(fine+ex.kgs)+' KGS';wa.hidden=false;wa.href='https://wa.me/'+PHONE+'?text='+encodeURIComponent('Hello KYRGYZ WORK. I need exit-visa assistance. Visa expiry date: '+date.value+'. Please advise the next steps and required documents.')}
 else{wa.hidden=true}
 front.hidden=true;out.hidden=false;calc.classList.add('show-result');out.scrollIntoView({behavior:'smooth',block:'start'});
 };
 qs('#protocolBtn',calc)?.addEventListener('click',()=>show('protocol'));
 qs('#exitBtn',calc)?.addEventListener('click',()=>show('exit'));
 back?.addEventListener('click',()=>{calc.classList.remove('show-result');out.hidden=true;front.hidden=false;err.textContent='';front.scrollIntoView({behavior:'smooth',block:'start'})});
 date?.addEventListener('change',()=>{err.textContent=''});
}
})();