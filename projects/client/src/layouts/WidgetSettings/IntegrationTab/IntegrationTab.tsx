// import SvgIcon from '@/components/SvgIcon'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import iconCode from '@/assets/icons/website-code.svg'
// import { memo, useEffect, useMemo, useRef, useState } from 'react'
// import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
// import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
// import SurfaceNotice from '@/layouts/WidgetSettings/Common/SurfaceNotice'
// import { getWidgetDefinition } from '@/layouts/Widgets/registry'
// import { buildEmbedSnippet } from '@/config/embed'

// const IntegrationTab = () => {
//   const widgetId = useWidgetSettingsStore(s => s.settings?.id)
//   const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)
//   const widgetDefinition = widgetType ? getWidgetDefinition(widgetType) : null
//   const staticDefaults = useWidgetStaticDefaults()
//   const scriptSnippet = useWidgetSettingsStore(
//     s => s.settings?.integration?.scriptSnippet ?? staticDefaults?.integration.scriptSnippet ?? ''
//   )
//   const showStandardSurface = !widgetType || usesStandardSurface(widgetType, 'integration')
//   const CustomIntegrationSurface = widgetDefinition?.settings.surfaces?.integration
//   const embedSnippet = useMemo(() => {
//     if (!widgetId) return ''
//     if (scriptSnippet && scriptSnippet.trim()) return scriptSnippet
//     return buildEmbedSnippet(widgetId)
//   }, [scriptSnippet, widgetId])
//   const snippetText = embedSnippet || 'Сохраните виджет, чтобы получить код интеграции.'
//   const [copied, setCopied] = useState(false)
//   const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   const handleCopy = () => {
//     if (!embedSnippet) return
//     navigator.clipboard.writeText(embedSnippet)
//     setCopied(true)
//     if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
//     copyTimerRef.current = setTimeout(() => setCopied(false), 1500)
//   }

//   useEffect(
//     () => () => {
//       if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
//     },
//     []
//   )

//   if (!showStandardSurface) {
//     if (CustomIntegrationSurface) return <CustomIntegrationSurface />
//     return <SurfaceNotice surface="integration" />
//   }

//   return (
//     <div className="flex flex-col gap-2">
//       <span className="text-3xl font-normal leading-2">Внедрите механику в свой бизнес</span>
//       <span className="text-xl ">(платформу)</span>
//       <hr className="border-[#C0C0C0]" />
//       <div className="flex items-center gap-4">
//         <SvgIcon src={iconCode} size={'100px'} className="w-min text-[#725DFF]" />
//       </div>
//       <hr className="border-[#C0C0C0]" />
//       <div>
//         <span>Скрипт</span>{' '}
//         <a className="text-[#725DFF]" href="https://help.lemnity.ru" target="_blank">
//           [ инструкция ]
//         </a>
//       </div>
//       <BorderedContainer className="flex flex-col gap-2">
//         <div className="flex flex-row items-center justify-between">
//           <span className="text-sm font-semibold">Вставьте этот код на сайт</span>
//         </div>
//         <BorderedContainer className="w-full flex items-center bg-[#F8F8F8] overflow-hidden">
//           <div className="flex-1 min-w-0 w-0 pr-2 overflow-hidden">
//             <code className="block w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs font-mono">
//               {snippetText}
//             </code>
//           </div>
//           <div className="h-5 w-px bg-gray-300 mx-2 flex-shrink-0" />
//           <span
//             className={`cursor-pointer text-sm flex-shrink-0 pr-2 ${
//               copied ? 'text-green-600' : 'text-[#725DFF]'
//             }`}
//             onClick={handleCopy}
//           >
//             {copied ? 'Скопировано' : 'Скопировать'}
//           </span>
//         </BorderedContainer>
//         <span className="text-[#797979] text-sm">
//           Добавьте код на все страницы (внутри &lt;head&gt; или перед &lt;/body&gt;).
//           <br />
//           Внимание! Временно можно добавить только один виджет на одну страницу, используя скрипт.
//         </span>
//       </BorderedContainer>
//     </div>
//   )
// }

// export default memo(IntegrationTab)
