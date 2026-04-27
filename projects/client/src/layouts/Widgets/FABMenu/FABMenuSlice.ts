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
  triggerBackgroundColorReducer,
  triggerFontColorReducer,
  triggerIconReducer,
  triggerPositionReducer,
  triggerTextReducer,

  selectTriggerText as selectTriggerTextFeature,
  selectTriggerBackgroundColor as selectTriggerBackgroundColorFeature,
  selectTriggerFontColor as selectTriggerFontColorFeature,
  selectTriggerIcon as selectTriggerIconFeature,
  selectTriggerPosition as selectTriggerPositionFeature,
} from '@/stores/redux/features/triggerSettings'

import {
  WidgetTypeEnum,
  type PublicWidget,
} from '@lemnity/api-sdk'

import {
  type FABMenuSector,
  type FabMenuWidgetType,
} from '@lemnity/widget-config/widgets/fab-menu'
import {
  type TriggerType,
} from '@lemnity/widget-config/features/trigger'

export const fetchFabMenuWidget = fetchWidgetThunkFactory(
  'FABMenu/fetchWidget',
  (state) => state.FABMenu!.fetchStatus
)

export const saveFabMenuWidget = saveWidgetThunkFactory(
  'FABMenu/saveWidget',
  (state) => state.FABMenu!.widgetId,
  (state) => state.FABMenu!.type,
  (state): FabMenuWidgetType => ({
    type:
      state.FABMenu!.type,
    sectors:
      selectAllSectors(state),
    // patch for old widgets that do not have these fields in the database
    trigger: {
      ...state.FABMenu!.trigger,
      triggerPosition:
        state.FABMenu!.trigger.triggerPosition
          || initialState.trigger.triggerPosition,
    },
    brandingEnabled:
      state.FABMenu!.brandingEnabled
        || initialState.brandingEnabled,
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
  trigger: {
    triggerText: 'Супер-кнопка',
    triggerBackgroundColor: '#5951E5',
    triggerFontColor: '#FFFFFF',
    triggerIcon: 'Sparkles',
    triggerPosition: 'bottom-right',
  },
  sectors: {
    ...sectorAdapter.getInitialState({}, defaultSectors)
  },
  brandingEnabled: true,
}

const FABMenuTriggerSettingsReducers = {
  triggerTextChanged:
    triggerTextReducer,
  triggerBackgroundColorChanged:
    triggerBackgroundColorReducer,
  triggerFontColorChanged:
    triggerFontColorReducer,
  triggerIconChanged:
    triggerIconReducer,
  triggerPositionChanged:
    triggerPositionReducer,
}

const FABMenuTriggerSettingsSelectors = {
  selectTriggerText:
    selectTriggerTextFeature,
  selectTriggerBackgroundColor:
    selectTriggerBackgroundColorFeature,
  selectTriggerFontColor:
    selectTriggerFontColorFeature,
  selectTriggerIcon:
    selectTriggerIconFeature,
  selectTriggerPosition:
    selectTriggerPositionFeature,
}

export const FABMenuSlice = createSlice({
  name: 'FABMenu',
  initialState,
  reducers: {
    ...commonReducers,
    ...FABMenuTriggerSettingsReducers,

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
    ...FABMenuTriggerSettingsSelectors,
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

        const settings = widgetSettings
          || { ...initialState, sectors: [...defaultSectors] }

        const {
          sectors,
          brandingEnabled,
        } = settings as FabMenuWidgetType
        
        state.brandingEnabled = brandingEnabled
        
        sectorAdapter.setAll(
          state.sectors,
          (sectors as any).items ? (sectors as any).items : sectors
        )

        // accomodation for legacy configs
        if ((settings as { trigger: TriggerType }).trigger) {
          state.trigger = (settings as { trigger: TriggerType }).trigger
        }
        else {
          const {
            triggerText,
            triggerBackgroundColor,
            triggerTextColor,
            triggerIcon,
            triggerPosition,
          } = settings as any

          state.trigger.triggerText = triggerText
          state.trigger.triggerBackgroundColor = triggerBackgroundColor
          state.trigger.triggerFontColor = triggerTextColor
          state.trigger.triggerIcon = triggerIcon
          state.trigger.triggerPosition = triggerPosition
        }
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
  triggerFontColorChanged: triggerTextColorChanged,
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
  selectTriggerFontColor: selectTriggerTextColor,
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
