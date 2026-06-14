import type { ChatUiMessage } from './types'
import { PDF_FONT_BASE64 } from './pdfFont'

type ExportMeta = {
  operatorName: string
  title: string
}

// Имя зарегистрированного в jsPDF шрифта с кириллицей (см. pdfFont.ts).
const FONT = 'DejaVuSans'

const formatStamp = (iso: string): string => {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime()) || d.getTime() === 0) return ''
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const senderLabel = (m: ChatUiMessage, meta: ExportMeta): string => {
  if (m.sender === 'visitor') return 'Вы'
  if (m.sender === 'system') return ''
  return meta.operatorName || 'Оператор'
}

const attachmentLine = (m: ChatUiMessage): string | null => {
  if (!m.attachmentUrl && !m.image) return null
  const name = m.attachmentName || m.attachmentUrl || m.image || 'Вложение'
  // Эмодзи в стандартных шрифтах не рендерятся — используем текстовую метку.
  return `[вложение] ${name}`
}

/**
 * Скачивает PDF со всей видимой перепиской (включая шаги бота-сценария, которые
 * живут только на клиенте). jsPDF импортируется динамически — не попадает в основной бандл.
 * Кириллица: встраиваем TTF (DejaVuSans subset), т.к. стандартные шрифты PDF её не поддерживают.
 */
export async function exportChatToPdf(
  messages: ChatUiMessage[],
  meta: ExportMeta,
): Promise<void> {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  // Регистрируем шрифт с кириллицей и делаем его активным.
  doc.addFileToVFS('DejaVuSans.ttf', PDF_FONT_BASE64)
  doc.addFont('DejaVuSans.ttf', FONT, 'normal')
  doc.setFont(FONT, 'normal')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  const contentWidth = pageWidth - margin * 2
  const lineHeight = 16
  let y = margin

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  const writeLines = (text: string, fontSize: number) => {
    doc.setFont(FONT, 'normal')
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, contentWidth) as string[]
    for (const line of lines) {
      ensureSpace(lineHeight)
      doc.text(line, margin, y)
      y += lineHeight
    }
  }

  // Заголовок документа.
  writeLines(meta.title, 18)
  y += 6

  for (const m of messages) {
    const label = senderLabel(m, meta)
    const stamp = formatStamp(m.createdAt)

    // Системные сообщения — серой строкой.
    if (m.sender === 'system') {
      doc.setTextColor(150)
      writeLines(m.body || '—', 10)
      doc.setTextColor(0)
      y += 4
      continue
    }

    const header = stamp ? `${label} · ${stamp}` : label
    doc.setTextColor(110)
    writeLines(header, 9)
    doc.setTextColor(0)

    if (m.body) writeLines(m.body, 11)

    const att = attachmentLine(m)
    if (att) {
      doc.setTextColor(60, 80, 200)
      writeLines(att, 10)
      doc.setTextColor(0)
    }

    y += 8
  }

  doc.save('chat-dialog.pdf')
}
