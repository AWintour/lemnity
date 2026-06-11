/** Полноразмерный интерактивный превью: сценарий «кнопка → уведомление → форма». */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@heroui/theme'
import CallbackLauncher from './CallbackLauncher'

const CallbackFloatingPreview = ({ onClose }: { onClose: () => void }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true); return () => setMounted(false) }, [])
  if (typeof document === 'undefined' || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-1200 bg-black/30 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className={cn('absolute right-6 top-6 z-10 rounded-full border border-white/40 bg-white/85 px-3 py-1 text-sm text-gray-700 shadow')}
      >
        Закрыть
      </button>
      {/* Сценарий вживую: кнопка-лаунчер в правом нижнем углу → уведомление → форма */}
      <div className="absolute bottom-8 right-8">
        <CallbackLauncher />
      </div>
    </div>,
    document.body
  )
}

export default CallbackFloatingPreview
