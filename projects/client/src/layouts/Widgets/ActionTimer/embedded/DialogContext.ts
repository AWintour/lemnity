import { createContext, use } from 'react'

export const DialogContext = createContext<ShadowRoot | undefined>(undefined)

export const useDialogContext = () => use(DialogContext)