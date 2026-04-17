import { useEffect, useState, type CSSProperties } from 'react'
import {
  Root,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
} from '@radix-ui/react-dialog'
import { cn } from '@heroui/theme'

import { Button, SvgIcon, CompanyLogo, BrTagsOnNewlines, CountdownTimer } from '@/components'

import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import { fetchActionTimerWidget, initialState, selectAdsInfo, selectAgreement, selectBackgroundColor, selectBadgeBackgroundColor, selectBadgeFontColor, selectBadgeText, selectBorderRadius, selectButtonBackgroundColor, selectButtonFontColor, selectButtonIcon, selectButtonText, selectColorScheme, selectCompanyLogoEnabled, selectCompanyLogoUrl, selectContactAcquisitionEnabled, selectContentAlignment, selectContentUrl, selectCountdownBackgroundColor, selectCountdownDate, selectCountdownEnabled, selectCountdownFontColor, selectEmailFieldEnabled, selectEmailFieldRequired, selectNameFieldEnabled, selectNameFieldRequired, selectPhoneFieldEnabled, selectPhoneFieldRequired, selectTextBeforeCountdown, selectTextBeforeCountdownColor, selectTitle, selectTitleColor, selectTitleFontSize, selectTitleFontWeight } from '../actionTimerSlice'
import { useDialogContext } from './DaalogContext'

import crossIcon from '@/assets/icons/cross.svg'
import { getFontWeightClass } from '@/components/utils/getFontWeightClass'
import useUrlImage from '@/hooks/useUrlImage'
import { DateTime } from 'luxon'
import ContactAcquisition from '@/components/ContactAcquisition'

const ActionTimerContent = () => {
  const badgeText =
    useAppSelector(selectBadgeText)
  const badgeBackgroundColor =
    useAppSelector(selectBadgeBackgroundColor)
  const badgeFontColor =
    useAppSelector(selectBadgeFontColor)
  const colorScheme =
    useAppSelector(selectColorScheme)

  const companyLogoEnabled =
    useAppSelector(selectCompanyLogoEnabled)
  const companyLogoUrl =
    useAppSelector(selectCompanyLogoUrl)

  const title =
    useAppSelector(selectTitle)
  const titleFontSize =
    useAppSelector(selectTitleFontSize)
  const titleFontWeight =
    useAppSelector(selectTitleFontWeight)
  const titleColor =
    useAppSelector(selectTitleColor)

  const textBeforeCountdown =
    useAppSelector(selectTextBeforeCountdown)
  const textBeforeCountdownColor =
    useAppSelector(selectTextBeforeCountdownColor)

  const countdownEnabled =
    useAppSelector(selectCountdownEnabled)
  const countdownDate =
    useAppSelector(selectCountdownDate)
  
  const countdownBackgroundColor =
    useAppSelector(selectCountdownBackgroundColor)
  const countdownFontColor =
    useAppSelector(selectCountdownFontColor)

  const contentAlignment =
    useAppSelector(selectContentAlignment)
  const contentUrl =
   useAppSelector(selectContentUrl)
  
  const buttonText =
    useAppSelector(selectButtonText)
  const buttonFontColor =
    useAppSelector(selectButtonFontColor)
  const buttonBackgroundColor =
    useAppSelector(selectButtonBackgroundColor)
  const icon =
    useAppSelector(selectButtonIcon)
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
  const agreement =
    useAppSelector(selectAgreement)
  const adsInfo =
    useAppSelector(selectAdsInfo)

  const {
    base64Image: companyBase64Logo,
    // error,
    isLoading,
  } = useUrlImage(companyLogoUrl)

  const companyLogo = companyLogoUrl && !isLoading
    ? companyBase64Logo as string
    : undefined

  const imageStyle: CSSProperties = {
    objectPosition: contentAlignment
  }

  const badgeStyles: CSSProperties = {
    backgroundColor:
      colorScheme === 'custom'
        ? badgeBackgroundColor
        : initialState.badgeBackgroundColor,
    color:
      colorScheme === 'custom'
        ? badgeFontColor
        : initialState.badgeFontColor,
  }

  const titleStyles: CSSProperties = {
    fontSize: titleFontSize,
    lineHeight: `${titleFontSize}px`,
    color: titleColor,
  }

  const textBeforeCountdownStyles: CSSProperties = {
    color: textBeforeCountdownColor,
  }

  let initialTime: number = 0

  if (countdownEnabled) {
    const eventDate = DateTime.fromISO(countdownDate)
    const now = DateTime.now()
    const diffDuration = eventDate.diff(now, 'seconds')
    const diffSeconds = diffDuration.as('seconds')
    const diff = Math.floor(diffSeconds)
    
    initialTime = diff > 0 ? diff : 0
  }

  return (
    <>
      <div
        className={cn(
          'min-w-[403px] max-w-[403px] h-full',
          'flex flex-col items-center gap-2.5',
        )}
      >
        <div
         className={cn(
          'rounded-full h-5 px-2.5 flex items-center justify-center w-fit',
          'text-[14px] leading-3.5',
         )}
         style={badgeStyles}
        >
          {badgeText}
        </div>

        {companyLogoEnabled && (
          <div className='w-42 h-9.5'>
            <CompanyLogo
              companyLogo={companyLogo}
            />
          </div>
        )}

        <div
          className={cn(
            getFontWeightClass(titleFontWeight),
            'self-center text-center',
          )}
          style={titleStyles}
        >
          <BrTagsOnNewlines input={title} />
        </div>

        {textBeforeCountdown.length > 0 && (
          <div
            className='text-base leading-4.75'
            style={textBeforeCountdownStyles}
          >
            {textBeforeCountdown}
          </div>
        )}

        {countdownEnabled && (
          <CountdownTimer
            mini
            initialTime={initialTime}
            backgroundColor={countdownBackgroundColor}
            fontColor={countdownFontColor}
          />
        )}

        {contactAcquisitionEnabled && (
          <ContactAcquisition
            buttonText={buttonText}
            buttonFontColor={buttonFontColor}
            buttonBackgroundColor={buttonBackgroundColor}
            icon={icon}
            contactAcquisitionEnabled={contactAcquisitionEnabled}
            nameFieldEnabled={nameFieldEnabled}
            nameFieldRequired={nameFieldRequired}
            emailFieldEnabled={emailFieldEnabled}
            emailFieldRequired={emailFieldRequired}
            phoneFieldEnabled={phoneFieldEnabled}
            phoneFieldRequired={phoneFieldRequired}
            agreement={agreement}
            adsInfo={adsInfo}
            borderRadius={10}
            checkboxBorderColor='#000000'
            largeButton
          />
        )}
      </div>

      <div className='grow h-full'>
        <img
          src={contentUrl}
          alt='Изображение'
          className='w-full h-full object-cover rounded-[15px]'
          style={imageStyle}
        />
      </div>
    </>
  )
}

