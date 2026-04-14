// import { useCallback } from 'react'
// import ImageUploader from '@/components/ImageUploader'
// import { useActionTimerSettings } from '@/layouts/Widgets/CountDown/hooks'
// import { uploadImage } from '@/api/upload'
// import { buildActionTimerWidgetSettings } from '@/layouts/Widgets/CountDown/defaults'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import OptionsChooser, { type OptionItem } from '@/components/OptionsChooser'
// import type { ActionTimerImagePosition, TemplateImageMode } from '@/stores/widgetSettings/types'
// import useWidgetSettingsStore, {
//   useVisibleErrors,
//   useWidgetStaticDefaults
// } from '@/stores/widgetSettingsStore'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'

// const imagePositionOptions: OptionItem[] = [
//   { key: 'left', label: 'С левой стороны' },
//   { key: 'center', label: 'По центру' },
//   { key: 'right', label: 'С правой стороны' }
// ]

// const imageModeOptions: OptionItem[] = [
//   { key: 'side', label: 'Картинка с боку' },
//   { key: 'background', label: 'Фон всего окна' }
// ]

// const ActionTimerSettings = () => {
//   const { setTemplateImageMode } = useFieldsSettings()
//   const { settings, setActionTimerImage, setImagePosition } = useActionTimerSettings()
//   const countdownDefaults = buildActionTimerWidgetSettings().countdown
//   const countdownSettings = settings?.countdown ?? countdownDefaults

//   const { imageUrl } = countdownSettings
//   const staticDefaults = useWidgetStaticDefaults()
//   const defaultTemplateSettings = staticDefaults?.fields?.template?.templateSettings ?? {
//     image: { enabled: false, fileName: '', url: '' },
//     imageMode: 'side',
//     windowFormat: 'sidePanel',
//     contentPosition: 'left',
//     colorScheme: 'primary',
//     customColor: '#FFFFFF'
//   }
//   const settingsNew = useWidgetSettingsStore(s =>
//     withDefaultsPath(s.settings?.fields, 'template.templateSettings', defaultTemplateSettings)
//   )
//   const showValidation = useWidgetSettingsStore(s => s.validationVisible)
//   const imageErrors = useVisibleErrors(showValidation, 'widget.countdown.imageUrl')
//   const imageUrlError = imageErrors.find(e => e.path.endsWith('imageUrl'))

//   const handleImageUpload = useCallback(
//     (file: File | null) => {
//       if (file) {
//         uploadImage(file).then(({ url }: { url: string }) => {
//           setActionTimerImage(url)
//         })
//       } else {
//         setActionTimerImage(undefined)
//       }
//     },
//     [setActionTimerImage]
//   )

//   return (
//     <BorderedContainer className="flex flex-col gap-3">
//       <OptionsChooser
//         noBorder
//         noPadding
//         title="Изображение"
//         options={imageModeOptions}
//         value={settingsNew?.imageMode}
//         onChange={k => {
//           setTemplateImageMode(k as TemplateImageMode)
//         }}
//       />
//       <ImageUploader
//         classNames={{ container: 'w-full' }}
//         hideSwitch
//         noBorder
//         noPadding
//         recommendedResolution="600x600"
//         fileSize="До 25 Mb"
//         formats={['png', 'jpeg', 'jpg', 'webp']}
//         url={imageUrl}
//         onFileSelect={handleImageUpload}
//         isInvalid={!!imageUrlError}
//         errorMessage={imageUrlError?.message}
//       />
//       {settingsNew?.imageMode == 'side' ? (
//         <OptionsChooser
//           title="Выравнивание"
//           options={imagePositionOptions}
//           value={settings?.countdown?.imagePosition ?? 'center'}
//           onChange={v => setImagePosition(v as ActionTimerImagePosition)}
//         />
//       ) : null}
//     </BorderedContainer>
//   )
// }

// export default ActionTimerSettings
