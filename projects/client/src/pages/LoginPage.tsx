import type { ReactElement } from 'react'
import { useState } from 'react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { Checkbox } from '@heroui/checkbox'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PatternFormat } from 'react-number-format'
import loginBackground from '../assets/backgrounds/login-background-laptop.webp'
import lemnityLogo from '@/assets/logos/lemnity-logo.svg'
import SvgIcon from '@/components/SvgIcon'
import iconEye from '@/assets/icons/eye.svg'
import iconEyeOff from '@/assets/icons/eye-off.svg'
import useAuthStore from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import * as authService from '@/services/auth'

const loginSchema = z.object({
  email: z.email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов')
})

const signupSchema = z
  .object({
    name: z.string().min(1, 'Имя обязательно'),
    email: z.email('Некорректный email'),
    phone: z
      .string()
      .trim()
      .min(12, "Некорректный номер телефона (минимум 12 символов: '+' и 11 цифр)")
      .refine(value => /^\+\d{11,}$/.test(value), {
        message: 'Формат телефона должен быть +79999999999'
      }),
    password: z.string().min(8, 'Минимум 8 символов'),
    passwordConfirmation: z.string().min(8, 'Минимум 8 символов'),
    acceptTerms: z.boolean().refine(v => v === true, 'Чтобы продолжить, примите условия'),
    newsletter: z.boolean()
  })
  .refine(data => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Пароли не совпадают'
  })

const forgotSchema = z.object({ email: z.email('Некорректный email') })

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>
type ForgotForm = z.infer<typeof forgotSchema>

type AuthMode = 'login' | 'signup' | 'forgot'

