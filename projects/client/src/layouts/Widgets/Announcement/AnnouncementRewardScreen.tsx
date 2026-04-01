import { RewardScreen } from '@/components'

import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectRewardTitle,
  selectRewardTitleFontSize,
  selectRewardTitleFontWeight,
  selectRewardTitleFontColor,
  selectRewardDescription,
  selectRewardDescriptionFontSize,
  selectRewardDescriptionFontWeight,
  selectRewardDescriptionFontColor,
  selectRewardDiscount,
  selectRewardDiscountFontSize,
  selectRewardDiscountFontWeight,
  selectRewardDiscountFontColor,
  selectRewardPromo,
  selectRewardPromoFontSize,
  selectRewardPromoFontWeight,
  selectRewardPromoFontColor,
  selectRewardCustomColorSchemeEnabled,
  selectRewardCustomDiscountBackgroundColor,
  selectRewardCustomPromoBackgroundColor,
  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
} from './announcementSlice'
import useUrlImage from '@/hooks/useUrlImage'

const AnnouncementRewardScreen = () => {
  const rewardTitle =
    useAppSelector(selectRewardTitle)
  const rewardTitleFontSize =
    useAppSelector(selectRewardTitleFontSize)
  const rewardTitleFontWeight =
    useAppSelector(selectRewardTitleFontWeight)
  const rewardTitleFontColor =
    useAppSelector(selectRewardTitleFontColor)
  const rewardDescription =
    useAppSelector(selectRewardDescription)
  const rewardDescriptionFontSize =
    useAppSelector(selectRewardDescriptionFontSize)
  const rewardDescriptionFontWeight =
    useAppSelector(selectRewardDescriptionFontWeight)
  const rewardDescriptionFontColor =
    useAppSelector(selectRewardDescriptionFontColor)
  const rewardDiscount =
    useAppSelector(selectRewardDiscount)
  const rewardDiscountFontSize =
    useAppSelector(selectRewardDiscountFontSize)
  const rewardDiscountFontWeight =
    useAppSelector(selectRewardDiscountFontWeight)
  const rewardDiscountFontColor =
    useAppSelector(selectRewardDiscountFontColor)
  const rewardPromo =
    useAppSelector(selectRewardPromo)
  const rewardPromoFontSize =
    useAppSelector(selectRewardPromoFontSize)
  const rewardPromoFontWeight =
    useAppSelector(selectRewardPromoFontWeight)
  const rewardPromoFontColor =
    useAppSelector(selectRewardPromoFontColor)
  const rewardCustomColorSchemeEnabled =
    useAppSelector(selectRewardCustomColorSchemeEnabled)
  const rewardCustomDiscountBackgroundColor =
    useAppSelector(selectRewardCustomDiscountBackgroundColor)
  const rewardCustomPromoBackgroundColor =
    useAppSelector(selectRewardCustomPromoBackgroundColor)
  const companyLogoEnabled = 
    useAppSelector(selectCompanyLogoEnabled)
  const companyLogoUrl =
    useAppSelector(selectCompanyLogoUrl)

  const {
    base64Image: companyBase64Logo,
    // error,
    isLoading: isCompanyLogoLoading,
  } = useUrlImage(companyLogoUrl)

  const companyLogo = companyLogoUrl && !isCompanyLogoLoading
    ? companyBase64Logo as string
    : undefined

  return (
    <RewardScreen
      isAnnouncement
      companyLogoEnabled={companyLogoEnabled}
      companyLogo={companyLogo}
      title={rewardTitle}
      titleFontSize={rewardTitleFontSize}
      titleFontWeight={rewardTitleFontWeight}
      titleFontColor={rewardTitleFontColor}
      description={rewardDescription}
      descriptionFontSize={rewardDescriptionFontSize}
      descriptionFontWeight={rewardDescriptionFontWeight}
      descriptionFontColor={rewardDescriptionFontColor}
      discount={rewardDiscount}
      discountFontSize={rewardDiscountFontSize}
      discountFontWeight={rewardDiscountFontWeight}
      discountFontColor={rewardDiscountFontColor}
      promo={rewardPromo}
      promoFontSize={rewardPromoFontSize}
      promoFontWeight={rewardPromoFontWeight}
      promoFontColor={rewardPromoFontColor}
      customColorSchemeEnabled={rewardCustomColorSchemeEnabled}
      customDiscountBackgroundColor={
        rewardCustomDiscountBackgroundColor
      }
      customPromoBackgroundColor={
        rewardCustomPromoBackgroundColor
      }
    />
  )
}

export default AnnouncementRewardScreen
