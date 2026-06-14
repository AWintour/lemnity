import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useOperatorAuthStore from '@stores/operatorAuthStore'

/**
 * Страница входа оператора чата (email+пароль, заданные владельцем). Изолирована от SSO-входа
 * владельца. При успехе — операторская сессия и переход в «Модуль Чат».
 */
const OperatorLoginPage = () => {
  const navigate = useNavigate()
  const operator = useOperatorAuthStore(s => s.operator)
  const login = useOperatorAuthStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (operator) return <Navigate to="/chat-module" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/chat-module', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F2FC] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[400px] bg-white rounded-[18px] border border-default-200 p-7 flex flex-col gap-4 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Вход оператора</h1>
          <p className="text-[14px] text-default-400">Войдите по логину и паролю, выданным владельцем.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-default-500">Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="operator@example.com"
            className="h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-default-500">Пароль</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary"
          />
        </label>

        {error && <div className="text-[13px] text-[#E5484D]">{error}</div>}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="h-11 rounded-[10px] bg-primary text-white text-[15px] font-medium disabled:opacity-50"
        >
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

export default OperatorLoginPage
