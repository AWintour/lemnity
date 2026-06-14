import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:520,height:1600}, deviceScaleFactor:2 });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'networkidle'});
await p.waitForTimeout(2500);
const H = await p.evaluate(()=>document.body.scrollHeight);
const seg=1500; let i=0;
for(let y=1500; y<H; y+=seg){
  const hh=Math.min(seg,H-y);
  await p.screenshot({ path:'seg-'+(i++)+'.png', clip:{x:0,y,width:520,height:hh} });
}
console.log('H',H,'segs',i);
await b.close();
