import { useState } from 'react'
import { Button } from '@heroui/button'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown'
import CustomSwitch from '@/components/CustomSwitch'
import MetricCard from './MetricCard'
import SvgIcon from '@/components/SvgIcon'
import iconProjectEmblem from '@/assets/icons/project-emblem.svg'
import iconPencil from '@/assets/icons/pencil.svg'
import iconBin from '@/assets/icons/bin.svg'
import { useProjectsStore } from '@/stores/projectsStore'
import AddProjectModal from '@/layouts/AddProjectsBlock/AddProjectModal'
import Modal from '@/components/Modal/Modal'
import './ProjectRow.css'
import { useNavigate } from 'react-router-dom'
import { cn } from '@heroui/theme'

interface ProjectRowProps {
  id: string
  name: string
  enabled: boolean
  visitors: { value: number; desktop: number; mobile: number }
  impressions: { value: number; desktop: number; mobile: number }
  conversions: { value: number; desktop: number; mobile: number }
  activityPercent: number
}

const KebabIcon = () => (
  <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor" aria-hidden="true">
    <circle cx="2" cy="2" r="2" />
    <circle cx="2" cy="9" r="2" />
    <circle cx="2" cy="16" r="2" />
  </svg>
)

const ProjectRow = ({
  id,
  name,
  enabled,
  visitors,
  impressions,
  activityPercent
}: ProjectRowProps) => {
  const projects = useProjectsStore(s => s.projects)
  const toggleProjectEnabled = useProjectsStore(s => s.toggleProjectEnabled)
  const updateProject = useProjectsStore(s => s.updateProject)
  const deleteProject = useProjectsStore(s => s.deleteProject)
  const navigate = useNavigate()

  const project = projects.find(p => p.id === id)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSwitchChange = (value: boolean) => {
    if (project) toggleProjectEnabled(project.id, value)
  }

  const handleEditSubmit = async (newName: string, newUrl: string, newEnabled?: boolean) => {
    await updateProject(id, { title: newName, websiteUrl: newUrl, enabled: newEnabled })
    setIsEditOpen(false)
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await deleteProject(id)
      setIsConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      key={id}
      className={`rounded-lg bg-white shadow-sm border border-gray-200 p-4 ${!enabled ? 'parent' : ''}`}
    >
      <div className="grid grid-cols-12 items-center">
        <div className="col-span-4 flex items-center gap-4">
          <div className="flex self-start">
            <SvgIcon className="text-[#9747FF]" size={'36px'} src={iconProjectEmblem} />
          </div>
          <div className="flex flex-col">
            <div className="text-base font-semibold">{name}</div>
            <div className="text-xs text-gray-500">Виджеты / Геймификация</div>
            <div className="flex flex-row items-center justify-start gap-4 mt-2.5">
              <div className="relative z-10 child">
                <CustomSwitch
                  size="sm"
                  selectedColor="group-data-[selected=true]:!bg-[#5951E5]"
                  isSelected={enabled}
                  onValueChange={handleSwitchChange}
                />
              </div>
              <div className="w-px h-5 bg-gray-300" />
              <Dropdown>
                <DropdownTrigger>
                  <Button isDisabled={!enabled} size="sm" variant="flat">
                    Виджеты
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Действия с виджетами">
                  <DropdownItem
                    key="open"
                    onPress={() => {
                      navigate(`/projects/${id}/widgets`)
                    }}
                  >
                    Добавить виджет
                  </DropdownItem>
                  <DropdownItem
                    key="widgets"
                    onPress={() => {
                      navigate(`/projects/${id}/widgets`)
                    }}
                  >
                    Изменить виджет
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    onPress={() => {
                      alert('Код для вставки')
                    }}
                  >
                    Код для вставки
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    aria-label="Действия проекта"
                    className="min-w-8 w-8 h-8 text-gray-500"
                  >
                    <KebabIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Действия проекта">
                  <DropdownItem
                    key="edit"
                    startContent={<SvgIcon src={iconPencil} size="18px" className="opacity-70" />}
                    onPress={() => setIsEditOpen(true)}
                  >
                    Изменить проект
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<SvgIcon src={iconBin} size="18px" className="text-danger" />}
                    onPress={() => setIsConfirmOpen(true)}
                  >
                    Удалить проект
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className={cn('col-span-8 grid grid-cols-4', enabled && 'relative')}>
          {enabled && (
            <div className="w-full h-full bg-white/85 absolute z-20 flex flex-col items-center justify-center">
              <p className="text-3xl font-light">Скоро будет доступно!</p>
            </div>
          )}

          <MetricCard
            value={visitors.desktop + visitors.mobile}
            desktop={visitors.desktop}
            mobile={visitors.mobile}
          />
          <MetricCard
            value={impressions.desktop + impressions.mobile}
            desktop={impressions.desktop}
            mobile={impressions.mobile}
          />
          <MetricCard
            value={
              (Math.round((1000 * visitors.desktop) / impressions.desktop) / 10 +
                Math.round((1000 * visitors.mobile) / impressions.mobile) / 10) /
                2 || 0
            }
            desktop={Math.round((1000 * visitors.desktop) / impressions.desktop) / 10 || 0}
            mobile={Math.round((1000 * visitors.mobile) / impressions.mobile) / 10 || 0}
            isPercent={true}
          />
          <MetricCard
            value={activityPercent}
            pillColor="bg-green-100 text-green-700"
            isPercent={true}
          />
        </div>
      </div>

      <AddProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onAddProject={handleEditSubmit}
        mode="edit"
        initialName={project?.name ?? name}
        initialUrl={project?.websiteUrl ?? ''}
        initialEnabled={project?.enabled ?? enabled}
      />

      {isConfirmOpen && (
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => !deleting && setIsConfirmOpen(false)}
          role="alertdialog"
          closeOnBackdrop={!deleting}
          closeOnEsc={!deleting}
          containerClassName="w-full max-w-[440px]"
        >
          <div className="flex flex-col gap-4 p-6">
            <h3 className="font-roboto font-semibold text-2xl">Удалить проект?</h3>
            <p className="text-sm text-gray-600">
              Проект «{project?.name ?? name}» и все его виджеты будут удалены без возможности
              восстановления.
            </p>
            <div className="flex items-center justify-start gap-3">
              <Button
                variant="solid"
                onPress={handleDelete}
                isDisabled={deleting}
                className="px-6 bg-[#FFD4C4] text-[#FF001C]"
              >
                {deleting ? 'Удаление…' : 'Удалить'}
              </Button>
              <Button
                variant="light"
                onPress={() => setIsConfirmOpen(false)}
                isDisabled={deleting}
                className="px-6"
              >
                Отмена
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ProjectRow
