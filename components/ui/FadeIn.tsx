/**
 * FadeIn.tsx
 * 
 * Animation component that fades in content when it enters viewport.
 * Uses Framer Motion for smooth animations.
 * 
 * Features:
 * - Fade in with upward motion (32px)
 * - Triggers once when element enters viewport
 * - Configurable delay for staggered animations
 * - 80px margin before triggering
 */

'use client'

import { motion } from 'framer-motion'

/**
 * Props for FadeIn component.
 */
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

/**
 * Fade-in animation wrapper using Framer Motion.
 * Animates opacity and Y position when element enters viewport.
 * 
 * @param children - Content to animate
 * @param delay - Animation delay in seconds
 * @param className - Additional CSS classes
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
