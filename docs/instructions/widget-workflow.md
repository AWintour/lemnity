## Widget Platform Overview

В основе флоу три слоя:

- `@lemnity/widget-config` (packages/widget-config) — описывает схему данных, правила каноникализации/тримминга и миграции. Всё, что попадает в базу или на клиент, должно пройти через эти правила.
- Сервер (`projects/server`, NestJS + Prisma) — принимает сырые настройки, вызывает `canonicalizeWidgetConfig`/`validate`, хранит канон и отдаёт его клиенту.
- Клиент (`projects/client`, React + Zustand + Vite) — даёт UI для редактирования, использует те же типы/схему из `widget-config` и отправляет на сервер только канонический конфиг.

Дополнительные справочники: `projects/client/src/layouts/Widgets/constants.ts` содержит список типов виджетов и их статусы (доступен/в разработке). Добавляя новый виджет, не забудьте обновить этот файл — иначе он не появится в списках UI.

Про слой доставки виджета на сайт партнёра (`embed.js`, iframe-на-виджет, интерактивность) см. [embed-runtime.md](./embed-runtime.md).

Основные участники цепочки:

- `packages/widget-config`: схемы, каноникализация, миграции, настройки поверхностей.
- `packages/api-sdk`: клиентский SDK для REST API (обновляется после изменения DTO/типов).
- `projects/server`: NestJS API, которое сохраняет и отдаёт канонический конфиг.
- `projects/client`: UI для редактирования/превью/валидации.

---

## 1. Подготовка к добавлению нового виджета

1. **Прописать тип во всей бэкенд-цепочке**:
   - В `projects/server/prisma/schema/widget.prisma` (или соответствующем файле схемы) добавить новое значение `WidgetType` и учесть его в моделях/enum'ах.
   - Выполнить `pnpm --filter server prisma generate`, чтобы Prisma сгенерировала типы.
   - Запустить `pnpm generate:api` (скрипт обёртка над `scripts/generate-api.sh`), чтобы обновить `@lemnity/api-sdk`.
   - Убедиться, что новый тип появился в `WidgetTypeEnum` (импортируется из SDK) и доступен на клиенте.
   - Обновить `projects/client/src/layouts/Widgets/constants.ts` (например, `WidgetTypes`, `AVAILABLE_WIDGETS`, статусы) — без этого UI не покажет новый виджет в выборе.

2. **Обновить клиентские константы**:
   - `projects/client/src/stores/widgetSettings/widgetDefinitions.ts` — зарегистрировать `buildWidgetSettings`, `buildFieldsSettings`, `buildDisplaySettings`, `buildIntegrationSettings`, `settingsSurfaces`.
   - `projects/client/src/layouts/Widgets/registry.ts` — добавить `preview` и `settings` metadata.

---

## 2. Обновление `@lemnity/widget-config`

### 2.1. Схема данных
1. Создать папку `packages/widget-config/src/widgets/<WidgetName>/`.
2. Определить `WidgetSchema` (например, `WheelWidgetSchema`), описывающий структуру `widget` (специфичные поля).
3. Если нужны кастомные поверхности:
   - В `buildWidgetSettingsSchema(widgetType, widgetSchema, surfaces)` передать свои `fields`, `display`, `integration`.
   - Для стандартных полей можно использовать готовые схемы из `base.ts`.
4. Экспортировать схему через `packages/widget-config/src/widgets/index.ts`, чтобы она попадала в общий `WidgetSettingsSchema`.

### 2.2. Каноникализация (нормализация/тримминг)
1. Для каждого виджета создать `canonicalize.ts`, который:
   - Получает копию настроек.
   - Чистит неактивные ветки (`fields.template`, `display.icon`, и т.д.).
   - Выполняет специфичный тримминг (например, `Wheel` удаляет `promo`/`chance`, если они пустые).
2. Подключить канонизатор в `packages/widget-config/src/canonicalize.ts` (добавить в `canonicalizers`).
3. Если меняется канонический формат, можно увеличить версию миграций (см. комментарий-шаблон в `migrations.ts`).

### 2.3. Миграции
- `CURRENT_VERSION` соответствует текущей схеме.
- Если требуется перенос данных:
  1. Добавить функцию в `MIGRATIONS`.
  2. Поднять `CURRENT_VERSION`.
  3. Внутри миграции:
     - Создать безопасную копию входных данных (например, `const copy = structuredClone(input)`).
     - Применить нужные трансформации к `copy` (переименование полей, заполнение новых значений).
     - Вызвать `canonicalizeWidgetConfig(copy)` перед возвратом, чтобы привести структуру к актуальному виду.
- Пока версия 0, `migrateToCurrent` просто вызывает канонизатор, но инфраструктура готова к будущим миграциям.

### 2.4. Экспорт и сборка
- Убедиться, что `packages/widget-config/package.json` экспортирует новые файлы (если нужен прямой импорт).
- Сборка: `pnpm --filter @lemnity/widget-config build`.

---

## 3. Сервер (NestJS)

### 3.1. DTO и сервис
1. Обновить `CreateWidgetDto`/`UpdateWidgetDto`, если добавлены новые поля на уровне API.
2. `widget.service.ts` и `project.service.ts` уже вызывают `migrateToCurrent`. При добавлении миграции логика не меняется.
3. В `config.service.ts`:
   - `validateAndCanonicalize` использует `canonicalizeWidgetConfig` + `validate`.
   - Если меняется формат ошибок, убедиться, что `BadRequestException` получает корректные `issues`.

### 3.2. Модели
- Если Prisma схема изменилась, выполнить:
  ```
  cd projects/server
  pnpm prisma generate
  ```

