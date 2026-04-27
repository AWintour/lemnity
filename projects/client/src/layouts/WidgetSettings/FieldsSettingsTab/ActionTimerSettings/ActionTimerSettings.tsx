// import { useCallback } from 'react'
// import ImageUploader from '@/components/ImageUploader'
// import { Input } from '@heroui/input'
// import ColorAccessory from '@/components/ColorAccessory'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import { useActionTimerSettings } from '@/layouts/Widgets/CountDown/hooks'
// import { uploadImage } from '@/api/upload'
// import { buildActionTimerWidgetSettings } from '@/layouts/Widgets/CountDown/defaults'

// const ActionTimerSettings = () => {
//   const { settings, updateActionTimer, setActionTimerImage } = useActionTimerSettings()
//   const countdownDefaults = buildActionTimerWidgetSettings().countdown
//   const countdownSettings = settings?.countdown ?? countdownDefaults

//   const { badgeText, badgeBackground, badgeColor, imageUrl } = countdownSettings

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

//   const handleBadgeTextChange = useCallback(
//     (text: string) => {
//       updateActionTimer({ badgeText: text })
//     },
//     [updateActionTimer]
//   )

//   const handleBadgeBackgroundChange = useCallback(
//     (color: string) => {
//       updateActionTimer({ badgeBackground: color })
//     },
//     [updateActionTimer]
//   )

//   const handleBadgeColorChange = useCallback(
//     (color: string) => {
//       updateActionTimer({ badgeColor: color })
//     },
//     [updateActionTimer]
//   )

//   return (
//     <BorderedContainer>
//       <div className="flex flex-col gap-4">
//         <span className="text-xl font-rubik">Настройки таймера акции</span>

//         <ImageUploader
//           hideSwitch
//           title="Промо картинка"
//           recommendedResolution="600x600"
//           fileSize="До 25 Mb"
//           formats={['png', 'jpeg', 'jpg', 'webp']}
//           url={imageUrl}
//           onFileSelect={handleImageUpload}
//         />

//         <div className="flex flex-col gap-3">
//           <span className="text-lg font-normal">Текст бейджа</span>
//           <Input
//             radius="sm"
//             variant="bordered"
//             placeholder="Концерт 08.10.2025"
//             className="max-w-full"
//             classNames={{
//               input: 'placeholder:text-[#AFAFAF]'
//             }}
//             value={badgeText ?? ''}
//             onValueChange={handleBadgeTextChange}
//           />
//         </div>

//         <div className="flex flex-col gap-3">
//           <span className="text-lg font-normal">Цвет фона бейджа</span>
//           <div className="flex items-center gap-2">
//             <Input
//               radius="sm"
//               variant="bordered"
//               type="color"
//               className="w-20 h-10"
//               value={badgeBackground ?? '#E9EEFF'}
//               onValueChange={handleBadgeBackgroundChange}
//             />
//             <ColorAccessory
//               color={badgeBackground ?? '#E9EEFF'}
//               onChange={handleBadgeBackgroundChange}
//             />
//           </div>
//         </div>

//         <div className="flex flex-col gap-3">
//           <span className="text-lg font-normal">Цвет текста бейджа</span>
//           <div className="flex items-center gap-2">
//             <Input
//               radius="sm"
//               variant="bordered"
//               type="color"
//               className="w-20 h-10"
//               value={badgeColor ?? '#336EC2'}
//               onValueChange={handleBadgeColorChange}
//             />
//             <ColorAccessory color={badgeColor ?? '#336EC2'} onChange={handleBadgeColorChange} />
//           </div>
//         </div>
//       </div>
//     </BorderedContainer>
//   )
// }

// export default ActionTimerSettings
