import EditableList, { type EditableListItem } from '@/components/EditableList'
import { Checkbox } from '@heroui/checkbox'
import { useCallback, useState } from 'react'
import { Input } from '@heroui/input'
import SectorItem from '../SectorItem/SectorItem'
import type {
  SectorItem as SectorData,
  WheelOfFortuneWidgetSettings
} from '@stores/widgetSettings/types'
import { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
import { useWheelOfFortuneSettings } from '@/layouts/Widgets/WheelOfFortune/hooks'
import { isWheelLikeWidgetType } from '@/layouts/Widgets/constants'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import NumberField from '@/components/NumberField'
import ColorAccessory from '@/components/ColorAccessory'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import { generateRandomHexColor } from '@/common/utils/generateRandomColor'

const WheelSectorsField = () => {
  const {
    settings,
    setWheelRandomize,
    setWheelSectors,
    updateWheelSector,
    addWheelSector,
    deleteWheelSector
  } = useWheelOfFortuneSettings()
  const defaults = useWidgetStaticDefaults()

  const showValidation = useWidgetSettingsStore(s => s.validationVisible)
  const getErrors = useWidgetSettingsStore(s => s.getErrors)
  // UI state only - не сохраняется в конфигурации
  const [openedIndex, setOpenedIndex] = useState<number | null>(null)

  const handleUpdateSector = useCallback(
    (index: number, updates: Partial<SectorData>) => {
      updateWheelSector(index, updates)
    },
    [updateWheelSector]
  )

  if (!settings && !isWheelLikeWidgetType(defaults?.widget.type)) return null
  const fallbackSettings = defaults?.widget as WheelOfFortuneWidgetSettings
  const fallbackSectors: WheelOfFortuneWidgetSettings['sectors'] = fallbackSettings.sectors
  const wheelSectors = (settings?.sectors ??
    fallbackSectors) as WheelOfFortuneWidgetSettings['sectors']

  const sectors: EditableListItem<SectorData>[] = (wheelSectors.items ?? []).map(
    (item: SectorData) => ({
      id: item.id,
      mode: item.mode,
      text: item.text,
      icon: item.icon,
      color: item.color,
      promo: item.promo,
      chance: item.chance,
      isWin: item.isWin,
      textSize: item.textSize,
      iconSize: item.iconSize,
      textColor: item.textColor
    })
  )

  const handleAdd = () => {
    const newSector: SectorData = {
      id: Date.now().toString(),
      mode: 'text',
      text: '',
      icon: 'trophy',
      color: generateRandomHexColor(),
      isWin: false,
      textSize: 16,
      iconSize: 16,
      textColor: '#ffffff'
    }
    addWheelSector(newSector)
  }

  const getRandomOrderCheckbox = () => {
    return (
      <Checkbox
        isSelected={wheelSectors.randomize ?? false}
        onValueChange={setWheelRandomize}
        classNames={{
          wrapper:
            'before:border-[#373737] rounded-[4px] before:rounded-[4px] after:rounded-[4px] after:bg-[#373737]',
          base: 'max-w-full',
          label: 'text-gray-700 text-base'
        }}
      >
        В случайном порядке
      </Checkbox>
    )
  }

  const settingsSector = (sector: EditableListItem<SectorData>, index: number) => {
    return openedIndex === index ? (
      <div className="bg-[#EAEAEA] border border-[#E8E8E8] rounded-lg p-4 flex flex-col gap-3">
        <span className="text-sm">Настройки сектора</span>
        <BorderedContainer className="grid grid-cols-4 gap-2 !p-1 !px-1.5 !border-gray-400">
          <div className="flex flex-col gap-1">
            <span className="text-sm">Размер текста</span>
            <NumberField
              disabled={sector.mode !== 'text'}
              max={99}
              min={1}
              noBorder
              value={sector.textSize}
              onChange={textSize => handleUpdateSector(index, { textSize })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm">Размер иконки</span>
            <NumberField
              disabled={sector.mode !== 'icon'}
              max={99}
              min={1}
              noBorder
              value={sector.iconSize}
              onChange={iconSize => handleUpdateSector(index, { iconSize })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm">Цвет текста / иконки</span>
            <Input
              variant="faded"
              classNames={{
                input: 'placeholder:text-[#ffffff]',
                inputWrapper: 'bg-white !p-0'
              }}
              radius="sm"
              value={sector.textColor}
              onValueChange={textColor => handleUpdateSector(index, { textColor })}
              startContent={
                <ColorAccessory
                  classNames={{ label: 'h-full px-0 border-none' }}
                  color={sector.textColor}
                  onChange={textColor => handleUpdateSector(index, { textColor })}
                />
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm">Цвет сектора</span>
            <Input
              variant="faded"
              classNames={{
                input: 'placeholder:text-[#AAAAAA]',
                inputWrapper: 'bg-white !p-0'
              }}
              // placeholder="Выберите цвет"
              radius="sm"
              value={sector.color}
              onValueChange={color => handleUpdateSector(index, { color })}
              startContent={
                <ColorAccessory
                  classNames={{ label: 'h-full px-0 border-none' }}
                  color={sector.color}
                  onChange={color => handleUpdateSector(index, { color })}
                />
              }
            />
          </div>
        </BorderedContainer>
        <span className="text-md">Настройки слота</span>
        <Input
          variant="faded"
          classNames={{
            input: 'placeholder:text-[#AAAAAA]',
            inputWrapper: 'bg-white'
          }}
          placeholder="Укажите промокод слота"
          radius="sm"
          size="lg"
          value={sector.promo ?? ''}
          onValueChange={val => handleUpdateSector(index, { promo: val })}
          description="Промокод можно показывать после выпадения приза"
        />
        <Input
          variant="faded"
          classNames={{
            input: 'placeholder:text-[#AAAAAA]',
            inputWrapper: 'bg-white'
          }}
          placeholder="Вероятность выпадения"
          radius="sm"
          size="lg"
          value={sector.chance != null ? String(sector.chance) : ''}
          onValueChange={val => {
            const trimmed = val.trim()
            if (trimmed === '') {
              handleUpdateSector(index, { chance: undefined })
              return
            }
            const num = Number(trimmed)
            if (Number.isFinite(num) && num >= 0) {
              const currentItems = wheelSectors.items ?? []
              const sumOthers = currentItems.reduce((sum, item, i) => {
                if (i === index) return sum
                return sum + (item.chance ?? 0)
              }, 0)
              const next = Math.max(0, Math.min(num, 100 - sumOthers))
              handleUpdateSector(index, { chance: next })
            }
          }}
          description="Оставьте поле пустым во всех бонусах для равномерного выпадения. Процент считается по формуле сумма всех полей ÷ количество бонусов. Посмотреть процент можно выше. Вероятность выпадения — 100%"
        />
        <Checkbox
          isSelected={sector.isWin ?? false}
          onValueChange={checked => handleUpdateSector(index, { isWin: checked })}
          classNames={{
            wrapper:
              'before:border-[#373737] rounded-[4px] before:rounded-[4px] after:rounded-[4px] after:bg-[#373737]',
            base: 'max-w-full',
            label: 'text-gray-500 text-sm'
          }}
        >
          Это выигрыш
        </Checkbox>
      </div>
    ) : null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200">
        <span className="text-black font-semibold pb-2">Сектора</span>
        {getRandomOrderCheckbox()}
        <EditableList
          items={sectors}
          onItemsChange={items => setWheelSectors(items as SectorData[])}
          minItems={4}
          maxItems={8}
          classNames={{
            index:
              'flex items-center justify-center min-w-[40px] rounded-md border h-full border-[#E8E8E8]',
            delete:
              'flex items-center justify-center min-w-[40px] rounded-md border h-full border-[#E8E8E8]'
          }}
          renderItem={(sector, index) => (
            <SectorItem
              key={sector.id}
              sector={sector}
              onModeChange={mode => handleUpdateSector(index, { mode })}
              onTextChange={text => handleUpdateSector(index, { text })}
              onIconChange={icon => handleUpdateSector(index, { icon })}
              onSettings={() => setOpenedIndex(prev => (prev === index ? null : index))}
              validationMessage={
                showValidation
                  ? getErrors(`widget.sectors.items.${index}`).find(err =>
                      err.path.endsWith('text')
                    )?.message
                  : undefined
              }
              showValidation={showValidation}
            />
          )}
          renderBelow={settingsSector}
          onAdd={handleAdd}
          onDelete={(item: EditableListItem<SectorData>, index: number) => {
            deleteWheelSector(item.id)
            if (openedIndex !== null && index <= openedIndex) {
              setOpenedIndex(null)
            }
          }}
          addButtonLabel="Добавить сектор"
        />
      </div>
    </div>
  )
}

export default WheelSectorsField
