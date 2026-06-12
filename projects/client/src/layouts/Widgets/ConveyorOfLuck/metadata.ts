import { lazy } from 'react'
import type { WidgetDefinition } from '@/layouts/Widgets/registry'
import ConveyorDesktopScreen from './ConveyorDesktopScreen'
import ConveyorMobileScreen from './ConveyorMobileScreen'
import ConveyorSectorsField from '@/layouts/WidgetSettings/FieldsSettingsTab/ConveyorSectorsField/ConveyorSectorsField'

// «Конвейер Удачи» — клон «Колеса фортуны» с собственным визуалом (вертикальный барабан).
// Редактор секторов и действия (wheel.spin/close) общие с колесом.
export const conveyorWidgetMetadata: Pick<WidgetDefinition, 'preview' | 'settings' | 'actions'> = {
  preview: {
    panel: lazy(() => import('./ConveyorOfLuckPreview')),
    desktopScreens: {
      main: ConveyorDesktopScreen,
      prize: ConveyorDesktopScreen,
      panel: ConveyorDesktopScreen
    },
    mobile: ConveyorMobileScreen,
    // «Просмотр» как на сайте: затемнение + кнопка открытия окна → клик открывает окно.
    launcher: 'launcherOverlay',
    launcherOverlay: lazy(() => import('./LauncherOverlay'))
  },
  settings: {
    sections: [{ id: 'wheel.sectors', Component: ConveyorSectorsField }]
  },
  actions: [
    {
      id: 'wheel.spin',
      name: 'spin'
    },
    {
      id: 'wheel.close',
      name: 'close'
    }
  ]
}
