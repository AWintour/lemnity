import type { ReactNode } from 'react'
// import type { ButtonPosition } from '@/stores/widgetSettingsStore'
export type ButtonPosition = 
  | 'bottom-left'
  // | 'top-right'
  // | 'top-left'
  | 'bottom-right'

type ButtonPositionChooserProps = {
  title?: string
  value: ButtonPosition
  onChange: (value: ButtonPosition) => void
  options?: ButtonPosition[]
  noBorder?: boolean
  noPadding?: boolean
}

const Dot = ({ className = '' }: { className?: string }) => (
  <span className={`absolute w-3 h-3 rounded-full bg-[#D4D4D8] ${className}`} />
)

type CardProps = {
  selected: boolean
  onClick: () => void
  children?: ReactNode
}

const OptionCard = ({ selected, onClick, children }: CardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-[85px] h-[91px] rounded-[10px] border transition-colors ${
        selected ? 'border-[#915DC0]' : 'border-[#C0C0C0]'
      } bg-white`}
      aria-pressed={selected}
    >
      {children}
    </button>
  )
}

const POSITION_DOT_CLASS: Record<ButtonPosition, string> = {
  'bottom-left': 'left-2.5 bottom-[7px]',
  // 'top-right': 'top-2 right-3',
  // 'top-left': 'top-2 left-3',
  'bottom-right': 'bottom-[7px] right-2.5'
}

const DEFAULT_POSITIONS: ButtonPosition[] = [
  'bottom-left',
  // 'top-right',
  'bottom-right',
]

const ButtonPositionChooser = ({
  title = 'Положение кнопки открытия',
  value,
  onChange,
  options,
  noBorder = false,
  noPadding = false
}: ButtonPositionChooserProps) => {
  const availableOptions = options?.length ? options : DEFAULT_POSITIONS
  const normalizedValue = availableOptions.includes(value) ? value : availableOptions[0]

  return (
    <div
      className={`flex flex-col gap-2.5 rounded-md ${noBorder ? '' : 'border border-[#E8E8E8]'} ${noPadding ? '' : 'p-3'}`}
    >
      <span className="text-black leading-[19px]">{title}</span>
      <div className="rounded-md border border-[#E8E8E8] px-2.5 py-4">
        <div className="flex gap-2.5">
          {availableOptions.map(position => (
            <OptionCard
              key={position}
              selected={normalizedValue === position}
              onClick={() => onChange(position)}
            >
              <Dot className={POSITION_DOT_CLASS[position] ?? ''} />
            </OptionCard>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ButtonPositionChooser
