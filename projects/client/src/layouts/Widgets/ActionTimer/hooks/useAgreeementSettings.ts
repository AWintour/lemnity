import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  agreementColorChanged,
  agreementEnabledChanged,
  agreementPolicyUrlChanged,
  agreementUrlChanged,
  selectAgreement,
} from '../actionTimerSlice'

export const useAgreeementSettings = () => {
  const variant: 'agreement' | 'advertisement' = 'agreement'
  const agreement =
    useAppSelector(selectAgreement)
  
  const dispatch = useAppDispatch()
  
  const onToggle = (value: boolean) => {
    dispatch(agreementEnabledChanged(value))
  }
  const onFontColorChange = (value: string) => {
    dispatch(agreementColorChanged(value))
  }
  const onAgreementUrlChange = (value: string) => {
    dispatch(agreementUrlChanged(value))
  }
  const onPolicyUrlChange = (value: string) => {
    dispatch(agreementPolicyUrlChanged(value))
  }

  return {
    variant,
    agreement,
    onToggle,
    onFontColorChange,
    onAgreementUrlChange,
    onPolicyUrlChange,
  }
}
