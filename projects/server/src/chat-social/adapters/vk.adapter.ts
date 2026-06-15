import type {
  ChannelAdapter,
  ChannelAttachment,
  ChannelCredentials,
  NormalizedInbound,
  ValidateResult
} from './channel-adapter'

const VK_API = 'https://api.vk.com/method'
const VK_VERSION = '5.199'

const callVk = async <T>(
  token: string,
  method: string,
  params: Record<string, string | number>
): Promise<T> => {
  const qs = new URLSearchParams({ access_token: token, v: VK_VERSION })
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v))
  const res = await fetch(`${VK_API}/${method}?${qs.toString()}`, { method: 'POST' })
  const data = (await res.json()) as { response?: T; error?: { error_msg?: string } }
  if (data.error) throw new Error(data.error.error_msg || `VK ${method} failed`)
  return data.response as T
}

type VkPhotoSize = { url: string; width: number }
type VkAttachment = {
  type: string
  photo?: { sizes?: VkPhotoSize[] }
  doc?: { url?: string; title?: string }
}
type VkMessage = {
  from_id: number
  peer_id: number
  text?: string
  attachments?: VkAttachment[]
}
type VkUpdate = {
  type?: string
  group_id?: number
  secret?: string
  object?: { message?: VkMessage }
}

const parseVkAttachments = (atts?: VkAttachment[]): ChannelAttachment[] => {
  const out: ChannelAttachment[] = []
  for (const a of atts ?? []) {
    if (a.type === 'photo' && a.photo?.sizes?.length) {
      const largest = [...a.photo.sizes].sort((x, y) => y.width - x.width)[0]
      if (largest?.url) out.push({ url: largest.url, type: 'image', name: 'photo' })
    } else if (a.type === 'doc' && a.doc?.url) {
      out.push({ url: a.doc.url, type: 'file', name: a.doc.title })
    }
  }
  return out
}

/**
 * ВКонтакте Callback API. Подтверждение сервера (type:'confirmation') и валидация поля `secret`
 * обрабатываются в контроллере. groupId автоопределяется из токена сообщества (groups.getById).
 */
export const vkAdapter: ChannelAdapter = {
  type: 'vk',

  async validateCredentials(creds: ChannelCredentials): Promise<ValidateResult> {
    try {
      const groups = await callVk<{ id: number; name?: string; screen_name?: string }[]>(
        creds.token,
        'groups.getById',
        {}
      )
      const group = Array.isArray(groups) ? groups[0] : undefined
      if (!group) return { ok: false, error: 'group not found for token' }
      return { ok: true, accountId: String(group.id), accountName: group.name || group.screen_name }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'invalid token' }
    }
  },

  async setupWebhook(creds, webhookUrl, secret) {
    const groupId = Number(creds.groupId)
    if (!groupId) throw new Error('VK groupId is required')
    const { code } = await callVk<{ code: string }>(
      creds.token,
      'groups.getCallbackConfirmationCode',
      { group_id: groupId }
    )
    const { server_id } = await callVk<{ server_id: number }>(
      creds.token,
      'groups.addCallbackServer',
      { group_id: groupId, url: webhookUrl, title: 'Lemnity', secret_key: secret }
    )
    await callVk(creds.token, 'groups.setCallbackSettings', {
      group_id: groupId,
      server_id,
      api_version: VK_VERSION,
      message_new: 1
    })
    return { confirmation: code }
  },

  async removeWebhook(creds, webhookUrl) {
    try {
      const groupId = Number(creds.groupId)
      if (!groupId) return
      const list = await callVk<{ items?: { id: number; url: string }[] }>(
        creds.token,
        'groups.getCallbackServers',
        { group_id: groupId }
      )
      const mine = list.items?.find(s => s.url === webhookUrl)
      if (mine) {
        await callVk(creds.token, 'groups.deleteCallbackServer', {
          group_id: groupId,
          server_id: mine.id
        })
      }
    } catch {
      /* best-effort */
    }
  },

  parseInbound(body: unknown): NormalizedInbound | null {
    const update = body as VkUpdate
    if (update?.type !== 'message_new') return null
    const msg = update.object?.message
    if (!msg) return null
    const text = msg.text ?? ''
    const attachments = parseVkAttachments(msg.attachments)
    if (!text && attachments.length === 0) return null
    return {
      externalUserId: String(msg.from_id),
      externalChatId: String(msg.peer_id),
      text,
      attachments
    }
  },

  async sendOutbound(creds, externalChatId, body, attachments) {
    const links = attachments.filter(a => a.url).map(a => `${a.name ?? 'Файл'}: ${a.url}`).join('\n')
    const message = [body, links].filter(Boolean).join('\n')
    if (!message) return
    await callVk(creds.token, 'messages.send', {
      peer_id: Number(externalChatId),
      message,
      random_id: Math.floor(Math.random() * 2_000_000_000)
    })
  }
}
