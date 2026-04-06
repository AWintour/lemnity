import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectFormTitle,
  selectFormTitleFontColor,
  selectFormDescription,
  selectFormDescriptionFontColor,
  selectFormContactAcquisitionEnabled,
  selectFormNameFieldEnabled,
  selectFormNameFieldRequired,
  selectFormEmailFieldEnabled,
  selectFormEmailFieldRequired,
  selectFormPhoneFieldEnabled,
  selectFormPhoneFieldRequired,
  selectFormAgreement,
  selectFormAdsInfo,

  formTitleChanged,
  formTitleFontWeightChanged,
  formTitleFontColorChanged,
  formDescriptionChanged,
  formDescriptionFontWeightChanged,
  formDescriptionFontColorChanged,
  formContactacquisitionEnabledChanged,
  formNameFieldEnabledChanged,
  formNameFieldRequiredChanged,
  formEmailFieldEnabledChanged,
  formEmailFieldRequiredChanged,
  formPhoneFieldEnabledChanged,
  formPhoneFieldRequiredChanged,
  formAgreementEnabledChanged,
  formAgreementPolicyURLChanged,
  formAgreementURLChanged,
  formAgreementColorChanged,
  formAdsInfoEnabledChanged,
  formAdsInfoPolicyURLChanged,
  formAdsInfoColorChanged,
} from '../eventTimerSlice'
import type { FontWeight } from '@lemnity/widget-config/widgets/event-timer'

export const useFormScreenSettings = () => {
  const title =
    useAppSelector(selectFormTitle)
  const titleFontColor =
    useAppSelector(selectFormTitleFontColor)
  const description =
    useAppSelector(selectFormDescription)
  const descriptionFontColor =
    useAppSelector(selectFormDescriptionFontColor)
  const contactAcquisitionEnabled =
    useAppSelector(selectFormContactAcquisitionEnabled)
  const nameFieldEnabled =
    useAppSelector(selectFormNameFieldEnabled)
  const nameFieldRequired =
    useAppSelector(selectFormNameFieldRequired)
  const emailFieldEnabled =
    useAppSelector(selectFormEmailFieldEnabled)
  const emailFieldRequired =
    useAppSelector(selectFormEmailFieldRequired)
  const phoneFieldEnabled =
    useAppSelector(selectFormPhoneFieldEnabled)
  const phoneFieldRequired =
    useAppSelector(selectFormPhoneFieldRequired)
  const agreement =
    useAppSelector(selectFormAgreement)
  const adsInfo =
    useAppSelector(selectFormAdsInfo)

  const dispatch = useAppDispatch()

  const setFormScreenTitle = (title: string) => {
    dispatch(formTitleChanged(title))
  }
  const setFormScreenTitleFontWeight = (weight: FontWeight) => {
    dispatch(formTitleFontWeightChanged(weight))
  }
  const setFormScreenTitleFontColor = (color: string) => {
    dispatch(formTitleFontColorChanged(color))
  }
  const setFormScreenDescription = (description: string) => {
    dispatch(formDescriptionChanged(description))
  }
  const setFormScreenDescriptionFontWeight = (weight: FontWeight) => {
    dispatch(formDescriptionFontWeightChanged(weight))
  }
  const setFormScreenDescriptionFontColor = (color: string) => {
    dispatch(formDescriptionFontColorChanged(color))
  }
  const setFormScreenContactAcquisitionEnabled = (enabled: boolean) => {
    dispatch(formContactacquisitionEnabledChanged(enabled))
  }
  const setFormScreenNameFieldEnabled = (enabled: boolean) => {
    dispatch(formNameFieldEnabledChanged(enabled))
  }
  const setFormScreenNameFieldRequired = (required: boolean) => {
    dispatch(formNameFieldRequiredChanged(required))
  }
  const setFormScreenEmailFieldEnabled = (enabled: boolean) => {
    dispatch(formEmailFieldEnabledChanged(enabled))
  }
  const setFormScreenEmailFieldRequired = (required: boolean) => {
    dispatch(formEmailFieldRequiredChanged(required))
  }
  const setFormScreenPhoneFieldEnabled = (enabled: boolean) => {
    dispatch(formPhoneFieldEnabledChanged(enabled))
  }
  const setFormScreenPhoneFieldRequired = (required: boolean) => {
    dispatch(formPhoneFieldRequiredChanged(required))
  }
  const setAgreementEnabled = (enabled: boolean) => {
    dispatch(formAgreementEnabledChanged(enabled))
  }
  const setAgreementPolicyUrl = (url: string) => {
    dispatch(formAgreementPolicyURLChanged(url))
  }
  const setAgreementUrl = (url: string) => {
    dispatch(formAgreementURLChanged(url))
  }
  const setAgreementColor = (color: string) => {
    dispatch(formAgreementColorChanged(color))
  }
  const setAdsInfoEnabled = (enabled: boolean) => {
    dispatch(formAdsInfoEnabledChanged(enabled))
  }
  const setAdsInfoPolicyUrl = (url: string) => {
    dispatch(formAdsInfoPolicyURLChanged(url))
  }
  const setAdsInfoColor = (color: string) => {
    dispatch(formAdsInfoColorChanged(color))
  }

  return {
    title,
    titleFontColor,
    description,
    descriptionFontColor,
    contactAcquisitionEnabled,
    nameFieldEnabled,
    nameFieldRequired,
    emailFieldEnabled,
    emailFieldRequired,
    phoneFieldEnabled,
    phoneFieldRequired,
    agreement,
    adsInfo,
    setFormScreenTitle,
    setFormScreenTitleFontWeight,
    setFormScreenTitleFontColor,
    setFormScreenDescription,
    setFormScreenDescriptionFontWeight,
    setFormScreenDescriptionFontColor,
    setFormScreenContactAcquisitionEnabled,
    setFormScreenNameFieldEnabled,
    setFormScreenNameFieldRequired,
    setFormScreenEmailFieldEnabled,
    setFormScreenEmailFieldRequired,
    setFormScreenPhoneFieldEnabled,
    setFormScreenPhoneFieldRequired,
    setAgreementEnabled,
    setAgreementPolicyUrl,
    setAgreementUrl,
    setAgreementColor,
    setAdsInfoEnabled,
    setAdsInfoPolicyUrl,
    setAdsInfoColor,
  }
}
