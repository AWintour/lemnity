# Виджет «Конвейер Удачи» (`CONVEYOR_OF_LUCK`) — клон «Колеса фортуны» с барабаном

> **Статус: ✅ реализовано.** Typecheck клиента/сервера/embed — чисто (кроме предсуществующей
> e2e supertest-ошибки). Миграции применены к dev-БД `lemnity_app`. Визуал проверен через
> dev-харнесс предпросмотра.

## Контекст

Новый виджет **«Конвейер Удачи»** — клон механики «Колеса фортуны» (`WHEEL_OF_FORTUNE`):
те же сектора/шансы/форма/спин/призовой экран и **отдельное хранилище в БД**, но **другой
визуал — вертикальный барабан (лента) вместо круга**.

Решения:
- **Объём:** фронтенд + бэкенд (эндпоинт spin) + БД (новые Prisma-модели и миграции).
- **Идентификатор типа:** `CONVEYOR_OF_LUCK`, имя «Конвейер Удачи».
- **Доступ:** только админ (как `CALLBACK`).

Цепочка типа: Prisma enum `WidgetType` → `@lemnity/database` → серверные DTO → OpenAPI →
`@lemnity/api-sdk` (`WidgetTypeEnum`) → фронтенд.

**Стратегия:**
- **Бэкенд/данные/редактор настроек** — клон колеса: тип `CONVEYOR_OF_LUCK` с собственными
  таблицами спинов; редактор секторов/формы переиспользуется через хелпер «wheel-like»
  (`isWheelLikeWidgetType`), которым расширены все гейты `=== WHEEL_OF_FORTUNE`.
- **Визуал виджета** — собственный: компонент-барабан `ConveyorReel` и свои экраны/превью/
  embed-раннер (НЕ переиспользуют круг колеса).

> ⚠️ `CONVEYOR_OF_GIFTS` («Конвейер подарков») — это **другой** виджет, не трогаем.

---

## 1. База данных (`packages/database`) — ✅

- `prisma/schema/models/widgets.prisma` — значение `CONVEYOR_OF_LUCK` в enum `WidgetType`.
- `prisma/schema/models/conveyor_of_luck_widgets.prisma` — модель `ConveyorOfLuckWidget`.
- `prisma/schema/models/conveyor_of_luck_spins.prisma` — модель `ConveyorOfLuckSpin`.
- `prisma/schema/migrations/20260612100000_add_conveyor_of_luck_enum/` — `ALTER TYPE … ADD VALUE`
  (отдельной транзакцией — ограничение PostgreSQL).
- `prisma/schema/migrations/20260612100001_add_conveyor_of_luck_storage/` — таблицы + триггеры
  guard/sync (клон `20260102234914_add_wheel_of_fortune_storage`, гейт по `CONVEYOR_OF_LUCK`).
- Клиент перегенерирован (`prisma generate`) + пакет собран (`@lemnity/database` build) →
  делегаты `prisma.conveyorOfLuckWidget` / `prisma.conveyorOfLuckSpin`.

## 2. api-sdk (генерируемый, правлено вручную + rebuild dist) — ✅

`CONVEYOR_OF_LUCK` добавлен во все enum-копии исходников `.ts`, dist пересобран:
`WidgetTypeEnum` (widget), `CreateWidgetDtoTypeEnum`, `UpdateWidgetDtoTypeEnum`, `PublicWidgetTypeEnum`.

## 3. widget-config (zod + canonicalize) + rebuild dist — ✅

- `src/widgets/base.ts` — `'CONVEYOR_OF_LUCK'` в `WidgetTypeId`.
- `src/widgets/ConveyorOfLuck/{schema,canonicalize}.ts` — клон колеса с литералом/гейтом
  `'CONVEYOR_OF_LUCK'` (`conveyorOfLuckSchema`, `canonicalizeConveyorOfLuck`).
- `src/widgets/index.ts` — адаптер; `src/canonicalize.ts` — в `canonicalizers`.
- `package.json` — экспорт `./widgets/conveyor-of-luck`; `pnpm --filter @lemnity/widget-config build`.

## 4. Клиентский store/типы — «wheel-like» — ✅

- `stores/widgetSettings/types.ts` — `WheelOfFortuneWidgetSettings.type` → `… | CONVEYOR_OF_LUCK`;
  алиас `ConveyorOfLuckWidgetSettings`.
- `widgetSlice.ts` (предикат `wheelUpdater`), `widgetSettingsStore.ts` (селектор),
  `WheelOfFortune/hooks.ts` (`useWheelOfFortuneSettings`) — через `isWheelLikeWidgetType`.

