import WidgetBackgroundColor from './WidgetBackgroundColor'
import WidgetBorderRadius from './WidgetBorderRadius'
import CompanyLogo from './CompanyLogo'

import type { Content } from '@lemnity/widget-config/widgets/announcement'
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'

type WidgetAppearenceSettingsProps = {
  companyLogoEnabled: boolean
  companyLogoUrl?: string
  colorScheme: ColorScheme
  backgroundColor: string
  borderRadius: number
  setCompanyLogoEnabled: (enabled: boolean) => void
  setCompanyLogoUrl: (url: string | undefined) => void
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
    colorScheme,
    backgroundColor,
    borderRadius,
  } = props

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
        onToggle={props.setCompanyLogoEnabled}
        onLogoUrlChange={props.setCompanyLogoUrl}
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
