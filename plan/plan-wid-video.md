# Видео виджет (VIDEO_WIDGET) — реализация

> Документ синхронизирован с фактическим кодом. Виджет реализован как новый тип `VIDEO_WIDGET`,
> клонирован из «Анонса» и доведён до вертикального сторис-видеоплеера с формой захвата лида.

## Что это

Вертикальный сторис-видеоплеер (карточка как у «Анонса»): видео 9:16 на фон, кнопка закрытия (X),
нижний оверлей с заголовком, CTA-кнопкой, кастомными контролами (play/pause, mute) и прогресс-баром.
По нажатию CTA (если включена форма) показывается форма захвата лида (имя/email/телефон + согласия).

**Размеры (как у «Анонса»):**
- Раскрытый: `w-99.5` × `min-h-129.5` = **398 × 518 px** (интерактивная зона при фокусе 398×524).
- Свёрнутый: та же карточка `scale-40` (через общий `DesktopWidgetTrigger`) ≈ **159 × 207 px**.

---

## Точки интеграции (все реализованы)

### Слой типов/enum
- `packages/database/prisma/schema/models/widgets.prisma` — `VIDEO_WIDGET` в `enum WidgetType`. Клиент Prisma регенерирован.
- `packages/api-sdk/models/widget.ts` — `WidgetTypeEnum.VIDEO_WIDGET`.
- `packages/api-sdk/models/create-widget-dto.ts` — `CreateWidgetDtoTypeEnum.VIDEO_WIDGET`.
- ⚠️ api-sdk потребляется из `dist/` → после правок моделей нужна пересборка `pnpm --filter @lemnity/api-sdk build` (или `postinstall` через `build:workspace-deps`).

### Пакет `@lemnity/widget-config`
- `src/widgets/VideoWidget/schema.ts` — `videoWidgetSchema` + тип `VideoWidgetType`. Структура:
  - `appearence`: `companyLogoEnabled/Url`, `colorScheme`, `backgroundColor?`, `borderRadius`, **`position: 'bottom-left' | 'bottom-right'`**.
  - `videoSettings`: **`videos: string[]` (max 3, проигрываются по очереди)**, `posterUrl?`, **`posterEnabled`** (вкл → постер + НЕ автозапуск; выкл → видео сразу), `muted`, `loop`, `showControls`, `showProgressBar`.
  - `infoSettings` (нижний оверлей): `title`, `titleFontWeight`, `titleColor`, CTA (`buttonText`, `buttonFontColor`, `buttonBackgroundColor`, `icon`, `link`).
  - `mobileSettings`: триггер image/button.
  - `formEnabled` (показывать форму после CTA), **`formTitleFontSize`** (px, размер заголовка формы), `brandingEnabled`.
- `src/widgets/VideoWidget/canonicalize.ts` — `canonicalizeVideoWidget`.
- `src/widgets/base.ts` — `'VIDEO_WIDGET'` в union `WidgetTypeId`.
- `src/widgets/index.ts` — адаптер `{ type: 'VIDEO_WIDGET', schema: videoWidgetSchema }`.
- `src/canonicalize.ts` — ключ `VIDEO_WIDGET` в `canonicalizers`.
- `package.json` — экспорт `./widgets/video-widget`.

