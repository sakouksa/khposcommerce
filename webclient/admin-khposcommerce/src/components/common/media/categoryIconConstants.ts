import React from 'react'
import {
  FolderClosed, Folder, Tag, Tags, Package, Box, ShoppingBag, ShoppingCart,
  Store, Building, Building2, Home, Briefcase, Zap, Wifi, Flame,
  Droplets, Lightbulb, Trash2, Wrench, Hammer, Plug, Truck, Car,
  Plane, Fuel, Navigation, MapPin, Bike, Compass, Utensils, Coffee,
  Pizza, Apple, Cake, Wine, Server, Laptop, Smartphone, Megaphone,
  Globe, Tv, Headphones, Radio, Film, Camera, DollarSign, CreditCard,
  Wallet, Banknote, Coins, Receipt, Landmark, PiggyBank, Percent,
  BadgePercent, HeartPulse, Stethoscope, Activity, Shield, ShieldCheck,
  AlertCircle, BookOpen, GraduationCap, Award, FileText, Sparkles,
  Clock, Users, UserCheck, Layers
} from 'lucide-react'

// ─── Available Icons Registry ──────────────────────────────────────────────────

export const CATEGORY_ICONS_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  // General & Storage
  FolderClosed,
  Folder,
  Tag,
  Tags,
  Package,
  Box,
  ShoppingBag,
  ShoppingCart,
  Store,
  Building,
  Building2,
  Home,
  Briefcase,
  Layers,

  // Utilities & Maintenance
  Zap,
  Wifi,
  Flame,
  Droplets,
  Lightbulb,
  Trash2,
  Wrench,
  Hammer,
  Plug,

  // Logistics & Travel
  Truck,
  Car,
  Plane,
  Fuel,
  Navigation,
  MapPin,
  Bike,
  Compass,

  // Food, Drinks & Hospitality
  Utensils,
  Coffee,
  Pizza,
  Apple,
  Cake,
  Wine,

  // Technology & Communication
  Server,
  Laptop,
  Smartphone,
  Megaphone,
  Globe,
  Tv,
  Headphones,
  Radio,
  Film,
  Camera,

  // Finance, Money & Ledger
  DollarSign,
  CreditCard,
  Wallet,
  Banknote,
  Coins,
  Receipt,
  Landmark,
  PiggyBank,
  Percent,
  BadgePercent,

  // Health, Security & Safety
  HeartPulse,
  Stethoscope,
  Activity,
  Shield,
  ShieldCheck,
  AlertCircle,

  // Administration, Staff & Office
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  Sparkles,
  Clock,
  Users,
  UserCheck,
}

// ─── Curated Color Palettes ────────────────────────────────────────────────────

export interface ColorDef {
  key: string
  label: string
  bg: string
  text: string
  border: string
  hex: string
}

export const CATEGORY_COLORS: Record<string, ColorDef> = {
  blue: {
    key: 'blue',
    label: 'Blue',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20 dark:border-blue-500/30',
    hex: '#3B82F6',
  },
  indigo: {
    key: 'indigo',
    label: 'Indigo',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20 dark:border-indigo-500/30',
    hex: '#6366F1',
  },
  purple: {
    key: 'purple',
    label: 'Purple',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20 dark:border-purple-500/30',
    hex: '#A855F7',
  },
  violet: {
    key: 'violet',
    label: 'Violet',
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20 dark:border-violet-500/30',
    hex: '#8B5CF6',
  },
  cyan: {
    key: 'cyan',
    label: 'Cyan',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20 dark:border-cyan-500/30',
    hex: '#06B6D4',
  },
  sky: {
    key: 'sky',
    label: 'Sky',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20 dark:border-sky-500/30',
    hex: '#0EA5E9',
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    hex: '#10B981',
  },
  teal: {
    key: 'teal',
    label: 'Teal',
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20 dark:border-teal-500/30',
    hex: '#14B8A6',
  },
  amber: {
    key: 'amber',
    label: 'Amber',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 dark:border-amber-500/30',
    hex: '#F59E0B',
  },
  orange: {
    key: 'orange',
    label: 'Orange',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20 dark:border-orange-500/30',
    hex: '#F97316',
  },
  rose: {
    key: 'rose',
    label: 'Rose',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20 dark:border-rose-500/30',
    hex: '#F43F5E',
  },
  pink: {
    key: 'pink',
    label: 'Pink',
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20 dark:border-pink-500/30',
    hex: '#EC4899',
  },
  slate: {
    key: 'slate',
    label: 'Slate',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20 dark:border-slate-500/30',
    hex: '#64748B',
  },
}

