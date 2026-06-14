import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1000,height:900}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Zod schema|ERR_FAILED|Failed to load/.test(m.text()))errs.push(m.text());});
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3200);
console.log('ERR:', errs.slice(0,8).join(' | ')||'none');
// scroll to Цветовая гамма
await p.evaluate(()=>{ const el=[...document.querySelectorAll('h2')].find(h=>h.textContent==='Цветовая гамма'); el?.scrollIntoView({block:'start'}); });
await p.waitForTimeout(400);
await p.screenshot({ path:'gamma-primary.png', clip:{x:0,y:60,width:520,height:360} });
// switch to Пользовательское
await p.getByText('Пользовательское').first().click({force:true});
await p.waitForTimeout(400);
await p.screenshot({ path:'gamma-custom.png', clip:{x:0,y:60,width:520,height:360} });
await b.close(); console.log('ok');
