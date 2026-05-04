import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'
import Decimal from 'decimal.js'

import Counter, { type PlaceValue } from '../Counter'
import PaymentStatus from './PaymentStatus'
import PaymentPlanPicker from './PaymentPlanPicker'

import { usePrice } from './usePrice'
import { useCloudPayments } from '@/hooks/useCloudPayments'
import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import {
  paymentWidgetOpenChanged,
  selectBalance,
  selectCurrentPaymentPlanId,
  selectPaymentPlan,
  selectPaymentPlanById,
} from '@/stores/redux/paymentSlice'

const Payment = () => {
  const { total } = usePrice()

  // const { status, launchWidget } = useCloudPayments((result) => {
  //   console.log('callback result:', result)
  // })
  
  const dispatch = useAppDispatch()

  const balance =
    useAppSelector(selectBalance)
  const paymentPlan =
    useAppSelector(selectPaymentPlan)
  const currentPaymentPlanId =
    useAppSelector(selectCurrentPaymentPlanId)
  const currentPlan =
    useAppSelector(
      (state) => selectPaymentPlanById(state, currentPaymentPlanId)
    )
  
  const balanceNumber = Number(balance)

  const zero = new Decimal(0)
  const thousand = new Decimal(1000)
  const tenThousand = new Decimal(10_000)

  // visible precision of the total needed for the counter animation
  // this needs to be generated on the fly
  let places: PlaceValue[] = [100, 10, 1, '.', .1, .01]

  if (!total.equals(zero)) {
    if (total.greaterThan(tenThousand)) {
      places = [10_000, 1000, 100, 10, 1, ',', .1, .01]
    }
    else if (total.greaterThan(thousand)) {
      places = [1000, 100, 10, 1, ',', .1, .01]
    }
  }

  const totalToDisplay = Number(total.toFixed(2))

  const displaySwitchToAnotherPlan = paymentPlan.id !== currentPaymentPlanId
  const buttonText =
    displaySwitchToAnotherPlan
    ? `Переключиться на ${currentPlan.name}`
    : total.equals(zero)
      ? 'Оплачивать не нужно'
      : ''

  const handlePayment = () => {
    if (total.equals(zero)) {
      return
    }

    // if (status !== 'ready') {
    //   console.log('[PAYMENT] status !== ready')
    //   return
    // }

    dispatch(paymentWidgetOpenChanged(false))
    // launchWidget()
    console.log('[PAYMENT] widget launched')
  }

  return (
    <div className='w-87.5 flex flex-col gap-2.5'>
      <PaymentStatus
        balance={balanceNumber}
        daysLeft={3}
      />
      <PaymentPlanPicker />

      <Button
        className={cn(
          'w-full h-11.25 rounded-[5px] bg-[#5951E5] text-white text-base',
          'gap-0'
        )}
        onPress={handlePayment}
      >
        {displaySwitchToAnotherPlan || total.equals(zero)
          ? buttonText
          : <>
              <span className='text-base'>Оплатить</span>
              <Counter
                value={totalToDisplay}
                fontSize={16}
                padding={0}
                places={places}
                gap={0}
                horizontalPadding={4}
                textColor='white'
                fontWeight='normal'
                topGradientStyle={{}}
                bottomGradientStyle={{}}
              />
              <span className='text-base'>₽</span>
            </>
        }
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
  )
}

export default Payment