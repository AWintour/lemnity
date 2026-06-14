import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
const errs=[]; p.on('pageerror',e=>errs.push('PE: '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.type()+': '+m.text().slice(0,200));});
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3500);
console.log('ROOT len:', (await p.evaluate(()=>document.getElementById('root')?.innerText?.length)) ?? 'null');
console.log('ERRORS:\n'+errs.slice(0,12).join('\n'));
await b.close();
