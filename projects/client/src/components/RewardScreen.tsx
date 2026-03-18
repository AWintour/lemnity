import type { CSSProperties } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import CompanyLogo from './CompanyLogo'
import { BrTagsOnNewlines } from './BrTagsOnNewlines'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { getFontWeightClass } from '../layouts/Widgets/EventTimer/utils/getFontWeightClass'

import type {
  AnnouncementWidgetType,
  RewardMessageSettings,
} from '@lemnity/widget-config/widgets/announcement'
import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'

type RewardScreenProps = {
  isAnnouncement?: boolean
  defaults: RewardMessageSettings
  companyLogoEnabled?: boolean
  companyLogo?: string
}

const RewardScreen = (props: RewardScreenProps) => {
  const {
    title,
    titleFontSize,
    titleFontWeight,
    titleFontColor,

    description,
    descriptionFontSize,
    descriptionFontWeight,
    descriptionFontColor,

    discount,
    discountFontSize,
    discountFontWeight,
    discountFontColor,

    promo,
    promoFontSize,
    promoFontWeight,
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

      return  {
        title: settings.title
          ?? props.defaults.title,
        titleFontSize: settings.titleFontSize
          ?? props.defaults.titleFontSize,
        titleFontWeight: settings.titleFontWeight
          ?? props.defaults.titleFontWeight,
        titleFontColor:
          settings.titleFontColor && settings.titleFontColor.length > 0
            ? settings.titleFontColor
            : props.defaults.titleFontColor,
        
        description: settings.description
          ?? props.defaults.description,
        descriptionFontSize: settings.descriptionFontSize
          ?? props.defaults.descriptionFontWeight,
        descriptionFontWeight: settings.descriptionFontWeight
          ?? props.defaults.descriptionFontWeight,
        descriptionFontColor:
          settings.descriptionFontColor && settings.descriptionFontColor.length > 0
            ? settings.descriptionFontColor
            : props.defaults.descriptionFontColor,

        discount: settings.discount
          ?? props.defaults.discount,
        discountFontSize: settings.discountFontSize
          ?? props.defaults.discountFontSize,
        discountFontWeight: settings.discountFontWeight
          ?? props.defaults.discountFontWeight,
        discountFontColor:
          settings.discountFontColor && settings.discountFontColor.length > 0
            ? settings.discountFontColor
            : props.defaults.discountFontColor,

        promo: settings.promo
          ?? props.defaults.promo,
        promoFontSize: settings.promoFontSize
          ?? props.defaults.promoFontSize,
        promoFontWeight: settings.promoFontWeight
          ?? props.defaults.promoFontWeight,
        promoFontColor:
          settings.promoFontColor && settings.promoFontColor.length > 0
            ? settings.promoFontColor
            : props.defaults.promoFontColor,

        customColorSchemeEnabled: settings.customColorSchemeEnabled
          ?? props.defaults.customColorSchemeEnabled,
        customDiscountBackgroundColor: settings.customDiscountBackgroundColor
          ?? props.defaults.customPromoBackgroundColor,
        customPromoBackgroundColor: settings.customPromoBackgroundColor
          ?? props.defaults.customPromoBackgroundColor,
      }
    })
  )

  const titleStyle: CSSProperties = {
    fontSize: titleFontSize,
    color: titleFontColor,
  }

  const descriptionStyle: CSSProperties = {
    fontSize: descriptionFontSize,
    color: descriptionFontColor,
  }

  const discountStyle: CSSProperties = {
    fontSize: discountFontSize,
    color: discountFontColor,
  }

  const promoStyle: CSSProperties = {
    fontSize: promoFontSize,
    color: promoFontColor,
  }

  return (
    <>
      <div className='w-42 h-9.5 mt-20.75'>
        {props.companyLogoEnabled && (
          <CompanyLogo
            black={props.isAnnouncement}
            companyLogo={props.companyLogo}
          />
        )}
      </div>

      <div
        className={cn(
          'w-full max-w-99.5 flex flex-col items-center justify-center',
          'mt-3.75 gap-3.75',
        )}
      >
        <span
          className={cn(
            'font-semibold text-[40px] leading-11.75 ',
            'transition-all duration-250',
            props.isAnnouncement ? 'text-black' : 'text-white',
            getFontWeightClass(titleFontWeight),
          )}
          style={titleStyle}
        >
          {/* Ваша скидка: */}
          <BrTagsOnNewlines input={title} />
        </span>

        <div
          className={cn(
            'h-11 bg-[#FFF57F] rounded-full py-0.75 min-w-62.25 max-w-full',
            'flex items-center justify-center transition-colors duration-250',
          )}
          style={{
            backgroundColor: customColorSchemeEnabled
              ? customDiscountBackgroundColor
              : undefined
          }}
        >
          <span
            className={cn(
              'text-[20px] leading-6 text-black ',
              'transition-all duration-250',
              getFontWeightClass(discountFontWeight),
            )}
            style={discountStyle}
          >
            {/* Скидка 10% */}
            {discount}
          </span>
        </div>

        <span
          className={cn(
            'text-[16px] leading-4.75 text-center',
            'transition-all duration-250',
            props.isAnnouncement ? 'text-black' : 'text-white',
            getFontWeightClass(descriptionFontWeight),
          )}
          style={descriptionStyle}
        >
          {/* Не забудьте использовать промокод во время оформления заказа! */}
          <BrTagsOnNewlines input={description} />
        </span>

        <div
          className={cn(
            'w-full p-4 flex flex-col items-center justify-center gap-1',
            'rounded-[3px] border border-dashed bg-[#0069FF]/59',
            'transition-colors duration-250',
            props.isAnnouncement ? 'border-black' : 'border-white',
          )}
          style={{
            backgroundColor: customColorSchemeEnabled
              ? customPromoBackgroundColor
              : undefined
          }}
        >
          <span
            className={cn(
              'text-[12px] leading-3.5',
              'transition-colors duration-250',
              props.isAnnouncement ? 'text-black' : 'text-white',
            )}
          >
            Промокод
          </span>
          <span
            className={cn(
              'font-semibold text-[25px] leading-7.5',
              'transition-all duration-250',
              props.isAnnouncement ? 'text-black' : 'text-white',
              getFontWeightClass(promoFontWeight),
            )}
            style={promoStyle}
          >
            {/* PROMO-10P */}
            {promo}
          </span>
        </div>
      </div>
    </>
  )
}

export default RewardScreen
