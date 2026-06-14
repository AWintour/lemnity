import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1000,height:820}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|Zod schema/.test(m.text()))errs.push(m.text());});
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2800);
await p.getByRole('button',{name:'Просмотр'}).click();
await p.waitForTimeout(400);
await p.locator('button[aria-label="Обратный звонок"]').click();
await p.waitForTimeout(180);              // mid open animation
await p.screenshot({ path:'anim-open.png' });
await p.waitForTimeout(500);
const tel = p.locator('input[type=tel]').last(); await tel.click(); await tel.type('9991234567',{delay:10});
await p.getByRole('button',{name:'Жду звонка'}).last().click();
await p.waitForTimeout(1500);
await p.screenshot({ path:'anim-count.png' });
// close
await p.locator('button[aria-label="Закрыть"]').last().click();
await p.waitForTimeout(160);
await p.screenshot({ path:'anim-close.png' });
console.log('ERR:', errs.slice(0,6).join(' | ')||'none');
await b.close(); console.log('ok');
