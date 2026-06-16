import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import Header from '@/layouts/Header/Header'
import { useProjectsStore } from '@/stores/projectsStore'
import { Breadcrumbs, BreadcrumbItem } from '@heroui/breadcrumbs'
import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tooltip } from '@heroui/tooltip'
import { Button } from '@heroui/button'
import SvgIcon from '@/components/SvgIcon'
import iconInfo from '@/assets/icons/info.svg'
import WidgetCard from '@/layouts/WidgetCard/WidgetCard'
import type { WidgetBadge } from '@/layouts/WidgetCard/WidgetCard'
import { AVAILABLE_WIDGETS } from '@/layouts/Widgets/constants'
import WidgetCategoryFilter, {
  type WidgetCategoryFilterValue
} from '@/layouts/WidgetCard/WidgetCategoryFilter'
import { WidgetTypeEnum, UserRoleEnum, type CreateWidgetDtoTypeEnum } from '@lemnity/api-sdk'
import useUserStore from '@/stores/userStore'
import { buildProjectEmbedSnippet } from '@/config/embed'
import EmbedSnippetBox from '@/layouts/WidgetSettings/IntegrationTab/EmbedSnippetBox'
import Modal from '@/components/Modal/Modal'

// Виджеты, доступные пока только администратору (тестовый период).
// После проверки — убрать из набора, чтобы открыть всем.
// «Обратный звонок» (CALLBACK) пока в тесте — только админ; «Видео виджет» открыт всем.
const ADMIN_ONLY_WIDGETS: ReadonlySet<string> = new Set([
  WidgetTypeEnum.CALLBACK,
  // «Чат» — открыт всем пользователям в каталоге (тарифный гейт работает внутри редактора).
])

// Allowlist админов по email (на время теста; синхронно с сервером).
const ADMIN_EMAILS: string[] = (
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
    ?? 'simakov@lemnity.ru,lemnitycom@gmail.com'
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
  // Общий проектный скрипт: один тег подтягивает все включённые виджеты проекта (до 3).
  const projectSnippet = useMemo(
    () => (projectId ? buildProjectEmbedSnippet(projectId) : ''),
    [projectId]
  )
  const [isEmbedOpen, setIsEmbedOpen] = useState(false)

  const user = useUserStore(s => s.user)
  const isAdmin =
    user?.role === UserRoleEnum.ADMIN ||
    (!!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))
  // Скрываем admin-only виджеты (напр. «Видео виджет») для обычных пользователей.
  // Порядок каталога: «Новинка» → обычные доступные → «Скоро» (недоступные).
  const availableWidgets = useMemo(() => {
    const rank = (w: (typeof AVAILABLE_WIDGETS)[number]): number => {
      if (w.badge === 'new') return 0
      if (w.badge === 'soon' || !w.isAvailable) return 2
      return 1
    }
    return AVAILABLE_WIDGETS.filter(w => isAdmin || !ADMIN_ONLY_WIDGETS.has(w.type)).sort(
      (a, b) => rank(a) - rank(b)
    )
  }, [isAdmin])

  // Фильтр каталога по направлениям (Все / Лиды / Вовлечение / Вознаграждение).
  const [category, setCategory] = useState<WidgetCategoryFilterValue>('all')

  const categoryCounts = useMemo(() => {
    const counts: Record<WidgetCategoryFilterValue, number> = {
      all: availableWidgets.length,
      leads: 0,
      engage: 0,
      reward: 0
    }
    for (const w of availableWidgets) {
      for (const c of w.categories) counts[c] += 1
    }
    return counts
  }, [availableWidgets])

  const visibleWidgets = useMemo(
    () =>
      category === 'all'
        ? availableWidgets
        : availableWidgets.filter(w => w.categories.includes(category)),
    [availableWidgets, category]
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
        <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-row items-center gap-[10px]">
            {getWidgetTooltip()}
            <span className="text-xl font-display">Виджеты</span>
          </div>
          <WidgetCategoryFilter
            value={category}
            counts={categoryCounts}
            onChange={setCategory}
          />
        </div>
        {visibleWidgets.length === 0 ? (
          <div className="text-[#707070] text-sm py-10 text-center">
            В этом направлении пока нет виджетов
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-5">
            {visibleWidgets.map(availableWidget => {
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
        )}
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
            <hr className="border-[#C0C0C0]" />
            <div className="flex flex-col gap-[10px] pb-1">
              <span className="text-xl font-display">Код для вставки</span>
              <Button onPress={() => setIsEmbedOpen(true)} className="w-fit px-6">
                Показать код для вставки
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
      {isEmbedOpen && (
        <Modal
          isOpen={isEmbedOpen}
          onClose={() => setIsEmbedOpen(false)}
          containerClassName="w-full max-w-[600px]"
        >
          <div className="flex flex-col gap-4 p-6">
            <h3 className="font-display font-semibold text-2xl">Код для вставки</h3>
            <EmbedSnippetBox
              snippet={projectSnippet}
              title="Один скрипт для всего проекта"
              emptyText="Код станет доступен после загрузки проекта."
              helpText={
                <>
                  Добавьте код на все страницы (внутри &lt;head&gt; или перед &lt;/body&gt;).
                  <br />
                  Один тег подтянет все включённые виджеты проекта (до 3). Включайте и
                  выключайте виджеты в каталоге — они подтягиваются автоматически.
                </>
              }
            />
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ProjectWidgetsPage
