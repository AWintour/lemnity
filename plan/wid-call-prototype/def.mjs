import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1000,height:840}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|Zod schema|404/.test(m.text()))errs.push(m.text());});
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
console.log('ERR:', errs.slice(0,8).join(' | ')||'none');
await p.getByRole('button',{name:'Просмотр'}).click();
await p.waitForTimeout(400);
await p.locator('button[aria-label="Обратный звонок"]').click();
await p.waitForTimeout(600);
// форма открыта — кликаем "Выбрать время для звонка"
await p.getByText('Выбрать время для звонка').click();
await p.waitForTimeout(400);
await p.screenshot({ path:'def-picker.png' });
// заполняем телефон + дату, жмём Готово
const tel = p.locator('input[type=tel]').last(); await tel.click(); await tel.type('9991234567',{delay:10});
const dt = p.locator('input[type="datetime-local"]').last(); await dt.fill('2026-02-12T12:00');
await p.getByRole('button',{name:'Готово'}).click();
await p.waitForTimeout(500);
await p.screenshot({ path:'def-confirm.png' });
await b.close(); console.log('ok');
