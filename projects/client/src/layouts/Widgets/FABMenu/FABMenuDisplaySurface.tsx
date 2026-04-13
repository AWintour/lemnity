import {
  ButtonPositionChooser,
  ButtonAppearenceSettings,
} from '@/components'

import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import {
  triggerTextChanged,
  triggerBackgroundColorChanged,
  triggerTextColorChanged,
  triggerIconChanged,
  triggerPositionChanged,
  selectTriggerText,
  selectTriggerTextColor,
  selectTriggerBackgroundColor,
  selectTriggerIcon,
  selectTriggerPosition,
  initialState,
} from './FABMenuSlice'

import type { FABMenuPosition } from '@lemnity/widget-config/widgets/fab-menu'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import { cn } from '@heroui/theme'

const ALLOWED_POSITIONS: FABMenuPosition[] = ['bottom-left', 'bottom-right']

const FABMenuDisplaySurface = () => {
  const triggerText =
    useAppSelector(selectTriggerText)
  const triggerTextColor =
    useAppSelector(selectTriggerTextColor)
      || initialState.triggerTextColor
  const triggerBackgroundColor =
    useAppSelector(selectTriggerBackgroundColor)
      || initialState.triggerBackgroundColor
  const triggerIcon =
    useAppSelector(selectTriggerIcon)
  const triggerPosition =
    useAppSelector(selectTriggerPosition)

  const dispatch = useAppDispatch()

  const setFABMenuTriggerText = (text: string) => {
    dispatch(triggerTextChanged(text))
  }
  const setFABMenuTriggerIcon = (icon: Icon) => {
    dispatch(triggerIconChanged(icon))
  }
  const setFABMenuTriggerTextColor = (color: string) => {
    dispatch(triggerTextColorChanged(color))
  }
  const setFABMenuTriggerBackgroundColor = (color: string) => {
    dispatch(triggerBackgroundColorChanged(color))
  }
  const setFABMenuTriggerPosition = (position: FABMenuPosition) => {
    dispatch(triggerPositionChanged(position))
  }

  return (
    <section
      className={cn(
        'flex flex-col gap-2.5 rounded-[14px] border border-[#E6E6E6] p-4.5',
        'bg-white min-w-74',
      )}
    >
      <div className='h-[37px]'>
        <h2 className='text-lg font-medium text-gray-900 leading-[21px]'>
          Форма
        </h2>
      </div>
      <h2 className='leading-[19px]'>
        Название кнопки
      </h2>
      <ButtonAppearenceSettings
        onTriggerTextChange={setFABMenuTriggerText}
        onTriggerIconChange={setFABMenuTriggerIcon}
        onFontColorChange={setFABMenuTriggerTextColor}
        onBackgroundColorChange={setFABMenuTriggerBackgroundColor}
        buttonText={triggerText}
        buttonTextColor={triggerTextColor}
        buttonBackgroundColor={triggerBackgroundColor}
        buttonIcon={triggerIcon}
      />
      <ButtonPositionChooser
        noBorder
        noPadding
        value={triggerPosition}
        options={ALLOWED_POSITIONS}
        onChange={setFABMenuTriggerPosition}
      />
    </section>
  )
}

export default FABMenuDisplaySurface
