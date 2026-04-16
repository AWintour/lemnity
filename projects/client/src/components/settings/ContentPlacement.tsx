import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomRadioGroup from '../CustomRadioGroup'
import type {
  ContentPlacement as Placement,
} from '@lemnity/widget-config/widgets/action-timer'

const customRadioGroupOptions = [
  { label: 'С левой стороны', value: 'left' },
  { label: 'С правой стороны', value: 'right' },
]

type ContentPlacementProps = {
  placement: Placement
  onPlacementChange: (value: string) => void
}

const ContentPlacement = (
  { placement, onPlacementChange }: ContentPlacementProps
) => {
  return (
    <BorderedContainer>
      <div className='w-full flex flex-col gap-6'>
        <h2 className='text-[16px] leading-4.75 font-normal'>
          Расположение контента
        </h2>

        <CustomRadioGroup
          value={placement}
          onValueChange={onPlacementChange}
          options={customRadioGroupOptions}
        />
      </div>
    </BorderedContainer>
  )
}

export default ContentPlacement
