# Чат бесплатно для админа — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать «Модуль Чат» полностью бесплатным для админа — доступ как agency (все фичи, без лимитов) и виджеты админа не истекают.

**Architecture:** Все авторизованные платные гейты чата читают `ChatSubscriptionService.getActiveEntitlementByUserId`. Делаем её admin-aware (возвращает `ADMIN_CHAT_ENTITLEMENT` = agency/бессрочно). Публичный эмбед читает `widget.paidUntil` — при создании виджета админом ставим `null` (grandfather), плюс одноразовый бэкфилл уже созданных виджетов админов.

**Tech Stack:** NestJS, Prisma (PostgreSQL), Jest, TypeScript (nodenext ESM).

## Global Constraints

- Админ определяется ТОЛЬКО функцией `isAdminUser(email, role)` из `projects/server/src/common/admin.ts` (email ∈ `ADMIN_EMAILS` ИЛИ `role === 'ADMIN'`). Не дублировать эту логику.
- `getActiveEntitlementByUserId` НИКОГДА не возвращает null (контракт сохранить).
- `WidgetService.create` — новый параметр `isAdmin` идёт ТРЕТЬИМ со значением по умолчанию `false`, чтобы не ломать существующие вызовы и тесты.
- Запуск тестов сервера: `cd projects/server && npx jest <path>`.
- Бессрочность (`paidUntil = null`) применяется к ЛЮБОМУ типу виджета, созданному админом (не только CHAT).

---

### Task 1: Admin-aware chat entitlement

**Files:**
- Modify: `projects/server/src/lemnity/chat-entitlement.ts` (добавить константу)
- Modify: `projects/server/src/lemnity/chat-subscription.service.ts:134-163` (admin-ветка + select email/role)
- Test: `projects/server/src/lemnity/chat-subscription.service.spec.ts` (добавить describe)

**Interfaces:**
- Produces: `ADMIN_CHAT_ENTITLEMENT: ChatEntitlement` (экспорт из `chat-entitlement.ts`).
- Consumes: `isAdminUser(email?, role?)` из `../common/admin`; `ChatEntitlement`, `FREE_CHAT_ENTITLEMENT` из `./chat-entitlement`.

- [ ] **Step 1: Write the failing test**

В конце `chat-subscription.service.spec.ts` добавить новый describe-блок:

```ts
import { ADMIN_CHAT_ENTITLEMENT } from './chat-entitlement'

describe('ChatSubscriptionService.getActiveEntitlementByUserId — admin', () => {
  it('returns ADMIN_CHAT_ENTITLEMENT when user email is in the admin allowlist', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      lemnityUserId: null,
      email: 'lemnitycom@gmail.com',
      role: 'USER'
    })
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual(ADMIN_CHAT_ENTITLEMENT)
    expect(prisma.chatSubscription.findUnique).not.toHaveBeenCalled()
  })

  it('returns ADMIN_CHAT_ENTITLEMENT when user role is ADMIN', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      lemnityUserId: 'lm_1',
      email: 'someone@example.com',
      role: 'ADMIN'
    })
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual(ADMIN_CHAT_ENTITLEMENT)
  })

  it('returns FREE for a normal user (no admin email/role, no subscription)', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      lemnityUserId: null,
      email: 'someone@example.com',
      role: 'USER'
    })
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual(FREE_CHAT_ENTITLEMENT)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/server && npx jest src/lemnity/chat-subscription.service.spec.ts -t admin`
Expected: FAIL — `ADMIN_CHAT_ENTITLEMENT` не экспортируется / админ-ветки нет (возвращается FREE).

- [ ] **Step 3: Add the ADMIN_CHAT_ENTITLEMENT constant**

В `projects/server/src/lemnity/chat-entitlement.ts`, сразу после `FREE_CHAT_ENTITLEMENT` (после строки 39), добавить:

```ts
/**
 * Entitlement администратора: полный доступ как agency, без лимитов, бессрочно.
 * Применяется в getActiveEntitlementByUserId, когда isAdminUser(email, role) === true.
 */
export const ADMIN_CHAT_ENTITLEMENT: ChatEntitlement = {
  planTier: 'agency',
  siteLimit: 999999,
  managerLimit: 999999,
  aiDailyLimit: 999999,
  paidUntil: null
}
```

