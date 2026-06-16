import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CallbackSubscriptionService, monthStart } from './callback-subscription.service'
import { ChatSubscriptionService } from './chat-subscription.service'
import { canUseModule, isWithinCallbackLimit, isWithinSiteLimit } from './callback-entitlement'
import { isWithinManagerLimit } from './chat-entitlement'

/**
 * Централизованный доступ к функциям и лимитам по подписке Callback Widget — **по доступности
 * функции, НЕ по имени тарифа** (см. plan-wid-call.md, Фаза B). Энфорсмент применяется только когда
 * у аккаунта есть АКТИВНАЯ подписка Callback; иначе — no-op (сохраняем текущее поведение).
 */
@Injectable()
export class FeatureAccessService {
  constructor(
    private readonly callbackSub: CallbackSubscriptionService,
    private readonly chatSub: ChatSubscriptionService,
    private readonly prisma: PrismaService
  ) {}

  /** Доступен ли модуль (telegram/webhooks/ab_testing/white_label/api_access) аккаунту. */
  async canUseCallbackModule(userId: string, moduleId: string, now: Date = new Date()): Promise<boolean> {
    const ent = await this.callbackSub.getActiveEntitlementByUserId(userId, now)
    return !!ent && canUseModule(ent, moduleId, now)
  }

  /** Бросает Forbidden, если у аккаунта активная подписка и лимит сайтов исчерпан. */
  async assertCanCreateSite(userId: string, now: Date = new Date()): Promise<void> {
    const ent = await this.callbackSub.getActiveEntitlementByUserId(userId, now)
    if (!ent) return
    const used = await this.prisma.project.count({ where: { userId } })
    if (!isWithinSiteLimit(ent, used)) {
      throw new ForbiddenException({
        message: `Достигнут лимит сайтов (${ent.siteLimit}). Подключите модуль «Дополнительный сайт».`,
        code: 'site_limit_reached',
        limit: ent.siteLimit
      })
    }
  }

  /** Бросает Forbidden, если у владельца проекта активная подписка и месячный лимит заявок исчерпан. */
  async assertCanAcceptCallback(ownerUserId: string, now: Date = new Date()): Promise<void> {
    const ent = await this.callbackSub.getActiveEntitlementByUserId(ownerUserId, now)
    if (!ent) return
    const used = await this.prisma.request.count({
      where: {
        project: { userId: ownerUserId },
        widget: { type: 'CALLBACK' },
        createdAt: { gte: monthStart(now) }
      }
    })
    if (!isWithinCallbackLimit(ent, used)) {
      throw new ForbiddenException({
        message: `Достигнут месячный лимит заявок (${ent.callbackLimit}). Подключите модуль «Дополнительные заявки».`,
        code: 'callback_limit_reached',
        limit: ent.callbackLimit
      })
    }
  }

  /**
   * Бросает Forbidden, если в проекте достигнут лимит операторов тарифа Чата.
   * В отличие от Callback-методов, энфорсмент применяется ВСЕГДА: Free — настоящий тариф
   * (managerLimit 1), а `getActiveEntitlementByUserId` никогда не возвращает null.
   * Счёт операторов — по проекту (включает строку владельца), поэтому метод нужно вызывать
   * ПОСЛЕ авто-создания владельца (`ensureOwnerOperator`), чтобы место владельца было учтено.
   */
  async assertCanAddOperator(userId: string, projectId: string, now: Date = new Date()): Promise<void> {
    const ent = await this.chatSub.getActiveEntitlementByUserId(userId, now)
    const used = await this.prisma.chatOperator.count({ where: { projectId } })
    if (!isWithinManagerLimit(ent, used)) {
      throw new ForbiddenException({
        message: `Достигнут лимит операторов тарифа (${ent.managerLimit}). Улучшите тариф.`,
        code: 'manager_limit_reached',
        limit: ent.managerLimit
      })
    }
  }
}
