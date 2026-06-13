import { UAParser } from 'ua-parser-js'
import geoip from 'geoip-lite'

/**
 * Метаданные посетителя чата (расширенная аналитика беседы): IP, браузер/ОС/устройство,
 * источник (referer) и гео по IP (geoip-lite, оффлайн-БД). Захватывается ОДИН РАЗ при создании
 * беседы из заголовков REST-запроса или socket-handshake. См. plan-module-chat.md.
 */

export type RawVisitorMeta = {
  ip?: string | null
  userAgent?: string | null
  referer?: string | null
}

export type VisitorMeta = {
  ip: string | null
  userAgent: string | null
  browser: string | null
  os: string | null
  deviceType: string | null
  referer: string | null
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
}

const clean = (v?: string | null): string | null => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s ? s : null
}

const normalizeIp = (ip?: string | null): string | null => {
  let v = clean(ip)
  if (!v) return null
  v = v.split(',')[0].trim() // x-forwarded-for может быть списком
  if (v.startsWith('::ffff:')) v = v.slice(7) // IPv4-mapped IPv6
  return v || null
}

const isPrivateIp = (ip: string): boolean =>
  ip === '127.0.0.1' ||
  ip === '::1' ||
  ip === '0.0.0.0' ||
  /^10\./.test(ip) ||
  /^192\.168\./.test(ip) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)

const guessDeviceType = (ua: string): string => {
  const u = ua.toLowerCase()
  if (!u) return 'desktop'
  if (u.includes('android')) return 'mobile_android'
  if (u.includes('iphone') || u.includes('ipad') || u.includes('ios')) return 'mobile_ios'
  return 'desktop'
}

// «Chrome 130», «Windows 11» — имя + мажорная версия.
const nameMajor = (name?: string, version?: string): string | null => {
  const n = clean(name)
  if (!n) return null
  const major = clean(version)?.split('.')[0]
  return major ? `${n} ${major}` : n
}

export const extractRequestRawMeta = (req: {
  headers: Record<string, unknown>
  socket?: { remoteAddress?: string }
}): RawVisitorMeta => ({
  ip: (req.headers['x-forwarded-for'] as string) ?? req.socket?.remoteAddress ?? null,
  userAgent: (req.headers['user-agent'] as string) ?? null,
  referer:
    (req.headers['referer'] as string) ?? (req.headers['referrer'] as string) ?? null
})

export const extractHandshakeRawMeta = (handshake: {
  address?: string
  headers: Record<string, unknown>
}): RawVisitorMeta => ({
  ip: (handshake.headers['x-forwarded-for'] as string) ?? handshake.address ?? null,
  userAgent: (handshake.headers['user-agent'] as string) ?? null,
  referer:
    (handshake.headers['referer'] as string) ??
    (handshake.headers['referrer'] as string) ??
    null
})

/** Парсит сырые заголовки в готовые поля (UA → браузер/ОС/устройство, IP → гео). */
export const buildVisitorMeta = (raw: RawVisitorMeta): VisitorMeta => {
  const ip = normalizeIp(raw.ip)
  const userAgent = clean(raw.userAgent)
  const referer = clean(raw.referer)

  let browser: string | null = null
  let os: string | null = null
  let deviceType: string | null = null
  if (userAgent) {
    try {
      const r = new UAParser(userAgent).getResult()
      browser = nameMajor(r.browser.name, r.browser.version)
      os = nameMajor(r.os.name, r.os.version)
    } catch {
      // ignore parse errors
    }
    deviceType = guessDeviceType(userAgent)
  }

  let country: string | null = null
  let region: string | null = null
  let city: string | null = null
  let timezone: string | null = null
  if (ip && !isPrivateIp(ip)) {
    try {
      const geo = geoip.lookup(ip)
      if (geo) {
        country = clean(geo.country)
        region = clean(geo.region)
        city = clean(geo.city)
        timezone = clean(geo.timezone)
      }
    } catch {
      // ignore lookup errors
    }
  }

  return { ip, userAgent, browser, os, deviceType, referer, country, region, city, timezone }
}
