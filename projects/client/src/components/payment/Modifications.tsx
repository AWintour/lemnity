import { cn } from '@heroui/theme'

import CustomSwitch from '../CustomSwitch'
import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import {
  planOptionCartStateChanged,
  selectIncludedPlanOptions,
  selectIsPlanOptionAddedToCart,
  selectPaymentPlanOptions,
  type TIncludedPlanOption,
  type TPaymentPlanOption,
} from '@/stores/redux/paymentSlice'

type ModificationItemProps = {
  value: TPaymentPlanOption | TIncludedPlanOption
  isDisabled?: boolean
  isSelected: boolean
}

const ModificationItem = (props: ModificationItemProps) => {
  const dispatch = useAppDispatch()

  const handleToggle = (value: boolean) => {
    dispatch(planOptionCartStateChanged({
      type: props.value.type,
      value: value,
    }))
  }

  return (
    <div className='w-full flex flex-row items-center justify-between'>
      <span className='text-base leading-4.75'>
        {props.value.name}
      </span>

      {/* i do not wish to knnw what is happening inside the CustomSwitch */}
      {/* it isn't mine and this is done for consistency */}
      <CustomSwitch
        isSelected={props.isSelected}
        onValueChange={handleToggle}
        isDisabled={props.isDisabled}
        // ths was also pulled out of some random pre-existing code
        selectedColor='group-data-[selected=true]:!bg-[#5951E5]'
        size='sm'
      />
    </div>
  )
}

const Modifications = () => {
  const includedPlanOptions =
    useAppSelector(selectIncludedPlanOptions)
  const paymentPlanOptions =
    useAppSelector(selectPaymentPlanOptions)
  const isPlanOptionAddedToCart =
    useAppSelector(selectIsPlanOptionAddedToCart)

  return (
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

      {includedPlanOptions.map(option => (
        <ModificationItem
          key={option.type}
          value={option}
          isDisabled={true}
          isSelected={true}
        />
      ))}
      
      {paymentPlanOptions.map(option => (
        <ModificationItem
          key={option.type}
          value={option}
          isSelected={isPlanOptionAddedToCart[option.type] ?? false}
        />
      ))}

      <hr className='w-full border-[#C0C0C0] mt-auto mb-0' />
    </div>
  )
}

export default Modifications