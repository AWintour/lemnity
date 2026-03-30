// import { useShallow } from 'zustand/react/shallow'

// import SwitchableField from '@/components/SwitchableField'
// import TextSettings from '@/components/TextSettings'
// import RewardScreenColors from './RewardScreenColors'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

// import type {
//   AnnouncementWidgetType,
//   FontWeight,
// } from '@lemnity/widget-config/widgets/announcement'
// import type {
//   EventTimertWidgetType,
// } from '@lemnity/widget-config/widgets/event-timer'

// type RewardMessageSettingssProps = {
//   defaults: AnnouncementWidgetType | EventTimertWidgetType
//   setRewardScreenEnabled: (enabled: boolean) => void
//   setTitle: (title: string) => void
//   setTitleFontSize: (titleFontSize: number) => void
//   setTitleFontWeight: (weight: FontWeight) => void
//   setTitleFontColor: (titleFontColor: string) => void
//   setDescription: (description: string) => void
//   setDescriptionFontSize: (descriptionFontSize: number) => void
//   setDescriptionFontWeight: (weight: FontWeight) => void
//   setDescriptionFontColor: (descriptionFontColor: string) => void
//   setDiscount: (discount: string) => void
//   setDiscountFontSize: (discountFontSize: number) => void
//   setDiscountFontWeight: (weight: FontWeight) => void
//   setDiscountFontColor: (discountFontColor: string) => void
//   setPromo: (promo: string) => void
//   setPromoFontSize: (promoFontSize: number) => void
//   setPromoFontWeight: (weight: FontWeight) => void
//   setPromoFontColor: (promoFontColor: string) => void
//   setCustomColorSchemeEnabled: (customColorSchemeEnabled: boolean) => void
//   setCustomDiscountBackgroundColor: (
//     customDiscountBackgroundColor: string
//   ) => void
//   setCustomPromoBackgroundColor: (customPromoBackgroundColor: string) => void
// }

// const RewardMessageSettings = (props: RewardMessageSettingssProps) => {
//   const {
//     rewardScreenEnabled,

//     title,
//     titleFontSize,
//     titleFontColor,

//     description,
//     descriptionFontSize,
//     descriptionFontColor,

//     discount,
//     discountFontSize,
//     discountFontColor,

//     promo,
//     promoFontSize,
//     promoFontColor,

//     customColorSchemeEnabled,
//     customDiscountBackgroundColor,
//     customPromoBackgroundColor,
//   } = useWidgetSettingsStore(
//     useShallow(s => {
//       // a crutch because the store just works this way apparently
//       const settings =
//         (s.settings?.widget as AnnouncementWidgetType | EventTimertWidgetType)
//         .rewardMessageSettings
//       const defaults = props.defaults.rewardMessageSettings
      
//       return {
//         rewardScreenEnabled: settings.rewardScreenEnabled
//           ?? defaults.rewardScreenEnabled,

//         title: settings.title
//           ?? defaults.title,
//         titleFontSize: settings.titleFontSize
//           ?? defaults.titleFontSize,
//         titleFontColor: settings.titleFontColor
//           ?? defaults.titleFontColor,

//         description: settings.description
//           ?? defaults.description,
//         descriptionFontSize: settings.descriptionFontSize
//           ?? defaults.descriptionFontSize,
//         descriptionFontColor: settings.descriptionFontColor
//           ?? defaults.descriptionFontColor,

//         discount: settings.discount
//           ?? defaults.discount,
//         discountFontSize: settings.discountFontSize
//           ?? defaults.discountFontSize,
//         discountFontColor: settings.discountFontColor
//           ?? defaults.discountFontColor,

//         promo: settings.promo
//           ?? defaults.promo,
//         promoFontSize: settings.promoFontSize
//           ?? defaults.promoFontSize,
//         promoFontColor: settings.promoFontColor
//           ?? defaults.promoFontColor,

//         customColorSchemeEnabled: settings.customColorSchemeEnabled
//           ?? defaults.customColorSchemeEnabled,
//         customDiscountBackgroundColor: settings.customDiscountBackgroundColor
//           ?? defaults.customDiscountBackgroundColor,
//         customPromoBackgroundColor: settings.customPromoBackgroundColor
//           ?? defaults.customPromoBackgroundColor,
//       }
//     })
//   )
  
//   return (
//     <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
//       <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
//         Настройки сообщений
//       </h1>

//       <SwitchableField
//         title='Текст при выигрыше'
//         enabled={rewardScreenEnabled}
//         onToggle={props.setRewardScreenEnabled}
//         classNames={{
//           title: 'text-[16px] leading-4.75 font-normal',
//         }}
//       >
//         <div className='w-full flex flex-col gap-2.5'>
//           <TextSettings
//             title='Заголовок'
//             text={title}
//             onTextChange={props.setTitle}
//             fontSize={titleFontSize}
//             onFontSizeChange={props.setTitleFontSize}
//             onFontWeightChange={props.setTitleFontWeight}
//             textColor={titleFontColor}
//             onColorChange={props.setTitleFontColor}
//             placeholder='Ура! Вы выиграли'
//           />
//           <TextSettings
//             title='Описание'
//             text={description}
//             onTextChange={props.setDescription}
//             fontSize={descriptionFontSize}
//             onFontSizeChange={props.setDescriptionFontSize}
//             onFontWeightChange={props.setDescriptionFontWeight}
//             textColor={descriptionFontColor}
//             onColorChange={props.setDescriptionFontColor}
//             placeholder='Поздравляем! Вы выиграли, заберите Ваш приз!'
//           />
//           <TextSettings
//             title='Скидка'
//             text={discount}
//             onTextChange={props.setDiscount}
//             fontSize={discountFontSize}
//             onFontSizeChange={props.setDiscountFontSize}
//             onFontWeightChange={props.setDiscountFontWeight}
//             textColor={discountFontColor}
//             onColorChange={props.setDiscountFontColor}
//             placeholder='Ваша скидка 10%'
//           />
//           <TextSettings
//             title='Промокод'
//             text={promo}
//             onTextChange={props.setPromo}
//             fontSize={promoFontSize}
//             onFontSizeChange={props.setPromoFontSize}
//             onFontWeightChange={props.setPromoFontWeight}
//             textColor={promoFontColor}
//             onColorChange={props.setPromoFontColor}
//             placeholder='TNF2026'
//           />
          
//           <RewardScreenColors
//             enabled={customColorSchemeEnabled}
//             onToggle={props.setCustomColorSchemeEnabled}
//             discountBackgroundColor={customDiscountBackgroundColor}
//             onDiscountBackgrounfColorChange={
//               props.setCustomDiscountBackgroundColor
//             }
//             promoBackgroundColor={customPromoBackgroundColor}
//             onPromoBackgroundColorChange={props.setCustomPromoBackgroundColor}
//           />
//         </div>
//       </SwitchableField>
//     </div>
//   )
// }

// export default RewardMessageSettings
