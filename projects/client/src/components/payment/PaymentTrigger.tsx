import { useEffect, useState } from 'react'
import { PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import Popover from '../Popover'
import SvgIcon from '../SvgIcon'
import Payment from './Payment'
import Modifications from './Modifications'

import crossIcon from '@/assets/icons/cross.svg'
import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import {
  paymentWidgetOpenChanged,
  selectBalance,
  selectIsTrialPeriod,
  selectPaymentWidgetOpen,
} from '@/stores/redux/paymentSlice'

type PaymentTriggerVariant = 'trial' | 'paid' | 'negative'

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

const PaymentTrigger = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [variant, setVariant] = useState<PaymentTriggerVariant>('trial')

  const dispatch = useAppDispatch()

  const isTrialPeriod =
    useAppSelector(selectIsTrialPeriod)
  const balance =
    useAppSelector(selectBalance)

  useEffect(() => {
    setVariant(
      isTrialPeriod
        ? 'trial'
        : 'paid'
    )
  }, [isTrialPeriod])
  
  const paymentWidgetOpen = useAppSelector(selectPaymentWidgetOpen)
  
  const primaryLabel = variant === 'trial'
    ? 'Тестовый период'
    : `Баланс: ${balance} ₽`
  const secondaryLabel = variant === 'trial'
    ? 'Осталось 14 дней'
    : 'Хватит на 30 дней'
  const title = variant === 'trial'
    ? ''
    : 'Пополнение баланса'

  const handlePopoverOpenChange = (isOpen: boolean) => {
    dispatch(paymentWidgetOpenChanged(isOpen))
  }

  const handlePopoverClose = () => {
    dispatch(paymentWidgetOpenChanged(false))
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
      isOpen={paymentWidgetOpen}
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
          {/* <div
            className={cn(
              'w-87.5 p-4 flex flex-col gap-2.5 bg-[#F8F8F8]',
              'border border-[#E8E8E8] rounded-[10px]',
            )}
          /> */}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PaymentTrigger
