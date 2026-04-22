import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@heroui/theme'

import NotificationEmbedRuntime from './embedded/embedRuntime'

import { useAppSelector } from '@/stores/redux/hooks'
import { selectTriggerPosition } from './notificationSlice'

type FloatingPreviewProps = {
  onClose?: () => void
}

const NotificationFloatingPreview = ({ onClose }: FloatingPreviewProps) => {
  const [mounted, setMounted] = useState(false)

  const triggerPosition = useAppSelector(selectTriggerPosition)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (typeof document === 'undefined' || !mounted) return null

  return createPortal(
    <div className='fixed inset-0 z-1200 bg-black/20 backdrop-blur-sm flex'>
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
        'mt-auto mb-6',
        triggerPosition === 'bottom-right'
          ? 'ml-auto mr-0'
          : 'mr-auto ml-0',
      )}>
        <NotificationEmbedRuntime preview />
      </div>
    </div>,
    document.body
  )
}

export default NotificationFloatingPreview

