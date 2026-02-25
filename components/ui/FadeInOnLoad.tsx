'use client'

import { motion } from 'framer-motion'

interface FadeInOnLoadProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeInOnLoad({ 
  children, 
  delay = 0, 
  className 
}: FadeInOnLoadProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
