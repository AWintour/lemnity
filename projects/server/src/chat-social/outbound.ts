import type { PrismaService } from '../prisma.service'
import { getAdapter, isSocialType, type ChannelAttachment } from './adapters'
import { credsFromConfig, readConfig } from './integration-config'

type OutboundMessage = {
  body: string
  attachmentUrl?: string | null
  attachmentType?: string | null
  attachmentName?: string | null
  attachments?: { url: string; type: string; name?: string }[] | null
}

/**
 * Отправляет сообщение оператора/системы обратно в мессенджер, если диалог пришёл из соцсети.
 * Best-effort: любые ошибки логируются и проглатываются — НЕ должны валить персист сообщения.
 * Не зависит от ChatService (только Prisma + адаптеры) — чтобы не было цикла модулей.
 */
export const sendOutboundForConversation = async (
  prisma: PrismaService,
  conversationId: string,
  message: OutboundMessage
): Promise<void> => {
  try {
    const conv = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      select: { projectId: true, channel: true, externalChatId: true }
    })
    if (!conv || !conv.channel || conv.channel === 'web') return
    if (!isSocialType(conv.channel) || !conv.externalChatId) return

    const integration = await prisma.chatSocialIntegration.findUnique({
      where: { projectId_type: { projectId: conv.projectId, type: conv.channel } }
    })
    const config = readConfig(integration?.config)
    if (!integration?.connected || !config) return

    const atts: ChannelAttachment[] = []
    const list = message.attachments?.length
      ? message.attachments
      : message.attachmentUrl
        ? [{ url: message.attachmentUrl, type: message.attachmentType ?? 'file', name: message.attachmentName ?? undefined }]
        : []
    for (const a of list) {
      if (!a?.url) continue
      const t = a.type === 'image' ? 'image' : a.type === 'video' ? 'video' : 'file'
      atts.push({ url: a.url, type: t, name: a.name ?? undefined })
    }

    const adapter = getAdapter(conv.channel)
    await adapter.sendOutbound(credsFromConfig(config), conv.externalChatId, message.body, atts)
  } catch (e) {
    console.error('[chat-social] outbound dispatch failed', e instanceof Error ? e.message : e)
  }
}
