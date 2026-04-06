import TextSettings from '@/components/TextSettings'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import ContactAcquisitionSettings from './ContactAcquisitionSettings'
import AgreementAndPolicy from '@/components/AgreementAndPolicy'
import type {
  FontWeight,
  FormSettings as FormSettingsType,
} from '@lemnity/widget-config/widgets/event-timer'

type FormSettingsProps = {
  title: string
  titleFontColor: string
  description: string
  descriptionFontColor: string
  contactAcquisitionEnabled: boolean
  nameFieldEnabled: boolean
  nameFieldRequired: boolean
  emailFieldEnabled: boolean
  emailFieldRequired: boolean
  phoneFieldEnabled: boolean
  phoneFieldRequired: boolean
  agreement: FormSettingsType['agreement']
  adsInfo: FormSettingsType['adsInfo']
  setFormScreenTitle: (title: string) => void
  setFormScreenTitleFontWeight: (weight: FontWeight) => void
  setFormScreenTitleFontColor: (color: string) => void
  setFormScreenDescription: (description: string) => void
  setFormScreenDescriptionFontWeight: (weight: FontWeight) => void
  setFormScreenDescriptionFontColor: (color: string) => void
  setFormScreenContactAcquisitionEnabled: (enabled: boolean) => void
  setFormScreenNameFieldEnabled: (enabled: boolean) => void
  setFormScreenNameFieldRequired: (required: boolean) => void
  setFormScreenEmailFieldEnabled: (enabled: boolean) => void
  setFormScreenEmailFieldRequired: (required: boolean) => void
  setFormScreenPhoneFieldEnabled: (enabled: boolean) => void
  setFormScreenPhoneFieldRequired: (required: boolean) => void
  setAgreementEnabled: (enabled: boolean) => void
  setAgreementPolicyUrl: (url: string) => void
  setAgreementUrl: (url: string) => void
  setAgreementColor: (color: string) => void
  setAdsInfoEnabled: (enabled: boolean) => void
  setAdsInfoPolicyUrl: (url: string) => void
  setAdsInfoColor: (color: string) => void
}

const FormSettings = (props: FormSettingsProps) => {
  const {
    title,
    titleFontColor,
    description,
    descriptionFontColor,
    contactAcquisitionEnabled,
    nameFieldEnabled,
    nameFieldRequired,
    emailFieldEnabled,
    emailFieldRequired,
    phoneFieldEnabled,
    phoneFieldRequired,
    agreement,
    adsInfo,
    setFormScreenTitle,
    setFormScreenTitleFontWeight,
    setFormScreenTitleFontColor,
    setFormScreenDescription,
    setFormScreenDescriptionFontWeight,
    setFormScreenDescriptionFontColor,
    setFormScreenContactAcquisitionEnabled,
    setFormScreenNameFieldEnabled,
    setFormScreenNameFieldRequired,
    setFormScreenEmailFieldEnabled,
    setFormScreenEmailFieldRequired,
    setFormScreenPhoneFieldEnabled,
    setFormScreenPhoneFieldRequired,
    setAgreementEnabled,
    setAgreementPolicyUrl,
    setAgreementUrl,
    setAgreementColor,
    setAdsInfoEnabled,
    setAdsInfoPolicyUrl,
    setAdsInfoColor,
  } = props

  return (
    <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Форма данных
      </h1>

      <BorderedContainer>
        <div className='w-full flex flex-col'>
          <TextSettings
            title='Заголовок'
            text={title}
            onTextChange={setFormScreenTitle}
            onFontWeightChange={setFormScreenTitleFontWeight}
            textColor={titleFontColor}
            onColorChange={setFormScreenTitleFontColor}
            placeholder='Укажите заголовок'
          />
        </div>
      </BorderedContainer>

      <BorderedContainer>
        <div className='w-full flex flex-col'>
          <TextSettings
            title='Описание'
            text={description}
            onTextChange={setFormScreenDescription}
            onFontWeightChange={setFormScreenDescriptionFontWeight}
            textColor={descriptionFontColor}
            onColorChange={setFormScreenDescriptionFontColor}
            placeholder={
              'Получите супер скидку до 30 % на покупку билета в АРТ КАФЕ.'
            }
          />
        </div>
      </BorderedContainer>

      <ContactAcquisitionSettings
        contactAcquisitionEnabled={!!contactAcquisitionEnabled}
        onContactAcquisitionToggle={setFormScreenContactAcquisitionEnabled}
        nameFieldEnabled={nameFieldEnabled}
        onNameFieldEnabledChange={setFormScreenNameFieldEnabled}
        nameFieldRequired={nameFieldRequired}
        onNameFieldRequiredChange={setFormScreenNameFieldRequired}
        phoneFieldEnabled={phoneFieldEnabled}
        onPhoneFieldEnabledChange={setFormScreenPhoneFieldEnabled}
        phoneFieldRequired={phoneFieldRequired}
        onPhoneFieldRequiredChange={setFormScreenPhoneFieldRequired}
        emailFieldEnabled={emailFieldEnabled}
        onEmailFieldEnabledChange={setFormScreenEmailFieldEnabled}
        emailFieldRequired={emailFieldRequired}
        onEmailFieldRequiredChange={setFormScreenEmailFieldRequired}
      />
      
      <AgreementAndPolicy
        variant='agreement'
        errorPath=''
        agreement={agreement}
        onToggle={setAgreementEnabled}
        onFontColorChange={setAgreementColor}
        onAgreementUrlChange={setAgreementUrl}
        onPolicyUrlChange={setAgreementPolicyUrl}
      />
      
      <AgreementAndPolicy
        variant='advertisement'
        errorPath=''
        agreement={adsInfo}
        onToggle={setAdsInfoEnabled}
        onFontColorChange={setAdsInfoColor}
        onPolicyUrlChange={setAdsInfoPolicyUrl}
      />
    </div>
  )
}

export default FormSettings
