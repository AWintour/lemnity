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
      // На вкладку «Отображение» перенесены: «Ограничения времени показа» (ChatScheduleSettings),
      // «Автоматически открывать чат» (ChatAutoOpenSettings — заменён «Автоматически» + «Настройки показа»)
      // и «Персонализированные приветствия» (ChatPersonalizationSettings).
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
      // «Согласие и политика» (ChatAgreementSettings) перенесён на вкладку «Отображение».
      {
        id: 'chat.callback-soon',
        Component: lazy(() => import('./ChatCallbackSettings')),
      },
      // «Форма / Кнопка» (ChatWidgetSettings) перенесена в «Отображение» → «Вид иконки» → «Кнопка».
      {
        id: 'chat.scenario',
        Component: lazy(() => import('./ScenarioEditor')),
      },
      {
        id: 'chat.company-contacts',
        Component: lazy(() => import('./ChatCompanyContactsSettings')),
      },
      {
        id: 'chat.company-socials',
        Component: lazy(() => import('./ChatSocialLinksSettings')),
      },
      {
        id: 'chat.ai-agent',
        Component: lazy(() => import('./ChatAiAgentSettings')),
      },
    ]
  }
}
