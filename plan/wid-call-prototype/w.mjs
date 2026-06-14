import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|Zod schema/.test(m.text()))errs.push(m.text());});
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3500);
console.log('ERR:', errs.slice(0,8).join(' | ')||'none');
console.log('ROOT:', JSON.stringify(await p.evaluate(()=>document.getElementById('root')?.innerText?.replace(/\n+/g,' / ').slice(0,120))));
await p.screenshot({ path:'w-editor.png' });
// open floating to see full widget render
const pv = await p.$('button:has-text("Просмотр")'); if(pv){ await pv.click(); await p.waitForTimeout(900); await p.screenshot({ path:'w-floating.png' }); }
await b.close();
