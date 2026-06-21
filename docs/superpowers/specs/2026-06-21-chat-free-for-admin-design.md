# Чат бесплатно для админа — дизайн

Дата: 2026-06-21

## Цель

Сделать «Модуль Чат» полностью бесплатным для администраторов: админ получает
доступ как на тарифе **agency** (все фичи, без лимитов) и его виджеты **не
истекают** (не требуют оплаты). Админ определяется существующей функцией
`isAdminUser(email, role)` (`projects/server/src/common/admin.ts`): email в
allowlist (`ADMIN_EMAILS`) ИЛИ `role === 'ADMIN'`.

## Контекст / как устроено сейчас

Все платные гейты чата сходятся в одну точку —
`ChatSubscriptionService.getActiveEntitlementByUserId(userId)`
(`projects/server/src/lemnity/chat-subscription.service.ts`). Через неё читают:

- брендинг «Сделано на Lemnity» — `enforceChatBranding` (`widget.service.ts:467`)
- лимит операторов — `assertCanAddOperator` (`feature-access.service.ts:68`)
- каналы MAX/VK — `chat-social.service.ts:97`
- раздел тарифа в редакторе — `GET /chat/subscription` (`chat.controller.ts:100`)

Метод сейчас никогда не возвращает null: без активной подписки → `FREE_CHAT_ENTITLEMENT`.

Единственный гейт **мимо** entitlement — публичный эмбед `WidgetService.findPublic`
(`widget.service.ts:348`). Он без авторизации, поэтому читает только сохранённый
в строке виджета `paidUntil`. Виджет создаётся с 5-дневным триалом
(`widget.service.ts:277`: `paidUntil = now + 5 дней`). В `findPublic` действует
правило: активен, если `paidUntil > now` ИЛИ `paidUntil = null` (grandfather —
«бессрочно бесплатный», не ломаем старые виджеты).

## Решение

Один смысл — «админ = agency + бессрочно», две точки внедрения.

### 1. Авторизованные гейты — admin-aware entitlement (одна правка)

В `getActiveEntitlementByUserId` расширить выборку юзера полями `email, role`.
Если `isAdminUser(email, role)` — сразу вернуть новую константу
`ADMIN_CHAT_ENTITLEMENT` (определить в `chat-entitlement.ts`):

```ts
export const ADMIN_CHAT_ENTITLEMENT: ChatEntitlement = {
  planTier: 'agency',
  siteLimit: 999999,
  managerLimit: 999999,
  aiDailyLimit: 999999,
  paidUntil: null
}
```

Это автоматически: снимает принудительный брендинг (`chatPlanFeatures('agency').whiteLabel`),
открывает все каналы, убирает лимиты операторов/AI и заставляет редактор показать
тариф «agency» со всеми фичами. Больше нигде ничего менять не нужно — все
перечисленные гейты уже читают отсюда.

Проверка идёт первой, до запроса `chatSubscription` (короткое замыкание).

### 2. Публичный эмбед — `paidUntil = null` при создании виджета админом

`WidgetController.create` уже получает `email` и `role`. Прокинуть булев флаг
`isAdmin` (вычисленный через `isAdminUser(email, role)`) в `WidgetService.create`.
В `create` для админа ставить `paidUntil = null` вместо `now + 5 дней`. Правило
**type-agnostic**: бессрочны любые виджеты, созданные админом (админ — внутренний
аккаунт). `null` уже honored в `findPublic`, read-путь не меняется.

Сигнатура: `create(dto, userId, isAdmin = false)`. Дефолт `false` сохраняет
существующие вызовы/тесты.

### 3. Бэкфилл существующих виджетов админа

Одноразовый standalone-скрипт `projects/server/scripts/backfill-admin-widgets-paid-until.ts`
(запуск вручную, напр. `npx tsx`). Логика:

1. Собрать admin-юзеров: `role === 'ADMIN'` ИЛИ `email ∈ ADMIN_EMAILS`
   (переиспользовать список из `common/admin.ts`, env `ADMIN_EMAILS`).
2. Для их проектов выставить `widget.paidUntil = null`
   (`prisma.widget.updateMany({ where: { project: { userId: { in: adminIds } } }, data: { paidUntil: null } })`).
3. Залогировать число обновлённых строк. Идемпотентен.

## Тесты

- `chat-subscription.service` (новый/расширенный спек): admin (по email и по
  `role='ADMIN'`) → `ADMIN_CHAT_ENTITLEMENT` (agency); не-admin без подписки → free;
  не-admin с активной подпиской → её entitlement (регресс не затронут).
- `widget.service.create`: админ → `paidUntil === null`; обычный юзер → `paidUntil ≈ now+5д`.
- Существующие `widget-chat-branding.spec.ts` остаются зелёными (обычный free-юзер
  по-прежнему получает принудительный брендинг).

## Вне объёма (YAGNI)

- `getByEmail` (read-эндпоинт для lmntai) не трогаем — это зеркало внешней подписки
  по email; UI редактора берёт фичи из `GET /chat/subscription` → уже покрыт п.1.
- Полноценная ролевая модель/UI управления админами.
