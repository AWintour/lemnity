# Виджет «Чат» (CHAT) — план реализации

> Виджет реализуется как новый тип `CHAT`, **клонируется из «Уведомления»** (`NOTIFICATION`) —
> у него уже есть кнопка-лаунчер в углу + плавающая панель, что совпадает с UX чата
> (лаунчер → окно переписки). Эталон регистрации нового типа в репозитории — `NOTIFICATION`,
> `VIDEO_WIDGET`, `CALLBACK`; повторяем тот же набор точек интеграции.

## Что это

Виджет онлайн-чата на сайте клиента: посетитель пишет сообщение и **в реальном времени** общается
с продавцом (пользователем кабинета). Продавец читает и отвечает в новом разделе **«Чаты»** кабинета.

Принятые решения:
- **Realtime через WebSocket** (Socket.io / NestJS gateway).
- **Новый раздел «Чаты»** в кабинете для продавца.
- **Полная сквозная реализация**: виджет + бэкенд (модель + realtime) + кабинет.

Ключевые факты архитектуры:
- realtime-инфраструктуры в проекте **нет** (нет `@nestjs/websockets`/`socket.io`/`ws`) — добавляем;
- посетитель идентифицируется `sessionId` (`getCollectorSessionId()`, ключ `lemnity.session_id`);
- продавец — JWT (accessToken 1h, refresh 7d в cookie);
- origin публичных запросов проверяется по `project.websiteUrl` (`projects/server/src/common/origin.ts`);
- виджет рендерится в `<iframe srcdoc>`, интерактивная область синхронизируется через `postMessage`
  + `clipPath`/`pointerEvents` (`embedManager.syncFrameInteractivity`).

---

## Статус реализации

> Обновляется по мере работы (sync с кодом). Код собирается: widget-config, api-sdk,
> client (tsc), server (nest build), embed-script (vite) — без ошибок; unit-тест
> `chat.service.spec.ts` зелёный.

- [x] **Фаза 0** — клон Notification → скелет CHAT (widget-config `Chat/`, base/index/canonicalize,
      api-sdk `WidgetTypeEnum.CHAT` + `CreateWidgetDtoTypeEnum.CHAT`; client `layouts/Widgets/Chat/`
      + регистрация в registry/widgetDefinitions/widgetSlice/constants/widgetActions types).
- [x] **Фаза 1** — Prisma `ChatConversation`/`ChatMessage` + `enum WidgetType.CHAT`
      (`schema/models/chat.prisma`), связи в `Widget`/`Project`. `prisma validate` + `generate` ок.
- [x] **Фаза 2** — backend `src/chat/`: `ChatGateway` (namespace `/chat`), `ChatService`,
      `ChatController` (приватный) + `PublicChatController`, DTO/entities; deps
      `@nestjs/websockets`/`@nestjs/platform-socket.io`/`socket.io`; nginx `/socket.io/` (prod+dev);
      `extractOriginHostFromHeaders` в `common/origin.ts`.
- [x] **Фаза 3** — embed chat runtime: `Chat/embedded/*` (окно, триггеры, clipPath),
      `useChatConnection` на `socket.io-client` + `POST /public/chat/conversations`; `case CHAT`
      в `embedManager`. Визуал окна (`embedded/Widget.tsx`) приведён к макету: шапка с кластером
      аватаров операторов (онлайн/офлайн-точки) + «{Имя} онлайн / Отвечаем в течение 3 мин.»,
      ряд иконок-вкладок (чат/документ/гео/спарклы, инлайн-SVG), бабблы с временем (менеджер —
      лавандовый, посетитель — акцент), кнопки быстрых ответов, поле ввода с иконкой отправки,
      тулбар (+/микрофон/скрепка/эмодзи), футер «Сделано на Lemnity». Декоративные элементы
      статичны под макет; цвета/имя/аватар/приветствие/плейсхолдер/брендинг — из конфига.
