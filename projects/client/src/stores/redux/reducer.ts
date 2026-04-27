import { combineSlices } from '@reduxjs/toolkit'

import { editorSlice } from './editorSlice'

export interface LazyLoadedSlices {}

export const rootReducer =
  combineSlices(editorSlice).withLazyLoadedSlices<LazyLoadedSlices>()
