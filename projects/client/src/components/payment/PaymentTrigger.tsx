import { useEffect, useState } from 'react'
import { PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import Popover from '../Popover'
import SvgIcon from '../SvgIcon'
import CustomSwitch from '../CustomSwitch'
import PaymentStatus from './PaymentStatus'
import PaymentPlanPicker from './PaymentPlanPicker'

import { usePaymentContext } from './usePaymentContext'
import { usePrice } from './usePrice'

import type { ModificationKey } from './PaymentContext'
import type { PaymentPeriod, PaymentPlan } from './types'
import { AVAILABLE_WIDGETS, type WidgetType } from '@/layouts/Widgets/constants'
import crossIcon from '@/assets/icons/cross.svg'

type PaymentTriggerVariant = 'trial' | 'paid' | 'negative'
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

const paymentPlans: PaymentPlan[] = [
  {
    key: 'basic',
    label: 'Базовый тариф',
    price: 0,
  },
  {
    key: 'business',
    label: 'Бизнес тариф',
    price: 499,
  }
]

const paymentPeriods: PaymentPeriod[] = [
  {
    key: 'month',
    label: 'Месяц',
    discount: 0,
    months: 1,
  },
  {
    key: '3_months',
    label: '3 месяца',
    discount: 15,
    months: 3,
  },
  {
    key: 'year',
    label: 'Год',
    discount: 25,
    months: 12,
  },
]

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

const PaymentTrigger = () => {
  const [variant, _setVariant] = useState<PaymentTriggerVariant>('paid')
  const [open, setOpen] = useState(false)
  const { dispatch, state } = usePaymentContext()
  
  const { modifications } = state

  const primaryLabel = variant === 'trial'
    ? 'Тестовый период'
    : 'Баланс: 870 ₽'
  const secondaryLabel = variant === 'trial'
    ? 'Осталось 14 дней'
    : 'Хватит на 30 дней'
  const title = variant === 'trial'
    ? ''
    : 'Пополнение баланса'

  useEffect(() => {
    dispatch({ type: 'setPaymentPlans', paymentPlans })
    dispatch({ type: 'setPaymentPeriods', paymentPeriods })
    dispatch({ type: 'setIsTrialPeriod', isTrialPeriod: variant === 'trial' })
  }, [dispatch])

  const { paymentButtonText } = usePrice()

  const getVariantClasses = (variant: PaymentTriggerVariant) => {
    switch (variant) {
      case 'trial':
        return 'border-[#553BB2] bg-[#553BB2]/15'
      case 'paid':
        return 'border-[#3BB240] bg-[#3BB240]/15'
      case 'negative':
        return 'border-[#E65F2B] bg-[#E65F2B]/15'
    }
  }

  const handlePopoverOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
  }

  const handlePopoverClose = () => {
    setOpen(false)
  }

  const handlePopoverInteractOutside = (element: Element) => {
    const isSelectInteraction = element.closest(
      '[role="listbox"], [role="option"], [data-slot="listbox"]',
    )

    return !isSelectInteraction
  }

  const popoverClassNames = {
    base: 'rounded-[10px]',
    content: 'w-177.5 p-4 flex-col gap-2.5 rounded-[10px]',
  }

  return (
    <Popover
      placement='bottom-end'
      classNames={popoverClassNames}
      isOpen={open}
      onOpenChange={handlePopoverOpenChange}
      shouldCloseOnBlur={false}
      shouldCloseOnInteractOutside={handlePopoverInteractOutside}
    >
      <PopoverTrigger>
        <Button
          className={cn(
            'min-w-35 h-10.25 py-2 rounded-full border',
            'flex flex-col items-center justify-center gap-[unset]',
            getVariantClasses(variant),
          )}
        >
          <span
            className={cn(
              'text-xs leading-3.75 font-medium',
              variant !== 'trial' && 'self-start',
            )}
          >
            {primaryLabel}
          </span>
          <span className='text-xs leading-3.75 font-regular'>
            {secondaryLabel}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <div
          className='w-full h-5.25 flex flex-row items-center justify-between'
        >
          <h1 className='text-[18px]'>
            {title}
          </h1>
          <button
            className='border-none size-4.5 cursor-pointer'
            onClick={handlePopoverClose}
          >
            <SvgIcon src={crossIcon}  />
          </button>
        </div>

        <div className='w-full flex flex-row gap-4'>  
          <div className='w-87.5 flex flex-col gap-2.5'>
            <PaymentStatus
              balance={870}
              daysLeft={3}
            />
            <PaymentPlanPicker />

            <Button
              className={cn(
                'w-full h-11.25 rounded-[5px] bg-[#5951E5] text-white text-base'
              )}
              // onPress={() => {
              //   console.table(state, ['paymentPlan', 'paymentPeriod', 'isTrialPeriod'])
              //   console.table(state.modifications)
              // }}
            >
              {paymentButtonText}
            </Button>

            <div className='w-full h-11.25 flex items-center justify-center'>
              <button
                className={cn(
                  'w-fit h-fit bg-white text-[#5951E5] text-base cursor-pointer',
                )}
              >
                Выставить счет
              </button>
            </div>

            <hr className='w-full border-[#C0C0C0]' />

            <span className='text-[10px] leading-3 text-[#919191]'>
              Нажимая кнопку «Оплатить» вы даёте согласие на обработку персональных
              данных в соответствии с Политикой конфиденциальности
            </span>
          </div>

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
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PaymentTrigger
