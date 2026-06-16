# Прайс на виджет «Чат» (CHAT) — дизайн тарифа и энфорсмент

> ⚠️ **ОБНОВЛЕНО 2026-06-16 — модель изменена и ОТГРУЖЕНА В ПРОД.** Изначальная flat-модель
> (1 290 ₽ + доп. оператор, разделы 1–2 ниже) **заменена на тарифную лестницу Free→Agency**
> (Вариант A). Действующая модель — в разделе **«2-bis. Действующая модель (shipped)»**. Разделы
> 1–2 и 5 оставлены как исторический контекст бенчмарка/обоснования. Энфорсмент в разделе 3
> переписан под лестницу (см. пометки «ОБНОВЛЕНО»).

> Дата: 2026-06-13. Источник цен — **lmntai** (lemnity.ru): конструктор тарифа, счёт Точка Банк,
> подписка как источник истины. В этом монорепо (server+client) — **только энфорсмент**: лимиты
> тарифа (операторы / AI-ответы в день / фичи) и носитель тарифа `ChatSubscription`. Зеркало
> паттерна Callback (см. [plan-wid-call.md](../../../plan/plan-wid-call.md), раздел «Монетизация»).

## 2-bis. Действующая модель (shipped, Вариант A)

**Тарифная лестница** вместо flat-базы — оптимизация под воронку: реальный Free + видимая лестница,
объём режется по **AI-ответам в день** (бьёт по затратам GPT-шлюза), а не по диалогам. Дифференциатор
против рынка: **AI-агент в каждом тарифе, включая Free**.

| Тариф    | Цена/мес | Сайтов | Операторов | AI-ответов/день | Доп. оператор |
| -------- | -------: | -----: | ---------: | --------------: | ------------: |
| Free     |      0 ₽ |      1 |          1 |              50 |             — |
| Start    |    590 ₽ |      1 |          1 |             150 |        +190 ₽ |
| Pro ⭐   |   1490 ₽ |      3 |          3 |             500 |        +290 ₽ |
| Business |   3490 ₽ |     10 |          5 |           1 500 |        +390 ₽ |
| Agency   |   7990 ₽ |     30 |         10 |       fair-use* |        +490 ₽ |

\* Agency — мягкий fair-use (sentinel `aiDailyLimit ≥ 100000`). Фича-гейты по `planTier`: все каналы /
white-label — со Start; расширенная аналитика / отделы — с Pro; API / приоритет — с Business.

**Ключевое следствие Free:** неоплаченный чат **НЕ блокируется** (откат на Free-лимиты), энфорсмент
переехал с «гейта обслуживания по оплате» на **лимиты тарифа**. Носитель — `ChatSubscription`
(`planTier`/`siteLimit`/`managerLimit`/`aiDailyLimit`/`extraManager`/`paidUntil`), зеркало
`CallbackSubscription`, но `planTier` вместо `modules` и `aiDailyLimit` вместо `callbackLimit`.
Цены/конструктор/счёт Точка — в lmntai (`lib/chat-subscription.ts`, `chat-subscription-builder.tsx`).

## 1. Бенчмарк РФ (онлайн-чат для сайта, 2026)

| Сервис | Модель | Цена | AI-бот |
|---|---|---|---|
| **Jivo** | за оператора/мес | Free до 5 операторов · Базовый ~742 ₽ · Профессиональный ~1 117 ₽ · Корпоративный ~2 617 ₽ (за оператора/мес при оплате за 24 мес, с НДС; помесячно дороже) | в старших тарифах, доплата |
| **Envybox** | за оператора/мес | 1 063 ₽ (3 мес) · 840 ₽ (год); сайтов без лимита; триал 8 дней | — |
| **Talk-Me** | за сотрудника/мес или pay-per-request | ~250 ₽/сотр./мес; оплата «за обращение»; free + 1 мес триал | — |
| **Carrot quest** | за аккаунт/мес + AI-модуль | Бизнес-чат ~1 680 ₽ · Автоматизация ~3 600 ₽; AI-бот — отдельный модуль по объёму вопросов | модуль, доплата |
| **Битрикс24** | часть CRM (открытые линии) | онлайн-чат бесплатно даже на free CRM (loss-leader) | BitrixGPT на платных |
| **AI-боты** (BotHelp, SmartBot) | подписка + AI-токены | от 290–990 ₽/мес + оплата токенов/ответов сверху | ядро продукта |

**Закономерности рынка:**
1. Базовая ось — **за оператора/мес**; вилка «живого» чата ~**840–1 120 ₽/оператор/мес**.
2. **AI-агент** почти везде — отдельная доплата по объёму (вопросы/токены).
3. **Омниканальность** (Telegram/VK/MAX) — либо в базе, либо отдельный модуль.

