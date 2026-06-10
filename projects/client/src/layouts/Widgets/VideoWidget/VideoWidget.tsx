import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import FreePlanBrandingLink from '@/components/FreePlanBrandingLink'
import { BrTagsOnNewlines, SvgIcon } from '@/components'
import * as Icons from '@/components/Icons'
import VideoLeadForm, { type VideoLeadFormValues } from './VideoLeadForm'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { sendPublicRequest } from '@/common/api/publicApi'
import { useMobileContext } from './embedded/MobileContext'
import { getFontWeightClass } from './utils/getFontWeightClass'

import type { VideoWidgetType } from '@lemnity/widget-config/widgets/video-widget'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import { videoWidgetDefaults } from './defaults'
import crossIcon from '@/assets/icons/cross.svg'

// Kept for compatibility with embedded wrappers (single-screen widget)
export type VideoWidgetVariant = 'announcement' | 'reward'

type VideoWidgetProps = {
  ref?: Ref<HTMLDivElement>
  variant?: VideoWidgetVariant
  focused?: boolean
  onButtonPress?: () => void
  /** Принудительно показать экран формы (для превью в редакторе) */
  previewForm?: boolean
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
)
const VolumeOnIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" /></svg>
)
const VolumeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13 0l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
)

const VideoWidget = ({ ref, ...props }: VideoWidgetProps) => {
  const {
    borderRadius,

    videos,
    posterUrl,
    posterEnabled,
    muted,
    loop,
    showControls,
    showProgressBar,

    title,
    titleColor,
    titleFontWeight,
    buttonText,
    buttonFontColor,
    buttonBackgroundColor,
    icon,
    link,

    formEnabled,
    brandingEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as VideoWidgetType
      const a = widget.appearence
      const v = widget.videoSettings
      const i = widget.infoSettings
      const d = videoWidgetDefaults

      return {
        borderRadius: a.borderRadius ?? d.appearence.borderRadius,

        videos: v.videos ?? d.videoSettings.videos,
        posterUrl: v.posterUrl ?? d.videoSettings.posterUrl,
        posterEnabled: v.posterEnabled ?? d.videoSettings.posterEnabled,
        muted: v.muted ?? d.videoSettings.muted,
        loop: v.loop ?? d.videoSettings.loop,
        showControls: v.showControls ?? d.videoSettings.showControls,
        showProgressBar: v.showProgressBar ?? d.videoSettings.showProgressBar,

        title: i.title ?? d.infoSettings.title,
        titleColor: i.titleColor ?? d.infoSettings.titleColor,
        titleFontWeight: i.titleFontWeight ?? d.infoSettings.titleFontWeight,
        buttonText: i.buttonText ?? d.infoSettings.buttonText,
        buttonFontColor: i.buttonFontColor ?? d.infoSettings.buttonFontColor,
        buttonBackgroundColor:
          i.buttonBackgroundColor ?? d.infoSettings.buttonBackgroundColor,
        icon: i.icon ?? d.infoSettings.icon,
        link: i.link ?? d.infoSettings.link,

        formEnabled: widget.formEnabled ?? d.formEnabled,
        brandingEnabled: widget.brandingEnabled ?? d.brandingEnabled,
      }
    })
  )

  const widgetId = useWidgetSettingsStore(s => s.settings?.id)
  const projectId = useWidgetSettingsStore(s => s.projectId)

  // «Превью видео» включено → показываем постер и НЕ автозапускаем
  const autoplay = !posterEnabled
  const playlist = videos.length > 0 ? videos : ['']

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [isMuted, setIsMuted] = useState(muted)
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const mobileContext = useMobileContext()

  // sync muted flag to element
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted
  }, [isMuted])

  // Живая актуализация превью при изменении настроек:
  // тумблер «Без звука» → мьют
  useEffect(() => {
    setIsMuted(muted)
  }, [muted])

  // тумблер «Превью видео» (autoplay = !posterEnabled) → авто-плей/пауза
  useEffect(() => {
    const el = videoRef.current
    setIsPlaying(autoplay)
    if (!el) return
    if (autoplay) void el.play().catch(() => {})
    else el.pause()
  }, [autoplay])

  // изменение списка видео → начинаем с первого
  useEffect(() => {
    setCurrentIndex(0)
  }, [videos])

  // Проигрывание по очереди: при завершении — следующее видео
  const handleEnded = () => {
    if (playlist.length <= 1) {
      if (loop && videoRef.current) {
        videoRef.current.currentTime = 0
        void videoRef.current.play()
      }
      return
    }
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next < playlist.length) return next
      return loop ? 0 : prev
    })
  }

  const handleTogglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      void el.play()
      setIsPlaying(true)
    } else {
      el.pause()
      setIsPlaying(false)
    }
  }

  const handleToggleMute = () => setIsMuted(m => !m)

  const handleTimeUpdate = () => {
    const el = videoRef.current
    if (!el || !el.duration) return
    setProgress(el.currentTime / el.duration)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current
    if (!el || !el.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.currentTime = fraction * el.duration
    setProgress(fraction)
  }

  const handleCtaPress = () => {
    if (formEnabled) {
      setShowForm(true)
      props.onButtonPress?.()
      return
    }
    if (link) window.open(link, '_blank')
    props.onButtonPress?.()
  }

  const handleFormSubmit = (values: VideoLeadFormValues) => {
    if (widgetId && projectId) {
      void sendPublicRequest({
        widgetId,
        fullName: values.name,
        phone: values.phone,
        email: values.email,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })
    }
    setShowForm(false)
  }

  const handleClose = () => {
    if (mobileContext) {
      mobileContext.dispatch({ type: 'close' })
      return
    }
    setHidden(true)
  }

  const containerStyle: CSSProperties = { borderRadius }
  const IconComponent = Icons[icon as Icon]
  // В превью редактора форму показываем принудительно (при включённой форме)
  const formScreen = props.previewForm || showForm

  return (
    <div
      ref={ref}
      data-lemnity-video
      className={cn(
        // Размеры как у виджета «Анонс»: w-99.5 (398px) × min-h-129.5 (518px)
        'relative w-99.5 min-h-129.5 max-w-full overflow-hidden bg-black',
        'flex flex-col select-none',
        hidden && 'hidden',
      )}
      style={containerStyle}
    >
      {/* Видео на весь фон (плейлист до 3 — проигрываются по очереди) */}
      {!formScreen && (
        <video
          key={currentIndex}
          ref={videoRef}
          src={playlist[currentIndex] || undefined}
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={autoplay || isPlaying || currentIndex > 0}
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
        />
      )}

      {/* Форма захвата лида (после нажатия CTA) */}
      {formScreen && (
        <div className="absolute inset-0 z-10 overflow-auto bg-white">
          <VideoLeadForm onSubmit={handleFormSubmit} />
        </div>
      )}

      {/* Кнопка закрытия */}
      <Button
        isIconOnly
        className={cn(
          'absolute top-3 right-3 z-20 min-w-9 w-9 h-9 rounded-xl',
          'bg-white/90 pointer-events-auto',
        )}
        onPress={handleClose}
      >
        <div className="w-3.5 h-3.5 fill-black">
          <SvgIcon src={crossIcon} alt="Close" />
        </div>
      </Button>

      {/* Нижний оверлей */}
      {!formScreen && (
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 px-4 pt-16 pb-3',
          'flex flex-col gap-3',
          'bg-gradient-to-t from-black/80 via-black/45 to-transparent',
        )}
      >
        <span
          className={cn('text-[22px] leading-tight', getFontWeightClass(titleFontWeight))}
          style={{ color: titleColor }}
        >
          <BrTagsOnNewlines input={title} />
        </span>

        <div className="flex items-center gap-2">
          <Button
            className="flex-1 h-12 rounded-2xl text-[18px] font-medium"
            style={{ color: buttonFontColor, backgroundColor: buttonBackgroundColor }}
            onPress={handleCtaPress}
          >
            {icon !== 'HeartDislike' && IconComponent && (
              <div className="w-4 h-4">
                <IconComponent />
              </div>
            )}
            {buttonText}
          </Button>

          {showControls && (
            <>
              <Button
                isIconOnly
                aria-label="play-pause"
                className="min-w-12 w-12 h-12 rounded-2xl bg-white/90 text-black"
                onPress={handleTogglePlay}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </Button>
              <Button
                isIconOnly
                aria-label="mute"
                className="min-w-12 w-12 h-12 rounded-2xl bg-white/90 text-black"
                onPress={handleToggleMute}
              >
                {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
              </Button>
            </>
          )}
        </div>

        {showProgressBar && (
          <div
            className="h-1.5 w-full rounded-full bg-white/30 cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}

        {brandingEnabled && (
          <div className="flex justify-center pt-0.5">
            <FreePlanBrandingLink />
          </div>
        )}
      </div>
      )}
    </div>
  )
}

export default VideoWidget
