import userIcon from '../../assets/icons/user-circle.svg'
import { Button } from '@heroui/button'
import SvgIcon from '../../components/SvgIcon'
import useAuthStore from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

// Общий личный кабинет lemnity.ru — единый профиль для всех продуктов (виджеты живут под
// зонтиком lemnity.ru). Клик по аватарке сразу ведёт в общий ЛК (выход — сквозной, через ЛК).
// Настраивается через VITE_LK_URL, дефолт — прод-домен.
const LK_URL = import.meta.env.VITE_LK_URL || 'https://lemnity.ru'

const ProfileButton = () => {
  const navigate = useNavigate()
  const sessionStatus = useAuthStore(s => s.sessionStatus)
  const isAuthenticated = sessionStatus === 'authenticated'

  const handlePress = () => {
    if (isAuthenticated) {
      window.location.href = `${LK_URL}/profile`
    } else {
      navigate('/login')
    }
  }

  return (
    <Button
      variant="solid"
      className="bg-[#F7FBFF] h-[38px] p-1 rounded-xl flex items-center text-[#656565] gap-0 min-w-[70px]"
      startContent={<SvgIcon src={userIcon} size={'30px'} />}
      onPress={handlePress}
    ></Button>
  )
}

export default ProfileButton
