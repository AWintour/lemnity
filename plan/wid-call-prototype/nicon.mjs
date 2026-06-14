import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ try{ const r=localStorage.getItem('widget-settings'); if(r){const m=JSON.parse(r); delete m['cb-preview']; localStorage.setItem('widget-settings',JSON.stringify(m));} }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
// IconPicker triggers: buttons w-18 h-12.75. [0]=кнопка лаунчера, [1]=уведомление
const triggers = await p.$$('button.w-18.h-12\\.75');
console.log('icon triggers:', triggers.length);
if(triggers[1]){
  await triggers[1].click({force:true});
  await p.waitForTimeout(400);
  // popover icons: w-11 h-11 clickable; pick a middle one (e.g., Star)
  const opts = await p.$$('.w-11.h-11');
  console.log('popover icons:', opts.length);
  if(opts.length) await opts[5].click({force:true});
  await p.waitForTimeout(500);
}
console.log('ERR:', errs.slice(0,5).join(' | ')||'none');
await p.screenshot({ path:'notif-icon.png', clip:{x:868,y:520,width:452,height:320} });
await b.close(); console.log('ok');
