import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import { memo, useEffect, useRef, useState, type ReactNode } from 'react'

type EmbedSnippetBoxProps = {
  // Код для вставки (<script ...>). Если пусто — показываем emptyText и блокируем копирование.
  snippet: string
  title?: string
  emptyText?: string
  helpText?: ReactNode
}

// Переиспользуемый блок «код для вставки»: моноширинный сниппет + кнопка «Скопировать».
// Используется и для виджетного скрипта (IntegrationTab), и для проектного (ProjectWidgetsPage).
const EmbedSnippetBox = ({
  snippet,
  title = 'Вставьте этот код на сайт',
  emptyText = '',
  helpText
}: EmbedSnippetBoxProps) => {
  const snippetText = snippet || emptyText
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = () => {
    if (!snippet) return
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    },
    []
  )

  return (
    <BorderedContainer className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <BorderedContainer className="w-full flex items-center bg-[#F8F8F8] overflow-hidden">
        <div className="flex-1 min-w-0 w-0 pr-2 overflow-hidden">
          <code className="block w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs font-mono">
            {snippetText}
          </code>
        </div>
        <div className="h-5 w-px bg-gray-300 mx-2 flex-shrink-0" />
        <span
          className={`cursor-pointer text-sm flex-shrink-0 pr-2 ${
            copied ? 'text-green-600' : 'text-[#725DFF]'
          }`}
          onClick={handleCopy}
        >
          {copied ? 'Скопировано' : 'Скопировать'}
        </span>
      </BorderedContainer>
      {helpText ? <span className="text-[#797979] text-sm">{helpText}</span> : null}
    </BorderedContainer>
  )
}

export default memo(EmbedSnippetBox)