- [x] **Превью-стенд** — `preview/chat.html` + `src/__preview__/chat.tsx` (по образцу
      `callback`): реальная раскладка `EditWidgetPage` (вкладки + `FieldsSettingsTab` +
      `WidgetPreview`) и кнопка «Просмотр» (floating). URL: `http://localhost:5173/preview/chat.html`.
- [x] **Фаза 4** — раздел «Чаты»: route `/chats` (App.tsx), пункт навигации (показ при включённом
      CHAT-виджете + бейдж непрочитанных), `pages/ChatsPage/`, `services/chats.ts`,
      `hooks/useChatSocket.ts` (manager socket + refresh-reconnect), `endpoints.ts` блок CHAT.
- [x] **Фаза 5** — каталог lemnity (`getWidgetCatalog` + `AVAILABLE_WIDGETS`).

- [x] **Бот-сценарий (редактор чат-бота)** — модель «дерево быстрых ответов»:
      `scenario { enabled, startStepId, steps[{ id, message, buttons[{ id, emoji?, label, next }], position }] }`
      в `widget-config/Chat/schema.ts` (+ стартовый сценарий по макету в `defaults.ts`).
      Визуальный **canvas-редактор** на `@xyflow/react`
      (`layouts/Widgets/Chat/ScenarioEditor.tsx`): узлы-шаги с инлайн-правкой сообщения и кнопок,
      связи перетаскиванием от кнопки к шагу, кнопка-handoff «👤 менеджеру» (`next=null`),
      добавление/удаление шагов и кнопок; подключён 2-й секцией `chat.scenario` в `metadata.ts`.
      **Рантайм** (`embedded/embedRuntime.tsx`): окно проигрывает сценарий (бот-фаза локально —
      приветствие + сообщение шага + кнопки; клик ведёт к след. шагу), кнопка-handoff и свободный
      ввод переключают в режим живого оператора (`useChatConnection` → socket). `Widget` рендерит
      `quickReplies` из текущего шага.
      Известная оптимизация: вынести `react-flow` из embed-бандла (сейчас попадает через граф
      registry→metadata, как и прочие редакторы; +~195 КБ к `embed.js`).
      **Изображение в шаге**: `scenario.steps[].image?` (URL) — в узле редактора кнопка
      «🖼️ Добавить изображение» грузит файл через `@/api/upload.uploadImage` в S3 (лимит 5 МБ,
      статус «Уменьшите размер файла (картинки)») и хранит URL; превью с удалением; в окне чата
      картинка рендерится в баббле бота над текстом (шаг показывается даже если только картинка).

- [x] **Звук нового сообщения** — `assets/zvuk-chat.mp3`, проигрывается в `embedRuntime` при входящем
      сообщении менеджера/бота **только если включён `soundEnabled`** (читается через ref, применяется
      на лету; `try/catch` под политику автоплея). Паттерн как у виджета «Обратный звонок» (`szvuk.mp3`).
- [x] **Боковая панель (sidebar) + закрытие** — `windowFormat='sidebar'`: окно `h-[100dvh]`, в embed
      докуется к краю экрана (`fixed top-0 bottom-0`); в шапке окна кнопка-крестик «Закрыть» (только в
      sidebar, т.к. лаунчер уходит к краю). Модальный режим — прежнее плавающее окно.
- [x] **Тень окна уменьшена** (`embedded/Widget.tsx`): `shadow-[0px_12px_30px_8px_rgba(0,0,0,0.18)]`
      → `shadow-[0px_8px_24px_rgba(0,0,0,0.10)]` (без spread). Применяется к modal и sidebar.

### Редактор чата — блоки настроек (готов, собран по макетам)

Секции редактора (`metadata.ts`, порядок сверху вниз) — каждая отдельным компонентом
в `layouts/Widgets/Chat/`, все пишут в конфиг через `setChatPatch`:

