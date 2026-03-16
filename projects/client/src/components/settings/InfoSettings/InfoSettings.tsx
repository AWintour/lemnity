import { cn } from '@heroui/theme'
import { Input } from '@heroui/input'
import { useShallow } from 'zustand/react/shallow'
import {
  parseAbsoluteToLocal,
  ZonedDateTime,
} from '@internationalized/date'

import { ContentSettings } from '../'
import CountdownSettings from './CountdownSettings'
import TextSettings from '@/components/TextSettings'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import ButtonAppearenceSettings from '@/layouts/WidgetSettings/DisplaySettingsTab/ButtonAppearenceSettings/ButtonAppearenceSettings'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type {
  AnnouncementWidgetType,
  Content,
  ContentAlignment,
} from '@lemnity/widget-config/widgets/announcement'
import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'

type InfoSettingsProps = {
  variant: 'countdown' | 'announcement'
  defaults: AnnouncementWidgetType | EventTimertWidgetType
}

const InfoSettings =(props: InfoSettingsProps) => {
  const {
    contentType,
    contentAlignment,
    contentUrl,

    title,
    titleColor,
    description,
    descriptionColor,

    countdownEnabled,
    countdownDate,
    countdownFontColor,
    countdownBackgroundColor,
    
    buttonText,
    buttonFontColor,
    buttonBackgroundColor,
    icon,
    link,
  } = useWidgetSettingsStore(
    useShallow(s => {
      // a crutch because the store just works this way apparently
      const widget =
        (s.settings?.widget as AnnouncementWidgetType | EventTimertWidgetType)
      const settings = widget.infoSettings
      const defaults = props.defaults.infoSettings
      
      let contentType: Content = 'imageOnTop'
      let contentAlignment: ContentAlignment = 'center'
      if (props.variant === 'announcement') {
        contentType =
          (s.settings?.widget as AnnouncementWidgetType)
            .infoSettings
            .contentType
          ?? (props.defaults as AnnouncementWidgetType)
            .infoSettings
            .contentType
        contentAlignment =
          (s.settings?.widget as AnnouncementWidgetType)
            .infoSettings
            .contentAlignment
          ?? (props.defaults as AnnouncementWidgetType)
            .infoSettings
            .contentAlignment!
      }

      return {
        contentType: contentType,
        contentAlignment: contentAlignment,

        contentUrl: settings.contentUrl
          ?? defaults.contentUrl,

        title: settings?.title
          ?? defaults.title,
        titleColor: settings?.titleColor
          ?? defaults.titleColor,
        description: settings?.description
          ?? defaults.description,
        descriptionColor: settings?.descriptionColor
          ?? defaults.descriptionColor,

        countdownEnabled: settings?.countdownEnabled
          ?? defaults.countdownEnabled,
        countdownDate: settings?.countdownDate
          ?? defaults.countdownDate,
        countdownFontColor: settings?.countdownFontColor
          ?? defaults.countdownFontColor,
        countdownBackgroundColor: settings?.countdownBackgroundColor
          ?? defaults.countdownBackgroundColor,
        
        buttonText: settings?.buttonText
          ?? defaults.buttonText,
        buttonFontColor: settings?.buttonFontColor
          ?? defaults.buttonFontColor,
        buttonBackgroundColor: settings?.buttonBackgroundColor
          ?? defaults.buttonBackgroundColor,
        icon: settings?.icon
          ?? defaults.icon,
        link: settings?.link
          ?? defaults.link,
      }
    })
  )

  const setContentType = useWidgetSettingsStore(
    s => s.setAnnouncementContentType
  )
  const setContentAlignment = useWidgetSettingsStore(
    s => s.setAnnouncementContentAlignment
  )
  const setContentUrl = useWidgetSettingsStore(
    s => s.setAnnouncementContentUrl
  )

  const setInfoScreenTitle = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenTitle
  )
  const setInfoScreenTitleFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenTitleFontWeight
  )
  const setInfoScreenTitleColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenTitleColor
  )
  const setInfoScreenDescription = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenDescription
  )
  const setInfoScreenDescriptionFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenDescriptionFontWeight
  )
  const setInfoScreenDescriptionColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenDescriptionColor
  )

  const setInfoScreenCountdownEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenCountdownEnabled
  )
  const setInfoScreenCountdownDate = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenCountdownDate
  )
  const setInfoScreenCountdownFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenCountdownFontColor
  )
  const setInfoScreenCountdownBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenCountdownBackgroundColor
  )

  const setInfoScreenButtonText = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenButtonText
  )
  const setInfoScreenButtonFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenButtonFontColor
  )
  const setInfoScreenButtonBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenButtonBackgroundColor
  )
  const setInfoScreenButtonIcon = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenIcon
  )
  const setInfoScreenButtonLink = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenLink
  )

  const handleCountdownDateChange = (value: ZonedDateTime | null) => {
    if (!value) {
      return
    }
    setInfoScreenCountdownDate(value.toAbsoluteString())
  }

  return (
    <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Окно информации
      </h1>
      
      <ContentSettings
        format={props.variant}
        contentType={contentType}
        contentAlignment={contentAlignment}
        contentUrl={contentUrl}
        onContentTypeChange={setContentType}
        onContentAlignmentChange={setContentAlignment}
        onContentUrlChange={setContentUrl}
      />

      <BorderedContainer>
        <div className='w-full flex flex-col'>
          <TextSettings
            text={title}
            textColor={titleColor}
            title='Заголовок'
            placeholder='Укажите заголовок'
            onTextChange={setInfoScreenTitle}
            onFontWeightChange={setInfoScreenTitleFontWeight}
            onColorChange={setInfoScreenTitleColor}
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
            onTextChange={setInfoScreenDescription}
            onFontWeightChange={setInfoScreenDescriptionFontWeight}
            onColorChange={setInfoScreenDescriptionColor}
          />
        </div>
      </BorderedContainer>

      {props.variant === 'countdown' &&  <CountdownSettings
        enabled={countdownEnabled}
        onToggle={setInfoScreenCountdownEnabled}
        date={
          countdownDate
            ? parseAbsoluteToLocal(countdownDate)
            : parseAbsoluteToLocal(new Date().toISOString())
        }
        onDateChange={handleCountdownDateChange}
        backgroundColor={countdownBackgroundColor}
        onBackgroundColorChange={setInfoScreenCountdownBackgroundColor}
        fontColor={countdownFontColor}
        onFontColorChange={setInfoScreenCountdownFontColor}
      />}

      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <h2 className='text-[16px] leading-4.75'>Кнопка</h2>
          <ButtonAppearenceSettings
            onTriggerTextChange={setInfoScreenButtonText}
            onTriggerIconChange={setInfoScreenButtonIcon}
            onFontColorChange={setInfoScreenButtonFontColor}
            onBackgroundColorChange={setInfoScreenButtonBackgroundColor}
            buttonText={buttonText}
            buttonTextColor={buttonFontColor}
            buttonBackgroundColor={buttonBackgroundColor}
            buttonIcon={icon}
          />

          <h2 className='text-[16px] leading-4.75'>Ссылка</h2>
            <Input
              value={link}
              onValueChange={setInfoScreenButtonLink}
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
        </div>
      </BorderedContainer>
    </div>
  )
}

export default InfoSettings