- [ ] **Step 4: Wire the admin branch into the service**

В `projects/server/src/lemnity/chat-subscription.service.ts`:

Добавить импорты в начало файла. Расширить существующий импорт из `./chat-entitlement`, добавив `ADMIN_CHAT_ENTITLEMENT`, и добавить новый импорт админ-хелпера:

```ts
import {
  extendPaidUntil,
  isSubscriptionActive,
  FREE_CHAT_ENTITLEMENT,
  ADMIN_CHAT_ENTITLEMENT,
  type ChatEntitlement,
  type ChatPlanTier
} from './chat-entitlement'
import { isAdminUser } from '../common/admin'
```

Заменить тело `getActiveEntitlementByUserId` (строки 134-163). Было:

```ts
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lemnityUserId: true }
    })
    if (!user?.lemnityUserId) return FREE_CHAT_ENTITLEMENT
```

Стало:

```ts
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lemnityUserId: true, email: true, role: true }
    })
    // Админ — полный доступ как agency, бессрочно; подписку не читаем.
    if (isAdminUser(user?.email, user?.role)) return ADMIN_CHAT_ENTITLEMENT
    if (!user?.lemnityUserId) return FREE_CHAT_ENTITLEMENT
```

(Остальная часть метода — чтение `chatSubscription` и возврат — без изменений.)

- [ ] **Step 5: Run test to verify it passes**

Run: `cd projects/server && npx jest src/lemnity/chat-subscription.service.spec.ts`
Expected: PASS — все тесты файла зелёные (новые admin + старые: существующие моки `user.findUnique` без email/role → `isAdminUser(undefined, undefined)` === false → поведение прежнее).

- [ ] **Step 6: Commit**

```bash
git add projects/server/src/lemnity/chat-entitlement.ts projects/server/src/lemnity/chat-subscription.service.ts projects/server/src/lemnity/chat-subscription.service.spec.ts
git commit -m "feat(chat): админ получает entitlement agency (без лимитов, бессрочно)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Виджеты админа создаются бессрочными (paidUntil = null)

**Files:**
- Modify: `projects/server/src/widget/widget.service.ts:257-293` (сигнатура + paidUntil)
- Modify: `projects/server/src/widget/widget.controller.ts:18-34` (прокинуть isAdmin)
- Test: `projects/server/src/widget/widget-admin-paid-until.spec.ts` (новый)

**Interfaces:**
- Consumes: `isAdminUser(email, role)` из `../common/admin` (уже импортирован в контроллере).
- Produces: `WidgetService.create(dto, userId, isAdmin = false)` — третий параметр булев, по умолчанию `false`.

- [ ] **Step 1: Write the failing test**

Создать `projects/server/src/widget/widget-admin-paid-until.spec.ts`:

```ts
jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))
jest.mock('@lemnity/widget-config', () => ({
  CURRENT_VERSION: 1,
  migrateToCurrent: (data: unknown, version?: number) => ({ data, version: version ?? 1 }),
  canonicalizeWidgetConfig: (raw: unknown) => raw,
  validate: () => ({ ok: true, issues: [] })
}))

import { WidgetService } from './widget.service'
import type { PrismaService } from '../prisma.service'
import type { ConfigService } from '../config/config.service'
import type { ChatSubscriptionService } from '../lemnity/chat-subscription.service'

function make() {
  const create = jest.fn().mockResolvedValue({ id: 'w1' })
  const prisma = {
    widget: { create },
    project: { findFirst: jest.fn().mockResolvedValue({ id: 'p1', userId: 'u1' }) }
  }
  const chatSub = {
    getActiveEntitlementByUserId: jest.fn()
  } as unknown as ChatSubscriptionService
  const configService = {} as unknown as ConfigService
  const svc = new WidgetService(prisma as unknown as PrismaService, configService, chatSub)
  return { svc, create }
}

