import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
let navs=0; p.on('framenavigated', f=>{ if(f===p.mainFrame()) navs++; });
const reloads=[]; p.on('load', ()=>reloads.push(Date.now()));
await p.addInitScript(()=>{ try{ localStorage.removeItem('widget-settings') }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2500);
// mark window
await p.evaluate(()=>{ window.__mark = 'STAY'; });
// type into title
const tas = await p.$$('textarea');
let title=null; for (const t of tas){ const v=await t.inputValue(); if(v.includes('Оставьте')||v.includes('перезвоним')){title=t;break;} }
if(title){ await title.fill('KEEPME'); }
// wait 7s observing reloads
await p.waitForTimeout(7000);
const mark = await p.evaluate(()=> window.__mark || 'LOST');
const titleVal = title ? await title.inputValue() : 'n/a';
console.log('navs(after initial):', navs-1, '| extra loads:', reloads.length-1);
console.log('window.__mark:', mark, '| title now:', JSON.stringify(titleVal));
await b.close();
