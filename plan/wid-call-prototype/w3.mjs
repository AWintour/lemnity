import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:520,height:880}, deviceScaleFactor:2 });
await p.goto('http://localhost:5173/preview/widget.html',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const tel = await p.$('input[type=tel]'); await tel.click(); await tel.type('9991234567',{delay:15});
await p.waitForTimeout(300);
await p.screenshot({ path:'widget-final-form.png' });
await b.close(); console.log('ok');
