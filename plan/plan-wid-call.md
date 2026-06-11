# Виджет «Обратный звонок» (CALLBACK) — план реализации

> Виджет реализуется как новый тип `CALLBACK`, **клонируется из «Анонса»** (`ANNOUNCEMENT`) и
> доводится до карточки с формой захвата контакта (имя + телефон). Эталон клонирования в репозитории —
> виджеты `EventTimer` и `VIDEO_WIDGET` (оба клонированы из «Анонса»), повторяем тот же набор точек
> интеграции.

## Что это

Виджет обратного звонка: посетитель оставляет **имя и телефон**, заявка уходит на бэкенд, владелец
видит её в списке заявок проекта и перезванивает. Карточка как у «Анонса»: заголовок, описание,
форма (имя + телефон) и кнопка отправки; после отправки — экран «Спасибо, мы перезвоним»
(переиспользуется экран «награда» «Анонса»).

Инфраструктура приёма заявок **уже существует** и менять её не нужно:
- модель `Request` (`packages/database/prisma/schema/models/requests.prisma`) хранит `fullName`,
  `phone`, `email`, `status`, `device`, `url`, `referrer`, `userAgent`, `ip`;
- эндпоинт `POST /api/public/requests` (`projects/server/src/request/public-request.controller.ts`);
- клиентский хелпер `sendPublicRequest()` (`projects/client/src/common/api/publicApi.ts:145`),
  который уже используют «Лид-форма», «Колесо фортуны», «Видео виджет».

Поэтому **новых таблиц/полей в БД нет** — только новое значение enum `WidgetType`.

**Размеры:** карточка фиксирована `360 × 560 px` — **форма и экран звонка одного размера**. Окно
раскрывается НАД кнопкой-лаунчером; кнопка в открытом состоянии — крестик (закрыть).

---

## Статус реализации (прототип — синхронизировано с кодом)

> Клиентская часть собрана и работает через реальный реестр/стор. Бэкенд **Фаза 1** (Prisma enum,
> widget-config Zod-схема, api-sdk DTO, боевой embed), **Фаза B** (энфорсмент подписки), **Фаза 2**
> (телефония Mango, Stage 1+2) и **вкладка «Звонки» + менеджеры** — **реализованы и задеплоены на прод**.
> **АКТУАЛЬНОЕ РЕШЕНИЕ:** движок звонков переводится с Mango на **Voximplant** (Mango не умеет звонить
> с произвольного «номера менеджера» — оператором обязан быть реальный сотрудник-extension, иначе
> error 3330). Подробности, итоги боевого тестирования и план интеграции Voximplant — в разделе
> **«Движок телефонии: Mango → Voximplant»** в конце документа (от 2026-06-11).

### Сводка статуса (на 2026-06-11)

**✅ Готово на 100% — фронт / редактор / прототип:**
- Регистрация типа `CALLBACK` на клиенте (api-sdk enum + `constants.ts` / `registry.ts` /
  `widgetDefinitions.ts` / `widgetSlice.ts` / `widgetActions/types.ts` / `WidgetPreviewLayout.tsx`).
- Папка `Callback/` (defaults, actions, metadata, виджет, форма, лаунчер, превью) — визуал
  идентичен другим виджетам (общие компоненты редактора).
- Редактор полностью: лаунчер (текст/цвет/иконка/форма/скрыть/размер/положение/анимация-волны);
  бабл (вкл/выкл, текст, цвет фона/текста, иконка сбоку + цвет, **звук** `szvuk.mp3`, анимация
  всплытия); форма (формат окна, логотип, цветовая гамма по «Пользовательская», скругление, кнопка
  отправки, заголовок + размер шрифта 25px, значение таймера, отложенный звонок, контакты);
  **Согласие** + **Рекламная информация** на стандартных `AgreementPoliciesField` / `AdsInfoField`
  (`fields.agreement` / `fields.adsInfo`); экран звонка (цвет текста/анимации, «Отменить» активна,
  анимация «Круг ↔ Полоса»); настройка звонка (менеджер «из файла» `MANAGERS`, тонкости соединения),
  уведомления менеджера (SMS + Telegram), график работы, брендинг.
- Рендер виджета по макетам: форма и экран звонка одного размера; кольцо отсчёта на rAF; анимация
  только секунд; сценарий лаунчера (бабл над кнопкой → форма → крестик); боковой/модальный режим;
  отложенный звонок с подтверждением.
- Тестовый стенд (`__preview__/callback.tsx` + `preview/callback.html`) через реальную машинерию.

**✅ Готово — бэкенд Фаза 1 (виджет сохраняется + захват лидов + боевой embed):**
1. **Prisma:** `CALLBACK` в `enum WidgetType` + миграция `20260611000000_add_widget_callback`
   (`ALTER TYPE "WidgetType" ADD VALUE 'CALLBACK'`). ⚠️ миграцию ещё нужно **применить** к БД
   (`pnpm --filter @lemnity/database prisma migrate deploy`).
2. **widget-config:** Zod-схема `Callback` (клон «Анонса», поле `callback` — loose) зарегистрирована
   (`base.ts`/`index.ts`/`canonicalize.ts`/`package.json`) и собрана в `dist`; консольный
   `Zod schema validation failed` уходит.
3. **api-sdk:** `CALLBACK` в `CreateWidgetDtoTypeEnum` / `UpdateWidgetDtoTypeEnum` (source + `dist`).
4. **Боевой embed:** `Callback/embedded/embedRuntime.tsx` + `index.ts`, подключён в `embedManager.tsx`
   (`case CALLBACK` → монтирует `CallbackLauncher`); форма шлёт `sendPublicRequest` на
   `POST /api/public/requests`. Проверка: client/embed/server `tsc` — 0 ошибок, widget-config build ок.

**⬜ Осталось — бэкенд Фаза 2 (телефония Mango, ОТЛОЖЕНО до ключей/sandbox):**
- **Mango-сервер:** `ProjectIntegration` (токены/SIP), `ScheduledTask` + воркер, `mango.service/controller`,
  `POST /api/public/callback`, вебхуки `/api/mango/events` — механика звонка (таймер → перезвон).

**Готово (клиент):**
- Тип `CALLBACK` зарегистрирован: `api-sdk` enum (`models/widget.ts` + `dist`), `constants.ts`
  (`AVAILABLE_WIDGETS` «Обратный звонок»), `registry.ts`, `widgetDefinitions.ts`
  (`settingsSurfaces: { fields:'custom', display:'custom' }`), `widgetSlice.ts`
  (`createCallbackActions` + `setCallbackPatch`), `WidgetPreviewLayout.tsx` (CALLBACK без табов
  устройства), `InfoSettings.tsx` (CALLBACK трактуется как `announcement`).
- Папка `projects/client/src/layouts/Widgets/Callback/`: `defaults.ts`
  (`CallbackWidgetType = AnnouncementWidgetType & { callback: CallbackExtra }`), `actions.ts`
  (копия Анонса `setCallback*` + `setCallbackPatch`), `CallbackWidget.tsx`, `CallbackForm.tsx`,
  `CallbackLauncher.tsx`, `WidgetPreview.tsx`, `CallbackFloatingPreview.tsx`,
  `CallbackWidgetSettings.tsx`, `metadata.ts`.
- **Редактор** — те же общие компоненты, что у других виджетов (визуал идентичен):
  `WidgetAppearanceSettings`, `InfoSettings`, `AgreementAndPolicy`, `CustomRadioGroup`,
  `SwitchableField`, `CheckboxField`, `BorderedContainer`, `ColorPicker`, `IconPicker`, `Slider`.
