import { useState } from 'react'
import EditableList from '@/components/EditableList'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import FABSectorItem from './FABSectorItem'
import FABMenuButtonPicker from './FABMenuButtonPicker'
import { type FABMenuButtonDefinition } from './buttonLibrary'
import { DisableBranding } from '@/components'
import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  brandingEnabledChanged,
  sectorAdded,
  sectorDeleted,
  sectorsReordered,
  sectorUpdated,
  selectBrandingEnabled,
  selectSectorIds,
} from './FABMenuSlice'
import { createPlaceholderFABMenuSector } from './defaults'

const FABMenuField = () => {
  const [pendingSectorId, setPendingSectorId] = useState<string | null>(null)
  
  const brandingEnabled = useAppSelector(selectBrandingEnabled)
  
  const dispatch = useAppDispatch()

  const handleItemsReorder = (ids: string[]) => {
    dispatch(sectorsReordered(ids))
  }

  const handleAdd = () => {
    const placeholder = createPlaceholderFABMenuSector()
    dispatch(sectorAdded(placeholder))
    setPendingSectorId(placeholder.id)
  }

  const handleDelete = (id: string) => {
    dispatch(sectorDeleted(id))
  }

  const setBrandingEnabled = (enabled: boolean) => {
    dispatch(brandingEnabledChanged(enabled))
  }

  const handlePickerCancel = () => {
    if (pendingSectorId) {
      handleDelete(pendingSectorId)
    }
    setPendingSectorId(null)
  }

  const handlePresetSelect = (preset: FABMenuButtonDefinition) => {
    if (!pendingSectorId) {
      return
    }

    dispatch(sectorUpdated({
      id: pendingSectorId,
      icon: preset.icon,
      label: preset.label,
      payload: preset.payload,
      color: preset.color,
      description: preset.description
    }))
    setPendingSectorId(null)
  }

  const renderItem = (id: string) => (
    <FABSectorItem
      id={id}
      isPendingSelection={id === pendingSectorId}
    />
  )

  const renderBelow = (id: string) =>
    id === pendingSectorId && (
      <FABMenuButtonPicker
        onClose={handlePickerCancel}
        onSelect={handlePresetSelect}
      />
    )

  const listClassNames = {
    index: 'min-w-[40px]',
  }

  return (
    <div className='flex flex-col gap-2.5'>
      <BorderedContainer className='flex flex-col gap-2.5 min-w-74'>
        <div className='h-[37px] shrink-0 flex justify-between'>
          <span className='text-lg leading-5.25 font-medium'>
            Секторы
          </span>
          <span className='text-lg text-[#C0C0C0] leading-5.25'>
            Максимум 8
          </span>
        </div>

        <hr className='border-gray-200' />

        <EditableList
          showIndex={false}
          idsSelector={selectSectorIds}
          maxItems={8}
          onItemsReorder={handleItemsReorder}
          canReorder
          classNames={listClassNames}
          onAdd={handleAdd}
          onDelete={handleDelete}
          renderItem={renderItem}
          renderBelow={renderBelow}
          addButtonLabel='Добавить кнопку'
        />
        <span className='text-[#BABABA] text-[10px] leading-3'>
          *Компания Meta Platforms Inc., владеющая социальными сетями Facebook и Instagram, по
          решению суда от 21.03.2022 признана экстремистской организацией, ее деятельность на
          территории России запрещена.
        </span>
      </BorderedContainer>

      <DisableBranding
        enabled={brandingEnabled}
        onBrandingEnabledToggle={setBrandingEnabled}
      />
    </div>
  )
}

export default FABMenuField
