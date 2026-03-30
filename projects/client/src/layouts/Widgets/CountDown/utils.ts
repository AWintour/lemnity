// import type { CountdownUnit, CountdownUnitKey } from '@/stores/widgetSettings/types'

// export const DEFAULT_UNITS: CountdownUnit[] = [
//   { key: 'days', label: 'дней' },
//   { key: 'hours', label: 'часов' },
//   { key: 'minutes', label: 'минут' }
// ]

// export const DEFAULT_UNIT_KEYS = DEFAULT_UNITS.map(unit => unit.key)

// export const ZERO_TIME: Record<CountdownUnitKey, string> = {
//   days: '00',
//   hours: '00',
//   minutes: '00',
//   seconds: '00'
// }

// export const formatDateForInput = (date: Date | string | null | undefined): string => {
//   if (!date) return ''
//   const resolved = date instanceof Date ? date : new Date(date)
//   if (Number.isNaN(resolved.getTime())) return ''
//   const pad = (value: number) => String(value).padStart(2, '0')
//   const year = resolved.getFullYear()
//   const month = pad(resolved.getMonth() + 1)
//   const day = pad(resolved.getDate())
//   const hours = pad(resolved.getHours())
//   const minutes = pad(resolved.getMinutes())
//   return `${year}-${month}-${day}T${hours}:${minutes}`
// }

// const pad = (value: number) => String(Math.max(0, value)).padStart(2, '0')

// export const computeTimeLeft = (
//   targetDate: Date | null,
//   unitKeys: CountdownUnitKey[]
// ): Record<CountdownUnitKey, string> => {
//   if (!targetDate) {
//     return { ...ZERO_TIME }
//   }

//   const diff = targetDate.getTime() - Date.now()
//   if (diff <= 0) {
//     return { ...ZERO_TIME }
//   }

//   let remainingSeconds = Math.floor(diff / 1000)
//   const days = Math.floor(remainingSeconds / 86400)
//   remainingSeconds -= days * 86400
//   const hours = Math.floor(remainingSeconds / 3600)
//   remainingSeconds -= hours * 3600
//   const minutes = Math.floor(remainingSeconds / 60)
//   remainingSeconds -= minutes * 60
//   const seconds = remainingSeconds

//   const mapping: Record<CountdownUnitKey, string> = {
//     days: pad(days),
//     hours: pad(hours),
//     minutes: pad(minutes),
//     seconds: pad(seconds)
//   }

//   return unitKeys.reduce<Record<CountdownUnitKey, string>>(
//     (acc, key) => {
//       acc[key] = mapping[key] ?? '00'
//       return acc
//     },
//     { ...ZERO_TIME }
//   )
// }
