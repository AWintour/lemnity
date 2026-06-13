export class ChatOperatorEntity {
  id!: string
  projectId!: string
  name!: string
  email!: string | null
  role!: string
  avatarUrl!: string | null
  online!: boolean
  status!: string
  departmentId!: string | null
  createdAt!: string
}
