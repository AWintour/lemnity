import { type TextareaHTMLAttributes } from 'react'
import { cn } from '@heroui/theme'

type ResizableTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  // Максимальная высота при ручном растягивании (px). Дальше включается скролл.
  maxHeight?: number
}

/**
 * Текстовое поле с угловым ресайзером: пользователь тянет за уголок и растягивает по высоте
 * до maxHeight (по умолчанию 350px), после чего содержимое скроллится.
 */
const ResizableTextarea = ({ maxHeight = 350, className, style, ...rest }: ResizableTextareaProps) => (
  <textarea
    rows={2}
    className={cn('block resize-y overflow-y-auto', className)}
    style={{ maxHeight, ...style }}
    {...rest}
  />
)

export default ResizableTextarea
