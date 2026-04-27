// import CheckboxField from '@/components/CheckboxField'
// import useWidgetSettingsStore, {
//   useWidgetStaticDefaults,
//   type FieldsSettings
// } from '@/stores/widgetSettingsStore'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'

// const ContactsField = () => {
//   const { setContactField } = useFieldsSettings()
//   const staticDefaults = useWidgetStaticDefaults()
//   const contacts = useWidgetSettingsStore(s =>
//     withDefaultsPath(
//       s.settings?.fields,
//       'contacts',
//       staticDefaults?.fields.contacts as FieldsSettings['contacts']
//     )
//   )
//   const { phone, email, name } = contacts
//   const { enabled: phoneEnabled, required: phoneRequired } = phone ?? {
//     enabled: false,
//     required: false
//   }
//   const { enabled: emailEnabled, required: emailRequired } = email ?? {
//     enabled: false,
//     required: false
//   }
//   const { enabled: nameEnabled, required: nameRequired } = name ?? {
//     enabled: false,
//     required: false
//   }

//   return (
//     <div className="flex flex-col p-3 rounded-lg border border-gray-200 gap-3">
//       <div className="flex flex-row items-center gap-2">
//         <div className="flex flex-col gap-1 flex-1">
//           <span className="text-black text-base font-medium">Контакты</span>
//         </div>
//       </div>
//       <div className="flex flex-col gap-2">
//         <CheckboxField
//           label="Имя"
//           showRequired
//           checked={nameEnabled}
//           onChange={enabled => setContactField(
//             'name',
//             enabled,
//             nameRequired
//           )}
//           required={nameRequired}
//           onRequiredChange={required => setContactField(
//             'name',
//             nameEnabled,
//             required
//           )}
//         />

//         <CheckboxField
//           label="Телефон"
//           showRequired
//           checked={phoneEnabled}
//           onChange={enabled => setContactField(
//             'phone',
//             enabled,
//             phoneRequired
//           )}
//           required={phoneRequired}
//           onRequiredChange={required => setContactField(
//             'phone',
//             phoneEnabled,
//             required
//           )}
//         />

//         <CheckboxField
//           label="Email"
//           showRequired
//           checked={emailEnabled}
//           onChange={enabled => setContactField(
//             'email',
//             enabled,
//             emailRequired
//           )}
//           required={emailRequired}
//           onRequiredChange={required => setContactField(
//             'email',
//             emailEnabled,
//             required
//           )}
//         />
//       </div>
//     </div>
//   )
// }

// export default ContactsField
