import { useState } from 'react'
import { Button } from '@heroui/button'
import { Textarea } from '@heroui/input'
import { cn } from '@heroui/theme'

import { submitFeedback } from '@/services/feedback'

const MAX_LENGTH = 2000

type Status = 'idle' | 'sending' | 'success' | 'error'

type FeedbackPopoverProps = {
  /** Вызывается после успешной отправки (напр. чтобы закрыть попап). */
  onSent?: () => void
}

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2BA34A"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const FeedbackPopover = ({ onSent }: FeedbackPopoverProps) => {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || status === 'sending') return

    setStatus('sending')
    try {
      await submitFeedback(trimmed)
      setStatus('success')
      setText('')
      onSent?.()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="w-[340px] px-4.5 py-7 text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#E8F5EC] flex items-center justify-center">
          <CheckIcon />
        </div>
        <div className="text-[17px] font-semibold text-[#111]">Спасибо!</div>
        <div className="text-sm text-[#888] mt-1">
          Мы получили ваше сообщение
        </div>
      </div>
    )
  }

  return (
    <div className="w-[340px] p-4.5">
      <div className="text-[17px] font-semibold text-[#111] mb-3">
        Есть идея или замечания?
      </div>

      <Textarea
        placeholder="Опишите идею или проблему…"
        value={text}
        onValueChange={value => setText(value.slice(0, MAX_LENGTH))}
        minRows={4}
        maxRows={8}
        classNames={{
          inputWrapper: cn(
            'rounded-[10px] bg-[#fbfbfc] border border-[#E3E3E6]',
            'shadow-none px-3'
          ),
          input: 'placeholder:text-[#AAB0B6] text-sm'
        }}
      />

      <div className="flex flex-row justify-between items-center mt-1 min-h-4">
        {status === 'error' ? (
          <span className="text-xs text-[#d33]">
            Не удалось отправить, попробуйте позже
          </span>
        ) : (
          <span />
        )}
        <span className="text-[11px] text-[#b3b8bd]">
          {text.length} / {MAX_LENGTH}
        </span>
      </div>

      <Button
        className="mt-2 w-full h-11 rounded-[10px] bg-[#5951E5] text-white text-[15px] font-semibold"
        isDisabled={!text.trim() || status === 'sending'}
        isLoading={status === 'sending'}
        onPress={handleSend}
      >
        Отправить
      </Button>
    </div>
  )
}

export default FeedbackPopover
