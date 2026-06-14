import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'networkidle'});
await p.waitForTimeout(2500);
console.log('ROOT:', JSON.stringify(await p.evaluate(()=>document.getElementById('root')?.innerText?.slice(0,50))));
console.log('ERRORS:', errs.slice(0,8).join(' | ')||'none');
await p.screenshot({ path:'vw-editor.png' });
// open floating preview
const pv = await p.$('button:has-text("Предпросмотр")');
if (pv){ await pv.click(); await p.waitForTimeout(800); await p.screenshot({ path:'vw-floating.png' }); }
await b.close(); console.log('done');
