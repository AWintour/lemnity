import { request } from '@common/api/httpWrapper.ts'
import { API } from '@common/api/endpoints.ts'

export type WidgetData = {
  type: 'text' | 'image' | 'video'
  content: string
}

export type Widget = { id: string; name: string; data: WidgetData }

export async function listWidgets() {
  const res = await request<Widget[]>(API.WIDGETS.LIST, { method: 'GET' })
  return res.data
}

export async function getWidget(id: string) {
  const res = await request<Widget>(API.WIDGETS.WIDGET(id), { method: 'GET' })
  return res.data
}

export type WidgetPayload = Pick<Widget, 'name' | 'data'>

export async function createWidget(payload: WidgetPayload) {
  const res = await request<Widget, WidgetPayload>(API.WIDGETS.CREATE, {
    method: 'POST',
    data: payload
  })
  return res.data
}

export async function updateWidget(id: string, payload: Partial<WidgetPayload>) {
  const res = await request<Widget, Partial<WidgetPayload>>(API.WIDGETS.WIDGET(id), {
    method: 'PATCH',
    data: payload
  })
  return res.data
}

export async function deleteWidget(id: string) {
  const res = await request<void>(API.WIDGETS.WIDGET(id), { method: 'DELETE' })
  return res.data
}
