const toggle=document.querySelector('.menu'),nav=document.querySelector('.sidebar');
const closeMenu=()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='目录';};
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'关闭':'目录';});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))closeMenu();});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
if('IntersectionObserver' in window){const links=[...document.querySelectorAll('.chapter-toc a')];const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)links.forEach(a=>a.classList.toggle('current',a.hash==='#'+e.target.id));},{rootMargin:'-5% 0px -80% 0px'});document.querySelectorAll('article h2').forEach(h=>observer.observe(h));}
let printClosed=[];
window.addEventListener('beforeprint',()=>{printClosed=[...document.querySelectorAll('details:not([open])')];printClosed.forEach(d=>{d.open=true;});});
window.addEventListener('afterprint',()=>{printClosed.forEach(d=>{d.open=false;});printClosed=[];});
