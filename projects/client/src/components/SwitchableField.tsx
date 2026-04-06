import { cn } from '@heroui/theme'
import { AnimatePresence, motion } from 'framer-motion'
import CustomSwitch from './CustomSwitch'

export type SwitchableFieldProps = {
  title: string
  switchLabel?: string
  enabled?: boolean
  onToggle: (nextEnabled: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
  animationDuration?: number
  classNames?: {
    container?: string
    title?: string
    switchLabel?: string
    switch?: string
    content?: string
  }
}

const SwitchableField = ({
  title,
  switchLabel,
  enabled,
  onToggle,
  disabled = false,
  children,
  animationDuration = 0.3,
  classNames = {
    container: '',
    title: '',
    switchLabel: '',
    switch: '',
    content: ''
  }
}: SwitchableFieldProps) => {
  return (
    <div
      className={cn(
        'flex flex-col px-4.5 pb-4.5 pt-4 rounded-[14px] border border-gray-200',
        classNames.container
      )}
    >
      <div className="flex flex-row items-center gap-2.5">
        <div className="flex items-center justify-between grow gap-2.5">
          <span
            className={cn(
              'text-black text-base font-medium',
              classNames.title
            )}
          >
            {title}
          </span>

          {switchLabel && (
            <span
              className={cn(
                'text-[10px] text-[#BABABA]',
                classNames.switchLabel
              )}
            >
              {switchLabel}
            </span>
          )}
        </div>
        <CustomSwitch
          isSelected={enabled}
          onValueChange={onToggle}
          isDisabled={disabled}
          selectedColor="group-data-[selected=true]:!bg-[#5951E5]"
          className={cn('ml-auto', classNames.switch)}
          size="sm"
        />
      </div>
      <AnimatePresence initial={false}>
        {children && enabled ? (
          <motion.div
            // layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: animationDuration, ease: 'easeInOut' }}
            className={`overflow-hidden`}
          >
            <div className={cn('pt-4', classNames.content)}>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default SwitchableField
