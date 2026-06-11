/**
 * Редактор «Обратный звонок». Визуал — общие компоненты редактора (как у Анонса/видеовиджета).
 * Набор полей — по plan/plan-wid-call.md: оформление, окно информации, таймер до звонка, контакты,
 * согласие, экран звонка, настройка звонка, уведомления менеджера, график работы, брендинг.
 */
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Input } from '@heroui/input'
import { Slider } from '@heroui/slider'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover'

import {
  InfoSettings,
  CompanyLogo,
  WidgetBorderRadius,
} from '@/components/settings'
import DisableBranding from '@/layouts/WidgetSettings/FieldsSettingsTab/DisableBranding/DisableBranding'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import SwitchableField from '@/components/SwitchableField'
import CheckboxField from '@/components/CheckboxField'
import CustomSwitch from '@/components/CustomSwitch'
import CustomRadioGroup from '@/components/CustomRadioGroup'
import AgreementPoliciesField from '@/layouts/WidgetSettings/FieldsSettingsTab/AgreementPoliciesField/AgreementPoliciesField'
import AdsInfoField from '@/layouts/WidgetSettings/FieldsSettingsTab/AdsInfoField/AdsInfoField'
import ColorPicker from '@/components/ColorPicker'
import IconPicker from '@/components/IconPicker'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import * as managersService from '@/services/managers'
import type { ManagerItem } from '@/services/managers'
import { callbackExtraDefaults, callbackWidgetDefaults, type CallbackWidgetType } from './defaults'

const inputCx = {
  base: 'flex-1 min-w-52',
  inputWrapper: 'border bg-white border-[#E8E8E8] rounded-[5px] shadow-none h-12.75 px-2.5',
  input: 'placeholder:text-[#AAAAAA] text-base',
}

const TIMEZONES = [
  'UTC+2 Калининград',
  'UTC+3 Москва',
  'UTC+4 Самара',
  'UTC+5 Екатеринбург',
  'UTC+6 Омск',
  'UTC+7 Красноярск',
  'UTC+8 Иркутск',
  'UTC+9 Якутск',
  'UTC+10 Владивосток',
  'UTC+11 Магадан',
  'UTC+12 Камчатка',
]

type StoreActions = Record<string, (...args: unknown[]) => void>

