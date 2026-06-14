import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2500);
const tas = await p.$$('textarea');
let idx=-1; for (let i=0;i<tas.length;i++){ const v=await tas[i].inputValue(); if(v.includes('Оставьте')||v.includes('перезвоним')){idx=i;break;} }
if(idx<0){ console.log('no title'); await b.close(); process.exit(0);} 
await tas[idx].fill('PERSIST_CHECK_42'); await p.waitForTimeout(1200);
const ls = await p.evaluate(()=> localStorage.getItem('widget-settings'));
console.log('localStorage has widget-settings:', !!ls, '| contains PERSIST_CHECK_42:', ls? ls.includes('PERSIST_CHECK_42'): false);
// reload
await p.reload({waitUntil:'domcontentloaded'});
await p.waitForTimeout(2800);
const tas2 = await p.$$('textarea');
let v2='(none)'; for (const t of tas2){ const v=await t.inputValue(); if(v.includes('PERSIST_CHECK_42')||v.includes('Оставьте')||v.includes('перезвоним')){ v2=v; break; } }
console.log('after reload title:', JSON.stringify(v2));
await b.close();
