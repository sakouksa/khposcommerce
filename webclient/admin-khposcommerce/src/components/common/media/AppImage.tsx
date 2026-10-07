import React, { useState, useEffect } from 'react'
import { resolveMediaUrl, type MediaFallbackType, DEFAULT_FALLBACKS } from '@/utils/image'
import { Image as ImageIcon, Eye } from 'lucide-react'
import { Image as AntImage, type ImageProps as AntImageProps } from 'antd'

export interface AppImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: any
  fallbackType?: MediaFallbackType
  fallbackSrc?: string
  alt?: string
  className?: string
  containerClassName?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto' | string
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down'
  showSkeleton?: boolean
  preview?: boolean | AntImageProps['preview']
}

export const AppImage: React.FC<AppImageProps> = ({
  src,
  fallbackType = 'general',
  fallbackSrc,
  alt = 'Image',
  className = '',
  containerClassName = '',
  aspectRatio = 'auto',
  objectFit = 'cover',
  showSkeleton = true,
  loading = 'lazy',
  preview = false,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')

  const resolvedUrl = resolveMediaUrl(src, fallbackType) || fallbackSrc || DEFAULT_FALLBACKS[fallbackType] || ''

  useEffect(() => {
    setCurrentSrc(resolvedUrl)
    setLoaded(false)
    setError(false)
  }, [src, fallbackType, fallbackSrc])

  const handleError = (e: any) => {
    if (!error) {
      setError(true)
      const fallback = fallbackSrc || DEFAULT_FALLBACKS[fallbackType]
      if (fallback && currentSrc !== fallback) {
        setCurrentSrc(fallback)
        return
      }
    }
    props.onError?.(e)
  }

  const handleLoad = (e: any) => {
    setLoaded(true)
    props.onLoad?.(e)
  }

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'portrait'
      ? 'aspect-3/4'
      : ''

  const fitClass =
    objectFit === 'cover'
      ? 'object-cover'
      : objectFit === 'contain'
      ? 'object-contain'
      : objectFit === 'fill'
      ? 'object-fill'
      : 'object-scale-down'

  const previewConfig = typeof preview === 'object'
    ? preview
    : preview
    ? {
        mask: (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow-md">
            <Eye size={15} />
            <span>Preview</span>
          </div>
        ),
      }
    : false

  return (
    <div
      className={`relative overflow-hidden ${aspectClass} ${containerClassName}`}
    >
      {/* Loading Skeleton */}
      {showSkeleton && !loaded && !error && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse flex items-center justify-center pointer-events-none">
          <ImageIcon className="w-5 h-5 text-muted-foreground/30 animate-pulse" />
        </div>
      )}

      {currentSrc ? (
        preview ? (
          <AntImage
            src={currentSrc}
            alt={alt}
            preview={previewConfig}
            onError={handleError}
            onLoad={handleLoad}
            className={`w-full h-full ${fitClass} transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            wrapperClassName="w-full h-full flex items-center justify-center"
            fallback={fallbackSrc || DEFAULT_FALLBACKS[fallbackType]}
          />
        ) : (
          <img
            src={currentSrc}
            alt={alt}
            loading={loading}
            onError={handleError}
            onLoad={handleLoad}
            className={`w-full h-full ${fitClass} transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            {...props}
          />
        )
      ) : (
        <img
          src={fallbackSrc || DEFAULT_FALLBACKS[fallbackType]}
          alt={alt}
          className={`w-full h-full ${fitClass} ${className}`}
          loading={loading}
        />
      )}
    </div>
  )
}

export default AppImage

