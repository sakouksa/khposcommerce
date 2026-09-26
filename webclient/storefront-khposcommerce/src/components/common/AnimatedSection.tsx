import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { sectionRevealVariants, prefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface AnimatedSectionProps extends HTMLMotionProps<'section'> {
  children: React.ReactNode
  className?: string
  id?: string
  delay?: number
  threshold?: number
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  id,
  delay = 0,
  threshold = 0.1,
  ...props
}) => {
  const isReduced = prefersReducedMotion()

  if (isReduced) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    )
  }

  return (
    <motion.section
      id={id}
      variants={sectionRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px', amount: threshold }}
      transition={{ delay }}
      className={cn('will-change-transform', className)}
      {...props}
    >
      {children}
    </motion.section>
  )
}

export default AnimatedSection
