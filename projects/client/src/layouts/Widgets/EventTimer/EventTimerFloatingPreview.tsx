import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@heroui/theme'

import EventTimerEmbedRuntime from './embedded/embedRuntime'

type FloatingPreviewProps = {
  onClose: () => void
}

const AnnouncementFloatingPreview = ({ onClose }: FloatingPreviewProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (typeof document === 'undefined' || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-1200 bg-black/20 backdrop-blur-sm">
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
      <EventTimerEmbedRuntime isPreview />
    </div>,
    document.body
  )
}

export default AnnouncementFloatingPreview

