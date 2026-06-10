import { lazy } from 'react'
import type { WidgetDefinition } from '@/layouts/Widgets/registry'

type MetadataType = Pick<WidgetDefinition, 'preview' | 'settings'>

export const videoWidgetMetadata: MetadataType = {
  preview: {
    panel: lazy(() => import('./WidgetPreview')),
    desktopScreens: {},
    mobile: null,
    inline: lazy(() => import('./VideoWidgetFloatingPreview')),
    launcher: 'inline'
  },
  settings: {
    sections: [
      {
        id: 'video.widget-settings',
        Component: lazy(() => import('./VideoWidgetSettings')),
      },
    ]
  }
}
