import EditableList, { type EditableListItem } from '@/components/EditableList'
import { Checkbox } from '@heroui/checkbox'
import { useCallback, useState } from 'react'
import { Input, Textarea } from '@heroui/input'
import { Slider } from '@heroui/slider'
import SectorItem from '../SectorItem/SectorItem'
import type {
  SectorItem as SectorData,
  WheelOfFortuneWidgetSettings
} from '@stores/widgetSettings/types'
import { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
import { useWheelOfFortuneSettings } from '@/layouts/Widgets/WheelOfFortune/hooks'
import { isWheelLikeWidgetType } from '@/layouts/Widgets/constants'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { generateRandomHexColor } from '@/common/utils/generateRandomColor'
import OptionsChooser, { type OptionItem } from '@/components/OptionsChooser'
import ImageUploader from '@/components/ImageUploader'
import ColorAccessory from '@/components/ColorAccessory'
import CustomSwitch from '@/components/CustomSwitch'
import NumberField from '@/components/NumberField'
import IconPicker, { type IconName } from '@/components/IconPicker'
import * as Icons from '@/components/Icons'
import { ReelCard } from '@/layouts/Widgets/ConveyorOfLuck/ConveyorReel'
import { uploadImage } from '@/api/upload'

const coverOptions: OptionItem[] = [
  { key: 'background', label: 'С фоном' },
  { key: 'image', label: 'Картинка' }
]

const schemeOptions: OptionItem[] = [
  { key: 'primary', label: 'Основная' },
  { key: 'custom', label: 'Пользовательское' }
]

const alignOptions: OptionItem[] = [
  { key: 'top', label: 'Сверху' },
  { key: 'center', label: 'По центру' },
  { key: 'bottom', label: 'Снизу' }
]

const ConveyorSectorsField = () => {
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
  const [openedIndex, setOpenedIndex] = useState<number | null>(null)

  const handleUpdateSector = useCallback(
    (index: number, updates: Partial<SectorData>) => updateWheelSector(index, updates),
    [updateWheelSector]
  )

  if (!settings && !isWheelLikeWidgetType(defaults?.widget.type)) return null
  const fallbackSettings = defaults?.widget as WheelOfFortuneWidgetSettings
  const wheelSectors = (settings?.sectors ??
    fallbackSettings.sectors) as WheelOfFortuneWidgetSettings['sectors']

  const sectors: EditableListItem<SectorData>[] = (wheelSectors.items ?? []).map(
    (item: SectorData) => ({ ...item })
  )

  const handleAdd = () => {
    addWheelSector({
      id: Date.now().toString(),
      mode: 'text',
      text: '',
      icon: 'trophy',
      color: generateRandomHexColor(),
      isWin: false,
      textSize: 25,
      iconSize: 52,
      textColor: '#ffffff',
      coverType: 'background',
      colorScheme: 'primary'
    })
  }

  const settingsSector = (sector: EditableListItem<SectorData>, index: number) => {
    if (openedIndex !== index) return null
    const isCustom = (sector.colorScheme ?? 'primary') === 'custom'

    return (
      <div className="bg-[#EAEAEA] border border-[#E8E8E8] rounded-lg p-4 flex gap-4">
        {/* ЛЕВО — прокручиваемые поля */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
        <span className="text-sm text-gray-500">Настройки сектора</span>

        {/* Вид обложки */}
        <OptionsChooser
          title="Вид обложки"
          options={coverOptions}
          value={sector.coverType ?? 'background'}
          onChange={k => handleUpdateSector(index, { coverType: k as 'background' | 'image' })}
        />

        {sector.coverType === 'image' ? (
          <>
            {/* КАРТИНКА: загрузчик + выравнивание + цвет шрифта/размер текста */}
            <ImageUploader
              hideSwitch
              recommendedResolution="120x70"
              fileSize="менее 1 Мб"
              formats={['png']}
              formatsLabel="png без фона"
              filename={sector.image?.fileName}
              url={sector.image?.url}
              onFileSelect={file => {
                if (!file) return
                uploadImage(file).then(({ url }) =>
                  handleUpdateSector(index, {
                    image: { ...sector.image, enabled: true, fileName: file.name, url }
                  })
                )
              }}
            />
            <OptionsChooser
              title="Выравнивание"
              options={alignOptions}
              value={sector.imageAlign ?? 'center'}
              onChange={k =>
                handleUpdateSector(index, { imageAlign: k as 'top' | 'center' | 'bottom' })
              }
            />
            <div className="flex flex-col gap-2">
              <span className="text-black text-lg font-medium">Цветовая гамма</span>
              <div className="grid grid-cols-2 gap-2">
                <ColorAccessory
                  label="Цвет шрифта"
                  color={sector.systemTextColor ?? sector.textColor}
                  onChange={c => handleUpdateSector(index, { systemTextColor: c })}
                  classNames={{
                    label: 'w-full !h-12',
                    input: '!w-0',
                    swatch: '!w-5 !h-5 !min-w-5 mr-1'
                  }}
                />
                <div className="flex items-center justify-between gap-1 rounded-md border border-[#E4E4E7] bg-white pl-3 pr-1 h-12">
                  <span className="text-sm text-gray-700 whitespace-nowrap">Размер текста</span>
                  <div className="w-14 shrink-0">
                    <NumberField
                      noBorder
                      min={1}
                      max={99}
                      value={sector.textSize}
                      onChange={textSize => handleUpdateSector(index, { textSize })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* С ФОНОМ: выбор иконки из библиотеки + цвет иконки */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between gap-2 rounded-md border border-[#E4E4E7] bg-white pl-3 pr-2 h-12">
                <span className="text-sm text-gray-700">Выбор иконки</span>
                <IconPicker
                  initialIcon={
                    sector.icon &&
                    typeof (Icons as Record<string, unknown>)[sector.icon] === 'function'
                      ? (sector.icon as IconName)
                      : undefined
                  }
                  popoverPlacement="bottom-start"
                  triggerClassName="!border-0 !p-0 !h-auto !w-auto !min-w-0 !bg-transparent"
                  onIconChange={name => handleUpdateSector(index, { icon: name })}
                />
              </div>
              <ColorAccessory
                label="Цвет иконки"
                color={sector.iconColor ?? '#FFFFFF'}
                onChange={c => handleUpdateSector(index, { iconColor: c })}
                classNames={{
                  label: 'w-full !h-12',
                  input: '!w-0',
                  swatch: '!w-5 !h-5 !min-w-5 mr-1'
                }}
              />
            </div>

            {/* Цветовая гамма */}
            <OptionsChooser
              title="Цветовая гамма"
              options={schemeOptions}
              value={sector.colorScheme ?? 'primary'}
              onChange={k => handleUpdateSector(index, { colorScheme: k as 'primary' | 'custom' })}
            />
            {isCustom ? (
              <div className="grid grid-cols-3 gap-2">
                <ColorAccessory
                  label="Цвет фона"
                  color={sector.bgColor ?? sector.color}
                  onChange={c => handleUpdateSector(index, { bgColor: c })}
                  classNames={{
                    label: 'w-full !h-12',
                    input: '!w-0',
                    swatch: '!w-5 !h-5 !min-w-5 mr-1'
                  }}
                />
                <ColorAccessory
                  label="Цвет шрифта"
                  color={sector.systemTextColor ?? sector.textColor}
                  onChange={c => handleUpdateSector(index, { systemTextColor: c })}
                  classNames={{
                    label: 'w-full !h-12',
                    input: '!w-0',
                    swatch: '!w-5 !h-5 !min-w-5 mr-1'
                  }}
                />
                <div className="flex items-center justify-between gap-1 rounded-md border border-[#E4E4E7] bg-white pl-3 pr-1 h-12">
                  <span className="text-sm text-gray-700 whitespace-nowrap">Размер текста</span>
                  <div className="w-14 shrink-0">
                    <NumberField
                      noBorder
                      min={1}
                      max={99}
                      value={sector.textSize}
                      onChange={textSize => handleUpdateSector(index, { textSize })}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* Плашка — фоновая подложка под текстом карточки */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-medium text-black">Плашка</span>
          <CustomSwitch
            isSelected={sector.badgeEnabled ?? false}
            onValueChange={enabled => handleUpdateSector(index, { badgeEnabled: enabled })}
            selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
            size="sm"
          />
        </div>
        {sector.badgeEnabled ? (
          <div className="grid grid-cols-2 gap-2">
            <ColorAccessory
              label="Цвет плашки"
              color={sector.badgeColor ?? '#FFFFFF'}
              onChange={c => handleUpdateSector(index, { badgeColor: c })}
              classNames={{
                label: 'w-full !h-12',
                input: '!w-0',
                swatch: '!w-5 !h-5 !min-w-5 mr-1'
              }}
            />
            <ColorAccessory
              label="Цвет шрифта"
              color={sector.badgeTextColor ?? '#000000'}
              onChange={c => handleUpdateSector(index, { badgeTextColor: c })}
              classNames={{
                label: 'w-full !h-12',
                input: '!w-0',
                swatch: '!w-5 !h-5 !min-w-5 mr-1'
              }}
            />
          </div>
        ) : null}

        {/* Затемнение — градиент снизу карточки + ползунок высоты */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-medium text-black">Затемнение</span>
          <CustomSwitch
            isSelected={sector.darkenEnabled ?? false}
            onValueChange={enabled => handleUpdateSector(index, { darkenEnabled: enabled })}
            selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
            size="sm"
          />
        </div>
        {sector.darkenEnabled ? (
          <div className="rounded-md border border-[#E4E4E7] bg-white px-4 py-3">
            <Slider
              aria-label="Высота затемнения"
              size="sm"
              minValue={0}
              maxValue={100}
              step={1}
              value={sector.darkenHeight ?? 60}
              onChange={v =>
                handleUpdateSector(index, { darkenHeight: Array.isArray(v) ? v[0] : v })
              }
              classNames={{ track: 'bg-[#E4E4E7]', filler: 'bg-[#1A52DB]' }}
            />
          </div>
        ) : null}

        {/* Текст при выигрыше */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-medium text-black">Текст при выигрыше</span>
          <CustomSwitch
            isSelected={sector.winTextEnabled ?? false}
            onValueChange={enabled => handleUpdateSector(index, { winTextEnabled: enabled })}
            selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
            size="sm"
          />
        </div>
        <Textarea
          placeholder="Поздравляем! Вы выиграли, заберите Ваш приз! [ промокод ]"
          value={sector.winText ?? ''}
          onValueChange={val => handleUpdateSector(index, { winText: val })}
          minRows={2}
          classNames={{ inputWrapper: 'bg-white' }}
          variant="faded"
          radius="sm"
        />
        <Input
          variant="faded"
          classNames={{ input: 'placeholder:text-[#AAAAAA]', inputWrapper: 'bg-white' }}
          placeholder="Укажите промокод слота"
          radius="sm"
          size="lg"
          value={sector.promo ?? ''}
          onValueChange={val => handleUpdateSector(index, { promo: val })}
          description="Промо-код можно показывать после выпадения приза"
        />
        <Input
          variant="faded"
          classNames={{ input: 'placeholder:text-[#AAAAAA]', inputWrapper: 'bg-white' }}
          placeholder="Вероятность выпадения"
          radius="sm"
          size="lg"
          value={sector.chance != null ? String(sector.chance) : ''}
          endContent={<span className="text-sm text-gray-400 whitespace-nowrap">По умолчанию - 25%</span>}
          onValueChange={val => {
            const trimmed = val.trim()
            if (trimmed === '') {
              handleUpdateSector(index, { chance: undefined })
              return
            }
            const num = Number(trimmed)
            if (Number.isFinite(num) && num >= 0) {
              const currentItems = wheelSectors.items ?? []
              const sumOthers = currentItems.reduce(
                (sum, item, i) => (i === index ? sum : sum + (item.chance ?? 0)),
                0
              )
              handleUpdateSector(index, { chance: Math.max(0, Math.min(num, 100 - sumOthers)) })
            }
          }}
          description="Оставьте поле пустым во всех бонусах для равномерного выпадения. Процент считается по формуле сумма всех полей ÷ количество бонусов. Вероятность выпадения — 100%"
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

        {/* ПРАВО — карточка-превью сектора: sticky, остаётся на месте при прокрутке (на лету) */}
        <div className="shrink-0 hidden sm:block self-stretch">
          <div className="sticky top-4">
            <ReelCard item={sector as SectorData} width={260} height={260} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200">
        <span className="text-black font-semibold pb-2">Сектора</span>
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
              hideIcon
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
            if (openedIndex !== null && index <= openedIndex) setOpenedIndex(null)
          }}
          addButtonLabel="Добавить сектор"
        />
      </div>
    </div>
  )
}

export default ConveyorSectorsField