- **Поля** хранятся в `widget.callback` (`CallbackExtra`): `launcher` { `icon` (из библиотеки
  `IconPicker`), `buttonColor`, `iconColor`, `borderRadius`, `notif{enabled,text,delaySec,color,
  textColor,icon,iconColor,sound}`, `position`, `text`, `shape`, `hidden`, `widgetSize`, `animation` },
  `delaySeconds`, `titleFontSize`, `contacts{phone,name}`, `deferredCall{enabled}`,
  `callScreen{textScheme,textColor,cancelEnabled,animation,animationColor}`,
  `call{callMode,managerType,managerAddress,managerName,clientLineNumber,…}`, `sms{…}`,
  `telegram{enabled,code}`,
  `schedule{enabled,timezone(выпадающий список),from,to,days,disableHolidays,noAutoOffHours}`.
- **Согласие/политика и Рекламная информация** — НЕ в `callback`, а в стандартных surface-ах
  `fields.agreement` / `fields.adsInfo` (общий компонент `AgreementAndPolicy`,
  `AgreementPoliciesField` + `AdsInfoField`, общие сеттеры `setAgreement` / `setAdsInfo`) — как у
  всех виджетов. Дефолты — в `buildCallbackFieldsSettings()`.
- **Рендер виджета по макетам:** форма и экран звонка одного размера (360×560); зелёное кольцо
  отсчёта на `requestAnimationFrame`; анимируются **только секунды** (ЧЧ:ММ статичны); экран
  «Заявка принята».
- **Сценарий лаунчера:** кнопка (иконка/крестик) → через `notif.delaySec` всплывает
  уведомление-приветствие НАД кнопкой → клик раскрывает форму над кнопкой (анимация
  раскрытия/закрытия через `framer-motion`); кнопка в открытом виде — крестик.
- **Отложенный звонок:** «Выбрать время для звонка» → поле даты/времени + «Готово» /
  «Позвонить сейчас» (возвращает кнопку) → подтверждение «Ожидайте звонка в указанное время».
- **Тестовый стенд** через реальную машинерию: `projects/client/src/__preview__/callback.tsx`
  + `projects/client/preview/callback.html` (как `EditWidgetPage`: tabsBar + `FieldsSettingsTab`
  + реальный `WidgetPreview`). Запуск: `pnpm --filter <client> start:dev` →
  `http://localhost:5173/preview/callback.html` (для сравнения: `?type=VIDEO_WIDGET`).

**Уточнения относительно первоначального макета:** окно раскрывается НАД кнопкой; кнопка-лаунчер
в открытом состоянии — крестик; таймер в формате ЧЧ:ММ:СС (20 сек → `00:00:20`); базовый цвет
лаунчера фиолетовый `#5B5BD6`, кольцо отсчёта зелёное `#16A34A`, кнопка отправки жёлтая `#F4B400`.

**Недостающее по макету — РЕАЛИЗОВАНО ✅** (добавлены поля `launcher`/`form`/`callScreen`/`call`/`sms`
в `CallbackExtra`, контролы в `CallbackWidgetSettings`, рендер в `CallbackWidget`/`CallbackLauncher`):
- *Настройка виджета (лаунчер):* текст кнопки, форма (Круг/Скругл./Квадрат), «скрыть» (глаз),
  размер виджета (слайдер), положение кнопки (3 варианта), анимация (тумблер).
- *Настройка формы:* формат окна (Боковая панель/Модальное), 4 цвета гаммы (цвет виджета,
  шрифт системного текста, цвет поля отсчёта, шрифт поля отсчёта); кнопка отправки — форма + скрыть.
- *Экран звонка:* пользовательский цвет текста; цвет анимации.
- *Настройка звонка:* «Тонкости соединения» — две строки (входящий у менеджера: «Номер компании»
  + номер; входящий у клиента: «Номер менеджера» + номер).
- *Уведомления менеджера:* «Обязательно» у каждого SMS-условия; полная инструкция Telegram + «Обновить».
- *Уведомление-бабл:* цвет фона/текста, иконка (встаёт сбоку от текста) + её цвет, звук при появлении
  (`notifSound`, `szvuk.mp3`), анимация первого всплытия (`framer-motion`).
- *Окно информации:* блок «Описание» и «Контент» убраны; в «Заголовке» — контрол размера шрифта
  (дефолт 25px).
- *Согласие/Рекламная информация:* переведены на стандартные `AgreementPoliciesField` / `AdsInfoField`
  (surface `fields.agreement` / `fields.adsInfo`) — визуал и поведение как у всех виджетов.
- *Настройка звонка → «Кто звонит клиенту»:* менеджер «из файла» (`managers.ts`, `MANAGERS`) —
  строка `[SIP/Телефон ▾] [адрес] [имя]`.
- *Экран звонка:* кнопка «Отменить» активна (возврат в форму); анимация ожидания «Круг ↔ Полоса».

**Готово (бэкенд Фаза 1):**
- `widget-config`: Zod-схема `Callback` зарегистрирована и собрана — `init` валидирует CALLBACK,
  консольный `Zod schema validation failed` уходит.
- Prisma: `CALLBACK` в `enum WidgetType` + миграция `20260611000000_add_widget_callback`
  (⚠️ применить к БД через `prisma migrate deploy`).
- api-sdk: `CALLBACK` в create/update DTO enum (source + dist).
- Боевой embed-runtime: `Callback/embedded/` + `case CALLBACK` в `embedManager.tsx`.

**Осталось (бэкенд Фаза 2 — телефония, отложено до ключей Mango):**
- Mango-сервер: `ProjectIntegration`, `ScheduledTask` + воркер, `mango.service/controller`,
  `POST /api/public/callback`, вебхуки `/api/mango/events` — см. разделы ниже.

---

## Спецификация редактора (по макету заказчика)

> Макет редактора виджета — источник истины по полям (целевой набор). Фактически реализованный
> в прототипе набор полей — см. «Статус реализации» выше. Часть launcher-опций (форма кнопки,
> скрыть, положение, размер) и format окна (боковая панель/модальное) пока не вынесены в редактор.
> Механика регистрации виджета (ниже) остаётся прежней, `CallbackWidgetType` расширен полем `callback`.

**1. Настройка виджета (свёрнутый лаунчер):**
- Кнопка: текст («Супер кнопка»), форма, скрыть, цвет.
- Уведомление-бабл: вкл/выкл (появляется через N секунд), текст, форма, скрыть, цвет фона.
- Скругление окна (px), размер виджета (px).
- Положение кнопки открытия: 3 варианта (left / center / right).
- Анимация: вкл/выкл.

**2. Настройка формы:**
- Формат окна: `боковая панель` | `модальное окно`.
- Скругление окна (px).
- Логотип: загрузка (≤1Mb, 120×70, png без фона).
- Цветовая гамма: `основная` | `пользовательское` → цвет виджета, шрифт системного текста,
  цвет поля отсчёта, шрифт поля отсчёта.
- Заголовок: текст + размер текста (px).
- **Значение таймера до звонка:** «В течение N секунд» (= `delaySeconds`).
- Кнопка отправки: текст («Жду звонка»), форма, скрыть, цвет.
- Контакты: `Телефон` (вкл + обязательность), `Инициалы` (вкл + обязательность).
- Согласие и политика: вкл/выкл, текст, URL согласия, URL политики (стандартный `AgreementPoliciesField`).
- Рекламная информация: вкл/выкл, текст-плашка, цвет текста, URL на политику получения рекламной
  информации (стандартный `AdsInfoField`, surface `fields.adsInfo`).

**3. Экран звонка (после отправки):**
- Цветовая гамма текста: `основная` | `пользовательское`.
- Кнопка «Отменить»: вкл/выкл (выкл → клиент не может отменить вызов).
- Анимация ожидания: `круг заполнения` | `полоса заполнения`.

