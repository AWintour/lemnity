import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:900}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
// toggle Уведомление off — switch inside the С("Уведомление") SwitchableField
// find the switch in the Уведомление block (role=switch near "Уведомление")
const sw = await p.$$('[role=switch]');
console.log('switches:', sw.length);
// The Уведомление toggle is the 1st switch (launcher notif). Click it off.
if(sw[0]) await sw[0].click({force:true});
await p.waitForTimeout(500);
console.log('bubble present:', await p.getByText('Перезвоню через 30 секунд').count());
await p.screenshot({ path:'notif-off.png', clip:{x:868,y:300,width:452,height:520} });
await b.close(); console.log('ok');
