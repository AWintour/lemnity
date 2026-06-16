import { http } from '@common/api/http'
import { API } from '@common/api/endpoints'

/* ============================ Операторы ============================ */

export type ChatOperatorItem = {
  id: string
  projectId: string
  userId: string | null
  isOwner: boolean
  name: string
  email: string | null
  role: string
  avatarUrl: string | null
  online: boolean
  status: string
  departmentId: string | null
  widgetId: string | null
  loginEmail: string | null
  hasLogin: boolean
  active: boolean
  createdAt: string
}

export type SaveOperatorDto = {
  name?: string
  email?: string
  role?: string
  avatarUrl?: string
  departmentId?: string | null
  // Чат-скоуп оператора: widgetId конкретного чата или null = все чаты владельца.
  widgetId?: string | null
  // Учётка входа оператора.
  loginEmail?: string
  password?: string
  active?: boolean
  status?: string
  online?: boolean
}

export async function listOperators(projectId: string) {
  const res = await http.get<{ operators: ChatOperatorItem[]; total: number }>(
    API.CHAT_OPS.OPERATORS(projectId)
  )
  return res.data
}

export async function createOperator(projectId: string, dto: SaveOperatorDto) {
  const res = await http.post<ChatOperatorItem>(API.CHAT_OPS.OPERATORS(projectId), dto)
  return res.data
}

export async function updateOperator(projectId: string, id: string, dto: SaveOperatorDto) {
  const res = await http.patch<ChatOperatorItem>(API.CHAT_OPS.OPERATOR(projectId, id), dto)
  return res.data
}

export async function deleteOperator(projectId: string, id: string) {
  const res = await http.delete<{ ok: true }>(API.CHAT_OPS.OPERATOR(projectId, id))
  return res.data
}

/* ============================ Отделы ============================ */

export type ChatDepartmentMember = {
  id: string
  name: string
  role: string
  online: boolean
  avatarUrl: string | null
}

export type ChatDepartmentItem = {
  id: string
  projectId: string
  name: string
  description: string | null
  operators: ChatDepartmentMember[]
  membersCount: number
  createdAt: string
}

export type SaveDepartmentDto = { name?: string; description?: string }

export async function listDepartments(projectId: string) {
  const res = await http.get<{ departments: ChatDepartmentItem[]; total: number }>(
    API.CHAT_OPS.DEPARTMENTS(projectId)
  )
  return res.data
}

export async function createDepartment(projectId: string, dto: SaveDepartmentDto) {
  const res = await http.post<ChatDepartmentItem>(API.CHAT_OPS.DEPARTMENTS(projectId), dto)
  return res.data
}

export async function updateDepartment(projectId: string, id: string, dto: SaveDepartmentDto) {
  const res = await http.patch<ChatDepartmentItem>(API.CHAT_OPS.DEPARTMENT(projectId, id), dto)
  return res.data
}

export async function deleteDepartment(projectId: string, id: string) {
  const res = await http.delete<{ ok: true }>(API.CHAT_OPS.DEPARTMENT(projectId, id))
  return res.data
}

/* ====================== Автораспределение ====================== */

export type DistributionSettings = {
  enabled: boolean
  method: 'common' | 'balanced'
  how: 'queue' | 'load'
  operatorIds: string[]
}

export async function getDistribution(projectId: string) {
  const res = await http.get<DistributionSettings>(API.CHAT_OPS.DISTRIBUTION(projectId))
  return res.data
}

export async function saveDistribution(projectId: string, dto: DistributionSettings) {
  const res = await http.put<DistributionSettings>(API.CHAT_OPS.DISTRIBUTION(projectId), dto)
  return res.data
}

/* ========================= Соцсети ========================= */

export type SocialType = 'telegram' | 'max' | 'vk'

// Несекретный срез конфига интеграции (токен на клиент не приходит).
export type ChatIntegrationConfig = { accountName?: string } | null

export type ChatIntegration = {
  type: SocialType
  connected: boolean
  config: ChatIntegrationConfig
}

