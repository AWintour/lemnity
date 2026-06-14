import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:900}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
console.log('ERR:', errs.slice(0,5).join(' | ')||'none');
await p.screenshot({ path:'pos-on.png', clip:{x:868,y:430,width:452,height:400} });
// toggle notification off (first switch)
const sw = await p.$$('[role=switch]'); if(sw[0]) await sw[0].click({force:true});
await p.waitForTimeout(400);
await p.screenshot({ path:'pos-off.png', clip:{x:868,y:430,width:452,height:400} });
// set position center: click the center position card (2nd of 3 in Положение кнопки открытия)
const posCards = await p.$$('button.relative.h-15');
console.log('pos cards:', posCards.length);
if(posCards[1]) await posCards[1].click({force:true});
await p.waitForTimeout(400);
await p.screenshot({ path:'pos-center.png', clip:{x:868,y:430,width:452,height:400} });
await b.close(); console.log('ok');
