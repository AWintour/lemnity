# Embed-runtime: как виджеты живут на сайте партнёра

Документ про слой **доставки** виджета на чужой сайт (`packages/embed-script`). Про
схему/каноникализацию/серверный конфиг см. [widget-workflow.md](./widget-workflow.md).

## Сниппет и точки входа

Партнёр вставляет один тег:

```html
<!-- один виджет -->
<script type="module" src="https://app.lemnity.ru/embed.js?widgetId=..."></script>
<!-- все включённые виджеты проекта одним тегом -->
<script type="module" src="https://app.lemnity.ru/embed.js?projectId=..."></script>
```

Бандл `embed.js` исполняется в **двух разных режимах** (см. `bootstrap()` в
`src/embed/index.tsx`):

1. **Внешний реалм** — обычная загрузка на странице партнёра. Сканирует теги
   (`collectEmbedWidgetIds` / `collectEmbedProjectIds`), для `projectId` тянет все
   включённые виджеты одним запросом (`fetchPublicProjectWidgets`) и поднимает по
   `EmbedManager` на каждый `widgetId`.
2. **Внутренний реалм** — тот же бандл, загруженный **внутри srcdoc-iframe** конкретного
   виджета. Распознаётся по `window.__lemnityInner`: вызывает `mountInline()` и сразу
   выходит, никакого autoInit здесь быть не должно.

## Изоляция: один iframe на виджет

`useWidgetSettingsStore` (и react-query, прочие синглтоны) — это module-level zustand на
весь JS-реалм. Если бы все виджеты проекта рендерились в окне партнёра, они делили бы
**один** стор, и `init()` каждого следующего затирал бы конфиг предыдущего — показывался
бы только последний (исходный баг, исправлен в коммите 48690fb).

Поэтому каждый виджет грузит бандл **внутри собственного `srcdoc`-iframe** (свой JS-реалм →
свои синглтоны). Поток:

```
index.tsx (внешний реалм)
  └─ EmbedManager.init(widgetId)            # по одному менеджеру на widgetId
       ├─ ensureContainer(widgetId)         # fixed full-viewport <div>, pointer-events:none
       ├─ <iframe srcdoc=...>               # кладёт config в window.__lemnityInner + грузит embed.js
       └─ embed.js внутри iframe → mountInline()
            └─ useWidgetSettingsStore.init() # изолированный стор ЭТОГО iframe
            └─ React render одного виджета
```

Дедуп от двойного подключения тега — глобальный гард `window.__lemnityMounted[widgetId]`
в `EmbedManager.init` (захватывается синхронно, до `await`).

## Интерактивность: clip-path по зоне виджета

Контейнер виджета — полноэкранный `position:fixed` div с `pointer-events:none`. Чтобы
клики проходили сквозь пустоту, но попадали в сам виджет, дочерний скрипт внутри iframe
измеряет footprint интерактивных элементов и шлёт родителю
`postMessage({ scope:'lemnity-embed', type:'interactive-region', rect })`. `EmbedManager`
по этому `rect` ставит `clip-path: inset(...)` на свой контейнер — видимой и кликабельной
остаётся только зона виджета.

### ⚠️ Инвариант: interactive-region скоупится по своему iframe

На странице **по одному `EmbedManager` на виджет**, и каждый слушает `window` message.
`interactive-region` исходит **только** из дочернего скрипта своего iframe
(`event.source === this.iframe.contentWindow`, ветка `fromIframe`).

`interactive-region`, пришедший НЕ из своего iframe, — это сообщение **другого виджета**
того же проекта. Применять его нельзя: он затрёт наш `clip-path` и обрежет наш виджет по
чужой зоне → на странице будет виден только один виджет. Поэтому такое сообщение
игнорируется и не пересылается (`embedManager.tsx`, `handleMessage`). Это исправление
бага «включены два виджета, а показывается один» (коммит 760d4ee).

При любой правке `handleMessage` сохраняйте это: чужие `interactive-region` не трогают
наш контейнер.

## Сборка и публикация

```
pnpm -C packages/embed-script build        # typecheck + vite build → dist/embed.js
pnpm -C packages/embed-script sync:public   # копия в projects/{client,test-platform}/public
```

`dist/embed.js` и копии в `public/` — в `.gitignore`; бандл пересобирается на CI/деплое из
исходников. Коммитим только `src/`.
