import { cn } from '@heroui/theme'

import CustomSwitch from '../CustomSwitch'
import { usePaymentContext } from './usePaymentContext'
import type { ModificationKey } from './PaymentContext'
import { AVAILABLE_WIDGETS, type WidgetType } from '@/layouts/Widgets/constants'

type WidgetItem = {title: string, type: WidgetType}

// filter widgets by their availability and return the titles
const widgets = AVAILABLE_WIDGETS.reduce<Array<WidgetItem>>(
  (acc, { isAvailable, title, type }) => {
    if (isAvailable) {
      acc.push({ title, type })
    }
    return acc
  },
  [],
)

type ModificationItemProps = {
  title: string
  type: ModificationKey
  enabled: boolean
}

const ModificationItem = (props: ModificationItemProps) => {
  const { dispatch } = usePaymentContext()

  const handleToggle = () => {
    dispatch({ type: 'toggleModification', modification: props.type })
  }

  return (
    <div className='w-full flex flex-row items-center justify-between'>
      <span className='text-base leading-4.75'>
        {props.title}
      </span>

      {/* i do not wish to knnw what is happening inside the CustomSwitch */}
      {/* it isn't mine and this is done for consistency */}
      <CustomSwitch
        isSelected={props.enabled}  // selected? fr bruh? not that i'm better
        onValueChange={handleToggle}
        // ths was also pulled out of some random pre-existing code
        selectedColor='group-data-[selected=true]:!bg-[#5951E5]'
        size='sm'
      />
    </div>
  )
}

const Modifications = () => {
  const { state } = usePaymentContext()
  const { modifications } = state

  return (
    <div
      className={cn(
        'w-87.5 p-4 flex flex-col gap-2.5 bg-[#F8F8F8]',
        'border border-[#E8E8E8] rounded-[10px]',
      )}
    >
      <h2 className='text-base leading-4.75'>
        Модификации:
      </h2>

      <hr className='w-full border-[#C0C0C0]' />

      {widgets.map(widget => (
        <ModificationItem
          key={widget.type}
          title={widget.title}
          type={widget.type}
          enabled={modifications[widget.type]}
        />
      ))}

      <ModificationItem
        title='Лейбл “Сделано на Lemnity”'
        type='BRANDING'
        enabled={modifications['BRANDING']}
      />

      <hr className='w-full border-[#C0C0C0] mt-auto mb-0' />
    </div>
  )
}

export default Modifications