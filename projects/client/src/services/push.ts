import { http } from '@/common/api/http'
import { API } from '@/common/api/endpoints'

// REST-обёртки web-push. Токен (владельца/оператора) подставляется интерсептором http.

export async function getPushPublicKey(): Promise<string | null> {
  const res = await http.get<{ publicKey: string | null }>(API.CHAT.PUSH_PUBLIC_KEY)
  return res.data.publicKey
}

export async function subscribePush(dto: {
  projectId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}): Promise<void> {
  await http.post(API.CHAT.PUSH_SUBSCRIBE, dto)
}

export async function unsubscribePush(endpoint: string): Promise<void> {
  await http.post(API.CHAT.PUSH_UNSUBSCRIBE, { endpoint })
}
