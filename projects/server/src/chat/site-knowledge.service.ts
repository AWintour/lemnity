import { Injectable, Logger } from '@nestjs/common'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { PrismaService } from '../prisma.service'
import { extractWebsiteHosts, isHostAllowedByWebsiteHosts } from '../common/origin'

// MVP-grounding ИИ-агента: текстовое «знание» о сайте/продукте клиента.
// Краулим главную + несколько внутренних страниц того же хоста, вырезаем видимый текст,
// кэшируем по проекту (таблица ai_site_knowledge) и подмешиваем в системный промпт.
const FRESH_MS = 7 * 24 * 60 * 60 * 1000 // кэш свеж 7 дней
const FETCH_TIMEOUT_MS = 10_000
const MAX_SELECTED_PAGES = 8 // сколько выбранных внутренних страниц краулим (помимо главной)
const MAX_DISCOVER = 60 // сколько внутренних страниц показываем в списке выбора
const MAX_REDIRECTS = 3
const MAX_CHARS = 12_000 // ограничение объёма контекста
const MAX_HTML_BYTES = 1_500_000 // не тянуть гигантские страницы

/** IPv4/IPv6-литерал из приватного/loopback/link-local диапазона (SSRF-защита). */
const isPrivateAddress = (addr: string): boolean => {
  const ip = addr.toLowerCase()
  if (ip === '::1' || ip === '::') return true
  // IPv4-mapped IPv6 (::ffff:10.0.0.1) — берём хвост.
  const v4 = ip.startsWith('::ffff:') ? ip.slice(7) : ip
  if (isIP(v4) === 4) {
    const [a, b] = v4.split('.').map(Number)
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 169 && b === 254) return true // link-local
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
    return false
  }
  // IPv6 ULA fc00::/7 и link-local fe80::/10.
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true
  if (ip.startsWith('fe8') || ip.startsWith('fe9') || ip.startsWith('fea') || ip.startsWith('feb'))
    return true
  return false
}

