import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
// block google fonts so screenshot() won't hang on fonts
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
// live binding: change timer to 7 in the settings -> preview "Звонок" recomputes from store
const timer = await p.$('input[type=number]');
await timer.click({clickCount:3}); await timer.type('7'); await p.waitForTimeout(500);
// change title
const ta = await p.$('textarea');
if (ta){ await ta.click({clickCount:3}); await ta.type('Перезвоним за минуту'); await p.waitForTimeout(500); }
console.log('ERR:', errs.join(' | ')||'none');
await p.screenshot({ path:'live-bound.png' });
// floating
const pv = await p.$('button:has-text("Предпросмотр")'); await pv.click(); await p.waitForTimeout(800);
await p.screenshot({ path:'live-floating.png' });
await b.close(); console.log('done');
