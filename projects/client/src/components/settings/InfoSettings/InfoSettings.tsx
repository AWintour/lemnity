import { cn } from '@heroui/theme'
import { Input } from '@heroui/input'
import {
  parseAbsoluteToLocal,
  ZonedDateTime,
} from '@internationalized/date'

import { ContentSettings } from '../'
import CountdownSettings from './CountdownSettings'
import TextSettings from '@/components/TextSettings'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import { ButtonAppearenceSettings } from '@/components'

import type {
  Content,
  ContentAlignment,
  FontWeight,
  Icon,
} from '@lemnity/widget-config/widgets/announcement'

type InfoSettingsProps = {
  variant: 'countdown' | 'announcement'
  contentEnabled?: boolean
  contentType?: Content
  contentAlignment?: ContentAlignment
  contentUrl: string | undefined

  title: string
  titleColor: string
  description: string
  descriptionColor: string

  countdownEnabled?: boolean
  countdownDate?: string
  countdownFontColor?: string
  countdownBackgroundColor?: string
  
  buttonText: string
  buttonFontColor: string
  buttonBackgroundColor: string
  icon: Icon
  link: string

  rewardScreenEnabled?: boolean
  setContentType?: (contentType: Content) => void
  setContentAlignment?: (alignment: ContentAlignment) => void
  setContentEnabled?: (contentEnabled: boolean) => void
  setContentUrl: (url: string | undefined) => void
  setTitle: (title: string) => void
  setTitleFontWeight: (weight: FontWeight) => void
  setTitleColor: (titleColor: string) => void
  setDescription: (description: string) => void
  setDescriptionFontWeight: (weight: FontWeight) => void
  setDescriptionColor: (descriptionColor: string) => void
  setCountdownEnabled?: (countdownEnabled: boolean) => void
  setCountdownDate?: (countdownDate: string) => void
  setCountdownFontColor?: (countdownFontColor: string) => void
  setCountdownBackgroundColor?: (countdownBackgroundColor: string) => void
  setButtonText: (buttonText: string) => void
  setButtonFontColor: (buttonFontColor: string) => void
  setButtonBackgroundColor: (buttonBackgroundColor: string) => void
  setButtonIcon: (icon: Icon) => void
  setButtonLink: (link: string) => void
}

const InfoSettings = (props: InfoSettingsProps) => {
  const {
    contentEnabled,
    contentType,
    contentAlignment,
    contentUrl,

    title,
    titleColor,
    description,
    descriptionColor,

    countdownEnabled,
    countdownDate,
    
    buttonText,
    buttonFontColor,
    buttonBackgroundColor,
    icon,
    link,

    rewardScreenEnabled,
  } = props

  const countdownFontColor = countdownEnabled
    ? props.countdownFontColor
    : '#000000'
  const countdownBackgroundColor = countdownEnabled
    ? props.countdownBackgroundColor
    : '#FFFFFF'

  const showCountdownSettings =
    props.variant === 'countdown'
    && props.setCountdownEnabled
    && props.setCountdownBackgroundColor
    && props.setCountdownFontColor

  const handleCountdownDateChange = (value: ZonedDateTime | null) => {
    if (!value) {
      return
    }
    props?.setCountdownDate?.(value.toAbsoluteString())
  }

  return (
    <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Окно информации
      </h1>
      
      <ContentSettings
        format={props.variant}
        contentEnabled={contentEnabled}
        contentType={contentType}
        contentAlignment={contentAlignment}
        contentUrl={contentUrl}
        onContentTypeChange={props.setContentType}
        onContentToggle={props.setContentEnabled}
        onContentAlignmentChange={props.setContentAlignment}
        onContentUrlChange={props.setContentUrl}
      />

      <BorderedContainer>
        <div className='w-full flex flex-col'>
          <TextSettings
            text={title}
            textColor={titleColor}
            title='Заголовок'
            placeholder='Укажите заголовок'
            onTextChange={props.setTitle}
            onFontWeightChange={props.setTitleFontWeight}
            onColorChange={props.setTitleColor}
          />
        </div>
      </BorderedContainer>

      <BorderedContainer>
        <div className='w-full flex flex-col'>
          <TextSettings
            text={description}
            textColor={descriptionColor}
            title='Описание'
            placeholder={
              'Получите супер скидку до 30 % на покупку билета в АРТ КАФЕ.'
            }
            onTextChange={props.setDescription}
            onFontWeightChange={props.setDescriptionFontWeight}
            onColorChange={props.setDescriptionColor}
          />
        </div>
      </BorderedContainer>

      {/* Typescript only looks one level down */}
      {showCountdownSettings
       && <CountdownSettings
            enabled={countdownEnabled}
            onToggle={props.setCountdownEnabled!}
            date={
              countdownDate
                ? parseAbsoluteToLocal(countdownDate)
                : parseAbsoluteToLocal(new Date().toISOString())
            }
            onDateChange={handleCountdownDateChange}
            backgroundColor={countdownBackgroundColor!}
            onBackgroundColorChange={props.setCountdownBackgroundColor!}
            fontColor={countdownFontColor!}
            onFontColorChange={props.setCountdownFontColor!}
          />}

      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <h2 className='text-[16px] leading-4.75'>Кнопка</h2>
          <ButtonAppearenceSettings
            onTriggerTextChange={props.setButtonText}
            onTriggerIconChange={props.setButtonIcon}
            onFontColorChange={props.setButtonFontColor}
            onBackgroundColorChange={props.setButtonBackgroundColor}
            buttonText={buttonText}
            buttonTextColor={buttonFontColor}
            buttonBackgroundColor={buttonBackgroundColor}
            buttonIcon={icon}
          />

          {!rewardScreenEnabled && (
            <>
              <h2 className='text-[16px] leading-4.75'>Ссылка</h2>
              <Input
                value={link}
                onValueChange={props.setButtonLink}
                placeholder={'lemnity.ru/ads'}
                classNames={{
                  base: 'min-w-76 flex-1',
                  inputWrapper: cn(
                    'rounded-md border bg-white border-[#E8E8E8] rounded-[5px]',
                    'shadow-none h-12.5 px-2.5',
                  ),
                  input: 'placeholder:text-[#AAAAAA] text-base'
                }}
              />
            </>
          )}
        </div>
      </BorderedContainer>
    </div>
  )
}

export default InfoSettings
