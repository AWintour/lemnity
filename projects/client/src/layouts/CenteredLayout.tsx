import type { PropsWithChildren, ReactElement } from 'react'

const CenteredLayout = ({ children }: PropsWithChildren): ReactElement => {
  return <div className="min-h-screen w-full flex items-center justify-center p-8">{children}</div>
}

export default CenteredLayout
