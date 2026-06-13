export class ChatGroupMessageEntity {
  id!: string
  projectId!: string
  operatorId!: string | null
  senderUserId!: string | null
  senderName!: string | null
  body!: string
  createdAt!: string
}
