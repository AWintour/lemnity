import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1100}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const logs=[]; p.on('console',m=>logs.push(m.type()+': '+m.text())); p.on('pageerror',e=>logs.push('PAGEERR '+e.message));
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
// find the Заголовок textarea inside InfoSettings (Окно информации). There are multiple textareas; pick the one with announcement title default.
const tas = await p.$$('textarea');
console.log('textareas:', tas.length);
// type into the first textarea (Заголовок of Окно информации likely)
for (let i=0;i<tas.length;i++){ const v = await tas[i].inputValue(); console.log('ta',i,JSON.stringify(v.slice(0,30))); }
// edit the one matching title
let target=null;
for (const t of tas){ const v=await t.inputValue(); if(v.includes('Оставьте номер')||v.includes('перезвоним')){ target=t; break; } }
if(!target) target=tas[0];
await target.click();
await target.fill('ТЕСТ ЗАГОЛОВОК 123');
await p.waitForTimeout(300);
console.log('after fill:', JSON.stringify(await target.inputValue()));
await p.waitForTimeout(1500);
console.log('after 1.5s:', JSON.stringify(await target.inputValue()));
console.log('--- logs tail ---'); console.log(logs.slice(-12).join('\n'));
await b.close();
