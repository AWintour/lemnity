import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common'
import { CreateWidgetDto } from './dto/create-widget.dto'
import { UpdateWidgetDto } from './dto/update-widget.dto'
import { PrismaService } from '../prisma.service'
import { Prisma } from '@lemnity/database'
import { ConfigService } from '../config/config.service'
import { CURRENT_VERSION, migrateToCurrent } from '@lemnity/widget-config'
import {
  extractWebsiteHosts,
  isDevOriginHostAllowed,
  isHostAllowedByWebsiteHosts
} from '../common/origin'

@Injectable()
export class WidgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async spinWheelPublic(
    widgetId: string,
    sessionId: string | undefined,
    originHost: string | null
  ) {
    type WheelSector = {
      id: string
      mode: 'text' | 'icon'
      text?: string
      icon?: string
      promo?: string
      chance?: number
      isWin?: boolean
    }

    const normalizedSessionId = typeof sessionId === 'string' ? sessionId.trim() : ''
    if (!normalizedSessionId) {
      throw new BadRequestException('sessionId is required')
    }

    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId, enabled: true, project: { enabled: true } },
      select: {
        id: true,
        enabled: true,
        type: true,
        config: true,
        configVersion: true,
        project: { select: { websiteUrl: true } }
      }
    })

    if (!widget || !widget.enabled) {
      throw new NotFoundException('Widget not found')
    }
    if (!originHost) throw new ForbiddenException('Origin is required')
    const isProd = process.env.NODE_ENV === 'production'
    if (isProd || !isDevOriginHostAllowed(originHost)) {
      const websiteHosts = extractWebsiteHosts(widget.project.websiteUrl)
      if (!websiteHosts.length || !isHostAllowedByWebsiteHosts(originHost, websiteHosts)) {
        throw new ForbiddenException('Origin is not allowed')
      }
    }
    if (widget.type !== 'WHEEL_OF_FORTUNE') {
      throw new BadRequestException('Widget is not a wheel')
    }
    if (!widget.config) {
      throw new BadRequestException('Widget config is empty')
    }

    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null && !Array.isArray(value)

    const parseSector = (value: unknown): WheelSector | null => {
      if (!isRecord(value)) return null

      const id = typeof value.id === 'string' ? value.id : null
      const mode = value.mode === 'text' || value.mode === 'icon' ? value.mode : null
      if (!id || !mode) return null

      const text = typeof value.text === 'string' ? value.text : undefined
      const icon = (() => {
        if (typeof value.icon === 'string') return value.icon
        if (isRecord(value.icon) && typeof value.icon.url === 'string') return value.icon.url
        return undefined
      })()
      const promo = typeof value.promo === 'string' ? value.promo : undefined
      const chance = (() => {
        if (typeof value.chance === 'number' && Number.isFinite(value.chance)) return value.chance
        if (typeof value.chance === 'string') {
          const n = Number(value.chance)
          return Number.isFinite(n) ? n : undefined
        }
        return undefined
      })()
      const isWin =
        mode === 'icon' ? false : typeof value.isWin === 'boolean' ? value.isWin : undefined

      return { id, mode, text, icon, promo, chance, isWin }
    }

    const migrated = migrateToCurrent(widget.config as unknown, widget.configVersion ?? undefined)
    const cfg = migrated.data
    if (!isRecord(cfg)) throw new BadRequestException('Invalid wheel config')

    const widgetCfg = cfg.widget
    if (!isRecord(widgetCfg)) throw new BadRequestException('Invalid wheel config')

    const sectorsCfg = widgetCfg.sectors
    if (!isRecord(sectorsCfg)) throw new BadRequestException('Invalid wheel config')

    const rawItems = sectorsCfg.items
    if (!Array.isArray(rawItems)) throw new BadRequestException('Wheel sectors are missing')

    const isWheelSector = (v: WheelSector | null): v is WheelSector => v !== null
    const items: WheelSector[] = rawItems.map(parseSector).filter(isWheelSector)
    if (items.length === 0) throw new BadRequestException('Wheel sectors are missing')

    const existing = await this.prisma.wheelOfFortuneSpin.findUnique({
      where: { widgetId_sessionId: { widgetId, sessionId: normalizedSessionId } }
    })
    if (existing) {
      const sector =
        items.find(s => s.id === existing.sectorId) ??
        ({
          id: existing.sectorId,
          mode: 'text',
          isWin: existing.isWin
        } as WheelSector)

      return {
        blocked: true as const,
        reason: 'already_spun' as const,
        sectorId: existing.sectorId,
        isWin: existing.isWin,
        sector
      }
    }

    const totalSpecified = items.reduce((sum, item) => sum + (item.chance ?? 0), 0)
    if (totalSpecified > 100) {
      throw new BadRequestException('Chance sum must not exceed 100')
    }

    const emptyIndexes: number[] = []
    for (let i = 0; i < items.length; i += 1) {
      if (typeof items[i]?.chance === 'undefined') emptyIndexes.push(i)
    }

    const weights = items.map(item => item.chance ?? 0)
    if (emptyIndexes.length > 0) {
      const leftover = Math.max(0, 100 - totalSpecified)
      const fill = leftover / emptyIndexes.length
      for (const idx of emptyIndexes) weights[idx] = fill
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    const selectedIndex = (() => {
      if (items.length === 1) return 0
      if (totalWeight <= 0) return Math.floor(Math.random() * items.length)
      const r = Math.random() * totalWeight
      let acc = 0
      for (let i = 0; i < weights.length; i += 1) {
        acc += weights[i] ?? 0
        if (r < acc) return i
      }
      return weights.length - 1
    })()

    const sector = items[selectedIndex]
    const isWin = Boolean(sector.isWin)

    try {
      await this.prisma.wheelOfFortuneSpin.create({
        data: {
          wheelWidget: { connect: { widgetId } },
          sessionId: normalizedSessionId,
          sectorId: sector.id,
          isWin
        }
      })
    } catch (err: unknown) {
      const isErrorWithCode = (value: unknown): value is { code: string } =>
        isRecord(value) && typeof value.code === 'string'

      if (isErrorWithCode(err) && err.code === 'P2002') {
        const createdByRace = await this.prisma.wheelOfFortuneSpin.findUnique({
          where: { widgetId_sessionId: { widgetId, sessionId: normalizedSessionId } }
        })
        if (createdByRace) {
          const sectorFromRace =
            items.find(s => s.id === createdByRace.sectorId) ??
            ({
              id: createdByRace.sectorId,
              mode: 'text',
              isWin: createdByRace.isWin
            } as WheelSector)

          return {
            blocked: true as const,
            reason: 'already_spun' as const,
            sectorId: createdByRace.sectorId,
            isWin: createdByRace.isWin,
            sector: sectorFromRace
          }
        }
      }
      throw err
    }

    return {
      sectorId: sector.id,
      isWin,
      sector
    }
  }

  async create(createWidgetDto: CreateWidgetDto, userId: string) {
    // Verify that the project belongs to the user
    const project = await this.prisma.project.findFirst({
      where: { id: createWidgetDto.projectId, userId }
    })

    if (!project) {
      throw new ForbiddenException('Project not found or access denied')
    }

    const data: Prisma.WidgetCreateInput = {
      name: createWidgetDto.name,
      type: createWidgetDto.type,
      enabled: createWidgetDto.enabled ?? false,
      project: { connect: { id: createWidgetDto.projectId } }
    }

    if (createWidgetDto.config !== undefined && createWidgetDto.type) {
      const widgetType = createWidgetDto.type

      const { data: canonical, version } = this.configService.validateAndCanonicalize(
        widgetType,
        createWidgetDto.config as unknown
      )

      data.config = canonical as Prisma.InputJsonValue
      ;(data as { configVersion?: number | null }).configVersion = version
    }

    const created = await this.prisma.widget.create({ data })
    return created
  }

  async findAllByProject(projectId: string, userId: string) {
    // Verify that the project belongs to the user
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId }
    })

    if (!project) {
      throw new ForbiddenException('Project not found or access denied')
    }

    const widgets = await this.prisma.widget.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })

    // Migrate configs on read so clients always get the latest canonical shape
    return widgets.map(w => {
      if (!w.config) return w
      const { data, version } = migrateToCurrent(w.config as unknown, w.configVersion ?? undefined)
      return { ...w, config: data as Prisma.JsonValue, configVersion: version ?? CURRENT_VERSION }
    })
  }

  async findOne(id: string, userId: string) {
    const widget = await this.prisma.widget.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!widget) {
      throw new NotFoundException('Widget not found')
    }

    // Verify that the widget's project belongs to the user
    if (widget.project.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }

    // Return migrated config so the client always sees the latest shape
    if (widget.config) {
      const { data, version } = migrateToCurrent(
        widget.config as unknown,
        widget.configVersion ?? undefined
      )
      return {
        ...widget,
        config: data as Prisma.JsonValue,
        configVersion: version ?? CURRENT_VERSION
      }
    }
    return widget
  }

  async findPublic(id: string, originHost: string | null) {
    const widget = await this.prisma.widget.findFirst({
      where: { id, enabled: true, project: { enabled: true } },
      select: {
        id: true,
        projectId: true,
        type: true,
        enabled: true,
        config: true,
        configVersion: true,
        project: { select: { websiteUrl: true } }
      }
    })

    if (!widget || !widget.enabled) {
      throw new NotFoundException('Widget not found')
    }
    if (!originHost) throw new ForbiddenException('Origin is required')
    const isProd = process.env.NODE_ENV === 'production'
    if (isProd || !isDevOriginHostAllowed(originHost)) {
      const websiteHosts = extractWebsiteHosts(widget.project.websiteUrl)
      if (!websiteHosts.length || !isHostAllowedByWebsiteHosts(originHost, websiteHosts)) {
        throw new ForbiddenException('Origin is not allowed')
      }
    }

    if (widget.config) {
      const { data } = migrateToCurrent(widget.config as unknown, widget.configVersion ?? undefined)
      return {
        id: widget.id,
        projectId: widget.projectId,
        type: widget.type,
        enabled: widget.enabled,
        config: data as Prisma.JsonValue
      }
    }

    return {
      id: widget.id,
      projectId: widget.projectId,
      type: widget.type,
      enabled: widget.enabled,
      config: widget.config ?? null
    }
  }

  async update(id: string, updateWidgetDto: UpdateWidgetDto, userId: string) {
    // First verify access
    await this.findOne(id, userId)
    
    const data: Prisma.WidgetUpdateInput = {}
    if (updateWidgetDto.name !== undefined) data.name = updateWidgetDto.name
    if (updateWidgetDto.type !== undefined) data.type = updateWidgetDto.type
    if (updateWidgetDto.enabled !== undefined) data.enabled = updateWidgetDto.enabled
    if (updateWidgetDto.config !== undefined && updateWidgetDto.type) {
      const widgetType = updateWidgetDto.type
      
      // validate + migrate, persist config + version in the same update
      const { data: canonicalConfig, version } = this.configService.validateAndCanonicalize(
        widgetType,
        updateWidgetDto.config as unknown
      )
      data.config = canonicalConfig as Prisma.InputJsonValue
      ;(data as { configVersion?: number | null }).configVersion = version
    }

    const updated = await this.prisma.widget.update({
      where: { id },
      data
    })
    return updated
  }

  async remove(id: string, userId: string) {
    // First verify access
    await this.findOne(id, userId)

    return this.prisma.widget.delete({ where: { id } })
  }

  async toggleEnabled(id: string, enabled: boolean, userId: string) {
    // First verify access
    await this.findOne(id, userId)

    return this.prisma.widget.update({
      where: { id },
      data: { enabled }
    })
  }
}
