import type { UpdateWidgetDto, WidgetTypeEnum } from '@lemnity/api-sdk'
import { updateWidget } from '@/services/widgets'
import { createAppAsyncThunk, type RootState } from '../store'

/**
 * A factory that produces Redux thunks for saving (syncing) the widget's config
 * to the server
 * 
 * @param actionName name of the redux action! >w<
 * @param selectWidgetId a selector for the widget's id
 * @param selectWidgetType a selector for the widget's type
 * @param selectSelfForSaving
 *   A selector that produces a state which will be
 *   stored in the database in Widget table's `config` field. It must produce
 *   JSON serializable data so no class instances! >~<
 * 
 * @returns an `AsyncThunk`. durrr.
 * 
 * @example
 *   // this action should only be dispatched when the store is aleady mounted
 *   // if it's not then we are having a bigger problem
 *   export const saveAnnouncementWidget = saveWidgetThunkFactory(
 *     'announcement/saveWidget',
 *     (state) => state.announcement!.widgetId,
 *     (state) => state.announcement!.type,
 *     (state): AnnouncementWidgetType => ({
 *       type:
 *         state.announcement!.type,
 *       appearence:
 *         state.announcement!.appearence,
 *       infoSettings:
 *         state.announcement!.infoSettings,
 *       rewardMessageSettings:
 *         state.announcement!.rewardMessageSettings,
 *       mobileSettings:
 *         state.announcement!.mobileSettings,
 *       brandingEnabled:
 *         state.announcement!.brandingEnabled,
 *     })
 *   )
 * 
 *   // later in some React component
 *   dispatch(saveAnnouncementWidget())
 */
export const saveWidgetThunkFactory = (
  actionName: string,
  selectWidgetId: (state: RootState) => string | undefined,
  selectWidgetType: (state: RootState) => WidgetTypeEnum,
  // return type typechecking won't do anything here because
  // typeof UpdateWidgetDto['config']['widget'] === object
  selectSelfForSaving: (state: RootState) => unknown
) => {
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