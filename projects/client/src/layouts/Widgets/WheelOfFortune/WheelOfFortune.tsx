// import type { SectorItem } from '@stores/widgetSettings/types'
// import wheelPointer from '@/assets/icons/wheel-pointer.svg'
// import { memo, useEffect, useRef } from 'react'
// import { motion, useAnimation } from 'framer-motion'
// import { createDefaultSector } from './createDefaultSector'
// import { generateRandomHexColor } from '@/common/utils/generateRandomColor'

// type WheelOfFortuneProps = {
//   sectors?: number | SectorItem[]
//   className?: string
//   pointerPositionDeg?: number // позиция указателя в градусах
//   spinTrigger?: number // изменение этого значения запускает анимацию
//   winningSectorId?: string | null // id сектора-победителя из настроек (до рандома)
//   sectorsRandomize?: boolean // перемешивать сектора
//   borderColor?: string
//   borderThickness?: number
// }

// const MIN_SECTORS = 4
// const MAX_SECTORS = 8

// function degToRad(deg: number): number {
//   return (deg * Math.PI) / 180
// }

// function polar(cx: number, cy: number, r: number, angleDeg: number) {
//   const a = degToRad(angleDeg)
//   return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
// }

// function sectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
//   const start = polar(cx, cy, r, startAngle)
//   const end = polar(cx, cy, r, endAngle)
//   const largeArc = endAngle - startAngle > 180 ? 1 : 0
//   return [
//     `M ${cx} ${cy}`,
//     `L ${start.x} ${start.y}`,
//     `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
//     'Z'
//   ].join(' ')
// }

// function normalizeSectors(input?: number | SectorItem[]): SectorItem[] {
//   if (Array.isArray(input) && input.length > 0) {
//     const items = input.filter(Boolean).slice(0, MAX_SECTORS)

//     // Определяем заполненные сектора (с текстом или с иконками)
//     const filledSectors = items.filter(
//       item =>
//         (item.mode === 'text' && item.text && item.text.trim().length) ||
//         (item.mode === 'icon' && item.icon)
//     )

//     // Если есть хотя бы один заполненный сектор, циклически повторяем для всех позиций
//     if (filledSectors.length > 0) {
//       return items.map((item, i) => {
//         // Берем сектор из заполненных циклически
//         const sourceSector = filledSectors[i % filledSectors.length]

//         return {
//           ...item, // Сохраняем все настройки текущего сектора (цвет, размер текста и т.д.)
//           mode: sourceSector.mode,
//           text: sourceSector.text,
//           icon: sourceSector.icon,
//           textColor: sourceSector.textColor,
//           textSize: sourceSector.textSize,
//           iconSize: sourceSector.iconSize
//         }
//       })
//     }

//     // Если все сектора пустые, возвращаем как есть (будем показывать "Бонус" в рендере)
//     return items.map(item => ({
//       ...item,
//       color: item.color || generateRandomHexColor()
//     }))
//   }

//   const requested = typeof input === 'number' ? input : MIN_SECTORS
//   const count = Math.min(MIN_SECTORS, Math.max(MIN_SECTORS, requested))
//   return Array.from({ length: count }).map(createDefaultSector)
// }

// const WheelOfFortune = ({
//   sectors,
//   className,
//   pointerPositionDeg = 0,
//   spinTrigger,
//   winningSectorId,
//   sectorsRandomize,
//   borderColor,
//   borderThickness
// }: WheelOfFortuneProps) => {
//   const normalizedItems = normalizeSectors(sectors)
//   const itemsWithIndex = normalizedItems.map((item, index) => ({ item, index }))
//   const shuffledItems = sectorsRandomize
//     ? [...itemsWithIndex].sort(() => Math.random() - 0.5)
//     : itemsWithIndex
//   const items = shuffledItems.map(entry => entry.item)
//   const count = items.length
//   const controls = useAnimation()
//   const prevSpinTriggerRef = useRef(spinTrigger)

//   const size = 360 // px
//   const cx = size / 2
//   const cy = size / 2
//   const totalR = size / 2
//   const borderStrokeWidth = Math.max(0, Math.min(20, borderThickness ?? 12))
//   const rDisk = totalR - borderStrokeWidth
//   const rBorder = rDisk + borderStrokeWidth / 2
//   const strokeColor = borderColor ?? '#0F52E6'
//   const step = 360 / count
//   // pointerPositionDeg задаётся в тригонометрической системе: 0° — справа, положительные углы CCW
//   const normalizedPointerDeg = pointerPositionDeg ?? 0
//   const pointerWidth = 36
//   const pointerHeight = 25
//   const pointerRadius = rBorder
//   const pointerBaseX = cx + pointerRadius - pointerWidth / 2
//   const pointerBaseY = cy - pointerHeight / 2

