# Модуль «Чат» — рабочее место оператора (план)

> Полноэкранный раздел кабинета для продавца/оператора: общение с посетителями, управление
> диалогами, операторами, отделами и интеграциями. Появляется в сайдбаре кабинета при включённом
> виджете чата (CHAT). Связан с виджетом «Чат» (см. `plan-wid-chat.md`): диалоги/сообщения —
> те же `ChatConversation`/`ChatMessage`, realtime через socket namespace `/chat`.

## Вход и маршрутизация

- **Сайдбар кабинета** (`layouts/DashboardLayout/NavigationSidebar.tsx`): пункт **«Модуль Чат»**
  (с бейджем непрочитанных) показывается при наличии включённого CHAT-виджета (`hasEnabledChat`),
  ведёт на `/chat-module`. Active-detection учитывает `/chat-module`.
- **Маршрут** (`App.tsx`): `/chat-module` → `ChatModulePage` под `ProtectedRoute`, **без**
  `DashboardLayout`/`FullWidthLayout` — у модуля собственная полноэкранная раскладка.
- **Превью-стенд** (как у редактора): `preview/chat-module.html` + `src/__preview__/chat-module.tsx`
  рендерят `<ChatModulePage preview />` с мок-данными (без авторизации/сети).
  URL: `http://localhost:5173/preview/chat-module.html`.

## Файлы

- `projects/client/src/pages/ChatModulePage/ChatModulePage.tsx` — вся страница (модуль-сайдбар,
  разделы, инбокс, переписка, панель информации; подкомпоненты внутри одного файла).
- `projects/client/src/__preview__/chat-module.tsx`, `preview/chat-module.html` — превью.
- Использует существующее: `hooks/useChatSocket.ts` (manager-socket `/chat`), `services/chats.ts`
  (REST: список/история/ответ/статус), типы `ChatConversation`/`ChatMessage`.

## Визуальный язык

