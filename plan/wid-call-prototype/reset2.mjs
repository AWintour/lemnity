import { chromium } from '/Users/thesimakov/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1320,height:1400}, deviceScaleFactor:2 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
await p.goto('http://localhost:5173/preview/callback.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);

// 1) Цветовая гамма: кликнуть "Пользовательская"
const custom = await p.$('text=Пользовательская');
if (custom){ await custom.click(); await p.waitForTimeout(600);
  // is it selected now? screenshot region
}
await p.screenshot({ path:'r2-colorscheme.png' });

// 2) Контент: кликнуть "Фон всего окна"
const bg = await p.$('text=Фон всего окна');
if (bg){ await bg.click(); await p.waitForTimeout(600); }
await p.screenshot({ path:'r2-content.png' });

// 3) Логотип компании toggle (С({Вкл})) — найти switch рядом с "Логотип компании"
console.log('done');
await b.close();
