// import { useEffect, useMemo, useState, type ReactElement } from 'react'
// import { DEFAULT_UNIT_KEYS, DEFAULT_UNITS, computeTimeLeft } from './utils'
// import type { CountdownUnitKey } from '@/stores/widgetSettings/types'

// type TimerProps = {
//   eventDate?: Date | string | null
//   variant: 'mobile' | 'desktop'
// }

// const parseTargetDate = (value?: Date | string | null): Date | null => {
//   if (!value) return null
//   const resolved = value instanceof Date ? value : new Date(value)
//   if (Number.isNaN(resolved.getTime())) return null
//   return resolved
// }

// const Timer = ({ eventDate, variant }: TimerProps) => {
//   const targetDate = useMemo(() => parseTargetDate(eventDate), [eventDate])
//   const [timeLeft, setTimeLeft] = useState<Record<CountdownUnitKey, string>>(() =>
//     computeTimeLeft(targetDate, DEFAULT_UNIT_KEYS)
//   )

//   useEffect(() => {
//     const update = () => setTimeLeft(computeTimeLeft(targetDate, DEFAULT_UNIT_KEYS))
//     update()
//     if (!targetDate || typeof window === 'undefined') return
//     const timer = window.setInterval(update, 1000)
//     return () => window.clearInterval(timer)
//   }, [targetDate])

//   const containerClasses =
//     variant === 'mobile'
//       ? 'w-min flex flex-col self-center justify-center gap-3'
//       : 'w-min flex flex-col items-center gap-5'

//   const arrs = DEFAULT_UNITS.reduce<{ top: ReactElement[]; bot: ReactElement[] }>(
//     (acc, unit, index) => {
//       const nextTop = [
//         ...acc.top,
//         <div
//           key={unit.key}
//           className="flex min-w-[70px] flex-col items-center rounded-xl bg-[#F5F5F5] py-3 text-black"
//         >
//           <span className="text-2xl font-semibold leading-tight">{timeLeft[unit.key]}</span>
//         </div>
//       ]
//       if (index !== DEFAULT_UNITS.length - 1) {
//         nextTop.push(
//           <div key={`${unit.key}-separator`} className="text-3xl font-semibold leading-tight">
//             :
//           </div>
//         )
//       }
//       const nextBot = [
//         ...acc.bot,
//         <div
//           key={`${unit.key}-label`}
//           className="flex min-w-[70px] flex-col items-center rounded-xl bg-[#F5F5F5] p-1 text-black"
//         >
//           <span className="text-xs font-medium uppercase tracking-wide opacity-70">
//             {unit.label}
//           </span>
//         </div>
//       ]

//       return { top: nextTop, bot: nextBot }
//     },
//     { top: [], bot: [] }
//   )

//   return (
//     <div className={containerClasses}>
//       <div className="flex flex-row items-center justify-center gap-3">
//         {arrs.top.map(item => item)}
//       </div>
//       <div className="flex justify-between w-full">{arrs.bot.map(item => item)}</div>
//     </div>
//   )
// }

// export default Timer
