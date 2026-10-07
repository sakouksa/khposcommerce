export type Tab = 'shipping-methods' | 'shipping-zones' | 'shipping-rates' | 'shipments'

export interface Shipment {
  id: number
  tracking_number: string
  carrier: string
  shipping_method?: string
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  recipient_name: string
  recipient_phone?: string
  destination_city?: string
  shipping_cost: number
  estimated_delivery?: string
  created_at?: string
}

export interface ShippingMethod {
  id: number
  name: string
  code: string
  carrier: string
  base_cost: number
  estimated_days?: string
  is_active: boolean
}

export interface ShippingZone {
  id: number
  name: string
  code: string
  countries?: string
  regions?: string
  is_active: boolean
}

export interface ShippingRate {
  id: number
  zone_name?: string
  method_name?: string
  min_weight?: number
  max_weight?: number
  rate: number
  is_active: boolean
}

export interface ShippingAnalytics {
  totalShipments: number
  deliveredCount: number
  inTransitCount: number
  pendingCount: number
  failedCount: number
  totalShippingCost: number
  avgDeliveryTimeDays: number
  onTimeDeliveryRate: number
}
