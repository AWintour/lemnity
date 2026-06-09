import { useState, useRef, useEffect } from 'react'
import userIcon from '../../assets/icons/user-circle.svg'
import powerIcon from '../../assets/icons/power.svg'
import useClickOutside from '../../hooks/useClickOutside'
import { Button } from '@heroui/button'
import SvgIcon from '../../components/SvgIcon'
import chevronUp from '../../assets/icons/chevronUp.svg'
import chevronDown from '../../assets/icons/chevronDown.svg'
import useAuthStore from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

// Общий личный кабинет lemnity.ru — единый профиль для всех продуктов (виджеты живут под
// зонтиком lemnity.ru). «Мой профиль» открывает профиль ЛК в новом окне. Настраивается через
// VITE_LK_URL, дефолт — прод-домен.
const LK_URL = import.meta.env.VITE_LK_URL || 'https://lemnity.ru'

const ProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const durationTimeout = 200
  const debounceTimeout = 30

  useClickOutside(dropdownRef, () => setIsOpen(false))

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setTimeout(() => setIsAnimating(true), debounceTimeout)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setShouldRender(false), durationTimeout)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)
  const sessionStatus = useAuthStore(s => s.sessionStatus)
  const isAuthenticated = sessionStatus === 'authenticated'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="solid"
        className="bg-[#F7FBFF] h-[38px] p-1 rounded-xl flex items-center text-[#656565] gap-0 min-w-[70px]"
        startContent={<SvgIcon src={userIcon} size={'30px'} />}
        endContent={<SvgIcon src={isOpen ? chevronUp : chevronDown} size={'1rem'} />}
        onPress={() => setIsOpen(!isOpen)}
      ></Button>
      {shouldRender && (
        <div
          className={`absolute top-full z-10 right-0 mt-1 bg-white rounded-md shadow-lg w-[222px] p-[10px] flex flex-col gap-[10px] transition-all duration-${durationTimeout} ease-out origin-top-right transform ${
            isAnimating
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-90 -translate-y-1'
          }`}
        >
          {isAuthenticated ? (
            <>
              <Button
                variant="light"
                className="gap-2.5 py-1 px-2.5 text-black font-rubik font-normal text-base justify-start"
                startContent={<SvgIcon src={userIcon} size="20px" className="opacity-60 w-min" />}
                onPress={() =>
                  window.open(`${LK_URL}/profile`, '_blank', 'noopener,noreferrer')
                }
              >
                Мой профиль
              </Button>
              <div className="h-px bg-black"></div>
              <Button
                variant="light"
                className="gap-2.5 py-2 px-2.5 text-black font-rubik font-normal text-base justify-start"
                startContent={<SvgIcon src={powerIcon} size="20px" className="opacity-60 w-min" />}
                onPress={handleLogout}
              >
                Выйти
              </Button>
            </>
          ) : (
            <Button
              variant="light"
              className="gap-2.5 py-2 px-2.5 text-black font-rubik font-normal text-base justify-start"
              startContent={<SvgIcon src={userIcon} size="20px" className="opacity-60 w-min" />}
              onPress={() => navigate('/login')}
            >
              Войти
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileButton
