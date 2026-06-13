import { useState, type ReactNode } from 'react'
import { cn } from '@heroui/theme'

const EMOJIS = [
  '😀','😁','😂','🤣','🙂','😉','😍','😘','🤔','😎','🥳','😢','😡','😴',
  '👍','👎','🙏','👌','👏','🔥','🎉','✅','❗','💡','❤️','⭐','💯','🚀',
  '💬','📞','📩','📎','🎁','🛒','💰','⏰','📍','✏️','📄','⚙️',
]

type EmojiPickerProps = {
  onPick: (emoji: string) => void
  children: ReactNode
  className?: string
  align?: 'left' | 'right'
}

/** Кнопка-триггер + поповер с библиотекой эмодзи. Вставляет выбранный эмодзи через onPick. */
const EmojiPicker = ({ onPick, children, className, align = 'left' }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex">
      <button type="button" onClick={() => setOpen(v => !v)} className={cn('nodrag', className)} aria-label="Эмодзи">
        {children}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute bottom-full mb-2 z-50 w-64 rounded-[12px] border border-default-200 bg-white shadow-lg p-2',
              'grid grid-cols-7 gap-1',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {EMOJIS.map(em => (
              <button
                key={em}
                type="button"
                onClick={() => {
                  onPick(em)
                  setOpen(false)
                }}
                className="nodrag h-8 rounded-[8px] text-[18px] hover:bg-default-100"
              >
                {em}
              </button>
            ))}
          </div>
        </>
      )}
    </span>
  )
}

export default EmojiPicker
