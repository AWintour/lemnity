import { createContext } from 'react'

export type Action = { type: 'open' | 'close'}
export type Dispatch = (action: Action) => void
export type State = { open: boolean }

export const MobileContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)