### Клиент — `projects/client/src/layouts/Widgets/VideoWidget/`
- `defaults.ts` — `videoWidgetDefaults` (видео-first, position `bottom-right`, `formTitleFontSize: 28`, `formEnabled: true`) + `buildVideoWidget*`. `buildVideoWidgetFieldsSettings` использует общий `buildFieldsSettings({formTexts})` → форма берёт данные из surface `fields`.
- `actions.ts` — `createVideoWidgetActions`: сеттеры appearance (+`setVideoWidgetPosition`), видео (`setVideoWidgetVideos/addVideoWidgetVideo/removeVideoWidgetVideo/setVideoWidgetPosterEnabled/PosterUrl/Muted/Loop/ShowControls/ShowProgressBar`), оверлей (title/button/link), mobile, `setVideoWidgetFormEnabled`, `setVideoWidgetFormTitleFontSize`, `setVideoWidgetBrandingEnabled`, `resetVideoWidgetColors`.
- `VideoWidget.tsx` — рендер сторис-плеера: `<video>` плейлист (по очереди, onEnded→следующее, loop), кнопка X, оверлей (заголовок/CTA/контролы/прогресс), брендинг. **Живая актуализация**: эффекты синхронят `isMuted←muted`, `isPlaying←autoplay(=!posterEnabled)` (play/pause), `currentIndex←videos`. Внутреннее состояние `showForm`; проп `previewForm` для показа экрана формы в превью редактора.
- `VideoLeadForm.tsx` — **bespoke форма-копия макета**: логотип (из `fields.companyLogo`, с уважением тумблера; иначе дефолт Lemnity), заголовок (размер = `formTitleFontSize`), карточка с полями имя/email/`+7 …`, CTA-кнопка, два чекбокса согласий (agreement/adsInfo из `fields`), «Создано на Lemnity». Центрирована по обеим осям. Submit → `sendPublicRequest`.
- `VideoWidgetSettings.tsx` — конструктор (custom fields surface): «Загрузить видео» (до 3, превью-карточки 9:16 с крестиком; при выборе файла — локальное превью со спиннером «Загрузка…», для тяжёлых видео ≥15 Мб бейдж «Большое · N Мб», файлы >20 Мб отклоняются с текстом ошибки), «Превью видео» (постер+тумблер), Оформление (логотип/цвет/скругление), тумблеры mute/loop/контролы/прогресс, **«Положение виджета»** (2 варианта), Оверлей (заголовок с «Размер текста», кнопка, ссылка), **«Форма»** (тумблер; логотип компании с загрузкой+вкл/выкл, заголовок формы с размером, кнопка формы, Контакты/Согласие/Реклама — стандартные компоненты из `fields`), отключение брендинга.
- `metadata.ts` — `videoWidgetMetadata` (panel = `WidgetPreview`, inline = `VideoWidgetFloatingPreview`, секция настроек `VideoWidgetSettings`).
- `WidgetPreview.tsx` — превью двух экранов: «Видео» всегда + «Форма» при `formEnabled` (масштаб 0.6 в боксах 398×518).
- `VideoWidgetFloatingPreview.tsx` — полноэкранный инлайн-просмотр (рендерит `VideoWidgetEmbedRuntime`).
- `embedded/` — `VideoWidgetEmbedRuntime` (триггер desktop/mobile, события `video_widget.open/close/link_opened`), `Widget.tsx`, `MobileContext/*`.

### Клиентские реестры / стор
- `layouts/Widgets/registry.ts` — `videoWidgetMetadata`.
- `layouts/Widgets/constants.ts` — `WidgetTypes.VIDEO_WIDGET` + карточка «Видео виджет» (badge `new`).
- `stores/widgetSettings/widgetDefinitions.ts` — запись `VIDEO_WIDGET` (surfaces fields/display = custom).
- `stores/widgetSettings/widgetSlice.ts` — `videoWidgetUpdater` + `createVideoWidgetActions`.
- `stores/widgetSettings/widgetActions/types.ts` — сигнатуры всех `setVideoWidget*`.
- Общие `@/components/settings/WidgetAppearanceSettings` — в union `defaults` добавлен `VideoWidgetType` (читает только `appearence`). В `InfoSettings`/`RewardMessageSettings` НЕ добавлен (форма видео их не использует).

### Embed-скрипт
- `packages/embed-script/src/embed/embedManager.tsx` — `case VIDEO_WIDGET → <VideoWidgetEmbedRuntime/>`. Свёрнутая/интерактивная область — через общий `DesktopWidgetTrigger` (маркер `data-lemnity-announcement`).

### Бэкенд
- `projects/server/src/files/files.controller.ts` — `POST /files/videos` (mp4/webm, до 20 МБ, S3).
- Клиент: `uploadVideo` в `projects/client/src/api/upload.ts`; эндпоинт `API.FILES.VIDEOS` в `common/api/endpoints.ts`.
- Создание виджета: DTO принимает `VIDEO_WIDGET` автоматически (`@IsEnum(WidgetType)`), `paidUntil` (триал) ставится как у всех типов.