// ─── Helper to Resolve Icon & Color with Smart Keyword Fallback ────────────────

export function resolveCategoryVisual(
  name?: string,
  customIcon?: string | null,
  customColor?: string | null
): {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconName: string
  colorKey: string
  colorDef: ColorDef
} {
  // If user explicitly picked an icon and color
  if (customIcon && CATEGORY_ICONS_MAP[customIcon]) {
    const colorKey = customColor && CATEGORY_COLORS[customColor] ? customColor : 'blue'
    return {
      icon: CATEGORY_ICONS_MAP[customIcon],
      iconName: customIcon,
      colorKey,
      colorDef: CATEGORY_COLORS[colorKey],
    }
  }

  // Keyword heuristic matching for legacy categories
  const n = (name || '').toLowerCase()
  let matchedIcon = 'FolderClosed'
  let matchedColor = 'slate'

  if (n.includes('office') || n.includes('supplies') || n.includes('stationery') || n.includes('equipment')) {
    matchedIcon = 'Package'
    matchedColor = 'blue'
  } else if (n.includes('rent') || n.includes('lease') || n.includes('space') || n.includes('office')) {
    matchedIcon = 'Building2'
    matchedColor = 'indigo'
  } else if (n.includes('electric') || n.includes('power') || n.includes('utility') || n.includes('utilities')) {
    matchedIcon = 'Zap'
    matchedColor = 'amber'
  } else if (n.includes('internet') || n.includes('phone') || n.includes('telecom') || n.includes('network') || n.includes('wifi')) {
    matchedIcon = 'Wifi'
    matchedColor = 'cyan'
  } else if (n.includes('meal') || n.includes('food') || n.includes('dinner') || n.includes('coffee') || n.includes('lunch')) {
    matchedIcon = 'Utensils'
    matchedColor = 'orange'
  } else if (n.includes('shipping') || n.includes('packaging') || n.includes('delivery') || n.includes('box')) {
    matchedIcon = 'Truck'
    matchedColor = 'sky'
  } else if (n.includes('fuel') || n.includes('gas') || n.includes('logistics') || n.includes('petrol') || n.includes('transport')) {
    matchedIcon = 'Fuel'
    matchedColor = 'emerald'
  } else if (n.includes('ad') || n.includes('marketing') || n.includes('promo') || n.includes('campaign') || n.includes('media')) {
    matchedIcon = 'Megaphone'
    matchedColor = 'purple'
  } else if (n.includes('server') || n.includes('cloud') || n.includes('host') || n.includes('aws') || n.includes('domain') || n.includes('saas')) {
    matchedIcon = 'Server'
    matchedColor = 'violet'
  } else if (n.includes('salary') || n.includes('payroll') || n.includes('wage') || n.includes('bonus') || n.includes('commission')) {
    matchedIcon = 'Wallet'
    matchedColor = 'emerald'
  } else if (n.includes('tax') || n.includes('vat') || n.includes('duty') || n.includes('customs')) {
    matchedIcon = 'Percent'
    matchedColor = 'rose'
  } else if (n.includes('health') || n.includes('medical') || n.includes('insurance') || n.includes('clinic')) {
    matchedIcon = 'HeartPulse'
    matchedColor = 'rose'
  } else if (n.includes('tool') || n.includes('repair') || n.includes('maintenance') || n.includes('fix')) {
    matchedIcon = 'Wrench'
    matchedColor = 'teal'
  } else if (n.includes('travel') || n.includes('trip') || n.includes('flight') || n.includes('hotel')) {
    matchedIcon = 'Plane'
    matchedColor = 'indigo'
  }

  // Override with customColor if provided
  if (customColor && CATEGORY_COLORS[customColor]) {
    matchedColor = customColor
  }

  return {
    icon: CATEGORY_ICONS_MAP[matchedIcon] || FolderClosed,
    iconName: matchedIcon,
    colorKey: matchedColor,
    colorDef: CATEGORY_COLORS[matchedColor] || CATEGORY_COLORS.blue,
  }
}