## 5. Регистрация виджета + UI-гейтинг — ✅

- `layouts/Widgets/constants.ts` — `WidgetTypes.CONVEYOR_OF_LUCK`; запись в `AVAILABLE_WIDGETS`
  («Конвейер Удачи», `isAvailable:true`, `badge:'new'`); хелперы `WHEEL_LIKE_WIDGET_TYPES` /
  `isWheelLikeWidgetType()`.
- `widgetDefinitions.ts` — в `implementedWidgetDefinitions`; `registry.ts` — `conveyorWidgetMetadata`.
- Гейты `=== WHEEL_OF_FORTUNE` → `isWheelLikeWidgetType` в: `OnWinMessageSection`,
  `TemplateSettings`, `FieldsSettingsTab`, `SectorItem`, `FormSettings`, `WheelSectorsField`,
  `pages/EditWidgetPage.tsx`.

## 6. Каталог `layouts/Widgets/ConveyorOfLuck/` (собственный визуал) — ✅

- `defaults.ts` — `buildConveyorWidgetSettings` (`type:CONVEYOR_OF_LUCK`) +
  `buildConveyorFieldsSettings` (раскладка как в макете: `contentPosition:'right'` — лента слева,
  форма справа; кнопка «Крутить ленту»).
- `ConveyorReel.tsx` — **барабан-лента** (см. ниже).
- `ConveyorDesktopScreen.tsx` / `ConveyorMobileScreen.tsx` — экраны (клон логики колеса, но
  рендерят `ConveyorReel`; runtime-ключи и обработчики `wheel.*` общие).
- `ConveyorOfLuckPreview.tsx` — панель предпросмотра (Главный/Призовой), кнопка действия запускает
  спин.
- `metadata.ts` — `conveyorWidgetMetadata` (свои экраны/превью + `WheelSectorsField` редактора).
- `embedRuntime.tsx` — собственный `ConveyorEmbedRuntime` / `ConveyorModalContent`.

### Барабан `ConveyorReel` — параметры

- **Ориентация:** `vertical` (desktop, указатель слева →) и `horizontal` (mobile, указатель сверху ↓).
- **Карточки:** квадратные — desktop `340×340`, mobile `270×270`; контейнер-окно с радиусом **15px**.
  Радиус скругления карточек регулируется ползунком **«Радиус скругления»** (см. ниже), дефолт 24px.
- **Контент карточки:** лучи-«солнце» из центра (цвет сектора + белый), крупная иконка сектора
  (или золотая 3D-звезда по умолчанию), текст снизу. **Без теней** (drop-shadow/тёмный градиент
  убраны, оставлен лёгкий блик сверху).
- **Указатель:** `strelka.svg` (инлайн), `fill` белый, `stroke` = цвет общего фона (динамически) —
  эффект «выреза»; без тени. **Сторона указателя меняется** в зависимости от расположения ленты:
  при ленте слева указатель справа, при ленте справа — слева (`pointerSide` = противоположная стороне
  контента). Горизонталь (mobile) — указатель сверху ↓.
- **Радиус скругления (ползунок):** в `TemplateSettings` под «Расположение контента» добавлен блок
  «Радиус скругления» (`@heroui/slider`, 0–40px, дефолт 24) — только для wheel-like типов. Хранится
  в `widget.cardRadius`; action `setWheelCardRadius` (clamp 0–60). `ReelCard` применяет
  `borderRadius: cardRadius`.
- **Рост модалки по высоте:** грид экрана — `min-h-full` (а не `h-full`), чтобы окно расширялось
  при добавлении логотипа и нехватке места (`ModalChrome` — `min-h-[500px]`).
- **Затемнение краёв:** вертикаль — сверху/снизу (умеренное), горизонталь — слева/справа (слабое).
- **Анимации:**
  - холостой ход — бесшовный непрерывный цикл (шаг ровно в один набор секторов);
  - спин — «как в рулетке»: одна фаза, сильный ease-out `cubic-bezier(0.08,0.82,0.12,1)` ~5.4с
    (резкий старт → долгое торможение) с приземлением точно на сектор-победитель.
- **Кнопка действия** («Крутить ленту») запускает спин: симуляция результата
  (`simulateWheelSpinResultFromSectors`) → runtime `wheel.*` + emit `wheel.spin`.

## 7. embed (`packages/embed-script`) — ✅

`embedManager.tsx` → `case WidgetTypeEnum.CONVEYOR_OF_LUCK: return <ConveyorEmbedRuntime />`
(собственный раннер с барабаном, не `WheelEmbedRuntime`).

