import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomRadioGroup, {
  type CustomRadioGroupOption,
} from '../CustomRadioGroup'
import ButtonAppearenceSettings from '../ButtonAppearenceSettings'
import ButtonPositionChooser from '../ButtonPositionChooser'

import type {
  PositionType,
  TriggerVariant,
} from '@lemnity/widget-config/features/trigger'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import { uploadImage } from '@/api/upload'
import ImageUploader from '../ImageUploader'

const customRadioGroupOptions: CustomRadioGroupOption[] = [
  { label: 'Картинка', value: 'image' },
  { label: 'Кнопка', value: 'button' },
]

const ALLOWED_POSITIONS: PositionType[] = ['bottom-left', 'bottom-right']

export type TriggerSettingsProps = {
  triggerFontColor: string
  triggerBackgroundColor: string
  triggerText: string
  triggerVariant: TriggerVariant
  triggerImageUrl: string
  triggerIcon: Icon
  triggerPosition: PositionType
  onTriggerFontColorChange: (value: string) => void
  onTriggeBackgroundColorChange: (value: string) => void
  onTriggerTextChange: (value: string) => void
  onTriggerVariantChange: (value: TriggerVariant) => void
  onTriggerImageUrlChange: (value: string) => void
  onTriggerIconChange: (value: Icon) => void
  onTriggerPositionChange: (value: PositionType) => void
}

const DisplayTriggerSettings = (props: TriggerSettingsProps) => {
  const {
    triggerBackgroundColor,
    triggerFontColor,
    triggerIcon,
    triggerImageUrl,
    triggerPosition,
    triggerText,
    triggerVariant,
    onTriggerFontColorChange,
    onTriggeBackgroundColorChange,
    onTriggerTextChange,
    onTriggerVariantChange,
    onTriggerImageUrlChange,
    onTriggerIconChange,
    onTriggerPositionChange,
  } = props

  const handleTriggerVariantChange = (value: string) => {
    onTriggerVariantChange(value as TriggerVariant)
  }

  const handleImageUpload = (file: File | null) => {
    if (!file) {
      onTriggerImageUrlChange('')
      return
    }

    uploadImage(file).then(({ url }) => {
      onTriggerImageUrlChange(url)
    })
  }

  return (
    <>
      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <h2 className='text-[16px] leading-4.75'>
            Настройки триггера
          </h2>

          <CustomRadioGroup
            value={triggerVariant}
            options={customRadioGroupOptions}
            onValueChange={handleTriggerVariantChange}
          />


          {triggerVariant === 'button'
            ? (
                <>
                  <h2 className='text-[16px] leading-4.75'>
                    Текст в кнопке
                  </h2>
                  <ButtonAppearenceSettings
                    buttonBackgroundColor={triggerBackgroundColor}
                    buttonTextColor={triggerFontColor}
                    buttonIcon={triggerIcon}
                    buttonText={triggerText}
                    onBackgroundColorChange={onTriggeBackgroundColorChange}
                    onFontColorChange={onTriggerFontColorChange}
                    onTriggerTextChange={onTriggerTextChange}
                    onTriggerIconChange={onTriggerIconChange}
                  />
                </>
              )
            : (
                <ImageUploader
                  classNames={{ container: 'w-full' }}
                  hideSwitch
                  hidePreview
                  noBorder
                  noPadding
                  recommendedResolution="600x600"
                  fileSize="До 25 Mb"
                  formats={['png', 'jpeg', 'jpg', 'webp']}
                  url={triggerImageUrl || ''}
                  onFileSelect={handleImageUpload}
                  // isInvalid={!!imageUrlError}
                  // errorMessage={imageUrlError?.message}
                />
              )}
        </div>
      </BorderedContainer>

      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <ButtonPositionChooser
            noBorder
            noPadding
            value={triggerPosition}
            options={ALLOWED_POSITIONS}
            onChange={onTriggerPositionChange}
          />
        </div>
      </BorderedContainer>
    </>
  )
}

export default DisplayTriggerSettings
