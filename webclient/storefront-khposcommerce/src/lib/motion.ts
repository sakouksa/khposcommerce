import type { Variants, Transition } from 'framer-motion'

/**
 * Standard cubic-bezier easing curves inspired by Apple & Linear
 */
export const easings = {
  easeOutQuart: [0.25, 1, 0.5, 1] as const,
  easeOutCubic: [0.33, 1, 0.68, 1] as const,
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  springGentle: { type: 'spring', stiffness: 300, damping: 28 } as Transition,
}

/**
 * Check if the user has enabled OS reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Section entrance reveal variant (fade + subtle upward glide + slight scale)
 */
export const sectionRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.99,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

/**
 * Pure Fade In variant
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
}

/**
 * Fade & Scale In (Used for modals, badges, cards)
 */
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

/**
 * Stagger Container for Product and Category grids
 */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
}

/**
 * Individual Stagger Item
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

/**
 * High-performance Page Transition (Opacity + 6px Y-offset)
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

/**
 * Modal dialog variant
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
}

/**
 * Slide-over Drawer variant (Cart Drawer, Filter Drawer)
 */
export const drawerVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0.9,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 350,
    },
  },
  exit: {
    x: '100%',
    opacity: 0.9,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}
