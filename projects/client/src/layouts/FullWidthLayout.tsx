import type { PropsWithChildren, ReactElement } from 'react'

const FullWidthLayout = ({ children }: PropsWithChildren): ReactElement => {
  return <div className="min-h-screen w-full">{children}</div>
}

export default FullWidthLayout
