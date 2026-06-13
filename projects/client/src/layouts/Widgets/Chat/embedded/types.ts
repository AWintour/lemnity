export type ChatMessageSender = 'visitor' | 'manager' | 'system'

export type ChatUiMessage = {
  id: string
  sender: ChatMessageSender
  body: string
  createdAt: string
  // Изображение шага сценария (data-URL или внешний URL) — рендерится в пузыре.
  image?: string
  // Сообщение посетителя, ещё не подтверждённое сервером (optimistic send).
  pending?: boolean
}
