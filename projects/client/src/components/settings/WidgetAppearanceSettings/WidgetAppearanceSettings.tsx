import { useShallow } from 'zustand/react/shallow'

import WidgetBackgroundColor from './WidgetBackgroundColor'
import WidgetBorderRadius from './WidgetBorderRadius'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type {
  AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'
import { announcementWidgetDefaults } from '../../../layouts/Widgets/Announcement/defaults'
import CompanyLogo from './CompanyLogo'
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'

const WidgetAppearanceSettings = () => {
  const {
    companyLogoEnabled,
    companyLogoUrl,
    colorScheme,
    backgroundColor,
    borderRadius,
  } = useWidgetSettingsStore(
    useShallow(s => {
      // a crutch because the store just works this way apparently
      const settings = (s.settings?.widget as AnnouncementWidgetType).appearence
      return  {
        companyLogoEnabled: settings.companyLogoEnabled,
        companyLogoUrl: settings.companyLogoUrl,
        colorScheme: settings.colorScheme,
        backgroundColor: settings.backgroundColor,
        borderRadius: settings.borderRadius,
      }
    })
  )
  
  const setCompanyLogoEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementCompanyLogoEnabled
  )
  const setCompanyLogoUrl = useWidgetSettingsStore(
    s => s.setAnnouncementCompanyLogoUrl
  )

  const setWidgetColorScheme = useWidgetSettingsStore(
    s => s.setAnnouncementColorScheme
  )
  const setContentType = useWidgetSettingsStore(
    s => s.setAnnouncementContentType
  )
  const setWidgetBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementBackgroundColor
  )
  const setBorderRadius = useWidgetSettingsStore(
    s => s.setAnnouncementBorderRadius
  )
  const resetColors = useWidgetSettingsStore(
    s => s.resetAnnouncementColors
  )

  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    setWidgetColorScheme(colorScheme)

    if (colorScheme === 'custom') {
      setContentType('imageOnTop')
      return
    }

    resetColors()
  }
  
  return (
    <div className="w-full min-w-85.5 flex flex-col gap-2.5">
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606]">
        Оформление
      </h1>

      <CompanyLogo
        enabled={companyLogoEnabled}
        logoUrl={companyLogoUrl}
        onToggle={setCompanyLogoEnabled}
        onLogoUrlChange={setCompanyLogoUrl}
      />
      <WidgetBackgroundColor 
        colorScheme={colorScheme}
        backgroundColor={
          backgroundColor
          // defaults (by definition) are always initialized thus the need for !
          // to override the type
          || announcementWidgetDefaults.appearence.backgroundColor!
        }
        onBackgroundColorChange={setWidgetBackgroundColor}
        onColorSchemeChange={handleColorSchemeChange}
      />
      <WidgetBorderRadius
        widgetBorderRadius={borderRadius}
        onBorderRadiuschange={setBorderRadius}
      />
    </div>
  )
}

export default WidgetAppearanceSettings
