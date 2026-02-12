import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FadeProps {
  children: ReactNode
  duration?: number
}

export function Fade({ children, duration = 0.2 }: FadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}

interface SlideProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}

export function Slide({ children, direction = 'up', distance = 20 }: SlideProps) {
  const offset = { up: { y: distance }, down: { y: -distance }, left: { x: distance }, right: { x: -distance } }

  return (
    <motion.div
      initial={{ opacity: 0, ...offset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offset[direction] }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

interface ScaleProps {
  children: ReactNode
  scale?: number
}

export function Scale({ children, scale = 0.95 }: ScaleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export function Animate({ children, animation = 'fade' }: { children: ReactNode; animation?: 'fade' | 'slide' | 'scale' }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  )
}

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

export const listTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}
