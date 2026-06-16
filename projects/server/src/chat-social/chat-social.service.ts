import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PrismaService } from '../prisma.service'
import type { UpdateIntegrationDto } from './dto/update-integration.dto'
import type { ConnectIntegrationDto } from './dto/connect-integration.dto'
import type { ChatIntegrationEntity } from './entities/chat-integration.entity'
import { getAdapter, isSocialType, type ChannelCredentials, type SocialType } from './adapters'
import {
  credsFromConfig,
  encryptToken,
  publicConfig,
  readConfig,
  type SocialConfig
} from './integration-config'
import { ChatSubscriptionService } from '../lemnity/chat-subscription.service'
import { chatPlanFeatures } from '../lemnity/chat-entitlement'

/** Известные типы социальных интеграций чат-виджета. */
const TYPES = ['telegram', 'max', 'vk'] as const

type IntegrationRow = {
  type: string
  connected: boolean
  config: unknown
}

// Безопасный срез (без секретов) — то, что отдаём на клиент.
const toEntity = (row: IntegrationRow): ChatIntegrationEntity => ({
  type: row.type,
  connected: row.connected,
  config: publicConfig(row.config)
})

/**
 * Публичная база API для URL вебхуков. Берём API_URL, иначе выводим из FRONTEND_URL (тот же хост,
 * API под /api через nginx). Гарантируем суффикс `/api` ровно один раз.
 */
const apiBase = (): string => {
  let base = (process.env.API_URL || '').replace(/\/+$/, '')
  if (!base) {
    const fe = (process.env.FRONTEND_URL || '').replace(/\/+$/, '')
    if (fe) base = `${fe}/api`
  }
  if (!base) {
    throw new Error('API_URL/FRONTEND_URL is not configured (needed for social webhook URLs)')
  }
  if (!/\/api$/.test(base)) base = `${base}/api`
  return base
}

const buildWebhookUrl = (type: SocialType, secret: string): string =>
  `${apiBase()}/public/chat/webhooks/${type}/${secret}`

/**
 * Социальные интеграции чат-виджета (Telegram, MAX, VK): реальное двустороннее подключение.
 * connect — валидация токена + установка вебхука + шифрованное хранение креды; disconnect — снятие
 * вебхука + очистка. Входящие резолвятся по webhookSecret. Токен на клиент не отдаётся.
 */
