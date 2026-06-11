/** Форма захвата контакта (зеркалит VideoLeadForm.tsx), привязана к полям. + отложенный звонок. */
import { useState } from 'react'
import { cn } from '@heroui/theme'
import { PatternFormat } from 'react-number-format'

export type CallbackFormValues = { name?: string; phone: string }

type Props = {
  nameEnabled: boolean
  phoneRequired: boolean
  buttonText: string
  buttonBg: string
  buttonFont: string
  buttonHidden?: boolean
  buttonShape?: 'circle' | 'rounded' | 'square'
  deferredEnabled: boolean
  agreementEnabled: boolean
  agreementColor: string
  policyUrl: string
  onSubmit: (v: CallbackFormValues) => void
}

const AGREEMENT_TEXT =
  'Нажимая на кнопку, я даю согласие на обработку моих персональных данных в целях обработки заявки и обратной связи. Политика конфиденциальности по ссылке.'

const fmtWhen = (iso: string) => {
  // "2026-02-12T12:00" -> "12 / 02 / 12:00"
  const m = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso)
  return m ? `${m[3]} / ${m[2]} / ${m[4]}:${m[5]}` : iso
}

type DeferMode = 'none' | 'picking' | 'scheduled'

const CallbackForm = (props: Props) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [agree, setAgree] = useState(true)
  const [phoneErr, setPhoneErr] = useState(false)
  const [mode, setMode] = useState<DeferMode>('none')
  const [when, setWhen] = useState('')

  const digits = phone.replace(/\D/g, '')
  const checkPhone = () => {
    const bad = props.phoneRequired && digits.length < 11
    setPhoneErr(bad)
    return !bad && !(props.agreementEnabled && !agree)
  }
  const callNow = () => { if (checkPhone()) props.onSubmit({ name: name || undefined, phone }) }
  const confirmDeferred = () => { if (checkPhone() && when) setMode('scheduled') }

  return (
    <>
      <div className="border border-[#E6E4DF] rounded-[18px] p-4 flex flex-col gap-3">
        {props.nameEnabled && (
          <input
            value={name}
            onChange={e => setName(e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, ''))}
            placeholder="Ваше имя"
            style={{ height: 52 }}
            className="rounded-[12px] border border-[#E2E0DB] px-4 text-[17px] text-[#161616] placeholder:text-[#9A968F] outline-none"
          />
        )}
        <div>
          <PatternFormat
            value={phone.startsWith('+7') ? phone.slice(2) : phone}
            format="+7 ### ### ## ##" mask=" " type="tel" inputMode="numeric"
            placeholder="+7 000 000 00 00"
            onValueChange={v => setPhone(v.value ? `+7${v.value}` : '')}
            style={{ height: 52, borderColor: phoneErr ? '#E5484D' : '#E2E0DB' }}
            className="w-full rounded-[12px] border px-4 text-[17px] text-[#161616] placeholder:text-[#9A968F] outline-none"
          />
          {phoneErr && <span className="text-[12px] text-[#E5484D] mt-1 ml-1 block">Введите номер телефона</span>}
        </div>

        {/* Обычный звонок */}
        {mode === 'none' && !props.buttonHidden && (
          <>
            <button
              type="button" onClick={callNow}
              style={{ height: 54, background: props.buttonBg, color: props.buttonFont, borderRadius: props.buttonShape === 'circle' ? 27 : props.buttonShape === 'square' ? 4 : 12 }}
              className="font-bold text-[18px]"
            >
              {props.buttonText}
            </button>
            {props.deferredEnabled && (
              <button type="button" onClick={() => setMode('picking')} className="text-[16px] text-[#9A968F] text-center py-0.5">
                Выбрать время для звонка
              </button>
            )}
          </>
        )}

        {/* Отложенный звонок — выбор времени */}
        {mode === 'picking' && (
          <>
            <div className="flex gap-2.5">
              <input
                type="datetime-local"
                value={when}
                onChange={e => setWhen(e.target.value)}
                style={{ height: 52 }}
                className="flex-1 min-w-0 rounded-[12px] border border-[#E2E0DB] px-3 text-[16px] text-[#161616] outline-none"
              />
              <button
                type="button" onClick={confirmDeferred}
                style={{ height: 52 }}
                className="px-5 rounded-[12px] bg-[#EDEDED] text-[#2a2a2a] font-medium text-[16px] disabled:opacity-50"
                disabled={!when}
              >
                Готово
              </button>
            </div>
            <button type="button" onClick={() => { setWhen(''); setMode('none') }} className="text-[16px] text-[#9A968F] text-center py-0.5">
              Позвонить сейчас
            </button>
          </>
        )}

        {/* Отложенный звонок — подтверждение */}
        {mode === 'scheduled' && (
          <div className="flex flex-col items-center gap-3 py-1">
            <div className="rounded-full grid place-items-center" style={{ width: 64, height: 64, background: '#EAF7EE' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <div className="flex items-center justify-center gap-2.5 w-full rounded-[12px] border border-[#E2E0DB] px-4" style={{ height: 56 }}>
              <span className="text-[18px] text-[#161616] tabular-nums">{fmtWhen(when)}</span>
              <span className="px-3.5 py-1.5 rounded-[10px] bg-[#16A34A] text-white font-medium text-[14px]">Отлично!</span>
            </div>
            <p className="text-[16px] text-[#3a3a3a] text-center leading-[1.4]">
              Ожидайте звонок в указанное время.<br />До связи&nbsp;👋
            </p>
          </div>
        )}
      </div>

      {props.agreementEnabled && mode !== 'scheduled' && (
        <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
          <span
            onClick={() => setAgree(a => !a)}
            style={{ width: 20, height: 20, background: agree ? '#1A1A1A' : '#fff', borderColor: agree ? '#1A1A1A' : '#9A968F' }}
            className={cn('mt-0.5 rounded-[5px] border flex items-center justify-center flex-none')}
          >
            {agree && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            )}
          </span>
          <span className="text-[12px] leading-[1.45]" style={{ color: props.agreementColor }}>{AGREEMENT_TEXT}</span>
        </label>
      )}
    </>
  )
}

export default CallbackForm
