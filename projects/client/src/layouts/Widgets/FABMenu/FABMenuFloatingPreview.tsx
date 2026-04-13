import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import FabMenuWidget from './FabMenuWidget'

type FABMenuFloatingPreviewProps = {
  onClose: () => void
}

const FABMenuFloatingPreview = ({ onClose }: FABMenuFloatingPreviewProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (typeof document === 'undefined' || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[1200] bg-black/20 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full border border-white/40 bg-white/80 px-3 py-1 text-sm text-gray-700 shadow"
      >
        Закрыть
      </button>
      <FabMenuWidget
        anchorBaseClassName="absolute bottom-6"
        anchorOffsetClassName={{ left: 'left-6', right: 'right-6' }}
        listClassName="w-full max-w-[320px]"
        triggerClassName="h-20 min-w-20 flex flex-row"
        // signatureClassName="bg-gray-200/90"
      />
    </div>,
    document.body
  )
}

export default FABMenuFloatingPreview
