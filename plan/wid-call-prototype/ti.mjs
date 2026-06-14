import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1000,height:1100}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3200);
console.log('ERR:', errs.slice(0,5).join(' | ')||'none');
console.log('Описание count:', await p.getByText('Описание', {exact:true}).count());
console.log('Заголовок count:', await p.getByText('Заголовок', {exact:true}).count());
// scroll left settings to show Окно информации / Заголовок
await p.evaluate(()=>{ const el=document.querySelector('div.overflow-auto'); if(el) el.scrollTop = 420; });
await p.waitForTimeout(400);
await p.screenshot({ path:'ti-editor.png', clip:{x:0,y:0,width:520,height:1100} });
await b.close(); console.log('ok');
