import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  contactAcquisitionEnabledChanged,
  emailFieldEnabledChanged,
  emailFieldRequiredChanged,
  nameFieldEnabledChanged,
  nameFieldRequiredChanged,
  phoneFieldEnabledChanged,
  phoneFieldRequiredChanged,
  selectContactAcquisitionEnabled,
  selectEmailFieldEnabled,
  selectEmailFieldRequired,
  selectNameFieldEnabled,
  selectNameFieldRequired,
  selectPhoneFieldEnabled,
  selectPhoneFieldRequired,
} from '../actionTimerSlice'

export const useContactAcquisitionSettings = () => {
  const contactAcquisitionEnabled =
    useAppSelector(selectContactAcquisitionEnabled)
  const nameFieldEnabled =
    useAppSelector(selectNameFieldEnabled)
  const nameFieldRequired =
    useAppSelector(selectNameFieldRequired)
  const emailFieldEnabled =
    useAppSelector(selectEmailFieldEnabled)
  const emailFieldRequired =
    useAppSelector(selectEmailFieldRequired)
  const phoneFieldEnabled =
    useAppSelector(selectPhoneFieldEnabled)
  const phoneFieldRequired =
    useAppSelector(selectPhoneFieldRequired)

  const dispatch = useAppDispatch()

  const onContactAcquisitionToggle = (value: boolean) => {
    dispatch(contactAcquisitionEnabledChanged(value))
  }
  const onNameFieldEnabledChange = (value: boolean) => {
    dispatch(nameFieldEnabledChanged(value))
  }
  const onNameFieldRequiredChange = (value: boolean) => {
    dispatch(nameFieldRequiredChanged(value))
  }
  const onEmailFieldEnabledChange = (value: boolean) => {
    dispatch(emailFieldEnabledChanged(value))
  }
  const onEmailFieldRequiredChange = (value: boolean) => {
    dispatch(emailFieldRequiredChanged(value))
  }
  const onPhoneFieldEnabledChange = (value: boolean) => {
    dispatch(phoneFieldEnabledChanged(value))
  }
  const onPhoneFieldRequiredChange = (value: boolean) => {
    dispatch(phoneFieldRequiredChanged(value))
  }

  return {
    contactAcquisitionEnabled,
    nameFieldEnabled,
    nameFieldRequired,
    emailFieldEnabled,
    emailFieldRequired,
    phoneFieldEnabled,
    phoneFieldRequired,
    onContactAcquisitionToggle,
    onNameFieldEnabledChange,
    onNameFieldRequiredChange,
    onEmailFieldEnabledChange,
    onEmailFieldRequiredChange,
    onPhoneFieldEnabledChange,
    onPhoneFieldRequiredChange,
  }
}