### 3.3. Проверки
- `pnpm --filter server lint`
- `pnpm --filter server test` / `test:e2e` по необходимости.

---

## 4. Клиент (React + Zustand)

Перед началом создайте папку `projects/client/src/layouts/Widgets/<WidgetName>/` и положите в неё preview/настройки/стили виджета.

### 4.1. Defaults и metadata
1. Создать файл `defaults.ts` для виджета: описать `widget`, `fields`, `display`, `integration`. Если нужны кастомные `display`/`integration`, добавить `build<Widget>DisplaySettings`/`build<Widget>IntegrationSettings` и экспортировать их.
2. Добавить metadata в `layouts/Widgets/<Widget>/metadata.ts` для:
   - Preview компонентов (`panel`, `desktop`, `mobile`).
   - Settings sections (ссылки на компоненты формы). Для `display`/`integration` секций создаём собственные компоненты и подключаем их в metadata, чтобы пользователь мог управлять этими панелями так же, как `fields`.

### 4.2. Store и slices
1. `widgetDefinitions.ts` — зарегистрировать `buildWidgetSettings`, `buildFieldsSettings`, `buildDisplaySettings`, `buildIntegrationSettings` и `settingsSurfaces`. Если для виджета `display` или `integration` кастомные, указываем `settingsSurfaces: { display: 'custom', integration: 'custom' }`, чтобы `buildDefaults` использовал соответствующие билдеры.
2. `widgetSlice.ts` — добавить actions через `create<Widget>Actions`.
3. Если нужны поля в `fields`, `display`, `integration`:
   - Обновить соответствующие slices/hooks (например, `fieldsSlice`, `displaySlice`).

### 4.3. Каноникализация и валидация
1. `normalize.ts` использует `mergeObjectsDeep` + `canonicalizeWidgetConfig`.
2. `widgetSettingsStore.ts`:
   - `snapshotNormalized` → defaults + `canonicalize`.
   - `validateNow` и `prepareForSave` → `validateCanonical` из пакета.
3. Ошибки (`Issue[]`) доступны через `useErrors` / `useVisibleErrors`, пути соответствуют zod схемам (например, `fields.template.key`).

### 4.4. UI-компоненты
1. Для каждого раздела настроек (`fields`, `display`, `integration`) делаем отдельный компонент; его CSS/модули держим рядом с компонентом в той же папке.
2. Использовать хуки из store (`useFieldsSettings`, `useDisplaySettings`, `useIntegrationSettings`, специализированные виджетовые хуки) для мутаций.
3. Preview должен читать `settings` через store или defaults с `withDefaults`, например:
   ```ts
   const widget = useWidgetSettingsStore(s => s.settings?.widget)
   const previewData = withDefaults(widget, buildWheelWidgetSettings())
   ```
   Если нужен полный конфиг, берём `useWidgetSettingsStore(s => s.settings)` и объединяем с `buildDefaults(id, type)`.

### 4.5. Тесты/проверки
```
pnpm --filter client lint:check
```
Во время разработки достаточно линта и ручного тестирования через vite dev server; production build собирается на CI/сервере.

---

## 5. API SDK

1. После правок в Prisma/DTO запустить общий генератор:
   ```
   pnpm generate:api
   ```
   Скрипт соберёт OpenAPI клиент (`packages/api-sdk`), чтобы новый `WidgetType` и DTO попали в `@lemnity/api-sdk`.
2. При необходимости отдельно пересобрать пакет: `pnpm --filter @lemnity/api-sdk build`.
3. Убедиться, что зависимости клиента/сервера подтягивают свежий SDK (они указывают `"workspace:*"`).
4. Если нужны новые вспомогательные методы, добавляем их в `packages/api-sdk/apis/*` и регенерируем SDK тем же скриптом.

---

## 6. Добавление нового поля/секции

1. **Schema**: обновить `widget-config`:
   - Добавить поле в соответствующую surface схему (или кастомную схему виджета).
   - При необходимости канонизации — поправить `canonicalize<Widget>`.

2. **Defaults**: обновить `build<Widget>Fields/Display` в клиенте.

3. **Store**: добавить setter в slices или actions.

4. **UI**: создать компонент поля в `/layouts/WidgetSettings/...` и подключить в metadata.

5. **Валидация**: убедиться, что zod‑ошибки отображаются корректно (путь должен совпадать с `prefix` в `useErrors`).

---

## 7. Отладка и миграции в будущем

- **Добавление миграции**: следовать шаблону в `migrations.ts`.
- **Проверка каноникализации**: можно вызвать `canonicalizeWidgetConfig` в node REPL/тесте на проблемном JSON.
- **Диагностика ошибок**: сервер возвращает `issues` с путями; клиент сопоставляет их с UI.
- **Сборка пакетов**:
  ```
  pnpm --filter @lemnity/widget-config build
  pnpm --filter @lemnity/api-sdk build
  pnpm --filter server lint
  pnpm --filter client lint:check
  ```

---

## 8. Чеклист при добавлении нового виджета

1. Тип в API/SDK.
2. Схема + канонизация в `widget-config`.
3. Defaults, metadata, actions в клиенте.
4. Preview/Settings компоненты.
5. Server DTO/Prisma (если требуется).
6. Сборки и линты всех пакетов.
7. Тестирование UI + проверка, что сервер принимает/отдаёт каноническую конфигурацию.

Следуя этим шагам, новый разработчик сможет добавить виджет, расширить surface или модифицировать существующие поля без риска нарушить единый источник истины или серверную валидацию. Если возникают специфичные требования (например, отдельные миграции или поверхностные схемы), использовать комментарии-шаблоны в `widget-config` и придерживаться подхода «канонизация → валидация → пересборки пакетов». 


