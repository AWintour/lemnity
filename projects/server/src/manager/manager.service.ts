import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { CreateManagerDto } from './dto/create-manager.dto'
import type { UpdateManagerDto } from './dto/update-manager.dto'
import type { ManagerEntity } from './entities/manager.entity'

type ManagerRow = {
  id: string
  projectId: string
  name: string
  type: string
  address: string
  enabled: boolean
  createdAt: Date
}

const toEntity = (m: ManagerRow): ManagerEntity => ({
  id: m.id,
  projectId: m.projectId,
  name: m.name,
  type: m.type,
  address: m.address,
  enabled: m.enabled,
  createdAt: m.createdAt.toISOString()
})

/**
 * Менеджеры проекта (Callback Widget, вкладка «Звонки»). CRUD с проверкой владения проектом —
 * паттерн `MangoIntegrationService.saveForOwner` / `RequestService.update`. `listEnabledForProject`
 * — внутренний, для round-robin привязки звонка (см. CallbackService).
 */
@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnsProject(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
  }

  private async assertOwnsManager(userId: string, id: string) {
    const owned = await this.prisma.manager.findFirst({
      where: { id, project: { userId } },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Manager not found')
  }

  async listForProject(userId: string, projectId: string): Promise<{ managers: ManagerEntity[]; total: number }> {
    await this.assertOwnsProject(userId, projectId)
    const rows = await this.prisma.manager.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    })
    return { managers: rows.map(toEntity), total: rows.length }
  }

  async create(userId: string, projectId: string, dto: CreateManagerDto): Promise<ManagerEntity> {
    await this.assertOwnsProject(userId, projectId)
    const row = await this.prisma.manager.create({
      data: {
        projectId,
        name: dto.name,
        type: dto.type,
        address: dto.address,
        enabled: dto.enabled ?? true
      }
    })
    return toEntity(row)
  }

  async update(userId: string, id: string, dto: UpdateManagerDto): Promise<ManagerEntity> {
    await this.assertOwnsManager(userId, id)
    const row = await this.prisma.manager.update({ where: { id }, data: dto })
    return toEntity(row)
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.assertOwnsManager(userId, id)
    await this.prisma.manager.delete({ where: { id } })
    return { ok: true }
  }

  /** Активные менеджеры проекта по возрастанию createdAt — для round-robin. Без owner-check. */
  listEnabledForProject(projectId: string): Promise<ManagerRow[]> {
    return this.prisma.manager.findMany({
      where: { projectId, enabled: true },
      orderBy: { createdAt: 'asc' }
    })
  }
}
