import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1000,height:900}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
// scroll to the "Заголовок" h3 directly
await p.evaluate(()=>{ const el=[...document.querySelectorAll('h3')].find(h=>h.textContent.trim()==='Заголовок'); el?.scrollIntoView({block:'center'}); });
await p.waitForTimeout(400);
await p.screenshot({ path:'ti-title2.png', clip:{x:0,y:0,width:520,height:520} });
await b.close(); console.log('ok');