**4. Настройка звонка (→ Mango, платная часть):**
- Телефоны приёма звонков от клиентов (список, с подписью контакта).
- Тонкости соединения: входящий номер у менеджера, входящий номер у клиента.
- Маппинг на Mango: extension/группа, `line_number` (АОН), `callMode` (см. раздел Mango).

**5. Уведомления менеджера:**
- SMS (платно): номер менеджера + условия — «не взял трубку», «заказ в нерабочее время»,
  «после успешного разговора» (каждое вкл + обязательность).
- Telegram: привязка через бота `@lemnity_callback_bot` + одноразовый код (личный/групповой чат).

**6. График работы:**
- Вкл/выкл (выкл → круглосуточно). Часовой пояс, рабочее время (с/до), дни недели,
  «отключить в праздничные дни», «не перезванивать автоматически в нерабочее время».

**7. Брендинг:** вкл/выкл (бизнес-тариф).

> Часть полей (SMS/Telegram/график/телефоны Mango) — серверная/интеграционная логика; в редакторе
> это настройки, значения которых (кроме секретов) идут в `config` виджета, а секреты/токены — в
> `ProjectIntegration` (см. раздел Mango).

## Этап 0 — визуальный прототип редактора (первый шаг)

Цель: согласовать внешний вид до интеграции в кодовую базу.
- Собрать standalone-прототип редактора (HTML + Tailwind, фирменный стиль lmntai) со всеми секциями
  выше: левая колонка — панель настроек как на макете; (опц.) правая — превью карточки виджета и
  экрана звонка с таймером.
- Отрендерить и сделать скриншот (Playwright / webapp-testing), показать заказчику.
- Итерации по виду → затем перенос в реальные компоненты `CallbackWidgetSettings` и расширение схемы.

## Точки интеграции

### Слой типов / enum
- `packages/database/prisma/schema/models/widgets.prisma` — добавить `CALLBACK` в `enum WidgetType`.
- Миграция Prisma по образцу `…/migrations/20260203060326_add_widget_announcement/migration.sql`:
  `ALTER TYPE "WidgetType" ADD VALUE 'CALLBACK';`
  (`pnpm --filter @lemnity/database prisma migrate dev --name add_widget_callback`).
- `packages/api-sdk/models/widget.ts` — `WidgetTypeEnum.CALLBACK: 'CALLBACK'`.
- `packages/api-sdk/models/create-widget-dto.ts` — `CreateWidgetDtoTypeEnum.CALLBACK`
  (и `update-widget-dto.ts`, если там есть аналогичный enum).
- ⚠️ api-sdk потребляется из `dist/` → после правок моделей пересобрать
  `pnpm --filter @lemnity/api-sdk build`. Предпочтительно — `pnpm generate:api`
  (`scripts/generate-api.sh`); при недоступности генерации значения добавить вручную в `models/*`
  и в соответствующие `dist/models/*.{js,d.ts}`.

### Пакет `@lemnity/widget-config`
Скопировать `src/widgets/Announcement/` → `src/widgets/Callback/`:
- `schema.ts` — `const WidgetType = 'CALLBACK'`, тип `CallbackWidgetType`, экспорт
  `callbackSchema = buildWidgetSettingsSchema('CALLBACK', CallbackWidgetSchema, customSurfaces)`.
  Структура полей сохраняется от «Анонса» (`appearence`, `infoSettings`, `rewardMessageSettings`,
  `mobileSettings`, `brandingEnabled`): `infoSettings.title/description` — тексты над формой,
  `infoSettings.buttonText` — подпись кнопки отправки, `rewardMessageSettings` — экран «спасибо».
- `canonicalize.ts` — `canonicalizeCallback` (pass-through).
- `src/widgets/base.ts` — добавить `'CALLBACK'` в union `WidgetTypeId`.
- `src/widgets/index.ts` — импорт `callbackSchema` + адаптер `{ type: 'CALLBACK', schema: callbackSchema }`.
- `src/canonicalize.ts` — импорт `canonicalizeCallback` + ключ `CALLBACK: canonicalizeCallback`.
- `package.json` — экспорт `./widgets/callback` → `dist/widgets/Callback/schema.{d.ts,js}`.
- Пересобрать пакет: `pnpm --filter @lemnity/widget-config build` (нужен `dist` для импорта в клиенте).

### Клиент — `projects/client/src/layouts/Widgets/Callback/`
Скопировать папку `Announcement/` → `Callback/`, переименовать символы `Announcement→Callback`,
импорт схемы → `@lemnity/widget-config/widgets/callback`, `WidgetTypeEnum.ANNOUNCEMENT → .CALLBACK`:
- `defaults.ts` — `callbackWidgetDefaults` (type `CALLBACK`, тексты под звонок: заголовок
  «Заказать обратный звонок», описание, `buttonText` «Жду звонка», reward-экран «Спасибо, мы
  перезвоним») + `buildCallbackWidgetSettings/FieldsSettings/DisplaySettings/IntegrationSettings`.
- `actions.ts` — `createCallbackActions` + `setCallback*` (механическое переименование).
- `metadata.ts` — `callbackWidgetMetadata` (lazy-импорты на локальные файлы папки).
- `embedded/{index.ts,embedRuntime.tsx,MobileContext/**}`, `Widget.tsx`, `CallbackWidget.tsx`,
  `*FloatingPreview.tsx`, `WidgetPreview.tsx`, `*Preview.tsx`, `CallbackWidgetSettings.tsx`,
  `utils/` — переименованные копии.

### Регистрация в клиентских реестрах
- `layouts/Widgets/constants.ts` — `CALLBACK: WidgetTypeEnum.CALLBACK` в `WidgetTypes`; запись в
  `AVAILABLE_WIDGETS`: `{ type: WidgetTypes.CALLBACK, title: 'Обратный звонок',
  description: 'Лиды, вовлечение, вознаграждение', isAvailable: true, badge: 'new' }`.
- `layouts/Widgets/registry.ts` — импорт `callbackWidgetMetadata`, ключ
  `[WidgetTypeEnum.CALLBACK]: callbackWidgetMetadata`.
- `stores/widgetSettings/widgetDefinitions.ts` — импорт `buildCallback*`, запись в
  `implementedWidgetDefinitions[WidgetTypeEnum.CALLBACK]` с
  `settingsSurfaces: { fields: 'custom', display: 'custom' }` (как у `ANNOUNCEMENT`).
- `stores/widgetSettings/widgetSlice.ts` — импорт `createCallbackActions`, `callbackUpdater`,
  спред `...createCallbackActions(callbackUpdater)`.
- `layouts/WidgetPreview/WidgetPreviewLayout/WidgetPreviewLayout.tsx:47` — добавить
  `|| widgetType === WidgetTypeEnum.CALLBACK` (поведение превью как у «Анонса», launcher `inline`).
- `components/settings/InfoSettings/InfoSettings.tsx` — компонент завязан на
  `widgetType === 'ANNOUNCEMENT'` (`isAnnouncement`) и тип `AnnouncementWidgetType`. Если
  `CallbackWidgetSettings` переиспользует `InfoSettings` — расширить проверку до
  `isAnnouncement || isCallback` и принять `CallbackWidgetType`. Предпочтительно (изоляция):
  оставить в `CallbackWidgetSettings` собственную упрощённую панель текстов без variant-флагов.

---

## Базовая форма обратного звонка

> Реализовано в прототипе иначе: отдельные `CallbackWidget.tsx` + `CallbackForm.tsx` (не variant
> «Анонса»), маска телефона `react-number-format`, отправка через `sendPublicRequest` уже
> подключена в `CallbackWidget`. Раздел ниже описывает оставшуюся часть — **embedded-runtime для
> боевого embed-скрипта** на сайте клиента (свёрнутый виджет + события), которого ещё нет.

