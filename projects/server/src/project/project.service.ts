import { Injectable } from '@nestjs/common'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { PrismaService } from '../prisma.service'
import { JsonValue, ProjectCreateInput } from '@lemnity/database'
import { migrateToCurrent, CURRENT_VERSION } from '@lemnity/widget-config/migrations'
import { FeatureAccessService } from '../lemnity/feature-access.service'

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly featureAccess: FeatureAccessService
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    // Лимит сайтов (= проектов) по подписке Callback. No-op, если активной подписки нет.
    await this.featureAccess.assertCanCreateSite(userId)

    const project: ProjectCreateInput = {
      title: createProjectDto.title,
      websiteUrl: createProjectDto.websiteUrl,
      enabled: createProjectDto.enabled,
      user: { connect: { id: userId } }
    }

    return this.prisma.project.create({
      data: project,
      include: { widgets: true }
    })
  }

  findAll(userId: string) {
    return this.prisma.project
      .findMany({
        where: { userId },
        include: { widgets: true }
      })
      .then(projects => projects.map(p => this.migrateProjectWidgets(p)))
  }

  findOne(userId: string, id: string) {
    return this.prisma.project
      .findFirst({
        where: { id, userId },
        include: { widgets: true }
      })
      .then(p => (p ? this.migrateProjectWidgets(p) : p))
  }

  update(userId: string, id: string, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id, userId },
      data: updateProjectDto,
      include: { widgets: true }
    })
  }

  remove(userId: string, id: string) {
    return this.prisma.project.delete({
      where: { id, userId },
      include: { widgets: true }
    })
  }

  private migrateProjectWidgets<
    T extends { widgets?: Array<{ config: unknown; configVersion: number | null }> }
  >(project: T): T {
    if (!project.widgets || project.widgets.length === 0) return project
    const widgets = project.widgets.map(w => {
      if (!w.config) return w
      const { data, version } = migrateToCurrent(w.config as unknown, w.configVersion ?? undefined)
      return { ...w, config: data as JsonValue, configVersion: version ?? CURRENT_VERSION }
    }) as T['widgets']
    return { ...(project as any), widgets } as T
  }
}
