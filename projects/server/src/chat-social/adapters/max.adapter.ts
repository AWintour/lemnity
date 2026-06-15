import type {
  ChannelAdapter,
  ChannelAttachment,
  ChannelCredentials,
  NormalizedInbound,
  ValidateResult
} from './channel-adapter'

// MAX Bot API (наследник TamTam Bot API), базовый хост botapi.max.ru. Авторизация — query
// access_token. ⚠️ Точные поля сверить по dev.max.ru при боевой проверке.
const MAX_API = 'https://botapi.max.ru'

const callMax = async <T>(
  token: string,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  params?: Record<string, string | number>,
  payload?: unknown
): Promise<T> => {
  const qs = new URLSearchParams({ access_token: token })
  for (const [k, v] of Object.entries(params ?? {})) qs.set(k, String(v))
  const res = await fetch(`${MAX_API}${path}?${qs.toString()}`, {
    method,
    headers: payload ? { 'content-type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined
  })
  const data = (await res.json().catch(() => ({}))) as T & { code?: string; message?: string }
  if (!res.ok || (data as { code?: string }).code) {
    throw new Error((data as { message?: string }).message || `MAX ${path} failed`)
  }
  return data as T
}

type MaxAttachment = { type: string; payload?: { url?: string; token?: string }; filename?: string }
type MaxMessage = {
  sender?: { user_id: number; name?: string; username?: string }
  recipient?: { chat_id: number; user_id?: number }
  body?: { text?: string; attachments?: MaxAttachment[] }
}
type MaxUpdate = { update_type?: string; message?: MaxMessage }

const parseMaxAttachments = (atts?: MaxAttachment[]): ChannelAttachment[] => {
  const out: ChannelAttachment[] = []
  for (const a of atts ?? []) {
    const url = a.payload?.url
    if (!url) continue
    const type = a.type === 'image' || a.type === 'photo' ? 'image' : a.type === 'video' ? 'video' : 'file'
    out.push({ url, type, name: a.filename })
  }
  return out
}

export const maxAdapter: ChannelAdapter = {
  type: 'max',

  async validateCredentials(creds: ChannelCredentials): Promise<ValidateResult> {
    try {
      const me = await callMax<{ user_id: number; name?: string; username?: string }>(
        creds.token,
        'GET',
        '/me'
      )
      return { ok: true, accountId: String(me.user_id), accountName: me.username || me.name }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'invalid token' }
    }
  },

  async setupWebhook(creds, webhookUrl, secret) {
    await callMax(creds.token, 'POST', '/subscriptions', undefined, {
      url: webhookUrl,
      update_types: ['message_created'],
      secret
    })
    return {}
  },

  async removeWebhook(creds, webhookUrl) {
    try {
      await callMax(creds.token, 'DELETE', '/subscriptions', { url: webhookUrl })
    } catch {
      /* best-effort */
    }
  },

  parseInbound(body: unknown): NormalizedInbound | null {
    const update = body as MaxUpdate
    if (update?.update_type !== 'message_created') return null
    const msg = update.message
    if (!msg?.sender) return null
    const text = msg.body?.text ?? ''
    const attachments = parseMaxAttachments(msg.body?.attachments)
    if (!text && attachments.length === 0) return null
    const chatId = msg.recipient?.chat_id ?? msg.sender.user_id
    return {
      externalUserId: String(msg.sender.user_id),
      externalChatId: String(chatId),
      displayName: msg.sender.name || msg.sender.username,
      text,
      attachments
    }
  },

  async sendOutbound(creds, externalChatId, body, attachments) {
    const links = attachments.filter(a => a.url).map(a => `${a.name ?? 'Файл'}: ${a.url}`).join('\n')
    const text = [body, links].filter(Boolean).join('\n')
    if (!text) return
    await callMax(creds.token, 'POST', '/messages', { chat_id: Number(externalChatId) }, { text })
  }
}
