import { http } from '@common/api/http'
import { API } from '@common/api/endpoints'

export type ChatConversationStatus = 'open' | 'closed'
export type ChatMessageSender = 'visitor' | 'manager' | 'system'

export type ChatConversation = {
  id: string
  number: string
  projectId: string
  widgetId: string
  sessionId: string
  status: ChatConversationStatus
  visitorName?: string | null
  visitorPhone?: string | null
  visitorEmail?: string | null
  assignedOperatorId?: string | null
  channel?: string | null
  category?: string | null
  note?: string | null
  ip?: string | null
  userAgent?: string | null
  browser?: string | null
  os?: string | null
  deviceType?: string | null
  referer?: string | null
  country?: string | null
  region?: string | null
  city?: string | null
  timezone?: string | null
  firstVisitorAt?: string | null
  firstManagerAt?: string | null
  lastMessageAt?: string | null
  lastMessagePreview?: string | null
  unreadForManager: number
  createdAt: string
}

export type ChatMessage = {
  id: string
  conversationId: string
  sender: ChatMessageSender
  body: string
  senderUserId?: string | null
  readAt?: string | null
  createdAt: string
}

export type ListConversationsParams = {
  projectId?: string
  status?: ChatConversationStatus
  period?: '7d' | '30d' | '90d' | 'all'
  skip?: number
  take?: number
}

export type ConversationsResponse = {
  conversations: ChatConversation[]
  total: number
}

export type MessagesResponse = {
  conversationId: string
  messages: ChatMessage[]
}

export async function listConversations(params: ListConversationsParams) {
  const res = await http.get<ConversationsResponse>(API.CHAT.CONVERSATIONS, { params })
  return res.data
}

export async function getConversationMessages(id: string) {
  const res = await http.get<MessagesResponse>(API.CHAT.MESSAGES(id))
  return res.data
}

export async function replyToConversation(id: string, body: string) {
  const res = await http.post<ChatMessage>(API.CHAT.MESSAGES(id), { body })
  return res.data
}

export async function updateConversationStatus(id: string, status: ChatConversationStatus) {
  const res = await http.patch<ChatConversation>(API.CHAT.CONVERSATION(id), { status })
  return res.data
}

// Суммарное число непрочитанных диалогов (для бейджа в навигации).
export async function getUnreadChatsCount() {
  const res = await listConversations({ status: 'open', period: 'all', take: 100, skip: 0 })
  return res.conversations.filter(c => c.unreadForManager > 0).length
}
