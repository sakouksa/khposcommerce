import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseMenuHoverOptions<T = any> {
  /**
   * Delay in milliseconds before closing the menu on mouse leave.
   * Prevents accidental closing during cursor movement.
   * Default: 160ms
   */
  closeDelay?: number
  /**
   * Delay in milliseconds before opening the menu on mouse enter.
   * Default: 0ms (instant open)
   */
  openDelay?: number
  /**
   * Initial open state.
   * Default: false
   */
  initialOpen?: boolean
  /**
   * Initial active item.
   */
  initialActiveItem?: T | null
  /**
   * Callback fired when menu opens.
   */
  onOpen?: () => void
  /**
   * Callback fired when menu closes.
   */
  onClose?: () => void
}

export interface UseMenuHoverReturn<T = any> {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activeItem: T | null
  setActiveItem: (item: T | null) => void
  openMenu: () => void
  closeMenu: (immediate?: boolean) => void
  toggleMenu: () => void
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  handleItemHover: (item: T) => void
  /**
   * Helper props to spread onto trigger/container elements:
   * `<div {...menuHover.hoverProps}>`
   */
  hoverProps: {
    onMouseEnter: () => void
    onMouseLeave: () => void
  }
}

/**
 * Global custom hook for clean, silky-smooth hover menus (MegaMenu, dropdowns, flyouts).
 * Provides configurable open/close debouncing, cursor leave protection, and active item management.
 */
export function useMenuHover<T = any>(
  options: UseMenuHoverOptions<T> = {}
): UseMenuHoverReturn<T> {
  const {
    closeDelay = 160,
    openDelay = 0,
    initialOpen = false,
    initialActiveItem = null,
    onOpen,
    onClose,
  } = options

  const [isOpen, setIsOpen] = useState(initialOpen)
  const [activeItem, setActiveItem] = useState<T | null>(initialActiveItem)

  const openTimerRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const openMenu = useCallback(() => {
    clearTimers()
    setIsOpen(true)
    onOpen?.()
  }, [clearTimers, onOpen])

  const closeMenu = useCallback(
    (immediate = false) => {
      clearTimers()
      if (immediate || closeDelay <= 0) {
        setIsOpen(false)
        onClose?.()
      } else {
        closeTimerRef.current = setTimeout(() => {
          setIsOpen(false)
          onClose?.()
        }, closeDelay)
      }
    },
    [clearTimers, closeDelay, onClose]
  )

  const toggleMenu = useCallback(() => {
    clearTimers()
    setIsOpen((prev) => {
      const next = !prev
      if (next) onOpen?.()
      else onClose?.()
      return next
    })
  }, [clearTimers, onOpen, onClose])

  const handleMouseEnter = useCallback(() => {
    clearTimers()
    if (openDelay > 0) {
      openTimerRef.current = setTimeout(() => {
        setIsOpen(true)
        onOpen?.()
      }, openDelay)
    } else {
      setIsOpen(true)
      onOpen?.()
    }
  }, [clearTimers, openDelay, onOpen])

  const handleMouseLeave = useCallback(() => {
    closeMenu(false)
  }, [closeMenu])

  const handleItemHover = useCallback((item: T) => {
    setActiveItem(item)
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return {
    isOpen,
    setIsOpen,
    activeItem,
    setActiveItem,
    openMenu,
    closeMenu,
    toggleMenu,
    handleMouseEnter,
    handleMouseLeave,
    handleItemHover,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  }
}

export default useMenuHover
