import {
  useState,
  type CSSProperties,
  type Ref,
} from 'react'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import SvgIcon from '@/components/SvgIcon'
import FreePlanBrandingLink from '@/components/FreePlanBrandingLink'
import CountdownScreen from './CountdownScreen'
import EventTimerFormScreen, {
  type CountdownForm,
} from './EventTimerFormScreen'
import EventTimerRewardScreen from './EventTimerRewardScreen'

import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { useViewportWidth } from '@/hooks/useViewportWidth'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
  selectBrandingEnabled,
} from './eventTimerSlice'
import { useMobileContext } from './embedded/MobileContext'
import useUrlImageOrDefault from '../../../hooks/useUrlImage'

import crossIcon from '@/assets/icons/cross.svg'

export type EventTimerWidgetVariant = 'countdown' | 'form' | 'reward'

type EventTimerWidgetProps = {
  ref?: Ref<HTMLDivElement>
  variant?: EventTimerWidgetVariant
  focused?: boolean
  containerStyle: CSSProperties
  onCountdownScreenButtonPress?: () => void
  onFormScreenButtonPress?: (formData: CountdownForm) => void
}

const EventTimerWidget = (
  { ref, ...props }: EventTimerWidgetProps
) => {
  const companyLogoEnabled = useAppSelector(selectCompanyLogoEnabled)
  const companyLogoUrl = useAppSelector(selectCompanyLogoUrl)
  const brandingEnabled = useAppSelector(selectBrandingEnabled)

  const {
    base64Image: companyBase64Logo,
    // error,
    isLoading,
  } = useUrlImageOrDefault(companyLogoUrl)

  const companyLogo = companyLogoUrl && !isLoading
    ? companyBase64Logo as string
    : undefined
  
  const [hidden, setHidden] = useState(false)

  const mobile = useIsMobileViewport()
  const mobileContext = useMobileContext()
  const width = useViewportWidth()

  const mobileScale = width >= 398
    ? undefined
    // 2 20 px margins on x axis = 40 px
    // the width of the widget is w-99.5 = 398
    // 1% of 398 = 3.98
    : Math.floor((width - 40) / 3.98)

  const handleCloseButtonPress = () => {
    if (mobile && mobileContext) {
      mobileContext.dispatch({ type: 'close' })
      return
    }
    setHidden(true)
  }

  return (
    <div
      ref={ref}
      className={cn(
        'w-99.5 min-h-129.5 px-9 rounded-2xl',
        'flex flex-col items-center relative',
        'bg-[#725DFF] transition-colors duration-150',
        hidden && 'hidden',
      )}
      style={{
        ...props.containerStyle,
        transform: mobile && mobileScale
          ? `scale(${mobileScale}%)`
          : undefined,
      }}
    >
      <Button
        className={cn(
          'min-w-12 w-12 h-8.5 top-4.5 right-4.5 rounded-[5px]',
          'bg-white px-0 absolute justify-center items-center',
          'pointer-events-auto',
          props.focused || mobile ? 'flex' : 'hidden group-hover:flex',
        )}
        onPress={handleCloseButtonPress}
      >
        <div className='w-4 h-4 fill-black'>
          <SvgIcon src={crossIcon} alt='Close' />
        </div>
      </Button>

      {props.variant === 'countdown' && (
        <CountdownScreen
          companyLogoEnabled={companyLogoEnabled}
          companyLogo={companyLogo}
          onCountdownScreenButtonPress={props.onCountdownScreenButtonPress}
        />
      )}
      {props.variant === 'form' && (
        <EventTimerFormScreen
          companyLogoEnabled={companyLogoEnabled}
          companyLogo={companyLogo}
          onFormScreenButtonPress={props.onFormScreenButtonPress}
        />
      )}
      {props.variant === 'reward' && (
        <EventTimerRewardScreen />
      )}

      {brandingEnabled
        ? <div
            className={cn(
              'mt-auto mb-4 pt-4 flex',
            )}
          >
            <FreePlanBrandingLink color='#FFFFFF' />
          </div>
        : <div
          className={cn(
            'h-3 mt-auto mb-4 pt-4 bg-transparent',
          )}
        />
      }
    </div>
  )
}

export default EventTimerWidget