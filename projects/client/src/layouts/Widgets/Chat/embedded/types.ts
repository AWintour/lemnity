export type ChatMessageSender = 'visitor' | 'manager' | 'system'

export type ChatMessageAttachmentType = 'image' | 'video' | 'file'

export type ChatUiMessage = {
  id: string
  sender: ChatMessageSender
  body: string
  createdAt: string
  // Изображение шага сценария (data-URL или внешний URL) — рендерится в пузыре.
  image?: string
  // Вложение от оператора (видео/файл; картинка дублируется в image для обратной совместимости).
  attachmentUrl?: string
  attachmentType?: ChatMessageAttachmentType
  attachmentName?: string
  // Сообщение посетителя, ещё не подтверждённое сервером (optimistic send).
  pending?: boolean
}
