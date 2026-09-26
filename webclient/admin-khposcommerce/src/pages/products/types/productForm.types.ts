export interface ProductForm {
  name:                string
  sku:                 string
  barcode:             string
  category_id:         string
  brand_id:            string
  unit_id:             string
  tax_id:              string
  description:         string
  short_description:   string
  cost_price:          string
  selling_price:       string
  compare_price:       string
  weight:              string
  length:              string
  width:               string
  height:              string
  track_inventory:     boolean
  has_variants:        boolean
  low_stock_threshold: string
  status:              string
  is_featured:         boolean
  is_digital:          boolean
  meta_title:          string
  meta_description:    string
  meta_keywords:       string
}

export const BLANK_FORM: ProductForm = {
  name: '',
  sku: '',
  barcode: '',
  category_id: '',
  brand_id: '',
  unit_id: '',
  tax_id: '',
  description: '',
  short_description: '',
  cost_price: '',
  selling_price: '',
  compare_price: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  track_inventory: true,
  has_variants: false,
  low_stock_threshold: '5',
  status: 'active',
  is_featured: false,
  is_digital: false,
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
}

export interface CustomColorItem {
  key: string
  name: string
  hex: string
  badge?: string
}

export interface CreateImagePreview {
  id: string
  url: string
  file: File
  isPrimary: boolean
}

export interface SizePresetOption {
  code: string
  badge: string
  multiplier: number
}

export interface SizePresetConfig {
  label: string
  icon: any
  options: SizePresetOption[]
}