1. `chat.general` — **«Настройка чата»**: «Название чата» (`title`) + сворачиваемый блок
   **«Функционал»** (`featuresEnabled`, шевром слева, **по умолчанию свёрнут**) с под-тумблерами
   `soundEnabled`, `blockAnonymousProxy`, `brandingEnabled` («Сделано на Lemnity»), `deferredLoad`;
   + блок **«Формат окна»** (`windowFormat: 'modal' | 'sidebar'`): радио-карточки «Боковая панель»
   (окно на всю высоту экрана) / «Модальное окно» (плавающее в углу, дефолт).
2. `chat.schedule` — **«Ограничения времени показа»**: `schedule {timezone, from, to, days[], weekdaysOnly}`
   (селект пояса, рабочее время, дни недели + «Только по будням»).
3. `chat.auto-open` — **«Автоматически открывать чат»** (`autoOpen` + вложенные «Настройки показа»:
   `scrollOpen{enabled,percent}`, `afterOpenEnabled`+`delay`) и **«Мультикнопка»** (`multiButton`;
   подтягивает виджет `FAB_MENU` проекта, иначе статус «Не активная»).
4. `chat.appearance` — **«Оформление чата»**: палитры «Системный цвет» (`windowAccentColor`+hex),
   «Клиентский цвет» (`clientColor`), «Цвет фона» (`windowBackgroundColor`).
5. `chat.header` — **«Логотип компании»** (`companyLogo{enabled,fileName,url}`) и
   **«Приветственный заголовок»** (`welcomeTitle`, `welcomeTitleSize`, `welcomeTitleColor`,
   `welcomeTitleAlign` + кнопки выравнивания, размер через `NumberStepper`).
6. `chat.info-headings` — **«Информационный заголовок онлайн/офлайн»** (`onlineMessage`, `offlineMessage`).
7. `chat.contacts` — **«Контакты»**: `contacts {name,phone,email:{enabled,required}, when}` +
   радио «Когда запрашивать» (В ходе диалога / Перед началом диалога / Не запрашивать).
8. `chat.personalization` — **«Персонализированные приветствия»** (`personalizedGreetings`).
9. `chat.callback-soon` — **«Обратный звонок»** — заглушка «Скоро» (неактивный тумблер, без поля).
9b. `chat.callback-soon` — **«Обратный звонок»** (статус «Скоро») + под-тумблер «Отложенный звонок»
   (`deferredCall`).
10. `chat.widget-settings` — **«Форма»** (лаунчер: текст/цвет/иконка/позиция через `TriggerSettings`).
11. `chat.scenario` — **canvas-редактор сценария бота** (`@xyflow/react`).
12. `chat.company-contacts` — **«Контакты компании»** (`contactsTab {enabled, address, phone, email}`) —
    данные вкладки «Контакты» в окне; тумблер вкл/выкл скрывает вкладку.
13. `chat.ai-agent` — **«Аи агент»** (бейдж «Платно»): `aiAgentEnabled`, `aiAgentName` (имя в приветствии),
    `aiKnowledge: string[]` (разделы, которые агент изучает и о которых информирует). GPT через шлюз.

Общий компонент `components/NumberStepper.tsx` (поле + стрелки ↑/↓) — для всех числовых полей.

### Окно чата (рантайм, `embedded/Widget.tsx` + `embedRuntime.tsx`)

Статичная **шапка** (аватары операторов + инфо-статус онлайн/офлайн) и ряд из 4 иконок-вкладок —
на всех экранах; логотип/бот и крупный приветственный заголовок — только на `home`.
Вкладки: 1) чат, 2) «Контакты», 3) карта (декор), 4) **ИИ-агент** (спарклы).

Состояния `view` (навигация со стеком истории — кнопка «Назад» возвращает на предыдущий экран):
- **`home`** — первый экран: приветственный заголовок + меню сценария (строки со стрелкой →),
  handoff-кнопка отдельной акцентной карточкой; без поля ввода.
- **`chat`** — переписка: лента (цвет посетителя = `clientColor`), поле ввода, тулбар. Свободный
  ввод и handoff → живой оператор (socket). ИИ-вкладка открывает чат с приветствием от `aiAgentName`.
