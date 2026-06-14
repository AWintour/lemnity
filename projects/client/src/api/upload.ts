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
