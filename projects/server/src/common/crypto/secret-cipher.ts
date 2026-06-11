import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * Шифрование секретов интеграций (ключ/соль Mango для BYO) для хранения в БД.
 * AES-256-GCM: формат `ivB64:tagB64:cipherB64`. Ключ — 32 байта (64 hex), из env
 * INTEGRATION_ENC_KEY. Аутентификация GCM ловит подмену шифротекста. См. plan-wid-call.md, Фаза 2.
 */

function keyBuffer(keyHex: string): Buffer {
  const key = Buffer.from(keyHex, 'hex')
  if (key.length !== 32) throw new Error('INTEGRATION_ENC_KEY must be 32 bytes (64 hex chars)')
  return key
}

export function encryptWithKey(plain: string, keyHex: string): string {
  const key = keyBuffer(keyHex)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':')
}

export function decryptWithKey(payload: string, keyHex: string): string {
  const key = keyBuffer(keyHex)
  const [ivB64, tagB64, encB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !encB64) throw new Error('malformed ciphertext')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(encB64, 'base64')), decipher.final()]).toString(
    'utf8'
  )
}
