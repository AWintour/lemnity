import { useEffect, useState, type CSSProperties } from 'react'
import { cn } from '@heroui/theme'
import { Button } from '@heroui/button'
import { DateTime } from 'luxon'

import {
  CompanyLogo,
  CountdownTimer,
  BrTagsOnNewlines,
} from '@/components'
import * as Icons from '@/components/Icons'

import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectTitle,
  selectTitleFontWeight,
  selectTitleColor,
  selectDescription,
  selectDescriptionFontWeight,
  selectDescriptionColor,
  selectCountdownDate,
  selectCountdownEnabled,
  selectCountdownBackgroundColor,
  selectCountdownFontColor,
  selectButtonText,
  selectButtonFontColor,
  selectButtonBackgroundColor,
  selectIcon,
  selectLink,
  selectRewardScreenEnabled,
  initialState,
} from './eventTimerSlice'

import { getFontWeightClass } from './utils/getFontWeightClass'

type CountdownScreenProps = {
  companyLogoEnabled: boolean
  companyLogo?: string
  onCountdownScreenButtonPress?: () => void
}

const CountdownScreen = (props: CountdownScreenProps) => {
  const title =
    useAppSelector(selectTitle)
  const titleFontWeight =
    useAppSelector(selectTitleFontWeight)
  const titleColor =
    useAppSelector(selectTitleColor)
      || initialState.infoSettings.titleColor
  const description =
    useAppSelector(selectDescription)
  const descriptionFontWeight =
    useAppSelector(selectDescriptionFontWeight)
  const descriptionColor =
    useAppSelector(selectDescriptionColor)
      || initialState.infoSettings.descriptionColor
  const countdownDate =
    useAppSelector(selectCountdownDate)
  const countdownEnabled =
    useAppSelector(selectCountdownEnabled)
  const countdownBackgroundColor =
    useAppSelector(selectCountdownBackgroundColor) ??
      initialState.infoSettings.countdownBackgroundColor
  const countdownFontColor =
    useAppSelector(selectCountdownFontColor)
      || initialState.infoSettings.countdownFontColor
  const buttonText =
    useAppSelector(selectButtonText)
  const buttonFontColor =
    useAppSelector(selectButtonFontColor)
      || initialState.infoSettings.buttonFontColor
  const buttonBackgroundColor =
    useAppSelector(selectButtonBackgroundColor)
      || initialState.infoSettings.buttonBackgroundColor
  const icon =
    useAppSelector(selectIcon)
  const link =
    useAppSelector(selectLink)
  const rewardScreenEnabled =
    useAppSelector(selectRewardScreenEnabled)

  const [initialTime, setInitialTime] = useState<number>(0)

  useEffect(() => {
    if (!countdownEnabled) {
      return
    }

    const eventDate = DateTime.fromISO(countdownDate)
    const now = DateTime.now()
    const diff = Math.floor(
      eventDate
        .diff(now, 'seconds')
        .as('seconds')
    )
    
    setInitialTime(diff > 0 ? diff : 0)
  }, [countdownEnabled, countdownDate])

  const buttonStyle: CSSProperties = {
    color: buttonFontColor,
    backgroundColor: buttonBackgroundColor,
  }

  const IconComponent = Icons[icon]

  const handleButtonPress = () => {
    if (!rewardScreenEnabled) {
      window.open(link, '_blank')
    }
    props.onCountdownScreenButtonPress?.()
  }

  return (
    <>
      <div className='w-42 h-9.5 mt-14'>
        {props.companyLogoEnabled && (
          <CompanyLogo
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
            'text-white font-bold text-[40px] leading-12 text-center',
            'transition-all duration-250',
            getFontWeightClass(titleFontWeight),
          )}
          style={{ color: titleColor }}
        >
          {/* До Нового года осталось */}
          <BrTagsOnNewlines input={title} />
        </span>
        <span
          className={cn(
            'text-white text-[16px] leading-4.75 text-center',
            'transition-all duration-250',
            getFontWeightClass(descriptionFontWeight),
          )}
          style={{ color: descriptionColor }}
        >
          {/* Вы можете разместить здесь описание */}
          <BrTagsOnNewlines input={description} />
        </span>

        {countdownEnabled
          ? <CountdownTimer
              initialTime={initialTime}
              backgroundColor={countdownBackgroundColor}
              fontColor={countdownFontColor}
            />
          : <div className='w-full h-24.5 bg-transparent' />
        }

        <Button
          className={cn(
            'w-full h-10.75 bg-[#FFB400] rounded-md text-[20px]',
            'transition-colors duration-250',
          )}
          style={buttonStyle}
          onPress={handleButtonPress}
        >
          {/* Хочу скидку! */}
          {icon !== 'HeartDislike' && (
            <div className='w-3.75 h-3.75'>
              <IconComponent />
            </div>
          )}
          {buttonText}
        </Button>
      </div>
    </>
  )
}

export default CountdownScreen
