import { lazy } from 'react'
import type { WidgetDefinition } from '@/layouts/Widgets/registry'

type MetadataType = Pick<WidgetDefinition, 'preview' | 'settings'>

export const chatWidgetMetadata: MetadataType = {
  preview: {
    panel: lazy(() => import('./WidgetPreview')),
    desktopScreens: {},
    mobile: null,
    inline: lazy(() => import('./ChatFloatingPreview')),
    launcher: 'inline'
  },
  settings: {
    sections: [
      {
        id: 'chat.general',
        Component: lazy(() => import('./ChatGeneralSettings')),
      },
      {
        id: 'chat.schedule',
        Component: lazy(() => import('./ChatScheduleSettings')),
      },
      {
        id: 'chat.auto-open',
        Component: lazy(() => import('./ChatAutoOpenSettings')),
      },
      {
        id: 'chat.appearance',
        Component: lazy(() => import('./ChatAppearanceSettings')),
      },
      {
        id: 'chat.header',
        Component: lazy(() => import('./ChatHeaderSettings')),
      },
      {
        id: 'chat.info-headings',
        Component: lazy(() => import('./ChatInfoHeadingsSettings')),
      },
      {
        id: 'chat.contacts',
        Component: lazy(() => import('./ChatContactsSettings')),
      },
      {
        id: 'chat.personalization',
        Component: lazy(() => import('./ChatPersonalizationSettings')),
      },
      {
        id: 'chat.callback-soon',
        Component: lazy(() => import('./ChatCallbackSettings')),
      },
      {
        id: 'chat.widget-settings',
        Component: lazy(() => import('./ChatWidgetSettings')),
      },
      {
        id: 'chat.scenario',
        Component: lazy(() => import('./ScenarioEditor')),
      },
      {
        id: 'chat.company-contacts',
        Component: lazy(() => import('./ChatCompanyContactsSettings')),
      },
      {
        id: 'chat.ai-agent',
        Component: lazy(() => import('./ChatAiAgentSettings')),
      },
    ]
  }
}
