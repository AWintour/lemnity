// import { lazy } from 'react'
// import type { WidgetDefinition } from '@/layouts/Widgets/registry'
// import WheelDesktopScreen from './WheelDesktopScreen'
// import WheelMobileScreen from './WheelMobileScreen'
// import WheelSectorsField from '@/layouts/WidgetSettings/FieldsSettingsTab/WheelSectorsField/WheelSectorsField'

// export const wheelWidgetMetadata: Pick<WidgetDefinition, 'preview' | 'settings' | 'actions'> = {
//   preview: {
//     panel: lazy(() => import('./WheelOfFortunePreview')),
//     desktopScreens: {
//       main: WheelDesktopScreen,
//       prize: WheelDesktopScreen,
//       panel: WheelDesktopScreen
//     },
//     mobile: WheelMobileScreen
//   },
//   settings: {
//     sections: [{ id: 'wheel.sectors', Component: WheelSectorsField }]
//   },
//   actions: [
//     {
//       id: 'wheel.spin',
//       name: 'spin'
//     },
//     {
//       id: 'wheel.close',
//       name: 'close'
//     }
//   ]
// }
