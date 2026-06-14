import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded', timeout:60000});
await p.waitForTimeout(3500);
console.log('ROOT:', JSON.stringify(await p.evaluate(()=>document.getElementById('root')?.innerText?.slice(0,120))));
console.log('ERR:', errs.slice(0,10).join(' | ')||'none');
try { await p.screenshot({ path:'live-editor.png', timeout: 8000 }); console.log('shot ok'); }
catch(e){ console.log('shot fail:', e.message); await p.screenshot({ path:'live-editor.png', timeout: 8000, caret:'initial' }).catch(()=>{}); }
await b.close();
