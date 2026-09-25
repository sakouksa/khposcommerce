import React from 'react'
import {
  Smartphone,
  Laptop,
  Tv,
  Watch,
  Keyboard,
  Gamepad2,
  Headphones,
  Camera,
  Zap,
  Printer,
  ScanBarcode,
  Shirt,
  Footprints,
  Tablet,
  HardDrive,
  Wifi,
  Package,
  Layers,
  Tag,
  type LucideIcon,
} from 'lucide-react'

/**
 * Returns the Lucide icon component corresponding to a category slug or name.
 */
export const getCategoryIcon = (slug?: string): LucideIcon => {
  if (!slug) return Tag
  const s = slug.toLowerCase()
  if (s.includes('phone') || s.includes('ទូរស័ព្ទ')) return Smartphone
  if (s.includes('laptop') || s.includes('computer') || s.includes('mac') || s.includes('កុំព្យូទ័រ')) return Laptop
  if (s.includes('monitor') || s.includes('display') || s.includes('tv') || s.includes('អេក្រង់')) return Tv
  if (s.includes('watch') || s.includes('នាឡិកា')) return Watch
  if (s.includes('game') || s.includes('gaming')) return Gamepad2
  if (s.includes('keyboard') || s.includes('ក្តារចុច')) return Keyboard
  if (s.includes('audio') || s.includes('headphone') || s.includes('sound') || s.includes('សំឡេង') || s.includes('កាស')) return Headphones
  if (s.includes('camera') || s.includes('កាមេរ៉ា')) return Camera
  if (s.includes('charger') || s.includes('power') || s.includes('cable') || s.includes('ឆ្នាំងសាក')) return Zap
  if (s.includes('printer') || s.includes('print') || s.includes('ម៉ាស៊ីនបោះពុម្ព')) return Printer
  if (s.includes('pos') || s.includes('scanner') || s.includes('barcode') || s.includes('terminal')) return ScanBarcode
  if (s.includes('shoe') || s.includes('ស្បែកជើង')) return Footprints
  if (s.includes('apparel') || s.includes('cloth') || s.includes('shirt') || s.includes('សម្លៀកបំពាក់')) return Shirt
  if (s.includes('tablet') || s.includes('ipad')) return Tablet
  if (s.includes('storage') || s.includes('ssd') || s.includes('hdd') || s.includes('drive')) return HardDrive
  if (s.includes('network') || s.includes('wifi') || s.includes('router')) return Wifi
  if (s.includes('accessory') || s.includes('accessories') || s.includes('គ្រឿងបន្លាស់')) return Package
  return Tag
}

/**
 * Returns a styled JSX icon element with matching brand theme color.
 */
export const getCategoryIconElement = (
  slug?: string,
  className = 'w-4 h-4'
): React.ReactElement => {
  if (!slug) return <Tag className={`${className} text-slate-400`} />
  const s = slug.toLowerCase()
  if (s.includes('phone') || s.includes('ទូរស័ព្ទ')) return <Smartphone className={`${className} text-blue-500`} />
  if (s.includes('laptop') || s.includes('computer') || s.includes('mac') || s.includes('កុំព្យូទ័រ'))
    return <Laptop className={`${className} text-indigo-500`} />
  if (s.includes('monitor') || s.includes('display') || s.includes('tv') || s.includes('អេក្រង់'))
    return <Tv className={`${className} text-cyan-500`} />
  if (s.includes('watch') || s.includes('នាឡិកា')) return <Watch className={`${className} text-amber-500`} />
  if (s.includes('game') || s.includes('gaming'))
    return <Gamepad2 className={`${className} text-violet-500`} />
  if (s.includes('keyboard') || s.includes('ក្តារចុច'))
    return <Keyboard className={`${className} text-purple-500`} />
  if (s.includes('audio') || s.includes('headphone') || s.includes('sound') || s.includes('សំឡេង') || s.includes('កាស'))
    return <Headphones className={`${className} text-rose-500`} />
  if (s.includes('camera') || s.includes('កាមេរ៉ា')) return <Camera className={`${className} text-orange-500`} />
  if (s.includes('charger') || s.includes('power') || s.includes('ឆ្នាំងសាក'))
    return <Zap className={`${className} text-yellow-500`} />
  if (s.includes('printer') || s.includes('print') || s.includes('ម៉ាស៊ីនបោះពុម្ព'))
    return <Printer className={`${className} text-emerald-500`} />
  if (s.includes('pos') || s.includes('scanner') || s.includes('barcode'))
    return <ScanBarcode className={`${className} text-blue-600`} />
  if (s.includes('shoe') || s.includes('ស្បែកជើង')) return <Footprints className={`${className} text-emerald-500`} />
  if (s.includes('apparel') || s.includes('cloth') || s.includes('shirt') || s.includes('សម្លៀកបំពាក់'))
    return <Shirt className={`${className} text-teal-500`} />
  if (s.includes('tablet') || s.includes('ipad')) return <Tablet className={`${className} text-indigo-400`} />
  if (s.includes('storage') || s.includes('ssd') || s.includes('hdd') || s.includes('drive'))
    return <HardDrive className={`${className} text-slate-500`} />
  if (s.includes('network') || s.includes('wifi') || s.includes('router'))
    return <Wifi className={`${className} text-sky-500`} />
  if (s.includes('accessory') || s.includes('accessories') || s.includes('គ្រឿងបន្លាស់'))
    return <Package className={`${className} text-purple-500`} />
  return <Tag className={`${className} text-blue-500`} />
}

