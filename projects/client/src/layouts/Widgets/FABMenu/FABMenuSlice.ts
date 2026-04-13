// this slice is implementing pre-existing state structure with minimal
// modifications so that i don't have to meddle with the records in the database
// i did not design this state. i did not name the fields.
// i just ported it to redux toolkit and made it the same-ish shape
// as the widgets implemented by me
import {
  nanoid,
  createSlice,
  createEntityAdapter,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'

import {
  type RootState,
  type FetchStatus,
  type WidgetSettings,
} from '@/stores/redux/store'
import { rootReducer } from '@/stores/redux/reducer'
import {
  fetchWidgetThunkFactory,
  saveWidgetThunkFactory,
} from '@/stores/redux/factories'
import {
  commonReducers,
  commonSelectors,
} from '@/stores/redux/features/common'
import {
  triggerTextReducer,
  triggerBackgroundColorReducer,
  triggerTextColorReducer,
  triggerIconReducer,
  triggerPositionReducer,

  selectTriggerText as selectFABMenuTriggerText,
  selectTriggerBackgroundColor as selectFABMenuTriggerBackgroundColor,
  selectTriggerTextColor as selectFABMenuTriggerTextColor,
  selectTriggerIcon as selectFABMenuTriggerIcon,
  selectTriggerPosition as selectFABMenuTriggerPosition,
} from '@/stores/redux/features/triggerSettings'

import {
  WidgetTypeEnum,
  type PublicWidget,
} from '@lemnity/api-sdk'

import {
  type FABMenuSector,
  type FabMenuWidgetType,
} from '@lemnity/widget-config/widgets/fab-menu'

export const fetchFabMenuWidget = fetchWidgetThunkFactory(
  'FABMenu/fetchWidget',
  (state) => state.notification!.fetchStatus
)

export const saveFabMenuWidget = saveWidgetThunkFactory(
  'FABMenu/saveWidget',
  (state) => state.FABMenu!.widgetId,
  (state) => state.FABMenu!.type,
  (state): FabMenuWidgetType => ({
    type:
      state.FABMenu!.type,
    triggerText:
      state.FABMenu!.triggerText,
    triggerTextColor:
      state.FABMenu!.triggerTextColor,
    triggerBackgroundColor:
      state.FABMenu!.triggerBackgroundColor,
    triggerIcon:
      state.FABMenu!.triggerIcon,
    triggerPosition:
      state.FABMenu!.triggerPosition,
    sectors:
      selectAllSectors(state),
    brandingEnabled:
      state.FABMenu!.brandingEnabled,
  })
)

const sectorAdapter = createEntityAdapter<FABMenuSector>()

export type FABMenuSectorEnitities =
  ReturnType<typeof sectorAdapter.getInitialState>

type FABMenuWidgetState = Omit<FabMenuWidgetType, 'sectors'> & {
  sectors: FABMenuSectorEnitities
  widgetId?: string
  projectId?: string
  fetchStatus: FetchStatus
  fetchError: string | null
}

type FABMenuSectorUpdate =
  Pick<FABMenuSector, 'id'>
  & Partial<Omit<FABMenuSector, 'id'>>

export const defaultSectors: FABMenuSector[] = [
  {
    'id': nanoid(),
    'icon': 'email',
    'color': '#5951E5',
    'label': 'Написать на email',
    'payload': {
      'type': 'email',
      'value': 'hello@lemnity.ru'
    },
    'description': 'Отправьте письмо на почту'
  },
  {
    'id': nanoid(),
    'icon': 'phone',
    'color': '#5951E5',
    'label': 'Обратный звонок',
    'payload': {
      'type': 'phone',
      'value': '+7 (000) 000-00-00'
    },
    'description': 'Наш менеджер перезвонит'
  },
]

export const initialState: FABMenuWidgetState = {
  type: WidgetTypeEnum.FAB_MENU,
  fetchStatus: 'idle',
  fetchError: null,
  triggerText: 'Супер-кнопка',
  triggerBackgroundColor: '#5951E5',
  triggerTextColor: '#FFFFFF',
  triggerIcon: 'Sparkles',
  triggerPosition: 'bottom-right',
  brandingEnabled: true,
  sectors: {
    ...sectorAdapter.getInitialState({}, defaultSectors)
  }
}

const triggerSettingsReducers = {
  triggerTextChanged:
    triggerTextReducer,
  triggerBackgroundColorChanged:
    triggerBackgroundColorReducer,
  triggerTextColorChanged:
    triggerTextColorReducer,
  triggerIconChanged:
    triggerIconReducer,
  triggerPositionChanged:
    triggerPositionReducer,
}

const triggerSettingsSelectors = {
  selectTriggerText:
    selectFABMenuTriggerText,
  selectTriggerBackgroundColor:
    selectFABMenuTriggerBackgroundColor,
  selectTriggerTextColor:
    selectFABMenuTriggerTextColor,
  selectTriggerIcon:
    selectFABMenuTriggerIcon,
  selectTriggerPosition:
    selectFABMenuTriggerPosition,
}

export const FABMenuSlice = createSlice({
  name: 'FABMenu',
  initialState,
  reducers: {
    ...commonReducers,
    ...triggerSettingsReducers,

    sectorAdded:
      (state, action: PayloadAction<FABMenuSector>) => {
        sectorAdapter.addOne(state.sectors, action.payload)
      },
    sectorDeleted:
      (state, action: PayloadAction<string>) => {
        sectorAdapter.removeOne(state.sectors, action.payload)
      },
    sectorUpdated:
      (state, action: PayloadAction<FABMenuSectorUpdate>) => {
        const { id, ...changes } = action.payload
        sectorAdapter.updateOne(state.sectors, { id, changes })
      },
    sectorsReordered:
      (state, action: PayloadAction<string[]>) => {
        state.sectors.ids = action.payload
      },
  },
  selectors: {
    ...commonSelectors,
    ...triggerSettingsSelectors,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFabMenuWidget.pending, (state) => {
        state.fetchStatus = 'pending'
      })
      .addCase(fetchFabMenuWidget.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        state.fetchError = null

        const payload = action.payload as PublicWidget | undefined

        state.widgetId = payload?.id
        state.projectId = payload?.projectId

        const widgetConfig = payload?.config as WidgetSettings | undefined
        const widgetSettings = widgetConfig?.widget
      })
      .addCase(fetchFabMenuWidget.rejected, (state, action) => {
        state.fetchStatus = 'rejected'
        state.fetchError = action.error.message
          || 'Не удалось загрузить виджет'
      })
  },
})

export const {
  triggerTextChanged,
  triggerBackgroundColorChanged,
  triggerTextColorChanged,
  triggerIconChanged,
  triggerPositionChanged,
  sectorAdded,
  sectorDeleted,
  sectorUpdated,
  sectorsReordered,
  brandingEnabledChanged,
} = FABMenuSlice.actions

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof FABMenuSlice> {}
}

const injectedFABMenuSlice = FABMenuSlice.injectInto(rootReducer)

export const {
  selectTriggerText,
  selectTriggerBackgroundColor,
  selectTriggerTextColor,
  selectTriggerIcon,
  selectTriggerPosition,
  selectBrandingEnabled,
  selectFetchStatus,
  selectFetchError,
  selectWidgetId,
  selectProjectId,
} = injectedFABMenuSlice.selectors

export default injectedFABMenuSlice.reducer

export const {
  selectAll: selectAllSectors,
  selectById: selectSectorById,
  selectIds: selectSectorIds,
} = sectorAdapter.getSelectors(
  // this doesn't seem right
  // it also causes a redux warning but i do not have a better solution
  // at the moment
  (state: RootState) => state.FABMenu?.sectors
    || sectorAdapter.getInitialState()
)
