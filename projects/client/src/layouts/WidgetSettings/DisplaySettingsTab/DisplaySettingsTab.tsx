// import OptionsChooser, { type OptionItem } from '@/components/OptionsChooser'
// import ImageUploader from '@/components/ImageUploader'
// import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
// import ButtonSettingsField from './ButtonSettingsField/ButtonSettingsField'
// import ButtonPositionChooser from './ButtonPositionChooser/ButtonPositionChooser'
// import TimerSettingsField from './TimerSettingsField/TimerSettingsField'
// import { AnimatePresence } from 'framer-motion'
// import type { StartShowing, IconType, HideIcon } from '@/stores/widgetSettingsStore'
// import { memo, useCallback, useMemo } from 'react'
// import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
// import SurfaceNotice from '@/layouts/WidgetSettings/Common/SurfaceNotice'
// import { getWidgetDefinition } from '@/layouts/Widgets/registry'
// import { uploadImage } from '@/api/upload'

// const startShowingOptions: OptionItem[] = [
//   {
//     key: 'onClick',
//     label: 'При нажатии на кнопку',
//     disabled: true
//   },
//   {
//     key: 'timer',
//     label: 'Автоматически',
//     tip: 'Запуск происходит спустя заданное время',
//     disabled: true
//   }
// ]

// const iconHideOptions: OptionItem[] = [
//   { key: 'always', label: 'Всегда' },
//   { key: 'afterFormSending', label: 'После отправки формы' }
// ]

// const StartShowingControl = memo(() => {
//   const setStartShowing = useWidgetSettingsStore(s => s.setStartShowing)
//   const staticDefaults = useWidgetStaticDefaults()
//   const startShowing = useWidgetSettingsStore(
//     s => s.settings?.display?.startShowing ?? staticDefaults?.display?.startShowing ?? 'onClick'
//   )

//   const handleChange = useCallback(
//     (v: string) => setStartShowing(v as StartShowing),
//     [setStartShowing]
//   )
//   return (
//     <OptionsChooser
//       title="Выберите условие начала показа"
//       options={startShowingOptions}
//       value={startShowing}
//       onChange={handleChange}
//     />
//   )
// })

// const TimerSettingsConditional = memo(() => {
//   const staticDefaults = useWidgetStaticDefaults()
//   const startShowing = useWidgetSettingsStore(
//     s => s.settings?.display?.startShowing ?? staticDefaults?.display?.startShowing ?? 'onClick'
//   )
//   return (
//     <AnimatePresence>{startShowing === 'timer' ? <TimerSettingsField /> : null}</AnimatePresence>
//   )
// })

// const IconTypeControl = memo(() => {
//   const setIconType = useWidgetSettingsStore(s => s.setIconType)
//   const setIconImage = useWidgetSettingsStore(s => s.setIconImage)
//   const staticDefaults = useWidgetStaticDefaults()
//   const iconType = useWidgetSettingsStore(
//     s => s.settings?.display?.icon?.type ?? staticDefaults?.display?.icon?.type ?? 'image'
//   )
//   const handleChange = useCallback((v: string) => setIconType(v as IconType), [setIconType])
//   const handleFile = useCallback(
//     (file: File | null) => {
//       if (!file) {
//         setIconImage(null)
//         return
//       }

//       uploadImage(file)
//         .then(({ url }) => setIconImage({ fileName: file.name, url }))
//         .catch(err => {
//           console.error('Icon upload failed', err)
//           setIconImage(null)
//           alert('Не удалось загрузить изображение иконки')
//         })
//     },
//     [setIconImage]
//   )
//   const iconTypeOptionsMemo = useMemo<OptionItem[]>(
//     () => [
//       {
//         key: 'image',
//         label: 'Изображение',
//         below: (
//           <ImageUploader
//             hideSwitch
//             classNames={{ container: 'border-none !p-0' }}
//             title="Использовать свою картинку"
//             recommendedResolution="100x100"
//             fileSize="300 Kb"
//             formats={['png, jpg, jpeg, webp']}
//             onFileSelect={handleFile}
//           />
//         )
//       },
//       { key: 'button', label: 'Кнопка', below: <ButtonSettingsField /> }
//     ],
//     [handleFile]
//   )
//   return (
//     <OptionsChooser
//       title="Вид иконки"
//       options={iconTypeOptionsMemo}
//       value={iconType}
//       onChange={handleChange}
//     />
//   )
// })

// const PositionControl = memo(() => {
//   const setButtonPosition = useWidgetSettingsStore(s => s.setButtonPosition)
//   const staticDefaults = useWidgetStaticDefaults()
//   const buttonPosition = useWidgetSettingsStore(
//     s =>
//       s.settings?.display?.icon?.position ??
//       staticDefaults?.display?.icon?.position ??
//       'bottom-left'
//   )
//   return <ButtonPositionChooser value={buttonPosition} onChange={setButtonPosition} />
// })

// const HideIconControl = memo(() => {
//   const setHideIcon = useWidgetSettingsStore(s => s.setHideIcon)
//   const staticDefaults = useWidgetStaticDefaults()
//   const hide = useWidgetSettingsStore(
//     s => s.settings?.display?.icon?.hide ?? staticDefaults?.display?.icon?.hide ?? 'always'
//   )
//   const handleChange = useCallback((v: string) => setHideIcon(v as HideIcon), [setHideIcon])
//   return (
//     <OptionsChooser
//       title="Сокрытие иконки"
//       options={iconHideOptions}
//       value={hide}
//       onChange={handleChange}
//     />
//   )
// })

// const DisplaySettingsTab = () => {
//   const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)
//   const widgetDefinition = widgetType ? getWidgetDefinition(widgetType) : null
//   const showStandardSurface = !widgetType || usesStandardSurface(widgetType, 'display')
//   const CustomDisplaySurface = widgetDefinition?.settings.surfaces?.display

//   if (!showStandardSurface) {
//     if (CustomDisplaySurface) return <CustomDisplaySurface />
//     return <SurfaceNotice surface="display" />
//   }

//   return (
//     <div className="flex flex-col gap-3">
//       <StartShowingControl />
//       <TimerSettingsConditional />
//       <IconTypeControl />
//       <PositionControl />
//       <HideIconControl />
//     </div>
//   )
// }

// export default memo(DisplaySettingsTab)
