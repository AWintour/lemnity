import type { CSSProperties } from 'react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import { Button } from '@heroui/button'
import { Checkbox } from '@heroui/checkbox'
import { Input } from '@heroui/input'
import { cn } from '@heroui/theme'

import {
  CompanyLogo,
  BrTagsOnNewlines,
} from '@/components'
import * as Icons from '@/components/Icons'

import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectButtonText,
  selectButtonFontColor,
  selectButtonBackgroundColor,
  selectIcon,
  selectFormTitle,
  selectFormTitleFontWeight,
  selectFormTitleFontColor,
  selectFormDescription,
  selectFormDescriptionFontWeight,
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
  initialState,
} from './eventTimerSlice'
import { getFontWeightClass } from './utils/getFontWeightClass'

export type CountdownForm = {
  name: string
  phone: string
  email: string
  agreementCheckbox: boolean
  adsInfoCheckbox: boolean
}

// This one came straight from the developer of Zod so it should be fine
// https://colinhacks.com/essays/reasonable-email-regex
// eslint-disable-next-line no-useless-escape
const emailRegexp = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i

type CountdownFormScreenProps = {
  companyLogoEnabled: boolean
  companyLogo?: string
  onFormScreenButtonPress?: (formData: CountdownForm) => void
}

const EventTimerFormScreen = (props: CountdownFormScreenProps) => {
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
  const title =
    useAppSelector(selectFormTitle)
  const titleFontWeight =
    useAppSelector(selectFormTitleFontWeight)
  const titleFontColor =
    useAppSelector(selectFormTitleFontColor)
      || initialState.formSettings.titleFontColor
  const description =
    useAppSelector(selectFormDescription)
  const descriptionFontWeight =
    useAppSelector(selectFormDescriptionFontWeight)
  const descriptionFontColor =
    useAppSelector(selectFormDescriptionFontColor)
      || initialState.formSettings.descriptionFontColor
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

  const buttonStyle: CSSProperties = {
    color: buttonFontColor,
    backgroundColor: buttonBackgroundColor,
  }

  const IconComponent = Icons[icon]

  const inputStyles = {
    inputWrapper: 'rounded-[5px] px-2.25 border border-[#9A9A9A] bg-white',
    input: 'placeholder:text-black text-[16px] leading-4.75',
  }

  const checkboxStyles = {
    wrapper: cn(
      'w-4 h-4 before:border-1 before:border-white rounded-[4px]',
      'before:rounded-[4px] after:rounded-[4px] after:bg-transparent',
    ),
    icon: 'w-3 h-3 text-white group-hover/checkbox:text-black',
    base: 'self-start',
  }

  const {
    handleSubmit,
    control,
  } = useForm<CountdownForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      agreementCheckbox: agreement.enabled,
      adsInfoCheckbox: adsInfo.enabled,
    }
  })

  const onSubmit: SubmitHandler<CountdownForm> = data => {
    props.onFormScreenButtonPress?.(data)
  }

  return (
    <>
      <div className="w-42 h-9.5 mt-12.5">
        {props.companyLogoEnabled && (
          <CompanyLogo
            companyLogo={props.companyLogo}
          />
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          'w-full max-w-99.5 flex flex-col items-center justify-center',
          'mt-3.75 gap-3.75',
        )}
      >
        <span
          className={cn(
            'font-medium text-[35px] leading-10.25 text-white text-center',
            'transition-all duration-250',
            getFontWeightClass(titleFontWeight),
          )}
          style={{ color: titleFontColor }}
        >
          {/* Получите скидку */}
          <BrTagsOnNewlines input={title} />
        </span>
        <span
          className={cn(
            'text-[16px] leading-4.75 text-white text-center',
            'transition-all duration-250',
            getFontWeightClass(descriptionFontWeight),
          )}
          style={{ color: descriptionFontColor }}
        >
          {/* Укажите свой email и получите купон,
          который можно использовать при покупке */}
          <BrTagsOnNewlines input={description} />
        </span>

        {contactAcquisitionEnabled
          ? <>
              {nameFieldEnabled &&
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: nameFieldRequired && 'Имя обязательно',
                  }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="Имя и Фамилия"
                      classNames={inputStyles}
                      isRequired={nameFieldRequired}
                      isInvalid={fieldState.invalid}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />}
              {phoneFieldEnabled &&
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: phoneFieldRequired && 'Телефон обязателен',
                    pattern: {
                      value: /^\+7\d{10}$/,
                      message: 'Некорректный номер телефона',
                    }
                  }}
                  render={
                    ({
                      field: { ref, value, onChange, onBlur },
                      fieldState,
                    }) => (
                      <PatternFormat
                        customInput={Input}
                        getInputRef={ref}
                        format="+7 (###) ###-##-##"
                        mask="_"
                        value={
                          value?.startsWith('+7')
                            ? value.substring(2)
                            : value
                        }
                        onValueChange={values => {
                          const cleanValue = values.value
                            ? `+7${values.value}`
                            : ''
                          onChange(cleanValue)
                        }}
                        onBlur={onBlur}
                        // Hero UI Input props
                        type="tel"
                        inputMode="numeric"
                        placeholder="+7 (000) 000-00-00"
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                        classNames={inputStyles}
                      />
                    )
                  }
                />}
              {emailFieldEnabled &&
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: emailFieldRequired && 'Email обязателен',
                    pattern: {
                      value: emailRegexp,
                      // I will still leave the simple regexp here in case
                      // the proper one breaks. This cute little thing should
                      // allow any printable character to pass =w=
                      // value: /\S+@\S+\.\S+/,
                      message: 'Некорректный email',
                    }
                  }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="Ваш email"
                      classNames={inputStyles}
                      isRequired={emailFieldRequired}
                      isInvalid={fieldState.invalid}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />}
            </>
          : <div className="w-full h-23.75 bg-transparent" />}

        <Button
          type='submit'
          className={cn(
            'w-full h-10 rounded-[5px] bg-[#FFB400] text-[16px] leading-4.75',
            'gap-2.25 transition-colors duration-250',
          )}
          style={buttonStyle}
        >
          {/* Получить скидку */}
          {icon !== 'HeartDislike' && (
            <div className='w-3.75 h-3.75'>
              <IconComponent />
            </div>
          )}
          {buttonText}
        </Button>

        {agreement.enabled && (
          <div className='w-full flex flex-row group/checkbox'>
            <Controller
              name="agreementCheckbox"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value, ...field }, fieldState }) => (
                <Checkbox
                  {...field}
                  isRequired
                  isSelected={value}
                  onValueChange={onChange}
                  classNames={checkboxStyles}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <span
              className={cn(
                'text-[9px] leading-2.75 text-white ml-1',
                'transition-colors duration-250',
              )}
              style={{ color: agreement.color }}
            >
              Я даю&nbsp;
              <a
                href={
                  agreement.agreementUrl && agreement.agreementUrl.length > 0
                    ? agreement.agreementUrl
                    : 'https://lemnity.ru/agreement'
                }
                target="_blank"
                className='underline'
              >
                Согласие
              </a>
              &nbsp;на обработку персональных данных в соответствии с&nbsp;
              <a
                href={
                  agreement.policyUrl && agreement.policyUrl.length > 0
                    ? agreement.policyUrl
                    : 'https://lemnity.ru/political'
                }
                target="_blank"
                className='underline'
              >
                Политикой конфиденциальности.
              </a>
            </span>
          </div>
        )}

        {adsInfo.enabled && (
          <div className='w-full flex flex-row group/checkbox'>
            <Controller
              name="adsInfoCheckbox"
              control={control}
              render={({ field: { onChange, value, ...field }, fieldState }) => (
                <Checkbox
                  {...field}
                  isSelected={value}
                  onValueChange={onChange}
                  classNames={checkboxStyles}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <span
              className={cn(
                'text-[9px] leading-2.75 text-white ml-1',
                'transition-colors duration-250',
              )}
              style={{ color: adsInfo.color }}
            >
              <a
                href={
                  adsInfo.policyUrl && adsInfo.policyUrl.length > 0
                    ? adsInfo.policyUrl
                    : 'https://lemnity.ru/ads'
                }
                target="_blank"
                className='underline'
              >
                Нажимая на кнопку, вы даёте своё согласие на получение
                рекламно-информационной рассылки.
              </a>
            </span>
          </div>
        )}
      </form>
    </>
  )
}

export default EventTimerFormScreen
