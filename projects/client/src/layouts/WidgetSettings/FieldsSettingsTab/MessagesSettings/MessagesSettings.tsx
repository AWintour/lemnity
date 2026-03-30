// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import SimpleMessageField from './SimpleMessageField'
// import OnWinMessageSection from './OnWinMessageSection'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'

// const MessagesSettings = () => {
//   const { settings } = useFieldsSettings()
//   const getErrors = useWidgetSettingsStore(s => s.getErrors)
//   const showValidation = useWidgetSettingsStore(s => s.validationVisible)
//   const widgetType = useWidgetSettingsStore(s => s?.settings?.widgetType)

//   if (!settings?.messages) return null
//   const errLimitShows = showValidation ? getErrors('fields.messages.limitShows') : []
//   const errLimitWins = showValidation ? getErrors('fields.messages.limitWins') : []
//   const errAllPrizes = showValidation ? getErrors('fields.messages.allPrizesGiven') : []

//   // Keep subscriptions to trigger rerender when errors change
//   void errLimitShows
//   void errLimitWins
//   void errAllPrizes

//   return (
//     <div className="flex flex-col gap-3">
//       <span className="text-2xl font-rubik">Настройка сообщений</span>

//       <OnWinMessageSection />

//       {widgetType === WidgetTypeEnum.ACTION_TIMER ? null : (
//         <>
//           <SimpleMessageField
//             messageKey="limitShows"
//             title="Сообщение при превышении лимита показов"
//             placeholder="Вы уже видели эту игру"
//           />

//           <SimpleMessageField
//             messageKey="limitWins"
//             title="Сообщение при превышении лимита побед"
//             placeholder="Вы уже получили наш приз, испытайте удачу в другой игре"
//           />

//           <SimpleMessageField
//             messageKey="allPrizesGiven"
//             title="Сообщение при превышении лимита выигрышей"
//             placeholder="Все призы выданы! Следите за новостями"
//           />
//         </>
//       )}
//     </div>
//   )
// }

// export default MessagesSettings
