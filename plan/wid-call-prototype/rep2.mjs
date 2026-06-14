import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const logs=[]; p.on('console',m=>{const t=m.text(); if(/reset|init|rerender|loop|Maximum|Warning|error/i.test(t)) logs.push(m.type()+': '+t.slice(0,160));}); p.on('pageerror',e=>logs.push('PAGEERR '+e.message));
await p.addInitScript(()=>{ try{ localStorage.removeItem('widget-settings') }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);

const tas = await p.$$('textarea');
let title=null; for (const t of tas){ const v=await t.inputValue(); if(v.includes('Оставьте')||v.includes('перезвоним')){title=t;break;} }
if(title){
  await title.click(); await title.fill('ABCTEST');
  const v0 = await title.inputValue();
  await p.waitForTimeout(2000);
  const v1 = await title.inputValue();
  console.log('TITLE immediately:', JSON.stringify(v0), '| after 2s:', JSON.stringify(v1));
} else console.log('no title');

// type char-by-char to detect cursor/reset
if(title){ await title.fill(''); await title.type('Привет', {delay:120}); await p.waitForTimeout(500); console.log('TYPED result:', JSON.stringify(await title.inputValue())); }

console.log('LOGS:', logs.slice(-10).join('\n')||'none');
await b.close();
