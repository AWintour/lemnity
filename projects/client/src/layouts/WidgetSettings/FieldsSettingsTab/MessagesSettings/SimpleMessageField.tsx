// import SwitchableField from '@/components/SwitchableField'
// import { Input } from '@heroui/input'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import type { MessageKey } from '@/stores/widgetSettings/types'

// type SimpleMessageFieldProps = {
//   messageKey: Extract<MessageKey, 'limitShows' | 'limitWins' | 'allPrizesGiven'>
//   title: string
//   placeholder: string
// }

// const SimpleMessageField = ({ messageKey, title, placeholder }: SimpleMessageFieldProps) => {
//   const { settings, setMessageEnabled, setMessageText } = useFieldsSettings()
//   const getErrors = useWidgetSettingsStore(s => s.getErrors)
//   const showValidation = useWidgetSettingsStore(s => s.validationVisible)

//   const messageBranch = settings?.messages?.[messageKey]
//   if (!messageBranch) return null

//   const { enabled, text } = messageBranch
//   const errs = showValidation ? getErrors(`fields.messages.${messageKey}`) : []
//   const errorText = errs.find(e => e.path.endsWith('text'))?.message

//   return (
//     <SwitchableField
//       classNames={{ title: 'font-normal' }}
//       enabled={enabled}
//       onToggle={enabled => setMessageEnabled(messageKey, enabled)}
//       title={title}
//     >
//       <Input
//         radius="sm"
//         placeholder={placeholder}
//         classNames={{ input: 'placeholder:text-[#AFAFAF]' }}
//         value={text ?? ''}
//         isInvalid={enabled && Boolean(errorText)}
//         errorMessage={errorText}
//         onValueChange={value => setMessageText(messageKey, value)}
//       />
//     </SwitchableField>
//   )
// }

// export default SimpleMessageField
