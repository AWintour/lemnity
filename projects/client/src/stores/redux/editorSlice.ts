import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import type { PositionType } from '@lemnity/widget-config/features/trigger'

type EditorState = {
  currentWidget: WidgetTypeEnum | null
  megaButtonEnabled?: boolean
  notificationTriggerPosition?: PositionType,
}

const initialState: EditorState = {
  currentWidget: null,
  megaButtonEnabled: false,
  notificationTriggerPosition: undefined,
}

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    currentWidgetChanged:
      (state, action: PayloadAction<WidgetTypeEnum | null>) => {
        state.currentWidget = action.payload
      },
    megaButtonEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.megaButtonEnabled = action.payload
      },
    notificationTriggerPositionChanged:
      (state, action: PayloadAction<PositionType | undefined>) => {
        state.notificationTriggerPosition = action.payload
      },
  },
  selectors: {
    selectCurrentWidget:
      (state) => state.currentWidget,
    selectMegaButtonEnabled:
      (state) => state.megaButtonEnabled,
    selectNotificationTriggerPosition:
      (state) => state.notificationTriggerPosition,
  },
})

export default editorSlice.reducer
export { editorSlice }
export const {
  currentWidgetChanged,
  megaButtonEnabledChanged,
  notificationTriggerPositionChanged,
} = editorSlice.actions
export const {
  selectCurrentWidget,
  selectMegaButtonEnabled,
  selectNotificationTriggerPosition,
} = editorSlice.selectors
