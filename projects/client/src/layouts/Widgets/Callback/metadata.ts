import { lazy } from 'react'
import type { WidgetDefinition } from '@/layouts/Widgets/registry'

type MetadataType = Pick<WidgetDefinition, 'preview' | 'settings'>

export const callbackWidgetMetadata: MetadataType = {
  preview: {
    panel: lazy(() => import('./WidgetPreview')),
    desktopScreens: {},
    mobile: null,
    inline: lazy(() => import('./CallbackFloatingPreview')),
    launcher: 'inline',
  },
  settings: {
    sections: [
      {
        id: 'callback.widget-settings',
        Component: lazy(() => import('./CallbackWidgetSettings')),
      },
    ],
  },
}
