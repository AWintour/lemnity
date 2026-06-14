export class ChatOperatorEntity {
  id!: string
  projectId!: string
  userId!: string | null
  isOwner!: boolean
  name!: string
  email!: string | null
  role!: string
  avatarUrl!: string | null
  online!: boolean
  status!: string
  departmentId!: string | null
  widgetId!: string | null
  createdAt!: string
}
