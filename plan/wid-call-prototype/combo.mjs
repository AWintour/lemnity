import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1260,height:1000}, deviceScaleFactor:2 });
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'networkidle'});
await p.waitForTimeout(2500);
const txt = await p.evaluate(()=>document.getElementById('root')?.innerText?.slice(0,60));
console.log('ROOT:', JSON.stringify(txt));
console.log('ERRORS:', errs.slice(0,10).join(' | ')||'none');
await p.screenshot({ path:'combo-top.png' });
// test interactivity: click the gold CTA in preview to go to call screen
const cta = await p.$('div.sticky button:has-text("Жду звонка")');
if (cta){ await cta.click(); await p.waitForTimeout(900); await p.screenshot({ path:'combo-calling.png' }); }
await b.close(); console.log('done');