- **`contacts`** — вкладка «Контакты»: адрес/телефон/email + кнопки «Отправить сообщение» / «Позвонить».
- **`form`** — **«Оставить сообщение»**: при handoff, если `contacts.when ≠ never`; поля по включённым
  контактам + комментарий, зелёная кнопка; ← «Назад».
- **`callback`** — **«Обратный звонок»**: телефон + дата/время + кнопка-ракета → зелёное подтверждение.

### Следующая фаза — «Модуль Чат» (админ-панель оператора)

Рабочее место продавца для общения с посетителями. Стартовая точка — уже существующий раздел
**«Чаты»** в кабинете (`projects/client/src/pages/ChatsPage/ChatsPage.tsx` + `hooks/useChatSocket.ts`
+ `services/chats.ts`): список диалогов + тред + ответ оператора через socket `/chat`. Развиваем его
в полноценный «Модуль Чат» (макеты приходят поблочно).

### Запуск (локально, выполнено 2026-06-13)

- [x] **Миграция применена** к локальной `lemnity_app`: enum `CHAT` + `chat_conversations`/
      `chat_messages` + FK (таблицы/enum проверены запросом). Закоммичен идемпотентный файл
      `prisma/schema/migrations/20260613000000_add_chat/migration.sql` (для прод `migrate deploy`).
      ⚠️ `migrate dev` НЕ запускали — в локальной БД пре-существующий drift (`callback_subscriptions`,
      не относится к чату), `migrate dev` потребовал бы reset с потерей данных; вместо этого применён
      только аддитивный SQL чата через `prisma db execute`.
- [x] **Backend поднят** на `localhost:3000` (`nest start`, в обход `db:migrate`).
      ⚠️ `pnpm start:dev` падает на шаге `db:migrate`: пакет `packages/database` резолвит ДРУГОЙ
      `DATABASE_URL` (БД `db`, P1010 denied), отличный от `projects/server/.env` (`lemnity_app`).
      Пре-существующий рассинхрон env — для локального запуска стартуем `nest start` напрямую.
- [x] **Smoke-проверка backend**: `POST /api/public/chat/conversations` (несуществ. виджет) → 404;
      socket.io handshake `/socket.io/` → `0{...}`; `GET /api/chat/conversations` без токена → 401.

### Аудит прод-готовности виджета (2026-06-13)

Сквозной поток **виджет → backend → кабинет полностью реальный** (не мок):
- Регистрация типа CHAT — без пробелов: widget-config (schema/base/index/canonicalize/exports),
  api-sdk (`WidgetTypeEnum.CHAT` + `CreateWidgetDtoTypeEnum.CHAT`, **dist синхронен с src**),
  Prisma (`enum CHAT`, `ChatConversation`/`ChatMessage` + индексы, идемпотентная миграция),
  embed-script (`case CHAT` → `ChatEmbedRuntime`), клиент-регистрация (registry/definitions/slice/
  constants/actions), каталог lemnity (`getWidgetCatalog` + `AVAILABLE_WIDGETS`).
- Транспорт рантайма (`useChatConnection`): реальный `POST /api/public/chat/conversations` →
  `GET .../messages` (история) → socket.io `/chat` (`message:send`/`message:new`/`conversation:read`/
  `operator:presence`); всё под `preview`-флагом (в preview — без сети).
- Сборки: `build:packages` ✓ (`embed.js` ~3 МБ gzip ~993 КБ — см. оптимизацию react-flow),
  client `tsc -b` ✓. Пре-существующая ошибка `server/test/app.e2e-spec.ts` (TS2349) — **не от чата**
  (коммит LEM-51).

Поля схемы, не вошедшие в исходный план, но реализованные: `windowFormat`, `soundEnabled`,
`scenario.steps[].image`, расширенные `contacts`/`contactsTab`/`schedule`/`aiAgent`/`scrollOpen` и др.

### Прод-деплой + гейт (2026-06-13)

- **Выкачено на прод**: push в `main` (commit `82fd111`) → GitHub Actions CI/CD (сборка образов →
  SSH на прод → `deploy.sh`: `prisma db push` + up стека). Бэкенд командных разделов «Модуля Чат»
  построен (операторы/отделы/распределение/соцсети/групп-чат) — см. `plan-module-chat.md`.
