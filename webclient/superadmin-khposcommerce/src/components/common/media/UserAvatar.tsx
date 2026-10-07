import React, { useState } from 'react'
import { getAbsoluteImageUrl, getCustomerAvatarUrl, DEFAULT_AVATAR_IMAGE, DEFAULT_AVATAR_DATA_URI } from '@/utils/image'
import { Image as AntImage } from 'antd'

export interface UserAvatarProps {
  src?: string | null
  name?: string | null
  customerId?: number | string | null
  fallbackAvatar?: boolean
  className?: string
  sizeClassName?: string
  showOnlineStatus?: boolean
  isOnline?: boolean
  preview?: boolean
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  customerId,
  fallbackAvatar = false,
  className = '',
  sizeClassName = 'w-9 h-9',
  showOnlineStatus = false,
  isOnline = true,
  preview = false,
}) => {
  const [errorCount, setErrorCount] = useState(0)

  // Primary URL resolution:
  let resolvedUrl: string | null = null
  if (errorCount === 0) {
    if (src) {
      resolvedUrl = getAbsoluteImageUrl(src)
    } else {
      resolvedUrl = DEFAULT_AVATAR_IMAGE
    }
  } else if (errorCount === 1) {
    resolvedUrl = DEFAULT_AVATAR_IMAGE
  } else {
    resolvedUrl = DEFAULT_AVATAR_DATA_URI
  }

  const initial = (name || 'User').trim().charAt(0).toUpperCase() || 'U'

  // Deterministic gradient based on name
  const gradients = [
    'from-emerald-500 to-teal-600',
    'from-blue-600 to-indigo-600',
    'from-violet-600 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ]
  const charCode = initial.charCodeAt(0) || 0
  const gradient = gradients[charCode % gradients.length]

  return (
    <div className={`relative shrink-0 ${sizeClassName} ${className}`}>
      <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden shadow-xs bg-gradient-to-br ${gradient} border border-white/20 select-none`}>
        {resolvedUrl ? (
          preview ? (
            <div onClick={(e) => e.stopPropagation()} className="w-full h-full">
              <AntImage
                src={resolvedUrl}
                alt={name || 'Avatar'}
                className="w-full h-full object-cover"
                rootClassName="w-full h-full !flex items-center justify-center cursor-pointer"
                preview={{ mask: false }}
                fallback={DEFAULT_AVATAR_IMAGE}
                onError={() => setErrorCount((c) => c + 1)}
              />
            </div>
          ) : (
            <img
              src={resolvedUrl}
              alt={name || 'Avatar'}
              className="w-full h-full object-cover"
              onError={() => setErrorCount((c) => c + 1)}
              loading="lazy"
            />
          )
        ) : (
          <span className="text-white font-extrabold text-xs sm:text-sm drop-shadow-xs">
            {initial}
          </span>
        )}
      </div>

      {showOnlineStatus && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ring-1 ring-black/10 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  )
}

export default UserAvatar

