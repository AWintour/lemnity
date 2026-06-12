import { useShallow } from 'zustand/react/shallow'

import WidgetBackgroundColor from './WidgetBackgroundColor'
import WidgetBorderRadius from './WidgetBorderRadius'
import CompanyLogo from './CompanyLogo'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type {
  AnnouncementWidgetType,
  Content,
} from '@lemnity/widget-config/widgets/announcement'
import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'
import type {
  VideoWidgetType,
} from '@lemnity/widget-config/widgets/video-widget'
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'

type WidgetAppearenceSettingsProps = {
  defaults: AnnouncementWidgetType | EventTimertWidgetType | VideoWidgetType
  setCompanyLogoEnabled: (enabled: boolean) => void
  setCompanyLogoUrl: (url: string | undefined) => void
  setCompanyLogoSize?: (size: number) => void
  setWidgetColorScheme: (colorScheme: ColorScheme) => void
  setContentType?: (contentType: Content) => void
  setWidgetBackgroundColor: (color: string) => void
  setBorderRadius: (radius: number) => void
  resetColors: () => void
}

const WidgetAppearanceSettings = (props: WidgetAppearenceSettingsProps) => {
  const {
    companyLogoEnabled,
    companyLogoUrl,
    companyLogoSize,
    colorScheme,
    backgroundColor,
    borderRadius,
  } = useWidgetSettingsStore(
    useShallow(s => {
      // a crutch because the store just works this way apparently
      const settings =
        (s.settings?.widget as AnnouncementWidgetType | EventTimertWidgetType)
          .appearence
      const defaults = props.defaults.appearence

      return  {
        companyLogoEnabled: settings.companyLogoEnabled
          ?? defaults.companyLogoEnabled,
        companyLogoUrl: settings.companyLogoUrl
          ?? defaults.companyLogoUrl,
        companyLogoSize:
          (settings as { companyLogoSize?: number }).companyLogoSize
          ?? (defaults as { companyLogoSize?: number }).companyLogoSize,
        colorScheme: settings.colorScheme
          ?? defaults.colorScheme,
        backgroundColor:
          settings.backgroundColor && settings.backgroundColor.length > 0
            ? settings.backgroundColor
            : defaults.backgroundColor!,
        borderRadius: settings.borderRadius
          ?? defaults.borderRadius,
      }
    })
  )

  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    props.setWidgetColorScheme(colorScheme)

    if (colorScheme === 'custom') {
      props?.setContentType?.('imageOnTop')
      return
    }

    props.resetColors()
  }
  
  return (
    <div className="w-full min-w-85.5 flex flex-col gap-2.5">
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606]">
        Оформление
      </h1>

      <CompanyLogo
        enabled={companyLogoEnabled}
        logoUrl={companyLogoUrl}
        size={companyLogoSize}
        onToggle={props.setCompanyLogoEnabled}
        onLogoUrlChange={props.setCompanyLogoUrl}
        onSizeChange={props.setCompanyLogoSize}
      />
      <WidgetBackgroundColor 
        colorScheme={colorScheme}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={props.setWidgetBackgroundColor}
        onColorSchemeChange={handleColorSchemeChange}
      />
      <WidgetBorderRadius
        widgetBorderRadius={borderRadius}
        onBorderRadiuschange={props.setBorderRadius}
      />
    </div>
  )
}

export default WidgetAppearanceSettings