## 8. Бэкенд: spin + admin-only — ✅

- `widget.service.ts::spinWheelPublic` — принимает wheel-like типы; таблица спинов выбирается по
  типу (`wheelOfFortuneSpin` / `conveyorOfLuckSpin`, связь `wheelWidget` / `conveyorWidget`).
  Веса/анти-дубль/event-mode без изменений.
- `common/admin.ts` — `CONVEYOR_OF_LUCK` в `ADMIN_ONLY_WIDGET_TYPES`.
- `pages/ProjectWidgetsPage.tsx` — `CONVEYOR_OF_LUCK` в `ADMIN_ONLY_WIDGETS`.

## 9. Dev-харнесс предпросмотра (без авторизации) — ✅

- `projects/client/preview/conveyor-of-luck.html` + `src/__preview__/conveyor-of-luck.tsx` —
  раскладка `EditWidgetPage` (вкладки + `FieldsSettingsTab` + `WidgetPreview`), стор
  инициализируется напрямую, без логина/БД. Поддерживает `?type=`.
- Кнопка «Просмотр» — **двухшаговый сценарий** (как на сайте): сперва затемнённая «страница» с
  **кнопкой открытия окна** (`LauncherButton`) в углу по `display.icon.position`; клик по ней
  открывает окно виджета (`PreviewModal`). Сабмит формы внутри окна крутит ленту.
- Рядом с «Настройка виджета» добавлены вкладки **«Отображение»** (`DisplaySettingsTab`) и
  **«Интеграция»** (`IntegrationTab`) — видимость по `usesStandardSurface(type, 'display'|'integration')`.
- URL: `http://localhost:5173/preview/conveyor-of-luck.html`.

## 10. Редактор секторов «Конвейера» — панель «Настройки сектора» по макету — ✅

Отдельный компонент `ConveyorSectorsField`
(`projects/client/src/layouts/WidgetSettings/FieldsSettingsTab/ConveyorSectorsField/`) подключён в
метадату конвейера вместо `WheelSectorsField` (колесо не тронуто). По клику на шестерёнку сектора
открывается панель «Настройки сектора». Содержимое зависит от **«Вид обложки»** (`coverType`):

- **Вид обложки** — «С фоном» / «Картинка» (`OptionsChooser`, `coverType`).
- Режим **«Картинка»** (`coverType:'image'`):
  - `ImageUploader` (без тогла, `hideSwitch`), `120×70`, `менее 1 Мб`, формат-подпись **«png без фона»**
    (`formatsLabel`) — изображение становится **полной обложкой** карточки.
  - **Выравнивание** (`OptionsChooser`: сверху/по центру/снизу → `imageAlign`, влияет на `objectPosition`).
  - **Цветовая гамма** — «Цвет шрифта» (`systemTextColor`) + «Размер текста» (`textSize`).
- Режим **«С фоном»** (`coverType:'background'`):
  - грид: **Выбор иконки** (`IconPicker`, библиотека `@/components/Icons`, прозрачный триггер) +
    **Цвет иконки** (`ColorAccessory` → `iconColor`).
  - **Цветовая гамма** — «Основная» / «Пользовательское»; при custom — 3 колонки:
    **Цвет фона** (`bgColor`) / **Цвет шрифта** (`systemTextColor`) / **Размер текста** (`textSize`).
  - Иконка (из библиотеки, по умолчанию золотая 3D-звезда `LuckStar`) — размер фиксированный
    (`base*0.52`, без поля изменения).
- В строке сектора — `SectorItem` с `hideIcon` (без иконки-радио), но `Select` иконок строки оставлен;
  отключение `Select` — только для самого колеса (`WHEEL_OF_FORTUNE`).
- **Плашка** — тогл `CustomSwitch` (`size="sm"`, синий «Вкл») + «Цвет плашки» / «Цвет шрифта»;
  при включении текст карточки садится на фоновую подложку-плашку снизу.
- **Затемнение** — тогл + ползунок (`@heroui/slider`) высоты затемнения (0–100%): снизу карточки
  градиент-затемнение, высота регулируется ползунком.
- **Текст при выигрыше** — тогл + текст, «Укажите промокод слота» (+подсказка),
  «Вероятность выпадения» (`По умолчанию - 25%` + подсказка), чек «Это выигрыш».

**Раскладка панели:** слева — поля (естественной высоты, прокручивается страница), справа —
**карточка-превью сектора `sticky` (`top-4`)**: при прокрутке вниз остаётся на месте.
Превью — компонент `ReelCard` (экспортирован из `ConveyorReel`), **обновляется на лету** при правке
любого поля — для наглядности.

