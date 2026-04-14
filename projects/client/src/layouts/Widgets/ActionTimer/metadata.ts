// import { lazy } from 'react'
// import type { WidgetDefinition } from '@/layouts/Widgets/registry'
// import ActionTimerDesktopScreen from './ActionTimerDesktopScreen'
// import ActionTimerMobileScreen from './ActionTimerMobileScreen'
// import CountdownField from '@/layouts/Widgets/CountDown/CountdownField'
// import ActionTimerSettings from './ActionTimerSettings'

// export const actionTimerWidgetMetadata: Pick<WidgetDefinition, 'preview' | 'settings' | 'actions'> =
//   {
//     preview: {
//       panel: lazy(() => import('./CountDownPreview')),
//       desktopScreens: {
//         main: ActionTimerDesktopScreen,
//         prize: ActionTimerDesktopScreen,
//         panel: ActionTimerDesktopScreen
//       },
//       mobile: ActionTimerMobileScreen
//     },
//     settings: {
//       sections: [
//         { id: 'actionTimer.countdown', Component: CountdownField },
//         { id: 'actionTimer.promo', Component: ActionTimerSettings }
//       ]
//     },
//     actions: [
//       {
//         id: 'actionTimer.submit',
//         name: 'submit'
//       },
//       {
//         id: 'actionTimer.close',
//         name: 'close'
//       }
//     ]
//   }