type ActionTimerEmbedRuntimeProps = {
  widgetId?: string
}

export const ActionTimerEmbedRuntime = (
  { widgetId }: ActionTimerEmbedRuntimeProps
) => {
  const container = useDialogContext()
  const [open, setOpen] = useState(false)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (widgetId) {
      dispatch(fetchActionTimerWidget({
        widgetId: widgetId,
        embedded: true,
      }))
    }
  }, [dispatch, widgetId])

  const backgroundColor = useAppSelector(selectBackgroundColor)
  const borderRadius = useAppSelector(selectBorderRadius)
  const colorScheme = useAppSelector(selectColorScheme)

  const dialogContentStyles: CSSProperties = {
    backgroundColor:
      colorScheme === 'custom'
        ? backgroundColor
        : initialState.appearence.backgroundColor,
    borderRadius: borderRadius,
  }

  const handleOpen = () => {
    setOpen(prev => !prev)
  }

  return (
    <>
      <Button
        className={cn(
          'bg-black text-white fixed left-3 bottom-3 z-2039283',
          'rounded-full px-2.5',
        )}
        onPressEnd={handleOpen}
      >
        Получите скидку
      </Button>

      <Root open={open}>
        <DialogPortal container={container}>
          <DialogOverlay
            className={cn(
              'bg-black/40 fixed inset-0 z-2147483646',
            )}
          />
          <DialogContent
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'z-2147483646 w-[928px] h-[525px]',
              'px-5 py-3.75 flex flex-row gap-3.75',
            )}
            style={dialogContentStyles}
          >
            <DialogClose asChild>
              <Button
                className={cn(
                  'min-w-[34px] w-[34px] h-[34px] bg-white',
                  'border border-black flex items-center justify-center',
                  'absolute top-[15px] right-[20px] rounded-[10px]',
                )}
                aria-label='Закрыть'
                onPressEnd={handleOpen}
              >
                <div
                  className={cn(
                    'min-w-[17px] min-h-[17px] flex items-center',
                    'justify-center text-black stroke-black',
                  )}
                >
                  <SvgIcon src={crossIcon} alt='Закрыть' />
                </div>
              </Button>
            </DialogClose>

            <ActionTimerContent />
          </DialogContent>
        </DialogPortal>
      </Root>
    </>
  )
}

export default ActionTimerEmbedRuntime
