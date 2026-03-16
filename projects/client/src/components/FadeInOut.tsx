import { AnimatePresence, motion } from 'framer-motion'

type FadeInOutProps = {
  visible: boolean
  children: React.ReactNode[]
}

const FadeInOut = (props: FadeInOutProps) => {
  return (
    <AnimatePresence initial={false}>
      {props.visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className='flex flex-col gap-1'
        >
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FadeInOut
