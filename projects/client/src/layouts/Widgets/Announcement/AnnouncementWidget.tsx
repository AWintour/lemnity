import { useState, type CSSProperties, type Ref } from 'react'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import FreePlanBrandingLink from '@/components/FreePlanBrandingLink'
import { BrTagsOnNewlines, SvgIcon } from '@/components'
import * as Icons from '@/components/Icons'
import AnnouncementRewardScreen from './AnnouncementRewardScreen'

import useUrlImage from '@/hooks/useUrlImage'
import { useViewportWidth } from '@/hooks/useViewportWidth'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectTitle,
  selectTitleFontWeight,
  selectTitleColor,
  selectDescription,
  selectDescriptionFontWeight,
  selectDescriptionColor,
  selectButtonText,
  selectButtonFontColor,
  selectButtonBackgroundColor,
  selectIcon,
  selectLink,
  selectRewardScreenEnabled,
  selectBrandingEnabled,
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,
  selectContentType,
  selectContentAlignment,
  selectContentUrl,
} from './announcementSlice'
import { useMobileContext } from './embedded/MobileContext'
import { getFontWeightClass } from './utils/getFontWeightClass'

import type {
  Content,
  ContentAlignment,
} from '@lemnity/widget-config/widgets/announcement'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import crossIcon from '@/assets/icons/cross.svg'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

type AnnouncementWidgetButtonProps = {
  buttonStyle: CSSProperties
  icon: Icon
  buttonText: string
  onButtonPress?: () => void
}

const AnnouncementWidgetButton = (props: AnnouncementWidgetButtonProps) => {
  const IconComponent = Icons[props.icon]

  return (
    <Button
      className={cn(
        'w-full h-13.5 rounded-[13px] bg-[#FFB400]',
        'text-black text-[20px] transition-colors duration-250',
      )}
      style={props.buttonStyle}
      onPress={props.onButtonPress}
    >
      {/* Билеты */}
      {props.icon !== 'HeartDislike' && (
        <div className='w-3.75 h-3.75'>
          <IconComponent />
        </div>
      )}
      {props.buttonText}
    </Button>
  )
}

type AnnouncementWidgetContentProps = {
  contentType: Content
  contentAlignment: ContentAlignment
  contentUrl?: string
  onButtonPress?: () => void
}

const AnnouncementWidgetContent = (
  props: AnnouncementWidgetContentProps
) => {
  const title = useAppSelector(selectTitle)
  const titleFontWeight = useAppSelector(selectTitleFontWeight)
  const titleColor = useAppSelector(selectTitleColor)
  const description = useAppSelector(selectDescription)
  const descriptionFontWeight = useAppSelector(selectDescriptionFontWeight)
  const descriptionColor = useAppSelector(selectDescriptionColor)
  const buttonText = useAppSelector(selectButtonText)
  const buttonFontColor = useAppSelector(selectButtonFontColor)
  const buttonBackgroundColor = useAppSelector(selectButtonBackgroundColor)
  const icon = useAppSelector(selectIcon)
  const link = useAppSelector(selectLink)
  const rewardScreenEnabled = useAppSelector(selectRewardScreenEnabled)
  
  const buttonStyle: CSSProperties = {
    color: buttonFontColor,
    backgroundColor: buttonBackgroundColor,
  }
  const imageStyle: CSSProperties = {
    objectPosition: props.contentAlignment
  }

  const handleButtonPress = () => {
    if (rewardScreenEnabled) {
      props.onButtonPress?.()
    }
    else {
      window.open(link, '_blank')
      props.onButtonPress?.()
    }
  }

  return (
    <>
      {props.contentType === 'imageOnTop'
        ? <img
            src={props.contentUrl}
            alt='Announcement Widget Image'
            className='w-full max-w-99.5 h-67 object-cover rounded-[10px]'
            style={imageStyle}
          />
        : <div className='w-full max-w-99.5 h-67 bg-transparent' />}

      <span
        className={cn(
          'text-3xl transition-all duration-250',
          getFontWeightClass(titleFontWeight),
        )}
        style={{ color: titleColor }}
      >
        {/* Премьера «Я буду ЖИТЬ» */}
        <BrTagsOnNewlines input={title} />
      </span>
      <span
        className={cn(
          'text-[16px] transition-all duration-250',
          getFontWeightClass(descriptionFontWeight),
        )}
        style={{ color: descriptionColor }}
      >
        {/* по пьесе Н. Пинчука «На выписку», драматичекий ритуал в 1 дейстии, 16+ */}
        <BrTagsOnNewlines input={description} />
      </span>

      <div className='w-full max-w-99.5 mt-auto mb-0'>
        <AnnouncementWidgetButton
          buttonStyle={buttonStyle}
          buttonText={buttonText}
          icon={icon}
          onButtonPress={handleButtonPress}
        />
      </div>
    </>
  )
}

