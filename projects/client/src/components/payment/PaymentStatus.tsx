import { cn } from '@heroui/theme'
import { getDaysWord } from './utils'
import { usePaymentContext } from './usePaymentContext'

type PaymentStatusProps = {
  balance: number
  daysLeft: number
}

const PaymentStatus = (props: PaymentStatusProps) => {
  const { balance, daysLeft } = props
  const { state } = usePaymentContext() ?? { state: { isTrialPeriod: true } }
  const { isTrialPeriod } = state

  const balanceSubtitle = isTrialPeriod
    ? 'У вас тестовый период'
    : `Хватит на ${daysLeft} ${getDaysWord(daysLeft)}`

  const formattedBalance = new Intl
    .NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    })
    .format(balance)

  return (
    <div
      className={cn(
        'w-full p-2.5 bg-[#F8F8F8] flex flex-row justify-between',
        'border border-[#E8E8E8] rounded-[10px]',
      )}
    >
      <div className='flex flex-col gap-1'>
        <span className='text-base leading-3.75 font-medium'>
          Текущий баланс
        </span>
        <span className='text-sm text-[#797979] leading-4.25'>
          {balanceSubtitle}
        </span>
      </div>

      {isTrialPeriod
        ? <div className='flex flex-col gap-1'>
            <span className='text-sm text-[#797979] leading-4.25'>
              Осталось
            </span>
            <span className='text-base leading-3.75 font-medium'>
              {daysLeft} {getDaysWord(daysLeft)}
            </span>
          </div>
        : <div className='flex flex-col items-center justify-center'>
            <span className='text-xl leading-6 font-medium'>
              {formattedBalance} ₽
            </span>
          </div>
      }
    </div>
  )
}

export default PaymentStatus