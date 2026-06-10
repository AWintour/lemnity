import { Select, SelectItem } from '@heroui/select'
import CustomSwitch from './CustomSwitch'

type TemplateOption = {
  key: string
  label: string
}

type TemplateChooserProps = {
  title?: string
  enabled: boolean
  onToggle: (next: boolean) => void
  options: TemplateOption[]
  selectedKey?: string
  onChange: (key: string | null) => void
  isInvalid?: boolean
  errorMessage?: string
}

const TemplateChooser = ({
  title = 'Шаблон',
  enabled,
  onToggle,
  options,
  selectedKey,
  onChange,
  isInvalid,
  errorMessage
}: TemplateChooserProps) => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border border-gray-200">
      <div className="flex flex-row items-center gap-2">
        <span className="text-black text-lg font-Rubik font-semibold">{title}</span>
        <CustomSwitch
          isSelected={enabled}
          onValueChange={onToggle}
          selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
          className="ml-auto"
          size="sm"
        />
      </div>
      <Select
        isDisabled={!enabled}
        aria-label="template-select"
        selectedKeys={selectedKey ? new Set([selectedKey]) : new Set<string>()}
        onSelectionChange={keys => {
          const first = Array.from(keys as Set<string>)[0] ?? null
          onChange(first)
        }}
        classNames={{
          trigger: 'h-14 bg-[#F4F4F5] hover:bg-[#E4E4E7] border-2 border-[#E4E4E7] rounded-md',
          value: 'text-gray-700',
          selectorIcon: 'text-gray-500'
        }}
        items={options}
      >
        {item => <SelectItem key={item.key}>{item.label}</SelectItem>}
      </Select>
      {enabled && isInvalid && <span className="text-sm text-red-500">{errorMessage}</span>}
    </div>
  )
}

export default TemplateChooser
