/**
 * Абстракция канала соцсети (telegram|vk|max). Адаптеры — обычные TS-модули (без Nest DI),
 * чтобы их могли использовать и сервис подключения (ChatSocialModule), и outbound-хелпер
 * (ChatModule) без циклической зависимости модулей. HTTP — через нативный fetch.
 */

export type SocialType = 'telegram' | 'vk' | 'max'

export const SOCIAL_TYPES: readonly SocialType[] = ['telegram', 'vk', 'max'] as const

export const isSocialType = (v: string): v is SocialType =>
  (SOCIAL_TYPES as readonly string[]).includes(v)

/** Креды подключения: токен (TG/MAX — бот, VK — токен сообщества) + groupId для VK. */
export type ChannelCredentials = {
  token: string
  groupId?: string
}

export type ChannelAttachment = { url: string; type: 'image' | 'video' | 'file'; name?: string }

/** Нормализованное входящее сообщение из мессенджера. */
export type NormalizedInbound = {
  externalUserId: string
  externalChatId: string
  displayName?: string
  text: string
  attachments: ChannelAttachment[]
}

export type ValidateResult = {
  ok: boolean
  accountId?: string
  accountName?: string
  error?: string
}

export interface ChannelAdapter {
  type: SocialType
  /** Проверка валидности токена (TG/MAX getMe, VK groups.getById). */
  validateCredentials(creds: ChannelCredentials): Promise<ValidateResult>
  /** Установка вебхука/подписки. Для VK может вернуть confirmation-код для хранения. */
  setupWebhook(
    creds: ChannelCredentials,
    webhookUrl: string,
    secret: string
  ): Promise<{ confirmation?: string }>
  /** Снятие вебхука/подписки (best-effort). */
  removeWebhook(creds: ChannelCredentials, webhookUrl: string): Promise<void>
  /** Разбор тела вебхука → нормализованное сообщение, либо null (служебные апдейты). */
  parseInbound(body: unknown): NormalizedInbound | null
  /** Отправка ответа оператора в мессенджер. */
  sendOutbound(
    creds: ChannelCredentials,
    externalChatId: string,
    body: string,
    attachments: ChannelAttachment[]
  ): Promise<void>
}