- **Гейт на время теста**: «Чат» (каталог), «Модуль Чат» (сайдбар), `/chat-module`, `/chats` —
  только администратору (`hooks/useIsAdmin`: роль `ADMIN` или email из `VITE_ADMIN_EMAILS`,
  дефолт включает `lemnitycom@gmail.com`). Снять при открытии всем.

### Багфикс: дубль виджета при двух тегах embed.js (2026-06-14, commit `2abe526`)

**Симптом**: на живой странице (Tilda) виджет чата показывался дважды.

**Root cause**: сниппет встраивается как `<script type="module" defer>`; для модулей
`document.currentScript` всегда `null`, скрипт отложенный → `findEmbedScript()` в момент `load`
возвращал ПЕРВЫЙ тег `embed.js` для ОБОИХ исполнений бандла. На странице было два тега embed.js
(валидный CHAT + старый 404), поэтому первый виджет монтировался дважды, второй — никогда.
Дедуп-гард `__lemnityMounted` занимал владение widgetId только ПОСЛЕ `await fetch` → оба
исполнения успевали пройти проверку (гонка).

**Фикс** (`packages/embed-script/src/embed/`): идемпотентный бутстрап —
- `utils.collectEmbedWidgetIds()` собирает ВСЕ уникальные widgetId со всех тегов embed.js;
- `index.tsx` монтирует каждый ровно один раз (по `EmbedManager` на widgetId — один менеджер
  хостит один виджет, т.к. `init` делает `destroy` предыдущего);
- `embedManager.init()` занимает владение в `__lemnityMounted` СИНХРОННО до любого `await`.
Loader/format-агностично; incoming `postMessage` фильтруется по `event.source` (мультименеджеры
не пересекаются). Тест: реальная `collectEmbedWidgetIds` на сценарии страницы — дедуп
`[AAA,BBB,tilda,AAA]→[AAA,BBB]`; синхронный гард — `AAA` монтируется один раз.

> На стороне сайта остаётся косметика: убрать второй (битый, 404) сниппет — но дубль уходит
> и без этого. Прод `embed.js` пересобирается в CI (`postinstall → sync:embed-script → client build`).

**Верификация на проде**: в живом `app.lemnity.ru/embed.js` есть новый маркер `autoInit widgetIds`
и `__lemnityMounted` ×2, старые маркеры (`autoInitFromQuery start`, `init from query`) отсутствуют →
выкачен исправленный бандл.

**Нюанс кэша (важно)**: `nginx` отдаёт `/embed.js` из точечного `location = /embed.js` БЕЗ
`Cache-Control`, а `last-modified` у нового файла не меняется (scp не двигает mtime — остаётся дата
прошлой сборки). Спасает только смена `etag` (mtime-size): браузеры с `If-None-Match` ревалидируют и
получают 200. Поэтому после фикса embed.js **вернувшимся** посетителям нужен хард-рефреш либо
ревалидация (часы). **TODO-харднинг**: задать `embed.js` `Cache-Control: no-cache` (или
content-hash в имени), чтобы правки долетали мгновенно.

**Чтобы не повторять (уроки про embed)**:
- НЕ полагаться на `document.currentScript` в бутстрапе — сниппет грузится как `type="module" defer`,
  для модулей `currentScript === null`; на `load` его тоже нет. Идентифицировать «свой» виджет —
  только по `?widgetId=` в `src` тегов (или `import.meta.url`, но для iife-сборки её шим тоже опирается
  на `currentScript`). Бутстрап обязан быть **идемпотентным** (сбор всех id + дедуп), а не «найти один свой».
- Дедуп-гард регистрировать **синхронно до первого `await`**, иначе гонка при двойном подключении.
- Один `EmbedManager` = один виджет (`init` делает `destroy` предыдущего); для N виджетов — N менеджеров.
- Любые конфликты состояния между несколькими инстансами держать в `window` (как `__lemnityMounted`),
  т.к. каждый тег `embed.js` исполняет бандл в своём модульном scope.

