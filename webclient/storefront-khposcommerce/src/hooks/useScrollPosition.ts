import { useState, useEffect } from 'react'

/**
 * Global hook to monitor scroll position and sticky header threshold.
 */
export const useScrollPosition = (threshold = 10) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { isScrolled, scrollY }
}

export default useScrollPosition
