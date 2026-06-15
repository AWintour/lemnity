import { decryptWithKey, encryptWithKey } from '../common/crypto/secret-cipher'
import type { ChannelCredentials } from './adapters'

/**
 * Конфиг соцсети-интеграции, хранится в `ChatSocialIntegration.config` (Json). Токен — только
 * зашифрованным (secret-cipher / INTEGRATION_ENC_KEY). На клиент токен НИКОГДА не отдаётся.
 */
export type SocialConfig = {
  tokenEnc: string
  groupId?: string // VK
  webhookSecret: string
  accountId?: string
  accountName?: string
  vkConfirmation?: string // VK Callback API confirmation code
}

export const encKey = (): string => {
  const k = (process.env.INTEGRATION_ENC_KEY || '').trim()
  if (!k) throw new Error('INTEGRATION_ENC_KEY is not configured')
  return k
}

/** Безопасный (без секретов) срез конфига — для отдачи на клиент. */
export const publicConfig = (config: unknown): { accountName?: string } | null => {
  const c = config as SocialConfig | null
  if (!c) return null
  return { accountName: c.accountName }
}

export const readConfig = (config: unknown): SocialConfig | null => {
  const c = config as SocialConfig | null
  if (!c || typeof c.tokenEnc !== 'string') return null
  return c
}

/** Расшифровывает креды из конфига для вызова адаптера. */
export const credsFromConfig = (config: SocialConfig): ChannelCredentials => ({
  token: decryptWithKey(config.tokenEnc, encKey()),
  groupId: config.groupId
})

export const encryptToken = (token: string): string => encryptWithKey(token, encKey())