Заменить контентную кнопку «Анонса» на форму (variant `'callback'`), переиспользуя паттерны
`Common/DynamicFieldsForm/DynamicFieldsForm.tsx`:
- **Имя** (опц., только буквы) + **Телефон** (обяз.) — маска `react-number-format`
  `+7 (###) ###-##-##`, zod-валидация `^\+\d{11,}$`. Кнопка отправки — текст из
  `infoSettings.buttonText`.
- `embedded/embedRuntime.tsx`: на сабмит вызвать
  `sendPublicRequest({ widgetId, fullName, phone, url: location.href,
  referrer: document.referrer, userAgent: navigator.userAgent })`
  (образец — `CountDown/embedRuntime.tsx:132`). При `rewardScreenEnabled` переключить variant на
  экран «Спасибо, мы перезвоним» (`RewardScreen`), иначе показать инлайн-благодарность.
- Аналитика: события `callback.open` / `callback.close` / `callback.submit` через `sendEvent`
  (строки произвольные, бэкенд хранит как есть — сервер не меняется).

---

## Интеграция с Mango Office (телефония)

Звонок инициируется через **Server API Mango Office** (ВАТС). Виджет сам звонок не делает —
секреты и вызов живут на бэкенде.

### Согласованный план реализации Фазы 2 (брейншторм 2026-06-11)

**Зафиксированные решения:**
- **Аренда — гибрид.** По умолчанию звонки через НАШ аккаунт Mango (креды в `projects/server/.env`:
  `MANGO_VPBX_API_KEY` = «Уникальный код вашей АТС», `MANGO_VPBX_API_SALT` = «Ключ для создания
  подписи»). Продвинутый клиент может подключить свою АТС (BYO) — через `ProjectIntegration`.
  Реализуется **`MangoConfigResolver`**: креды/настройки проекта = `ProjectIntegration` если есть,
  иначе глобальный env. Одна абстракция, две ветки.
- **Отложенный звонок — Postgres-воркер** (`ScheduledTask` + `@nestjs/schedule @Interval ~5с`).
  Переживает рестарт, ретраи, идемпотентность. (setTimeout теряет задачи; «сразу» выкидывает таймер-UX.)
- **Режим звонка MVP — «менеджер»**: Mango набирает настроенный номер менеджера/бизнеса, затем
  посетителя. Робот/IVR — позже (нужна настройка IVR в кабинете Mango).
- **Звонок отделён от планировщика:** `MangoService.initCall()` — чистый вызов API (тестируется
  отдельно); воркер лишь дёргает его по `executeAt`.

**Стейдж 1 — «реальный звонок работает» (наш аккаунт) — ✅ РЕАЛИЗОВАНО (TDD):**
> Проверка: server `jest` 61 тест зелёный (9 suite, +20 на Mango/callback), `tsc` 0 ошибок,
> `nest build` ok, миграция `20260611180000_add_scheduled_task_mango` применена. E2E на живом
> сервере+БД: `POST /api/public/callback` → `{delaySeconds}`, создан Request(`mango_command_id`) +
> ScheduledTask; воркер забрал задачу, инициировал звонок (в тесте — dummy-endpoint, реальный
> звонок не размещался), при ошибке — ретраи до `failed/3`. Файлы: `server/src/mango/*`
> (`mango-protocol`, `mango-config`, `mango.service`, `mango-scheduler.service`, `mango.module`),
> `server/src/request/{callback.service,public-callback.controller}.ts`,
> `client/.../publicApi.ts` (`sendCallbackRequest`) + `CallbackWidget` (сабмит → /callback).
1. Prisma `ScheduledTask{ type:'mango_call', payload, executeAt, status, retries, lastError }`
   (+ `mangoCommandId` на `Request`).
2. `MangoConfigResolver` (пока env-ветка).
3. `MangoService.initCall(config, request)` — json + `sign=sha256(key+json+salt)` + POST
   `/vpbx/commands/callback`, разбор кода `1000` (нативный `fetch`, как `collector.service`).
4. Воркер `@Interval(~5с)`: `pending & executeAt<=now` → `initCall` → `success/failed` + ретраи.
5. `POST /api/public/callback` — origin-check (из `request.service`), создаёт `Request` +
   `ScheduledTask(now+delaySeconds)`, возвращает `{delaySeconds}`.
6. Сабмит формы виджета (embed-runtime Callback) → `/api/public/callback`.
   Тест: `delaySeconds=10`, свой телефон как «клиент» → реальный звонок, код `1000`.

**Стейдж 2 — гибрид + статусы — ✅ РЕАЛИЗОВАНО (TDD):**
> Проверка: server `jest` 86 тест зелёный (13 suite), `tsc` 0, `nest build` ok, миграции
> `add_project_integration` + `add_request_call_outcome` применены. E2E: `POST /api/mango/events`
> (summary `talk_time=42`+recording) → `Request` стал `used`, `call_duration_sec=42`,
> `call_recording_url` проставлен; повтор идемпотентен; чужой `command_id` — мягкий 200.
> Шифрование BYO-секретов — round-trip + tamper-тесты. Файлы: `server/src/mango/`
> (`secret-cipher` в `common/crypto`, `mango-integration.service/controller`, `mango-events(.service/.controller)`),
> hybrid-резолюция в `mango-scheduler.service`.
7. Prisma `ProjectIntegration{ projectId, type, apiKeyEnc, apiSaltEnc (AES-256-GCM), managerType/
   managerAddress, lineNumber, callMode, delaySeconds, enabled, @@unique([projectId,type]) }` +
   резолвер-оверрайд в воркере (BYO приоритетнее env) + ЛК-эндпоинты `GET/POST
   /api/projects/:projectId/mango-integration` (authed, секреты не возвращаются). Ключ шифрования —
   `INTEGRATION_ENC_KEY`.
8. `POST /api/mango/events` — вебхук `summary` (form-поле `json`, IP-allowlist Mango / dev-bypass /
   `MANGO_WEBHOOK_SKIP_IP_CHECK`, мягкий 200, идемпотентность по `command_id`) → обновляет `Request`
   (`used`/`not_processed`, `call_duration_sec`, `call_recording_url`).
   ⚠️ На localhost вебхуки Mango не доходят — боевая форма событий и подпись BYO-аккаунтов
   проверяются после деплоя/через туннель (парсер защитный, обрабатывает `summary`).

**YAGNI сейчас:** робот/IVR, авто-рекуррент, `callback_group` (мультигруппы).

### Контракт API
- **Endpoint (один менеджер):** `POST https://app.mango-office.ru/vpbx/commands/callback`
- **Endpoint (группа менеджеров):** `POST https://app.mango-office.ru/vpbx/commands/callback_group`
- **Тело запроса — три form-поля:** `vpbx_api_key`, `json`, `sign`,
  где `sign = sha256(api_key + json + api_salt)` (ключ и соль выдаются в ЛК lk.mango-office.ru).
- **JSON команды `callback`:**
  `{ command_id, from: { extension, number? }, to_number, line_number? }`
  — `from.extension` = внутренний номер сотрудника (менеджер/робот), `to_number` = телефон клиента,
  `line_number` = номер АОН (который увидит клиент).
- **JSON команды `callback_group`:** `{ command_id, from, to, line_number }` (`from` = номер группы,
  `to` = клиент).
- **Порядок дозвона:** Mango сначала набирает **оператора** (`from`/группу/робота), затем —
  **клиента** (`to_number`/`to`) и соединяет их. Успешный приём команды → код `1000`
  (асинхронно; сам звонок происходит позже).
