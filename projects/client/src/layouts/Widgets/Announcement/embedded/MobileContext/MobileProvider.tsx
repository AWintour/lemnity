import { useReducer } from 'react'
import {
  MobileContext,
  type Action,
  type State,
} from './MobileContext'

type MobileProviderProps = { children: React.ReactNode }

const mobileReducer = (_state: State, action: Action): State => {
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
