import { useState, useEffect, useRef } from 'react'
import SvgIcon from '@/components/SvgIcon'
import chevronDown from '@/assets/icons/chevron-down.svg'

type ColorAccessoryProps = {
  label?: string
  color?: string
  onChange: (color: string) => void
  classNames?: {
    label?: string
    input?: string
    svgIcon?: string
    swatch?: string
  }
}

const ColorAccessory = ({
  label,
  color = '#FFFFFF',
  onChange,
  classNames
}: ColorAccessoryProps) => {
  const [tempColor, setTempColor] = useState(color)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTempColor(color)
  }, [color])

  useEffect(() => {
    if (tempColor === color) {
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(tempColor)
    }, 20)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [tempColor, color, onChange])

  return (
    <label
      className={`inline-flex items-center h-14 px-3 rounded-md border-1 border-[#E4E4E7] bg-white cursor-pointer ${classNames?.label}`}
    >
      {label ? <span className="mr-2 min-w-max flex-1">{label}</span> : null}
      <span
        className={`inline-block min-w-6 w-6 h-6 rounded-full border border-black ${classNames?.swatch ?? ''}`}
        style={{ backgroundColor: tempColor }}
      />
      <input
        type="color"
        value={tempColor}
        onChange={e => setTempColor(e.target.value)}
        className={`appearance-none w-min h-8 opacity-0 cursor-pointer ${classNames?.input}`}
        aria-label="Выбор цвета"
      />
      <SvgIcon
        src={chevronDown}
        size={'20px'}
        className={`w-min h-min text-black ${classNames?.svgIcon}`}
      />
    </label>
  )
}

export default ColorAccessory
