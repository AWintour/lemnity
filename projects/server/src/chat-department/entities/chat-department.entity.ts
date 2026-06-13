export class ChatDepartmentEntity {
  id!: string
  projectId!: string
  name!: string
  description!: string | null
  operators!: Array<{
    id: string
    name: string
    role: string
    online: boolean
    avatarUrl: string | null
  }>
  membersCount!: number
  createdAt!: string
}
