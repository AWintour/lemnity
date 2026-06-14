import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
// Засеваем СТАРЫЙ битый черновик (плоская форма прежнего прототипа)
await p.addInitScript(()=>{
  const stale = { 'cb-preview': { state: { projectId:'x', settings: { id:'cb-preview', widgetType:'CALLBACK', widget:{ type:'CALLBACK', title:'OLD_FLAT', timerSeconds:9, buttonText:'old' } }, initialized:true }, version:0 } };
  localStorage.setItem('widget-settings', JSON.stringify(stale));
});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
console.log('ERR:', errs.slice(0,5).join(' | ')||'none');
// должно быть корректное оформление (Логотип компании, Цветовая гамма) и заголовок-дефолт, не OLD_FLAT
const txt = await p.evaluate(()=>document.getElementById('root')?.innerText?.slice(0,90));
console.log('ROOT:', JSON.stringify(txt));
const tas = await p.$$('textarea');
let titleVal='(none)'; for (const t of tas){ const v=await t.inputValue(); if(v.includes('Оставьте')||v.includes('OLD_FLAT')||v.includes('перезвоним')){ titleVal=v; break; } }
console.log('title:', JSON.stringify(titleVal));
// edit persists?
if(tas.length){ const t=tas.find? null:null; }
await p.screenshot({ path:'fix-after.png' });
await b.close();
