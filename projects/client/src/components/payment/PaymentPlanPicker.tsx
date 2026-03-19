import type { SharedSelection } from '@heroui/system'
import { Select, SelectItem, type SelectProps } from '@heroui/select'
import {
  Radio,
  RadioGroup,
  type RadioGroupProps,
  type RadioProps,
} from '@heroui/radio'
import { cn } from '@heroui/theme'

import { usePaymentContext } from './usePaymentContext'

import type { PaymentPeriodKey, PaymentPlanKey } from './types'

type CustomRadioProps = {
  children: React.ReactNode
  value: string
  discount: number
  index: number
}

const CustomRadio = (props: CustomRadioProps) => {
  const { children, discount, index, ...rest } = props

  const classNames: RadioProps['classNames'] = {
    base: cn(
      'border border-[#5951E5] rounded-[5px] px-4 py-1.25 h-8.75',
      'data-[selected=true]:bg-[#5951E5] group',
      'justify-center gap-0',
    ),
    // this whole component is smoke and mirrors anyway,
    // so we can hide the radio button completely >w<
    wrapper: cn(
      'absolute w-0 h-0 min-w-0 min-h-0 opacity-0 overflow-hidden',
      'pointer-events-none'
    ),
    control: 'w-0 h-0 min-w-0 min-h-0',
    labelWrapper: 'm-0 p-0',
    label: 'm-0 text-center group-data-[selected=true]:text-white',
  }

  return (
    <div className='relative'>
      {discount > 0 && (
        <div
          className={cn(
            'absolute z-10 w-9 h-3.5 top-0 right-0 rounded-full',
            'translate-x-4 -translate-y-3.75 rotate-20',
            'flex items-center justify-center text-[9px] text-white',
            index === 1 && 'bg-[#3BB240]',
            index === 2 && 'bg-[#5951E5]',
          )}
        >
          -{discount}%
        </div>
      )}

      <Radio {...rest} classNames={classNames}>
        {children}
      </Radio>
    </div>
  )
}

const PaymentPeriodRadioGroup = () => {
  const { dispatch, state } = usePaymentContext()
    ?? { dispatch: () => {}, state: { paymentPeriods: [] } }

  const { paymentPeriods } = state

  const handlePaymentPeriodChange = (value: string) => {
    dispatch({
      type: 'setPaymentPeriod',
      paymentPeriod: value as PaymentPeriodKey,
    })
  }

  const radioGroupClassNames: RadioGroupProps['classNames'] = {
    wrapper: 'justify-between',
    base: 'px-2',
  }

  return (
    <RadioGroup
      aria-labelledby='payment-period-picker-label'
      orientation='horizontal'
      classNames={radioGroupClassNames}
      defaultValue={paymentPeriods[0]?.key ?? undefined}
      onValueChange={handlePaymentPeriodChange}
    >
      {paymentPeriods.map((paymentPeriod, index) => (
        <CustomRadio
          key={paymentPeriod.key}
          value={paymentPeriod.key}
          index={index}
          discount={paymentPeriod.discount}
        >
          {paymentPeriod.label}
        </CustomRadio>
      ))}
    </RadioGroup>
  )
}

const PaymentPlanPicker = () => {
  const { dispatch, state } = usePaymentContext()
    ?? { dispatch: () => {}, state: { paymentPlans: [] } }
  
  const { paymentPlans, paymentPlan, paymentPeriod, paymentPeriods } = state

  const price = paymentPlans.find(plan => plan.key === paymentPlan)?.price ?? 0
  const period = paymentPeriods?.find(period => period.key === paymentPeriod)

  const discount = period?.discount ?? 0
  const months = period?.months ?? 0
  const sum = price * months * (1 - discount / 100)

  const formattedSum = new Intl
    .NumberFormat('ru-RU', {
      minimumIntegerDigits: 3,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    })
    .format(sum)

  const handlePaymentPlanChange = (keys: SharedSelection) => {
    const first = Array.from(keys)[0]
    if (first) {
      dispatch({ type: 'setPaymentPlan', paymentPlan: first as PaymentPlanKey })
    }
  }

  const selectClassNames: SelectProps['classNames'] = {
    trigger:
      'h-8.75 min-h-8.75 rounded-[5px] border border-[#5951E5]',
    value: 'text-base',
    popoverContent: 'rounded-[5px]',
  }

  return (
    <div
      className={cn(
        'w-full p-4 bg-[#F8F8F8] flex flex-col gap-2.5',
        'border border-[#E8E8E8] rounded-[10px]',
      )}
    >
      <span
        id='payment-plan-picker-label'
        className='text-base leading-4.75'
      >
        Выберите тарифный план:
      </span>
      <Select
        aria-labelledby='payment-plan-picker-label'
        defaultSelectedKeys={['basic']}
        classNames={selectClassNames}
        onSelectionChange={handlePaymentPlanChange}
      >
        {paymentPlans.map(paymentPlan => (
          <SelectItem
            key={paymentPlan.key}
            classNames={{
              base: 'h-8.75 rounded-[5px]',
              title: 'text-base',
            }}
          >
            {paymentPlan.label}
          </SelectItem>
        ))}
      </Select>

      <span
        id='payment-period-picker-label'
        className='text-base leading-4.75 mb-4.5'
      >
        Выберите период оплаты:
      </span>
      <PaymentPeriodRadioGroup />

      <div>
        Сумма оплаты: {formattedSum} ₽
        {/* <span className='text-sm text-[#797979]'></span> */}
      </div>
    </div>
  )
}

export default PaymentPlanPicker