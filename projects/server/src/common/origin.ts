import type { Request } from 'express'

export const extractRequestOriginHost = (req: Request): string | null => {
  const rawOrigin = typeof req.headers.origin === 'string' ? req.headers.origin.trim() : undefined
  const rawReferer =
    typeof req.headers.referer === 'string' ? req.headers.referer.trim() : undefined

  const tryParseHost = (value: string | undefined): string | null => {
    if (!value) return null
    if (value === 'null') return null
    try {
      return new URL(value).hostname
    } catch {
      return null
    }
  }

  return tryParseHost(rawOrigin) ?? tryParseHost(rawReferer)
}

// Тот же разбор origin/referer, но из «сырых» заголовков (например, socket.io handshake.headers),
// где нет express Request. Переиспользуется gateway-ом чата.
export const extractOriginHostFromHeaders = (
  headers: Record<string, unknown>
): string | null => {
  const pick = (value: unknown): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined
  const rawOrigin = pick(headers.origin)
  const rawReferer = pick(headers.referer)

  const tryParseHost = (value: string | undefined): string | null => {
    if (!value || value === 'null') return null
    try {
      return new URL(value).hostname
    } catch {
      return null
    }
  }

  return tryParseHost(rawOrigin) ?? tryParseHost(rawReferer)
}

export const extractWebsiteHosts = (websiteUrl: string | null | undefined): string[] => {
  const raw = (websiteUrl ?? '').trim()
  if (!raw) return []

  const toUrl = (value: string) =>
    /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value) ? value : `https://${value}`

  try {
    const host = new URL(toUrl(raw)).hostname
    const noWww = host.startsWith('www.') ? host.slice(4) : host
    const withWww = noWww === host ? `www.${host}` : host
    return Array.from(new Set([host, noWww, withWww].filter(Boolean)))
  } catch {
    return []
  }
}

export const isHostAllowedByWebsiteHosts = (requestHost: string, websiteHosts: string[]) => {
  const host = requestHost.toLowerCase()
  return websiteHosts.some(allowed => {
    const a = allowed.toLowerCase()
    return host === a || host.endsWith(`.${a}`)
  })
}

export const isDevOriginHostAllowed = (originHost: string) => {
  const host = originHost.trim().toLowerCase()
  if (!host) return false
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true

  const parts = host.split('.')
  if (parts.length !== 4) return false
  const nums = parts.map(p => (p.length ? Number(p) : NaN))
  if (nums.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false

  const [a, b] = nums
  if (a === 10) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  return false
}
