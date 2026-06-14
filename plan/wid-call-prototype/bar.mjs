import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:760,height:820}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Zod schema|ERR_FAILED|Failed to load/.test(m.text()))errs.push(m.text());});
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
console.log('ERR:', errs.slice(0,8).join(' | ')||'none');
// switch animation to "Полоса заполнения" in editor
await p.getByText('Полоса заполнения').first().click({force:true});
await p.waitForTimeout(300);
// open preview -> launcher -> form -> submit
await p.getByRole('button',{name:'Просмотр'}).click({force:true});
await p.waitForTimeout(600);
await p.locator('button[aria-label="Обратный звонок"],button[aria-label="Супер кнопка"]').first().click({force:true});
await p.waitForTimeout(500);
const tel = p.locator('input[type=tel]').last(); await tel.click({force:true}); await tel.type('9991234567',{delay:8});
await p.getByRole('button',{name:'Жду звонка'}).last().click({force:true});
await p.waitForTimeout(2000);
// measure bar width at t1
const w1 = await p.evaluate(()=>{ const bars=[...document.querySelectorAll('div')].filter(d=>d.style && d.style.width && d.style.width.endsWith('%') && d.parentElement?.className?.includes('rounded-full')); return bars.length? bars[bars.length-1].style.width : 'none'; });
await p.waitForTimeout(2500);
const w2 = await p.evaluate(()=>{ const bars=[...document.querySelectorAll('div')].filter(d=>d.style && d.style.width && d.style.width.endsWith('%') && d.parentElement?.className?.includes('rounded-full')); return bars.length? bars[bars.length-1].style.width : 'none'; });
console.log('bar width t1:', w1, '-> t2:', w2);
await p.screenshot({ path:'bar-anim.png' });
await b.close(); console.log('ok');
