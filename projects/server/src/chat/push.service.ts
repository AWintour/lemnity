import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as webpush from 'web-push'
import { PrismaService } from '../prisma.service'
import type { ChatActor } from './chat-actor.guard'

/** Стабильный ключ личности персонала — для presence-исключения онлайн-сотрудников из push. */
export const actorIdentityKey = (actor: ChatActor): string =>
  actor.kind === 'owner' ? `owner:${actor.userId}` : `op:${actor.operatorId}`

type PushSubscriptionInput = {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}

export type PushPayload = {
  title: string
  body: string
  url: string
  tag?: string
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name)
  private readonly publicKey: string
  private readonly enabled: boolean

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    this.publicKey = this.config.get<string>('VAPID_PUBLIC_KEY') ?? ''
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY') ?? ''
    const subject = this.config.get<string>('VAPID_SUBJECT') ?? 'mailto:lemnitycom@gmail.com'
    this.enabled = !!(this.publicKey && privateKey)
    if (this.enabled) {
      webpush.setVapidDetails(subject, this.publicKey, privateKey)
    } else {
      this.logger.warn('VAPID keys not configured — web push для операторов отключён')
    }
  }

  /** Публичный VAPID-ключ для подписки на клиенте (null, если push не настроен). */
  getPublicKey(): string | null {
    return this.enabled ? this.publicKey : null
  }

  /** Сохранить/обновить подписку текущего сотрудника (по endpoint — upsert). */
  async saveSubscription(actor: ChatActor, projectId: string, sub: PushSubscriptionInput) {
    const identity =
      actor.kind === 'owner'
        ? { userId: actor.userId, operatorId: null }
        : { userId: null, operatorId: actor.operatorId }
    await this.prisma.operatorPushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: {
        projectId,
        ...identity,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        userAgent: sub.userAgent ?? null
      },
      update: {
        projectId,
        ...identity,
        p256dh: sub.p256dh,
        auth: sub.auth,
        userAgent: sub.userAgent ?? null
      }
    })
  }

  /** Удалить подписку (отписка / устройство выключило уведомления). */
  async deleteSubscription(endpoint: string) {
    await this.prisma.operatorPushSubscription.deleteMany({ where: { endpoint } })
  }

  /**
   * Push всем подписанным сотрудникам проекта, КРОМЕ тех, кто сейчас онлайн в кабинете
   * (их `identityKey` — в `onlineIdentityKeys`). Best-effort: ошибки гасим, протухшие
   * подписки (404/410) удаляем. Если push не настроен — no-op.
   */
  async notifyProjectStaff(
    projectId: string,
    payload: PushPayload,
    onlineIdentityKeys: ReadonlySet<string>
  ): Promise<void> {
    if (!this.enabled) return
    try {
      const [project, operators] = await Promise.all([
        this.prisma.project.findUnique({ where: { id: projectId }, select: { userId: true } }),
        this.prisma.chatOperator.findMany({
          where: { projectId, active: true },
          select: { id: true }
        })
      ])
      const ownerUserId = project?.userId
      const operatorIds = operators.map(o => o.id)

      const subs = await this.prisma.operatorPushSubscription.findMany({
        where: {
          OR: [
            ...(ownerUserId ? [{ userId: ownerUserId }] : []),
            ...(operatorIds.length ? [{ operatorId: { in: operatorIds } }] : [])
          ]
        }
      })
      if (subs.length === 0) return

      const body = JSON.stringify(payload)
      await Promise.all(
        subs.map(async s => {
          const identityKey = s.userId ? `owner:${s.userId}` : `op:${s.operatorId}`
          if (onlineIdentityKeys.has(identityKey)) return // сотрудник смотрит кабинет — не дублируем
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              body
            )
          } catch (err) {
            const status = (err as { statusCode?: number }).statusCode
            if (status === 404 || status === 410) {
              await this.prisma.operatorPushSubscription
                .deleteMany({ where: { endpoint: s.endpoint } })
                .catch(() => undefined)
            } else {
              this.logger.warn(`web push failed (${status ?? '?'}): ${(err as Error).message}`)
            }
          }
        })
      )
    } catch (err) {
      this.logger.warn(`notifyProjectStaff failed for ${projectId}: ${(err as Error).message}`)
    }
  }
}
