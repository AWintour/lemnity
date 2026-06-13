import { cn } from '@heroui/theme'

type NumberStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

/**
 * Числовое поле со стрелками ↑/↓ — единый степпер для размеров/чисел в редакторах.
 */
const NumberStepper = ({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  className,
}: NumberStepperProps) => {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const set = (v: number) => onChange(clamp(Number.isNaN(v) ? min : v))

  return (
    <div
      className={cn(
        'inline-flex items-stretch h-11 rounded-[10px] border border-[#E4E4E7] overflow-hidden bg-white',
        className,
      )}
    >
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => set(Number(e.target.value))}
        className={cn(
          'w-12 text-center text-[18px] text-[#1A1A1A] outline-none bg-transparent',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />
      <div className="flex flex-col border-l border-[#E4E4E7]">
        <button
          type="button"
          aria-label="Увеличить"
          onClick={() => set(value + step)}
          className="flex-1 px-2 flex items-center justify-center text-[#6E6E76] hover:bg-[#F4F4F6] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
        <div className="h-px bg-[#E4E4E7]" />
        <button
          type="button"
          aria-label="Уменьшить"
          onClick={() => set(value - step)}
          className="flex-1 px-2 flex items-center justify-center text-[#6E6E76] hover:bg-[#F4F4F6] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default NumberStepper
