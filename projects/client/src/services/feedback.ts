import { http } from '@common/api/http.ts'
import { API } from '@common/api/endpoints.ts'

/**
 * Отправляет обращение «Есть идея или замечания?».
 * Никнейм/почту на клиенте не передаём — сервер берёт пользователя из токена.
 */
export async function submitFeedback(text: string): Promise<void> {
  await http.post(API.FEEDBACK.SUBMIT, { text })
}
