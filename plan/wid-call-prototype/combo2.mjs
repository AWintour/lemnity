import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1260,height:1000}, deviceScaleFactor:2 });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
// live-edit: change timer value in editor to 9
const timer = await p.$('input[type=number]');
await timer.click({clickCount:3}); await timer.type('9');
await p.waitForTimeout(400);
// fill phone in preview widget then submit
const tel = await p.$('div.sticky input[type=tel]');
await tel.click(); await tel.type('9991234567',{delay:15});
await p.waitForTimeout(300);
const cta = await p.$('div.sticky button:has-text("Жду звонка")');
await cta.click();
await p.waitForTimeout(900);
await p.screenshot({ path:'combo-call-ok.png' });
await b.close(); console.log('done');
