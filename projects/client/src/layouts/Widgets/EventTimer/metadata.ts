import { lazy } from 'react'
import type { WidgetDefinition } from '@/layouts/Widgets/registry'

type MetadataType = Pick<WidgetDefinition, 'preview' | 'settings'>

export const eventTimerWidgetMetadata: MetadataType = {
  preview: {
    panel: lazy(() => import('./WidgetPreview')),
    desktopScreens: {},
    mobile: null,
    inline: lazy(() => import('./EventTimerFloatingPreview')),
    launcher: 'inline'
  },
  settings: {
    sections: [
      {
        id: 'event-timer.widget-settings',
        Component: lazy(() => import('./EventTimerWidgetSettings')),
      },
    ]
  }
}
