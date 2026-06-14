import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:520,height:1400}, deviceScaleFactor:2 });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'networkidle'});
await p.waitForTimeout(2500);
// full page
await p.screenshot({ path:'callback-real-full.png', fullPage:true });
// split into readable halves
const H = await p.evaluate(()=>document.body.scrollHeight);
await p.screenshot({ path:'callback-real-top.png', clip:{x:0,y:0,width:520,height:Math.min(2000,H)} });
await p.screenshot({ path:'callback-real-mid.png', clip:{x:0,y:2000,width:520,height:Math.min(2000,H-2000)} });
if (H>4000) await p.screenshot({ path:'callback-real-bot.png', clip:{x:0,y:4000,width:520,height:Math.min(2000,H-4000)} });
console.log('H=',H,'done');
await b.close();
