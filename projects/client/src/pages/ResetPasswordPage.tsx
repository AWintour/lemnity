import { type ReactElement, useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import * as authService from '@/services/auth'
import background from '@/assets/backgrounds/login-background.webp'
import SvgIcon from '@/components/SvgIcon'
import iconEye from '@/assets/icons/eye.svg'
import iconEyeOff from '@/assets/icons/eye-off.svg'
import lemnityLogo from '@/assets/logos/lemnity-logo.svg'

const schema = z
  .object({
    password: z.string().min(8, 'Минимум 8 символов'),
    confirm: z.string().min(8, 'Минимум 8 символов')
  })
  .refine(v => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Пароли не совпадают'
  })

type Form = z.infer<typeof schema>

export default function ResetPasswordPage(): ReactElement {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => params.get('token') ?? '', [params])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number>(3)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [token, navigate])

  // Редирект с обратным отсчётом после успеха
  useEffect(() => {
    if (!success) return
    setCountdown(3)
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(id)
          navigate('/login', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [success, navigate])

  const onSubmit: SubmitHandler<Form> = async data => {
    setError(null)
    setSuccess(null)
    try {
      await authService.resetPassword(token, data.password)
      setSuccess('Пароль успешно обновлён')
    } catch {
      setError('Ссылка недействительна или истекла')
    }
  }

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-2">
      <div className="flex h-full w-full items-center justify-center bg-white px-6 sm:px-10 md:px-12">
        <div className="">
          <div className="mb-4.5 text-center">
            <div className="w-3/5 mx-auto">
              <SvgIcon src={lemnityLogo} />
            </div>
          </div>
          {error ? <p className="text-danger text-sm">{error}</p> : null}
          {success ? (
            <div className="space-y-2">
              <p className="text-success text-sm">{success}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Перенаправление на страницу входа через {countdown}…</span>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => navigate('/login', { replace: true })}
                >
                  Войти сейчас
                </Button>
              </div>
            </div>
          ) : null}
          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Новый пароль"
                variant="bordered"
                radius="sm"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="!bg-transparent min-w-0 h-auto px-1 text-xs text-gray-500 hover:text-gray-900"
                    onPress={() => setShowPassword(v => !v)}
                  >
                    <SvgIcon src={showPassword ? iconEyeOff : iconEye} />
                  </Button>
                }
                {...register('password')}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
              />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Повторите пароль"
                variant="bordered"
                radius="sm"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="!bg-transparent min-w-0 h-auto px-1 text-xs text-gray-500 hover:text-gray-900"
                    onPress={() => setShowConfirmPassword(v => !v)}
                  >
                    <SvgIcon src={showConfirmPassword ? iconEyeOff : iconEye} />
                  </Button>
                }
                {...register('confirm')}
                isInvalid={!!errors.confirm}
                errorMessage={errors.confirm?.message}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="h-12 flex-1 font-normal bg-[#1A52DB] rounded-[6px] text-white"
                  isDisabled={!isValid || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Обновить пароль
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
      <div className="hidden h-full w-full md:block">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        />
      </div>
    </div>
  )
}
