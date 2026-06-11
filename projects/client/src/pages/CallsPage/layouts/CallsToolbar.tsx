import { Button } from '@heroui/button'
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown'
import { Select, SelectItem } from '@heroui/select'
import { Tooltip } from '@heroui/tooltip'
import iconChevronDown from '@/assets/icons/chevron-down.svg'
import iconDownload from '@/assets/icons/upload.svg'
import SvgIcon from '@/components/SvgIcon'
import type { PeriodKey, ProjectMenuItem } from '../calls.model'

type CallsToolbarProps = {
  selectedProjectLabel: string
  projectMenuItems: ProjectMenuItem[]
  disabledKeys: Set<string>
  onProjectChange: (projectId: string) => void
  periodKey: PeriodKey
  onPeriodChange: (key: PeriodKey) => void
  onDownload: () => void
  onOpenManagers: () => void
  canManageManagers: boolean
  periodOptions: Array<{ key: PeriodKey; label: string }>
}

const CallsToolbar = ({
  selectedProjectLabel,
  projectMenuItems,
  disabledKeys,
  onProjectChange,
  periodKey,
  onPeriodChange,
  onDownload,
  onOpenManagers,
  canManageManagers,
  periodOptions
}: CallsToolbarProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <h1 className="text-[20px] leading-6 font-medium text-black font-display">Ваши звонки</h1>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="h-10 rounded-lg border border-default-200 bg-white px-4 text-[13px] text-black gap-2 hover:bg-default-50"
                endContent={<img src={iconChevronDown} alt="" className="w-4 h-4 opacity-80" />}
              >
                {selectedProjectLabel}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Выбор проекта"
              items={projectMenuItems}
              disabledKeys={disabledKeys}
              onAction={key => {
                const id = String(key)
                if (id.startsWith('header:')) return
                onProjectChange(id)
              }}
              classNames={{ base: 'p-3 w-[320px]' }}
            >
              {item => (
                <DropdownItem
                  key={item.key}
                  textValue={item.label}
                  className={
                    item.type === 'header'
                      ? 'px-2 py-1 text-[14px] text-default-500 cursor-default data-[hover=true]:bg-transparent'
                      : 'rounded-lg px-3 py-3 data-[hover=true]:bg-default-100'
                  }
                >
                  <span
                    className={
                      item.type === 'header' ? 'text-[14px] text-default-500' : 'text-[16px] text-black'
                    }
                  >
                    {item.label}
                  </span>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Tooltip
            content="Выберите конкретный проект, чтобы управлять его менеджерами"
            isDisabled={canManageManagers}
            placement="bottom"
          >
            <span>
              <Button
                variant="bordered"
                isDisabled={!canManageManagers}
                onPress={onOpenManagers}
                className="h-10 rounded-lg border border-default-200 bg-white px-4 text-[13px] text-black hover:bg-default-50"
              >
                Менеджеры
              </Button>
            </span>
          </Tooltip>

          <Select
            aria-label="Период"
            selectedKeys={new Set([periodKey])}
            onSelectionChange={keys => {
              const first = Array.from(keys as Set<string>)[0] as PeriodKey | undefined
              if (!first) return
              onPeriodChange(first)
            }}
            className="sm:w-[220px]"
            classNames={{
              trigger: 'h-10 bg-white border border-default-200 rounded-lg hover:bg-default-50',
              value: 'text-[13px] text-black',
              selectorIcon: 'text-default-500'
            }}
          >
            {periodOptions.map(o => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>

          <Button
            className="h-10 rounded-lg bg-[#5B55FF] text-white px-4 text-[13px] hover:bg-[#514BFF]"
            startContent={<SvgIcon src={iconDownload} alt="" className="white" size={18} />}
            onPress={onDownload}
          >
            Скачать базу звонков
          </Button>
        </div>
      </div>

      <div className="h-px w-full bg-[#D6D6D6]" />
    </div>
  )
}

export default CallsToolbar
