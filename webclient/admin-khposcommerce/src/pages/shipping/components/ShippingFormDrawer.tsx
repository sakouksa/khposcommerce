import React from 'react'
import FormDrawer from '@/components/common/FormDrawer'
import type { Tab } from '../types/shipping.types'

interface ShippingFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  activeTab: Tab
  name: string
  setName: (val: string) => void
  code: string
  setCode: (val: string) => void
  provider: string
  setProvider: (val: string) => void
  basePrice: string
  setBasePrice: (val: string) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
  countries: string
  setCountries: (val: string) => void
  provinces: string
  setProvinces: (val: string) => void
  cities: string
  setCities: (val: string) => void
  shippingMethodId: string
  setShippingMethodId: (val: string) => void
  shippingZoneId: string
  setShippingZoneId: (val: string) => void
  minWeight: string
  setMinWeight: (val: string) => void
  maxWeight: string
  setMaxWeight: (val: string) => void
  price: string
  setPrice: (val: string) => void
  orderId: string
  setOrderId: (val: string) => void
  trackingNumber: string
  setTrackingNumber: (val: string) => void
  carrier: string
  setCarrier: (val: string) => void
  shipmentStatus: string
  setShipmentStatus: (val: string) => void
  methodsList: any[]
  zonesList: any[]
}

export const ShippingFormDrawer: React.FC<ShippingFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isSubmitting,
  activeTab,
  name,
  setName,
  code,
  setCode,
  provider,
  setProvider,
  basePrice,
  setBasePrice,
  isActive,
  setIsActive,
  countries,
  setCountries,
  provinces,
  setProvinces,
  cities,
  setCities,
  shippingMethodId,
  setShippingMethodId,
  shippingZoneId,
  setShippingZoneId,
  minWeight,
  setMinWeight,
  maxWeight,
  setMaxWeight,
  price,
  setPrice,
  orderId,
  setOrderId,
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
  shipmentStatus,
  setShipmentStatus,
  methodsList = [],
  zonesList = [],
}) => {
  const title = editingItem
    ? `Edit ${activeTab.replace('-', ' ')}`
    : `Add ${activeTab.replace('-', ' ')}`

  return (
    <FormDrawer
      open={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      {activeTab === 'shipping-methods' && (
        <div className="space-y-4">
          <div>
            <label className="label">Method Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Express Air Freight"
              className="input w-full"
            />
          </div>
          <div>
            <label className="label">Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EXPRESS_AIR"
              className="input w-full font-mono uppercase"
            />
          </div>
          <div>
            <label className="label">Carrier Provider</label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. DHL, FedEx"
              className="input w-full"
            />
          </div>
          <div>
            <label className="label">Base Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="5.00"
              className="input w-full"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="methodActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="checkbox"
            />
            <label htmlFor="methodActive" className="text-sm font-medium text-foreground cursor-pointer">
              Active Method
            </label>
          </div>
        </div>
      )}

      {activeTab === 'shipping-zones' && (
        <div className="space-y-4">
          <div>
            <label className="label">Zone Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North America Domestic"
              className="input w-full"
            />
          </div>
          <div>
            <label className="label">Zone Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ZONE_PP_URBAN"
              className="input w-full font-mono uppercase"
            />
          </div>
          <div>
            <label className="label">Countries (JSON string array)</label>
            <input
              type="text"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder='["KH"]'
              className="input w-full font-mono text-xs"
            />
          </div>
          <div>
            <label className="label">Provinces (JSON string array)</label>
            <input
              type="text"
              value={provinces}
              onChange={(e) => setProvinces(e.target.value)}
              placeholder='["Phnom Penh", "Kandal", "Siem Reap"]'
              className="input w-full font-mono text-xs"
            />
          </div>
          <div>
            <label className="label">Cities / Districts (JSON string array)</label>
            <input
              type="text"
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              placeholder='["Khan Daun Penh", "Krong Siem Reap", "Krong Suong"]'
              className="input w-full font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="zoneActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="checkbox"
            />
            <label htmlFor="zoneActive" className="text-sm font-medium text-foreground cursor-pointer">
              Active Zone
            </label>
          </div>
        </div>
      )}

      {activeTab === 'shipping-rates' && (
        <div className="space-y-4">
          <div>
            <label className="label">Shipping Method *</label>
            <select
              required
              value={shippingMethodId}
              onChange={(e) => setShippingMethodId(e.target.value)}
              className="input w-full"
            >
              <option value="">Select Method</option>
              {methodsList.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Shipping Zone *</label>
            <select
              required
              value={shippingZoneId}
              onChange={(e) => setShippingZoneId(e.target.value)}
              className="input w-full"
            >
              <option value="">Select Zone</option>
              {zonesList.map((z: any) => (
                <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Max Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
          <div>
            <label className="label">Freight Rate ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12.50"
              className="input w-full"
            />
          </div>
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="space-y-4">
          <div>
            <label className="label">Order ID *</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ORD-9021"
              className="input w-full"
            />
          </div>
          <div>
            <label className="label">Tracking Number *</label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder="TRK-98124018"
              className="input w-full font-mono uppercase"
            />
          </div>
          <div>
            <label className="label">Carrier Provider</label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. DHL Express"
              className="input w-full"
            />
          </div>
          <div>
            <label className="label">Shipment Status</label>
            <select
              value={shipmentStatus}
              onChange={(e) => setShipmentStatus(e.target.value)}
              className="input w-full"
            >
              <option value="pending">Pending Pickup</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed Delivery</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      )}
    </FormDrawer>
  )
}

export default ShippingFormDrawer
