import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { pageTransitionVariants, prefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  ...props
}) => {
  const isReduced = prefersReducedMotion()

  if (isReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('w-full min-h-screen will-change-opacity', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
