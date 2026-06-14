import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:560,height:760}, deviceScaleFactor:2 });
// calling state (t=20)
await p.goto('http://localhost:5173/preview/widget.html?t=20',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const tel = await p.$('input[type=tel]'); await tel.click(); await tel.type('9991234567',{delay:15});
await (await p.$('text=Жду звонка')).click();
await p.waitForTimeout(1200);
await p.screenshot({ path:'widget-calling2.png' });
// done state (t=2): fill, submit, wait >2s
await p.goto('http://localhost:5173/preview/widget.html?t=2',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
const tel2 = await p.$('input[type=tel]'); await tel2.click(); await tel2.type('9991234567',{delay:15});
await (await p.$('text=Жду звонка')).click();
await p.waitForTimeout(3200);
await p.screenshot({ path:'widget-done.png' });
await b.close(); console.log('ok');
