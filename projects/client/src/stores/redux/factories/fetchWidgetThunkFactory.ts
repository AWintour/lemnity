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

export const fetchWidgetThunkFactory = (
  actionName: string,
  selectFetchStatus: (state: RootState) => FetchStatus
) => {
  const thunk = createAppAsyncThunk(
    actionName,
    async ({ widgetId, embedded }: ThunkParams) => {
      if (embedded) {
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
        const fetchStatus = selectFetchStatus(thunkApi.getState())
        if (fetchStatus === 'pending' || fetchStatus === 'succeeded') {
          return false
        }
      }
    }
  )

  return thunk
}