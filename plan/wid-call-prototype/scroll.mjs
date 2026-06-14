import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:760,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
// scroll the LEFT settings column
const col = await p.$('.overflow-y-auto');
async function shot(name){ await p.screenshot({path:name}); }
// scroll inside the settings scroller
const scroller = await p.$('div.overflow-auto');
for (let i=0;i<5;i++){
  await p.evaluate(()=>{ const el=document.querySelector('div.overflow-auto'); if(el) el.scrollTop += 900; });
  await p.waitForTimeout(400);
}
await p.screenshot({ path:'plan-bottom.png' });
await b.close();
