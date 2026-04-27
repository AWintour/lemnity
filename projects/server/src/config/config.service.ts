import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {
  CURRENT_VERSION,
  canonicalizeWidgetConfig,
  validate,
  type WidgetType,
  type CanonicalWidgetSettings
} from '@lemnity/widget-config'

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  validateAndCanonicalize(
    widgetType: WidgetType,
    raw: unknown
  ): { data: CanonicalWidgetSettings; version: number } {
    const canonical = canonicalizeWidgetConfig(raw)
    const validation = validate(widgetType, canonical)
    if (!validation.ok) {
      throw new BadRequestException({ message: 'Invalid widget config', issues: validation.issues })
    }
    return { data: canonical as CanonicalWidgetSettings, version: CURRENT_VERSION }
  }

  // async save(widgetId: string, raw: unknown) {
  //   const { data, version } = this.validateAndCanonicalize(raw)
  //   return this.prisma.widget.update({ where: { id: widgetId }, data: { config: data, configVersion: version } })
  // }
}
