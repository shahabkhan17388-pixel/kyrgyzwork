(()=>{'use strict';
const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const params=new URLSearchParams(location.search);
function setLang(lang){if(!['en','ur','ru'].includes(lang))lang='en';try{localStorage.setItem('kw_lang',lang)}catch(e){}
document.documentElement.lang=lang==='ru'?'ru':'en';
qsa('[data-lang]').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang))});
qsa('[data-locale]').forEach(el=>{el.hidden=el.dataset.locale!==lang});

}
let saved='en';try{saved=localStorage.getItem('kw_lang')||'en'}catch(e){}setLang(saved);
qsa('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
const menu=qs('.menu'),nav=qs('.navlinks');if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});qsa('.navlinks a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}))}
const search=qs('#kwBlogSearch'),grid=qs('#kwBlogGrid'),empty=qs('#kwBlogEmpty'),suggest=qs('#kwBlogSuggestions'),cards=grid?qsa('.kw-guide-card',grid):[],filters=qsa('[data-filter]');let active='all';
const suggestions=['work visa','jobs in Kyrgyzstan','Pakistani workers','foreign worker quota','single permit','registration after arrival','overstay fine','exit visa','employment contract','salary and working hours','recruitment scams','employer checklist'];
function apply(){if(!search||!grid)return;const q=search.value.trim().toLowerCase();let n=0;cards.forEach(card=>{const category=card.dataset.category||'all';const matchCategory=active==='all'||category.split(/\s+/).includes(active);const matchText=!q||(card.textContent+' '+(card.dataset.search||'')).toLowerCase().includes(q);card.hidden=!(matchCategory&&matchText);if(!card.hidden)n++});if(empty)empty.style.display=n?'none':'block'}
function showSuggestions(){if(!search||!suggest)return;const q=search.value.trim().toLowerCase();const hits=(q?suggestions.filter(x=>x.includes(q)||q.split(/\s+/).some(t=>t.length>2&&x.includes(t))):suggestions.slice(0,6)).slice(0,6);suggest.innerHTML='';if(!hits.length||document.activeElement!==search){suggest.hidden=true;return}hits.forEach(value=>{const b=document.createElement('button');b.type='button';b.className='kw-suggestion';b.textContent=value;b.addEventListener('click',()=>{search.value=value;suggest.hidden=true;apply();search.focus()});suggest.appendChild(b)});suggest.hidden=false}
if(search){search.addEventListener('input',()=>{apply();showSuggestions()});search.addEventListener('focus',showSuggestions);search.addEventListener('keydown',e=>{if(e.key==='Escape'&&suggest)suggest.hidden=true;if(e.key==='Enter'&&suggest&&!suggest.hidden){const first=qs('button',suggest);if(first){e.preventDefault();first.click()}}});document.addEventListener('click',e=>{if(suggest&&!e.target.closest('.kw-search-wrap'))suggest.hidden=true})}
filters.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;filters.forEach(x=>x.classList.toggle('active',x===b));apply()}));
if(search&&params.get('q'))search.value=params.get('q');apply();
})();