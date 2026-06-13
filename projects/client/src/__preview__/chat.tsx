/**
 * Живой тест редактора «Чат» через РЕАЛЬНУЮ раскладку EditWidgetPage:
 * та же панель вкладок + FieldsSettingsTab (рендерит секции из реестра) + реальный WidgetPreview.
 * Визуал и машинерия — те же компоненты редактора, что и у остальных виджетов.
 * Запуск: http://localhost:5173/preview/chat.html
 */
import { Suspense, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/system'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@heroui/button'

import { WidgetTypeEnum } from '@lemnity/api-sdk'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
import FieldsSettingsTab from '@/layouts/WidgetSettings/FieldsSettingsTab/FieldsSettingsTab'
import IntegrationTab from '@/layouts/WidgetSettings/IntegrationTab/IntegrationTab'
import WidgetPreview from '@/layouts/WidgetPreview/WidgetPreview'
import SvgIcon from '@/components/SvgIcon'
import iconEye from '@/assets/icons/eye.svg'

import '../index.css'

// Тип виджета можно переключить через ?type= (для сравнения с другими виджетами)
const WTYPE = ((new URLSearchParams(location.search).get('type') as WidgetTypeEnum) ||
  WidgetTypeEnum.CHAT)

const PREVIEW_ID = 'chat-preview'

// Чистим устаревший черновик прототипа (прежние версии могли хранить другую форму конфига),
// иначе стор восстановит несовместимый widget и поля будут «сбрасываться».
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

const def = getWidgetDefinition(WTYPE)
const InlinePreview = def.preview.inline

type TabKey = 'fields' | 'integration'

const Page = () => {
  const [tab, setTab] = useState<TabKey>('fields')
  const [inline, setInline] = useState(false)
  const showIntegration = usesStandardSurface(WTYPE, 'integration')
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'fields', label: 'Настройка виджета' },
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
                onPress={() => setInline(true)}
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

      {inline && InlinePreview && (
        <Suspense fallback={null}>
          <InlinePreview onClose={() => setInline(false)} />
        </Suspense>
      )}
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