Доп. изменения:
- Тип `SectorItem` расширен опциональными полями: `coverType`, `image{enabled,fileName,url}`,
  `imageAlign`, `colorScheme`, `bgColor`, `systemTextColor`, `iconColor`, `winTextEnabled`, `winText`,
  `badgeEnabled`/`badgeColor`/`badgeTextColor` (плашка), `darkenEnabled`/`darkenHeight` (затемнение).
  Те же поля в Zod-схеме `ConveyorOfLuck/schema.ts` + `widget.cardRadius` (widget-config пересобран) —
  значения сохраняются.
- `ReelCard` (`export` из `ConveyorReel`) учитывает поля сектора (на лету, в превью и в ленте):
  - `coverType:'image'` → изображение полной обложкой, `objectPosition` из `imageAlign`;
  - **иконка** — `Icons[item.icon]` из библиотеки (или URL, или звезда по умолчанию),
    цвет = `iconColor` (или цвет текста);
  - `colorScheme:'custom'` → `bgColor` красит лучи, `systemTextColor` — цвет текста;
  - **плашка** — текст на подложке `badgeColor`/`badgeTextColor`;
  - **затемнение** — нижний градиент высотой `darkenHeight%`;
  - `borderRadius` = `cardRadius` (ползунок).
- **Порядок блоков** в `FieldsSettingsTab`: для wheel-like блок **«Сектора»** рендерится сразу после
  «Радиус скругления» (конец `TemplateSettings`) и перед `FormSettings`; для остальных виджетов —
  на прежнем месте (после `FormSettings`).
- Вспомогательные компоненты получили опц. пропсы: `ImageUploader.formatsLabel`,
  `IconPicker.triggerClassName`, `ColorAccessory.classNames.swatch`, `SectorItem.hideIcon`.
- `components/ColorAccessory.tsx` — опциональный класс `classNames.swatch` (кружок) и `flex-1` у подписи
  (дефолт/остальные места не меняются). Цвет-поля конвейера компактные (`!h-12`, кружок `w-5`,
  `input !w-0`), подпись слева — кружок+шеврон справа (как «Цвет кнопки»).
- Тоглы конвейера — в системном стиле: `size="sm"` + `selectedColor="…!bg-[#1A52DB]"` (синий «Вкл»),
  как в `ImageUploader`/`SwitchableField`.
- Барабан: холостой цикл зависит только от `[oneSetMain, orientation]` — правки полей сектора
  не перезапускают анимацию (лента не «скачет»).

## 11. «Отображение» (display) + лаунчер-кнопка — ✅

- Поверхность `display` у конвейера — **стандартная** (как у колеса): та же вкладка «Отображение»
  (`DisplaySettingsTab`) — условие показа, вид иконки, положение кнопки открытия, сокрытие иконки.
- `buildConveyorDisplaySettings` (в `ConveyorOfLuck/defaults.ts`, зарегистрирован в
  `widgetDefinitions`): клон `buildStandardDisplaySettings`, но **лаунчер по умолчанию — «Кнопка»**
  (`icon.type:'button'`, текст «Испытай удачу»), а не «Изображение» — чтобы виджет открывался
  кнопкой-триггером.
- **Иконка в кнопке-лаунчере:** рядом с «Текст в кнопке» (`ButtonSettingsField`) — `IconPicker`
  (библиотека `@/components/Icons`). Хранится в `display.icon.button.icon`
  (опц. поле в общей `IconButtonSchema`, widget-config пересобран); экшен `setButtonIconName`
  (и `setButtonIcon` теперь не затирает иконку). `LauncherButton` рисует иконку слева от текста.
- В **Предпросмотре** снизу (под «Призовой экран») — блок **«Кнопка открытия окна»**
  (`ConveyorOfLuck/WidgetLauncherPreview.tsx`): рисует лаунчер по display-настройкам
  (`display.icon`) — «Кнопка» (текст + `buttonColor`/`textColor`) либо «Изображение»
  (иконка/плейсхолдер); клик открывает окно (запускает спин). Показан в **реальном размере**
  (вне `scale`-обёртки экранов). Чтобы под масштабированными экранами не было пустого зазора,
  layout-высота `scale`-блока схлопывается до визуальной (`scaledHeight = scrollHeight * scaleFactor`).
- **Иконка лаунчера в embed (паритет):** `ConveyorEmbedRuntime` (embedRuntime.tsx) рисует
  `display.icon.button.icon` слева от текста (Icons уже в бандле через ConveyorReel) — на реальном
  сайте кнопка с иконкой, как в превью.

