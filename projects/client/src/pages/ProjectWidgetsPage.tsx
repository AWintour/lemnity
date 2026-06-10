import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import Header from '@/layouts/Header/Header'
import { useProjectsStore } from '@/stores/projectsStore'
import { Breadcrumbs, BreadcrumbItem } from '@heroui/breadcrumbs'
import { useEffect, useMemo, type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tooltip } from '@heroui/tooltip'
import { Button } from '@heroui/button'
import SvgIcon from '@/components/SvgIcon'
import iconInfo from '@/assets/icons/info.svg'
import WidgetCard from '@/layouts/WidgetCard/WidgetCard'
import type { WidgetBadge } from '@/layouts/WidgetCard/WidgetCard'
import { AVAILABLE_WIDGETS } from '@/layouts/Widgets/constants'
import { WidgetTypeEnum, UserRoleEnum, type CreateWidgetDtoTypeEnum } from '@lemnity/api-sdk'
import useUserStore from '@/stores/userStore'

// Виджеты, доступные пока только администратору (тестовый период).
// После проверки — убрать из набора, чтобы открыть всем.
const ADMIN_ONLY_WIDGETS: ReadonlySet<string> = new Set([WidgetTypeEnum.VIDEO_WIDGET])

// Allowlist админов по email (на время теста; синхронно с сервером).
const ADMIN_EMAILS: string[] = (
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? 'simakov@lemnity.ru'
)
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

import breadcrumbSeparator from '@/assets/icons/breadcrumb-separator.svg'

const BreadcrumbSeparator = () => (
  <div className="w-2.5 h-2.5">
    <SvgIcon src={breadcrumbSeparator} />
  </div>
)

const ProjectWidgetsPage = (): ReactElement => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const ensureLoaded = useProjectsStore(s => s.ensureLoaded)
  const project = useProjectsStore(s => s.projects.find(p => p.id === projectId))
  const createWidget = useProjectsStore(s => s.createWidget)
  const toggleWidgetEnabled = useProjectsStore(s => s.toggleWidgetEnabled)

  useEffect(() => {
    // fetch projects (and their widgets) when landing directly on the page
    ensureLoaded().catch(console.error)
  }, [ensureLoaded])

  const projectName = project?.name || ''
  const widgets = useMemo(() => project?.widgets || [], [project?.widgets])

  const user = useUserStore(s => s.user)
  const isAdmin =
    user?.role === UserRoleEnum.ADMIN ||
    (!!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))
  // Скрываем admin-only виджеты (напр. «Видео виджет») для обычных пользователей
  const availableWidgets = useMemo(
    () => AVAILABLE_WIDGETS.filter(w => isAdmin || !ADMIN_ONLY_WIDGETS.has(w.type)),
    [isAdmin]
  )

  const handleCreateWidget = async (type: CreateWidgetDtoTypeEnum, name: string) => {
    if (!projectId) return
    try {
      const created = await createWidget(projectId, name, type)
      navigate(`/projects/${projectId}/widgets/${created.id}/edit`)
    } catch (error) {
      console.error('Failed to create widget:', error)
    }
  }

  const handleToggleWidget = async (widgetId: string, enabled: boolean) => {
    if (!projectId) return
    try {
      await toggleWidgetEnabled(projectId, widgetId, enabled)
    } catch (error) {
      console.error('Failed to toggle widget:', error)
    }
  }

  const handleEditWidget = (widgetId: string) => {
    if (!projectId) return
    navigate(`/projects/${projectId}/widgets/${widgetId}/edit`)
  }

  const getBreadcrumbs = () => (
    <Breadcrumbs
      size="lg"
      itemClasses={{
        item: 'text-[#1E73BE]',
        separator: 'text-[#1A52DB] mx-3.5'
      }}
      separator={<BreadcrumbSeparator />}
    >
      <BreadcrumbItem href="/">Главная</BreadcrumbItem>
      <BreadcrumbItem>{`Проект "${projectName}"`}</BreadcrumbItem>
    </Breadcrumbs>
  )

  const getWidgetTooltip = () => {
    return (
      <Tooltip
        content={
          <span>
            Внимание! Одновременно может быть
            <br />
            включено до 3-х разных типов виджетов.
            <br />
            Они отображаются рандомно.
          </span>
        }
      >
        <Button className="min-w-0 w-min min-h-0 h-min" variant="light" isIconOnly radius="full">
          <SvgIcon src={iconInfo} className="text-[#797979]" size={'20px'} />
        </Button>
      </Tooltip>
    )
  }

  const getProjectWidgets = () => {
    return (
      <div className="flex flex-col gap-[20px] pb-1">
        <div className="flex flex-row items-center gap-[10px]">
          {getWidgetTooltip()}
          <span className="text-xl font-display">Виджеты</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-5">
          {availableWidgets.map(availableWidget => {
            const existingWidget = widgets.find(w => w.type === availableWidget.type)
            const isCreated = !!existingWidget

            return (
              <WidgetCard
                key={availableWidget.type}
                title={availableWidget.title}
                subtitle={availableWidget.description}
                type={availableWidget.type}
                badge={availableWidget.badge as WidgetBadge}
                enabled={existingWidget?.enabled || false}
                isAvailable={availableWidget.isAvailable}
                isCreated={isCreated}
                widgetId={existingWidget?.id}
                paidUntil={existingWidget?.paidUntil}
                onToggle={
                  existingWidget
                    ? enabled => handleToggleWidget(existingWidget.id, enabled)
                    : undefined
                }
                onCreate={
                  !isCreated && availableWidget.isAvailable
                    ? () => handleCreateWidget(availableWidget.type, availableWidget.title)
                    : undefined
                }
                onEdit={existingWidget ? handleEditWidget : undefined}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Header />
      <DashboardLayout>
        <div className="flex flex-col gap-[15px] py-[5px]">
          {getBreadcrumbs()}
          <hr className="border-[#C0C0C0]" />
          <span className="text-xl font-display">{`Каталог проекта "${projectName}"`}</span>
          <hr className="border-[#C0C0C0]" />
          <div className="flex flex-col gap-[15px] h-full overflow-y-auto">
            {getProjectWidgets()}
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default ProjectWidgetsPage
