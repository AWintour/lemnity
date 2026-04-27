import {
  CompanyLogo,
  ContentPlacement,
  ContentSettings,
  WidgetBackgroundColor,
  WidgetBorderRadius,
} from "@/components/settings"
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'
import type {
  ContentAlignment,
  Content,
  ContentPlacement as Placement,
} from '@lemnity/widget-config/widgets/action-timer'
import type {
  ContentSettingsProps,
} from '@/components/settings/WidgetAppearanceSettings/ContentSettings'

type WidgetAppearenceSettingsProps = {
  companyLogoEnabled: boolean
  companyLogoUrl?: string
  colorScheme: ColorScheme
  backgroundColor: string
  borderRadius: number
  contentAlignment: ContentAlignment
  contentType: Content
  contentUrl: string | undefined
  contentPlacement: Placement
  onCompanyLogoUrlChange:
    (value: string | undefined) => void
  onCompanyLogoToggle:
    (value: boolean) => void
  onColorSchemeChange:
    (value: ColorScheme) => void
  onBackgroundColorChange:
    (value: string) => void
  onBorderRadiusChange:
    (value: number) => void
  onContentAlignmentChange:
    (value: ContentAlignment) => void
  onContentUrlChange:
    (value: string | undefined) => void
  onContentTypeChange:
    (value: Content) => void
  onContentPlacementChange:
    (value: string) => void
}

const WidgetAppearenceSettings = (props: WidgetAppearenceSettingsProps) => {
  const {
    companyLogoEnabled,
    companyLogoUrl,
    colorScheme,
    backgroundColor,
    borderRadius,
    contentAlignment,
    contentType,
    contentUrl,
    contentPlacement,
    onCompanyLogoToggle,
    onCompanyLogoUrlChange,
    onColorSchemeChange,
    onBackgroundColorChange,
    onBorderRadiusChange,
    onContentAlignmentChange,
    onContentUrlChange,
    onContentTypeChange,
    onContentPlacementChange,
  } = props

  const contentSettings: ContentSettingsProps<ContentAlignment, Content> = {
    format: 'actionTimer',
    contentAlignment: contentAlignment,
    contentType: contentType,
    contentUrl: contentUrl,
    onContentUrlChange: onContentUrlChange,
    onContentAlignmentChange: onContentAlignmentChange,
    onContentTypeChange: onContentTypeChange,
  }

  return (
    <>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Оформление
      </h1>
      
      <CompanyLogo
        enabled={companyLogoEnabled}
        logoUrl={companyLogoUrl}
        onToggle={onCompanyLogoToggle}
        onLogoUrlChange={onCompanyLogoUrlChange}
      />
      <WidgetBackgroundColor
        colorScheme={colorScheme}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={onBackgroundColorChange}
        onColorSchemeChange={onColorSchemeChange}
      />
      <ContentSettings {...contentSettings} />
      <ContentPlacement
        placement={contentPlacement}
        onPlacementChange={onContentPlacementChange}
      />
      <WidgetBorderRadius
        widgetBorderRadius={borderRadius}
        onBorderRadiusChange={onBorderRadiusChange}
      />
    </>
  )
}

export default WidgetAppearenceSettings
