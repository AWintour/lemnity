import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:620,height:1050}, deviceScaleFactor:2 });
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:5173/preview/widget.html',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
const txt = await p.evaluate(()=>document.getElementById('root')?.innerText?.slice(0,80));
console.log('ROOT:', JSON.stringify(txt));
console.log('ERRORS:', errs.join(' | ')||'none');
await p.screenshot({ path:'widget-form.png' });
// fill phone
const tel = await p.$('input[type=tel]');
if (tel){ await tel.click(); await tel.type('9991234567', {delay:20}); }
await p.waitForTimeout(300);
await p.screenshot({ path:'widget-form-filled.png' });
// submit
const btn = await p.$('text=Жду звонка');
if (btn) await btn.click();
await p.waitForTimeout(800);
await p.screenshot({ path:'widget-calling.png' });
await b.close();
console.log('done');
