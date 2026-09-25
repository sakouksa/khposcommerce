import React, { useState, useEffect } from 'react'
import {
  getSupplierLogoUrl,
  DEFAULT_SUPPLIER_IMAGE,
} from '@/utils/image'

export interface SupplierLogoProps {
  logo?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  shape?: 'rounded' | 'circle' | 'square'
  className?: string
  alt?: string
}

const SIZE_MAP = {
  xs: 'w-6 h-6 rounded-md text-[10px]',
  sm: 'w-8 h-8 rounded-lg text-xs',
  md: 'w-10 h-10 rounded-xl text-sm',
  lg: 'w-12 h-12 rounded-2xl text-base',
  xl: 'w-16 h-16 rounded-2xl text-lg',
}

export const SupplierLogo: React.FC<SupplierLogoProps> = ({
  logo,
  name = '',
  size = 'md',
  shape = 'rounded',
  className = '',
  alt,
}) => {
  const initialUrl = getSupplierLogoUrl(logo, name)
  const [imgSrc, setImgSrc] = useState<string>(initialUrl)

  useEffect(() => {
    setImgSrc(getSupplierLogoUrl(logo, name))
  }, [logo, name])

  const handleError = () => {
    setImgSrc(DEFAULT_SUPPLIER_IMAGE)
  }

  const isNumeric = typeof size === 'number'
  const sizeClasses = isNumeric ? '' : SIZE_MAP[size] || SIZE_MAP.md
  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-none' : ''

  const styleObj: React.CSSProperties = isNumeric
    ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }
    : {}

  return (
    <div
      style={styleObj}
      className={`relative shrink-0 overflow-hidden bg-white dark:bg-slate-900 border border-border/70 shadow-2xs flex items-center justify-center p-0.5 select-none transition-transform duration-200 group-hover:scale-105 ${sizeClasses} ${shapeClass} ${className}`}
    >
      <img
        src={imgSrc}
        alt={alt || name || 'Supplier Logo'}
        onError={handleError}
        className="w-full h-full object-contain rounded-[inherit]"
        loading="lazy"
      />
    </div>
  )
}

export default SupplierLogo