//   const winningIndex = (() => {
//     if (!winningSectorId) return Math.floor(Math.random() * count)
//     const idx = shuffledItems.findIndex(({ item }) => item.id === winningSectorId)
//     return idx >= 0 ? idx : Math.floor(Math.random() * count)
//   })()

//   const sectorMidAngle = winningIndex * step - 90 + step / 2 // -90 чтобы 0° было справа

//   useEffect(() => {
//     if (spinTrigger !== undefined && spinTrigger !== prevSpinTriggerRef.current) {
//       prevSpinTriggerRef.current = spinTrigger
//       const fullRotations = 5 // количество полных оборотов (clockwise)
//       // Для SVG/CSS положительный rotate — по часовой, а pointerDeg задан как CCW.
//       // Переводим угол указателя в часовую систему и совмещаем центр сектора с указателем:
//       // rotation = pointerCW - sectorCW, где pointerCW = -pointerCCW
//       const totalRotation = fullRotations * 360 + (-normalizedPointerDeg - sectorMidAngle)

//       controls.start({
//         rotate: totalRotation,
//         transition: {
//           duration: 4,
//           ease: [0.4, 0.0, 0.2, 1]
//         }
//       })
//     }
//   }, [spinTrigger, controls, normalizedPointerDeg, sectorMidAngle])

//   return (
//     <div className={`aspect-square w-full ${className}`}>
//       <svg
//         viewBox={`0 0 ${size} ${size}`}
//         className="w-full h-full"
//         style={{ overflow: 'visible' }}
//       >
//         <motion.g animate={controls} style={{ transformOrigin: `${cx}px ${cy}px` }}>
//           <circle
//             cx={cx}
//             cy={cy}
//             r={rBorder}
//             fill="none"
//             stroke={strokeColor}
//             strokeWidth={borderStrokeWidth}
//             strokeLinecap="round"
//             shapeRendering="geometricPrecision"
//           />

//           {items.map((item, i) => {
//             const start = i * step - 90
//             const end = (i + 1) * step - 90
//             const mid = start + step / 2
//             const path = sectorPath(cx, cy, rDisk, start, end)
//             const labelR = (rDisk - 20) * 0.65
//             const lp = polar(cx, cy, labelR, mid)
//             const iconR = (rDisk - 20) * 0.45
//             const ip = polar(cx, cy, iconR, mid)
//             const shift = 0.8 // для корректировки позиции текста
//             return (
//               <g key={item.id ?? i}>
//                 <path d={path} fill={item.color} shapeRendering="geometricPrecision" />
//                 {item.mode === 'text' ? (
//                   <text
//                     x={lp.x}
//                     y={lp.y}
//                     className="font-normal text-white text-center align-center"
//                     textAnchor="middle"
//                     dominantBaseline="middle"
//                     transform={`rotate(${mid - shift}, ${lp.x}, ${lp.y})`}
//                     fontSize={item.textSize}
//                     fill={item.textColor}
//                   >
//                     {(() => {
//                       // Если текст пустой, показываем плейсхолдер "Бонус"
//                       const displayText = item.text && item.text.trim().length ? item.text : 'Бонус'
//                       const lines = displayText.split('\n')
//                       const lineHeight = item.textSize * 1.2
//                       const totalHeight = (lines.length - 1) * lineHeight
//                       const startOffset = -totalHeight / 2
//                       return lines.map((line, lineIndex) => (
//                         <tspan
//                           key={lineIndex}
//                           x={lp.x}
//                           dy={lineIndex === 0 ? startOffset : lineHeight}
//                           textAnchor="middle"
//                         >
//                           {line}
//                         </tspan>
//                       ))
//                     })()}
//                   </text>
//                 ) : null}
//                 {item.mode === 'icon' && item.icon ? (
//                   <image
//                     href={item.icon}
//                     x={ip.x - 12}
//                     y={ip.y - 12}
//                     width={item.iconSize}
//                     height={item.iconSize}
//                     transform={`rotate(${mid}, ${ip.x}, ${ip.y})`}
//                   />
//                 ) : null}
//               </g>
//             )
//           })}

//           {/* Center hub */}
//           <circle cx={cx} cy={cy} r={10} fill="#0a1f6f" />
//           <circle cx={cx} cy={cy} r={7} fill="#1736C1" />
//         </motion.g>

//         {/* Указатель вне анимированной группы, чтобы не вращался */}
//         <image
//           href={wheelPointer}
//           x={pointerBaseX}
//           y={pointerBaseY}
//           width={pointerWidth}
//           height={pointerHeight}
//           transform={`rotate(${-normalizedPointerDeg}, ${cx}, ${cy})`}
//         />
//       </svg>
//     </div>
//   )
// }

// export default memo(WheelOfFortune)