- **«Робот» vs «Менеджер»:** API не передаёт речь робота. Робот = `from.extension` указывает на
  **IVR/голосовое приветствие**, настроенное в кабинете Mango; менеджер = extension/группа живого
  сотрудника. В виджете это поле `callMode: 'manager' | 'robot'`, маппится на нужный extension/группу.
- **Вебхуки статуса:** Mango шлёт POST-события (`call` — стадии звонка, `summary` — итог: длительность,
  направление, запись; `recording`) на сконфигурированный URL. IP источников:
  `81.88.80.132/133`, `81.88.82.36`.

### Переиспользуемая инфраструктура (из анализа сервера)
- HTTP к внешним API — паттерн `fetch`/`axios` + `ConfigService` (см. `collector.service.ts`,
  `mailer/notisend.service.ts`).
- Входящие вебхуки — готовый паттерн с `rawBody: true` (`main.ts`), HMAC-проверкой и
  идемпотентностью (`lemnity/lemnity.controller.ts` + `lemnity.service.ts`, эндпоинт
  `/api/lemnity/widget-subscription`).
- Origin-проверка публичных запросов — `request.service.ts` (`websiteUrl` проекта).

### Чего в репозитории НЕТ (нужно добавить)
- **Хранилище секретов per-project.** Модель `Project` (`…/models/projects.prisma`) не имеет места
  для интеграций. Добавить таблицу `ProjectIntegration { projectId, type: 'mango_office',
  apiKey, apiSalt (шифровать), config: Json (extension/group, lineNumber, callMode, delaySeconds),
  enabled, @@unique([projectId, type]) }`. **Секреты НЕ кладём в widget `config`** — он публично
  отдаётся через `GET /api/public/widgets/:id`.
- **Отложенный запуск через N секунд.** Нет `@nestjs/schedule`/bull. MVP: таблица `ScheduledTask
  { type:'mango_call', payload, executeAt, status, retries }` + polling-воркер (раз в ~5–10 c
  берёт `executeAt <= now() & status='pending'`). Альтернатива — delayed-exchange в
  `rabbitmq-gateway` (`x-delay`), но требует плагина; для MVP выбираем Postgres-воркер.

---

## Сценарий «телефон → таймер → звонок»

```
[Посетитель сайта]            [Виджет CALLBACK]         [Сервер lemnity]          [Mango Office]
       │                            │                         │                        │
       │ 1. вводит имя+телефон      │                         │                        │
       │ ─────────────────────────►│                         │                        │
       │                            │ 2. POST /api/public/    │                        │
       │                            │    callback {widgetId,  │                        │
       │                            │    phone, name, url…}   │                        │
       │                            │ ───────────────────────►│                        │
       │                            │                         │ 3. origin-check,       │
       │                            │                         │    создать Request     │
       │                            │                         │    (status=new)        │
       │                            │                         │ 4. ScheduledTask       │
       │                            │                         │    executeAt = now +    │
       │                            │   5. 200 {delaySeconds} │    delaySeconds        │
       │                            │ ◄───────────────────────│                        │
       │ 6. экран «Перезвоним       │                         │                        │
       │    через 0:30» (отсчёт)    │                         │                        │
       │ ◄──────────────────────────│                        │                        │
       │                            │              ⏲ delaySeconds истекли (воркер)     │
       │                            │                         │ 7. собрать json,       │
       │                            │                         │    sign=sha256(key+    │
       │                            │                         │    json+salt)          │
       │                            │                         │ 8. POST /vpbx/commands/│
       │                            │                         │    callback(_group)    │
       │                            │                         │ ──────────────────────►│
       │                            │                         │ ◄─ код 1000 (принято) ─│
       │                            │                         │                        │
       │           9. Mango звонит оператору/роботу (from), затем КЛИЕНТУ (to_number)  │
       │ ◄──────────────────────────────────────────────────────────────────────────│
       │           10. разговор клиента с менеджером/роботом                          │
       │                            │                         │ 11. вебхуки call/      │
       │                            │                         │     summary ──────────►│ (от Mango)
       │                            │                         │ ◄──────────────────────│
       │                            │                         │ 12. обновить Request:  │
       │                            │                         │     status, длит-сть,  │
       │                            │                         │     ссылка на запись   │
```

**Словами:**
1. Посетитель вводит имя и телефон в виджете и жмёт «Жду звонка».
2–3. Виджет шлёт `POST /api/public/callback`; сервер проверяет origin/enabled и создаёт `Request`
     (как обычная заявка, `status=new`).
4–5. Сервер создаёт `ScheduledTask` на время `now + delaySeconds` (значение из `ProjectIntegration`/
     настроек виджета) и возвращает `delaySeconds` виджету.
6. Виджет показывает обратный отсчёт («Перезвоним через 0:30») — UX-таймер на ту же длительность.
7–8. По истечении таймера polling-воркер берёт задачу, формирует `json`, считает `sign` и шлёт
     команду в Mango (`callback` для менеджера / `callback_group` для группы; `callMode='robot'` →
     extension робота-IVR).
9–10. Mango дозванивается оператору/роботу, затем клиенту и соединяет их.
11–12. Mango присылает вебхуки `call`/`summary` на `/api/mango/events`; сервер сопоставляет по
     `command_id`, обновляет `Request` (статус `processed`/`used`, длительность, ссылка на запись).

### Серверные компоненты (новые)
- `projects/server/src/mango/mango.service.ts` — `initCall(integration, request)`: сборка json,
  подпись, `fetch` POST к Mango; разбор кода ответа.
- `…/mango/mango.controller.ts` — `POST /api/mango/events` (вебхуки `call`/`summary`/`recording`),
  по образцу `lemnity.controller.ts` (rawBody, мягкий 200, идемпотентность по `command_id`/`call_id`).
- `…/scheduler/scheduled-task.worker.ts` — polling-воркер задач `mango_call` (с ретраями).
- `…/request/public-callback.controller.ts` (или расширить `public-request.controller.ts`) —
  `POST /api/public/callback`: создаёт `Request` + `ScheduledTask`.
- Prisma: модели `ProjectIntegration`, `ScheduledTask`; связи к `Project`/`Request`; поле для
  `mangoCommandId` на `Request` (или в payload задачи) для сопоставления вебхуков.
- ЛК-эндпоинты (auth) для сохранения настроек Mango в `ProjectIntegration` (ключ/соль/extension/
  группа/АОН/callMode/delaySeconds) — UI на вкладке «Интеграция» виджета.

### Настройки виджета (вкладка «Интеграция»)
- `callMode`: «Менеджер» | «Робот».
- Внутренний номер сотрудника `extension` **или** номер группы (для `callback_group`).
- `lineNumber` (АОН, который увидит клиент).
- `delaySeconds` (таймер до звонка; 0 = сразу).
- Поля ключа/соли Mango — пишутся в защищённый эндпоинт (в `ProjectIntegration`), **не** в config JSON.

### Безопасность
- `vpbx_api_key` и `api_salt` — только на сервере (`ProjectIntegration`, желательно шифрование);
  никогда не в публичном `config` виджета.
- Вебхуки Mango: проверять источник (IP allowlist Mango / подпись, если включена) + идемпотентность
  по `command_id`.
- Публичный `/api/public/callback`: та же origin-проверка против `project.websiteUrl`, что и у
  `/api/public/requests`; анти-абуз (rate-limit по IP/телефону), чтобы не инициировать спам-звонки.

---

## Монетизация: модель «Базовая подписка + модули» (энфорсмент в этом репо)

