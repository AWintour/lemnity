import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1200}, deviceScaleFactor:1 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3500);
// scroll the right preview panel into the call screen
await p.evaluate(()=>{ const el=[...document.querySelectorAll('.overflow-auto')].find(e=>e.scrollHeight>e.clientHeight && e.textContent.includes('Экран звонка')); if(el) el.scrollTop = el.scrollHeight; });
await p.waitForTimeout(500);
await p.screenshot({ path:'w-call2.png', clip:{ x: 880, y: 120, width: 430, height: 760 } });
await b.close(); console.log('ok');
