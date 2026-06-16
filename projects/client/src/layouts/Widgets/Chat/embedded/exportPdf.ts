import type { ChatUiMessage } from './types'

type ExportMeta = {
  operatorName: string
  title: string
}

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

// Картинки сообщения (галерея → одиночное вложение → image), без дублей.
const imageUrls = (m: ChatUiMessage): string[] => {
  const urls: string[] = []
  if (m.attachments?.length) {
    urls.push(...m.attachments.filter(a => a.type === 'image').map(a => a.url))
  } else if (m.attachmentType === 'image' && m.attachmentUrl) {
    urls.push(m.attachmentUrl)
  }
  if (m.image) urls.push(m.image)
  return Array.from(new Set(urls))
}

// Текстовые метки для не-картиночных вложений (видео/файлы).
const fileLabels = (m: ChatUiMessage): string[] => {
  if (m.attachments?.length) {
    return m.attachments
      .filter(a => a.type !== 'image')
      .map(a => `📎 ${a.name || (a.type === 'video' ? 'Видео' : 'Файл')}`)
  }
  if (m.attachmentUrl && m.attachmentType && m.attachmentType !== 'image') {
    return [`📎 ${m.attachmentName || (m.attachmentType === 'video' ? 'Видео' : 'Файл')}`]
  }
  return []
}

/**
 * Скачивает PDF со всей видимой перепиской (включая шаги бота, которые живут только на клиенте).
 * Рендерим офскрин-DOM (эмодзи и кириллицу рисует браузерный шрифт, картинки — реальными <img>),
 * снимаем в canvas (html2canvas) и режем по страницам A4 в jsPDF. Обе либы — динамический import,
 * не попадают в основной бандл.
 */
export async function exportChatToPdf(messages: ChatUiMessage[], meta: ExportMeta): Promise<void> {
  // Офскрин-контейнер «как лист».
  const root = document.createElement('div')
  Object.assign(root.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    width: '720px',
    background: '#ffffff',
    color: '#1a1a1a',
    padding: '28px',
    boxSizing: 'border-box',
    font: "16px/1.4 -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  } as CSSStyleDeclaration)

  const titleEl = document.createElement('div')
  titleEl.textContent = meta.title
  Object.assign(titleEl.style, { fontSize: '22px', fontWeight: '600', marginBottom: '18px' })
  root.appendChild(titleEl)

  for (const m of messages) {
    if (m.sender === 'system') {
      const sys = document.createElement('div')
      sys.textContent = m.body || '—'
      Object.assign(sys.style, {
        textAlign: 'center',
        color: '#979797',
        fontSize: '13px',
        margin: '10px 0',
      })
      root.appendChild(sys)
      continue
    }

    const isVisitor = m.sender === 'visitor'
    const row = document.createElement('div')
    Object.assign(row.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: isVisitor ? 'flex-end' : 'flex-start',
      margin: '8px 0',
    })

    const head = document.createElement('div')
    const stamp = formatStamp(m.createdAt)
    const label = senderLabel(m, meta)
    head.textContent = stamp ? `${label} · ${stamp}` : label
    Object.assign(head.style, { fontSize: '11px', color: '#9a9a9a', margin: '0 4px 3px' })
    row.appendChild(head)

    const bubble = document.createElement('div')
    Object.assign(bubble.style, {
      maxWidth: '78%',
      padding: '10px 14px',
      borderRadius: '14px',
      fontSize: '15px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      background: isVisitor ? '#5951E5' : '#F4F2FC',
      color: isVisitor ? '#ffffff' : '#1a1a1a',
    } as CSSStyleDeclaration)

    for (const url of imageUrls(m)) {
      const img = document.createElement('img')
      img.src = url
      img.crossOrigin = 'anonymous'
      Object.assign(img.style, {
        display: 'block',
        maxWidth: '320px',
        maxHeight: '240px',
        borderRadius: '10px',
        margin: '4px 0',
      })
      bubble.appendChild(img)
    }
    for (const lbl of fileLabels(m)) {
      const f = document.createElement('div')
      f.textContent = lbl
      f.style.margin = '4px 0'
      bubble.appendChild(f)
    }
    if (m.body) {
      const text = document.createElement('div')
      text.textContent = m.body
      bubble.appendChild(text)
    }

    row.appendChild(bubble)
    root.appendChild(row)
  }

  document.body.appendChild(root)

  try {
    // Ждём загрузки картинок; не загруженные по CORS заменяем текст-плейсхолдером (без taint canvas).
    const imgs = Array.from(root.querySelectorAll('img'))
    await Promise.all(
      imgs.map(
        img =>
          new Promise<void>(resolve => {
            if (img.complete && img.naturalWidth > 0) return resolve()
            const done = () => resolve()
            img.onload = done
            img.onerror = () => {
              const ph = document.createElement('div')
              ph.textContent = '🖼 изображение недоступно'
              ph.style.color = '#9a9a9a'
              ph.style.margin = '4px 0'
              img.replaceWith(ph)
              resolve()
            }
            setTimeout(done, 8000)
          })
      )
    )

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    const canvas = await html2canvas(root, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 24
    const imgW = pageW - margin * 2
    const ratio = imgW / canvas.width // pt на 1px источника
    const pageSrcH = Math.floor((pageH - margin * 2) / ratio) // высота среза в px источника

    let srcY = 0
    let first = true
    while (srcY < canvas.height) {
      const sliceH = Math.min(pageSrcH, canvas.height - srcY)
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = sliceH
      const ctx = slice.getContext('2d')
      if (ctx) ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
      const data = slice.toDataURL('image/jpeg', 0.92)
      if (!first) doc.addPage()
      doc.addImage(data, 'JPEG', margin, margin, imgW, sliceH * ratio)
      srcY += sliceH
      first = false
    }

    doc.save('chat-dialog.pdf')
  } finally {
    root.remove()
  }
}
