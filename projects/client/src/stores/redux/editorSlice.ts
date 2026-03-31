import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { WidgetTypeEnum } from '@lemnity/api-sdk'

type EditorState = {
  currentWidget: WidgetTypeEnum | null
}

const initialState: EditorState = {
  currentWidget: null,
}

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    currentWidgetChanged: (
      state,
      action: PayloadAction<WidgetTypeEnum | null>
    ) => {
      state.currentWidget = action.payload
    },
  },
  selectors: {
    selectCurrentWidget: (state: EditorState) => state.currentWidget,
  },
})

export default editorSlice.reducer
export { editorSlice }
export const { currentWidgetChanged } = editorSlice.actions
export const { selectCurrentWidget } = editorSlice.selectors
