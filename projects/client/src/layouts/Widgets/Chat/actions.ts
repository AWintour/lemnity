import type {
  TypedWidgetUpdater,
} from '@/stores/widgetSettings/widgetActions/types'
import type {
  ChatWidgetType,
} from '@lemnity/widget-config/widgets/chat'

// Единый patch-апдейтер (как у «Обратного звонка»): экран настроек чата сам собирает
// частичные изменения полей, а здесь только мёржим их в текущий конфиг виджета.
export const createChatActions = (
  updateWidget: TypedWidgetUpdater<ChatWidgetType>
) => ({
  setChatPatch: (patch: Partial<ChatWidgetType>) =>
    updateWidget(widget => ({
      ...widget,
      ...patch,
    })),
})