const LoginPage = (): ReactElement => {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupPassword2, setShowSignupPassword2] = useState(false)

  const navigate = useNavigate()
  const { login, register: registerUser } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [forgotInfo, setForgotInfo] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin,
    getValues: getLoginValues
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' }
  })

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    control: controlSignup,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting, isValid: isSignupValid },
    reset: resetSignup,
    getValues: getSignupValues
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirmation: '',
      acceptTerms: false,
      newsletter: false
    }
  })

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors, isSubmitting: isForgotSubmitting, isValid: isForgotValid },
    reset: resetForgot,
    getValues: getForgotValues
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    mode: 'onChange',
    defaultValues: { email: '' }
  })

  const onLoginSubmit: SubmitHandler<LoginForm> = async data => {
    setAuthError(null)
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch {
      setAuthError('Неверный email или пароль')
    }
  }

  const onSignupSubmit: SubmitHandler<SignupForm> = async data => {
    setSignupError(null)
    try {
      await registerUser(data.email, data.password, data.name, data.phone)
      navigate('/')
    } catch {
      setSignupError('Не удалось зарегистрироваться. Попробуйте ещё раз')
    }
  }

  const onForgotSubmit: SubmitHandler<ForgotForm> = async data => {
    setForgotInfo(null)
    setForgotError(null)
    await authService.forgotPassword(data.email).catch(() => undefined)
    setForgotInfo('Письмо с ссылкой для сброса отправлено на указанный email')
  }

  const tabClass = (id: AuthMode): string =>
    `px-4 py-2 text-sm font-medium rounded-md transition ${
      mode === id ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'
    }`

  const switchToLogin = (): void => {
    resetLogin(getLoginValues())
    setMode('login')
  }

  const switchToSignup = (): void => {
    resetSignup(getSignupValues())
    setMode('signup')
  }

  const switchToForgot = (): void => {
    resetForgot(getForgotValues())
    setMode('forgot')
  }

  return (
    <div className="grid h-full grid-cols-1 min-[900px]:grid-cols-[42%_1fr] bg-white">
      <div className="mx-auto flex h-full max-w-[462px] items-center justify-center bg-white px-6 sm:px-10 md:px-12 ">
        <div className="">
          <div className="mb-4.5 text-center">
            <div className="w-3/5 mx-auto">
              <SvgIcon src={lemnityLogo} preserveOriginalColors={true} />
            </div>
            {mode === 'signup' ? (
              <p className="mt-2 text-sm text-black font-Roboto text-[22px] ">
                Попробуйте Lemnity
                <br />
                14 дней бесплатно!
              </p>
            ) : null}
          </div>

          {mode !== 'forgot' ? (
            <div className="mb-2 w-full  flex justify-center">
              <div className="flex w-full h-11 rounded-lg bg-gray-100 p-1 gap-1">
                <Button
                  variant="light"
                  size="sm"
                  radius="sm"
                  className={`${tabClass('login')} flex-1 h-full font-normal text-[17px] `}
                  onPress={switchToLogin}
                >
                  Войти
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  radius="sm"
                  className={`${tabClass('signup')} flex-1 h-full font-normal text-[17px]`}
                  onPress={switchToSignup}
                >
                  Регистрация
                </Button>
              </div>
            </div>
          ) : null}

          {mode === 'login' ? (
            <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-2">
              {authError ? <p className="text-danger text-sm">{authError}</p> : null}
              <Input
                placeholder="Ваш email"
                variant="bordered"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                {...registerLogin('email')}
                isInvalid={!!loginErrors.email}
                errorMessage={loginErrors.email?.message}
              />
              <Input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="Ваш пароль"
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
                    onPress={() => setShowLoginPassword(v => !v)}
                  >
                    <SvgIcon src={showLoginPassword ? iconEyeOff : iconEye} />
                  </Button>
                }
                {...registerLogin('password')}
                isInvalid={!!loginErrors.password}
                errorMessage={loginErrors.password?.message}
              />
              <Button
                className="h-12 w-full font-normal bg-[#1A52DB] rounded-[6px] text-white"
                type="submit"
                isLoading={isLoginSubmitting}
              >
                Войти
              </Button>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Забыли пароль?</span>
                <Button
                  variant="light"
                  disableAnimation
                  className="hover:underline hover:!bg-transparent h-min px-0 min-w-0"
                  onPress={switchToForgot}
                >
                  <span className="text-primary text-sm font-rubik">Восстановить</span>
                </Button>
              </div>
            </form>
          ) : mode === 'signup' ? (
            <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="space-y-2">
              {signupError ? <p className="text-danger text-sm">{signupError}</p> : null}
              <Input
                placeholder="Имя"
                variant="bordered"
                radius="sm"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                {...registerSignup('name')}
                isInvalid={!!signupErrors.name}
                errorMessage={signupErrors.name?.message}
              />
              <Input
                placeholder="Email"
                variant="bordered"
                radius="sm"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                {...registerSignup('email')}
                isInvalid={!!signupErrors.email}
                errorMessage={signupErrors.email?.message}
              />
              <Controller
                control={controlSignup}
                name="phone"
                render={({ field: { ref, value, onChange, onBlur } }) => (
                  <PatternFormat
                    customInput={Input}
                    getInputRef={ref}
                    format="+7 (###) ###-##-##"
                    mask="_"
                    value={value?.startsWith('+7') ? value.substring(2) : value}
                    onValueChange={values => {
                      const cleanValue = values.value ? `+7${values.value}` : ''
                      onChange(cleanValue)
                    }}
                    onBlur={onBlur}
                    // Hero UI Input props
                    type="tel"
                    inputMode="numeric"
                    placeholder="+7 (000) 000-00-00"
                    variant="bordered"
                    radius="sm"
                    isInvalid={!!signupErrors.phone}
                    errorMessage={signupErrors.phone?.message}
                    classNames={{
                      inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white',
                      input: 'text-gray-900 placeholder:text-gray-400'
                    }}
                  />
                )}
              />
              <Input
                type={showSignupPassword ? 'text' : 'password'}
                placeholder="Пароль"
                variant="bordered"
                radius="sm"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white pr-2',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="!bg-transparent min-w-0 h-auto px-1 text-xs text-gray-500 hover:text-gray-900"
                    onPress={() => setShowSignupPassword(v => !v)}
                  >
                    <SvgIcon src={showSignupPassword ? iconEyeOff : iconEye} />
                  </Button>
                }
                {...registerSignup('password')}
                isInvalid={!!signupErrors.password}
                errorMessage={signupErrors.password?.message}
              />
              <Input
                type={showSignupPassword2 ? 'text' : 'password'}
                placeholder="Повторите пароль"
                variant="bordered"
                radius="sm"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white pr-2',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="!bg-transparent min-w-0 h-auto px-1 text-xs text-gray-500 hover:text-gray-900"
                    onPress={() => setShowSignupPassword2(v => !v)}
                  >
                    <SvgIcon src={showSignupPassword2 ? iconEyeOff : iconEye} />
                  </Button>
                }
                {...registerSignup('passwordConfirmation')}
                isInvalid={!!signupErrors.passwordConfirmation}
                errorMessage={signupErrors.passwordConfirmation?.message}
              />

              <Controller
                control={controlSignup}
                name="acceptTerms"
                render={({ field }) => (
                  <div className="flex flex-col gap-2 text-Roboto text-[13px] text-black">
                    <div>Я даю согласие ООО «Лемнити»:</div>
                    <Checkbox
                      radius="sm"
                      isSelected={field.value}
                      onValueChange={field.onChange}
                      classNames={{
                        label: 'text-xs text-black',
                        wrapper: 'after:!bg-black before:!rounded-[6px] after:!rounded-[6px]'
                      }}
                    >
                      На обработку персональных данных
                    </Checkbox>
                    {signupErrors.acceptTerms ? (
                      <p className="mt-1 text-xs text-danger ">
                        {signupErrors.acceptTerms.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                control={controlSignup}
                name="newsletter"
                render={({ field }) => (
                  <Checkbox
                    radius="sm"
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    classNames={{
                      label: 'text-xs text-gray-600 text-black ',
                      wrapper: 'after:!bg-black before:!rounded-[6px] after:!rounded-[6px]'
                    }}
                  >
                    На получение сообщений и информационно-рекламной рассылки
                  </Checkbox>
                )}
              />

              <Button
                className="h-12 mt-3 w-full font-normal bg-[#1A52DB] rounded-[6px] text-white"
                type="submit"
                isLoading={isSignupSubmitting}
                isDisabled={!isSignupValid || isSignupSubmitting}
              >
                Начать
              </Button>

              <div className="text-center text-sm flex justify-between">
                <span className="text-gray-500">Уже есть аккаунт?</span>
                <Button
                  variant="light"
                  disableAnimation
                  className="hover:underline hover:!bg-transparent h-min px-0 min-w-0"
                  onPress={switchToLogin}
                >
                  <span className="text-primary text-sm font-rubik">Войти</span>
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-2">
              {forgotError ? <p className="text-danger text-sm">{forgotError}</p> : null}
              {forgotInfo ? <p className="text-success text-sm">{forgotInfo}</p> : null}
              <Input
                placeholder="Email"
                variant="bordered"
                classNames={{
                  inputWrapper: 'md:h-13 rounded-[6px] border border-gray-300 bg-white',
                  input: 'text-gray-900 placeholder:text-gray-400'
                }}
                {...registerForgot('email')}
                isInvalid={!!forgotErrors.email}
                errorMessage={forgotErrors.email?.message}
              />
              <div className="flex gap-2">
                <Button
                  variant="flat"
                  className="h-12 flex-1 font-normal rounded-[6px]"
                  onPress={switchToLogin}
                >
                  Назад
                </Button>
                <Button
                  className="h-12 flex-1 font-normal bg-[#1A52DB] rounded-[6px] text-white"
                  type="submit"
                  isLoading={isForgotSubmitting}
                  isDisabled={!isForgotValid || isForgotSubmitting}
                >
                  Отправить ссылку
                </Button>
              </div>
            </form>
          )}

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
            <a href="https://lemnity.ru/doc" target="_blank" className="hover:underline">
              Пользовательское соглашение
            </a>
            <span className="mx-2">|</span>
            <a href="https://lemnity.ru/doc" target="_blank" className="hover:underline">
              Политика конфидециальности
            </a>
          </div>
        </div>
      </div>

      <div className="hidden h-full w-full min-[900px]:block py-10 pr-10">
        <div
          className="h-full w-full bg-cover bg-center rounded-[20px]"
          style={{ backgroundImage: `url(${loginBackground})` }}
        />
      </div>
    </div>
  )
}

export default LoginPage
