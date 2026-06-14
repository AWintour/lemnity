import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:520,height:1500}, deviceScaleFactor:2 });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
const H = await p.evaluate(()=>document.body.scrollHeight);
let i=0;
for(let y=0;y<H;y+=1500){
  await p.evaluate(yy=>window.scrollTo(0,yy), y);
  await p.waitForTimeout(250);
  await p.screenshot({ path:'view-'+(i++)+'.png' });
}
console.log('H',H,'shots',i);
await b.close();
