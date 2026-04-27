import type { PropsWithChildren } from 'react'

type RightPanelProps = PropsWithChildren<{
  widthClassName?: string
}>

const RightPanel = ({ children, widthClassName = 'w-[52px]' }: RightPanelProps) => {
  return (
    <aside
      className={`${widthClassName} h-full flex flex-col gap-2.5 items-center rounded-r-[14px] bg-white overflow-hidden`}
    >
      {children}
    </aside>
  )
}

export default RightPanel
