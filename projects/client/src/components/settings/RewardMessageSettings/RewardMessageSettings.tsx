import SwitchableField from '@/components/SwitchableField'
import TextSettings from '@/components/TextSettings'
import RewardScreenColors from './RewardScreenColors'

import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

type RewardMessageSettingssProps = {
  rewardScreenEnabled: boolean,
  title: string
  titleFontSize: number
  titleFontWeight: FontWeight
  titleFontColor: string
  description: string
  descriptionFontSize: number
  descriptionFontWeight: FontWeight
  descriptionFontColor: string
  discount: string
  discountFontSize: number
  discountFontWeight: FontWeight
  discountFontColor: string
  promo: string
  promoFontSize: number
  promoFontWeight: FontWeight
  promoFontColor: string
  customColorSchemeEnabled: boolean
  customDiscountBackgroundColor: string
  customPromoBackgroundColor: string
  setRewardScreenEnabled: (enabled: boolean) => void
  setTitle: (title: string) => void
  setTitleFontSize: (titleFontSize: number) => void
  setTitleFontWeight: (weight: FontWeight) => void
  setTitleFontColor: (titleFontColor: string) => void
  setDescription: (description: string) => void
  setDescriptionFontSize: (descriptionFontSize: number) => void
  setDescriptionFontWeight: (weight: FontWeight) => void
  setDescriptionFontColor: (descriptionFontColor: string) => void
  setDiscount: (discount: string) => void
  setDiscountFontSize: (discountFontSize: number) => void
  setDiscountFontWeight: (weight: FontWeight) => void
  setDiscountFontColor: (discountFontColor: string) => void
  setPromo: (promo: string) => void
  setPromoFontSize: (promoFontSize: number) => void
  setPromoFontWeight: (weight: FontWeight) => void
  setPromoFontColor: (promoFontColor: string) => void
  setCustomColorSchemeEnabled: (customColorSchemeEnabled: boolean) => void
  setCustomDiscountBackgroundColor: (
    customDiscountBackgroundColor: string
  ) => void
  setCustomPromoBackgroundColor: (customPromoBackgroundColor: string) => void
}

const RewardMessageSettings = (props: RewardMessageSettingssProps) => {
  const {
    rewardScreenEnabled,

    title,
    titleFontSize,
    titleFontColor,

    description,
    descriptionFontSize,
    descriptionFontColor,

    discount,
    discountFontSize,
    discountFontColor,

    promo,
    promoFontSize,
    promoFontColor,

    customColorSchemeEnabled,
    customDiscountBackgroundColor,
    customPromoBackgroundColor,
  } = props

  return (
    <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Настройки сообщений
      </h1>

      <SwitchableField
        title='Текст при выигрыше'
        enabled={rewardScreenEnabled}
        onToggle={props.setRewardScreenEnabled}
        classNames={{
          title: 'text-[16px] leading-4.75 font-normal',
        }}
      >
        <div className='w-full flex flex-col gap-2.5'>
          <TextSettings
            title='Заголовок'
            text={title}
            onTextChange={props.setTitle}
            fontSize={titleFontSize}
            onFontSizeChange={props.setTitleFontSize}
            onFontWeightChange={props.setTitleFontWeight}
            textColor={titleFontColor}
            onColorChange={props.setTitleFontColor}
            placeholder='Ура! Вы выиграли'
          />
          <TextSettings
            title='Описание'
            text={description}
            onTextChange={props.setDescription}
            fontSize={descriptionFontSize}
            onFontSizeChange={props.setDescriptionFontSize}
            onFontWeightChange={props.setDescriptionFontWeight}
            textColor={descriptionFontColor}
            onColorChange={props.setDescriptionFontColor}
            placeholder='Поздравляем! Вы выиграли, заберите Ваш приз!'
          />
          <TextSettings
            title='Скидка'
            text={discount}
            onTextChange={props.setDiscount}
            fontSize={discountFontSize}
            onFontSizeChange={props.setDiscountFontSize}
            onFontWeightChange={props.setDiscountFontWeight}
            textColor={discountFontColor}
            onColorChange={props.setDiscountFontColor}
            placeholder='Ваша скидка 10%'
          />
          <TextSettings
            title='Промокод'
            text={promo}
            onTextChange={props.setPromo}
            fontSize={promoFontSize}
            onFontSizeChange={props.setPromoFontSize}
            onFontWeightChange={props.setPromoFontWeight}
            textColor={promoFontColor}
            onColorChange={props.setPromoFontColor}
            placeholder='TNF2026'
          />
          
          <RewardScreenColors
            enabled={customColorSchemeEnabled}
            onToggle={props.setCustomColorSchemeEnabled}
            discountBackgroundColor={customDiscountBackgroundColor}
            onDiscountBackgrounfColorChange={
              props.setCustomDiscountBackgroundColor
            }
            promoBackgroundColor={customPromoBackgroundColor}
            onPromoBackgroundColorChange={props.setCustomPromoBackgroundColor}
          />
        </div>
      </SwitchableField>
    </div>
  )
}

export default RewardMessageSettings
