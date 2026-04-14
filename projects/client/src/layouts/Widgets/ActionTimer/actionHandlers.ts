// import type { ActionHandler } from '../actions'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import { sendEvent } from '@/common/api/publicApi'

// export const actionTimerHandlers: Record<string, ActionHandler> = {
//   'actionTimer.submit': ctx => {
//     const helpers = ctx.helpers ?? {}
//     const setTimer = helpers.setTimer as ((ms: number, cb: () => void) => void) | undefined
//     const clearTimer = helpers.clearTimer as (() => void) | undefined
//     const setScreen = helpers.setScreen as ((screen: string) => void) | undefined
//     const widgetId = useWidgetSettingsStore.getState().settings?.id
//     const projectId = useWidgetSettingsStore.getState().projectId ?? undefined
//     if (widgetId) {
//       void sendEvent({
//         event_name: 'countdown.submit',
//         widget_id: widgetId,
//         project_id: projectId
//       })
//     }
//     if (setTimer && setScreen) {
//       clearTimer?.()
//       setTimer(1500, () => setScreen('prize'))
//     } else {
//       setScreen?.('prize')
//     }
//   }
// }