### Осталось

- [ ] **Кэш-харднинг `embed.js`**: `Cache-Control: no-cache` в `location = /embed.js` (nginx) или
      content-hash в имени — чтобы фиксы бандла долетали мгновенно, не завися от смены etag
      (см. «Нюанс кэша» в багфиксе выше).
- [ ] Полный e2e на реальном CHAT-виджете: создать виджет в проекте (websiteUrl = origin стенда),
      проверить realtime посетитель ↔ кабинет, presence, clipPath, origin-негатив, проигрывание
      сценария бота + хэндоф к оператору.
- [x] **Картинки виджета/модуля → в персональное хранилище** (правило по умолчанию, см.
      `docs/instructions/image-storage.md`): картинка шага сценария, аватар оператора, логотип
      компании грузятся через `@/api/upload.uploadImage` в S3 под `users/{userId}/…` (лимит 5 МБ,
      статус «Уменьшите размер файла (картинки)»); в БД/конфиге — только URL, без base64/blob.
      Эндпоинт `/files/images` закрыт `@Auth()`.
- [ ] (Пост-MVP) Масштабирование realtime на >1 инстанс: Redis/RabbitMQ adapter для socket.io
      (сейчас in-memory rooms). Refresh JWT в manager-socket реализован (connect_error → refresh).
- [ ] (Оптимизация) Вынести `react-flow` из embed-бандла (редактор сценария нужен только в кабинете).

---

## Фаза 0 — Клон Notification → скелет CHAT

Цель: тип `CHAT` появляется в каталоге, создаётся, открывает экран настроек с дефолтным конфигом.

**widget-config (`packages/widget-config/src/`):**
- Новая папка `widgets/Chat/`:
  - `schema.ts`: `WidgetType: WidgetTypeId = 'CHAT'`. Launcher-поля сохранены
    (`triggerText/triggerFontColor/triggerIcon/triggerBackgroundColor/triggerPosition`).
    Поля чата вместо `notifications[]`: `greetingMessage`, `offlineMessage`, `operatorName`,
    `operatorAvatarUrl?`, `windowBackgroundColor`, `windowAccentColor` (HEX-regex), `placeholder`,
    `requireContact: boolean`, `brandingEnabled`. Экспорт `chatSchema` + тип `ChatWidgetType`.
  - `canonicalize.ts`: `canonicalizeChat: WidgetCanonicalizer = settings => settings`.
- `widgets/base.ts` — `| 'CHAT'` в `WidgetTypeId`.
- `widgets/index.ts` — импорт `chatSchema`, `{ type:'CHAT', schema: chatSchema }` в `adapters`.
- Реестр канонизаторов (`canonicalizer*`) — добавить `canonicalizeChat`.
- `package.json` — export `"./widgets/chat"`.

**api-sdk:** `packages/api-sdk/models/widget.ts` — `CHAT: 'CHAT'` в `WidgetTypeEnum`.

**client — папка `layouts/Widgets/Chat/`** (клон `Notification/`): `metadata.ts`, `defaults.ts`,
`actions.ts`, `ChatWidgetSettings.tsx`, `ChatSettings.tsx`, `WidgetPreview.tsx`,
`ChatFloatingPreview.tsx`, `embedded/{embedRuntime,Widget,DesktopWidgetTrigger,MobileWidgetTrigger,Badge}.tsx`.

**client — регистрация:** `registry.ts` (`widgetMetadata`), `widgetDefinitions.ts`
(`implementedWidgetDefinitions`, `settingsSurfaces: { fields:'custom', display:'custom' }`),
`widgetSlice.ts` (`chatUpdater` + `createChatActions`), `constants.ts`
(`WidgetTypes.CHAT` + `AVAILABLE_WIDGETS`), `widgetSettings/types.ts` (union, если нужно).

---

## Фаза 1 — Модель данных (Prisma)

