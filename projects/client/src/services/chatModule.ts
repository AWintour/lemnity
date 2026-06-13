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
  createdAt: string
}

export type SaveOperatorDto = {
  name?: string
  email?: string
  role?: string
  avatarUrl?: string
  departmentId?: string | null
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

export type ChatIntegration = {
  type: SocialType
  connected: boolean
  config: unknown
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

/* ===================== Групповой чат ===================== */

export type ChatGroupMessageItem = {
  id: string
  projectId: string
  operatorId: string | null
  senderUserId: string | null
  senderName: string | null
  body: string
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
  dto: { body: string; operatorId?: string; senderName?: string }
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
