import { Button } from '@heroui/button'
import ProfileButton from '../ProfileButton/ProfileButton'
import './Header.css'
import iconLight from '../../assets/icons/light.svg'
import iconBell from '../../assets/icons/bell.svg'
import lemnityBlackLogo from '@/assets/logos/lemnity-black-logo.svg'
import { useSidebarStore } from '@/stores/sidebarStore'
import SvgIcon from '@/components/SvgIcon'
import iconMenuOpened from '@/assets/icons/menu-opened.svg'
import iconMenuClosed from '@/assets/icons/menu-closed.svg'
import { cn } from '@heroui/theme'
import { PaymentTrigger } from '@/components/payment'

const Header = () => {
  const { isVisible, toggle } = useSidebarStore()

  const getAriaLabel = () => (isVisible ? 'Свернуть боковую панель' : 'Показать боковую панель')

  return (
    <header className='h-17.5 min-h-17.5 flex items-center justify-between mx-5'>
      <div className='flex items-center gap-3'>
        <Button
          isIconOnly
          radius='full'
          className='p-0 m-0 bg-transparent w-[38px] h-[38px]'
          color='default'
          onClick={toggle}
          aria-label={getAriaLabel()}
        >
          <SvgIcon
            src={isVisible ? iconMenuOpened : iconMenuClosed}
            className='text-gray-500'
            size='24px'
          />
        </Button>

        <a href='/' className='flex items-center'>
          <div className='w-42 h-9.5'>
            <SvgIcon src={lemnityBlackLogo} alt='Lemnity' />
          </div>
        </a>
        <div
          className={cn(
            'w-14.5 h-5.75 flex items-center justify-center',
            'text-black text-[12px] leading-3.5 bg-[#D1CECE] rounded-[3px]'
          )}
        >
          βeta
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='text-sm text-gray-500 flex flex-row gap-2.5'>
          <PaymentTrigger />
          <Button isIconOnly radius='full' className='bg-white w-[38px] h-[38px]' color='default'>
            <img src={iconLight} alt='Light' className='h-8 w-auto w-[19px] h-[19px]' />
          </Button>
          <Button isIconOnly radius='full' className='bg-white w-[38px] h-[38px]' color='default'>
            <img src={iconBell} alt='Bell' className='h-8 w-auto w-[19px] h-[19px]' />
          </Button>
          <ProfileButton />
        </div>
      </div>
    </header>
  )
}

export default Header
