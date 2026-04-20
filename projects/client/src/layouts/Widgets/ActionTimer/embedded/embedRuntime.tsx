import { useEffect, useState, type CSSProperties } from 'react'
import {
  Root,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
} from '@radix-ui/react-dialog'
import { cn } from '@heroui/theme'

import {
  Button,
  SvgIcon,
  CompanyLogo,
  BrTagsOnNewlines,
  CountdownTimer,
  RewardScreen,
} from '@/components'

import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  fetchActionTimerWidget,
  initialState,
  selectAdsInfo,
  selectAgreement,
  selectBackgroundColor,
  selectBadgeBackgroundColor,
  selectBadgeFontColor,
  selectBadgeText,
  selectBorderRadius,
  selectBrandingEnabled,
  selectButtonBackgroundColor,
  selectButtonFontColor,
  selectButtonIcon,
  selectButtonLink,
  selectButtonText,
  selectColorScheme,
  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
  selectContactAcquisitionEnabled,
  selectContentAlignment,
  selectContentPlacement,
  selectContentType,
  selectContentUrl,
  selectCountdownBackgroundColor,
  selectCountdownDate,
  selectCountdownEnabled,
  selectCountdownFontColor,
  selectDescription,
  selectDescriptionColor,
  selectDescriptionFontSize,
  selectDescriptionFontWeight,
  selectEmailFieldEnabled,
  selectEmailFieldRequired,
  selectFormBorderColor,
  selectFormBorderEnabled,
  selectNameFieldEnabled,
  selectNameFieldRequired,
  selectPhoneFieldEnabled,
  selectPhoneFieldRequired,
  selectProjectId,
  selectRewardCustomColorSchemeEnabled,
  selectRewardCustomDiscountBackgroundColor,
  selectRewardCustomPromoBackgroundColor,
  selectRewardDescription,
  selectRewardDescriptionFontColor,
  selectRewardDescriptionFontSize,
  selectRewardDescriptionFontWeight,
  selectRewardDiscount,
  selectRewardDiscountFontColor,
  selectRewardDiscountFontSize,
  selectRewardDiscountFontWeight,
  selectRewardPromo,
  selectRewardPromoFontColor,
  selectRewardPromoFontSize,
  selectRewardPromoFontWeight,
  selectRewardScreenEnabled,
  selectRewardTitle,
  selectRewardTitleFontColor,
  selectRewardTitleFontSize,
  selectRewardTitleFontWeight,
  selectTextBeforeCountdown,
  selectTextBeforeCountdownColor,
  selectTitle,
  selectTitleColor,
  selectTitleFontSize,
  selectTitleFontWeight,
} from '../actionTimerSlice'
import { useDialogContext } from './DialogContext'

import crossIcon from '@/assets/icons/cross.svg'
import { getFontWeightClass } from '@/components/utils/getFontWeightClass'
import useUrlImage from '@/hooks/useUrlImage'
import { DateTime } from 'luxon'
import ContactAcquisition, {
  type ContactAcquisitionForm,
} from '@/components/ContactAcquisition'
import { sendEvent, sendPublicRequest } from '@/common/api/publicApi'
import FreePlanBrandingLink from '@/components/FreePlanBrandingLink'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

const ActionTimerRewardScreen = () => {
  const title =
    useAppSelector(selectRewardTitle)
  const titleFontSize =
    useAppSelector(selectRewardTitleFontSize)
  const titleFontWeight =
    useAppSelector(selectRewardTitleFontWeight)
  const titleFontColor =
    useAppSelector(selectRewardTitleFontColor)
  const description =
    useAppSelector(selectRewardDescription)
  const descriptionFontSize =
    useAppSelector(selectRewardDescriptionFontSize)
  const descriptionFontWeight =
    useAppSelector(selectRewardDescriptionFontWeight)
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

  return (
    <div
      className={cn(
        'min-w-[403px] max-w-[403px]',
        'self-stretch flex flex-col items-center justify-center',
      )}
    >
      <RewardScreen
        variant='actionTimer'
        title={title}
        titleFontSize={titleFontSize}
        titleFontWeight={titleFontWeight}
        titleFontColor={titleFontColor}
        description={description}
        descriptionFontSize={descriptionFontSize}
        descriptionFontWeight={descriptionFontWeight}
        descriptionFontColor={descriptionFontColor}
        discount={discount}
        discountFontSize={discountFontSize}
        discountFontWeight={discountFontWeight}
        discountFontColor={discountFontColor}
        promo={promo}
        promoFontSize={promoFontSize}
        promoFontWeight={promoFontWeight}
        promoFontColor={promoFontColor}
        customColorSchemeEnabled={customColorSchemeEnabled}
        customDiscountBackgroundColor={
          customDiscountBackgroundColor
        }
        customPromoBackgroundColor={
          customPromoBackgroundColor
        }
      />
    </div>
  )
}

type ActionTimerContentProps = {
  onButtonPress: (formData: ContactAcquisitionForm) => void
}

const ActionTimerContent = (props: ActionTimerContentProps) => {
  const badgeText =
    useAppSelector(selectBadgeText)
  const badgeBackgroundColor =
    useAppSelector(selectBadgeBackgroundColor)
      || initialState.badgeBackgroundColor
  const badgeFontColor =
    useAppSelector(selectBadgeFontColor)
      || initialState.badgeFontColor
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
      || initialState.titleColor
  
  const description =
    useAppSelector(selectDescription)
  const descriptionFontSize =
    useAppSelector(selectDescriptionFontSize)
  const descriptionFontWeight =
    useAppSelector(selectDescriptionFontWeight)
  const descriptionColor =
    useAppSelector(selectDescriptionColor)
      || initialState.descriptionColor

  const textBeforeCountdown =
    useAppSelector(selectTextBeforeCountdown)
  const textBeforeCountdownColor =
    useAppSelector(selectTextBeforeCountdownColor)
      || initialState.countdown.textBeforeCountdownColor

  const countdownEnabled =
    useAppSelector(selectCountdownEnabled)
  const countdownDate =
    useAppSelector(selectCountdownDate)
  
  const countdownBackgroundColor =
    useAppSelector(selectCountdownBackgroundColor)
  const countdownFontColor =
    useAppSelector(selectCountdownFontColor)
      || initialState.countdown.countdownFontColor
  
  const buttonText =
    useAppSelector(selectButtonText)
  const buttonFontColor =
    useAppSelector(selectButtonFontColor)
  const buttonBackgroundColor =
    useAppSelector(selectButtonBackgroundColor)
  const buttonIcon =
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
  
  const formBorderEnabled =
    useAppSelector(selectFormBorderEnabled)
  const formBorderColor =
    useAppSelector(selectFormBorderColor)
      || initialState.formBorderColor
  
  const brandingEnabled =
    useAppSelector(selectBrandingEnabled)
  
  const formBorderStyle: CSSProperties | undefined =
    formBorderEnabled
      ? { borderColor: formBorderColor }
      : undefined

  const {
    base64Image: companyBase64Logo,
    // error,
    isLoading,
  } = useUrlImage(companyLogoUrl)

  const companyLogo = companyLogoUrl && !isLoading
    ? companyBase64Logo as string
    : undefined

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
  const descriptionStyles: CSSProperties = {
    fontSize: descriptionFontSize,
    lineHeight: `${descriptionFontSize}px`,
    color: descriptionColor,
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

        <div
          className={cn(
            'h-[148px] flex flex-col gap-2.5 items-center justify-center',
          )}
        >
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
        </div>

        {contactAcquisitionEnabled && (
          <div
            className={cn(
              formBorderEnabled && 'p-3.75 border rounded-[15px]',
              'flex flex-col gap-2.5',
            )}
            style={formBorderStyle}
          >
            {description && description.length > 0 && (
              <h2
                className={cn(
                  getFontWeightClass(descriptionFontWeight),
                  'self-center text-center',
                )}
                style={descriptionStyles}
              >
                {description}
              </h2>
            )}

            <ContactAcquisition
              buttonText={buttonText}
              buttonFontColor={buttonFontColor}
              buttonBackgroundColor={buttonBackgroundColor}
              icon={buttonIcon}
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
              onFormScreenButtonPress={props.onButtonPress}
            />
          </div>
        )}

        {brandingEnabled && <FreePlanBrandingLink />}
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

  const backgroundColor =
    useAppSelector(selectBackgroundColor)
      || initialState.appearence.backgroundColor
  const borderRadius =
    useAppSelector(selectBorderRadius)
  const colorScheme =
    useAppSelector(selectColorScheme)
  const contentType =
    useAppSelector(selectContentType)
  const contentAlignment =
    useAppSelector(selectContentAlignment)
  const contentUrl =
    useAppSelector(selectContentUrl)
  const contentPlacement =
    useAppSelector(selectContentPlacement)
  const rewardScreenEnabled =
    useAppSelector(selectRewardScreenEnabled)
  const buttonLink =
    useAppSelector(selectButtonLink)
  const projectId =
    useAppSelector(selectProjectId)
  
  const [showRrewardScreen, setShowRewardScreen] = useState(false)
  
  const {
    base64Image: contentBase64Image,
    // error,
    isLoading,
  } = useUrlImage(contentUrl)

  const backgroundImage = contentUrl && !isLoading
    ? contentBase64Image as string
    : noBackgroundImageUrl

  const dialogContentStyles: CSSProperties = {
    backgroundColor:
      colorScheme === 'custom'
        ? backgroundColor
        : initialState.appearence.backgroundColor,
    borderRadius: borderRadius,
  }

  if (contentType === 'background') {
    dialogContentStyles.backgroundImage = `url('${backgroundImage}')`
    dialogContentStyles.backgroundSize = 'cover'
  }

  const imageStyle: CSSProperties = {
    objectPosition: contentAlignment
  }

  const handleOpen = () => {
    setOpen(prev => !prev)

    if (!widgetId) {
      return
    }

    void sendEvent({
      event_name:
        open
          ? 'action_timer.close'
          : 'action_timer.open',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const handleFormButtonPress = (formData: ContactAcquisitionForm) => {
    if (rewardScreenEnabled) {
      setShowRewardScreen(true)

      if (!widgetId) {
        return
      }

      void sendEvent({
        event_name: 'action_timer.transition_to_reward',
        widget_id: widgetId,
        project_id: projectId,
        payload: formData,
      })
    }
    else {
      window.open(buttonLink, '_blank')

      if (!widgetId) {
        return
      }

      void sendEvent({
        event_name: 'action_timer.link_opened',
        widget_id: widgetId,
        project_id: projectId,
        payload: formData,
      })
    }

    if (!widgetId) {
      return
    }

    void sendPublicRequest({
      widgetId: widgetId,
      fullName: formData.name,
      phone: formData.phone,
      email: formData.email,
      url: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
    })
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
              'z-2147483646 w-[928px] min-h-[525px]',
              'px-5 py-3.75 flex items-stretch gap-3.75',
              contentPlacement === 'right'
               ? 'flex-row'
               : 'flex-row-reverse',
            )}
            style={dialogContentStyles}
          >
            <DialogClose asChild>
              <Button
                className={cn(
                  'min-w-[34px] w-[34px] h-[34px] bg-white',
                  'border border-black flex items-center justify-center',
                  'absolute top-[15px] rounded-[10px]',
                  contentPlacement === 'right'
                    ? 'right-[20px]'
                    : 'left-[20px]',
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

            {rewardScreenEnabled && showRrewardScreen
              ? <ActionTimerRewardScreen />
              : <ActionTimerContent onButtonPress={handleFormButtonPress} />
            }

            <div className='self-stretch'>
              {contentType === 'imageOnSide' && (
                <img
                  src={contentUrl}
                  alt='Изображение'
                  className='w-full h-full object-cover rounded-[15px]'
                  style={imageStyle}
                />
              )}
            </div>
          </DialogContent>
        </DialogPortal>
      </Root>
    </>
  )
}

export default ActionTimerEmbedRuntime
