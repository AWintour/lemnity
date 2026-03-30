// import type {
//   ActionTimerWidgetSettings,
//   ActionTimerImagePosition
// } from '@/stores/widgetSettings/types'
// import type { WidgetActions, TypedWidgetUpdater } from '@/stores/widgetSettings/widgetActions/types'

// export const createActionTimerActions = (
//   updateWidget: TypedWidgetUpdater<ActionTimerWidgetSettings>
// ): Partial<WidgetActions> => ({
//   updateActionTimer: (updates: Partial<ActionTimerWidgetSettings['countdown']>) =>
//     updateWidget(widget => ({
//       ...widget,
//       countdown: { ...widget.countdown, ...updates }
//     })),
//   setActionTimerImage: (imageUrl?: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       countdown: { ...widget.countdown, imageUrl }
//     })),
//   setTextBeforeCountdown: (textBeforeCountdown: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       countdown: { ...widget.countdown, textBeforeCountdown }
//     })),
//   setTextBeforeCountdownColor: (textBeforeCountdownColor: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       countdown: { ...widget.countdown, textBeforeCountdownColor }
//     })),
//   setImagePosition: (position: ActionTimerImagePosition) =>
//     updateWidget(widget => ({
//       ...widget,
//       countdown: { ...widget.countdown, imagePosition: position }
//     }))
// })
