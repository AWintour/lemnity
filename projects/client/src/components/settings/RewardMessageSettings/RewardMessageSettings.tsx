import { useShallow } from 'zustand/react/shallow'

import SwitchableField from '@/components/SwitchableField'
import TextSettings from '@/components/TextSettings'
import RewardScreenColors from './RewardScreenColors'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type {
  AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'
import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'

type RewardMessageSettingssProps = {
  defaults: AnnouncementWidgetType | EventTimertWidgetType
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
  } = useWidgetSettingsStore(
    useShallow(s => {
      // a crutch because the store just works this way apparently
      const settings =
        (s.settings?.widget as AnnouncementWidgetType | EventTimertWidgetType)
        .rewardMessageSettings
      const defaults = props.defaults.rewardMessageSettings
      
      return {
        rewardScreenEnabled: settings.rewardScreenEnabled
          ?? defaults.rewardScreenEnabled,

        title: settings.title
          ?? defaults.title,
        titleFontSize: settings.titleFontSize
          ?? defaults.titleFontSize,
        titleFontColor: settings.titleFontColor
          ?? defaults.titleFontColor,

        description: settings.description
          ?? defaults.description,
        descriptionFontSize: settings.descriptionFontSize
          ?? defaults.descriptionFontSize,
        descriptionFontColor: settings.descriptionFontColor
          ?? defaults.descriptionFontColor,

        discount: settings.discount
          ?? defaults.discount,
        discountFontSize: settings.discountFontSize
          ?? defaults.discountFontSize,
        discountFontColor: settings.discountFontColor
          ?? defaults.discountFontColor,

        promo: settings.promo
          ?? defaults.promo,
        promoFontSize: settings.promoFontSize
          ?? defaults.promoFontSize,
        promoFontColor: settings.promoFontColor
          ?? defaults.promoFontColor,

        customColorSchemeEnabled: settings.customColorSchemeEnabled
          ?? defaults.customColorSchemeEnabled,
        customDiscountBackgroundColor: settings.customDiscountBackgroundColor
          ?? defaults.customDiscountBackgroundColor,
        customPromoBackgroundColor: settings.customPromoBackgroundColor
          ?? defaults.customPromoBackgroundColor,
      }
    })
  )

  const setRewardScreenenabled = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenEnabled
  )
  
  const setRewardScreenTitle = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitle
  )
  const setRewardScreenTitleFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitleFontSize
  )
  const setRewardScreenTitleFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitleFontWeight
  )
  const setRewardScreenTitleFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitleFontColor
  )

  const setRewardScreenDescription = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescription
  )
  const setRewardScreenDescriptionFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescriptionFontSize
  )
  const setRewardScreenDescriptionFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescriptionFontWeight
  )
  const setRewardScreenDescriptionFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescriptionFontColor
  )

  const setRewardScreenDiscount = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscount
  )
  const setRewardScreenDiscountFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountFontSize
  )
  const setRewardScreenDiscountFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountFontWeight
  )
  const setRewardScreenDiscountFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountFontColor
  )

  const setRewardScreenPromo = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromo
  )
  const setRewardScreenPromoFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoFontSize
  )
  const setRewardScreenPromoFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoFontWeight
  )
  const setRewardScreenPromoFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoFontColor
  )

  const setRewardScreenCustomColorSchemeEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenCustomColorSchemeEnabled
  )
  const setRewardScreenCustomDiscountBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountBackgroundColor
  )
  const setRewardScreenCustomPromoBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoBackgroundColor
  )
  
  return (
    <div className="w-full min-w-85.5 flex flex-col gap-2.5">
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606]">
        Настройки сообщений
      </h1>

      <SwitchableField
        title="Текст при выигрыше"
        enabled={rewardScreenEnabled}
        onToggle={setRewardScreenenabled}
        classNames={{
          title: 'text-[16px] leading-4.75 font-normal',
        }}
      >
        <div className="w-full flex flex-col gap-2.5">
          <TextSettings
            title="Заголовок"
            text={title}
            onTextChange={setRewardScreenTitle}
            fontSize={titleFontSize}
            onFontSizeChange={setRewardScreenTitleFontSize}
            onFontWeightChange={setRewardScreenTitleFontWeight}
            textColor={titleFontColor}
            onColorChange={setRewardScreenTitleFontColor}
            placeholder="Ура! Вы выиграли"
          />
          <TextSettings
            title="Описание"
            text={description}
            onTextChange={setRewardScreenDescription}
            fontSize={descriptionFontSize}
            onFontSizeChange={setRewardScreenDescriptionFontSize}
            onFontWeightChange={setRewardScreenDescriptionFontWeight}
            textColor={descriptionFontColor}
            onColorChange={setRewardScreenDescriptionFontColor}
            placeholder="Поздравляем! Вы выиграли, заберите Ваш приз!"
          />
          <TextSettings
            title="Скидка"
            text={discount}
            onTextChange={setRewardScreenDiscount}
            fontSize={discountFontSize}
            onFontSizeChange={setRewardScreenDiscountFontSize}
            onFontWeightChange={setRewardScreenDiscountFontWeight}
            textColor={discountFontColor}
            onColorChange={setRewardScreenDiscountFontColor}
            placeholder="Ваша скидка 10%"
          />
          <TextSettings
            title="Промокод"
            text={promo}
            onTextChange={setRewardScreenPromo}
            fontSize={promoFontSize}
            onFontSizeChange={setRewardScreenPromoFontSize}
            onFontWeightChange={setRewardScreenPromoFontWeight}
            textColor={promoFontColor}
            onColorChange={setRewardScreenPromoFontColor}
            placeholder="TNF2026"
          />
          
          <RewardScreenColors
            enabled={customColorSchemeEnabled}
            onToggle={setRewardScreenCustomColorSchemeEnabled}
            discountBackgroundColor={customDiscountBackgroundColor}
            onDiscountBackgrounfColorChange={
              setRewardScreenCustomDiscountBackgroundColor
            }
            promoBackgroundColor={customPromoBackgroundColor}
            onPromoBackgroundColorChange={
              setRewardScreenCustomPromoBackgroundColor
            }
          />
        </div>
      </SwitchableField>
    </div>
  )
}

export default RewardMessageSettings
