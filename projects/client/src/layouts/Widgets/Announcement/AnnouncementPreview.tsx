import { useEffect, useRef, useState, type HTMLProps } from 'react'

import AnnouncementWidget from './AnnouncementWidget'
import { FadeInOut } from '@/components'

type AnnouncementPreviewProps = Pick<HTMLProps<HTMLElement>, 'className'> & {
  // className: React.HTMLProps<HTMLElement>['className']
  rewardScreenEnabled: boolean
}

const AnnouncementPreview = (props: AnnouncementPreviewProps) => {
  const annInfoScreenRef = useRef<HTMLDivElement | null>(null)
  const annRewardScreenRef = useRef<HTMLDivElement | null>(null)

  const [annInfoScreenRect, setAnnInfoScreenRect] =
    useState<DOMRect | null>(null)
  const [annRewardScreenRect, setAnnRewardScreenRect] =
    useState<DOMRect | null>(null)

  useEffect(() => {
    if (!annInfoScreenRef.current || !annRewardScreenRef.current) {
      return
    }

    const annInfoScreenObserver = new ResizeObserver(() => {
      if (!annInfoScreenRef.current) return
      setAnnInfoScreenRect(
        annInfoScreenRef.current.getBoundingClientRect()
      )
    })
    annInfoScreenObserver.observe(annInfoScreenRef.current)

    const annRewardScreenObserver = new ResizeObserver(() => {
      if (!annRewardScreenRef.current) return
      setAnnRewardScreenRect(
        annRewardScreenRef.current.getBoundingClientRect()
      )
    })
    annRewardScreenObserver.observe(annRewardScreenRef.current)

    return () => {
      annInfoScreenObserver.disconnect()
      annRewardScreenObserver.disconnect()
    }
  }, [])

  return (
    // don't look at the vertical margins =w=
    // i was fed the fuck up with how much gaps were bitching at me
    <div className='w-full h-full flex flex-col overflow-auto select-none'>
      <div className='flex flex-col gap-1 h-full'>
        <span className='text-xs self-center'>
          Главный экран
        </span>
        <div
          className={props.className}
          style={{
            height: annInfoScreenRect
              ? `${annInfoScreenRect.height}px`
              : '228px'
          }}
        >
          <AnnouncementWidget
            ref={annInfoScreenRef}
            variant='announcement'
            focused
          />
        </div>

        <FadeInOut visible={props.rewardScreenEnabled}>
          <span className='text-xs self-center mb-1'>
            Экран выигрыша
          </span>
          <div
            className={props.className}
            style={{
              height: annRewardScreenRect
                ? `${annRewardScreenRect.height}px`
                : '228px'
            }}
          >
            <AnnouncementWidget
              ref={annRewardScreenRef}
              variant='reward'
              focused
            />
          </div>
        </FadeInOut>
      </div>
    </div>
  )
}

export default AnnouncementPreview
