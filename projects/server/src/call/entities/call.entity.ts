export class CallEntity {
  id!: string
  createdAt!: string
  projectId!: string
  phone?: string
  managerName?: string
  managerType?: string
  durationSec?: number
  status!: string
  hasRecording!: boolean
}
