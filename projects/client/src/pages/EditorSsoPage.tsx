import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { http } from '@/common/api/http'

type ExchangeResponse = { accessToken?: string; user?: unknown }

// SSO-вход из ЛК lemnity.ru: приходим на /editor?ticket=… → меняем тикет на сессию app
// (POST /api/lemnity/ticket-exchange) → кладём accessToken в authStore → в редактор.
// Логина на app нет — кабинет единая точка входа. См. plans/plan-wid.md.
const EditorSsoPage = (): ReactElement => {
  const navigate = useNavigate()
  const setSession = useAuthStore(s => s.setSession)
  const [failed, setFailed] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const ticket = new URLSearchParams(window.location.search).get('ticket') || ''
    if (!ticket) {
      navigate('/login', { replace: true })
      return
    }
    http
      .post<ExchangeResponse>('/lemnity/ticket-exchange', { ticket }, { withCredentials: true })
      .then(({ data }) => {
        if (data?.accessToken) {
          setSession(data.accessToken)
          navigate('/', { replace: true })
        } else {
          setFailed(true)
        }
      })
      .catch(() => setFailed(true))
  }, [navigate, setSession])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      {failed
        ? 'Не удалось войти. Откройте «Виджеты» из личного кабинета ещё раз.'
        : 'Входим…'}
    </div>
  )
}

export default EditorSsoPage