export type AnnouncementWidgetVariant = 'announcement' | 'reward'

type AnnouncementWidgetProps = {
  ref?: Ref<HTMLDivElement>
  variant: AnnouncementWidgetVariant
  focused?: boolean
  onButtonPress?: () => void
}

const AnnouncementWidget = ({ ref, ...props }: AnnouncementWidgetProps) => {
  const colorScheme = useAppSelector(selectColorScheme)
  const backgroundColor = useAppSelector(selectBackgroundColor)
  const borderRadius = useAppSelector(selectBorderRadius)
  const contentType = useAppSelector(selectContentType)
  const contentAlignment = useAppSelector(selectContentAlignment)
  const contentUrl = useAppSelector(selectContentUrl)
  const rewardScreenEnabled = useAppSelector(selectRewardScreenEnabled)
  const brandingEnabled = useAppSelector(selectBrandingEnabled)

  const {
    base64Image: contentBase64Image,
    // error,
    isLoading,
  } = useUrlImage(contentUrl)

  const mobile = useIsMobileViewport()
  const mobileContext = useMobileContext()
  const width = useViewportWidth()

  const mobileScale = width >= 398
    ? undefined
    // 2 20 px margins on x axis = 40 px
    // the width of the widget is w-99.5 = 398
    // 1% of 398 = 3.98
    : Math.floor((width - 40) / 3.98)

  const containerStyle: CSSProperties = {
    backgroundColor: colorScheme === 'primary'
      ? '#FFFFFF'
      : backgroundColor,
    borderRadius: borderRadius,
    transform: mobile && mobileScale
      ? `scale(${mobileScale}%)`
      : undefined,
  }

  const backgroundImage = contentUrl && !isLoading
    ? contentBase64Image as string
    : noBackgroundImageUrl

  if (contentType === 'background') {
    containerStyle.backgroundImage = `url('${backgroundImage}')`
    containerStyle.backgroundSize = 'cover'
    containerStyle.backgroundPosition = contentAlignment
  }

  

  const [hidden, setHidden] = useState(false)

  const closeButtonStyle: CSSProperties = {
    borderTopRightRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
  }

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
        'w-99.5 min-h-129.5 p-3.75 pb-0 gap-3.75 border border-black relative',
        'flex flex-col items-center text-center transition-colors duration-250',
        hidden && 'hidden',
      )}
      style={containerStyle}
    >
      <Button
        className={cn(
          'min-w-12 w-12 h-8.5 top-0 right-0 rounded-none',
          'bg-white px-0 absolute justify-center items-center',
          'pointer-events-auto',
          props.focused || mobile ? 'flex' : 'hidden group-hover:flex',
        )}
        style={closeButtonStyle}
        onPress={handleCloseButtonPress}
      >
        <div className='w-4 h-4 fill-black'>
          <SvgIcon src={crossIcon} alt='Close' />
        </div>
      </Button>

      {props.variant === 'announcement' && (
        <AnnouncementWidgetContent
          contentType={contentType}
          contentAlignment={contentAlignment}
          contentUrl={backgroundImage}
          onButtonPress={props.onButtonPress}
        />
      )}

      {props.variant === 'reward' && rewardScreenEnabled && (
        <AnnouncementRewardScreen />
      )}
      
      {brandingEnabled
        ? <div className='flex justify-center py-2 mt-auto mb-0'>
            <FreePlanBrandingLink />
          </div>
        : <div className='h-3 py-2 mt-auto mb-0 bg-transparent' />}
    </div>
  )
}

export default AnnouncementWidget