export interface CategoryTheme {
  icon: LucideIcon
  bgLight: string
  textClass: string
  borderClass: string
  hoverBg: string
  glowClass: string
}

/**
 * Returns complete styling theme for category cards.
 */
export const getCategoryTheme = (slug?: string): CategoryTheme => {
  const icon = getCategoryIcon(slug)
  const s = (slug || '').toLowerCase()

  if (s.includes('phone') || s.includes('ទូរស័ព្ទ')) {
    return {
      icon,
      bgLight: 'bg-blue-50/90 dark:bg-blue-950/50',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-100 dark:border-blue-900/40',
      hoverBg: 'group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
      glowClass: 'group-hover:shadow-blue-500/20',
    }
  }
  if (s.includes('laptop') || s.includes('computer') || s.includes('mac') || s.includes('កុំព្យូទ័រ')) {
    return {
      icon,
      bgLight: 'bg-indigo-50/90 dark:bg-indigo-950/50',
      textClass: 'text-indigo-600 dark:text-indigo-400',
      borderClass: 'border-indigo-100 dark:border-indigo-900/40',
      hoverBg: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
      glowClass: 'group-hover:shadow-indigo-500/20',
    }
  }
  if (s.includes('monitor') || s.includes('display') || s.includes('tv') || s.includes('អេក្រង់')) {
    return {
      icon,
      bgLight: 'bg-cyan-50/90 dark:bg-cyan-950/50',
      textClass: 'text-cyan-600 dark:text-cyan-400',
      borderClass: 'border-cyan-100 dark:border-cyan-900/40',
      hoverBg: 'group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600',
      glowClass: 'group-hover:shadow-cyan-500/20',
    }
  }
  if (s.includes('watch') || s.includes('នាឡិកា')) {
    return {
      icon,
      bgLight: 'bg-amber-50/90 dark:bg-amber-950/50',
      textClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-100 dark:border-amber-900/40',
      hoverBg: 'group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600',
      glowClass: 'group-hover:shadow-amber-500/20',
    }
  }
  if (s.includes('game') || s.includes('gaming') || s.includes('keyboard') || s.includes('ក្តារចុច')) {
    return {
      icon,
      bgLight: 'bg-violet-50/90 dark:bg-violet-950/50',
      textClass: 'text-violet-600 dark:text-violet-400',
      borderClass: 'border-violet-100 dark:border-violet-900/40',
      hoverBg: 'group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
      glowClass: 'group-hover:shadow-violet-500/20',
    }
  }
  if (s.includes('audio') || s.includes('headphone') || s.includes('sound') || s.includes('សំឡេង') || s.includes('កាស')) {
    return {
      icon,
      bgLight: 'bg-rose-50/90 dark:bg-rose-950/50',
      textClass: 'text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-100 dark:border-rose-900/40',
      hoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
      glowClass: 'group-hover:shadow-rose-500/20',
    }
  }
  if (s.includes('camera') || s.includes('កាមេរ៉ា')) {
    return {
      icon,
      bgLight: 'bg-orange-50/90 dark:bg-orange-950/50',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-100 dark:border-orange-900/40',
      hoverBg: 'group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
      glowClass: 'group-hover:shadow-orange-500/20',
    }
  }
  if (s.includes('charger') || s.includes('power') || s.includes('ឆ្នាំងសាក')) {
    return {
      icon,
      bgLight: 'bg-amber-50/90 dark:bg-amber-950/50',
      textClass: 'text-amber-500 dark:text-amber-400',
      borderClass: 'border-amber-100 dark:border-amber-900/40',
      hoverBg: 'group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
      glowClass: 'group-hover:shadow-amber-500/20',
    }
  }
  if (s.includes('printer') || s.includes('print') || s.includes('ម៉ាស៊ីនបោះពុម្ព') || s.includes('pos') || s.includes('scanner') || s.includes('barcode')) {
    return {
      icon,
      bgLight: 'bg-emerald-50/90 dark:bg-emerald-950/50',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-100 dark:border-emerald-900/40',
      hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
      glowClass: 'group-hover:shadow-emerald-500/20',
    }
  }
  if (s.includes('shoe') || s.includes('ស្បែកជើង')) {
    return {
      icon,
      bgLight: 'bg-emerald-50/90 dark:bg-emerald-950/50',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-100 dark:border-emerald-900/40',
      hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
      glowClass: 'group-hover:shadow-emerald-500/20',
    }
  }
  if (s.includes('apparel') || s.includes('cloth') || s.includes('shirt') || s.includes('សម្លៀកបំពាក់')) {
    return {
      icon,
      bgLight: 'bg-teal-50/90 dark:bg-teal-950/50',
      textClass: 'text-teal-600 dark:text-teal-400',
      borderClass: 'border-teal-100 dark:border-teal-900/40',
      hoverBg: 'group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
      glowClass: 'group-hover:shadow-teal-500/20',
    }
  }
  if (s.includes('tablet') || s.includes('ipad')) {
    return {
      icon,
      bgLight: 'bg-indigo-50/90 dark:bg-indigo-950/50',
      textClass: 'text-indigo-500 dark:text-indigo-400',
      borderClass: 'border-indigo-100 dark:border-indigo-900/40',
      hoverBg: 'group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500',
      glowClass: 'group-hover:shadow-indigo-500/20',
    }
  }

  return {
    icon,
    bgLight: 'bg-blue-50/90 dark:bg-blue-950/50',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-100 dark:border-blue-900/40',
    hoverBg: 'group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
    glowClass: 'group-hover:shadow-blue-500/20',
  }
}
