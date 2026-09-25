import React from 'react'
import {
  Smartphone, Laptop, Monitor, Watch, Keyboard, Headphones, Camera, Zap, Footprints, Shirt
} from 'lucide-react'
import type { SizePresetConfig } from '../types/productForm.types'

export const SIZE_PRESET_MAP: Record<string, SizePresetConfig> = {
  smartphones: {
    label: 'Smartphones & Storage',
    icon: Smartphone,
    options: [
      { code: '128GB', badge: 'Base', multiplier: 1.0 },
      { code: '256GB', badge: '+20%', multiplier: 1.20 },
      { code: '512GB', badge: '+45%', multiplier: 1.45 },
      { code: '1TB', badge: '+75%', multiplier: 1.75 },
    ]
  },
  laptops: {
    label: 'Laptops & Computers',
    icon: Laptop,
    options: [
      { code: '8GB / 256GB', badge: 'Base', multiplier: 1.0 },
      { code: '16GB / 512GB', badge: '+25%', multiplier: 1.25 },
      { code: '16GB / 1TB', badge: '+45%', multiplier: 1.45 },
      { code: '32GB / 1TB', badge: '+70%', multiplier: 1.70 },
      { code: '64GB / 2TB', badge: '+120%', multiplier: 2.20 },
    ]
  },
  monitors: {
    label: 'Monitors & Displays',
    icon: Monitor,
    options: [
      { code: '24" FHD 1080p', badge: 'Base', multiplier: 1.0 },
      { code: '27" QHD 144Hz', badge: '+30%', multiplier: 1.30 },
      { code: '27" 4K UHD', badge: '+60%', multiplier: 1.60 },
      { code: '32" Curved 165Hz', badge: '+80%', multiplier: 1.80 },
      { code: '34" Ultrawide 144Hz', badge: '+110%', multiplier: 2.10 },
    ]
  },
  smartwatches: {
    label: 'Smartwatches',
    icon: Watch,
    options: [
      { code: '40mm / GPS', badge: 'Base', multiplier: 1.0 },
      { code: '41mm / GPS', badge: 'Base', multiplier: 1.0 },
      { code: '44mm / Cellular', badge: '+15%', multiplier: 1.15 },
      { code: '45mm / Cellular', badge: '+20%', multiplier: 1.20 },
      { code: '49mm Ultra', badge: '+50%', multiplier: 1.50 },
    ]
  },
  keyboards: {
    label: 'Keyboards',
    icon: Keyboard,
    options: [
      { code: 'Red Switch', badge: 'Base', multiplier: 1.0 },
      { code: 'Blue Switch', badge: 'Base', multiplier: 1.0 },
      { code: 'Brown Switch', badge: 'Base', multiplier: 1.0 },
      { code: 'Wireless RGB', badge: '+15%', multiplier: 1.15 },
      { code: 'TKL 80%', badge: 'Base', multiplier: 1.0 },
    ]
  },
  audio: {
    label: 'Audio & Headphones',
    icon: Headphones,
    options: [
      { code: 'Standard Wired', badge: 'Base', multiplier: 1.0 },
      { code: 'Wireless Bluetooth', badge: '+20%', multiplier: 1.20 },
      { code: 'Active Noise Canceling', badge: '+50%', multiplier: 1.50 },
      { code: 'Pro Studio 50W', badge: '+80%', multiplier: 1.80 },
    ]
  },
  cameras: {
    label: 'Cameras & Lenses',
    icon: Camera,
    options: [
      { code: 'Body Only', badge: 'Base', multiplier: 1.0 },
      { code: 'Kit Lens 18-55mm', badge: '+20%', multiplier: 1.20 },
      { code: 'Pro Zoom 24-70mm', badge: '+90%', multiplier: 1.90 },
    ]
  },
  chargers: {
    label: 'Chargers & Power',
    icon: Zap,
    options: [
      { code: '20W USB-C', badge: 'Base', multiplier: 1.0 },
      { code: '35W Dual USB-C', badge: '+30%', multiplier: 1.30 },
      { code: '65W GaN Fast Charger', badge: '+60%', multiplier: 1.60 },
      { code: '100W GaN Pro', badge: '+100%', multiplier: 2.00 },
    ]
  },
  shoes: {
    label: 'Shoes (EU Sizes)',
    icon: Footprints,
    options: [
      { code: 'EU 38', badge: 'Base', multiplier: 1.0 },
      { code: 'EU 39', badge: 'Base', multiplier: 1.0 },
      { code: 'EU 40', badge: 'Base', multiplier: 1.0 },
      { code: 'EU 41', badge: 'Base', multiplier: 1.0 },
      { code: 'EU 42', badge: 'Base', multiplier: 1.0 },
      { code: 'EU 43', badge: 'Base', multiplier: 1.0 },
    ]
  },
  apparel: {
    label: 'Clothing & Apparel',
    icon: Shirt,
    options: [
      { code: 'S', badge: '-10%', multiplier: 0.90 },
      { code: 'M', badge: 'Base', multiplier: 1.00 },
      { code: 'L', badge: '+10%', multiplier: 1.10 },
      { code: 'XL', badge: '+20%', multiplier: 1.20 },
      { code: 'XXL', badge: '+35%', multiplier: 1.35 },
      { code: 'Free Size', badge: 'Base', multiplier: 1.00 },
    ]
  }
}
