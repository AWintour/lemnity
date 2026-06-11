import { http } from '@common/api/http'
import { API } from '@common/api/endpoints'

export type CallStatus = 'new' | 'processed' | 'not_processed' | 'used'

export type CallItem = {
  id: string
  createdAt: string
  projectId: string
  phone?: string
  managerName?: string
  managerType?: string
  durationSec?: number
  status: CallStatus
  hasRecording: boolean
}

export type ManagerStat = {
  managerId: string | null
  managerName: string | null
  count: number
  answeredCount: number
  avgDurationSec: number
  answeredRate: number
}

export type CallsSummary = {
  byManager: ManagerStat[]
  totals: { count: number; answeredCount: number; avgDurationSec: number; answeredRate: number }
}

export type ListCallsParams = {
  projectId?: string
  period?: '7d' | '30d' | '90d' | 'all'
  status?: CallStatus
  skip?: number
  take?: number
}

export type CallsResponse = { calls: CallItem[]; total: number; summary: CallsSummary }

export async function listCalls(params: ListCallsParams) {
  const res = await http.get<CallsResponse>(API.CALLS.LIST, { params })
  return res.data
}

/** Тянет запись звонка с авторизацией (Bearer) и отдаёт object URL для <audio>. */
export async function fetchRecordingBlobUrl(id: string): Promise<string> {
  const res = await http.get(API.CALLS.RECORDING(id), { responseType: 'blob' })
  return URL.createObjectURL(res.data as Blob)
}
