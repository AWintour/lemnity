import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import ChatEmbedRuntime from './embedded/embedRuntime'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'
import { resolveChatTriggerPosition } from './resolveTriggerPosition'

const WidgetPreview = () => {
  const { triggerPosition, windowFormat } = useWidgetSettingsStore(
    useShallow(s => {
      const settings = (s.settings?.widget as ChatWidgetType)
      const displayPosition = (s.settings?.display as { icon?: { position?: 'bottom-left' | 'top-right' | 'bottom-right' } } | undefined)?.icon?.position
      return {
        // «Отображение» (display.icon.position) перекрывает «Настройку виджета» — как в embedRuntime.
        triggerPosition: resolveChatTriggerPosition(
          displayPosition,
          settings.triggerPosition ?? defaults.triggerPosition,
        ),
        windowFormat: settings.windowFormat ?? defaults.windowFormat,
      }
    })
  )
  const isSidebar = windowFormat === 'sidebar'

  return (
    <div className='w-full h-full flex'>
      <div
        className={cn(
          // Боковая панель — на всю высоту области превью; модальное — снизу с отступом.
          isSidebar ? 'h-full' : 'mt-auto mb-3',
          triggerPosition === 'bottom-right'
            ? 'ml-auto mr-0'
            : 'ml-0 mr-auto',
        )}
      >
        <ChatEmbedRuntime preview />
      </div>
    </div>
  )
}

export default WidgetPreview
