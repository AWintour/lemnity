// import { cn } from '@heroui/theme'
// import { Input } from '@heroui/input'
// import { useShallow } from 'zustand/react/shallow'
// import {
//   parseAbsoluteToLocal,
//   ZonedDateTime,
// } from '@internationalized/date'

// import { ContentSettings } from '../'
// import CountdownSettings from './CountdownSettings'
// import TextSettings from '@/components/TextSettings'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import ButtonAppearenceSettings from '@/layouts/WidgetSettings/DisplaySettingsTab/ButtonAppearenceSettings/ButtonAppearenceSettings'

// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

// import type {
//   AnnouncementWidgetType,
//   Content,
//   ContentAlignment,
//   FontWeight,
//   Icon,
// } from '@lemnity/widget-config/widgets/announcement'
// import type {
//   EventTimertWidgetType,
// } from '@lemnity/widget-config/widgets/event-timer'

// type InfoSettingsProps = {
//   variant: 'countdown' | 'announcement'
//   defaults: AnnouncementWidgetType | EventTimertWidgetType
//   setContentType?: (contentType: Content) => void
//   setContentAlignment?: (alignment: ContentAlignment) => void
//   setContentEnabled?: (contentEnabled: boolean) => void
//   setContentUrl: (url: string | undefined) => void
//   setTitle: (title: string) => void
//   setTitleFontWeight: (weight: FontWeight) => void
//   setTitleColor: (titleColor: string) => void
//   setDescription: (description: string) => void
//   setDescriptionFontWeight: (weight: FontWeight) => void
//   setDescriptionColor: (descriptionColor: string) => void
//   setCountdownEnabled?: (countdownEnabled: boolean) => void
//   setCountdownDate?: (countdownDate: string) => void
//   setCountdownFontColor?: (countdownFontColor: string) => void
//   setCountdownBackgroundColor?: (
//     countdownBackgroundColor: string
//   ) => void
//   setButtonText: (buttonText: string) => void
//   setButtonFontColor: (buttonFontColor: string) => void
//   setButtonBackgroundColor: (buttonBackgroundColor: string) => void
//   setButtonIcon: (icon: Icon) => void
//   setButtonLink: (link: string) => void
// }

// const InfoSettings = (props: InfoSettingsProps) => {
//   const {
//     contentType,
//     contentAlignment,
//     contentUrl,

//     title,
//     titleColor,
//     description,
//     descriptionColor,

//     countdownEnabled,
//     countdownDate,
//     countdownFontColor,
//     countdownBackgroundColor,
    
//     buttonText,
//     buttonFontColor,
//     buttonBackgroundColor,
//     icon,
//     link,

//     rewardScreenEnabled,
//   } = useWidgetSettingsStore(
//     useShallow(s => {
//       // a crutch because the store just works this way apparently
//       const widget =
//         (s.settings?.widget as AnnouncementWidgetType | EventTimertWidgetType)
//       const settings = widget.infoSettings
//       const defaults = props.defaults.infoSettings
//       const isAnnouncement = s.settings?.widgetType === 'ANNOUNCEMENT'
      
//       let contentType: Content = 'imageOnTop'
//       let contentAlignment: ContentAlignment = 'center'
//       if (isAnnouncement) {
//         contentType =
//           (s.settings?.widget as AnnouncementWidgetType)
//             .infoSettings
//             .contentType
//           ?? (props.defaults as AnnouncementWidgetType)
//             .infoSettings
//             .contentType
//         contentAlignment =
//           (s.settings?.widget as AnnouncementWidgetType)
//             .infoSettings
//             .contentAlignment
//           ?? (props.defaults as AnnouncementWidgetType)
//             .infoSettings
//             .contentAlignment!
//       }

//       return {
//         contentType: contentType,
//         contentAlignment: contentAlignment,

//         contentUrl: settings.contentUrl
//           ?? defaults.contentUrl,

//         title: settings?.title
//           ?? defaults.title,
//         titleColor: settings?.titleColor
//           ?? defaults.titleColor,
//         description: settings?.description
//           ?? defaults.description,
//         descriptionColor: settings?.descriptionColor
//           ?? defaults.descriptionColor,

//         countdownEnabled: isAnnouncement
//           ? undefined
//           // @ts-expect-error this code will get nuked soon anyways
//           : settings?.countdownEnabled ?? defaults.countdownEnabled,
//         countdownDate: isAnnouncement
//           ? undefined
//           // @ts-expect-error this code will get nuked soon anyways
//           : settings?.countdownDate ?? defaults.countdownDate,
//         countdownFontColor: isAnnouncement
//           ? undefined
//           // @ts-expect-error this code will get nuked soon anyways
//           : settings?.countdownFontColor ?? defaults.countdownFontColor,
//         countdownBackgroundColor: isAnnouncement
//           ? undefined
//           // @ts-expect-error this code will get nuked soon anyways
//           : settings?.countdownBackgroundColor ?? defaults.countdownBackgroundColor,
        
//         buttonText: settings?.buttonText
//           ?? defaults.buttonText,
//         buttonFontColor: settings?.buttonFontColor
//           ?? defaults.buttonFontColor,
//         buttonBackgroundColor: settings?.buttonBackgroundColor
//           ?? defaults.buttonBackgroundColor,
//         icon: settings?.icon
//           ?? defaults.icon,
//         link: settings?.link
//           ?? defaults.link,
        
//         rewardScreenEnabled: widget.rewardMessageSettings.rewardScreenEnabled
//           ?? props.defaults.rewardMessageSettings.rewardScreenEnabled,
//       }
//     })
//   )

//   const showCountdownSettings =
//     props.variant === 'countdown'
//     && props.setCountdownEnabled
//     && props.setCountdownBackgroundColor
//     && props.setCountdownFontColor

//   const handleCountdownDateChange = (value: ZonedDateTime | null) => {
//     if (!value) {
//       return
//     }
//     props?.setCountdownDate?.(value.toAbsoluteString())
//   }

//   return (
//     <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
//       <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
//         Окно информации
//       </h1>
      
//       <ContentSettings
//         format={props.variant}
//         contentType={contentType}
//         contentAlignment={contentAlignment}
//         contentUrl={contentUrl}
//         onContentTypeChange={props.setContentType}
//         onContentToggle={props.setContentEnabled}
//         onContentAlignmentChange={props.setContentAlignment}
//         onContentUrlChange={props.setContentUrl}
//       />

//       <BorderedContainer>
//         <div className='w-full flex flex-col'>
//           <TextSettings
//             text={title}
//             textColor={titleColor}
//             title='Заголовок'
//             placeholder='Укажите заголовок'
//             onTextChange={props.setTitle}
//             onFontWeightChange={props.setTitleFontWeight}
//             onColorChange={props.setTitleColor}
//           />
//         </div>
//       </BorderedContainer>

//       <BorderedContainer>
//         <div className='w-full flex flex-col'>
//           <TextSettings
//             text={description}
//             textColor={descriptionColor}
//             title='Описание'
//             placeholder={
//               'Получите супер скидку до 30 % на покупку билета в АРТ КАФЕ.'
//             }
//             onTextChange={props.setDescription}
//             onFontWeightChange={props.setDescriptionFontWeight}
//             onColorChange={props.setDescriptionColor}
//           />
//         </div>
//       </BorderedContainer>

//       {/* Typescript only looks one level down */}
//       {showCountdownSettings
//        && <CountdownSettings
//             enabled={countdownEnabled}
//             onToggle={props.setCountdownEnabled!}
//             date={
//               countdownDate
//                 ? parseAbsoluteToLocal(countdownDate)
//                 : parseAbsoluteToLocal(new Date().toISOString())
//             }
//             onDateChange={handleCountdownDateChange}
//             backgroundColor={countdownBackgroundColor}
//             onBackgroundColorChange={props.setCountdownBackgroundColor!}
//             fontColor={countdownFontColor}
//             onFontColorChange={props.setCountdownFontColor!}
//           />}

//       <BorderedContainer>
//         <div className='w-full flex flex-col gap-2.5'>
//           <h2 className='text-[16px] leading-4.75'>Кнопка</h2>
//           <ButtonAppearenceSettings
//             onTriggerTextChange={props.setButtonText}
//             onTriggerIconChange={props.setButtonIcon}
//             onFontColorChange={props.setButtonFontColor}
//             onBackgroundColorChange={props.setButtonBackgroundColor}
//             buttonText={buttonText}
//             buttonTextColor={buttonFontColor}
//             buttonBackgroundColor={buttonBackgroundColor}
//             buttonIcon={icon}
//           />

//           {!rewardScreenEnabled && (
//             <>
//               <h2 className='text-[16px] leading-4.75'>Ссылка</h2>
//               <Input
//                 value={link}
//                 onValueChange={props.setButtonLink}
//                 placeholder={'lemnity.ru/ads'}
//                 classNames={{
//                   base: 'min-w-76 flex-1',
//                   inputWrapper: cn(
//                     'rounded-md border bg-white border-[#E8E8E8] rounded-[5px]',
//                     'shadow-none h-12.5 px-2.5',
//                   ),
//                   input: 'placeholder:text-[#AAAAAA] text-base'
//                 }}
//               />
//             </>
//           )}
//         </div>
//       </BorderedContainer>
//     </div>
//   )
// }

// export default InfoSettings
