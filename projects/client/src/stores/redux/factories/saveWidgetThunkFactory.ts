import type { UpdateWidgetDto, WidgetTypeEnum } from '@lemnity/api-sdk'
import { updateWidget } from '@/services/widgets'
import { createAppAsyncThunk, type RootState } from '../store'

export const saveWidgetThunkFactory = (
  actionName: string,
  selectWidgetId: (state: RootState) => string | undefined,
  selectWidgetType: (state: RootState) => WidgetTypeEnum,
  // return type typechecking won't do anything here because
  // typeof UpdateWidgetDto['config']['widget'] === object
  selectSelfForSaving: (state: RootState) => unknown
) => {
  console.log('[saveWidgetThunkFactory]')
  const thunk = createAppAsyncThunk(
    actionName,
    async (_, thunkApi) => {
      const state = thunkApi.getState()
      const widgetId = selectWidgetId(state)
      const widgetType = selectWidgetType(state)
  
      if (!widgetId) {
        // dispatch an action here
        return
      }
  
      const self = selectSelfForSaving(state)
      const payload: UpdateWidgetDto = {
        config: {
          id: widgetId,
          widget: self,
        },
        type: widgetType,
      }
  
      console.log(payload)
      await updateWidget(widgetId, payload)
    },
  )

  return thunk
}