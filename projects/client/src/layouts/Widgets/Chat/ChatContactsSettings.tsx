import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

type Contacts = ChatWidgetType['contacts']
type FieldKey = 'name' | 'phone' | 'email'

// Визуальный чекбокс (span): клик обрабатывает внешняя кнопка-строка, поэтому без своей кнопки
// (иначе была бы вложенность <button> в <button> и двойное переключение).
const CheckBox = ({ checked }: { checked: boolean }) => (
  <span
    role="checkbox"
    aria-checked={checked}
    className={cn(
      'w-7 h-7 shrink-0 rounded-[8px] flex items-center justify-center transition-colors',
      checked ? 'bg-[#3D3D3B]' : 'bg-white border border-[#D7D7DB]',
    )}
  >
    {checked && (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
    )}
  </span>
)

const Radio = ({ checked }: { checked: boolean }) => (
  <span
    className={cn(
      'w-6 h-6 shrink-0 rounded-full border flex items-center justify-center',
      checked ? 'border-[#3D3D3B]' : 'border-[#C7C7CC]',
    )}
  >
    {checked && <span className="w-3 h-3 rounded-full bg-[#3D3D3B]" />}
  </span>
)

const FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'name', label: 'Ваше имя' },
  { key: 'phone', label: 'Телефон' },
  { key: 'email', label: 'Email' },
]

const WHEN_OPTIONS: { key: Contacts['when']; label: string }[] = [
  { key: 'inDialog', label: 'В ходе диалога' },
  { key: 'beforeDialog', label: 'Перед началом диалога' },
  { key: 'never', label: 'Не запрашивать' },
]

const ChatContactsSettings = () => {
  const contacts = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as ChatWidgetType).contacts ?? defaults.contacts)
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  const patch = (next: Partial<Contacts>) => setChatPatch({ contacts: { ...contacts, ...next } })
  const patchField = (key: FieldKey, p: Partial<Contacts['name']>) =>
    patch({ [key]: { ...contacts[key], ...p } } as Partial<Contacts>)

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-4">
        <h2 className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Контакты</h2>

        {FIELDS.map(f => (
          <div
            key={f.key}
            className="rounded-[12px] border border-[#ECECEC] px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <button
              type="button"
              onClick={() => patchField(f.key, { enabled: !contacts[f.key].enabled })}
              className="flex items-center gap-3"
            >
              <CheckBox checked={contacts[f.key].enabled} />
              <span className="text-[18px] text-[#1A1A1A]">{f.label}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-7 w-px bg-[#E4E4E7]" />
              <button
                type="button"
                onClick={() => patchField(f.key, { required: !contacts[f.key].required })}
                className="flex items-center gap-3"
              >
                <CheckBox checked={contacts[f.key].required} />
                <span className="text-[18px] text-[#9A9A9A]">Обязательно для заполнения</span>
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <span className="text-[20px] leading-6 text-[#1A1A1A]">Когда запрашивать</span>
          {WHEN_OPTIONS.map(o => (
            <button
              key={o.key}
              type="button"
              onClick={() => patch({ when: o.key })}
              className="flex items-center gap-3 py-1.5 text-left"
            >
              <Radio checked={contacts.when === o.key} />
              <span className="text-[18px] text-[#9A9A9A]">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </BorderedContainer>
  )
}

export default ChatContactsSettings
