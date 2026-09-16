import fs from 'node:fs';
import path from 'node:path';
const {marked}=await import(process.env.MARKED_MODULE||'marked');
marked.setOptions({gfm:true,breaks:false});
const books=[{file:'index',short:'01',title:'绪论',desc:'生命科学中的化学测量与证据'},{file:'chapter2',short:'02',title:'有效数字与测量结果',desc:'从原始读数到可靠表达'},{file:'extension',short:'拓展',title:'化学计量学与 AI',desc:'从单个数字到多变量模型'},{file:'references',short:'文献',title:'参考文献与阅读指南',desc:'书籍、原始研究与计量规范'}];
fs.mkdirSync('docs',{recursive:true});fs.copyFileSync('assets/style.css','docs/style.css');fs.copyFileSync('assets/book.js','docs/book.js');fs.writeFileSync('docs/.nojekyll','');
for(const [index,book]of books.entries()){
 const source=fs.readFileSync(`manuscript/${book.file}.md`,'utf8');
 // Convert citation links before Markdown so they also work inside example HTML.
 const linked=source.replace(/\[([ABHM]\d+)\]\(references\.html#([ABHM]\d+)\)/g,(_,label,id)=>`<a class="citation" href="references.html#${id}" aria-label="参考文献 ${label}">[${label}]</a>`);
 let html=marked.parse(linked);let serial=0;
 html=html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g,(_,level,title)=>`<h${level} id="s${++serial}">${title}</h${level}>`);
 const toc=[...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(m=>({id:m[1],text:m[2].replace(/<[^>]*>/g,'')}));
 const nav=books.map(b=>`<a class="chapter ${b.file===book.file?'active':''}" href="${b.file}.html" ${b.file===book.file?'aria-current="page"':''}><span>${b.short}</span><strong>${b.title}</strong></a>${b.file===book.file?`<nav class="chapter-toc" aria-label="章节目录">${toc.map(h=>`<a href="#${h.id}">${h.text}</a>`).join('')}</nav>`:''}`).join('');
 const prev=books[index-1],next=books[index+1];
 const result=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${book.title}｜分析化学 B 线上教材</title><meta name="description" content="生命科学学院分析化学 B 教材：${book.desc}。含完整讲解、例题、分析史、生物学拓展与引文。"><link rel="stylesheet" href="style.css"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231b4036'/%3E%3Ctext x='16' y='24' font-family='Arial' font-size='24' text-anchor='middle' fill='white'%3EB%3C/text%3E%3C/svg%3E"></head><body><a class="skip" href="#content">跳到正文</a><button class="menu" aria-label="打开教材目录" aria-expanded="false" aria-controls="book-nav">目录</button><aside id="book-nav" class="sidebar"><a class="brand" href="index.html"><span class="letter">B</span><span>分析化学<small>生命科学学院 · 线上教材</small></span></a><p class="edition">第一卷 · 绪论与有效数字</p><nav aria-label="教材目录">${nav}</nav><p class="side-footer"><a href="https://github.com/Oaham725/analytical-chemistry-b-textbook" target="_blank" rel="noopener">教材源文件 ↗</a><br><a href="https://oaham725.github.io/intelligent-analytical-chemistry/" target="_blank" rel="noopener">智能分析化学 ↗</a></p></aside><div class="page"><header class="topbar"><span>分析化学（含仪器分析）B</span><a href="references.html">阅读与引文</a></header><main id="content" tabindex="-1"><div class="chapter-label">${book.short==='01'?'第一章':book.short==='02'?'第二章':book.short} · ${book.desc}</div><article>${html}</article><nav class="pagination" aria-label="前后章节">${prev?`<a href="${prev.file}.html">← ${prev.title}</a>`:'<span></span>'}${next?`<a href="${next.file}.html">${next.title} →</a>`:''}</nav><footer>马昊 · 生命科学学院分析化学 B<br>教学编写版 · 2026 年 9 月 · 数值示例若未另注，均为自编教学数据。</footer></main></div><script src="book.js" defer></script></body></html>`;
 fs.writeFileSync(`docs/${book.file}.html`,result);
 console.log(`${book.file}: ${source.length} characters, ${toc.length} sections`);
}
