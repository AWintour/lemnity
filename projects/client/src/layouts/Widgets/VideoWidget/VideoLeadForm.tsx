import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Checkbox } from '@heroui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { PatternFormat } from 'react-number-format'

import SvgIcon from '@/components/SvgIcon'
import FreePlanBrandingLink from '@/components/FreePlanBrandingLink'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { VideoWidgetType } from '@lemnity/widget-config/widgets/video-widget'
import lemnityBlackLogo from '@/assets/logos/lemnity.svg'

export type VideoLeadFormValues = {
  phone?: string
  email?: string
  name?: string
  agreementChecked?: boolean
  adsInfoChecked?: boolean
}

type VideoLeadFormProps = {
  onSubmit: (values: VideoLeadFormValues) => void
  submitDisabled?: boolean
}

const normalizeUrl = (url: string): string => {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

const inputClassNames = {
  inputWrapper:
    'h-13 bg-white rounded-[14px] border border-[#E3E3E3] data-[hover=true]:border-[#CFCFCF] group-data-[focus=true]:border-[#9A9A9A] px-4 shadow-none',
  input: 'text-[16px] text-black placeholder:text-[#9A9A9A]',
}

const VideoLeadForm = ({ onSubmit, submitDisabled = false }: VideoLeadFormProps) => {
  const fieldsSettings = useWidgetSettingsStore(s => s.settings?.fields)
  const brandingEnabled = useWidgetSettingsStore(s => s.settings?.display?.brandingEnabled)
  const titleFontSize = useWidgetSettingsStore(
    s => (s.settings?.widget as VideoWidgetType | undefined)?.formTitleFontSize ?? 26
  )
  const { contacts, formTexts, agreement, adsInfo, companyLogo } = fieldsSettings ?? {}
  const { phone: phoneCfg, email: emailCfg, name: nameCfg } = contacts ?? {}
  const { title, button } = formTexts ?? {}

  const { enabled: logoEnabled, url: logoUrl } = companyLogo ?? {}
  const {
    enabled: agreementEnabled,
    text: agreementText,
    policyUrl,
    color: agreementColor,
  } = agreement ?? {}
  const {
    enabled: adsInfoEnabled,
    text: adsInfoText,
    policyUrl: adsInfoPolicyUrl,
    color: adsInfoColor,
  } = adsInfo ?? {}

  const buildSchema = () => {
    const shape: Record<string, z.ZodTypeAny> = {}
    if (phoneCfg?.enabled) {
      const base = z
        .string()
        .trim()
        .min(12, 'Некорректный номер телефона')
        .refine(value => /^\+\d{11,}$/.test(value), {
          message: 'Формат телефона должен быть +79999999999',
        })
      shape.phone = phoneCfg.required ? base : base.optional().or(z.literal(''))
    } else {
      shape.phone = z.string().optional().or(z.literal(''))
    }
    if (emailCfg?.enabled) {
      const base = z.email('Некорректный email')
      shape.email = emailCfg.required ? base : base.optional().or(z.literal(''))
    } else {
      shape.email = z.string().optional().or(z.literal(''))
    }
    if (nameCfg?.enabled) {
      const base = z
        .string()
        .min(1, 'Имя обязательно')
        .regex(/^[a-zA-Zа-яА-Я\s]+$/, 'Имя должно содержать только буквы')
      shape.name = nameCfg.required ? base : base.optional().or(z.literal(''))
    } else {
      shape.name = z.string().optional().or(z.literal(''))
    }
    if (agreementEnabled) shape.agreementChecked = z.literal(true).default(true)
    if (adsInfoEnabled) shape.adsInfoChecked = z.boolean().default(true)
    return z.object(shape)
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VideoLeadFormValues>({
    resolver: zodResolver(buildSchema()),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { phone: '', email: '', name: '', adsInfoChecked: true, agreementChecked: true },
  })

  const checkboxClassNames = {
    wrapper:
      'bg-white before:border-[#373737] rounded-[5px] before:rounded-[5px] after:rounded-[5px] after:bg-[#373737] mr-2',
    base: 'items-start max-w-full',
  }

  return (
    <form
      onSubmit={handleSubmit(values => onSubmit(values))}
      className='flex flex-col items-center justify-center gap-4 px-6 py-6 w-full min-h-full'
    >
      {logoEnabled !== false && (
        logoUrl ? (
          <img src={logoUrl} alt='Logo' className='h-9 object-contain' />
        ) : (
          <div className='h-9 flex items-center'>
            <SvgIcon src={lemnityBlackLogo} alt='Lemnity' className='h-7 w-auto text-black' />
          </div>
        )
      )}

      <h2
        className='leading-tight font-extrabold text-center whitespace-pre-wrap'
        style={{ color: title?.color ?? '#000000', fontSize: `${titleFontSize}px` }}
      >
        {title?.text || 'Оставьте заявку и мы\nвам перезвоним'}
      </h2>

      {/* Карточка с полями + кнопкой */}
      <div className='w-full flex flex-col gap-3 rounded-[20px] border border-[#EAEAEA] p-4'>
        {nameCfg?.enabled && (
          <Input
            placeholder='Ваше имя'
            variant='bordered'
            classNames={inputClassNames}
            {...register('name')}
            value={getValues('name')}
            onChange={e => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Zа-яА-Я\s]+/g, '')
              setValue('name', onlyLetters, { shouldValidate: true, shouldDirty: true })
            }}
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
          />
        )}

        {emailCfg?.enabled && (
          <Input
            placeholder='Ваш email'
            variant='bordered'
            classNames={inputClassNames}
            {...register('email')}
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
          />
        )}

        {phoneCfg?.enabled && (
          <Controller
            control={control}
            name='phone'
            render={({ field: { ref, value, onChange, onBlur } }) => (
              <PatternFormat
                customInput={Input}
                getInputRef={ref}
                format='+7 ### ### ## ##'
                mask=' '
                value={value?.startsWith('+7') ? value.substring(2) : value}
                onBlur={onBlur}
                onValueChange={values => onChange(values.value ? `+7${values.value}` : '')}
                type='tel'
                inputMode='numeric'
                placeholder='+7 000 000 00 00'
                variant='bordered'
                isInvalid={!!errors.phone}
                errorMessage={errors.phone?.message}
                classNames={inputClassNames}
              />
            )}
          />
        )}

        <Button
          variant='solid'
          className='w-full h-13 rounded-[14px] text-[17px] font-semibold'
          style={{ color: button?.color ?? '#000000', backgroundColor: button?.backgroundColor ?? '#FFB400' }}
          type='submit'
          isLoading={isSubmitting}
          isDisabled={submitDisabled || isSubmitting}
        >
          {button?.text || 'Получить скидку'}
        </Button>
      </div>

      {/* Чекбоксы согласий — под карточкой */}
      {agreementEnabled && (
        <div className='flex flex-row w-full'>
          <Checkbox
            classNames={checkboxClassNames}
            {...register('agreementChecked')}
            isInvalid={!!errors.agreementChecked}
            defaultSelected
          />
          <span className='text-[11px] leading-[14px]' style={{ color: agreementColor ?? '#8A8A8A' }}>
            {agreementText || 'Я даю согласие на обработку персональных данных.'}{' '}
            <a
              href={normalizeUrl(policyUrl ?? '')}
              target='_blank'
              rel='noopener noreferrer'
              className='underline'
              style={{ color: agreementColor ?? '#8A8A8A' }}
            >
              Политика конфиденциальности по ссылке.
            </a>
          </span>
        </div>
      )}

      {adsInfoEnabled && (
        <div className='flex flex-row w-full -mt-1'>
          <Checkbox
            classNames={checkboxClassNames}
            {...register('adsInfoChecked')}
            defaultSelected
          />
          <a
            href={normalizeUrl(adsInfoPolicyUrl ?? '')}
            target='_blank'
            rel='noopener noreferrer'
            className='text-[11px] leading-[14px] hover:underline'
            style={{ color: adsInfoColor ?? '#8A8A8A' }}
          >
            {adsInfoText || 'Нажимая на кнопку, вы даёте своё согласие на получение рекламно-информационной рассылки.'}
          </a>
        </div>
      )}

      {brandingEnabled && (
        <div className='pt-1'>
          <FreePlanBrandingLink />
        </div>
      )}
    </form>
  )
}

export default VideoLeadForm
