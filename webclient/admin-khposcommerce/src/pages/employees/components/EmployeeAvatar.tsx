import React, { useState, useEffect } from 'react'
import {
  getAbsoluteImageUrl,
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_AVATAR_DATA_URI,
} from '@/utils/image'

interface EmployeeAvatarProps {
  photo?: string | null
  name?: string
  id?: number | string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  shape?: 'circle' | 'rounded'
  className?: string
  getPhotoUrl?: (path?: string) => string | null | undefined
}

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  photo,
  name = '',
  size = 'md',
  shape = 'circle',
  className = '',
  getPhotoUrl,
}) => {
  const [errorAttempts, setErrorAttempts] = useState(0)

  useEffect(() => {
    setErrorAttempts(0)
  }, [photo])

  const isNumericSize = typeof size === 'number'

  const sizeClasses = isNumericSize
    ? ''
    : {
        xs: 'w-6 h-6 min-w-[24px] min-h-[24px]',
        sm: 'w-8 h-8 min-w-[32px] min-h-[32px]',
        md: 'w-10 h-10 min-w-[40px] min-h-[40px]',
        lg: 'w-12 h-12 min-w-[48px] min-h-[48px]',
        xl: 'w-16 h-16 min-w-[64px] min-h-[64px]',
      }[size] || 'w-10 h-10 min-w-[40px] min-h-[40px]'

  const customStyle: React.CSSProperties = isNumericSize
    ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }
    : {}

  // Resolve storage photo URL from backend storage
  const rawUrl = photo && typeof photo === 'string' && photo.trim() && photo !== 'null' && photo !== 'undefined'
    ? (getPhotoUrl ? getPhotoUrl(photo) : getAbsoluteImageUrl(photo))
    : null

  let activeSrc = DEFAULT_AVATAR_IMAGE
  if (errorAttempts === 0 && rawUrl) {
    activeSrc = rawUrl
  } else if (errorAttempts === 1) {
    activeSrc = DEFAULT_AVATAR_IMAGE
  } else {
    activeSrc = DEFAULT_AVATAR_DATA_URI
  }

  const handleError = () => {
    setErrorAttempts((prev) => prev + 1)
  }

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  return (
    <div
      style={customStyle}
      className={`${roundedClass} shrink-0 aspect-square overflow-hidden flex items-center justify-center select-none border border-border/80 bg-muted/30 shadow-2xs transition-all ${sizeClasses} ${className}`}
      title={name}
    >
      <img
        src={activeSrc}
        alt={name || 'Employee'}
        className="w-full h-full object-cover shrink-0 aspect-square"
        onError={handleError}
        loading="lazy"
      />
    </div>
  )
}

export default EmployeeAvatar
