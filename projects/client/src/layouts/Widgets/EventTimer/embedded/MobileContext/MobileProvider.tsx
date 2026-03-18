import { useReducer } from 'react'
import {
  MobileContext,
  type Action,
  type State,
} from './MobileContext'

type MobileProviderProps = { children: React.ReactNode }

// @ts-expect-error: i don't really need to use state for now
const mobileReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'open':
      return { open: true }
    case 'close':
      return { open: false }
  }
}

const MobileProvider = ({ children }: MobileProviderProps) => {
  const [state, dispatch] = useReducer(mobileReducer, { open: false })

  const value = { state, dispatch }
  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  )
}

export default MobileProvider
