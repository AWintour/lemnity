import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
import { useShallow } from 'zustand/react/shallow'
import * as Icons from '@/components/Icons'
import type { IconName } from '@/components/IconPicker'

type LauncherButtonProps = {
  // Клик по лаунчеру открывает виджет (окно).
  onOpen?: () => void
}

// Чистый лаунчер (без подписи): «Кнопка» (текст + цвета из «Отображение») либо «Изображение»
// (загруженная иконка/плейсхолдер). Переиспользуется в панели Предпросмотра и в оверлее «Просмотр».
export const LauncherButton = ({ onOpen }: LauncherButtonProps) => {
  const staticDefaults = useWidgetStaticDefaults()
  const icon = useWidgetSettingsStore(useShallow(s => s.settings?.display?.icon))
  const type = icon?.type ?? staticDefaults?.display?.icon?.type ?? 'button'
  const button = icon?.button ??
    staticDefaults?.display?.icon?.button ?? {
      text: '',
      buttonColor: '#5951E5',
      textColor: '#FFFFFF'
    }
  const imageUrl = icon?.image?.url
  const ButtonIcon =
    button.icon && button.icon in Icons ? Icons[button.icon as IconName] : null

  if (type === 'image') {
    return imageUrl ? (
      <img
        src={imageUrl}
        alt="Иконка виджета"
        onClick={onOpen}
        className="w-[72px] h-[72px] rounded-full object-cover shadow-md cursor-pointer"
      />
    ) : (
      <div
        onClick={onOpen}
        className="w-[72px] h-[72px] rounded-full bg-[#EDEDED] flex items-center justify-center text-[#B5B5B5] text-xs cursor-pointer"
      >
        иконка
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ backgroundColor: button.buttonColor, color: button.textColor }}
      className="self-start inline-flex items-center gap-2 rounded-full px-6 h-12 text-[16px] font-medium shadow-md transition-transform hover:scale-[1.02]"
    >
      {ButtonIcon ? (
        <span className="w-5 h-5 inline-flex items-center justify-center">
          <ButtonIcon />
        </span>
      ) : null}
      {button.text?.trim() || 'Открыть'}
    </button>
  )
}

// Блок «Кнопка открытия окна» в панели Предпросмотра: подпись + лаунчер в реальном размере.
const WidgetLauncherPreview = ({ onOpen }: LauncherButtonProps) => (
  <div className="flex flex-col">
    <p className="font-rubik text-[25px] py-[15px]">Кнопка открытия окна</p>
    <LauncherButton onOpen={onOpen} />
  </div>
)

export default WidgetLauncherPreview
