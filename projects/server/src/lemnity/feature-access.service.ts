import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CallbackSubscriptionService, monthStart } from './callback-subscription.service'
import { canUseModule, isWithinCallbackLimit, isWithinSiteLimit } from './callback-entitlement'

/**
 * Централизованный доступ к функциям и лимитам по подписке Callback Widget — **по доступности
 * функции, НЕ по имени тарифа** (см. plan-wid-call.md, Фаза B). Энфорсмент применяется только когда
 * у аккаунта есть АКТИВНАЯ подписка Callback; иначе — no-op (сохраняем текущее поведение).
 */
@Injectable()
export class FeatureAccessService {
  constructor(
    private readonly callbackSub: CallbackSubscriptionService,
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
}
