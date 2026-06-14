import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const logs=[]; p.on('console',m=>logs.push(m.type()+': '+m.text().slice(0,200))); p.on('pageerror',e=>logs.push('PAGEERR '+e.message));
// clear persisted draft to start clean
await p.addInitScript(()=>{ try{ localStorage.removeItem('widget-settings') }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);

// 1) Заголовок (InfoSettings) — найти textarea с 'Оставьте номер'
const tas = await p.$$('textarea');
let title=null; for (const t of tas){ const v=await t.inputValue(); if(v.includes('Оставьте')||v.includes('перезвоним')){title=t;break;} }
if(title){ await title.fill('ABCTEST'); await p.waitForTimeout(1800); console.log('TITLE after 1.8s:', JSON.stringify(await title.inputValue())); }
else console.log('no title textarea');

// 2) Цветовая гамма -> Пользовательская: проверяем, остаётся ли выбранной
const customRadio = await p.$('text=Пользовательская');
if(customRadio){ await customRadio.click(); await p.waitForTimeout(1500);
  // re-find and screenshot
  await p.screenshot({ path:'rep-after.png' });
}

console.log('--- console tail ---');
console.log(logs.slice(-15).join('\n'));
await b.close();
