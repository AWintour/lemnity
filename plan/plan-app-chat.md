# Мобильный доступ операторов к чату — PWA-консоль + Telegram-бот (план)

> Дать операторам отвечать посетителям **с телефона**: видеть список диалогов, отвечать в
> реальном времени, слать/получать вложения, управлять статусом онлайн/офлайн. Диалоги и
> сообщения — те же `ChatConversation`/`ChatMessage`, realtime через socket namespace `/chat`
> (см. `plan-module-chat.md`, `plan-wid-chat.md`). **Статус: отложено, вернуться позже.**

## Контекст и решение

Сейчас оператор отвечает только из кабинета (десктоп): `pages/ChatsPage/ChatsPage.tsx` +
`hooks/useChatSocket.ts` (socket.io `/chat`). Нативного/мобильного кода нет; пушей и
email-оповещений о новых сообщениях — тоже.

Решение — **связка, не «или-или»**:
- **PWA** — мобильно-оптимизированная операторская консоль, ставится «на экран» прямо из
  кабинета (без App Store / APK). Переиспользует весь существующий React/socket/upload-код.
  Это и есть «скачиваемое приложение».
- **Telegram-бот** — надёжный слой уведомлений и быстрых ответов: пуши работают везде
  (включая iOS, где web-push в PWA капризен), оператор может ответить прямо из Telegram.

Готовая инфраструктура: модель `ChatSocialIntegration` (type telegram/max/vk), поле
`ChatConversation.channel`, а `ChatService.appendMessage` + `ChatGateway.broadcastMessage`
уже создают сообщение оператора и рассылают его в socket-комнаты — Telegram-ответ
переиспользует ровно этот путь.

## Этап 1 — Server: слой уведомлений + переиспользуемый relay

Новый модуль `projects/server/src/notifications/`:
- `notifications.module.ts` — регистрирует сервисы, импортируется в `chat/chat.module.ts`.
- Хук на новое сообщение посетителя: в `chat.service.ts` (`appendMessage`, ~строка 219)
  эмитим `@nestjs/event-emitter` событие `chat.message.created` `{ message, conversation }`
  только при `sender === 'visitor'`. Слушатель `NotificationService` решает, кого
  уведомить (Telegram + web-push) по `assignedOperatorId` / операторам проекта.
- `RelayService.relayManagerReply(conversationId, operatorUserId, { body, attachment? })` —
  единая точка ответа оператора из любого внешнего канала: `appendMessage({ sender:'manager',
  senderUserId })` → `ChatGateway.broadcastMessage(...)` (как REST-ответ в
  `chat.controller.ts:83`). Переиспользуется ботом и будущими каналами.

ENV в `projects/server/.env` (через `ConfigService`, как `JWT_SECRET` в `chat.gateway.ts:114`):
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.

## Этап 2 — Server: Telegram-бот (приём/отправка)

- Prisma: добавить `telegramChatId String? @map("telegram_chat_id")` в `ChatOperator`
  (`packages/database/prisma/schema/models/chat_module.prisma:6-36`) + миграция.
- Привязка: deep-link `https://t.me/<bot>?start=<token>`, токен генерим в кабинете;
  `/start <token>` находит оператора и сохраняет `telegramChatId`. Кнопка «Подключить
  Telegram» в мобильной консоли/настройках.
- `TelegramService`:
  - **Отправка** — при `chat.message.created` шлём оператору сообщение посетителя
    (текст + ссылка на вложение).
  - **Приём** — публичный webhook `POST /api/public/chat/telegram/webhook` (без `@Auth()`,
    открытый CORS — как `chat/public-chat.controller.ts`), проверка заголовка
    `X-Telegram-Bot-Api-Secret-Hash`. По `from.id` → оператор → его активный диалог →
    `RelayService.relayManagerReply(...)`.
  - **Вложения из Telegram** — скачать через Bot API → `S3Service.putObject`
    (`users/{operatorUserId}/files/...`, как в `files/files.controller.ts:100`) →
    `attachmentUrl` в relay.
- Библиотека: `telegraf` либо прямые вызовы Bot API через `fetch` (без новой зависимости).

## Этап 3 — Server: web-push (PWA на Android/десктопе)

- Хранилище подписок: модель `PushSubscription` (userId + endpoint + keys). Эндпоинты
  `POST /api/chat/push/subscribe` / `unsubscribe` под `@Auth()`.
- `WebPushService` (`web-push` lib, VAPID) — пуш при `chat.message.created` подписанным
  операторам. На iOS основной канал пушей — Telegram.

## Этап 4 — Client: PWA-обвязка

- `vite-plugin-pwa` в `projects/client/vite.config.ts`: `manifest` (имя, иконки 192/512,
  `display: standalone`, `start_url: /m/chats`), service worker (autoUpdate).
- Иконки + meta (`theme-color`, `apple-touch-icon`, `apple-mobile-web-app-capable`) в
  `index.html` и `projects/client/public/`.

## Этап 5 — Client: мобильная консоль `/m/chats`

- Роут в `App.tsx` (~107-120) под `<ProtectedRoute>`, **без** `DashboardLayout` — свой
  мобильный layout.
- Переиспользовать: `hooks/useChatSocket.ts`, `services/chats.ts`, `api/upload.ts`
  (`uploadFile`).
- UX: одно-колоночная навигация **список ↔ тред** (а не две колонки как на десктопе),
  переключение через `useIsMobileViewport` (`hooks/useIsMobileViewport.ts`). Компоненты
  `ConversationListItem` / `MessageThread` / composer вынести из ChatsPage в
  переиспользуемые и применить в обоих layout'ах.
- Композер с вложениями (картинки/видео/файлы).
- Тоггл статуса work/lunch/away/rest через operators-CRUD (`services/chatModule.ts`, PUT
  оператора); presence online/offline для посетителей уже отрабатывает через
  socket-подключение.
- Регистрация web-push подписки + запрос разрешения (Этап 3).

## Этап 6 — Client: точка установки в кабинете

- В `ChatsPage.tsx` (или новой вкладке настроек) — блок «Мобильное приложение оператора»:
  QR-код + ссылка на `/m/chats` («Добавить на экран») и кнопка «Подключить Telegram»
  (deep-link из Этапа 2).

## Проверка

- **Telegram (приоритет):** бот с тестовым токеном, webhook на dev-URL (туннель), привязка
  оператора через `/start <token>`; сообщение посетителя из виджета → оператор получил пуш
  в Telegram; ответ из Telegram (текст и фото) → появился у посетителя в реальном времени и
  сохранён с `sender=manager`.
- **PWA:** собрать клиент, открыть `/m/chats` с телефона, «Добавить на экран», проверить
  список, ответ, вложения, смену статуса; на Android — web-push при закрытом приложении.
- **Регресс:** десктопный `ChatsPage.tsx` работает как раньше (общие компоненты не сломали
  двухколоночную раскладку).
- Тесты: на `RelayService` и telegram-webhook (валидный/невалидный secret, привязка по
  `from.id`, relay в appendMessage+broadcast).

## Порядок и заметки

1. Серверный relay + Telegram (Этапы 1–2) — даёт мобильность быстрее всего, переиспользует
   готовый pipeline сообщений.
2. Web-push (Этап 3) — Android/десктоп; на iOS пуши через Telegram.
3. PWA (Этапы 4–6) — полноценная консоль, нового бизнес-кода минимум (в основном layout +
   установка).
