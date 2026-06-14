import SvgIcon from '@/components/SvgIcon'
import iconCode from '@/assets/icons/website-code.svg'
import { memo, useMemo } from 'react'
import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
import SurfaceNotice from '@/layouts/WidgetSettings/Common/SurfaceNotice'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import { buildEmbedSnippet } from '@/config/embed'
import EmbedSnippetBox from './EmbedSnippetBox'

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
  const embedSnippet = useMemo(() => {
    if (!widgetId) return ''
    if (scriptSnippet && scriptSnippet.trim()) return scriptSnippet
    return buildEmbedSnippet(widgetId)
  }, [scriptSnippet, widgetId])

  if (!showStandardSurface) {
    if (CustomIntegrationSurface) return <CustomIntegrationSurface />
    return <SurfaceNotice surface="integration" />
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-3xl font-normal leading-2">Внедрите механику в свой бизнес</span>
      <span className="text-xl ">(платформу)</span>
      <hr className="border-[#C0C0C0]" />
      <div className="flex items-center gap-4">
        <SvgIcon src={iconCode} size={'100px'} className="w-min text-[#725DFF]" />
      </div>
      <hr className="border-[#C0C0C0]" />
      <div>
        <span>Скрипт</span>{' '}
        <a className="text-[#725DFF]" href="https://help.lemnity.ru" target="_blank">
          [ инструкция ]
        </a>
      </div>
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
