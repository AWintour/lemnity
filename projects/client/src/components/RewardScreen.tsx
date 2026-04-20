import type { CSSProperties } from 'react'
import { cn } from '@heroui/theme'

import CompanyLogo from './CompanyLogo'
import { BrTagsOnNewlines } from './BrTagsOnNewlines'

import { getFontWeightClass } from './utils/getFontWeightClass'

import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

type RewardScreenProps = {
  variant: 'announcement' | 'eventTimer' | 'actionTimer'
  companyLogoEnabled?: boolean
  companyLogo?: string

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

  customColorSchemeEnabled?: boolean
  customDiscountBackgroundColor?: string
  customPromoBackgroundColor?: string
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
    variant,
  } = props

  const isAnnouncement = variant === 'announcement'
  const isActionTimer = variant === 'actionTimer'

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
      {!isActionTimer && (
        <div className={'w-42 h-9.5 mt-20.75'}>
          {props.companyLogoEnabled && (
            <CompanyLogo
              black={isAnnouncement}
              companyLogo={props.companyLogo}
            />
          )}
        </div>
      )}

      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'mt-3.75 gap-3.75',
          isActionTimer
            ? 'h-full'
            : 'max-w-99.5 w-full',
        )}
      >
        <span
          className={cn(
            'font-semibold text-[40px] leading-11.75 ',
            'transition-all duration-250',
            isAnnouncement ? 'text-black' : 'text-white',
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
            isAnnouncement ? 'text-black' : 'text-white',
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
            isAnnouncement ? 'border-black' : 'border-white',
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
              isAnnouncement ? 'text-black' : 'text-white',
            )}
          >
            Промокод
          </span>
          <span
            className={cn(
              'font-semibold text-[25px] leading-7.5',
              'transition-all duration-250',
              isAnnouncement ? 'text-black' : 'text-white',
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
