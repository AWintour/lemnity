import { useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import { Input } from '@/components'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

type DayKey = ChatWidgetType['schedule']['days'][number]

const TIMEZONES = [
  '+2 Калининград',
  '+3 Москва',
  '+4 Самара',
  '+5 Екатеринбург',
  '+6 Омск',
  '+7 Красноярск',
  '+8 Иркутск',
  '+9 Якутск',
  '+10 Владивосток',
  '+11 Магадан',
  '+12 Камчатка',
]

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Пн' },
  { key: 'tue', label: 'Вт' },
  { key: 'wed', label: 'Ср' },
  { key: 'thu', label: 'Чт' },
  { key: 'fri', label: 'Пт' },
  { key: 'sat', label: 'Сб' },
  { key: 'sun', label: 'Вс' },
]

const WEEKDAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri']

const ChatScheduleSettings = () => {
  const schedule = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as ChatWidgetType).schedule ?? defaults.schedule)
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  const prevSelectionRef = useRef<DayKey[] | null>(null)

  const patchSchedule = (patch: Partial<ChatWidgetType['schedule']>) =>
    setChatPatch({ schedule: { ...schedule, ...patch } })

  const toggleDay = (day: DayKey) => {
    if (schedule.weekdaysOnly && (day === 'sat' || day === 'sun')) return
    const set = new Set(schedule.days)
    if (set.has(day)) set.delete(day)
    else set.add(day)
    patchSchedule({ days: DAYS.map(d => d.key).filter(k => set.has(k)) })
  }

  const toggleWeekdaysOnly = () => {
    if (!schedule.weekdaysOnly) {
      prevSelectionRef.current = schedule.days
      patchSchedule({ weekdaysOnly: true, days: WEEKDAYS })
    } else {
      patchSchedule({ weekdaysOnly: false, days: prevSelectionRef.current ?? schedule.days })
      prevSelectionRef.current = null
    }
  }

  const dayBtn = (selected: boolean, disabled?: boolean) =>
    cn(
      'h-12 rounded-[12px] border flex items-center justify-center text-[18px] transition-colors',
      selected ? 'bg-[#E9E9EB] border-[#D7D7DB] text-[#3D3D3B]' : 'bg-white border-[#E4E4E7] text-[#797979]',
      disabled && 'opacity-50 cursor-not-allowed',
    )

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-5">
        <h2 className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">
          Ограничения времени показа
        </h2>

        {/* Часовой пояс */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">Часовой пояс</span>
          <div className="relative">
            <select
              value={schedule.timezone}
              onChange={e => patchSchedule({ timezone: e.target.value })}
              className={cn(
                'w-full h-13.5 appearance-none rounded-[12px] border border-[#E4E4E7] bg-white',
                'px-4 pr-10 text-[18px] text-[#797979] outline-none focus:border-[#5951E5]',
              )}
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]">
              ⌄
            </span>
          </div>
        </div>

        {/* Рабочее время */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">Рабочее время</span>
          <div className="flex gap-3.5">
            <Input
              value={schedule.from}
              onValueChange={v => patchSchedule({ from: v })}
              startContent={<span className="text-[#797979] text-[18px]">С:</span>}
              classNames={{ inputWrapper: 'min-h-13.5', input: 'text-[18px]' }}
            />
            <Input
              value={schedule.to}
              onValueChange={v => patchSchedule({ to: v })}
              startContent={<span className="text-[#797979] text-[18px]">До:</span>}
              classNames={{ inputWrapper: 'min-h-13.5', input: 'text-[18px]' }}
            />
          </div>
        </div>

        {/* Дни недели */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">Дни недели</span>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-7 gap-2 flex-1">
              {DAYS.map(d => {
                const selected = schedule.days.includes(d.key)
                const disabled = schedule.weekdaysOnly && (d.key === 'sat' || d.key === 'sun')
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    disabled={disabled}
                    aria-pressed={selected}
                    className={dayBtn(selected, disabled)}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
            <div className="h-12 w-px bg-[#E4E4E7]" />
            <button
              type="button"
              onClick={toggleWeekdaysOnly}
              aria-pressed={schedule.weekdaysOnly}
              className={cn(dayBtn(schedule.weekdaysOnly), 'px-5 whitespace-nowrap')}
            >
              Только по будням
            </button>
          </div>
        </div>
      </div>
    </BorderedContainer>
  )
}

export default ChatScheduleSettings