@Injectable()
export class ChatSocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatSub: ChatSubscriptionService
  ) {}

  private async assertOwnsProject(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
  }

  async list(userId: string, projectId: string): Promise<{ integrations: ChatIntegrationEntity[] }> {
    await this.assertOwnsProject(userId, projectId)
    const rows = await this.prisma.chatSocialIntegration.findMany({ where: { projectId } })
    const byType = new Map(rows.map((row) => [row.type, row]))
    const integrations = TYPES.map((type) => {
      const row = byType.get(type)
      return row ? toEntity(row) : { type, connected: false, config: null }
    })
    return { integrations }
  }

  /** Подключение соцсети: валидируем креды, ставим вебхук, сохраняем зашифрованный токен. */
  async connect(
    userId: string,
    projectId: string,
    type: string,
    dto: ConnectIntegrationDto
  ): Promise<ChatIntegrationEntity> {
    await this.assertOwnsProject(userId, projectId)
    if (!isSocialType(type)) throw new BadRequestException('Unknown integration type')

    // Тарифный гейт: Telegram доступен всегда; MAX/VK — только с тарифа Start+ (allChannels).
    if (type !== 'telegram') {
      const ent = await this.chatSub.getActiveEntitlementByUserId(userId)
      const features = chatPlanFeatures(ent.planTier)
      if (!features.allChannels) {
        throw new ForbiddenException({
          message: 'Канал «' + type + '» доступен с тарифа Start. Улучшите тариф.',
          code: 'channel_not_in_plan',
          planTier: ent.planTier
        })
      }
    }

    const adapter = getAdapter(type)
    const creds: ChannelCredentials = { token: dto.token.trim(), groupId: dto.groupId?.trim() }

    const validation = await adapter.validateCredentials(creds)
    if (!validation.ok) {
      throw new BadRequestException(validation.error || 'Неверный токен')
    }
    // VK: id сообщества автоопределяется из токена, если не задан вручную.
    const effectiveCreds: ChannelCredentials = {
      ...creds,
      groupId: creds.groupId || (type === 'vk' ? validation.accountId : undefined)
    }

    const webhookSecret = randomUUID().replace(/-/g, '')
    const webhookUrl = buildWebhookUrl(type, webhookSecret)
    let confirmation: string | undefined
    try {
      const r = await adapter.setupWebhook(effectiveCreds, webhookUrl, webhookSecret)
      confirmation = r.confirmation
    } catch (e) {
      throw new BadRequestException(
        'Не удалось настроить вебхук: ' + (e instanceof Error ? e.message : 'ошибка')
      )
    }

    const config: SocialConfig = {
      tokenEnc: encryptToken(creds.token),
      groupId: effectiveCreds.groupId,
      webhookSecret,
      accountId: validation.accountId,
      accountName: validation.accountName,
      vkConfirmation: confirmation
    }
    // round-trip убирает undefined (Prisma Json не любит undefined в значениях).
    const configJson = JSON.parse(JSON.stringify(config)) as Record<string, unknown>

    const row = await this.prisma.chatSocialIntegration.upsert({
      where: { projectId_type: { projectId, type } },
      create: { projectId, type, connected: true, config: configJson },
      update: { connected: true, config: configJson }
    })
    return toEntity(row)
  }

  /** Отключение: снимаем вебхук (best-effort) и чистим config. */
  async disconnect(userId: string, projectId: string, type: string): Promise<ChatIntegrationEntity> {
    await this.assertOwnsProject(userId, projectId)
    if (!isSocialType(type)) throw new BadRequestException('Unknown integration type')

    const row = await this.prisma.chatSocialIntegration.findUnique({
      where: { projectId_type: { projectId, type } }
    })
    const config = readConfig(row?.config)
    if (config) {
      try {
        await getAdapter(type).removeWebhook(
          credsFromConfig(config),
          buildWebhookUrl(type, config.webhookSecret)
        )
      } catch {
        /* best-effort */
      }
    }

    const updated = await this.prisma.chatSocialIntegration.upsert({
      where: { projectId_type: { projectId, type } },
      create: { projectId, type, connected: false, config: {} },
      update: { connected: false, config: {} }
    })
    return toEntity(updated)
  }

  /** Резолв интеграции по секрету из URL вебхука (для публичного контроллера, без auth). */
  async resolveByWebhookSecret(
    type: SocialType,
    secret: string
  ): Promise<{ projectId: string; config: SocialConfig } | null> {
    const row = await this.prisma.chatSocialIntegration.findFirst({
      where: { type, connected: true, config: { path: ['webhookSecret'], equals: secret } }
    })
    const config = readConfig(row?.config)
    if (!row || !config) return null
    return { projectId: row.projectId, config }
  }

  /** Legacy: булев тумблер (оставлен для обратной совместимости PATCH). */
  async upsert(
    userId: string,
    projectId: string,
    type: string,
    dto: UpdateIntegrationDto
  ): Promise<ChatIntegrationEntity> {
    await this.assertOwnsProject(userId, projectId)
    if (!(TYPES as readonly string[]).includes(type)) {
      throw new BadRequestException('Unknown integration type')
    }
    const row = await this.prisma.chatSocialIntegration.upsert({
      where: { projectId_type: { projectId, type } },
      create: { projectId, type, connected: dto.connected ?? false, config: dto.config ?? undefined },
      update: { connected: dto.connected, config: dto.config ?? undefined }
    })
    return toEntity(row)
  }
}
