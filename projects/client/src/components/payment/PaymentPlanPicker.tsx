import { useEffect, useState } from 'react'
import type { SharedSelection } from '@heroui/system'
import { Select, SelectItem, type SelectProps } from '@heroui/select'
import { Input } from '@heroui/input'
import {
  Radio,
  RadioGroup,
  type RadioGroupProps,
  type RadioProps,
} from '@heroui/radio'
import { cn } from '@heroui/theme'
import { AnimatePresence, motion } from 'framer-motion'
import Decimal from 'decimal.js'

import FadeInOut from '../FadeInOut'
import SvgIcon from '../SvgIcon'
import Counter, { type PlaceValue } from '../Counter'

import { usePrice } from './usePrice'
import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import {
  billingPeriodUpdated,
  currentBillingPeriodIdChanged,
  currentPaymentPlanIdChanged,
  selectAllPaymentPlans,
  selectBillingPeiodById,
  selectBillingPeriodIds,
  selectCurrentBillingPeriodId,
  selectCurrentPaymentPlanId,
  selectPaymentPlanById,
  type TBillingPeriodKey,
} from '@/stores/redux/paymentSlice'

import type { RootState } from '@/stores/redux/store'
import crossIcon from '@/assets/icons/cross.svg'

type CustomRadioProps = {
  id: TBillingPeriodKey
  index: number
}

const CustomRadio = (props: CustomRadioProps) => {
  const { id, index } = props

  const billingPeriod = useAppSelector(
    (state: RootState) => selectBillingPeiodById(state, id)
  )

  const { discount, label } = billingPeriod

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

      <Radio value={id} classNames={classNames}>
        {label}
      </Radio>
    </div>
  )
}

const PaymentPeriodRadioGroup = () => {
  const dispatch = useAppDispatch()

  const billingPeriodIds =
    useAppSelector(selectBillingPeriodIds)
  const currentPaymentPlanId =
    useAppSelector(selectCurrentPaymentPlanId)
  const plan =
    useAppSelector(
      (state: RootState) => selectPaymentPlanById(state, currentPaymentPlanId)
    )
  
  useEffect(() => {
    const monthlyPrice = Number(plan.monthlyPrice)
    const quarterlyPrice = Number(plan.quarterlyPrice)
    const monthQuarterlyPrice = quarterlyPrice / 3
    const yearlyPrice = Number(plan.yearlyPrice)
    const monthYearlyPrice = yearlyPrice / 12
  
    const quarterlyDiscount =
      Math.round(((monthlyPrice - monthQuarterlyPrice) / monthlyPrice) * 100)
    const yearlyDiscount =
      Math.round(((monthlyPrice - monthYearlyPrice) / monthlyPrice) * 100)
    
    dispatch(billingPeriodUpdated({
      id: 'quarter',
      discount: quarterlyDiscount,
    }))
    dispatch(billingPeriodUpdated({
      id: 'year',
      discount: yearlyDiscount,
    }))
  }, [plan, dispatch])
  
  const defaultValue: TBillingPeriodKey = 'month'

  const handlePaymentPeriodChange = (value: string) => {
    dispatch(currentBillingPeriodIdChanged(value as TBillingPeriodKey))
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
      defaultValue={defaultValue}
      onValueChange={handlePaymentPeriodChange}
    >
      {billingPeriodIds.map((id, index) => (
        <CustomRadio
          key={id}
          id={id}
          index={index}
        />
      ))}
    </RadioGroup>
  )
}

const Promo = () => {
  const [open, setOpen] = useState(false)

  const toggleUserHasPromoOpen= () => {
    setOpen(!open)
  }

  return (
    <>
      <div className='w-full flex flex-row items-center justify-between'>
        <button
          className={cn(
            'w-fit text-[14px] leading-4.25 transition-colors duration-160',
            open ? 'text-black' : 'text-[rgba(0,0,0,0.36)] cursor-pointer',
          )}
          onClick={open ? undefined : toggleUserHasPromoOpen}
        >
          У меня есть промокод
        </button>

        <FadeInOut visible={open}>
          <button
            className={cn(
              'border-none size-4.25 cursor-pointer',
              !open && 'hidden',
            )}
            onClick={toggleUserHasPromoOpen}
          >
            <SvgIcon src={crossIcon} />
          </button>
        </FadeInOut>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`overflow-hidden`}
          >
            <Input
              classNames={{
                inputWrapper:
                  'min-h-8.75 h-8.75 px-4 rounded-[5px] border border-[#5951E5]',
                input: 'text-base',
              }}
              placeholder='Введите промокод'
              endContent={
                <button className='text-base text-[#5951E5] cursor-pointer'>
                  Применить
                </button>
              }
            />
          </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}

const PaymentPlanPicker = () => {
  const dispatch = useAppDispatch()

  const currentPaymentPlanId =
    useAppSelector(selectCurrentPaymentPlanId)
  // const paymentPlanIds =
  //   useAppSelector(selectPaymentPlanIds)
  const paymentPlans =
    useAppSelector(selectAllPaymentPlans)
      .sort((a, b) => Number(a.yearlyPrice) - Number(b.yearlyPrice))
  const currentBillingPeriodId =
    useAppSelector(selectCurrentBillingPeriodId)
  
  const { total } = usePrice()

  const zero = new Decimal(0)
  const thousand = new Decimal(1000)
  const tenThousand = new Decimal(10_000)

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

  const handlePaymentPlanChange = (keys: SharedSelection) => {
    const first = Array.from(keys)[0]
    if (first) {
      dispatch(currentPaymentPlanIdChanged(first.toString()))
    }
  }

  const selectClassNames: SelectProps['classNames'] = {
    trigger:
      'h-8.75 min-h-8.75 px-2.5 rounded-[5px] border border-[#5951E5]',
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
        defaultSelectedKeys={[currentPaymentPlanId]}
        selectedKeys={[currentPaymentPlanId]}
        classNames={selectClassNames}
        onSelectionChange={handlePaymentPlanChange}
      >
        {paymentPlans.map((plan) => (
          <SelectItem
            key={plan.id}
            classNames={{
              base: 'h-8.75 rounded-[5px]',
              title: 'text-base',
            }}
          >
            {plan.name}
          </SelectItem>
          // paymentPlanSelectItem()
        ))}
      </Select>

      <span
        id='payment-period-picker-label'
        className='text-base leading-4.75 mb-2.5'
      >
        Выберите период оплаты:
      </span>
      <PaymentPeriodRadioGroup />

      <div className={cn(
        'h-8.75 mt-2.25 rounded-[5px] border border-[#5951E5]',
        'flex flex-row items-center justify-center text-base',
      )}>
        <div className='text-base flex flex-row'>
          {/* Сумма оплаты: {total} ₽ */}
          <span>Оплатить</span>
          <Counter
            value={totalToDisplay}
            fontSize={16}
            padding={0}
            places={places}
            gap={0}
            // borderRadius={4}
            containerStyle={{ alignSelf: 'center' }}
            horizontalPadding={4}
            textColor='black'
            fontWeight='normal'
            topGradientStyle={{}}
            bottomGradientStyle={{}}
          />
          <span>₽</span>

          <AnimatePresence initial={false}>
          {currentBillingPeriodId === 'month'
            // && paymentPlan !== 'basic'
            && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='overflow-hidden self-end ml-1'
            >
              <span className='text-[8px] whitespace-nowrap'>
                (без скидки)
              </span>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      <Promo />
    </div>
  )
}

export default PaymentPlanPicker