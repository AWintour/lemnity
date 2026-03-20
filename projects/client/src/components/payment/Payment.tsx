import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import PaymentStatus from './PaymentStatus'
import PaymentPlanPicker from './PaymentPlanPicker'

import { usePrice } from './usePrice'
import { usePaymentContext } from './usePaymentContext'

const Payment = () => {
  const { paymentButtonText } = usePrice()
  const { state } = usePaymentContext()

  return (
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
        onPress={() => {
          console.table(state, ['paymentPlan', 'paymentPeriod', 'isTrialPeriod'])
          console.table(state.modifications)
        }}
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
  )
}

export default Payment