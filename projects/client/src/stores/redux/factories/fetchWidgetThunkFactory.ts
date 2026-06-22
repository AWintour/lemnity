import { createAppAsyncThunk, type FetchStatus, type RootState } from '../store'
import {
  PublicWidgetsApi,
  Configuration,
  // type PublicWidget,
} from '@lemnity/api-sdk'
import { getWidget } from '@/services/widgets'

const configuration = new Configuration({
  basePath: 'http://localhost:3000'
})
const apiInstance = new PublicWidgetsApi(configuration)

type ThunkParams = {
  widgetId: string
  embedded?: boolean
}

/**
 * A factory that produces Redux thunks for fetching the widget's config.
 * The resulting thunk uses different endpoints depending on its `embedded`
 * named parameter
 * 
 * @param actionName name of the redux action! >w<
 * @param selectFetchStatus a selector for the `FetchStatus`
 * @returns an `AsyncThunk`. durrr.
 * 
 * @example
 *   // this action should be dispatched when the store is aleady mounted
 *   // if it's not then we are having a bigger problem
 *   export const fetchAnnouncementWidget = fetchWidgetThunkFactory(
 *     'announcement/fetchWidget',
 *     (state) => state.announcement!.fetchStatus
 *   )
 * 
 *   // later in some React component
 *   dispatch(fetchEventTimerWidget({ widgetId: 'aboba' }))
 *   // or an embedded environment
 *   dispatch(fetchEventTimerWidget({ widgetId: 'aboba', embedded: true }))
 */
export const fetchWidgetThunkFactory = (
  actionName: string,
  selectFetchStatus: (state: RootState) => FetchStatus
) => {
  const thunk = createAppAsyncThunk(
    actionName,
    async ({ widgetId, embedded }: ThunkParams) => {
      if (embedded) {
        // console.log(
        //   `[lemnity][fetchWidgetThunkFactory] fetching widget ${widgetId} ` +
        //   'from public endpoint...'
        // )
        const { data } = await apiInstance.publicWidgetControllerFindOne(
          { id: widgetId }
        )
        return data
      }
      else {
        const widget = await getWidget(widgetId)
        return widget
      }
    },
    {
      condition(_, thunkApi) {
        let fetchStatus: FetchStatus = 'idle'

        try {
          fetchStatus = selectFetchStatus(thunkApi.getState())
        }
        catch {
          // the widget slice might not be mounted yet in embedded bootstrap
          // (see packages/embed-script/src/embed/index.tsx)
          // in that case the first fetch should be allowed to proceed
          // once the fetch has happened it will generate an action
          // that action will be reduced and the slice will be mounted
          // then the fetchStatus will be updated
          fetchStatus = 'idle'
        }

        if (fetchStatus === 'pending' || fetchStatus === 'succeeded') {
          return false
        }
      }
    }
  )

  return thunk
}
