import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@heroui/theme'

import {
  ActionTimerContent,
  ActionTimerRewardScreen,
} from './embedded/embedRuntime'

import { useAppSelector } from '@/stores/redux/hooks'
import {
  initialState,
  selectBackgroundColor,
  selectBorderRadius,
  selectColorScheme,
  selectContentAlignment,
  selectContentPlacement,
  selectContentType,
  selectContentUrl,
  selectRewardScreenEnabled,
} from './actionTimerSlice'
import useUrlImage from '@/hooks/useUrlImage'
import { FadeInOut } from '@/components'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

type ContentProps = {
  reward?: boolean
}

const Content = ({ reward }: ContentProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [contentRect, setContentRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!contentRef.current) {
      return
    }
    
    const contentObserver = new ResizeObserver(() => {
      if (!contentRef.current) return
      setContentRect(
        contentRef.current.getBoundingClientRect()
      )
    })
    contentObserver.observe(contentRef.current)

    return () => contentObserver.disconnect()
  }, [])


  const backgroundColor =
    useAppSelector(selectBackgroundColor)
      || initialState.appearence.backgroundColor
  const borderRadius =
    useAppSelector(selectBorderRadius)
  const colorScheme =
    useAppSelector(selectColorScheme)
  const contentType =
    useAppSelector(selectContentType)
  const contentAlignment =
    useAppSelector(selectContentAlignment)
  const contentUrl =
    useAppSelector(selectContentUrl)
  const contentPlacement =
    useAppSelector(selectContentPlacement)
  const rewardScreenEnabled =
    useAppSelector(selectRewardScreenEnabled)

  const {
    base64Image: contentBase64Image,
    // error,
    isLoading,
  } = useUrlImage(contentUrl)

  const backgroundImage = contentUrl && !isLoading
    ? contentBase64Image as string
    : noBackgroundImageUrl

  const dialogContentStyles: CSSProperties = {
    backgroundColor:
      colorScheme === 'custom'
        ? backgroundColor
        : initialState.appearence.backgroundColor,
    borderRadius: borderRadius,
  }

  if (contentType === 'background') {
    dialogContentStyles.backgroundImage = `url('${backgroundImage}')`
    dialogContentStyles.backgroundSize = 'cover'
  }

  const imageStyle: CSSProperties = {
    objectPosition: contentAlignment
  }

  return (
    <div
      className={cn(
        'scale-40 origin-top-left pointer-events-none',
        'ml-6 mt-2.5 transition-height duration-350',
      )}
      style={{
        height: contentRect
          ? `${contentRect.height}px`
          : '240px'
      }}
    >
      <div
        ref={contentRef}
        className={cn(
          'shadow-[0px_8px_15px_6px_rgba(0,0,0,0.15)]',
          'w-[928px] min-h-[525px]',
          'px-5 py-3.75 flex items-stretch gap-3.75',
          contentPlacement === 'right'
            ? 'flex-row'
            : 'flex-row-reverse',
          'transition-colors duration-250',
        )}
        style={dialogContentStyles}
      >
        {reward
          ? <ActionTimerRewardScreen />
          : <ActionTimerContent onButtonPress={() => {}} />
        }
        
        <div className='self-stretch'>
          {contentType === 'imageOnSide' && (
            <img
              src={contentUrl}
              alt='Изображение'
              className='w-full h-full object-cover rounded-[15px]'
              style={imageStyle}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const WidgetPreview = () => {
  const rewardScreenEnabled = useAppSelector(selectRewardScreenEnabled)
  
  return (
    <div className='w-full h-full flex'>
      <div
        className={cn(
          'w-full h-full flex flex-col overflow-auto select-none',
        )}
      >
        <span className='text-xs self-center mb-2'>
          Главный экран
        </span>
        <Content />

        <FadeInOut visible={rewardScreenEnabled}>
          <div className='mb-10 flex flex-col'>
            <span className='text-xs self-center mt-3 mb-1.5'>
              Экран выигрыша
            </span>
            <Content reward />
          </div>
        </FadeInOut>
      </div>
    </div>
  )
}

export default WidgetPreview
