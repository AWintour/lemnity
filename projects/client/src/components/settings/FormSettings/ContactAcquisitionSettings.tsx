import SwitchableField from '@/components/SwitchableField'
import CheckboxField from '@/components/CheckboxField'

type ContactAcquisitionSettings = {
  contactAcquisitionEnabled: boolean
  nameFieldEnabled: boolean
  nameFieldRequired: boolean
  emailFieldEnabled: boolean
  emailFieldRequired: boolean
  phoneFieldEnabled: boolean
  phoneFieldRequired: boolean
  onContactAcquisitionToggle: (nextEnabled: boolean) => void
  onNameFieldEnabledChange: (value: boolean) => void
  onNameFieldRequiredChange: (value: boolean) => void
  onEmailFieldEnabledChange: (value: boolean) => void
  onEmailFieldRequiredChange: (value: boolean) => void
  onPhoneFieldEnabledChange: (value: boolean) => void
  onPhoneFieldRequiredChange: (value: boolean) => void
}

const ContactAcquisitionSettings = (props: ContactAcquisitionSettings) => {
  return (
    <SwitchableField
      title="Контакты"
      enabled={props.contactAcquisitionEnabled}
      onToggle={props.onContactAcquisitionToggle}
      classNames={{
        title: 'text-[16px] leading-4.75 font-normal',
      }}
    >
      <div className="w-full flex flex-col gap-2.5">
        <CheckboxField
          label="Имя"
          showRequired
          checked={props.nameFieldEnabled}
          onChange={props.onNameFieldEnabledChange}
          required={props.nameFieldRequired}
          onRequiredChange={props.onNameFieldRequiredChange}
        />
        <CheckboxField
          label="Телефон"
          showRequired
          checked={props.phoneFieldEnabled}
          onChange={props.onPhoneFieldEnabledChange}
          required={props.phoneFieldRequired}
          onRequiredChange={props.onPhoneFieldRequiredChange}
        />
        <CheckboxField
          label="Email"
          showRequired
          checked={props.emailFieldEnabled}
          onChange={props.onEmailFieldEnabledChange}
          required={props.emailFieldRequired}
          onRequiredChange={props.onEmailFieldRequiredChange}
        />
      </div>
    </SwitchableField>
  )
}

export default ContactAcquisitionSettings
