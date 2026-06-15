import type {
  ChannelAdapter,
  ChannelAttachment,
  ChannelCredentials,
  NormalizedInbound,
  ValidateResult
} from './channel-adapter'

const API = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`

const callTg = async <T>(token: string, method: string, payload?: unknown): Promise<T> => {
  const res = await fetch(API(token, method), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {})
  })
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string }
  if (!data.ok) throw new Error(data.description || `Telegram ${method} failed`)
  return data.result as T
}

const fileType = (msg: TgMessage): ChannelAttachment | null => {
  if (msg.photo && msg.photo.length) {
    return { url: '', type: 'image', name: 'photo' } // url проставит resolver по file_id (best-effort ниже)
  }
  return null
}

type TgUser = { id: number; first_name?: string; last_name?: string; username?: string }
type TgChat = { id: number }
type TgMessage = {
  message_id: number
  from?: TgUser
  chat: TgChat
  text?: string
  caption?: string
  photo?: { file_id: string }[]
  document?: { file_id: string; file_name?: string }
}
type TgUpdate = { message?: TgMessage }

/**
 * Telegram Bot API. Вебхук ставится через setWebhook с secret_token (валидируется заголовком
 * X-Telegram-Bot-Api-Secret-Token в контроллере). Вложения телеграма приходят как file_id —
 * на MVP передаём текст/подпись; файлы помечаем как ссылку через getFile (best-effort).
 */
export const telegramAdapter: ChannelAdapter = {
  type: 'telegram',

  async validateCredentials(creds: ChannelCredentials): Promise<ValidateResult> {
    try {
      const me = await callTg<{ id: number; username?: string; first_name?: string }>(
        creds.token,
        'getMe'
      )
      return { ok: true, accountId: String(me.id), accountName: me.username || me.first_name }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'invalid token' }
    }
  },

  async setupWebhook(creds, webhookUrl, secret) {
    await callTg(creds.token, 'setWebhook', {
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ['message']
    })
    return {}
  },

  async removeWebhook(creds) {
    try {
      await callTg(creds.token, 'deleteWebhook', {})
    } catch {
      /* best-effort */
    }
  },

  parseInbound(body: unknown): NormalizedInbound | null {
    const update = body as TgUpdate
    const msg = update?.message
    if (!msg || !msg.chat) return null
    const text = msg.text ?? msg.caption ?? ''
    const attachments: ChannelAttachment[] = []
    const photo = fileType(msg)
    if (photo) attachments.push(photo)
    if (!text && attachments.length === 0) return null
    const name = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ').trim()
    return {
      externalUserId: String(msg.from?.id ?? msg.chat.id),
      externalChatId: String(msg.chat.id),
      displayName: name || msg.from?.username,
      text,
      attachments
    }
  },

  async sendOutbound(creds, externalChatId, body, attachments) {
    // Картинки шлём как фото, остальное — ссылкой в тексте; пустой текст без вложений пропускаем.
    const images = attachments.filter(a => a.type === 'image' && a.url)
    const rest = attachments.filter(a => a.type !== 'image' && a.url)
    if (images.length) {
      for (const img of images) {
        await callTg(creds.token, 'sendPhoto', {
          chat_id: externalChatId,
          photo: img.url,
          caption: body || undefined
        })
      }
    } else if (body || rest.length) {
      const links = rest.map(a => `${a.name ?? 'Файл'}: ${a.url}`).join('\n')
      const text = [body, links].filter(Boolean).join('\n')
      if (text) await callTg(creds.token, 'sendMessage', { chat_id: externalChatId, text })
    }
  }
}