export async function listIntegrations(projectId: string) {
  const res = await http.get<{ integrations: ChatIntegration[] }>(
    API.CHAT_OPS.INTEGRATIONS(projectId)
  )
  return res.data
}

export async function updateIntegration(
  projectId: string,
  type: SocialType,
  dto: { connected: boolean; config?: Record<string, unknown> }
) {
  const res = await http.patch<ChatIntegration>(API.CHAT_OPS.INTEGRATION(projectId, type), dto)
  return res.data
}

/** Реальное подключение соцсети: токен (TG/MAX — бот; VK — токен сообщества) + groupId (VK, опц.). */
export async function connectIntegration(
  projectId: string,
  type: SocialType,
  creds: { token: string; groupId?: string }
) {
  const res = await http.post<ChatIntegration>(
    API.CHAT_OPS.INTEGRATION_CONNECT(projectId, type),
    creds
  )
  return res.data
}

export async function disconnectIntegration(projectId: string, type: SocialType) {
  const res = await http.post<ChatIntegration>(
    API.CHAT_OPS.INTEGRATION_DISCONNECT(projectId, type),
    {}
  )
  return res.data
}

/* ===================== Групповой чат ===================== */

export type ChatGroupMessageItem = {
  id: string
  projectId: string
  operatorId: string | null
  senderUserId: string | null
  senderName: string | null
  body: string
  attachmentUrl: string | null
  attachmentType: string | null
  attachmentName: string | null
  createdAt: string
}

export async function listGroupMessages(projectId: string) {
  const res = await http.get<{ messages: ChatGroupMessageItem[] }>(
    API.CHAT_OPS.GROUP_MESSAGES(projectId)
  )
  return res.data
}

export async function sendGroupMessage(
  projectId: string,
  dto: {
    body: string
    operatorId?: string
    senderName?: string
    attachmentUrl?: string
    attachmentType?: 'image' | 'video' | 'file'
    attachmentName?: string
  }
) {
  const res = await http.post<ChatGroupMessageItem>(API.CHAT_OPS.GROUP_MESSAGES(projectId), dto)
  return res.data
}

/* ============ Обновление полей диалога (назначение/категория/заметка) ============ */

export type UpdateConversationFields = {
  status?: 'open' | 'closed'
  assignedOperatorId?: string | null
  category?: string | null
  note?: string | null
  channel?: string | null
}

export async function updateConversationFields(id: string, dto: UpdateConversationFields) {
  const res = await http.patch(API.CHAT.CONVERSATION(id), dto)
  return res.data
}

/* ============ ИИ-агент: месячная квота сообщений по чат-виджету ============ */

export type AiUsage = {
  configured: boolean
  limit: number
  used: number
  remaining: number
  resetAt: string
  dailyLimit: number
  dailyUsed: number
  dailyRemaining: number
  dailyResetAt: string
}

export async function getAiUsage(widgetId: string) {
  const res = await http.get<AiUsage>(API.CHAT.AI_USAGE(widgetId))
  return res.data
}

export type AiPage = { url: string; path: string }

export async function getAiPages(widgetId: string) {
  const res = await http.get<{ pages: AiPage[] }>(API.CHAT.AI_PAGES(widgetId))
  return res.data.pages
}

/* ============ Тариф/подписка «Модуля Чат» по чат-виджету ============ */

export type ChatPlanTier = 'free' | 'start' | 'pro' | 'business' | 'agency'

export type ChatSubscription = {
  planTier: ChatPlanTier
  managerLimit: number
  siteLimit: number
  aiDailyLimit: number
  paidUntil: string | null
  features: {
    allChannels: boolean
    whiteLabel: boolean
    advancedAnalytics: boolean
    departments: boolean
    apiAccess: boolean
    prioritySupport: boolean
  }
}

export async function getChatSubscription(widgetId: string): Promise<ChatSubscription> {
  const res = await http.get<ChatSubscription>(API.CHAT.SUBSCRIPTION(widgetId))
  return res.data
}
