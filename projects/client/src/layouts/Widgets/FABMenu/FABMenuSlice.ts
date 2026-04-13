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
  WidgetTypeEnum,
  type PublicWidget,
} from '@lemnity/api-sdk'
import type { Icon } from '@lemnity/widget-config/widgets/base'

import {
  type FABMenuSector,
  type FabMenuWidgetType,
} from '@lemnity/widget-config/widgets/fab-menu'

export const fetchFabMenuWidget = fetchWidgetThunkFactory(
  'FABMenu/fetchWidget',
  (state) => state.notification!.fetchStatus
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

export const FABMenuSlice = createSlice({
  name: 'FABMenu',
  initialState,
  reducers: {
    ...commonReducers,
  }
})
