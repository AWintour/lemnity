import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import Counter, { type PlaceValue } from '../Counter'
import PaymentStatus from './PaymentStatus'
import PaymentPlanPicker from './PaymentPlanPicker'

import { usePrice } from './usePrice'
import { usePaymentContext } from './usePaymentContext'
import { useCloudPayments } from '@/hooks/useCloudPayments'

const Payment = () => {
  const { total } = usePrice()
  const { dispatch, state } = usePaymentContext()
  const { status, launchWidget } = useCloudPayments((result) => {
    console.log('callback result:', result)
  })
  
  const { isTrialPeriod, paymentPlan } = state

  // visible precision of the total needed for the counter animation
  const places: PlaceValue[] = total !== 0 && total > 1000
    ? [1000, 100, 10, 1, ',', .1, .01]
    : [100, 10, 1, '.', .1, .01]

  const handlePayment = () => {
    console.table(state, ['paymentPlan', 'paymentPeriod', 'isTrialPeriod'])
    console.table(state.modifications)

    if (isTrialPeriod && paymentPlan === 'basic') {
      dispatch({ type: 'setPaymentPlan', paymentPlan: 'business'})
      return
    }

    if (status !== 'ready') {
      return
    }

    dispatch({ type: 'setPopupOpen', open: false })
    launchWidget()
  }

  return (
    <div className='w-87.5 flex flex-col gap-2.5'>
      <PaymentStatus
        balance={870}
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
        {isTrialPeriod && paymentPlan === 'basic'
          ? 'Переключиться на бизнес тариф'
          : <>
              <span className='text-base'>Оплатить</span>
              <Counter
                value={total}
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