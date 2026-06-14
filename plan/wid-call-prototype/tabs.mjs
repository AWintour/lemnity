import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Zod schema|ERR_FAILED|Failed to load/.test(m.text()))errs.push(m.text());});
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
console.log('ERR:', errs.slice(0,8).join(' | ')||'none');
await p.screenshot({ path:'tabs-form.png', clip:{x:868,y:28,width:452,height:760} });
// switch to Экран звонка
await p.getByText('Экран звонка').first().click({force:true});
await p.waitForTimeout(400);
await p.screenshot({ path:'tabs-call.png', clip:{x:868,y:28,width:452,height:760} });
await b.close(); console.log('ok');
