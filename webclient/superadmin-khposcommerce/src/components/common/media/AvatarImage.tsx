import React, { useState, useEffect } from 'react'
import {
  resolveMediaUrl,
  getCustomerAvatarUrl,
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_AVATAR_DATA_URI,
} from '@/utils/image'
import { Image as AntImage } from 'antd'

export interface AvatarImageProps {
  src?: any
  name?: string
  id?: number | string
  fallbackAvatar?: boolean
  alt?: string
  fallbackText?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  status?: 'online' | 'offline' | 'busy' | 'away'
  shape?: 'circle' | 'rounded'
  className?: string
  preview?: boolean
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const getInitials = (name?: string): string => {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  name = '',
  id,
  fallbackAvatar = true,
  alt,
  fallbackText,
  size = 'md',
  status,
  shape = 'circle',
  className = '',
  preview = false,
}) => {
  const displayName = name || fallbackText || ''

  // Compute primary URL or professional avatar
  const primaryUrl = src ? resolveMediaUrl(src) : null
  const defaultUrl = fallbackAvatar || id || !src
    ? (getCustomerAvatarUrl(null, id || displayName) || DEFAULT_AVATAR_IMAGE)
    : null

  const initialUrl = primaryUrl || defaultUrl || DEFAULT_AVATAR_IMAGE
  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl)
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    const nextUrl = (src ? resolveMediaUrl(src) : null) ||
      (fallbackAvatar || id || !src ? getCustomerAvatarUrl(null, id || displayName) : null) ||
      DEFAULT_AVATAR_IMAGE
    setCurrentSrc(nextUrl)
    setErrorCount(0)
  }, [src, id, displayName, fallbackAvatar])

  const handleError = () => {
    if (errorCount === 0 && currentSrc !== DEFAULT_AVATAR_IMAGE) {
      setErrorCount(1)
      setCurrentSrc(DEFAULT_AVATAR_IMAGE)
    } else {
      setErrorCount(2)
      setCurrentSrc(DEFAULT_AVATAR_DATA_URI)
    }
  }

  const sizeClass = typeof size === 'string' ? SIZE_MAP[size] : `w-[${size}px] h-[${size}px]`
  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'
  const activeUrl = currentSrc || DEFAULT_AVATAR_IMAGE

  return (
    <div className={`relative inline-flex shrink-0 ${sizeClass}`}>
      <div
        className={`w-full h-full overflow-hidden ${roundedClass} flex items-center justify-center font-semibold select-none border border-border/50 bg-muted/30 ${className}`}
      >
        {preview ? (
          <div onClick={(e) => e.stopPropagation()} className="w-full h-full">
            <AntImage
              src={activeUrl}
              alt={alt || displayName || 'Avatar'}
              className="w-full h-full object-cover"
              rootClassName="w-full h-full !flex items-center justify-center cursor-pointer"
              preview={{ mask: false }}
              fallback={DEFAULT_AVATAR_IMAGE}
              onError={handleError}
            />
          </div>
        ) : (
          <img
            src={activeUrl}
            alt={alt || displayName || 'Avatar'}
            onError={handleError}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-background ${
            shape === 'circle' ? 'translate-x-0.5 translate-y-0.5' : ''
          } ${
            status === 'online'
              ? 'bg-emerald-500 w-2.5 h-2.5'
              : status === 'busy'
              ? 'bg-rose-500 w-2.5 h-2.5'
              : status === 'away'
              ? 'bg-amber-500 w-2.5 h-2.5'
              : 'bg-muted-foreground w-2.5 h-2.5'
          }`}
        />
      )}
    </div>
  )
}

export default AvatarImage

