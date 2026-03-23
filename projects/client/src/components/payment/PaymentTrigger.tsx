import { useEffect, useState } from 'react'
import { PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import Popover from '../Popover'
import SvgIcon from '../SvgIcon'
import Payment from './Payment'
import Modifications from './Modifications'

import { usePaymentContext } from './usePaymentContext'

import type { PaymentPeriod, PaymentPlan } from './types'
import crossIcon from '@/assets/icons/cross.svg'

type PaymentTriggerVariant = 'trial' | 'paid' | 'negative'

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

const PaymentTrigger = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [variant, _setVariant] = useState<PaymentTriggerVariant>('trial')
  const { state, dispatch } = usePaymentContext()

  const { open } = state
  
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
    dispatch({ type: 'setPopupOpen', open: isOpen })
  }

  const handlePopoverClose = () => {
    dispatch({ type: 'setPopupOpen', open: false })
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
          <Payment />
          <Modifications />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PaymentTrigger