> **Граница ответственности.** Биллинг (страница тарифов, конструктор, расчёт стоимости,
> **Точка Банк**, выставление счетов, модель подписки как источник истины) живёт во **внешнем
> репозитории `github/lmntai` (lemnity.ru)** — здесь его НЕ дублируем и НЕ переписываем. В этом
> монорепо (server+client) реализуется только **энфорсмент**: применение состава подписки к
> функциям и лимитам. Источник истины о подписке — lmntai; сюда он приходит через существующий
> вебхук `/api/lemnity/widget-subscription` (HMAC `WIDGETS_HANDOFF_SECRET`, идемпотентность по
> `paymentId`). Подтверждено аудитом: в этом репо нет страницы тарифов, Точка Банк, моделей
> Subscription/Plan, лимитов и feature-access — только поля `Widget.paidUntil/lemnityUserId/
> lastPaymentId`.

### Продуктовая модель (справочник; цены/состав задаются в lmntai)
- **Базовый тариф «Callback Widget» — 990 ₽/мес:** 1 сайт, MANGO, callback-виджет, базовая
  аналитика, 500 заявок/мес.
- **Модули:** `telegram` 290 · `webhooks` 490 · `ab_testing` 690 · `white_label` 1490 ·
  `api_access` 1490 · `extra_site` 190/шт · `extra_callbacks` 490 за пакет 1000 заявок.
- **Лимиты:** сайтов = 1 + Σ`extra_site`; заявок/мес = 500 + 1000·`extra_callbacks`.

### В `lmntai` (вне этого плана)
- Конструктор тарифа (чекбоксы/переключатели, ± для `extra_site`/`extra_callbacks`), пересчёт суммы
  в реальном времени, формирование счёта **Точка Банк**, подписка как источник истины.
- При оплате/изменении конфигурации — слать в этот сервис расширенный payload вебхука (см. ниже).

### В этом репо = app.lemnity.ru (энфорсмент = «Фаза B», предмет плана)
> **Контракт зафиксирован — Фаза А в lmntai ГОТОВА (2026-06-11).** Подписка Callback —
> **аккаунтная (ключ `userId`, резолв по `email` через SSO)**, отдельная сущность от per-widget
> `widget_subscription`. Источники контракта в lmntai: `lib/widgets-entitlement.ts` (write),
> `lib/widgets-app-client.ts` (read), `lib/callback-subscription.ts` (модули/цены/лимиты).
> lmntai уже умеет фолбэк на локальный снимок, пока наши эндпоинты не отвечают, — жёсткой блокировки нет.

1. **Хранилище entitlement (аккаунтное).** Новая Prisma-модель `CallbackSubscription` (ключ
   `userId` unique): `modules[]`, `extraSite`, `extraCallbacks`, `siteLimit`, `callbackLimit`,
   `paidUntil`, `lastPaymentId`. Зеркало присланного lmntai — не новый биллинг.
2. **Write-вебхук** `POST /api/lemnity/callback-subscription` (`server/src/lemnity/`): тело
   `{ type:'callback_subscription', userId, modules[], extraSite, extraCallbacks, siteLimit,
   callbackLimit, months, paymentId? }`; подпись `x-lemnity-signature` = HMAC(body) общим
   `WIDGETS_HANDOFF_SECRET`. Апсёрт по `userId` (линк к локальному `User` по email), идемпотентность
   по `paymentId`, `paidUntil = max(now, paidUntil) + months·30д`. Мягкий 200 (как у widget-subscription).
3. **Read-эндпоинт** `GET /api/lemnity/callback-subscription?email=<email>` (подпись HMAC(email)):
   вернуть `{ active, modules[], extraSite, extraCallbacks, siteLimit, callbackLimit, paidUntil,
   sitesUsed, callbacksUsed }`. `sitesUsed` = число проектов аккаунта; `callbacksUsed` = заявки за
   текущий **календарный месяц**. lmntai тянет это для блока ЛК/дашборда (его сторона готова).
4. **`FeatureAccessService`** (централизованно): `canAccess(userId, 'telegram'|'webhooks'|'ab_testing'
   |'white_label'|'api_access')`, `siteLimit(userId)`, `callbackLimit(userId)` — читает
   `CallbackSubscription`. Проверки **по доступности функции**, НЕ по имени тарифа. Обобщить
   существующий `ADMIN_ONLY_WIDGET_TYPES` / `isAdminUser` (`server/src/common/admin.ts`).
5. **Энфорсмент лимитов:**
   - Сайты: при создании проекта (`server/src/project/project.service.ts`) — `count(projects) <= siteLimit`.
   - Заявки: при `POST /api/public/requests` (`server/src/request/request.service.ts`) — считать
     заявки аккаунта за текущий календарный месяц, проверять `<= callbackLimit`; при превышении —
     4xx + понятное сообщение клиенту в виджете.

### Реализовано — Фаза B (app, ГОТОВО, TDD)
> Проверка: `jest` 41 тест зелёный (4 suite), server `src` `tsc --noEmit` 0 ошибок, `nest build` ok,
> `prisma validate` ok. **Миграции применены** к локальной dev-БД `lemnity_app` (Homebrew PG):
> `migrate status` = up to date, в enum есть `CALLBACK`, таблица `callback_subscriptions` и
> `users.lemnity_user_id` созданы. ⚠️ На прод/иную БД — отдельный `prisma migrate deploy`.

- **Prisma:** модель `CallbackSubscription` (ключ `lemnityUserId`) + `User.lemnityUserId @unique`;
  миграция `20260611170000_add_callback_subscription`. Файлы: `packages/database/prisma/schema/
  models/{callback_subscriptions,users}.prisma`.
- **Доменная логика (чистая, без БД):** `server/src/lemnity/callback-entitlement.ts`
  (`extendPaidUntil`, `isSubscriptionActive`, `canUseModule`, `isWithinSite/CallbackLimit`).
- **Сервис:** `callback-subscription.service.ts` — `apply` (апсёрт по `lemnityUserId`, идемпотентность
  по `paymentId`, продление `paidUntil`), `getByEmail` (подписка + usage: `sitesUsed`=проекты,
  `callbacksUsed`=CALLBACK-заявки за календарный месяц), `getActiveEntitlementByUserId`,
  `parseCallbackSubscriptionPayload`.
- **Эндпоинты** (`lemnity.controller.ts`): `POST /api/lemnity/callback-subscription` (вебхук,
  мягкий 200), `GET /api/lemnity/callback-subscription?email=` (подписка+usage). SSO
  (`ticket-exchange`) теперь сохраняет `lemnityUserId` на `User` (`auth.service.loginViaLemnity`).
- **`FeatureAccessService`** (`feature-access.service.ts`): `canUseCallbackModule`,
  `assertCanCreateSite` (лимит сайтов при создании проекта — `project.service.create`),
  `assertCanAcceptCallback` (месячный лимит CALLBACK-заявок в `request.service.createPublic`).
  Энфорсмент — **no-op без активной подписки** (текущее поведение сохраняется).
- **Модули:** `LemnityModule` экспортит сервисы; `ProjectModule`/`RequestModule` импортят его.

### Зафиксировано Фазой А (контракт — больше не открыто)
- **Гранулярность — аккаунтная (`userId`/`email`)**, НЕ per-widget. (Снимает прежнее допущение.)
- Форма payload write/read — пп. 2–3 выше; имена модулей канонические:
  `telegram/webhooks/ab_testing/white_label/api_access` + `extra_site/extra_callbacks`.
- «Сайт» = `Project`; лимит заявок — по **календарному месяцу**.
- Цены/расчёт суммы/счёт Точка — целиком в lmntai (`lib/callback-subscription.ts`), app их не считает.

