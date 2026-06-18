import type { Position } from '@lemnity/widget-config/widgets/chat'

/**
 * Позиция лаунчера чата: вкладка «Отображение» (display.icon.position) перекрывает
 * «Настройку виджета» (settings.triggerPosition). Chat поддерживает только
 * bottom-left/right; top-right сводим к bottom-right.
 *
 * Единый источник для embedRuntime и для превью настроек — иначе превью не отражает
 * выбранную в «Отображении» позицию (баг «Положение виджета не работает»).
 */
export const resolveChatTriggerPosition = (
  displayPosition: 'bottom-left' | 'top-right' | 'bottom-right' | undefined,
  widgetTriggerPosition: Position,
): Position =>
  displayPosition === 'bottom-left'
    ? 'bottom-left'
    : displayPosition === 'bottom-right' || displayPosition === 'top-right'
      ? 'bottom-right'
      : widgetTriggerPosition
