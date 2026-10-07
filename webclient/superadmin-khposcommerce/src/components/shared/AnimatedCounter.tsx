import React, { useState, useEffect, useRef } from 'react'

export interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1000,
}) => {
  const numericValue = typeof value === 'number' && !isNaN(value) ? value : Number(value) || 0
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(0)

  useEffect(() => {
    let animationFrameId: number
    const start = prevValueRef.current
    const end = numericValue
    const startTime = performance.now()

    const updateCounter = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * easedProgress
      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter)
      } else {
        setDisplayValue(end)
        prevValueRef.current = end
      }
    }

    animationFrameId = requestAnimationFrame(updateCounter)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [numericValue, duration])

  return (
    <span>
      {prefix}
      {decimals > 0
        ? displayValue.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : Math.round(displayValue).toLocaleString()}
      {suffix}
    </span>
  )
}

export default AnimatedCounter

