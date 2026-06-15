import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { createPortal } from 'react-dom'
import { cn } from '@heroui/theme'

import ChatEmbedRuntime from './embedded/embedRuntime'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

type FloatingPreviewProps = {
  onClose: () => void
}

const ChatFloatingPreview = ({ onClose }: FloatingPreviewProps) => {
  const [mounted, setMounted] = useState(false)

  const { triggerPosition, windowFormat } = useWidgetSettingsStore(
    useShallow(s => {
      const settings = (s.settings?.widget as ChatWidgetType)
      return {
        triggerPosition: settings.triggerPosition ?? defaults.triggerPosition,
        windowFormat: settings.windowFormat ?? defaults.windowFormat,
      }
    })
  )
  const isSidebar = windowFormat === 'sidebar'

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (typeof document === 'undefined' || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-1200 bg-black/20 backdrop-blur-sm flex">
      <button
        type="button"
        onClick={onClose}
        className={cn(
          'absolute right-6 top-6 rounded-full',
          'border border-white/40 bg-white/80 px-3 py-1',
          'text-sm text-gray-700 shadow',
        )}
      >
        Закрыть
      </button>
      <div className={cn(
        // Боковая панель — на всю высоту у края; модальное окно — снизу с отступом.
        isSidebar ? 'h-full' : 'mt-auto mb-6',
        triggerPosition === 'bottom-right'
          ? 'ml-auto mr-0'
          : 'mr-auto ml-0',
      )}>
        <ChatEmbedRuntime preview />
      </div>
    </div>,
    document.body
  )
}

export default ChatFloatingPreview