### Осталось открытым / прод-задачи
- **Применить миграцию** `20260611170000_add_callback_subscription` к БД (`prisma migrate deploy`).
- E2E с живым lmntai: реальный вебхук `callback_subscription` (подпись `WIDGETS_HANDOFF_SECRET`) →
  апсёрт; `GET ?email=` отдаёт usage; лимит сайта/заявок реально срабатывает. Линковка
  `lemnityUserId↔email` **реализована** (сохраняется при SSO `ticket-exchange`); требует проверки на
  юзере, который оплатил ДО первого SSO-входа (тогда read-by-email вернёт inactive до первого входа —
  у lmntai есть фолбэк).
- Энфорсмент модулей `telegram`/MANGO завязан на Фазу 2 (телефония): до неё entitlement храним и
  отдаём, но фактический телеграм/звонки включаются с Фазой 2.
- Политика «no-op без активной подписки» выбрана осознанно (не ломать текущих юзеров без подписки);
  при желании ужесточить — отдельное решение.

### Анти-требования (из ТЗ — соблюдаем)
- Не строить новый биллинг, не дублировать lmntai, не трогать Точка Банк / процесс оплаты.
- Никаких новых платёжных провайдеров / `MockBillingProvider`.
- Запрещены проверки `if (plan === 'Business'/'Pro'/'Premium')` — только feature-access.

---

## Вкладка «Звонки» + менеджеры — ✅ РЕАЛИЗОВАНО (TDD, e2e)

> При включённом CALLBACK-виджете в сайдбаре появляется вкладка «Звонки» (как «Заявки»): список
> звонков, прослушивание записи, сводка по менеджерам, управление менеджерами. Звонки = `Request`
> CALLBACK-виджета (новой таблицы нет). Проверка: server `jest` **105 тест** (17 suite), `tsc` 0,
> `nest build` ok, client `tsc` 0; e2e на живом сервере+БД (менеджеры authed, round-robin
> Борис→Алиса, `GET /api/calls` total+summary по менеджерам).

- **Prisma:** модель `Manager` (per-project) + `Request.managerId/managerName/managerAddress/managerType`
  (денормализация); миграция `20260612000000_add_managers`.
- **Менеджеры (CRUD):** `server/src/manager/*` — `ManagerService` (owner-check),
  `GET/POST/PATCH/DELETE /api/projects/:projectId/managers`, `listEnabledForProject` (для round-robin).
- **Round-robin:** `manager/manager-rotation.ts` (`pickManager`) + `CallbackService` назначает менеджера
  по счётчику заявок проекта, пишет на `Request` и в payload звонка (адрес оператора). Без менеджеров —
  поведение из конфига виджета.
- **Звонки:** `server/src/call/*` — `CallService.list` (фильтр `widget.type=CALLBACK`, owner-scope),
  чистый `call-summary.ts` (сводка по менеджерам: count/avgDuration/answeredRate), `GET /api/calls`,
  `GET /api/calls/:id/recording` (прокси: redirect-if-URL, иначе `MangoService.fetchRecording` —
  ⚠️ TODO боевой Mango). Воркер/события — без изменений.
- **Клиент:** вкладка «Звонки» в `NavigationSidebar` (гейтинг по включённому CALLBACK), `/calls` роут,
  `pages/CallsPage/*` (клон «Заявок» + панель сводки + инлайн-панель «Менеджеры»), `services/{calls,
  managers}.ts`, проигрывание записи через blob (Bearer).

## Проверка (verification)

1. **БД/SDK:** `pnpm --filter @lemnity/database prisma migrate dev`; `grep CALLBACK
   packages/api-sdk/models/widget.ts`; пересобрать api-sdk.
2. **Пакет:** `pnpm --filter @lemnity/widget-config build` → есть `dist/widgets/Callback/schema.js`;
   импорт `@lemnity/widget-config/widgets/callback` резолвится.
3. **Типы клиента:** `pnpm --filter <client> tsc --noEmit` без ошибок.
4. **E2E вручную:** `pnpm dev` → создать виджет, в списке есть «Обратный звонок»; в редакторе
   рендерится превью; ввести телефон и отправить форму.
5. **Заявка сохранилась:** список заявок проекта (`GET /api/requests?projectId=…`) или запись в
   таблице `Request` с заполненными `phone`/`full_name` и `widgetId` нового виджета.
6. **Звонок Mango (sandbox/боевой):** настроить `ProjectIntegration` (ключ/соль/extension/АОН),
   `delaySeconds` напр. 15; отправить форму → через 15 c приходит реальный звонок на указанный
   телефон, сначала оператору/роботу, затем клиенту. Команда вернула код `1000`.
7. **Вебхуки статуса:** после звонка `POST /api/mango/events` обновил `Request` (статус, длительность,
   ссылка на запись); повторная доставка того же события не дублирует обновление (идемпотентность).
8. **Таймер/воркер:** `ScheduledTask` перешла `pending → success`; при ошибке Mango — ретраи и
   статус `failed` с сообщением.

---

## Сводка затронутых файлов

**Создано (готово):**
- `projects/client/src/layouts/Widgets/Callback/{defaults,actions,metadata}.ts`,
  `{CallbackWidget,CallbackForm,CallbackLauncher,CallbackFloatingPreview,WidgetPreview,
  CallbackWidgetSettings}.tsx`
- Тестовый стенд: `projects/client/src/__preview__/callback.tsx`, `projects/client/preview/callback.html`

**Изменено (готово):**
- `packages/api-sdk/models/widget.ts` + `dist/models/widget.{js,d.ts}` (enum `CALLBACK`)
- `projects/client/src/layouts/Widgets/{constants.ts,registry.ts}`
- `projects/client/src/stores/widgetSettings/{widgetDefinitions.ts,widgetSlice.ts}`,
  `widgetSettings/widgetActions/types.ts` (`setCallbackPatch`)
- `projects/client/src/layouts/WidgetPreview/WidgetPreviewLayout/WidgetPreviewLayout.tsx` (CALLBACK)
- `projects/client/src/components/settings/InfoSettings/InfoSettings.tsx` (`isAnnouncement` ⊇ CALLBACK)

**Создано/изменено — Фаза 1 (готово):**
- `packages/widget-config/src/widgets/Callback/{schema,canonicalize}.ts` + `base.ts`/`index.ts`/
  `canonicalize.ts`/`package.json` (валидация и сохранение)
- `packages/database/prisma/schema/models/widgets.prisma` + миграция
  `20260611000000_add_widget_callback` (⚠️ применить к БД)
- `packages/api-sdk/models/{create,update}-widget-dto.ts` + `dist` (enum `CALLBACK`)
- `projects/client/src/layouts/Widgets/Callback/embedded/{embedRuntime.tsx,index.ts}` +
  `packages/embed-script/src/embed/embedManager.tsx` (`case CALLBACK`)
- Чинка типов прототипа: `Callback/actions.ts` (updater → `CallbackWidgetType`, reset из defaults),
  `Callback/CallbackWidgetSettings.tsx` (убраны неиспользуемые переменные)

**Осталось создать/изменить — Фаза 2 (телефония Mango, отложено):**
- Mango/телефония: `projects/server/src/mango/{mango.module,mango.service,mango.controller}.ts`,
  `projects/server/src/scheduler/scheduled-task.worker.ts`,
  `projects/server/src/request/public-callback.controller.ts`
- Prisma модели `ProjectIntegration`, `ScheduledTask` + миграции; ЛК-эндпоинты настроек Mango

**⚠️ Пред­существующие пробелы (вне Callback — решить отдельно):** `VIDEO_WIDGET` есть в
`enum WidgetType`, но без миграции — при `migrate dev` Prisma подхватит и его; `update-widget-dto`
не содержал `VIDEO_WIDGET`; `test/app.e2e-spec.ts:21` — ошибка типов supertest.

---

