export class ChatGroupMessageEntity {
  id!: string
  projectId!: string
  operatorId!: string | null
  senderUserId!: string | null
  senderName!: string | null
  body!: string
  attachmentUrl!: string | null
  attachmentType!: string | null
  attachmentName!: string | null
  createdAt!: string
}