### Доступ: admin-only (тестовый период)
Виджет виден и создаётся **только администратору** (после теста — открыть всем).
- **Определение админа** — по роли `ADMIN` ИЛИ по email-allowlist. Allowlist: env `ADMIN_EMAILS` (сервер) / `VITE_ADMIN_EMAILS` (клиент), по умолчанию **`simakov@lemnity.ru`** (несколько — через запятую).
- **Клиент:** `projects/client/src/pages/ProjectWidgetsPage.tsx` — карточка скрыта не-админам (`ADMIN_ONLY_WIDGETS` + `ADMIN_EMAILS`).
- **Сервер:** `projects/server/src/common/admin.ts` (`isAdminUser`, `ADMIN_ONLY_WIDGET_TYPES`) + проверка в `widget.controller.ts create` → не-админу `403 Forbidden`.
- **Плумбинг роли:** добавлен `GET /auth/me` (`auth.controller.ts`); `authStore.bootstrap` после refresh подтягивает пользователя (`authService.getMe → setUser`) — иначе после обычной загрузки `user` был `null` и гейт прятал виджет у всех. Клиент: `API.AUTH.ME`, `services/auth.ts getMe()`.
- **Чтобы открыть всем:** убрать `VIDEO_WIDGET` из `ADMIN_ONLY_WIDGETS` (клиент) и `ADMIN_ONLY_WIDGET_TYPES` (сервер) — один коммит.

### Деплой
- CI/CD (`.github/workflows/CI-CD.yml`) по push в `main`: job `build` (образы→GHCR) → job `deploy` (`scp` dist + `ssh` → `./deploy.sh`: `docker compose pull` → `prisma db push` (аддитивно добавляет enum `VIDEO_WIDGET`) → `up --force-recreate`).
- **Отгружено в прод:** коммиты `5bc4c7d` (виджет), `d0959b8` (admin-only + /me), `af8ffce` (allowlist `simakov@lemnity.ru`). Проверено на проде — работает.

---

## Что НЕ доделано / открытые вопросы
- **Позиция виджета** хранится и переключается, но реальное размещение в углу страницы в embed захардкожено в общем `DesktopWidgetTrigger` (`fixed bottom-6 right-6`, общий с «Анонсом»). Чтобы позиция двигала виджет — прокинуть `position` в триггер (затрагивает общий компонент).
- Демо-страница без ЛК (`preview-video.html` + `src/preview-video.tsx`) была удалена перед деплоем (иначе Vite собрал бы публичную страницу-редактор без авторизации).

---

## Проверка (актуально)
- `pnpm --filter @lemnity/widget-config build` — ✅
- `pnpm --filter @lemnity/api-sdk build` — ✅ (обязательно после правок моделей — dist потребляется клиентом)
- `cd projects/client && npx tsc -b` — ✅ (EXIT 0)
- `cd projects/server && npx tsc -p tsconfig.build.json --noEmit` — ✅ (e2e-тест supertest — прежняя несвязанная ошибка, в build не входит)
- `pnpm --filter @lemnity/embed-script build` — ✅
- **Прод:** CI/CD #119/#120 зелёные, деплой на сервер прошёл; под `simakov@lemnity.ru` «Видео виджет» виден в каталоге, у остальных скрыт — **проверено, работает**.
- Визуально: каталог показывает «Видео виджет» (admin); конструктор — все секции (видео/постер/позиция/оверлей/форма с лого и размером заголовка); превью — экраны «Видео» и «Форма»; «Просмотр» открывает инлайн-оверлей; настройки актуализируются вживую.

## Статус
✅ Реализовано, подключено к редактору и БД, admin-only (по email/роли), задеплоено на прод и проверено. Осталось: после теста — открыть всем (убрать из admin-only, 1 коммит); опционально — реальное размещение по `position` в embed.
