import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  adsInfoColorChanged,
  adsInfoEnabledChanged,
  adsInfoPolicyUrlChanged,
  selectAdsInfo,
} from '../actionTimerSlice'

export const useAdsInfoSettings = () => {
  const variant: 'agreement' | 'advertisement' = 'advertisement'
  const agreement =
    useAppSelector(selectAdsInfo)
  
  const dispatch = useAppDispatch()
  
  const onToggle = (value: boolean) => {
    dispatch(adsInfoEnabledChanged(value))
  }
  const onFontColorChange = (value: string) => {
    dispatch(adsInfoColorChanged(value))
  }
  const onPolicyUrlChange = (value: string) => {
    dispatch(adsInfoPolicyUrlChanged(value))
  }

  return {
    variant,
    agreement,
    onToggle,
    onFontColorChange,
    onPolicyUrlChange,
  }
}