@Injectable()
export class SiteKnowledgeService {
  private readonly logger = new Logger(SiteKnowledgeService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает кэшированный текст сайта проекта; при отсутствии/устаревании/смене набора страниц —
   * краулит и обновляет. Изучается ГЛАВНАЯ страница всегда + выбранные внутренние страницы
   * (selectedPages). Если выбранных нет — только главная (лендинг).
   * Best-effort: при любой ошибке возвращает прежний кэш или пустую строку.
   */
  async getOrRefresh(
    projectId: string,
    websiteUrl: string | null | undefined,
    selectedPages: string[] = []
  ): Promise<string> {
    const entry = websiteUrl?.trim() ? this.normalizeEntryUrl(websiteUrl) : ''
    const sig = this.cacheSig(entry, selectedPages)
    const cached = await this.prisma.aiSiteKnowledge.findUnique({ where: { projectId } })
    // Кэш валиден, только если совпадают и набор страниц (sourceUrl=sig), и срок.
    const fresh =
      cached && cached.sourceUrl === sig && Date.now() - cached.fetchedAt.getTime() < FRESH_MS
    if (fresh) return cached.content
    if (!entry) return cached?.content ?? ''

    try {
      const content = await this.crawl(entry, websiteUrl, selectedPages)
      if (!content) return cached?.content ?? ''
      await this.prisma.aiSiteKnowledge.upsert({
        where: { projectId },
        create: { projectId, sourceUrl: sig, content, fetchedAt: new Date() },
        update: { sourceUrl: sig, content, fetchedAt: new Date() }
      })
      return content
    } catch (err) {
      this.logger.warn(`site crawl failed for project ${projectId}: ${(err as Error).message}`)
      return cached?.content ?? ''
    }
  }

  /**
   * Список внутренних страниц сайта для выбора в настройках («Разделы для изучения»).
   * Источники: ссылки с главной + sitemap.xml. Best-effort.
   */
  async discoverPages(
    websiteUrl: string | null | undefined
  ): Promise<{ url: string; path: string }[]> {
    if (!websiteUrl?.trim()) return []
    const entry = this.normalizeEntryUrl(websiteUrl)
    const allowedHosts = extractWebsiteHosts(websiteUrl)
    const [homeHtml, sitemapUrls] = await Promise.all([
      this.safeFetchHtml(entry),
      this.fetchSitemapUrls(entry, allowedHosts)
    ])
    const fromHome = homeHtml ? this.extractInternalLinks(homeHtml, entry, allowedHosts) : []
    const all = Array.from(new Set([...fromHome, ...sitemapUrls])).filter(u => u !== entry)
    return all.slice(0, MAX_DISCOVER).map(u => ({ url: u, path: this.toPath(u) }))
  }

  /** Сигнатура кэша: главная + отсортированный набор выбранных страниц. */
  private cacheSig(entry: string, selectedPages: string[]): string {
    return `${entry}::${[...selectedPages].map(p => p.trim()).filter(Boolean).sort().join('|')}`.slice(
      0,
      2000
    )
  }

  /** Краул главной + выбранных внутренних страниц того же хоста. */
  private async crawl(
    entry: string,
    websiteUrl: string | null | undefined,
    selectedPages: string[]
  ): Promise<string> {
    const allowedHosts = extractWebsiteHosts(websiteUrl)
    const homeHtml = await this.safeFetchHtml(entry)
    if (!homeHtml) return ''
    const homeText = htmlToText(homeHtml)

    const pages = selectedPages
      .map(u => this.toAbsoluteAllowed(u, entry, allowedHosts))
      .filter((u): u is string => !!u && u !== entry)
      .slice(0, MAX_SELECTED_PAGES)

    const subResults = await Promise.allSettled(pages.map(u => this.safeFetchHtml(u)))
    const parts = [homeText]
    for (const r of subResults) {
      if (r.status === 'fulfilled' && r.value) parts.push(htmlToText(r.value))
    }

    return normalizeWhitespace(parts.filter(Boolean).join('\n\n')).slice(0, MAX_CHARS)
  }

  /** Абсолютный URL того же хоста (http/https) или null. */
  private toAbsoluteAllowed(
    value: string,
    base: string,
    allowedHosts: string[]
  ): string | null {
    try {
      const abs = new URL(value, base)
      if (abs.protocol !== 'http:' && abs.protocol !== 'https:') return null
      if (!isHostAllowedByWebsiteHosts(abs.hostname, allowedHosts)) return null
      abs.hash = ''
      return abs.toString()
    } catch {
      return null
    }
  }

  private toPath(u: string): string {
    try {
      const parsed = new URL(u)
      return (parsed.pathname + parsed.search) || '/'
    } catch {
      return u
    }
  }

  /** Парсинг sitemap.xml (best-effort): берём <loc> того же хоста. */
  private async fetchSitemapUrls(entry: string, allowedHosts: string[]): Promise<string[]> {
    let origin: string
    try {
      origin = new URL(entry).origin
    } catch {
      return []
    }
    const xml = await this.safeFetchText(`${origin}/sitemap.xml`)
    if (!xml) return []
    const out = new Set<string>()
    const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(xml)) && out.size < MAX_DISCOVER) {
      const abs = this.toAbsoluteAllowed(m[1], entry, allowedHosts)
      if (abs) out.add(abs)
    }
    return Array.from(out)
  }

  private normalizeEntryUrl(websiteUrl: string): string {
    const raw = websiteUrl.trim()
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw) ? raw : `https://${raw}`
  }

  /** Внутренние ссылки (тот же хост, http/https), уникальные, без якорей. */
  private extractInternalLinks(html: string, baseUrl: string, allowedHosts: string[]): string[] {
    const out = new Set<string>()
    const re = /<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)["']/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) && out.size < 30) {
      try {
        const abs = new URL(m[1], baseUrl)
        if (abs.protocol !== 'http:' && abs.protocol !== 'https:') continue
        if (!isHostAllowedByWebsiteHosts(abs.hostname, allowedHosts)) continue
        abs.hash = ''
        const href = abs.toString()
        if (href !== baseUrl) out.add(href)
      } catch {
        /* skip malformed */
      }
    }
    return Array.from(out)
  }

  /** Безопасный fetch HTML с ручной проверкой редиректов и SSRF-валидацией каждого хопа. */
  private safeFetchHtml(url: string): Promise<string | null> {
    return this.safeFetchBody(url, ['text/html', 'text/plain'], 0)
  }

  /** Безопасный fetch XML/текста (sitemap). */
  private safeFetchText(url: string): Promise<string | null> {
    return this.safeFetchBody(url, ['xml', 'text/plain'], 0)
  }

  private async safeFetchBody(
    url: string,
    allowedTypes: string[],
    depth: number
  ): Promise<string | null> {
    if (depth > MAX_REDIRECTS) return null
    if (!(await this.isSafePublicUrl(url))) return null

    let res: Response
    try {
      res = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'User-Agent': 'LemnityAiAgent/1.0', Accept: 'text/html,application/xml' }
      })
    } catch {
      return null
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return null
      const next = new URL(loc, url).toString()
      return this.safeFetchBody(next, allowedTypes, depth + 1)
    }
    if (!res.ok) return null

    const ctype = (res.headers.get('content-type') ?? '').toLowerCase()
    if (!allowedTypes.some(t => ctype.includes(t))) return null

    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_HTML_BYTES) return null
    return new TextDecoder('utf-8').decode(buf)
  }

  /** http/https + хост не приватный/loopback (DNS-резолв всех адресов). */
  private async isSafePublicUrl(url: string): Promise<boolean> {
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return false
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const host = parsed.hostname
    if (!host || host === 'localhost') return false
    if (isIP(host) && isPrivateAddress(host)) return false

    try {
      const addrs = await lookup(host, { all: true })
      if (!addrs.length) return false
      if (addrs.some(a => isPrivateAddress(a.address))) return false
    } catch {
      return false
    }
    return true
  }
}

/** Грубое, но устойчивое извлечение видимого текста из HTML без внешних зависимостей. */
const htmlToText = (html: string): string => {
  let s = html
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  s = s.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
  s = s.replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)\s*>/gi, '\n')
  s = s.replace(/<[^>]+>/g, ' ')
  s = decodeEntities(s)
  return s
}

const decodeEntities = (s: string): string =>
  s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, d) => {
      try {
        return String.fromCodePoint(Number(d))
      } catch {
        return ' '
      }
    })

const normalizeWhitespace = (s: string): string =>
  s
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
