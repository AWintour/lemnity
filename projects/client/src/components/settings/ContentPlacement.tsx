import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomRadioGroup from '../CustomRadioGroup'

const customRadioGroupOptions = [
  { label: 'С левой стороны', value: 'left' },
  { label: 'С правой стороны', value: 'right' },
]

const ContentPlacement = () => {
  return (
    <BorderedContainer>
      <div className='w-full flex flex-col gap-6'>
        <h2 className='text-[16px] leading-4.75 font-normal'>
          Расположение контента
        </h2>

        <CustomRadioGroup
          value='left'
          options={customRadioGroupOptions}
        />
      </div>
    </BorderedContainer>
  )
}

export default ContentPlacement
