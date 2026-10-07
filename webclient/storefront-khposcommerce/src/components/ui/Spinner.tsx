import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}

const sizes = {
  sm:  'w-4 h-4 border-2',
  md:  'w-6 h-6 border-2',
  lg:  'w-10 h-10 border-3',
  xl:  'w-16 h-16 border-4',
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <div
    className={cn(
      'rounded-full border-gray-200 border-t-blue-600 animate-spin',
      sizes[size],
      className
    )}
    style={{ borderWidth: size === 'lg' ? 3 : size === 'xl' ? 4 : 2 }}
  />
)

export default Spinner
