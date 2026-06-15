import SvgIcon from '@/components/SvgIcon'
import iconCode from '@/assets/icons/website-code.svg'
import iconWordpress from '@/assets/icons/wordpress.svg'
import { memo, useMemo, useState } from 'react'
import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
import SurfaceNotice from '@/layouts/WidgetSettings/Common/SurfaceNotice'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import {
  buildEmbedSnippet,
  WORDPRESS_PLUGIN_DOWNLOAD_URL,
  WORDPRESS_PLUGIN_INSTRUCTION_URL,
  WORDPRESS_PLUGIN_PAGE_URL
} from '@/config/embed'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import EmbedSnippetBox from './EmbedSnippetBox'

type InstallMethod = 'site' | 'wordpress'

const IntegrationTab = () => {
  const widgetId = useWidgetSettingsStore(s => s.settings?.id)
  const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)
  const widgetDefinition = widgetType ? getWidgetDefinition(widgetType) : null
  const staticDefaults = useWidgetStaticDefaults()
  const scriptSnippet = useWidgetSettingsStore(
    s => s.settings?.integration?.scriptSnippet ?? staticDefaults?.integration.scriptSnippet ?? ''
  )
  const showStandardSurface = !widgetType || usesStandardSurface(widgetType, 'integration')
  const CustomIntegrationSurface = widgetDefinition?.settings.surfaces?.integration
  const [installMethod, setInstallMethod] = useState<InstallMethod>('site')
  const embedSnippet = useMemo(() => {
    if (!widgetId) return ''
    if (scriptSnippet && scriptSnippet.trim()) return scriptSnippet
    return buildEmbedSnippet(widgetId)
  }, [scriptSnippet, widgetId])

  if (!showStandardSurface) {
    if (CustomIntegrationSurface) return <CustomIntegrationSurface />
    return <SurfaceNotice surface="integration" />
  }

  const renderMethodCard = (method: InstallMethod, src: string) => {
    const active = installMethod === method
    return (
      <button
        type="button"
        onClick={() => setInstallMethod(method)}
        className={`rounded-xl transition ${
          active ? '' : 'grayscale opacity-50 hover:opacity-80'
        }`}
        aria-pressed={active}
      >
        <SvgIcon src={src} size={'120px'} className="text-[#725DFF]" />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-3xl font-normal leading-2">Внедрите механику в свой бизнес</span>
      <span className="text-xl ">(платформу)</span>
      <hr className="border-[#C0C0C0]" />
      <div className="flex items-center gap-4">
        {renderMethodCard('site', iconCode)}
        {renderMethodCard('wordpress', iconWordpress)}
      </div>
      <hr className="border-[#C0C0C0]" />
      {installMethod === 'wordpress' && (
        <BorderedContainer className="flex flex-wrap items-center gap-3">
          <a
            href={WORDPRESS_PLUGIN_DOWNLOAD_URL}
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-[#F1F1F1] px-4 py-2 text-sm text-[#1F1F1F] hover:bg-[#E6E6E6]"
          >
            Скачать плагин
          </a>
          <a
            href={WORDPRESS_PLUGIN_PAGE_URL}
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-[#F1F1F1] px-4 py-2 text-sm text-[#1F1F1F] hover:bg-[#E6E6E6]"
          >
            Установить плагин
          </a>
          <div className="h-6 w-px bg-gray-300" />
          <a
            href={WORDPRESS_PLUGIN_INSTRUCTION_URL}
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-[#725DFF] px-4 py-2 text-sm text-white hover:bg-[#5d49e6]"
          >
            Инструкция установке
          </a>
        </BorderedContainer>
      )}
      <EmbedSnippetBox
        snippet={embedSnippet}
        emptyText="Сохраните виджет, чтобы получить код интеграции."
        helpText={
          <>
            Добавьте код на все страницы (внутри &lt;head&gt; или перед &lt;/body&gt;).
            <br />
            Внимание! Временно можно добавить только один виджет на одну страницу, используя скрипт.
          </>
        }
      />
    </div>
  )
}

export default memo(IntegrationTab)
