import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import ChatEmbedRuntime from './embedded/embedRuntime'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const WidgetPreview = () => {
  const triggerPosition = useWidgetSettingsStore(
    useShallow(s => {
      const settings = (s.settings?.widget as ChatWidgetType)
      return settings.triggerPosition
          ?? defaults.triggerPosition
    })
  )

  return (
    <div className='w-full h-full flex'>
      <div
        className={cn(
          'mt-auto mb-3',
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
