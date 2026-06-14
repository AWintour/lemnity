import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1120,height:760}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
console.log('ERR:', errs.slice(0,5).join(' | ')||'none');
// scroll to Уведомление
await p.evaluate(()=>{ const el=[...document.querySelectorAll('span,div')].find(e=>e.textContent==='Уведомление'); el?.scrollIntoView({block:'start'}); });
await p.waitForTimeout(300);
await p.screenshot({ path:'notif.png', clip:{x:0,y:0,width:560,height:240} });
await b.close(); console.log('ok');
