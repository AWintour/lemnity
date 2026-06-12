/**
 * Живой тест редактора «Конвейер Удачи» через РЕАЛЬНУЮ раскладку EditWidgetPage:
 * та же панель вкладок + FieldsSettingsTab (рендерит секции из реестра) + реальный WidgetPreview.
 * «Конвейер Удачи» — клон «Колеса фортуны», поэтому визуал идентичен колесу.
 * Запуск: http://localhost:5173/preview/conveyor-of-luck.html
 * Тип можно переключить через ?type= (для сравнения с колесом/другими виджетами).
 */
import { Suspense, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/system'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@heroui/button'

import { WidgetTypeEnum } from '@lemnity/api-sdk'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import usePreviewRuntimeStore from '@/stores/previewRuntimeStore'
import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
import { simulateWheelSpinResultFromSectors } from '@/layouts/Widgets/WheelOfFortune/actionHandlers'
import type { WheelOfFortuneWidgetSettings } from '@/stores/widgetSettings/types'
import FieldsSettingsTab from '@/layouts/WidgetSettings/FieldsSettingsTab/FieldsSettingsTab'
import DisplaySettingsTab from '@/layouts/WidgetSettings/DisplaySettingsTab/DisplaySettingsTab'
import IntegrationTab from '@/layouts/WidgetSettings/IntegrationTab/IntegrationTab'
import WidgetPreview from '@/layouts/WidgetPreview/WidgetPreview'
import PreviewModal from '@/layouts/Widgets/Common/PreviewModal'
import LauncherOverlay from '@/layouts/Widgets/ConveyorOfLuck/LauncherOverlay'
import SvgIcon from '@/components/SvgIcon'
import iconEye from '@/assets/icons/eye.svg'

import '../index.css'

// Тип виджета можно переключить через ?type= (для сравнения с другими виджетами)
const WTYPE = ((new URLSearchParams(location.search).get('type') as WidgetTypeEnum) ||
  WidgetTypeEnum.CONVEYOR_OF_LUCK)

const PREVIEW_ID = 'col-preview'

// Чистим устаревший черновик прототипа под этим id, иначе стор восстановит несовместимый widget.
try {
  const raw = localStorage.getItem('widget-settings')
  if (raw) {
    const map = JSON.parse(raw) as Record<string, unknown>
    if (map[PREVIEW_ID]) {
      delete map[PREVIEW_ID]
      localStorage.setItem('widget-settings', JSON.stringify(map))
    }
  }
} catch {
  /* ignore */
}

// Инициализация стора как в EditWidgetPage
useWidgetSettingsStore.getState().init(PREVIEW_ID, WTYPE, 'preview-project')

type TabKey = 'fields' | 'display' | 'integration'

// Запуск спина по кнопке «Просмотр»-модалки: симулируем результат и крутим ленту.
const runPreviewSpin = () => {
  const runtime = usePreviewRuntimeStore.getState()
  const status = runtime.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined
  if (status === 'spinning') return
  const widget = useWidgetSettingsStore.getState().settings?.widget as
    | WheelOfFortuneWidgetSettings
    | undefined
  const items = widget?.sectors?.items
  const result = items?.length ? simulateWheelSpinResultFromSectors(items) : null
  if (result) {
    runtime.setValue('wheel.winningSectorId', result.sectorId)
    runtime.setValue('wheel.result', result)
    runtime.setValue('wheel.status', 'spinning')
  }
  runtime.emit('wheel.spin')
  setTimeout(() => runtime.setValue('wheel.status', 'idle'), 5200)
}

const Page = () => {
  const [tab, setTab] = useState<TabKey>('fields')
  // Двухшаговый «Просмотр»: сперва показываем кнопку открытия (launcher), клик по ней открывает окно.
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [windowOpen, setWindowOpen] = useState(false)
  const showDisplay = usesStandardSurface(WTYPE, 'display')
  const showIntegration = usesStandardSurface(WTYPE, 'integration')
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'fields', label: 'Настройка виджета' },
    ...(showDisplay ? [{ key: 'display' as const, label: 'Отображение' }] : []),
    ...(showIntegration ? [{ key: 'integration' as const, label: 'Интеграция' }] : []),
  ]

  return (
    <div className="h-screen flex flex-col bg-[#F8F7F5]">
      <div className="flex-1 min-h-0 flex">
        {/* ЛЕВО — настройки (как контентная колонка EditWidgetPage) */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5 h-full min-h-0 px-6 py-5">
          {/* Панель вкладок — копия tabsBar из EditWidgetPage */}
          <div className="w-full bg-[#F5F6F8] border border-[#E6E6E6] rounded-[5px] p-1.5 gap-2 flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-2.5">
              {tabs.map(item => (
                <Button
                  key={item.key}
                  size="md"
                  variant="flat"
                  className={`h-[30px] px-2.5 rounded-[5px] text-[16px] text-black ${
                    tab === item.key ? 'bg-[#DBE1FF]' : 'bg-white border border-[#E4E4E4]'
                  }`}
                  onPress={() => setTab(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                className="h-[30px] rounded-[5px] text-[16px] text-black bg-[#69C8F4] px-2.5"
                onPress={() => {
                  setWindowOpen(false)
                  setLauncherOpen(true)
                }}
                startContent={<SvgIcon src={iconEye} size={20} className="text-black" />}
              >
                Просмотр
              </Button>
              <Button className="h-[30px] rounded-[5px] bg-[#FFBF1A] text-[16px] text-black px-2.5">
                Сохранить
              </Button>
            </div>
          </div>

          <div className="flex flex-col py-2.5 gap-2.5 flex-1 min-h-0 overflow-auto rounded-md">
            <Suspense fallback={<div className="p-4 text-sm text-[#9A968F]">Загрузка…</div>}>
              {tab === 'fields' && <FieldsSettingsTab />}
              {tab === 'display' && showDisplay && <DisplaySettingsTab />}
              {tab === 'integration' && showIntegration && <IntegrationTab />}
            </Suspense>
          </div>
        </div>

        {/* ПРАВО — реальный WidgetPreview (как rightPanel шириной 450px) */}
        <div className="w-[450px] border-l border-[#E6E6E6] bg-white">
          <div className="w-full h-full flex flex-col px-4 py-4">
            <Suspense fallback={null}>
              <WidgetPreview />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Шаг 1 «Просмотр»: затемнённая «страница» с кнопкой открытия окна в нужном углу. */}
      {launcherOpen && !windowOpen ? (
        <LauncherOverlay
          onOpen={() => setWindowOpen(true)}
          onClose={() => setLauncherOpen(false)}
        />
      ) : null}

      {/* Шаг 2: само окно виджета. */}
      <PreviewModal
        isOpen={windowOpen}
        onClose={() => {
          setWindowOpen(false)
          setLauncherOpen(false)
        }}
        screen="main"
        onSubmit={runPreviewSpin}
      />
    </div>
  )
}

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <HeroUIProvider>
        <Page />
      </HeroUIProvider>
    </BrowserRouter>
  </QueryClientProvider>,
)
