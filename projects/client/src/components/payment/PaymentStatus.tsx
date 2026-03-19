import { cn } from '@heroui/theme'

type PaymentStatusProps = {
  isTestPeriod?: boolean
  balance: number
  daysLeft: number
}

const getDaysWord = (days: number) => {
  const absDays = Math.abs(days)
  const lastTwoDigits = absDays % 100
  const lastDigit = absDays % 10

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'дней'
  }

  if (lastDigit === 1) {
    return 'день'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня'
  }

  return 'дней'
}

const PaymentStatus = (props: PaymentStatusProps) => {
  const { isTestPeriod, balance, daysLeft } = props

  const balanceSubtitle = isTestPeriod
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

      {isTestPeriod
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