- `schema/models/widgets.prisma` — `CHAT` в `enum WidgetType`; `chatConversations ChatConversation[]`
  в `Widget`.
- Новый `schema/models/chat.prisma`:
  - `enum ChatConversationStatus { open closed }`, `enum ChatMessageSender { visitor manager system }`.
  - `ChatConversation`: `id`, `seq @unique @default(autoincrement())`, `projectId`+relation,
    `widgetId`+relation (Cascade), `sessionId`, `status @default(open)`, денормализация
    (`lastMessageAt`, `lastMessagePreview`, `unreadForManager`, `unreadForVisitor`),
    опц. контакт (`visitorName/Phone/Email`), `messages[]`, timestamps. Индексы + `@@unique([widgetId, sessionId])`.
  - `ChatMessage`: `id`, `conversationId`+relation (Cascade), `sender`, `body`, `senderUserId?`,
    `readAt?`, `createdAt`. `@@index([conversationId, createdAt])`.
- Миграция `add_chat`.

---

## Фаза 2 — Backend realtime + REST (`projects/server/src/chat/`)

Зависимости: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`.

- `chat.gateway.ts` — namespace `/chat`. `handleConnection`: visitor (widgetId+sessionId+origin) →
  join `chat:${widgetId}:${sessionId}`; manager (JWT) → join `project:<projectId>`.
  События: `message:send` → broadcast `message:new` + `conversation:updated`; `conversation:read`;
  `operator:presence`.
- `chat.service.ts` — `getOrCreateConversation`, `appendMessage`, `listConversations`
  (зеркало `RequestService.list`), `getMessages`, `markRead`.
- `chat.controller.ts` (приватный): `GET /chat/conversations`, `GET /chat/conversations/:id/messages`,
  `PATCH /chat/conversations/:id`, `POST /chat/conversations/:id/messages`.
- `public-chat.controller.ts` (публичный): `POST /public/chat/conversations`, `GET .../messages`.
- `main.ts` (WS adapter), `nginx` (WS-upgrade `/socket.io/`), `common/origin.ts` (хелпер для handshake).

---

## Фаза 3 — Embed chat runtime

- `Chat/embedded/embedRuntime.tsx` — sessionId → `POST /public/chat/conversations` → socket.io
  visitor; `message:send`/`message:new`/`operator:presence`; адаптация `sendBoundingRectToIframe`
  под крупное окно.
- `Widget.tsx` — лента сообщений, composer, статус оператора, офлайн-баннер, branding.
- `embedManager.tsx` — `case 'CHAT'`. Зависимость `socket.io-client`.

---

## Фаза 4 — Раздел «Чаты» в кабинете

- `App.tsx` route `/chats`; `NavigationSidebar.tsx` пункт + бейдж непрочитанных.
- `pages/ChatsPage/` (по образцу `RequestsPage/`): список диалогов + тред + composer.
- `services/chats.ts`, `hooks/useChatSocket.ts` (manager socket, refresh-reconnect).

---

## Фаза 5 — Каталог / тариф

- `lemnity.service.ts` `getWidgetCatalog()` — `{ type:'CHAT', title:'Чат', isAvailable:true, badge:'new' }`.
- Биллинг через `Widget.paidUntil` (без изменений).

---

## Верификация

Быстрый просмотр редактора (без БД): `pnpm -C projects/client start:dev` →
`http://localhost:5173/preview/chat.html` (в preview чат в локальном режиме: приветствие + эхо).

Сквозной realtime-поток (нужна БД + backend):

1. install + `prisma generate` + миграция.
2. server `start:dev`, client dev, test-platform.
3. Создать проект + виджет CHAT, включить.
4. embed → окно → создан `ChatConversation`, socket подключён, приветствие.
5. Посетитель пишет → персист + мгновенно в `/chats`, бейдж.
6. Менеджер отвечает → мгновенно в окне посетителя; presence online.
7. clipPath: клики вне окна проходят на сайт.
8. Origin-негатив отклоняется.
9. Каталог содержит CHAT.