Под платформу: акцент `primary #1A52DB`, фон сайдбара/инбокса — `sidebar-bg` (#F7F9FF), границы
`border-default-200`, приглушённый текст `text-default-400`, радиусы 10/12/14px. Иконки — инлайн-SVG
(helper `Ic`). Виджетный бренд (#5951E5) здесь НЕ используется (это окно посетителя, отдельно).

## Раскладка (раздел «Входящие»)

Четыре колонки слева направо:
1. **Модуль-сайдбар** (`ModuleSidebar`, w-60): заголовок «Модуль "Чат"» + **кнопка-шеврон
   «свернуть/развернуть»** (свёрнутый режим w-72px: иконки с тултипами, подписи/селектор чата
   скрыты, badge «Входящие» → точкой; состояние `sidebarCollapsed`); навигация
   (Входящие+badge, Диалоги, Соцсети, разделитель, Асистент, Операторы, Отделы) — переключают
   `section`; внизу «Документация» (ссылка help.lemnity.ru) + блок техподдержки: **«Написать»
   открывает попап обратной связи** `FeedbackPopover` (как «идеи и предложения» в шапке ЛК,
   `POST /feedback`) + email.
2. **«Мои входящие»** (w-360, `sidebar-bg`): дропдаун **статуса оператора** (💼 В работе /
   🥪 На обеде / 👣 Отошёл / 🏠 Отдыхаю, с цветной точкой и меню); карточка «Общий чат операторов»;
   «Все диалоги N» + поиск; список диалогов (аватар, имя/`Клиент #N`, превью, точка непрочитанного,
   время, иконка канала + стрелка). Клик → выбор диалога.
3. **Переписка** (flex-1): шапка (аватар + имя клиента); лента с разделителями по дням, пузыри
   (оператор — `bg-primary/10`, клиент — `bg-default-100`) + дата-время; композер «Введите текст»
   с 📎/🙂/🖼️ (выбор файла, вставка эмодзи) и «Отправить». **Индикатор набора:** при вводе
   композер шлёт сокет-событие `operator:typing` (дебаунс: `typing=true` при наборе, `typing=false`
   через 2с паузы или при отправке) — у посетителя виджет показывает «Оператор набирает текст…».
4. **«Информация:»** (w-340): ⋮ (обновить); «Завершить» (→ статус `closed`) + ✨ (вставить
   подсказку в ввод); **строка-источник** (иконка канала + «Название чата · Канал» — с какого
   чата-виджета и по какому каналу идёт диалог); чек-лист контактов клиента + «Запросить»;
   «Информация о беседе» — select статуса; «Заметки» (комментарий); «Передать оператору»;
   «← В кабинет».

## Разделы (вкладки сайдбара)

- **Входящие** — рабочая раскладка (4 колонки выше).
- **Диалоги** (`DialogsSection`) — таблица всех диалогов: тулбар (Выбрать все+счётчик,
  Не прочитано (приглушённая, конверт с точкой), Прочитано (открытый конверт), Назначить оператора
  (человек+)); строки на CSS-grid (inline `gridTemplateColumns`) — чекбокс | клиент | время+канал |
  **статус-дропдаун** (цветная точка: Первичный контакт/Повторное обращение/Завершен с успехом/
  В работе/Спам) | **время реакции** (⚡/🙁/🚀/💀 + текст) | **канал** (Апп ВК/Чат на сайте/Апп
  Телеграм). Фильтр Все/Непрочитанные, выбор строк, смена статуса, отметка прочитано; клик по
  диалогу → открыть во «Входящих».
- **Соцсети** (`SocialSection`) — интеграции: **Telegram**, **MAX**, **ВКонтакте** — карточки
  (иконка, название, описание, статус «Подключено», кнопка Подключить/Отключить).
- **Операторы** (`OperatorsSection`) — список менеджеров (аватар+онлайн, имя, email, роль, статус,
  ✕ удалить); «Добавить оператора» → форма в одну строку (Имя + Email + Пароль с кнопкой «показать/скрыть» + роль + отдел + чат); под формой — подсказка-ссылка для входа операторов `app.lemnity.ru/operator`. Клик по оператору →
  **Архив оператора**: карточка + статистика (Активных диалогов / Сообщений за день / Решено) +
  **«Среднее время ответа»** со шкалой-градиентом **плохо → отлично** + список «Архив диалогов»
  (клик → открыть во «Входящих»); ← назад к списку.
- **Отделы** (`DepartmentsSection`) — группы для распределения чатов (Техническая поддержка,
  Коммерческий отдел, Общие вопросы): иконка, название, описание, число операторов, ✕ удалить;
  «Добавить отдел» → форма (название + описание).
- **Асистент** — пока заглушка «Раздел в разработке» (ИИ-ассистент; связан с блоком «Аи агент»
  редактора). **TODO**.

## Бэкенд командных разделов (реализован 2026-06-13)

Командные сущности модуля получили полноценный бэкенд (выбран вариант «полный бэкенд»).

**Prisma** (`packages/database/prisma/schema/models/chat_module.prisma` + расширение `chat.prisma`):
- `ChatOperator` (projectId, name, email?, role, avatarUrl?, online, status, departmentId?),
- `ChatDepartment` (projectId, name, description?, ← операторы по departmentId),
- `ChatDistributionSettings` (одна строка/проект: enabled, method, how, operatorIds[]),
- `ChatSocialIntegration` (@@unique[projectId,type]: telegram|max|vk, connected, config Json?),
- `ChatGroupMessage` (внутренний чат операторов: projectId, operatorId?/senderUserId?, body),
- `ChatConversation` +поля: `assignedOperatorId`, `channel`, `category`, `note`.
- На прод схема применяется через **`prisma db push`** (deploy.sh), не migrate deploy — поля
  аддитивные/nullable, безопасно.

**NestJS** (по образцу `manager`-модуля, owner-check по проекту, `@Auth`):
`chat-operator`, `chat-department`, `chat-distribution`, `chat-social`, `chat-group` —
маршруты `/projects/:projectId/chat/{operators|departments|distribution|integrations|group-messages}`;
зарегистрированы в `app.module`. `chat` расширен: `updateConversation` (status/assignedOperatorId/
category/note/channel), `ChatConversationEntity` отдаёт visitorPhone/visitorEmail + новые поля.

**Клиент**: `services/chatModule.ts` (operators/departments/distribution/social/group +
`updateConversationFields`) и `endpoints.ts` блок `CHAT_OPS`. Активный проект модуль берёт из
`useProjectsStore` (первый проект с включённым CHAT-виджетом).

## Данные: реальное vs мок (после вайринга 2026-06-13)

| Раздел / блок | Источник | Бэкенд |
|---|---|---|
| **Входящие** (список/тред/отправка/«Завершить»/бейдж) | РЕАЛЬНЫЙ (`services/chats` + `useChatSocket`) | есть |
| Фильтр Все/Непрочитанные/Завершённые, поиск, `inboxCount` | РЕАЛЬНЫЙ | есть |
| Инфо-панель: контакты клиента | РЕАЛЬНЫЙ (`visitorName/Phone/Email` из диалога) | есть |
| Инфо-панель: источник (название чата + канал) | РЕАЛЬНЫЙ (`widgetId`→`chatLabel`, `channelOf`) | есть |
| Инфо-панель: категория-статус + заметка | РЕАЛЬНЫЙ (`updateConversationFields`) | есть |
| Передача/назначение оператора | РЕАЛЬНЫЙ (`updateConversationFields {assignedOperatorId}`) | есть |
| **Операторы** (список/добавить/удалить/настройки) | РЕАЛЬНЫЙ (`chat-operator` CRUD) | есть |
| **Отделы** (список/добавить/удалить, состав) | РЕАЛЬНЫЙ (`chat-department` CRUD) | есть |
| **Соцсети** (Telegram/MAX/VK подключение) | РЕАЛЬНЫЙ (`chat-social`) | есть |
| **Автораспределение** (вкл/метод/как/операторы, «Сохранить») | РЕАЛЬНЫЙ (`chat-distribution`) | есть |
| **Групповой чат операторов** (сообщения) | РЕАЛЬНЫЙ (`chat-group`) | есть |
| **Настройки** (секции редактора + Сценарий + Автораспределение) | РЕАЛЬНЫЙ (виджет-стор + кнопка «Сохранить») | есть |
| Статистика/графики нагрузки оператора, статусы 💼/🥪/👣/🏠 | МОК (нет бэкенда) | нет |
| Канал/время-реакции в «Диалогах» (`MOCK_DIALOG_META`) | МОК | нет |
| Архив медиа группового чата (фото/медиа/документы) | МОК | нет |
| **Асистент** | заглушка | нет |

> В `preview` все секции по-прежнему на мок-константах (стенд без сети/авторизации). Реальные
> загрузки гейтятся `!preview && activeProjectId`; все вызовы в try/catch (сбой запроса не роняет
> страницу).

## Гейт доступа (на время тестирования)

«Чат» в каталоге виджетов (`ADMIN_ONLY_WIDGETS`), пункт «Модуль Чат» в сайдбаре и маршруты
`/chat-module` и `/chats` — **только администратору** (хук `hooks/useIsAdmin`: роль `ADMIN`
или email из `VITE_ADMIN_EMAILS`, дефолт включает `lemnitycom@gmail.com`). Снять при открытии всем:
убрать `WidgetTypeEnum.CHAT` из `ADMIN_ONLY_WIDGETS` (`ProjectWidgetsPage`) и админ-условия в
`NavigationSidebar`/`App.tsx`.

## Осталось / бэкенд (TODO)

- Раздел **Асистент** (настройки ИИ).
- Реальная **статистика оператора** (активные/решено/среднее время ответа) и **онлайн-presence**
  операторов (модель есть — `online`/`status`, не агрегируется/не транслируется).
- **Применение** правил автораспределения к входящим (модель/настройки есть; авто-назначение
  нового диалога по очереди/нагрузке — не выполняется на appendMessage).
- ~~Приём сообщений соцсетей (Telegram/MAX/VK) в единую ленту~~ — **реализовано 2026-06-15** (см. секцию «Соцсети» ниже).
- Канал/время-реакции на уровне диалога (поле `channel` есть; `MOCK_DIALOG_META` в «Диалогах` ещё мок).
- Realtime для групп-чата/назначений (сейчас REST; socket-события не добавлены).
- Загрузка файлов оператором + архив медиа группового чата.

## Маршруты разделов + аналитика беседы (2026-06-14, commit `5f35475`)

- **Разделы через URL**: каждый раздел модуля — свой маршрут `/chat-module/:section`
  (`App.tsx`). `ChatModulePage` читает раздел из `useParams` (в preview-стенде нет `<Routes>` →
  там стейт `previewSection`); `ModuleSidebar`/`onOpen` ходят через `navigate`. Переключение —
  реальная навигация: работают «обновить»/«назад», состояние под-разделов сбрасывается.
- **Расширенная аналитика беседы (офлайн, без внешних API)**: `projects/server/src/common/visitor-meta.ts`
  парсит IP, браузер/ОС (`ua-parser-js`), устройство, источник (referer), гео по IP (`geoip-lite`,
  оффлайн-БД). Захватывается ОДИН РАЗ при создании беседы (`public-chat.controller` + `chat.gateway`
  handshake → `chat.service.getOrCreateConversation`). Новые nullable-поля `ChatConversation`
  (`ip/userAgent/browser/os/deviceType/referer/country/region/city/timezone`) — в entity и
  клиентском типе. Карточка беседы (`DialogCard`) показывает их **только** в событии «Зашёл на
  сайт» правой колонки (IP, браузер, ОС, устройство, местоположение, часовой пояс, источник);
  левый «Профиль клиента» — контакты + статус/канал/заметка (без дублирования визит-метаданных).
  Заглушка «пока не собирается» удалена. Старые беседы без метаданных → «—».
  ⚠️ Зависимости `ua-parser-js`/`geoip-lite` в `pnpm-lock.yaml` (CI `--frozen-lockfile`); geoip-lite
  держит БД в памяти (десятки МБ). Прод применил поля через `db push`.

## Синхронизация «Настройки» модуля ↔ редактор + источник диалога (2026-06-14)

Раздел **«Настройки»** модуля и редактор виджета (`EditWidgetPage` + `layouts/Widgets/Chat/*`)
работают поверх одного `useWidgetSettingsStore` и одного `projectsStore`. Правки в
`ChatModulePage.tsx`:

- **Кнопка «Сохранить» в `SettingsSection`** (подраздел «Настройки»). Раньше секции редактора
  писали только в стор/localStorage-черновик → изменения никуда не уходили. Теперь
  `handleSaveSettings` (по образцу [`EditWidgetPage.handleSave`](../projects/client/src/pages/EditWidgetPage.tsx))
  делает `prepareForSave → saveWidgetConfig(chatSel, widgetId) → clearPersistedDraft → init`. Кнопка
  стоит под навигацией «Настройки/Сценарий/Автораспределение». *(Подразделы «Сценарий» и
  «Автораспределение» сохраняются сами — `ScenarioEditor`/`AutoDistributionPanel`.)*
- **Активна только при изменениях.** `dirty` = снимок `settings.widget` в сторе ≠ «базовой»
  сигнатуры (`baselineRef`/`markClean`), которая фиксируется при загрузке виджета и после успешного
  сохранения. Нет правок → кнопка `disabled`.
- **Двусторонняя синхронизация конфига.** Init-эффект `SettingsSection` переинициализирует стор не
  только при смене `widget.id`, но и при изменении `widget.config` (через `appliedRef` с
  `JSON`-сигнатурой) — правки из редактора подтягиваются в модуль и обратно. На входе в
  `ChatModulePage` зовётся `loadProjects()` (а не кэширующий `ensureLoaded()`), чтобы конфиг был
  свежим после перезахода/смены вкладок.
- **Источник диалога в панели «Информация».** Карта `chatNameByWidgetId` (все CHAT-виджеты →
  `chatLabel`) + `channelOf`/`CHANNEL_LABEL`/`ChannelIcon` дают строку «Название чата · Канал»
  (Сайт / Telegram / ВКонтакте) под кнопками «Завершить/✨». Серверных правок не нужно — у диалога
  уже есть `widgetId` и `channel`. В preview канал берётся из `MOCK_DIALOG_META` (у мок-диалогов
  `channel` не задан), сохранение в preview недоступно (alert вместо запроса).

## Пакет багфиксов виджета/сценария (2026-06-15)

Правки по обратной связи реального использования (клиент + сервер):

- **Редактор сценария — потеря фокуса при вводе** (`ScenarioEditor.tsx`): `signature` пересборки
  графа сделана СТРУКТУРНОЙ (без `message`/`label`), а текст сообщения/кнопки переведён на
  локальный стейт (`StepNode`/новый `ButtonRow`). Ввод больше не ремаунтит ноду react-flow.
- **Название чата в кабинете** (`ChatModulePage.tsx`): лейбл выбранного чата в селекторе
  `SettingsSection` берётся из живого стора (`config.title`) — обновляется сразу при вводе/сохранении
  (`chatsForSelect`).
- **Виджет: первый экран — только кнопки** (`embedded/Widget.tsx`): лента сообщений рендерится
  только на `view==='chat'`, кнопки сценария — только на `view==='home'`; автоскролл гейтится чатом.
  Кнопки сценария в режиме чата больше не висят. _(Обновлено 2026-06-15, commit `a7d55df` — кнопки
  теперь показываются и в переписке; см. секцию «Батч улучшений виджета/сценария» ниже.)_
- **Битые картинки** (`embedded/Widget.tsx`): аватары/лого и картинка шага получили `onError`-фолбэк
  (`ImgWithFallback` / локальный флаг в `MessageBubble`) — вместо «сломанного изображения» инициал/
  иконка. Аватар шапки берётся из реального оператора (`/api/public/chat/operators`), а не из конфига.
- **Вложения в живом чате** (`embedRuntime.tsx`, `useChatConnection.ts`): реализован `onAttach`
  (`uploadImage` → оптимистичное сообщение → `sendAttachment` → `message:send` с `attachment*`).
  Сервер (`chat.gateway`) уже принимал вложения визитёра — доработок не потребовал.
- **Завершение оператором** (`chat.gateway.notifyClosed` + `chat.controller` при `status:'closed'`):
  сервер шлёт `conversation:closed` в комнату диалога; виджет (`useChatConnection.onClosed` →
  `embedRuntime`) показывает системное «Оператор завершил беседу» и состояние `ended`.
- **«Начать беседу»** (`Widget.tsx` + `embedRuntime.handleRestart`): при `ended` вместо поля ввода —
  кнопка, сбрасывающая на главный экран (`resetConversation`). Новый диалог переоткрывается на
  сервере автоматически — `appendMessage` ставит `status:'open'`.

## Батч багфиксов №2 (2026-06-15): аватар, завершение, название, мультивложения

- **Аватар оператора — единый фолбэк** (`embedded/Widget.tsx`): `headerAvatarInitial` теперь всегда
  инициал оператора (не 🤖), `useChatConnection` префиксует относительный `avatarUrl` origin'ом API.
  Если фото всё равно не грузится в embed — проверять публичность S3 (объекты должны быть public-read).
- **Завершение у оператора** (`ChatModulePage.tsx`): кнопка «Завершить» при `status==='closed'` —
  серая/неактивная, текст «Завершено»; в треде плашка «Беседа завершена». Закрытие шлёт PATCH на тот
  же эндпоинт, что и `notifyClosed` → посетитель получает «Оператор завершил беседу».
- **Название чата во всех селекторах** (`ChatModulePage.tsx`): единый `labelOf` с live-override по
  `widget.id` из виджет-стора — применён в `dialogChats`, `chatNameByWidgetId`, селекторе настроек.
  Переименование видно сразу во всех списках, после Save — и из `projects`.
- **Мультивложения оператора (до 10) + текст одним сообщением, галерея**:
  - Prisma `ChatMessage.attachments Json?` (массив `{url,type,name}`); `db push` (аддитивно).
  - Сервер: `appendMessage`/`toMessageEntity`/gateway `message:send`(manager)/REST `reply`/
    `SendMessageDto` принимают и отдают `attachments[]` (single-поля — back-compat, дубль первого).
  - Клиент-оператор: стейджинг до 10 файлов (выбор НЕ шлёт сразу), превью с удалением, отправка
    `body + attachments` одним сообщением (`useChatSocket.sendMessage` +`attachments`).
  - Рендер: `MessageAttachments` (тред оператора) и `MessageBubble` (виджет) — картинки сеткой 2 кол.
    + файлы-чипсы. Посетитель шлёт по-прежнему одиночно, но галерею от оператора видит.

## Отдача загруженных файлов через бэкенд (2026-06-15)

Раньше `/uploads/<key>` (аватары/лого/картинки шагов/вложения) отдавались nginx напрямую из MinIO и
зависели от анонимной политики бакета (`mc anonymous set download`), которая на проде не срабатывала
→ картинки не грузились нигде (в кабинете показывалось только blob-превью сразу после загрузки).

Теперь файлы отдаёт **бэкенд**: nginx `location /uploads/` → `http://backend/api/public/uploads/`,
публичный `PublicUploadsController` (`@Get('*splat')`, без `@Auth`) стримит объект из MinIO через
`S3Service.getObject(S3_BUCKET_UPLOADS, key)` теми же кредами, что и при загрузке. URL прежний
(`https://<host>/uploads/<key>`) — ранее сохранённые ссылки в БД продолжают работать; не зависим от
анонимной политики бакета. Защита от `..`-traversal. Файлы: `storage/s3.service.ts` (+`getObject`),
`files/public-uploads.controller.ts`, `files/files.module.ts`, `projects/nginx/nginx.conf`.

**Битый аватар оператора = `blob:`-URL в БД.** Отдельно нашлось: у оператора в `avatarUrl` лежал
`blob:https://…` (временная браузерная ссылка из старой сборки) — он не грузится нигде → инициал.
Защита: `chat-operator.service.sanitizeAvatarUrl` (только `http(s)://`/`/…`; `blob:`/`data:`/пустое →
`null`, очищает битое) в create/update; клиент (`saveSettings`) шлёт постоянную ссылку или `''`
(стирает). Существующий битый аватар нужно **перезагрузить** (исходный blob уже недоступен).
Дополнительно: загрузка аватара блокирует кнопки «Загрузить аватар»/«Сохранить» (`avatarUploading`),
чтобы Save не ушёл до завершения upload (иначе сохранялся старый/битый URL); ошибки `updateOperator`
теперь показываются алертом (раньше глушились), а после успеха оператор в UI синхронизируется ответом
сервера.

## Управление операторами по проектам + единый лейбл чата (2026-06-15)

- **Проект модуля = выбранный в сайдбаре чат.** Раньше Операторы/Отделы/Соцсети/Настройки/групп-чат
  были жёстко привязаны к ПЕРВОМУ проекту (`activeProjectId`) — в новый проект было не попасть.
  Теперь `activeProjectId` вычисляется из выпадашки «Чат» сайдбара (`dialogChat`): конкретный чат →
  его проект; «Все чаты» → первый (`firstChatProjectId`). Так можно добавлять операторов/отделы в
  любой проект, в т.ч. новый. Операторы/присутствие — **на уровне проекта** (новый проект стартует
  без операторов; присутствие «онлайн» требует, чтобы менеджер-сокет был подключён к комнате проекта —
  после создания проекта перезагрузить кабинет).
- **Единый лейбл чата во ВСЕХ селекторах.** `chatLabel`: `config.title` (Название чата) → имя проекта
  → имя виджета (кроме дефолтного «Чат») → «Чат». Применён везде, включая форму добавления оператора
  (`chatOptions` раньше шёл по своему правилу `widget.name` и игнорировал `config.title`). Чтобы у
  чата было осмысленное имя — задать «Название чата» в Настройках чата.

## Картинки → персональное хранилище (правило по умолчанию)

Аватар оператора (и картинки шага сценария, логотип компании) грузятся через
`@/api/upload.uploadImage` в S3 под персональным префиксом `users/{userId}/…` (лимит 5 МБ, статус
«Уменьшите размер файла (картинки)»); в `ChatOperator.avatarUrl`/конфиге — только URL, без base64.
Эндпоинт `/files/images` закрыт `@Auth()`. Подробно: `docs/instructions/image-storage.md`.

## Батч улучшений виджета/сценария (2026-06-15, commits `87e0b3a`, `a7d55df`)

- **Авто-переход шага сценария без кнопок** (`schema.ts`, `ScenarioEditor.tsx`, `embedRuntime.tsx`,
  `Widget.tsx`): у шага добавлено опциональное `next` (id след. шага). Если у шага НЕТ кнопок, но
  задан `next`, бот после паузы (`AUTO_ADVANCE_MS=1500`) сам показывает сообщение следующего шага —
  имитация живого набора с индикатором «печатает…» (`TypingBubble`, проп `typing`). В редакторе у
  шага без кнопок появляется `source`-handle `id="__next"` (рендерится только при пустых `buttons`);
  `buildEdges`/`onConnect`/`onEdgesDelete`/`onDeleteStep`/`signature` учитывают `step.next`. Защита
  от циклов — `autoChainRef` (сброс при ручном выборе и `resetConversation`).
- **Кнопки сценария — теперь и в переписке** (`Widget.tsx`): кнопки текущего шага рендерятся не
  только на `view==='home'`, но и в `view==='chat'` (режим бота; при живом операторе `chatActive` —
  скрыты). **Отменяет** прежнее решение из секции «Пакет багфиксов (2026-06-15)» («кнопки только на
  home»): шаги, достигнутые кликом или авто-переходом, оставались без кнопок. Теперь кнопки
  «подтягиваются» на любом уровне дерева.
- **Боковая панель — корректное отображение в превью и live** (`embedRuntime.tsx`, `Widget.tsx`,
  `ChatFloatingPreview.tsx`, `WidgetPreview.tsx`): панель `h-full` заполняет хост (раньше `100dvh`
  внутри обёртки с отступом → «криво» в превью). Обёртки превью для формата `sidebar` дают полную
  высоту вместо нижнего отступа; закрытый баббл-триггер в превью получил отступ как у модального.
- **Боковая панель — кнопка закрытия и триггер** (`Widget.tsx`, `DesktopWidgetTrigger.tsx`,
  `embedRuntime.tsx`): при открытой панели круглый баббл-триггер прячется (`hideTrigger`), а закрытие —
  круглой кнопкой, вынесенной **полностью за внутренний край** блока (`-left-12`/`-right-12`, сторона
  по `triggerPosition`). Внутренние крестики в шапке для sidebar убраны. Кликабельная зона iframe с
  внутренней стороны расширена (`innerPad=64`), чтобы вынесенная кнопка кликалась в реальном embed.
- **Растягиваемые текстовые поля** (`components/ResizableTextarea.tsx`): поле сообщения шага
  (`ScenarioEditor.tsx`) и поля «Оператор» имя/подзаголовок (`ChatHeaderSettings.tsx`) — ручной
  угловой ресайзер по высоте до 350px, дальше скролл (`resize-y` + `max-height` + `overflow-y-auto`).
- Спецификация авто-перехода: `docs/superpowers/specs/2026-06-15-scenario-step-autoadvance-design.md`.

## Соцсети — реальная двусторонняя интеграция (2026-06-15)

Раздел «Соцсети» теперь не флаг, а живое подключение Telegram/MAX/ВКонтакте с двусторонней перепиской.

**Архитектура** (`projects/server/src/chat-social/`):
- **Адаптеры** `adapters/` (обычные TS, без Nest DI — чтобы не плодить цикл модулей): `ChannelAdapter`
  (`validateCredentials`, `setupWebhook`, `removeWebhook`, `parseInbound`, `sendOutbound`) + реализации
  `telegram.adapter` (Bot API), `vk.adapter` (Callback API), `max.adapter` (Bot API, наследник TamTam).
  Реестр в `adapters/index.ts`.
- **Креды** шифруются (`common/crypto/secret-cipher`, `INTEGRATION_ENC_KEY`) и лежат в
  `ChatSocialIntegration.config = { tokenEnc, groupId?, webhookSecret, accountId, accountName, vkConfirmation? }`.
  Токен на клиент НЕ отдаётся (только `accountName` через `publicConfig`).
- **connect/disconnect** (`ChatSocialService`): валидация токена → `setupWebhook(url=${API_URL}/api/public/chat/webhooks/{type}/{secret})`
  → шифрованное сохранение; disconnect снимает вебхук и чистит config. Эндпоинты:
  `POST /projects/:projectId/chat/integrations/:type/connect|disconnect` (@Auth, owner-check).
- **Входящие** — публичный `SocialWebhooksController` (`POST /api/public/chat/webhooks/:type/:secret`, без @Auth,
  всегда быстрый ответ): резолв интеграции по секрету → `parseInbound` → `ChatService.getOrCreateExternalConversation`
  → `appendMessage(sender:'visitor')` → `ChatGateway.broadcastMessage` (live в модуле). VK confirmation и поле
  `secret`, Telegram заголовок `X-Telegram-Bot-Api-Secret-Token` — проверяются.
- **Исходящие** — хук в конце `ChatService.appendMessage` (`sender!=='visitor'`): `sendOutboundForConversation`
  (`chat-social/outbound.ts`, best-effort, не валит персист) шлёт ответ оператора в мессенджер по `channel`/`externalChatId`.
- **БД** (`chat.prisma`): в `ChatConversation` добавлены `externalUserId`/`externalChatId`,
  `@@unique([projectId, channel, externalUserId])` (ключ апсерта входящих) + `@@index([projectId, channel])`.
  Для мессенджер-диалогов синтезируется `sessionId = "${channel}:${externalUserId}"`, привязка к CHAT-виджету проекта.
- **Модули**: `ChatModule` экспортирует `ChatService`/`ChatGateway`; `ChatSocialModule` импортирует `ChatModule`
  (одностороннее, без forwardRef).
- **Фронт**: `SocialSection` (`ChatModulePage.tsx`) — модалка подключения (TG/MAX — токен бота; VK — токен
  сообщества + опц. ID группы), статус «Подключено» + имя аккаунта, «Отключить». Сервис `chatModule`:
  `connectIntegration`/`disconnectIntegration`.

**Требования окружения**:
- URL вебхука — публичный **HTTPS**. Базу берём из `API_URL`, иначе фолбэк `FRONTEND_URL + /api`
  (на сервере `API_URL` обычно не задан → используется `FRONTEND_URL`). Локально мессенджеры не достучатся
  до localhost → нужен ngrok.
- `INTEGRATION_ENC_KEY` — шифрование токенов (уже нужен для mango).
- ⚠️ **Telegram egress**: `api.telegram.org` часто заблокирован с РФ-хостинга. Прочие исходящие на сервере
  (коллектор/notisend/feedback) тоже на `fetch` и работают — проблема именно с Telegram. Если привязка даёт
  «Не удалось связаться с Telegram», задайте `TELEGRAM_API_BASE` (прокси/self-hosted Bot API). VK/MAX
  (российские) доступны напрямую. Все адаптеры — с таймаутом 10с и понятными сетевыми ошибками.

⚠️ Точные формы API VK (Callback) и MAX (Bot API) проверяются только на боевых вебхуках/реальном боте —
структуры `parseInbound`/`sendOutbound` могут потребовать донастройки против живых ответов.

## Деплой

Прод-деплой — push в `main` → GitHub Actions (`.github/workflows/CI-CD.yml`): сборка образов →
SSH на прод → `deploy.sh` (pull → `prisma db push` → up стека). Выкачено 2026-06-13 (commit
`82fd111` на `main`). Мониторинг: GitHub → Actions.

## Верификация

`pnpm -C projects/client start:dev` → `http://localhost:5173/preview/chat-module.html`
(все вкладки на мок-данных) или `/chat-module` в кабинете под админом (реальные данные через REST/socket).
`tsc -b --noEmit`, `lint`, `client build`, `embed build` — без ошибок.
