import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectRewardScreenEnabled,
  selectRewardTitle,
  selectRewardTitleFontSize,
  selectTitleFontWeight,
  selectRewardTitleFontColor,
  selectRewardDescription,
  selectRewardDescriptionFontSize,
  selectDescriptionFontWeight,
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

  rewardScreenEnabledChanged,
  rewardTitleChanged,
  rewardTitleFontSizeChanged,
  rewardTitleFontWeightChanged,
  rewardTitleFontColorChanged,
  rewardDescriptionChanged,
  rewardDescriptionFontSizeChanged,
  rewardDescriptionFontWeightChanged,
  rewardDescriptionFontColorChanged,
  rewardDiscountChanged,
  rewardDiscountFontSizeChanged,
  rewardDiscountFontWeightChanged,
  rewardDiscountFontColorChanged,
  rewardPromoChanged,
  rewardPromoFontSizeChanged,
  rewardPromoFontWeightChanged,
  rewardPromoFontColorChanged,
  rewardCustomColorSchemeEnabledChanged,
  rewardCustomDiscountBackgroundColorChanged,
  rewardCustomPromoBackgroundColorChanged,
} from '../eventTimerSlice'
import type { FontWeight } from '@lemnity/widget-config/widgets/event-timer'

export const useRewardScreenSettings = () => {
  const rewardScreenEnabled =
    useAppSelector(selectRewardScreenEnabled)
  const title =
    useAppSelector(selectRewardTitle)
  const titleFontSize =
    useAppSelector(selectRewardTitleFontSize)
  const titleFontWeight =
    useAppSelector(selectTitleFontWeight)
  const titleFontColor =
    useAppSelector(selectRewardTitleFontColor)
  const description =
    useAppSelector(selectRewardDescription)
  const descriptionFontSize =
    useAppSelector(selectRewardDescriptionFontSize)
  const descriptionFontWeight =
    useAppSelector(selectDescriptionFontWeight)
  const descriptionFontColor =
    useAppSelector(selectRewardDescriptionFontColor)
  const discount =
    useAppSelector(selectRewardDiscount)
  const discountFontSize =
    useAppSelector(selectRewardDiscountFontSize)
  const discountFontWeight =
    useAppSelector(selectRewardDiscountFontWeight)
  const discountFontColor =
    useAppSelector(selectRewardDiscountFontColor)
  const promo =
    useAppSelector(selectRewardPromo)
  const promoFontSize =
    useAppSelector(selectRewardPromoFontSize)
  const promoFontWeight =
    useAppSelector(selectRewardPromoFontWeight)
  const promoFontColor =
    useAppSelector(selectRewardPromoFontColor)
  const customColorSchemeEnabled =
    useAppSelector(selectRewardCustomColorSchemeEnabled)
  const customDiscountBackgroundColor =
    useAppSelector(selectRewardCustomDiscountBackgroundColor)
  const customPromoBackgroundColor =
    useAppSelector(selectRewardCustomPromoBackgroundColor)
  
  const dispatch = useAppDispatch()

  const setRewardScreenEnabled = (enabled: boolean) => {
    dispatch(rewardScreenEnabledChanged(enabled))
  }
  const setTitle = (title: string) => {
    dispatch(rewardTitleChanged(title))
  }
  const setTitleFontSize = (titleFontSize: number) => {
    dispatch(rewardTitleFontSizeChanged(titleFontSize))
  }
  const setTitleFontWeight = (weight: FontWeight) => {
    dispatch(rewardTitleFontWeightChanged(weight))
  }
  const setTitleFontColor = (titleFontColor: string) => {
    dispatch(rewardTitleFontColorChanged(titleFontColor))
  }
  const setDescription = (description: string) => {
    dispatch(rewardDescriptionChanged(description))
  }
  const setDescriptionFontSize = (descriptionFontSize: number) => {
    dispatch(rewardDescriptionFontSizeChanged(descriptionFontSize))
  }
  const setDescriptionFontWeight = (weight: FontWeight) => {
    dispatch(rewardDescriptionFontWeightChanged(weight))
  }
  const setDescriptionFontColor = (descriptionFontColor: string) => {
    dispatch(rewardDescriptionFontColorChanged(descriptionFontColor))
  }
  const setDiscount = (discount: string) => {
    dispatch(rewardDiscountChanged(discount))
  }
  const setDiscountFontSize = (discountFontSize: number) => {
    dispatch(rewardDiscountFontSizeChanged(discountFontSize))
  }
  const setDiscountFontWeight = (weight: FontWeight) => {
    dispatch(rewardDiscountFontWeightChanged(weight))
  }
  const setDiscountFontColor = (discountFontColor: string) => {
    dispatch(rewardDiscountFontColorChanged(discountFontColor))
  }
  const setPromo = (promo: string) => {
    dispatch(rewardPromoChanged(promo))
  }
  const setPromoFontSize = (promoFontSize: number) => {
    dispatch(rewardPromoFontSizeChanged(promoFontSize))
  }
  const setPromoFontWeight = (weight: FontWeight) => {
    dispatch(rewardPromoFontWeightChanged(weight))
  }
  const setPromoFontColor = (promoFontColor: string) => {
    dispatch(rewardPromoFontColorChanged(promoFontColor))
  }
  const setCustomColorSchemeEnabled = (customColorSchemeEnabled: boolean) => {
    dispatch(rewardCustomColorSchemeEnabledChanged(customColorSchemeEnabled))
  }
  const setCustomDiscountBackgroundColor = (
    customDiscountBackgroundColor: string
  ) => {
    dispatch(rewardCustomDiscountBackgroundColorChanged(
      customDiscountBackgroundColor
    ))
  }
  const setCustomPromoBackgroundColor = (
    customPromoBackgroundColor: string
  ) => {
    dispatch(rewardCustomPromoBackgroundColorChanged(
      customPromoBackgroundColor
    ))
  }

  return {
    rewardScreenEnabled,
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

    setRewardScreenEnabled,
    setTitle,
    setTitleFontSize,
    setTitleFontWeight,
    setTitleFontColor,
    setDescription,
    setDescriptionFontSize,
    setDescriptionFontWeight,
    setDescriptionFontColor,
    setDiscount,
    setDiscountFontSize,
    setDiscountFontWeight,
    setDiscountFontColor,
    setPromo,
    setPromoFontSize,
    setPromoFontWeight,
    setPromoFontColor,
    setCustomColorSchemeEnabled,
    setCustomDiscountBackgroundColor,
    setCustomPromoBackgroundColor,
  }
}