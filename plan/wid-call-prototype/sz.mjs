import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:900,height:760}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2800);
await p.getByRole('button',{name:'Просмотр'}).click();
await p.waitForTimeout(300);
await p.locator('button[aria-label="Обратный звонок"]').click();
await p.waitForTimeout(500);
// measure form card size
const box1 = await p.locator('[data-lemnity-callback]').boundingBox();
await p.screenshot({ path:'sz-form.png' });
// submit -> call
const tel = p.locator('input[type=tel]').last(); await tel.click(); await tel.type('9991234567',{delay:12});
await p.getByRole('button',{name:'Жду звонка'}).last().click();
await p.waitForTimeout(700);
const box2 = await p.locator('[data-lemnity-callback]').boundingBox();
await p.screenshot({ path:'sz-call.png' });
console.log('FORM size:', box1 && Math.round(box1.width)+'x'+Math.round(box1.height));
console.log('CALL size:', box2 && Math.round(box2.width)+'x'+Math.round(box2.height));
await b.close(); console.log('ok');
