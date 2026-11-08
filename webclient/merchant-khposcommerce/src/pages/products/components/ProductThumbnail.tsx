import React, { useState, useEffect } from 'react'
import {
  getAbsoluteImageUrl,
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_PRODUCT_DATA_URI,
} from '@/utils/image'
import { Eye } from 'lucide-react'
import { Image as AntImage } from 'antd'

export interface ProductThumbnailProps {
  name: string
  primaryImage?: any
  images?: any[]
  image?: any
  categoryName?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  className?: string
  rounded?: string
  alt?: string
  preview?: boolean
}

const SIZE_MAP = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  name,
  primaryImage,
  images,
  image,
  categoryName,
  size = 'sm',
  className = '',
  rounded = 'rounded-xl',
  alt,
  preview = true,
}) => {
  const primaryUrl = getAbsoluteImageUrl(
    primaryImage || (images && images.length > 0 ? images[0] : null) || image
  )

  const fallbackUrl = DEFAULT_PRODUCT_IMAGE

  const sizeClass = typeof size === 'number' ? `w-[${size}px] h-[${size}px]` : (SIZE_MAP[size] || SIZE_MAP.sm)

  const [currentSrc, setCurrentSrc] = useState<string>(primaryUrl || DEFAULT_PRODUCT_IMAGE)
  const [errorAttempts, setErrorAttempts] = useState(0)

  useEffect(() => {
    setCurrentSrc(primaryUrl || DEFAULT_PRODUCT_IMAGE)
    setErrorAttempts(0)
  }, [primaryUrl])

  const handleError = () => {
    if (errorAttempts === 0 && currentSrc !== DEFAULT_PRODUCT_IMAGE) {
      setErrorAttempts(1)
      setCurrentSrc(DEFAULT_PRODUCT_IMAGE)
    } else {
      setErrorAttempts(2)
      setCurrentSrc(DEFAULT_PRODUCT_DATA_URI)
    }
  }

  const activeSrc = currentSrc || DEFAULT_PRODUCT_IMAGE

  return (
    <div
      className={`${sizeClass} ${rounded} bg-muted border border-border/80 overflow-hidden flex items-center justify-center shrink-0 relative select-none ${className}`}
      title={name}
      onClick={(e) => {
        if (preview && activeSrc) {
          e.stopPropagation()
        }
      }}
    >
      {preview ? (
        <AntImage
          src={activeSrc}
          alt={alt || name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          rootClassName="w-full h-full flex items-center justify-center cursor-pointer"
          preview={{
            cover: (
              <div className="flex items-center justify-center w-full h-full bg-black/40 text-white">
                <Eye size={13} />
              </div>
            ),
          }}
          fallback={DEFAULT_PRODUCT_IMAGE}
          onError={handleError}
        />
      ) : (
        <img
          src={activeSrc}
          alt={alt || name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
          onError={handleError}
        />
      )}
    </div>
  )
}

export default ProductThumbnail