Источники: [jivo.ru](https://www.jivo.ru/), [a2is.ru/jivosite](https://a2is.ru/catalog/onlajn-chat/jivosite),
[envybox.io/онлайн-чат/price](https://envybox.io/products/onlayn-chat/price/),
[a2is.ru/talk-me](https://a2is.ru/catalog/onlajn-chat/talk-me),
[carrotquest.io/price](https://www.carrotquest.io/price/),
[bitrix24.by/features/olines](https://www.bitrix24.by/features/olines.php),
[bothelp.io/blog](https://bothelp.io/ru/blog/skolko-stoit-razrabotka-chat-bota).

## 2. Тариф «Чат» (принятое решение)

Модель — **flat-база за виджет + платный доп. менеджер** (per-widget `paidUntil`, как у остальных
виджетов Lemnity; ось «за менеджера» — через аккаунтный entitlement, зеркало Callback).

> Терминология: **менеджер = оператор** (один человек, отвечающий в чате). Поле entitlement —
> `managerLimit` (как в `CallbackSubscription`); раздел кабинета и plan-module-chat.md называют их
> «операторы». В этом спеке термины синонимичны.

| Позиция | Цена | Состав / расчёт |
|---|---|---|
| **База «Чат»** | **1 290 ₽/мес** | **1 менеджер**, realtime-чат, бот-сценарий, отделы, омниканальность (Telegram/MAX/VK), AI-агент (fair-use ~1 000 ответов/мес), 1 сайт |
| **+ доп. менеджер** | **+490 ₽/мес за каждого** | `managerLimit = 1 + extraManager` |

**Позиционирование на фоне РФ.** Первый менеджер «всё включено» за 1 290 ₽ — выше Jivo Базовый
(742 ₽) / Envybox (840 ₽), но у них AI и часть каналов идут доплатой, а здесь — в базе. Доп.
менеджер 490 ₽ ниже их per-seat (Jivo Pro 1 117 ₽/seat) — команда у Lemnity дешевеет: 3 менеджера =
1 290 + 980 = **2 270 ₽** против ~2 200–3 350 ₽ у Jivo/Envybox за 3 seat без AI; полный Carrot quest
(1 680 ₽ Бизнес-чат) обходим даже в комплектации с AI.

**Fair-use AI.** AI-агент жжёт реальные токены GPT через шлюз. При flat-базе расход неограничен,
поэтому — мягкий лимит **~1 000 AI-ответов/мес на виджет**: при превышении агент деградирует на
«передаю оператору», без отдельного счёта. Защищает маржу, не ломая обещание «всё включено».
Лимит — продуктовый (не отдельная позиция прайса); конкретный счётчик — пост-MVP вместе с AI-бэкендом.

**Блок «Функционал» и бейджи «Платно» в редакторе.** Сворачиваемый блок `chat.general` →
«Функционал» (`featuresEnabled`: `soundEnabled`, `blockAnonymousProxy`, **`brandingEnabled` =
white-label «отключить Сделано на Lemnity»**, `deferredLoad`) — **полностью входит в базу 1 290 ₽,
0 ₽ сверху**, включая white-label (в отличие от Callback, где `white_label` — модуль 1 490 ₽). Бейдж
«Платно» здесь означает не доплату, а «работает, пока виджет оплачен»: тумблеры действуют только при
`paidUntil > now` (или `null`-grandfather) — это уже обеспечивает гейт 3.1, отдельный механизм не нужен.
Тот же смысл у бейджа «Платно» на секции `chat.ai-agent`.

**Биллинг** — без нового механизма: per-widget `paidUntil` продлевается существующим вебхуком
`applySubscription` ([lemnity.service.ts:82](../../../projects/server/src/lemnity/lemnity.service.ts#L82)).
Каталог `getWidgetCatalog` уже содержит `CHAT`.

## 3. Энфорсмент (в этом репо)

### 3.1. Гейт обслуживания по оплате — ⚠️ ОТМЕНЁН (Free никогда не блокирует чат)

> **ОБНОВЛЕНО:** с появлением Free-тарифа `paidUntil`-гейт в `assertVisitorAllowed` **НЕ добавлен** —
> чат обслуживается всегда (Free = бесплатный тариф). Энфорсмент перенесён на лимиты тарифа:
> операторы (`assertCanAddOperator`), AI-ответы/день (`aiDailyLimit` → `/chat/ai-usage`), каналы
> (только Telegram на Free) и white-label — по `planTier`. Блок ниже — исторический замысел flat-модели.

`chat.assertVisitorAllowed` ([chat.service.ts:66](../../../projects/server/src/chat/chat.service.ts#L66))
сегодня проверяет `type:'CHAT', enabled, project.enabled` и origin, **но не `paidUntil`** — значит
неоплаченный/просроченный чат продолжает обслуживать посетителей и realtime. Это единственная точка
входа для публичной поверхности (и REST `POST /public/chat/conversations` + messages, и socket
`connectVisitor`), поэтому гейт добавляется ровно здесь:

```
where: { id, type:'CHAT', enabled:true, project:{ enabled:true },
         OR: [{ paidUntil: null }, { paidUntil: { gt: new Date() } }] }
```

Зеркало `widget.service.ts:52`. `paidUntil = null` — grandfather (созданы до тарификации) — остаётся
активным. **Кабинет оператора (приватный, по JWT) не трогаем** — гейт только на публичной стороне
посетителя.

### 3.2. Носитель лимита менеджеров — СЕЙЧАС (scaffold)

Аккаунтный entitlement по образцу `CallbackSubscription`
([callback_subscriptions.prisma](../../../packages/database/prisma/schema/models/callback_subscriptions.prisma),
[callback-subscription.service.ts](../../../projects/server/src/lemnity/callback-subscription.service.ts)).

Новая Prisma-модель `ChatSubscription` (ключ `lemnityUserId @unique`), зеркало присланного lmntai —
**не новый биллинг**:

```prisma
model ChatSubscription {
  id            String    @id @default(cuid())
  lemnityUserId String    @unique @map("lemnity_user_id")
  extraManager  Int       @default(0) @map("extra_manager")
  managerLimit  Int       @default(1) @map("manager_limit")   // = 1 + extraManager
  paidUntil     DateTime? @map("paid_until")
  lastPaymentId String?   @map("last_payment_id")             // идемпотентность вебхука
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt      @map("updated_at")
  @@map("chat_subscriptions")
}
```

- **Вебхук** `POST /api/lemnity/chat-subscription` — зеркало `callback-subscription`
  ([lemnity.controller.ts:99](../../../projects/server/src/lemnity/lemnity.controller.ts#L99)):
  HMAC-подпись `x-lemnity-signature`, soft-200 (плохая подпись/тело → `{ skipped }`),
  идемпотентность по `lastPaymentId`, апсёрт по `lemnityUserId`, продление `paidUntil`.
- **Сервис** `ChatSubscriptionService` — зеркало `CallbackSubscriptionService`:
  `applySubscription`, `getActiveEntitlementByUserId(userId, now)`, активность по `isSubscriptionActive`.
- **Проверка** `FeatureAccessService.assertCanAddOperator(userId)` — зеркало `assertCanCreateSite`
  ([feature-access.service.ts:25](../../../projects/server/src/lemnity/feature-access.service.ts#L25)):
  бросает `Forbidden` (`code: 'manager_limit_reached'`), если активный entitlement есть и
  `managerLimit` исчерпан; иначе no-op (сохранить текущее поведение для аккаунтов без подписки).
- **Точка применения** проверки — `assertCanAddOperator` **вызывается из будущего эндпоинта создания
  оператора** (бэкенд операторов — TODO в [plan-module-chat.md](../../../plan/plan-module-chat.md#L81)).
  Сейчас метод и entitlement существуют и принимают лимит из lmntai; проверка активируется без
  переделок, как только операторы появятся. До этого момента энфорсмент числа менеджеров — no-op.

### 3.3. Триал

Сейчас все виджеты при создании получают 5 дней
([widget.service.ts:270](../../../projects/server/src/widget/widget.service.ts#L270)). Для `CHAT`
(длиннее цикл оценки; у конкурентов 8–30 дней) — **14 дней**: ветвление по `type` в `createWidget`.

## 4. Документирование решения

- Блок **«Продуктовая модель (справочник; цены в lmntai)»** в раздел **Фаза 5 — тариф**
  [plan-wid-chat.md](../../../plan/plan-wid-chat.md) по образцу
  [plan-wid-call.md:498](../../../plan/plan-wid-call.md#L498): flat-база 1 290 ₽ (1 менеджер,
  всё включено) + доп. менеджер 490 ₽, fair-use AI, ссылка на энфорсмент (этот спек).

## 5. Что НЕ делаем (scope / YAGNI)

- ~~Не вводим модель-B «пакеты тарифов»~~ → ⚠️ **ОТМЕНЕНО:** выбрана и отгружена тарифная лестница
  Free→Agency (см. раздел 2-bis). Лимит по диалогам по-прежнему НЕ вводим — режем по AI-ответам/день.
- Не вводим отдельные платные модули (telegram/white_label/api_access) — всё в базе (в отличие от Callback).
- Не делаем счётчик AI-ответов и бэкенд операторов — это пост-MVP (см. plan-module-chat.md TODO);
  здесь только entitlement-носитель лимита и точка проверки.
- Цены/конструктор/счёт Точка — в lmntai, не в этом репо.

## 6. Верификация

- `chat.service.spec.ts` дополнить кейсом: `assertVisitorAllowed` → `NotFound`/отказ при `paidUntil < now`;
  проход при `paidUntil = null` и при `paidUntil > now`.
- `chat-subscription` вебхук — спек по образцу `callback-subscription.service.spec.ts`
  (HMAC ок/плохая подпись → skipped; идемпотентность по `lastPaymentId`; продление `paidUntil`).
- `FeatureAccessService.assertCanAddOperator` — спек: no-op без подписки; `Forbidden` при исчерпании
  `managerLimit`; проход в пределах лимита.
- Сборка: widget-config, api-sdk, client (tsc), server (nest build); `prisma validate` + `generate`.
