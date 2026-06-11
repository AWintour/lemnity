import { http } from '@common/api/http'
import { API } from '@common/api/endpoints'

export type ManagerType = 'SIP' | 'Телефон'

export type ManagerItem = {
  id: string
  projectId: string
  name: string
  type: ManagerType
  address: string
  enabled: boolean
  createdAt: string
}

export type SaveManagerDto = {
  name?: string
  type?: ManagerType
  address?: string
  enabled?: boolean
}

export async function listManagers(projectId: string) {
  const res = await http.get<{ managers: ManagerItem[]; total: number }>(API.MANAGERS.LIST(projectId))
  return res.data
}

export async function createManager(projectId: string, dto: SaveManagerDto) {
  const res = await http.post<ManagerItem>(API.MANAGERS.LIST(projectId), dto)
  return res.data
}

export async function updateManager(projectId: string, id: string, dto: SaveManagerDto) {
  const res = await http.patch<ManagerItem>(API.MANAGERS.MANAGER(projectId, id), dto)
  return res.data
}

export async function deleteManager(projectId: string, id: string) {
  const res = await http.delete<{ ok: true }>(API.MANAGERS.MANAGER(projectId, id))
  return res.data
}
