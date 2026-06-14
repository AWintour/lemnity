import { http } from '../common/api/http'
import { API } from '../common/api/endpoints'

// Лимит загрузки картинок (синхронно с сервером MAX_FILE_SIZE_BYTES). Больше — статус
// «Уменьшите размер файла (картинки)».
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TOO_LARGE_MESSAGE = 'Уменьшите размер файла (картинки)'

export async function uploadImage(file: File): Promise<{ key: string; url: string }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<{ key: string; url: string }>(API.FILES.IMAGES, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export type AttachmentType = 'image' | 'video' | 'file'

export function classifyAttachment(mime: string): AttachmentType {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return 'file'
}

// Универсальная загрузка вложения чата (картинка/видео/документ) → URL + тип.
export async function uploadFile(
  file: File
): Promise<{ key: string; url: string; type: AttachmentType; name: string }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<{ key: string; url: string; contentType: string; name: string }>(
    API.FILES.UPLOADS,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return { key: data.key, url: data.url, type: classifyAttachment(data.contentType || file.type), name: data.name || file.name }
}

export async function uploadVideo(file: File): Promise<{ key: string; url: string }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<{ key: string; url: string }>(API.FILES.VIDEOS, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export function getFileUrlFromKey(key: string): string {
  // http baseURL includes /api, so just append /files
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
  return `${base}/files?key=${encodeURIComponent(key)}`
}