type Shape = 'circle' | 'rounded' | 'square'
const ShapeGlyph = ({ shape, size = 22 }: { shape: Shape; size?: number }) => {
  const rx = shape === 'circle' ? size / 2 : shape === 'rounded' ? 6 : 1
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx={shape === 'circle' ? 9 : rx} stroke="#3a3a3a" strokeWidth="1.6" />
    </svg>
  )
}
const ShapeSelect = ({ value, onChange }: { value: Shape; onChange: (v: Shape) => void }) => (
  <Popover placement="bottom" classNames={{ content: 'p-2 gap-1 flex-row' }}>
    <PopoverTrigger>
      <button type="button" className="h-12.75 w-18 rounded-[5px] border border-[#E4E4E7] bg-white flex items-center justify-center gap-1.25">
        <ShapeGlyph shape={value} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#9A968F]"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </PopoverTrigger>
    <PopoverContent>
      <div className="flex gap-1.5">
        {(['circle', 'rounded', 'square'] as Shape[]).map(s => (
          <button key={s} type="button" onClick={() => onChange(s)}
            className={`w-11 h-11 rounded-[5px] border flex items-center justify-center ${value === s ? 'border-[#1A52DB] border-2' : 'border-[#E4E4E7]'}`}>
            <ShapeGlyph shape={s} />
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
)

const HideToggle = ({ hidden, onToggle }: { hidden: boolean; onToggle: (v: boolean) => void }) => (
  <button
    type="button"
    aria-label={hidden ? 'Показать' : 'Скрыть'}
    onClick={() => onToggle(!hidden)}
    className="h-9 w-10 rounded-[10px] border border-[#E8E8E8] bg-white flex items-center justify-center text-[#5a5a5a]"
  >
    {hidden ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61M1 1l22 22" /><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
    )}
  </button>
)

const CallbackWidgetSettings = () => {
  const cb = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as CallbackWidgetType)?.callback ?? callbackExtraDefaults)
  )
  const brandingEnabled = useWidgetSettingsStore(
    s => (s.settings?.widget as CallbackWidgetType)?.brandingEnabled ?? true
  )
  const colorsCustom = useWidgetSettingsStore(
    s => (s.settings?.widget as CallbackWidgetType)?.appearence?.colorScheme === 'custom'
  )
  const appr = useWidgetSettingsStore(
    useShallow(s => {
      const a = (s.settings?.widget as CallbackWidgetType)?.appearence ?? callbackWidgetDefaults.appearence
      return { logoEnabled: a.companyLogoEnabled, logoUrl: a.companyLogoUrl, borderRadius: a.borderRadius }
    })
  )
  // setCallback* существуют в сторе в рантайме (спред createCallbackActions), но не объявлены
  // в типе WidgetActions — берём их стабильные ссылки через getState() с приведением типа.
  const a = useWidgetSettingsStore.getState() as unknown as StoreActions
  const setPatch = (patch: Record<string, unknown>) => a.setCallbackPatch(patch)

  // Менеджеры проекта из вкладки «Звонки» — подтягиваем в редактор, чтобы выбрать оператора.
  const projectId = useWidgetSettingsStore(s => s.projectId)
  const [projectManagers, setProjectManagers] = useState<ManagerItem[]>([])
  useEffect(() => {
    if (!projectId) return
    let alive = true
    managersService
      .listManagers(projectId)
      .then(r => alive && setProjectManagers(r.managers))
      .catch(() => alive && setProjectManagers([]))
    return () => {
      alive = false
    }
  }, [projectId])

  // appearance / info — те же setCallback* (скопированы из Анонса)
  const setCompanyLogoEnabled = a.setCallbackCompanyLogoEnabled
  const setCompanyLogoUrl = a.setCallbackCompanyLogoUrl
  const setWidgetColorScheme = a.setCallbackColorScheme
  const setContentType = a.setCallbackContentType
  const setContentAlignment = a.setCallbackContentAlignment
  const setBorderRadius = a.setCallbackBorderRadius
  const setInfoScreenContentUrl = a.setCallbackContentUrl
  const setInfoScreenTitle = a.setCallbackInfoScreenTitle
  const setInfoScreenTitleFontWeight = a.setCallbackInfoScreenTitleFontWeight
  const setInfoScreenTitleColor = a.setCallbackInfoScreenTitleColor
  const setInfoScreenDescription = a.setCallbackInfoScreenDescription
  const setInfoScreenDescriptionFontWeight = a.setCallbackInfoScreenDescriptionFontWeight
  const setInfoScreenDescriptionColor = a.setCallbackInfoScreenDescriptionColor
  const setInfoScreenButtonText = a.setCallbackInfoScreenButtonText
  const setInfoScreenButtonFontColor = a.setCallbackInfoScreenButtonFontColor
  const setInfoScreenButtonBackgroundColor = a.setCallbackInfoScreenButtonBackgroundColor
  const setInfoScreenButtonIcon = a.setEventTimerInfoScreenIcon
  const setInfoScreenButtonLink = a.setEventTimerInfoScreenLink
  const setBrandingEnabled = a.setCallbackBrandingEnabled

  const patchLauncher = (p: Partial<CallbackWidgetType['callback']['launcher']>) =>
    setPatch({ launcher: { ...cb.launcher, ...p } })
  const patchForm = (p: Partial<CallbackWidgetType['callback']['form']>) =>
    setPatch({ form: { ...cb.form, ...p } })
  const patchContacts = (p: Partial<CallbackWidgetType['callback']['contacts']>) =>
    setPatch({ contacts: { ...cb.contacts, ...p } })
  const patchCallScreen = (p: Partial<CallbackWidgetType['callback']['callScreen']>) =>
    setPatch({ callScreen: { ...cb.callScreen, ...p } })
  const patchCall = (p: Partial<CallbackWidgetType['callback']['call']>) =>
    setPatch({ call: { ...cb.call, ...p } })
  const patchSms = (p: Partial<CallbackWidgetType['callback']['sms']>) =>
    setPatch({ sms: { ...cb.sms, ...p } })
  const patchTelegram = (p: Partial<CallbackWidgetType['callback']['telegram']>) =>
    setPatch({ telegram: { ...cb.telegram, ...p } })
  const patchSchedule = (p: Partial<CallbackWidgetType['callback']['schedule']>) =>
    setPatch({ schedule: { ...cb.schedule, ...p } })

  const days: { key: string; label: string }[] = [
    { key: 'mon', label: 'Пн' }, { key: 'tue', label: 'Вт' }, { key: 'wed', label: 'Ср' },
    { key: 'thu', label: 'Чт' }, { key: 'fri', label: 'Пт' }, { key: 'sat', label: 'Сб' }, { key: 'sun', label: 'Вс' },
  ]
  const toggleDay = (k: string) =>
    patchSchedule({ days: cb.schedule.days.includes(k) ? cb.schedule.days.filter(d => d !== k) : [...cb.schedule.days, k] })

  return (
    <div className="w-full px-4.75 flex flex-col gap-2.5">
      {/* Настройка виджета (свёрнутый лаунчер) */}
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606]">Настройка виджета</h1>
      <BorderedContainer>
        <div className="w-full flex flex-col gap-2.5">
          <h2 className="text-[16px] leading-4.75">Кнопка</h2>
          <div className="flex flex-row flex-wrap items-center gap-2.5 @container">
            <Input
              value={cb.launcher.text}
              onValueChange={v => patchLauncher({ text: v })}
              placeholder="Супер кнопка"
              classNames={{ base: 'min-w-40 flex-3', inputWrapper: 'border bg-white border-[#E4E4E7] rounded-[5px] shadow-none h-12.75 min-h-10 px-2.5', input: 'text-base' }}
            />
            {/* цвет иконки */}
            <ColorPicker popoverPlacement="bottom" initialColor={cb.launcher.iconColor} onColorChange={c => patchLauncher({ iconColor: c })} />
            {/* выбор иконки */}
            <IconPicker popoverPlacement="bottom" initialIcon={cb.launcher.icon} onIconChange={ic => patchLauncher({ icon: ic })} />
            {/* цвет кнопки */}
            <ColorPicker popoverPlacement="bottom-end" initialColor={cb.launcher.buttonColor} onColorChange={c => patchLauncher({ buttonColor: c })} triggerText="Цвет кнопки" />
          </div>
        </div>
      </BorderedContainer>
      <SwitchableField
        title="Уведомление"
        switchLabel="Если включить, поле появится через 30 секунд"
        enabled={cb.launcher.notifEnabled}
        onToggle={v => patchLauncher({ notifEnabled: v })}
        classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}
      >
        <div className="flex flex-row flex-wrap items-start gap-2.5 @container">
          <textarea
            value={cb.launcher.notifText}
            onChange={e => patchLauncher({ notifText: e.target.value })}
            rows={2}
            className="min-w-40 flex-3 rounded-[5px] border border-[#E4E4E7] bg-white px-2.5 py-2 text-base text-[#161616] outline-none resize-none"
          />
          {/* цвет иконки */}
          <ColorPicker popoverPlacement="bottom" initialColor={cb.launcher.notifIconColor} onColorChange={c => patchLauncher({ notifIconColor: c })} />
          {/* выбор иконки */}
          <IconPicker popoverPlacement="bottom" initialIcon={cb.launcher.notifIcon} onIconChange={ic => patchLauncher({ notifIcon: ic })} />
          {/* цвет фона */}
          <ColorPicker popoverPlacement="bottom-end" initialColor={cb.launcher.notifColor} onColorChange={c => patchLauncher({ notifColor: c })} triggerText="Цвет фона" />
        </div>
        <div className="w-full flex items-center justify-between pt-3">
          <span className="text-[14px] text-[#797979]">Звук при появлении</span>
          <CustomSwitch isSelected={cb.launcher.notifSound} onValueChange={v => patchLauncher({ notifSound: v })} size="sm" selectedColor="group-data-[selected=true]:!bg-[#1A52DB]" />
        </div>
      </SwitchableField>
      <BorderedContainer>
        <div className="w-full flex flex-col gap-3.5">
          <div className="flex justify-between"><h2 className="text-[16px] leading-4.75">Скругление окна</h2><span className="text-[16px] font-medium">{cb.launcher.borderRadius}px</span></div>
          <Slider value={cb.launcher.borderRadius} onChange={v => patchLauncher({ borderRadius: Number(v) })} size="sm" maxValue={32} minValue={0} step={1} aria-label="Скругление окна" />
        </div>
      </BorderedContainer>
      <BorderedContainer>
        <div className="w-full flex flex-col gap-3.5">
          <div className="flex justify-between"><h2 className="text-[16px] leading-4.75">Размер виджета</h2><span className="text-[16px] font-medium">{cb.launcher.widgetSize}px</span></div>
          <Slider value={cb.launcher.widgetSize} onChange={v => patchLauncher({ widgetSize: Number(v) })} size="sm" maxValue={96} minValue={44} step={1} aria-label="Размер виджета" />
        </div>
      </BorderedContainer>
      <BorderedContainer>
        <div className="w-full flex flex-col gap-2.5">
          <h2 className="text-[16px] leading-4.75">Положение кнопки открытия</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {(['left', 'center', 'right'] as const).map(p => (
              <button key={p} type="button" onClick={() => patchLauncher({ position: p })}
                className={`relative h-15 rounded-[12px] border bg-white ${cb.launcher.position === p ? 'border-[#1A52DB] ring-2 ring-[#EEF3FF]' : 'border-[#E8E8E8]'}`}>
                <span className="absolute bottom-2.5 w-3.5 h-3.5 rounded-full" style={{ background: cb.launcher.position === p ? '#1A52DB' : '#CFCBC4', left: p === 'left' ? 12 : p === 'center' ? '50%' : undefined, right: p === 'right' ? 12 : undefined, transform: p === 'center' ? 'translateX(-50%)' : undefined }} />
              </button>
            ))}
          </div>
        </div>
      </BorderedContainer>
      <BorderedContainer className="items-center justify-between">
        <h2 className="text-[16px] leading-4.75">Анимация</h2>
        <CustomSwitch isSelected={cb.launcher.animation} onValueChange={v => patchLauncher({ animation: v })} size="sm" selectedColor="group-data-[selected=true]:!bg-[#1A52DB]" />
      </BorderedContainer>

      {/* Настройка формы */}
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606] mt-2.5">Настройка формы</h1>
      <BorderedContainer>
        <div className="w-full flex flex-col gap-2.5">
          <h2 className="text-[16px] leading-4.75">Формат окна</h2>
          <CustomRadioGroup
            value={cb.form.windowFormat}
            onValueChange={v => patchForm({ windowFormat: v as 'side' | 'modal' })}
            options={[{ label: 'Боковая панель', value: 'side' }, { label: 'Модальное окно', value: 'modal' }]}
          />
        </div>
      </BorderedContainer>

      {/* Логотип */}
      <CompanyLogo
        enabled={appr.logoEnabled}
        logoUrl={appr.logoUrl}
        onToggle={setCompanyLogoEnabled}
        onLogoUrlChange={setCompanyLogoUrl}
      />

      {/* Цветовая гамма (radio + цвета; цвета активны только при «Пользовательская») */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-5">
          <h2 className="text-[16px] leading-4.75">Цветовая гамма</h2>
          <CustomRadioGroup
            value={colorsCustom ? 'custom' : 'primary'}
            onValueChange={v => setWidgetColorScheme(v as 'primary' | 'custom')}
            options={[{ label: 'Основная', value: 'primary' }, { label: 'Пользовательское', value: 'custom' }]}
          />
          <div className={`grid grid-cols-2 gap-3 ${colorsCustom ? '' : 'opacity-50 pointer-events-none'}`}>
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#797979]">Цвет виджета</span><ColorPicker popoverPlacement="bottom-end" disabled={!colorsCustom} initialColor={cb.form.widgetColor} onColorChange={c => patchForm({ widgetColor: c })} /></div>
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#797979]">Шрифт системного текста</span><ColorPicker popoverPlacement="bottom-end" disabled={!colorsCustom} initialColor={cb.form.systemTextColor} onColorChange={c => patchForm({ systemTextColor: c })} /></div>
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#797979]">Цвет поля отсчёта</span><ColorPicker popoverPlacement="bottom-end" disabled={!colorsCustom} initialColor={cb.form.countdownFieldColor} onColorChange={c => patchForm({ countdownFieldColor: c })} /></div>
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#797979]">Шрифт поля отсчёта</span><ColorPicker popoverPlacement="bottom-end" disabled={!colorsCustom} initialColor={cb.form.countdownFontColor} onColorChange={c => patchForm({ countdownFontColor: c })} /></div>
          </div>
        </div>
      </BorderedContainer>

      {/* Скругление окна (формы/модального) */}
      <WidgetBorderRadius widgetBorderRadius={appr.borderRadius} onBorderRadiuschange={setBorderRadius} />

      {/* Окно информации (заголовок / описание / кнопка / контент) */}
      <InfoSettings
        defaults={callbackWidgetDefaults}
        variant="announcement"
        setButtonBackgroundColor={setInfoScreenButtonBackgroundColor}
        setButtonFontColor={setInfoScreenButtonFontColor}
        setButtonIcon={setInfoScreenButtonIcon}
        setButtonLink={setInfoScreenButtonLink}
        setButtonText={setInfoScreenButtonText}
        setDescription={setInfoScreenDescription}
        setDescriptionColor={setInfoScreenDescriptionColor}
        setDescriptionFontWeight={setInfoScreenDescriptionFontWeight}
        setTitle={setInfoScreenTitle}
        setTitleColor={setInfoScreenTitleColor}
        setTitleFontWeight={setInfoScreenTitleFontWeight}
        setContentAlignment={setContentAlignment}
        setContentType={setContentType}
        setContentUrl={setInfoScreenContentUrl}
        hideDescription
        hideContent
        titleFontSize={cb.titleFontSize}
        onTitleFontSizeChange={n => setPatch({ titleFontSize: n })}
      />

      {/* Кнопка отправки — форма и видимость (по макету) */}
      <BorderedContainer className="items-center justify-between">
        <h2 className="text-[16px] leading-4.75">Кнопка отправки</h2>
        <div className="flex items-center gap-2.5">
          <ShapeSelect value={cb.form.buttonShape} onChange={s => patchForm({ buttonShape: s })} />
          <HideToggle hidden={cb.form.buttonHidden} onToggle={v => patchForm({ buttonHidden: v })} />
        </div>
      </BorderedContainer>

      {/* Значение таймера до звонка */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-3.5">
          <h2 className="text-[16px] leading-4.75">Значение таймера, отсчитывающего время до звонка</h2>
          <div className="flex items-center gap-2.5">
            <span className="text-[16px] text-[#797979]">В течение</span>
            <Input
              type="number"
              value={String(cb.delaySeconds)}
              onValueChange={v => setPatch({ delaySeconds: Math.max(1, Number(v) || 0) })}
              classNames={{ ...inputCx, base: 'w-28' }}
            />
            <span className="text-[16px] text-[#797979]">секунд</span>
          </div>
        </div>
      </BorderedContainer>

      {/* Отложенный звонок */}
      <SwitchableField
        title="Отложенный звонок"
        switchLabel="Кнопка «Выбрать время для звонка» под формой"
        enabled={cb.deferredCall.enabled}
        onToggle={v => setPatch({ deferredCall: { enabled: v } })}
        classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}
      />

      {/* Контакты */}
      <SwitchableField title="Контакты" enabled onToggle={() => {}} classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}>
        <div className="w-full flex flex-col gap-2.5">
          <CheckboxField
            label="Телефон" showRequired
            checked={cb.contacts.phone.enabled}
            onChange={v => patchContacts({ phone: { ...cb.contacts.phone, enabled: v } })}
            required={cb.contacts.phone.required}
            onRequiredChange={v => patchContacts({ phone: { ...cb.contacts.phone, required: v } })}
          />
          <CheckboxField
            label="Инициалы" showRequired
            checked={cb.contacts.name.enabled}
            onChange={v => patchContacts({ name: { ...cb.contacts.name, enabled: v } })}
            required={cb.contacts.name.required}
            onRequiredChange={v => patchContacts({ name: { ...cb.contacts.name, required: v } })}
          />
        </div>
      </SwitchableField>

      {/* Согласие и политика — стандартный компонент (как у других виджетов) */}
      <AgreementPoliciesField />

      {/* Рекламная информация — стандартный блок (как в макете) */}
      <AdsInfoField />

      {/* Экран звонка */}
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606] mt-2.5">Экран звонка</h1>
      <BorderedContainer>
        <div className="w-full flex flex-col gap-6">
          <h2 className="text-[16px] leading-4.75">Цветовая гамма текста</h2>
          <div className="flex items-center justify-between gap-3">
            <div className="grow">
              <CustomRadioGroup
                value={cb.callScreen.textScheme}
                onValueChange={v => patchCallScreen({ textScheme: v as 'primary' | 'custom' })}
                options={[{ label: 'Основная', value: 'primary' }, { label: 'Пользовательское', value: 'custom' }]}
              />
            </div>
            <ColorPicker popoverPlacement="bottom-end" disabled={cb.callScreen.textScheme !== 'custom'} initialColor={cb.callScreen.textColor} onColorChange={c => patchCallScreen({ textColor: c })} />
          </div>
        </div>
      </BorderedContainer>
      <SwitchableField
        title='Кнопка "Отменить"'
        switchLabel="Если отключить, клиент не сможет отменить вызов"
        enabled={cb.callScreen.cancelEnabled}
        onToggle={v => patchCallScreen({ cancelEnabled: v })}
        classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}
      />
      <BorderedContainer>
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] leading-4.75">Анимация ожидания</h2>
            <div className="flex items-center gap-2.5"><span className="text-[13px] text-[#797979]">Цвет</span><ColorPicker popoverPlacement="bottom-end" initialColor={cb.callScreen.animationColor} onColorChange={c => patchCallScreen({ animationColor: c })} /></div>
          </div>
          <CustomRadioGroup
            value={cb.callScreen.animation}
            onValueChange={v => patchCallScreen({ animation: v as 'circle' | 'bar' })}
            options={[{ label: 'Круг заполнения', value: 'circle' }, { label: 'Полоса заполнения', value: 'bar' }]}
          />
        </div>
      </BorderedContainer>

      {/* Настройка звонка (Mango) */}
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606] mt-2.5">Настройка звонка</h1>
      <BorderedContainer>
        <div className="w-full flex flex-col gap-3.5">
          <h2 className="text-[16px] leading-4.75">Кто звонит клиенту</h2>
          <CustomRadioGroup
            value={cb.call.callMode}
            onValueChange={v => patchCall({ callMode: v as 'manager' | 'robot' })}
            options={[{ label: 'Менеджер', value: 'manager' }, { label: 'Робот', value: 'robot' }]}
          />

          {cb.call.callMode === 'manager' && (
            <>
              <span className="text-[12px] text-[#9a9a9a]">
                Оператор — реальный <b>внутренний номер сотрудника (extension)</b> или его SIP-ID из
                кабинета Mango → «Сотрудники» (напр. 101). Это не URL кабинета. Менеджеров можно также
                вести во вкладке «Звонки» (распределение round-robin).
              </span>
              {projectManagers.length > 0 && (
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-[14px] text-[#797979]">Менеджер из «Звонки»</span>
                  <select
                    value={projectManagers.findIndex(m => m.address === cb.call.managerAddress)}
                    onChange={e => {
                      const m = projectManagers[Number(e.target.value)]
                      if (m) patchCall({ managerType: m.type, managerAddress: m.address, managerName: m.name })
                    }}
                    className="h-10 rounded-[5px] border border-[#E8E8E8] bg-white px-2.5 text-[14px] text-[#161616] outline-none"
                  >
                    <option value={-1} disabled>Выбрать…</option>
                    {projectManagers.map((m, i) => (
                      <option key={m.id} value={i}>{m.name} · {m.address}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2.5">
                <select
                  value={cb.call.managerType}
                  onChange={e => patchCall({ managerType: e.target.value as 'SIP' | 'Телефон' })}
                  className="w-28 h-12.75 rounded-[5px] border border-[#E8E8E8] bg-white px-2.5 text-base text-[#161616] outline-none"
                >
                  <option value="SIP">SIP</option>
                  <option value="Телефон">Телефон</option>
                </select>
                <Input value={cb.call.managerAddress} onValueChange={v => patchCall({ managerAddress: v })} placeholder="Внутренний номер, напр. 101" classNames={inputCx} />
                <Input value={cb.call.managerName} onValueChange={v => patchCall({ managerName: v })} placeholder="Имя менеджера" classNames={inputCx} />
              </div>
            </>
          )}
        </div>
      </BorderedContainer>
      <SwitchableField title="Тонкости соединения" switchLabel="Данные функции доступны только в платной версии" enabled onToggle={() => {}} classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}>
        <div className="w-full flex flex-col gap-3.5">
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] text-[#797979]">Входящий номер у менеджера</span>
            <div className="flex gap-2.5">
              <select value={cb.call.managerIncomingType} onChange={e => patchCall({ managerIncomingType: e.target.value })} className="w-44 h-12.75 rounded-[5px] border border-[#E8E8E8] bg-white px-2.5 text-base text-[#161616] outline-none">
                <option>Номер компании</option>
                <option>Номер менеджера</option>
              </select>
              <Input value={cb.call.managerIncomingNumber} onValueChange={v => patchCall({ managerIncomingNumber: v })} placeholder="+ 7 000 000 00 00" classNames={inputCx} />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] text-[#797979]">Входящий номер у клиента</span>
            <div className="flex gap-2.5">
              <select value={cb.call.clientIncomingType} onChange={e => patchCall({ clientIncomingType: e.target.value })} className="w-44 h-12.75 rounded-[5px] border border-[#E8E8E8] bg-white px-2.5 text-base text-[#161616] outline-none">
                <option>Номер менеджера</option>
                <option>Номер компании</option>
              </select>
              <Input value={cb.call.clientIncomingNumber} onValueChange={v => patchCall({ clientIncomingNumber: v })} placeholder="+ 7 999 999 99 99" classNames={inputCx} />
            </div>
          </div>
        </div>
      </SwitchableField>

      {/* Уведомления менеджера */}
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606] mt-2.5">Уведомления менеджера</h1>
      <SwitchableField
        title="СМС"
        switchLabel="платно, 20 ₽ за сообщение"
        enabled={cb.sms.enabled}
        onToggle={v => patchSms({ enabled: v })}
        classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}
      >
        <div className="w-full flex flex-col gap-2.5">
          <Input value={cb.sms.number} onValueChange={v => patchSms({ number: v })} placeholder="Номер менеджера" classNames={inputCx} />
          <CheckboxField label="SMS если менеджер не взял трубку" showRequired checked={cb.sms.notAnswered} onChange={v => patchSms({ notAnswered: v })} required={cb.sms.notAnsweredReq} onRequiredChange={v => patchSms({ notAnsweredReq: v })} />
          <CheckboxField label="SMS если заказал звонок в нерабочее время" showRequired checked={cb.sms.offHours} onChange={v => patchSms({ offHours: v })} required={cb.sms.offHoursReq} onRequiredChange={v => patchSms({ offHoursReq: v })} />
          <CheckboxField label="SMS после успешного разговора" showRequired checked={cb.sms.afterTalk} onChange={v => patchSms({ afterTalk: v })} required={cb.sms.afterTalkReq} onRequiredChange={v => patchSms({ afterTalkReq: v })} />
        </div>
      </SwitchableField>
      <SwitchableField
        title="Телеграм"
        enabled={cb.telegram.enabled}
        onToggle={v => patchTelegram({ enabled: v })}
        classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}
      >
        <div className="w-full flex flex-col gap-2 text-[13px] text-[#6a6a6a] leading-5">
          <p>Для подключения Telegram-уведомлений добавьте в свой контакт-лист Telegram учётную запись <span className="text-[#1A52DB] font-semibold">@lemnity_callback_bot</span></p>
          <p>и напишите в сообщении следующий код: <span className="font-semibold text-[#1A52DB] bg-[#EEF3FF] rounded-md px-2 py-0.5">{cb.telegram.code}</span></p>
          <p>Для подключения Telegram для группы добавьте учётную запись <span className="text-[#1A52DB] font-semibold">@lemnity_callback_bot</span> в группу, напишите <span className="text-[#1A52DB] font-semibold">@lemnity_callback_bot {cb.telegram.code}</span> и выберите «Подключить уведомления».</p>
          <p>После отправки кода нажмите «Обновить» и выберите нужные уведомления.</p>
          <button type="button" className="self-start h-10 rounded-[8px] bg-[#1A52DB] text-white px-4 mt-1 text-[14px] font-medium">Обновить</button>
        </div>
      </SwitchableField>

      {/* График работы */}
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606] mt-2.5">График работы</h1>
      <SwitchableField
        title="Выбрать время звонка"
        switchLabel="иначе — круглосуточно"
        enabled={cb.schedule.enabled}
        onToggle={v => patchSchedule({ enabled: v })}
        classNames={{ title: 'text-[16px] leading-4.75 font-normal' }}
      >
        <div className="w-full flex flex-col gap-3.5">
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] text-[#797979]">Часовой пояс</span>
            <select
              value={cb.schedule.timezone}
              onChange={e => patchSchedule({ timezone: e.target.value })}
              className="h-12.75 rounded-[5px] border border-[#E8E8E8] bg-white px-2.5 text-base text-[#161616] outline-none"
            >
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] text-[#797979]">Рабочее время</span>
            <div className="flex gap-2.5">
              <Input value={cb.schedule.from} onValueChange={v => patchSchedule({ from: v })} startContent={<span className="text-[#797979]">С:</span>} classNames={inputCx} />
              <Input value={cb.schedule.to} onValueChange={v => patchSchedule({ to: v })} startContent={<span className="text-[#797979]">До:</span>} classNames={inputCx} />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] text-[#797979]">Дни недели</span>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map(d => (
                <button
                  key={d.key} type="button" onClick={() => toggleDay(d.key)}
                  className={`h-11 rounded-[5px] border text-[14px] font-medium ${cb.schedule.days.includes(d.key) ? 'bg-[#DBE1FF] border-[#1A52DB] text-black' : 'bg-white border-[#E8E8E8] text-[#797979]'}`}
                >{d.label}</button>
              ))}
            </div>
          </div>
          <CheckboxField label="Отключить виджет в праздничные дни" checked={cb.schedule.disableHolidays} onChange={v => patchSchedule({ disableHolidays: v })} />
          <CheckboxField label="Не перезванивать автоматически в нерабочее время" checked={cb.schedule.noAutoOffHours} onChange={v => patchSchedule({ noAutoOffHours: v })} />
        </div>
      </SwitchableField>

      {/* Брендинг */}
      <DisableBranding enabled={brandingEnabled} onBrandingEnabledToggle={setBrandingEnabled} />
    </div>
  )
}

export default CallbackWidgetSettings
