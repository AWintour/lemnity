import { useState } from 'react'
import { Button } from '@heroui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover'
import ProfileButton from '../ProfileButton/ProfileButton'
import './Header.css'
import iconLight from '../../assets/icons/light.svg'
import lemnityLogo from '@/assets/logos/lemnity.svg'
import { useSidebarStore } from '@/stores/sidebarStore'
import SvgIcon from '@/components/SvgIcon'
import FeedbackPopover from '@/components/FeedbackPopover/FeedbackPopover'
import iconMenuOpened from '@/assets/icons/menu-opened.svg'
import iconMenuClosed from '@/assets/icons/menu-closed.svg'

const Header = () => {
  const { isVisible, toggle } = useSidebarStore()
  // nonce пересоздаёт содержимое попапа при каждом открытии,
  // чтобы после успешной отправки форма открывалась заново чистой.
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackNonce, setFeedbackNonce] = useState(0)

  const getAriaLabel = () => (isVisible ? 'Свернуть боковую панель' : 'Показать боковую панель')

  return (
    <header className="h-17.5 min-h-17.5 flex items-center justify-between mx-5">
      <div className="flex items-center gap-3">
        <Button
          isIconOnly
          radius="full"
          className="p-0 m-0 bg-transparent w-[38px] h-[38px]"
          color="default"
          onClick={toggle}
          aria-label={getAriaLabel()}
        >
          <SvgIcon
            src={isVisible ? iconMenuOpened : iconMenuClosed}
            className="text-gray-500"
            size="24px"
          />
        </Button>

        <a href="/" className="flex items-center">
          <div className="w-42 h-9.5">
            <SvgIcon src={lemnityLogo} alt="Lemnity" />
          </div>
        </a>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500 flex flex-row gap-2.5">
          <Popover
            placement="bottom-end"
            offset={12}
            isOpen={feedbackOpen}
            onOpenChange={open => {
              setFeedbackOpen(open)
              if (open) setFeedbackNonce(n => n + 1)
            }}
          >
            <PopoverTrigger>
              <Button
                isIconOnly
                radius="full"
                className="bg-white w-[38px] h-[38px]"
                color="default"
                aria-label="Есть идея или замечания?"
              >
                <img src={iconLight} alt="Идеи и замечания" className="w-[19px] h-[19px]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-2xl">
              <FeedbackPopover
                key={feedbackNonce}
                onSent={() => setTimeout(() => setFeedbackOpen(false), 1500)}
              />
            </PopoverContent>
          </Popover>
          <ProfileButton />
        </div>
      </div>
    </header>
  )
}

export default Header
