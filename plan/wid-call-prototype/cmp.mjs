import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:900}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
async function shot(type, file){
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const url = 'http://localhost:5173/preview/callback.html'+(type?('?type='+type):'');
  await p.goto(url,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3500);
  console.log(file, 'ROOT:', JSON.stringify(await p.evaluate(()=>document.getElementById('root')?.innerText?.slice(0,70))));
  console.log(file, 'ERR:', errs.slice(0,5).join(' | ')||'none');
  await p.screenshot({ path:file });
  await p.close();
}
await shot('', 'cmp-callback.png');
await shot('VIDEO_WIDGET', 'cmp-video.png');
await b.close();
