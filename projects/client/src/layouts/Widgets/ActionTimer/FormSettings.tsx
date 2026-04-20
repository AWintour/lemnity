import {
  ButtonAppearenceSettings,
  ColorPicker,
  Input,
  SwitchableField,
  TextSettings,
} from "@/components"
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import type { FontWeight, Icon } from '@lemnity/widget-config/widgets/base'

type FomSettingsProps = {
  badgeText: string
  badgeBackgroundColor: string
  badgeFontColor: string
  title: string
  titleFontSize: number
  titleColor: string
  description: string
  descriptionFontSize: number
  descriptionColor: string
  buttonText: string
  buttonFontColor: string
  buttonIcon: Icon
  buttonBackgroundColor: string
  buttonLink: string
  formBorderEnabled: boolean
  formBorderColor: string
  rewardScreenEnabled: boolean
  onBadgeTextChange:
    (value: string) => void
  onBadgeBackgroundColorChange:
    (value: string) => void
  onBadgeFontColorChange:
    (value: string) => void
  onTitleColorChange:
    (value: string) => void
  onTitleFontWeightChange:
    (value: FontWeight) => void
  onTitleChange:
    (value: string) => void
  onTitleFontSizeChange:
    (value: number) => void
  onDescriptionColorChange:
    (value: string) => void
  onDescriptionFontWeightChange:
    (value: FontWeight) => void
  onDescriptionChange:
    (value: string) => void
  onDescriptionFontSizeChange:
    (value: number) => void
  onButtonBackgroundColorChange:
    (value: string) => void
  onButtonFontColorChange:
    (value: string) => void
  onButtonTextChange:
    (value: string) => void
  onButtonIconChange:
    (value: Icon) => void
  onButtonLinkChange:
    (value: string) => void
  onFormBorderToggle:
    (value: boolean) => void
  onFormBorderColorChange:
    (value: string) => void
}

const FormSettings = (props: FomSettingsProps) => {
  const {
    badgeText,
    badgeBackgroundColor,
    badgeFontColor,
    title,
    titleFontSize,
    titleColor,
    description,
    descriptionFontSize,
    descriptionColor,
    buttonText,
    buttonFontColor,
    buttonIcon,
    buttonBackgroundColor,
    buttonLink,
    formBorderEnabled,
    formBorderColor,
    rewardScreenEnabled,
    onBadgeTextChange,
    onBadgeBackgroundColorChange,
    onBadgeFontColorChange,
    onTitleColorChange,
    onTitleFontWeightChange,
    onTitleChange,
    onTitleFontSizeChange,
    onDescriptionColorChange,
    onDescriptionFontWeightChange,
    onDescriptionChange,
    onDescriptionFontSizeChange,
    onButtonBackgroundColorChange,
    onButtonFontColorChange,
    onButtonTextChange,
    onButtonIconChange,
    onButtonLinkChange,
    onFormBorderToggle,
    onFormBorderColorChange,
  } = props

  return (
    <>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Настройки формы
      </h1>

      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <span className='text-black text-base'>
            Cтатус
          </span>
          <div className='w-full flex flex-row gap-2.5'>
            <Input
              value={badgeText}
              onValueChange={onBadgeTextChange}
              classNames={{ base: 'flex-3' }}
              placeholder='lemnity.ru/ads'
            />
            <ColorPicker
              classNames={{
                triggerButton: 'flex-1',
              }}
              initialColor={badgeBackgroundColor}
              triggerText='Цвет бейджа'
              onColorChange={onBadgeBackgroundColorChange}
              popoverPlacement='bottom-end'
            />
            <ColorPicker
              classNames={{
                triggerButton: 'flex-1',
              }}
              initialColor={badgeFontColor}
              triggerText='Цвет текста'
              onColorChange={onBadgeFontColorChange}
              popoverPlacement='bottom-end'
            />
          </div>

          <TextSettings
            text={title}
            title='Заголовок'
            textColor={titleColor}
            fontSize={titleFontSize}
            placeholder='Укажите заголовок'
            onColorChange={onTitleColorChange}
            onFontWeightChange={onTitleFontWeightChange}
            onTextChange={onTitleChange}
            onFontSizeChange={onTitleFontSizeChange}    
          />
          <TextSettings
            text={description}
            title='Описание'
            textColor={descriptionColor}
            fontSize={descriptionFontSize}
            placeholder='Получите супер скидку до 30 % на покупку билета в АРТ КАФЕ.'
            onColorChange={onDescriptionColorChange}
            onFontWeightChange={onDescriptionFontWeightChange}
            onTextChange={onDescriptionChange}
            onFontSizeChange={onDescriptionFontSizeChange}    
          />

          <span className='text-black text-base'>
            Кнопка
          </span>
          <ButtonAppearenceSettings
            buttonBackgroundColor={buttonBackgroundColor}
            buttonTextColor={buttonFontColor}
            buttonIcon={buttonIcon}
            buttonText={buttonText}
            onBackgroundColorChange={onButtonBackgroundColorChange}
            onFontColorChange={onButtonFontColorChange}
            onTriggerTextChange={onButtonTextChange}
            onTriggerIconChange={onButtonIconChange}
          />

          {!rewardScreenEnabled && (
            <>
              <span className='text-black text-base'>
                Ссылка
              </span>
              <Input
                value={buttonLink}
                onValueChange={onButtonLinkChange}
                placeholder='lemnity.ru/ads'
              />
            </>
          )}
        </div>
      </BorderedContainer>

      <SwitchableField
        title='Окантовка формы'
        enabled={formBorderEnabled}
        onToggle={onFormBorderToggle}
        classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}
      >
        <ColorPicker
          classNames={{
            triggerButton: 'flex-1',
          }}
          initialColor={formBorderColor}
          triggerText='Цвет окантовки'
          onColorChange={onFormBorderColorChange}
          popoverPlacement='bottom-end'
        />
      </SwitchableField>
    </>
  )
}

export default FormSettings
