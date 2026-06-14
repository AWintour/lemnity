import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1100}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3500);
// crop right 450px panel
await p.screenshot({ path:'w-panel.png', clip:{ x: 870, y: 0, width: 450, height: 1100 } });
await b.close(); console.log('ok');
