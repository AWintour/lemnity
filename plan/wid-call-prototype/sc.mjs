import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1000,height:820}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|Zod schema/.test(m.text()))errs.push(m.text());});
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
console.log('ERR:', errs.slice(0,6).join(' | ')||'none');
await p.getByRole('button',{name:'Просмотр'}).click();
await p.waitForTimeout(800);
await p.screenshot({ path:'sc-fab.png' });   // FAB до уведомления
await p.waitForTimeout(5200);                 // ждём notifDelaySec=5
await p.screenshot({ path:'sc-bubble.png' }); // FAB + уведомление
// клик по кнопке → форма
await p.locator('button[aria-label="Обратный звонок"]').click();
await p.waitForTimeout(700);
await p.screenshot({ path:'sc-form.png' });
await b.close(); console.log('ok');
