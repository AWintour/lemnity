import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1000}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.addInitScript(()=>{ try{ localStorage.removeItem('widget-settings') }catch{} });
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);

// switches (role=switch)
const switches = await p.$$('[role=switch]');
console.log('switches:', switches.length);
if(switches.length){
  const before = await switches[0].getAttribute('aria-checked');
  await switches[0].click(); await p.waitForTimeout(400);
  const mid = await switches[0].getAttribute('aria-checked');
  await p.waitForTimeout(1500);
  const after = await switches[0].getAttribute('aria-checked');
  console.log('SWITCH0 aria-checked before/mid/after:', before, mid, after);
}

// color scheme radio via label text container
const customLabel = await p.$('label:has-text("Пользовательская"), :text("Пользовательская")');
// click radios group: HeroUI radios - click the visible label
try {
  await p.getByText('Пользовательская', {exact:false}).first().click({force:true});
  await p.waitForTimeout(1200);
  const checked = await p.evaluate(()=>{
    const r = document.querySelector('input[type=radio][value=custom]');
    return r ? r.checked : 'no-radio';
  });
  console.log('CUSTOM radio checked after click:', checked);
} catch(e){ console.log('radio click err', e.message.slice(0,80)); }

await p.screenshot({ path:'rep3.png' });
await b.close();
