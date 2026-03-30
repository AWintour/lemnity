// import { Input } from '@heroui/input'
// import ColorAccessory from '@/components/ColorAccessory'

// type BadgeFieldProps = {
//   badgeText?: string
//   badgeBackground?: string
//   badgeColor?: string
//   onTextChange: (text: string) => void
//   onBackgroundChange: (color: string) => void
//   onColorChange: (color: string) => void
// }

// const BadgeField = ({
//   badgeText,
//   badgeBackground,
//   badgeColor,
//   onTextChange,
//   onBackgroundChange,
//   onColorChange
// }: BadgeFieldProps) => {
//   const handleTextChange = (value: string) => {
//     onTextChange(value)
//   }

//   return (
//     <div className="flex flex-col gap-2">
//       <span className="text-md font-normal">Статус</span>
//       <div className="flex flex-row gap-2 flex-wrap">
//         <Input
//           radius="sm"
//           variant="bordered"
//           placeholder="Концерт 08.10.2025"
//           className="max-w-full flex-1"
//           classNames={{ inputWrapper: 'h-14' }}
//           value={badgeText ?? ''}
//           onValueChange={handleTextChange}
//         />
//         <ColorAccessory
//           label="Цвет бейджа"
//           color={badgeBackground ?? '#E9EEFF'}
//           onChange={onBackgroundChange}
//         />
//         <ColorAccessory
//           label="Цвет текста"
//           color={badgeColor ?? '#336EC2'}
//           onChange={onColorChange}
//         />
//       </div>
//     </div>
//   )
// }

// export default BadgeField
