import { RadioGroup, Radio } from '@heroui/radio'
import { AnimatePresence, motion } from 'framer-motion'
import SimpleTooltip from './SimpleTooltip'
import CustomSwitch from './CustomSwitch'
import React, { memo } from 'react'

export type OptionItem = {
  key: string
  label: string
  // Optional right-side accessory renderer (e.g., color picker, button)
  accessory?: React.ReactNode
  tip?: string
  // Optional content shown BELOW the RadioGroup when this option is active
  below?: React.ReactNode
  disabled?: boolean
}

export type OptionsChooserProps = {
  title?: string
  options: OptionItem[]
  value?: string
  onChange: (key: string) => void
  showSwitch?: boolean
  switchedOn?: boolean
  isDisabled?: boolean
  onToggle?: (enabled: boolean) => void
  noBorder?: boolean
  noPadding?: boolean
  classNames?: string
}

const OptionsChooser = ({
  title,
  options,
  value,
  onChange,
  showSwitch,
  switchedOn,
  isDisabled = false,
  onToggle,
  noBorder,
  noPadding,
  classNames
}: OptionsChooserProps) => {
  const active = options.find(o => o.key === value)
  return (
    <div
      className={`flex flex-col rounded-lg ${noPadding ? '' : 'p-3'} overflow-hidden ${noBorder ? '' : 'border border-gray-200'} ${classNames}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          {title ? (
            <span className="text-black text-lg font-Rubik font-medium">{title}</span>
          ) : null}
          {showSwitch ? (
            <CustomSwitch
              isSelected={switchedOn}
              onValueChange={onToggle}
              selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
              className={`ml-auto`}
              size="sm"
            />
          ) : null}
        </div>
        <RadioGroup
          isDisabled={isDisabled}
          orientation="horizontal"
          value={value}
          onValueChange={v => onChange(String(v))}
          classNames={{
            wrapper: 'flex-nowrap flex gap-2'
          }}
        >
          {options.map(opt => (
            <React.Fragment key={opt.key}>
              <div className="flex items-center gap-2 flex-1">
                <Radio
                  value={opt.key}
                  classNames={{
                    base: '!max-w-none flex-1 h-14 rounded-md border data-[selected=true]:border-[#D9D9E0] data-[selected=true]:bg-white border-[#E4E4E7] bg-[#F8F8FA] hover:bg-[#F1F1F4] p-2 m-0',
                    labelWrapper: 'pl-2',
                    label: 'text-gray-700',
                    wrapper:
                      'border-[#373737] group-data-[selected=true]:!border-[#373737] border-small',
                    control: 'bg-[#373737] w-3.5 h-3.5'
                  }}
                  isDisabled={opt.disabled}
                >
                  <div className="flex flex-row items-center gap-1">
                    {opt.label}{' '}
                    {opt?.tip ? <SimpleTooltip classNames="w-max" content={opt.tip} /> : null}
                  </div>
                </Radio>
              </div>
              {opt.accessory ? (
                <div className="shrink" key={`accessory-${opt.key}`}>
                  {opt.accessory}
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </RadioGroup>
      </div>
      <AnimatePresence initial={false}>
        {active?.below ? (
          <motion.div
            key={`below-${active.key}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {active.below}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default memo(OptionsChooser)