// Тип без config, чтобы не дёргать enforceChatBranding/ConfigService.
const dto = { projectId: 'p1', name: 'n', type: 'NOTIFICATION' } as never

describe('WidgetService.create — paidUntil для админа', () => {
  it('ставит paidUntil = null, когда isAdmin = true', async () => {
    const { svc, create } = make()
    await svc.create(dto, 'u1', true)
    expect(create.mock.calls[0][0].data.paidUntil).toBeNull()
  })

  it('ставит триал (~ now + 5 дней) для обычного пользователя', async () => {
    const { svc, create } = make()
    const before = Date.now()
    await svc.create(dto, 'u1', false)
    const paidUntil: Date = create.mock.calls[0][0].data.paidUntil
    const fiveDays = 5 * 24 * 60 * 60 * 1000
    expect(paidUntil).toBeInstanceOf(Date)
    expect(paidUntil.getTime()).toBeGreaterThanOrEqual(before + fiveDays - 1000)
    expect(paidUntil.getTime()).toBeLessThanOrEqual(Date.now() + fiveDays + 1000)
  })

  it('по умолчанию (без третьего аргумента) — триал, не null', async () => {
    const { svc, create } = make()
    await svc.create(dto, 'u1')
    expect(create.mock.calls[0][0].data.paidUntil).toBeInstanceOf(Date)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/server && npx jest src/widget/widget-admin-paid-until.spec.ts`
Expected: FAIL — `create` пока игнорирует `isAdmin`, `paidUntil` всегда Date (тест на null падает).

- [ ] **Step 3: Update WidgetService.create**

В `projects/server/src/widget/widget.service.ts` изменить сигнатуру `create` (строка 257) и установку `paidUntil` (строка 277).

Сигнатура было:

```ts
  async create(createWidgetDto: CreateWidgetDto, userId: string) {
```

стало:

```ts
  async create(createWidgetDto: CreateWidgetDto, userId: string, isAdmin = false) {
```

Блок `paidUntil` было:

```ts
      // Бесплатный период 5 дней с момента создания — виджет активен (paidUntil > now)
      // без оплаты. Дальше продлевается подпиской из ЛК. См. plans/plan-wid.md.
      paidUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
```

стало:

```ts
      // Бесплатный период 5 дней с момента создания (paidUntil > now). Для админа —
      // null (бессрочно/grandfather), виджет не истекает и не требует оплаты.
      // Дальше продлевается подпиской из ЛК. См. plans/plan-wid.md.
      paidUntil: isAdmin ? null : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd projects/server && npx jest src/widget/widget-admin-paid-until.spec.ts`
Expected: PASS (3 теста зелёные).

- [ ] **Step 5: Pass isAdmin from the controller**

В `projects/server/src/widget/widget.controller.ts` обновить вызов `create` (строка 33). Было:

```ts
    return this.widgetService.create(createWidgetDto, userId)
```

стало:

```ts
    return this.widgetService.create(createWidgetDto, userId, isAdminUser(email, role))
```

(`isAdminUser`, `email`, `role` уже доступны в методе — см. строки 11, 24-25.)

- [ ] **Step 6: Verify branding regression suite still green**

Run: `cd projects/server && npx jest src/widget/widget-chat-branding.spec.ts`
Expected: PASS — старые вызовы `svc.create(dto, 'u1')` используют `isAdmin = false` по умолчанию, поведение не изменилось.

- [ ] **Step 7: Commit**

```bash
git add projects/server/src/widget/widget.service.ts projects/server/src/widget/widget.controller.ts projects/server/src/widget/widget-admin-paid-until.spec.ts
git commit -m "feat(widgets): виджеты админа создаются бессрочными (paidUntil=null)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Бэкфилл существующих виджетов админа

**Files:**
- Modify: `projects/server/src/common/admin.ts` (экспортировать `ADMIN_EMAILS`)
- Create: `projects/server/scripts/backfill-admin-widgets-paid-until.ts`

**Interfaces:**
- Consumes: `ADMIN_EMAILS: string[]` (новый экспорт из `../src/common/admin`), `PrismaService` из `../src/prisma.service`.

- [ ] **Step 1: Export the admin email list**

В `projects/server/src/common/admin.ts` (строка 5) добавить `export` к константе. Было:

```ts
const ADMIN_EMAILS: string[] = (
```

стало:

```ts
export const ADMIN_EMAILS: string[] = (
```

(Ничего другого не меняем — `isAdminUser` продолжает использовать ту же переменную.)

- [ ] **Step 2: Create the backfill script**

Создать `projects/server/scripts/backfill-admin-widgets-paid-until.ts`:

```ts
/**
 * Одноразовый бэкфилл: для всех виджетов в проектах админов выставить paidUntil = null
 * (бессрочно/grandfather), чтобы ранее созданные виджеты админа не истекали.
 * Идемпотентен. Запуск: cd projects/server && DATABASE_URL=... npx ts-node scripts/backfill-admin-widgets-paid-until.ts
 */
import { PrismaService } from '../src/prisma.service'
import { ADMIN_EMAILS } from '../src/common/admin'

async function main() {
  const prisma = new PrismaService()
  await prisma.$connect()
  try {
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { email: { in: ADMIN_EMAILS, mode: 'insensitive' } }
        ]
      },
      select: { id: true, email: true }
    })
    const adminIds = admins.map(a => a.id)
    console.log(`Найдено админов: ${admins.length} (${admins.map(a => a.email).join(', ')})`)
    if (adminIds.length === 0) {
      console.log('Админов нет — нечего бэкфиллить.')
      return
    }
    const res = await prisma.widget.updateMany({
      where: { project: { userId: { in: adminIds } } },
      data: { paidUntil: null }
    })
    console.log(`Обновлено виджетов (paidUntil = null): ${res.count}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 3: Typecheck the script and changed files**

Run: `cd projects/server && npx tsc --noEmit -p tsconfig.json`
Expected: без ошибок (скрипт компилируется; типы Prisma `updateMany`/`findMany` корректны).

- [ ] **Step 4: Run the backfill against the database**

Run: `cd projects/server && DATABASE_URL="<прод/стейдж URL>" npx ts-node scripts/backfill-admin-widgets-paid-until.ts`
Expected: лог «Найдено админов: N (...)» и «Обновлено виджетов (paidUntil = null): M».
> Если `ts-node` не запускает ESM-клиент `@lemnity/database`, выполнить эквивалентный SQL напрямую (psql):
> ```sql
> UPDATE widgets SET paid_until = NULL
> WHERE project_id IN (
>   SELECT p.id FROM projects p JOIN users u ON u.id = p.user_id
>   WHERE u.role = 'ADMIN' OR lower(u.email) IN ('simakov@lemnity.ru','lemnitycom@gmail.com')
> );
> ```

- [ ] **Step 5: Verify**

Запросом проверить, что у виджетов админа `paid_until IS NULL`, и зайти на сайт админа с включённым чат-виджетом — эмбед рендерится (не «истёк»):
```sql
SELECT w.id, w.type, w.paid_until FROM widgets w
JOIN projects p ON p.id = w.project_id
JOIN users u ON u.id = p.user_id
WHERE u.role = 'ADMIN' OR lower(u.email) IN ('simakov@lemnity.ru','lemnitycom@gmail.com');
```
Expected: все строки имеют `paid_until = NULL`.

- [ ] **Step 6: Commit**

```bash
git add projects/server/src/common/admin.ts projects/server/scripts/backfill-admin-widgets-paid-until.ts
git commit -m "chore(widgets): бэкфилл-скрипт — виджеты админа бессрочны (paidUntil=null)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Финальная проверка

- [ ] Прогнать чат/виджет-тесты целиком:

Run: `cd projects/server && npx jest src/lemnity src/widget`
Expected: PASS — все юнит-тесты зелёные.

- [ ] Ручная проверка (опционально, на стейдже): войти админом → редактор чата показывает тариф «agency», тумблер брендинга доступен (бренд можно убрать), каналы MAX/VK подключаются, лимит операторов не блокирует; публичный эмбед чат-виджета админа активен.
