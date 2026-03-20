import type { HTMLProps } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type FadeInOutProps = {
  visible: boolean
  children: HTMLProps<HTMLElement>['children']
  animationDuration?: number
}

const FadeInOut = (props: FadeInOutProps) => {
  const animationDuration = props.animationDuration ?? 0.16

  return (
    <AnimatePresence initial={false}>
      {props.visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: animationDuration }}
          className='flex flex-col gap-1'
        >
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FadeInOut