## Движок телефонии: Mango → Voximplant (обновление 2026-06-11)

> Этот раздел фиксирует итоги боевого тестирования виджета на `app.lemnity.ru`, найденную
> фундаментальную причину «звонка не было», и **решение перевести движок звонков с Mango на
> Voximplant**. Раздел самодостаточен — его достаточно прочитать, чтобы понять текущее состояние
> и что осталось сделать.

### 1. Что уже задеплоено на прод (работает)

- **Виджет «Обратный звонок»** — сохраняется, рендерится, форма захватывает лид (`Request`).
- **Вкладка «Звонки»** — появляется при включённом CALLBACK; список звонков, сводка по менеджерам,
  CRUD менеджеров (round-robin распределение).
- **Телефония Mango (Stage 1 — env-аккаунт, Stage 2 — BYO ProjectIntegration + вебхуки статусов)** —
  код реализован (TDD, e2e на локальном `lemnity_app`), задеплоен. Подпись/креды Mango подтверждены
  боевым прямым вызовом (см. ниже).
- **Энфорсмент подписки (Фаза B)** — учёт лимита звонков по аккаунту/месяцу.

### 2. Итоги боевого тестирования (3 бага — все разобраны)

| # | Симптом | Root cause | Фикс |
|---|---------|-----------|------|
| 1 | Заполнил форму — **звонка не было** | Дефолтный менеджер виджета был **фейковой заглушкой** `sip1@pbx123.mangosip.ru`. Прямой подписанный вызов Mango с `from.extension:"100"` вернул **`result: 3330`** = «сотрудник/номер не найден в ВАТС». Это **доказало**, что креды и подпись ВАЛИДНЫ, а проблема — в несуществующем операторе. | Убраны фейковые заглушки (`managers.ts` → только типы; `defaults.ts` → пустой `managerAddress`). Коммит `5eb286d`. Пользователь должен ввести **реальный** extension ИЛИ добавить реального менеджера. |
| 2 | Виджет **обрезается** на живом сайте | Клип интерактивной зоны embed-iframe (кнопка + 24px) был уже, чем halo/бабл/форма лаунчера. | В `embedManager.tsx` ветка `data-lemnity-callback-root` постит свой bounding rect + 36px запас. Коммит `6b4bc78`. |
| 3 | Вкладка «Звонки» не показывалась | Старая сборка на проде. | Деплой. |

### 3. Фундаментальное ограничение Mango (причина смены движка)

Mango Office ВАТС, команда `POST /vpbx/commands/callback`:
- **`from.extension` ОБЯЗАТЕЛЕН и должен быть реальным сотрудником ВАТС** (внутренний номер).
  Нельзя подставить «произвольный номер менеджера из редактора» как оператора — Mango вернёт `3330`.
- Сценарий «звоним С нашего счёта, но номером произвольного менеджера, указанного в редакторе»
  **в Mango невозможен** без заведения этого менеджера сотрудником в кабинете ВАТС.

Это противоречит продуктовому требованию (менеджер = просто номер в редакторе, без настройки
сотрудников в ВАТС) → **переходим на Voximplant** (CPaaS/программируемая телефония), который умеет
соединить (`bridge`) два произвольных внешних номера из одного аккаунта.

### 4. Решение: Voximplant (CPaaS)

**Модель:** один наш аккаунт Voximplant. На входящий лид сервер вызывает **Management API
`StartScenarios`**, передавая VoxEngine-сценарий и `script_custom_data` = `{ manager, client, callerId }`.
Сценарий звонит менеджеру, при ответе звонит клиенту и соединяет звонки (`easyProcess`).

**VoxEngine-сценарий** (создан в кабинете Voximplant, Application `call.lemnity.n3.voximplant.com`,
сценарий назван «сценарий»):

```js
require(Modules.PSTN);
let mgr, client;
VoxEngine.addEventListener(AppEvents.Started, () => {
  const d = JSON.parse(VoxEngine.customData()); // { manager, client, callerId }
  mgr = VoxEngine.callPSTN(d.manager, d.callerId);
  mgr.addEventListener(CallEvents.Connected, () => {
    client = VoxEngine.callPSTN(d.client, d.callerId);
    VoxEngine.easyProcess(mgr, client);
  });
  mgr.addEventListener(CallEvents.Failed, () => VoxEngine.terminate());
  mgr.addEventListener(CallEvents.Disconnected, () => VoxEngine.terminate());
});
```

> Робот/IVR (TTS-приветствие перед соединением) на Voximplant добавляется тривиально — `say()` перед
> `easyProcess`. Отложено (YAGNI), пока не подтвердим базовый bridge.

### 5. Caller ID в Voximplant — важный вывод по кабинету

В текущей версии панели Voximplant **отдельной «верификации Caller ID» нет**. Логика:
- **`callerId` для `callPSTN` = АРЕНДОВАННЫЙ номер Voximplant** (раздел «Номера» →
  «Купить телефонный номер»). Без своего номера-АОН исходящие на произвольные номера не выпускаются.
- **«Тестовые номера»** — это НЕ caller ID, а список номеров, на которые разрешено звонить в
  триал-режиме (подтверждаются кодом). Для боевого режима нужен арендованный номер.

**Решение пользователя (2026-06-11): номер подключаем позже.** Поэтому интеграция Voximplant
строится сейчас на уровне кода/абстракции, а реальный звонок включается, когда будут готовы
`account_id`, `api_key`, `rule_id` и арендованный/тестовый номер (`callerId`).

### 6. План интеграции Voximplant (осталось сделать в коде)

- **Абстракция `CallProvider`** (интерфейс `initCall(config, { manager, client, callerId })`),
  чтобы движок звонков был сменным.
- **`MangoCallProvider`** — обернуть существующий `MangoService.initCall` (оставляем как fallback).
- **`VoximplantCallProvider`** — Management API `StartScenarios`
  (`account_id`, `api_key`, `rule_id`, `script_custom_data = { manager, client, callerId }`).
- **Выбор провайдера** через env `CALL_PROVIDER=mango|voximplant` (дефолт фиксируем при включении).
- **Env (прод, gitignored `.env`, НЕ коммитить):**
  `VOXIMPLANT_ACCOUNT_ID`, `VOXIMPLANT_API_KEY`, `VOXIMPLANT_RULE_ID`, `VOXIMPLANT_CALLER_ID`.
- **Редактор менеджера** при Voximplant упрощается до **просто номера телефона** (тип SIP/extension
  больше не нужен для оператора — оператор это обычный внешний номер).
- **Запись разговора:** Voximplant умеет запись (`Call.record()` / Media в сценарии) — заменит
  `MangoService.fetchRecording` (был помечен TODO). Реализуется при подключении.

### 7. Что нужно от пользователя для включения боевого звонка

1. В кабинете Voximplant сохранить сценарий и создать **Rule** (роутинг) → получить **`rule_id`**.
2. Получить **`account_id`** и **`api_key`** (раздел настроек аккаунта/API).
3. Арендовать номер («Номера» → «Купить телефонный номер») ИЛИ подтвердить тестовые номера →
   получить **`callerId`**.
4. Прислать эти 4 значения → подключаем `VoximplantCallProvider`, делаем тест-звонок
   «менеджер + клиент → bridge».

### 8. Статус секретов/кредов (безопасность)

- Реальные креды Mango и будущие креды Voximplant — только в **gitignored `.env`**, НЕ в коде
  и НЕ в публичном widget-config.
- `MANGO_VPBX_BASE_URL` в проде **не задавать** (дефолт = реальный Mango); dummy-URL — только в
  локальных тестах.
- `WIDGETS_HANDOFF_SECRET`, `INTEGRATION_ENC_KEY` — секреты в `.env` обоих репо.
