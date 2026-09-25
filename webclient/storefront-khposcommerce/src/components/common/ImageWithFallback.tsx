import React, { useState } from 'react'
import { cn, resolveMediaUrl, DEFAULT_FALLBACKS, type MediaFallbackType } from '@/lib/utils'

export interface ImageWithFallbackProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: any
  fallbackType?: MediaFallbackType
  fallbackSrc?: string
  aspectRatio?: 'square' | 'video' | 'auto' | 'banner' | 'portrait'
  containerClassName?: string
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackType = 'product',
  alt = 'Product image',
  fallbackSrc,
  aspectRatio = 'auto',
  containerClassName,
  className,
  loading = 'lazy',
  ...props
}) => {
  const defaultFallback = fallbackSrc || DEFAULT_FALLBACKS[fallbackType] || DEFAULT_FALLBACKS.product
  const [imgSrc, setImgSrc] = useState<string>(resolveMediaUrl(src, fallbackType))
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Sync state if src prop changes
  React.useEffect(() => {
    setImgSrc(resolveMediaUrl(src, fallbackType))
    setHasError(false)
  }, [src, fallbackType])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(defaultFallback)
    }
  }

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9]'
      : ''

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center',
        aspectClass,
        containerClassName
      )}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-all duration-300',
          !isLoaded && 'opacity-0 scale-95',
          isLoaded && 'opacity-100 scale-100',
          className
        )}
        {...props}
      />
    </div>
  )
}

export default ImageWithFallback