## 12. Двухшаговый «Просмотр» в реальном редакторе — ✅

Режим превью `preview.launcher: 'launcherOverlay'` (registry.ts) — как на реальном сайте:
- Клик «Просмотр» → затемнённая «страница» + **кнопка открытия окна** в углу по
  `display.icon.position` → клик по кнопке открывает окно виджета (`PreviewModal`).
- Компонент `ConveyorOfLuck/LauncherOverlay.tsx` (общий для реального редактора и dev-харнесса);
  `LauncherButton` экспортируется из `WidgetLauncherPreview.tsx`.
- EditWidgetPage.tsx: `handlePreview` ветвится по `previewLauncher`; state `isLauncherOverlayOpen`;
  оверлей берётся из `definition.preview.launcherOverlay` (по аналогии с `preview.inline`).

## 13. Подготовка к проду — ✅

**Сборка артефактов (consumers читают dist):**
`@lemnity/database` build → `@lemnity/api-sdk` build → `@lemnity/widget-config` build →
`@lemnity/embed-script` build (+ `sync:public` копирует `dist/embed.js` в
`projects/client/public` и `projects/test-platform/public`).

**Прод-деплой (CI-CD.yml + deploy.sh):** схема в БД синхронизируется через
`prisma db push --accept-data-loss` (НЕ `migrate deploy`). `db push` создаёт enum-значение, таблицы
`conveyor_of_luck_widgets`/`conveyor_of_luck_spins`, индексы и FK — но **НЕ** raw-SQL функции/триггеры
из миграции.

**⚠️ Обязательный ручной шаг в проде (один раз на среду, ПОСЛЕ `db push`):**
применить идемпотентный `packages/database/prisma/manual/conveyor_of_luck_triggers.sql`
(guard/sync функции + триггеры + бэкафилл родительских строк). Без него спин конвейера упадёт:
`conveyorOfLuckSpin.create` делает `conveyorWidget.connect`, а строку-родителя создаёт триггер.
Применяется тем же путём, что и триггеры «Колеса фортуны». Команда:
```
psql "$DATABASE_URL" -f packages/database/prisma/manual/conveyor_of_luck_triggers.sql
```

**Проверено локально (e2e на уровне БД, в откатываемой транзакции):** создание виджета
CONVEYOR_OF_LUCK → sync-триггер создаёт строку-родителя; вставка спина (FK к родителю) ок;
анти-дубль по `(widget_id, session_id)` блокирует повтор сессии; guard отклоняет родителя
не-конвейера; delete виджета каскадно удаляет родителя и спины. Серверный jest — 105/105 passed.

---

## Запуск локально

```
# PostgreSQL (нативный) на :5432, БД lemnity_app
DATABASE_URL="postgresql://thesimakov@localhost:5432/lemnity_app" pnpm dev
# client → http://localhost:5173 , server → http://localhost:3000
```
> `db:migrate` запускается из `packages/database` без наследования `projects/server/.env` —
> поэтому `DATABASE_URL` нужно прокинуть в окружение команды `pnpm dev`.

## Проверка

1. `prisma generate` / `@lemnity/database` build — делегаты/enum на месте.
2. `@lemnity/widget-config` build — адаптер/канонизатор `CONVEYOR_OF_LUCK`.
3. Typecheck клиента/сервера/embed — чисто.
4. Галерея: под админом «Конвейер Удачи» виден, под обычным юзером — скрыт.
5. Создать `CONVEYOR_OF_LUCK` → редактор секторов/формы; барабан в превью; «Крутить ленту» крутит.
6. БД: триггер создаёт строку `conveyor_of_luck_widgets`; `POST /api/public/widgets/:id/spin`
   пишет в `conveyor_of_luck_spins` (анти-дубль по сессии; event-mode не пишет).

## Риски / замечания

- `api-sdk` — генерируемый; правка вручную + rebuild dist (полная регенерация требует
  запущенного сервера/OpenAPI; при следующей официальной генерации значения подтянутся из Prisma).
- Тип `WheelOfFortuneWidgetSettings` намеренно расширен на конвейер (общая форма настроек);
  алиас `ConveyorOfLuckWidgetSettings` — для ясности.
- Миграция enum вынесена отдельно (ограничение PostgreSQL).
- В dev-логе шумят сторонний сервис `projects/collector` (валидация env) и `NotisendService`
  (`NOTISEND_API_KEY`) — к основному приложению не относятся.
