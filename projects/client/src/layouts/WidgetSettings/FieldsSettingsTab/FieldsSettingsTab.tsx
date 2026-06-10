import TemplateChooser from '@/components/TemplateChooser'
import TemplateSettings from './TemplateSettings/TemplateSettings'
import ImageUploader from '@/components/ImageUploader'
import FormSettings from './FormSettings/FormSettings'
import { AnimatePresence } from 'framer-motion'
import ContactsField from './ContactsField/ContactsField'
import AgreementPoliciesField from './AgreementPoliciesField/AgreementPoliciesField'
import AdsInfoField from './AdsInfoField/AdsInfoField'
import useWidgetSettingsStore, {
  useVisibleErrors,
  useWidgetStaticDefaults
} from '@/stores/widgetSettingsStore'
import { memo, useCallback } from 'react'
import { withDefaultsPath } from '@/stores/widgetSettings/utils'
import { useShallow } from 'zustand/react/shallow'
import { uploadImage } from '@/api/upload'
import { getWidgetDefinition, type WidgetSettingsSection } from '@/layouts/Widgets/registry'
import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
import MessagesSettings from './MessagesSettings/MessagesSettings'
import type { FieldsSettings as FieldsSettingsType, WidgetSettings } from '@/stores/widgetSettings/types'
import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
import SurfaceNotice from '@/layouts/WidgetSettings/Common/SurfaceNotice'
import DisableBranding from './DisableBranding/DisableBranding'
import WheelEventField from './WheelEventField/WheelEventField'
import { WidgetTypeEnum } from '@lemnity/api-sdk'

const templateOptions = [
  { key: 'template1', label: 'Новогодний' },
  { key: 'template2', label: 'Рождество' },
  { key: 'template3', label: '14 Февраля' },
  { key: 'template4', label: '23 Февраля' },
  { key: 'template5', label: '8 Марта' },
  { key: 'template6', label: 'Пасха' },
  { key: 'template7', label: '1 апреля' }
]

const FieldsSettingsTab = () => {
  const {
    widgetType,
    brandingEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      return {
        widgetType: s?.settings?.widgetType,
        brandingEnabled: (s.settings as WidgetSettings).display.brandingEnabled,
      }
    })
  )

  const { setBrandingEnabled } = useWidgetSettingsStore()
  const widgetDefinition = widgetType && getWidgetDefinition(widgetType)
  const isStandardSurface = widgetType ? usesStandardSurface(widgetType, 'fields') : true
  const {
    settings,
    setCompanyLogoEnabled,
    setCompanyLogoFile,
    setTemplateEnabled,
    setTemplateKey,
    setTemplateImageEnabled,
    setContentPosition,
    setColorScheme,
    setCustomColor,
  } = useFieldsSettings()
  const staticDefaults = useWidgetStaticDefaults()

  const showValidation = useWidgetSettingsStore(s => s.validationVisible)
  const logoErrors = useVisibleErrors(showValidation, 'fields.companyLogo')
  const templateErrors = useVisibleErrors(showValidation, 'fields.template')
  const companyLogo = settings?.companyLogo ?? {}
  const { enabled, fileName, url } = companyLogo

  const template = useWidgetSettingsStore(
    useShallow(s =>
      withDefaultsPath<FieldsSettingsType['template']>(
        s.settings?.fields,
        'template',
        staticDefaults?.fields?.template as FieldsSettingsType['template']
      )
    )
  )

  const handleFile = useCallback(
    (file: File | null) => {
      if (file) {
        uploadImage(file).then(({ url }: { url: string }) => {
          setCompanyLogoFile(file.name, url)
        })
      }
    },
    [setCompanyLogoFile]
  )

  const customSections: WidgetSettingsSection[] = widgetDefinition?.settings.sections ?? []
  const hasCustomSections = customSections.length > 0
  const CustomFieldsSurface = widgetDefinition?.settings.surfaces?.fields

  if (!isStandardSurface && CustomFieldsSurface) {
    return <CustomFieldsSurface />
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {isStandardSurface && (
          <>
            <TemplateChooser
              enabled={template?.enabled ?? true}
              onToggle={enabled => {
                setTemplateEnabled(enabled)
                if (!enabled) {
                  const d = staticDefaults?.fields?.template?.templateSettings ?? {
                    image: { enabled: false, fileName: '', url: '' },
                    imageMode: 'side',
                    contentPosition: 'left',
                    colorScheme: 'primary',
                    customColor: '#725DFF'
                  }
                  setTemplateImageEnabled(d.image.enabled ?? false)
                  setContentPosition(d.contentPosition)
                  setColorScheme(d.colorScheme)
                  if (d.colorScheme === 'custom' && d.customColor) setCustomColor(d.customColor)
                }
              }}
              options={templateOptions}
              selectedKey={template.key}
              onChange={key => setTemplateKey(key ?? '')}
              isInvalid={templateErrors.some(e => e.path.endsWith('key'))}
              errorMessage={templateErrors.find(e => e.path.endsWith('key'))?.message}
            />
            <ImageUploader
              checked={enabled ?? true}
              setChecked={setCompanyLogoEnabled}
              title="Логотип компании"
              recommendedResolution="100x50"
              fileSize="менее 2 Mb"
              formats={['png']}
              filename={fileName}
              url={url}
              onFileSelect={handleFile}
              isInvalid={
                logoErrors.some(e => e.path.endsWith('fileName')) ||
                logoErrors.some(e => e.path.endsWith('url'))
              }
              errorMessage={
                logoErrors.find(e => e.path.endsWith('fileName'))?.message ||
                logoErrors.find(e => e.path.endsWith('url'))?.message
              }
            />

            <AnimatePresence>
              {!(template?.enabled ?? true) ? <TemplateSettings /> : null}
            </AnimatePresence>
            <FormSettings />
          </>
        )}

        {customSections.map(section => (
          <section.Component key={section.id} />
        ))}

        {isStandardSurface && (
          <>
            <ContactsField />
            <AgreementPoliciesField />
            <AdsInfoField />
            <MessagesSettings />
            {widgetType === WidgetTypeEnum.WHEEL_OF_FORTUNE && <WheelEventField />}
            <DisableBranding
              enabled={brandingEnabled}
              onBrandingEnabledToggle={setBrandingEnabled}
            />
          </>
        )}

        {!isStandardSurface && !hasCustomSections ? <SurfaceNotice surface="fields" /> : null}
      </div>
    </>
  )
}

export default memo(FieldsSettingsTab)
