import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Truck } from 'lucide-react'
import ModernSelect from '@/components/shared/ModernSelect'
import { shippingService } from '@/services/shippingService'

export interface ShippingCarrierSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export const FALLBACK_PRESET_CARRIERS = [
  {
    value: 'Virak Buntham',
    labelKey: 'purchases.carrierVirakBuntham',
    defaultLabel: 'វីរៈ ប៊ុនថាំ (Virak Buntham / VET)',
    shortLabel: 'វីរៈ ប៊ុនថាំ',
  },
  {
    value: 'J&T Express',
    labelKey: 'purchases.carrierJT',
    defaultLabel: 'J&T Express',
    shortLabel: 'J&T Express',
  },
  {
    value: 'Kerry Express',
    labelKey: 'purchases.carrierKerry',
    defaultLabel: 'Kerry Express',
    shortLabel: 'Kerry Express',
  },
  {
    value: 'Cambodia Post',
    labelKey: 'purchases.carrierCambodiaPost',
    defaultLabel: 'ប្រៃសណីយ៍កម្ពុជា (Cambodia Post)',
    shortLabel: 'ប្រៃសណីយ៍កម្ពុជា',
  },
  {
    value: 'Capitol Express',
    labelKey: 'purchases.carrierCapitol',
    defaultLabel: 'កាពីតូល (Capitol Express)',
    shortLabel: 'កាពីតូល',
  },
  {
    value: 'In-House Delivery',
    labelKey: 'purchases.carrierInHouse',
    defaultLabel: 'ដឹកផ្ទាល់ / បុគ្គលិកខាងក្នុង (In-House Delivery)',
    shortLabel: 'ដឹកផ្ទាល់',
  },
] as const

export const ShippingCarrierSelect: React.FC<ShippingCarrierSelectProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
  required = false,
}) => {
  const { t } = useTranslation(['purchases', 'common'])

  // ─── 1. FETCH DYNAMIC SHIPPING METHODS FROM DATABASE / SETTINGS ─────────
  const { data: dbMethodsRaw, isLoading: isLoadingMethods } = useQuery({
    queryKey: ['shipping-methods-dynamic-select'],
    queryFn: () => shippingService.getShippingMethods({ per_page: 100 }),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  })

  // ─── 2. COMPOSE DYNAMIC CARRIER LIST (DB + FALLBACK PRESETS) ───────────
  const dynamicCarriers = useMemo(() => {
    const rawList: any[] = Array.isArray(dbMethodsRaw)
      ? dbMethodsRaw
      : Array.isArray(dbMethodsRaw?.data)
      ? dbMethodsRaw.data
      : []

    if (rawList.length > 0) {
      // Filter only active methods from Master Data
      const activeMethods = rawList.filter((m) => m.is_active !== false)
      const mapped = activeMethods.map((m) => {
        const carrierVal = m.provider || m.name
        const carrierDisplay =
          m.name && m.provider && m.name !== m.provider
            ? `${m.name} (${m.provider})`
            : m.name || m.provider
        return {
          value: carrierVal,
          label: carrierDisplay,
          shortLabel: m.provider || m.name,
        }
      })

      // Deduplicate by normalized value
      const seen = new Set<string>()
      const unique: Array<{ value: string; label: string; shortLabel: string }> = []
      for (const item of mapped) {
        const key = item.value.trim().toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(item)
        }
      }
      return unique
    }

    // Fallback presets if database table has not yet loaded or is empty
    return FALLBACK_PRESET_CARRIERS.map((c) => ({
      value: c.value,
      label: t(c.labelKey, c.defaultLabel),
      shortLabel: c.shortLabel,
    }))
  }, [dbMethodsRaw, t])

  // ─── 3. LOCAL STATE MANAGEMENT ─────────────────────────────────────────
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (!value) return ''
    const match = dynamicCarriers.find((c) => c.value.toLowerCase() === value.toLowerCase())
    return match ? match.value : 'other'
  })

  const [customName, setCustomName] = useState<string>(() => {
    const match = dynamicCarriers.find((c) => c.value.toLowerCase() === (value || '').toLowerCase())
    return match ? '' : value || ''
  })

  // Synchronize when external value or carrier list changes
  useEffect(() => {
    if (!value) {
      setSelectedKey('')
      setCustomName('')
    } else {
      const match = dynamicCarriers.find((c) => c.value.toLowerCase() === value.toLowerCase())
      if (match) {
        setSelectedKey(match.value)
        setCustomName('')
      } else {
        setSelectedKey('other')
        setCustomName(value)
      }
    }
  }, [value, dynamicCarriers])

  // ─── 4. DROPDOWN OPTIONS ───────────────────────────────────────────────
  const options = useMemo(() => {
    return [
      {
        value: '',
        label: t('purchases.selectCarrierPlaceholder', '-- ជ្រើសរើសក្រុមហ៊ុនដឹកជញ្ជូន --'),
      },
      ...dynamicCarriers.map((c) => ({
        value: c.value,
        label: c.label,
      })),
      {
        value: 'other',
        label: t('purchases.carrierOther', 'ផ្សេងៗ... (បញ្ចូលដោយដៃ / Other)'),
      },
    ]
  }, [dynamicCarriers, t])

  const handleDropdownChange = (val: string) => {
    setSelectedKey(val)
    if (val === 'other') {
      onChange(customName)
    } else {
      setCustomName('')
      onChange(val)
    }
  }

  const handleCustomChange = (text: string) => {
    setCustomName(text)
    onChange(text)
  }

  const handleChipClick = (val: string) => {
    if (disabled) return
    setSelectedKey(val)
    setCustomName('')
    onChange(val)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label !== undefined ? (
        label && (
          <label className="block text-xs font-semibold text-foreground mb-1">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )
      ) : (
        <label className="block text-xs font-semibold text-foreground mb-1">
          {t('purchases.shippingCarrier', 'ក្រុមហ៊ុនដឹកជញ្ជូន / អ្នកដឹក')}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* ModernSelect Dropdown (Dynamic from Database) */}
      <ModernSelect
        value={selectedKey}
        onChange={(val) => handleDropdownChange(String(val))}
        options={options}
        placeholder={
          isLoadingMethods
            ? t('common.loading', 'កំពុងផ្ទុក...')
            : t('purchases.selectCarrierPlaceholder', '-- ជ្រើសរើសក្រុមហ៊ុនដឹកជញ្ជូន --')
        }
        disabled={disabled || isLoadingMethods}
        icon={<Truck size={15} className="text-muted-foreground" />}
      />

      {/* Dynamic Quick Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          {t('purchases.quickSelect', 'រើសរហ័ស:')}
        </span>
        {dynamicCarriers.slice(0, 5).map((c) => {
          const isSelected = selectedKey.toLowerCase() === c.value.toLowerCase()
          return (
            <button
              key={c.value}
              type="button"
              disabled={disabled}
              onClick={() => handleChipClick(c.value)}
              className={`text-[11px] px-2.5 py-0.5 rounded-md border font-medium transition-all ${
                isSelected
                  ? 'bg-primary/15 border-primary/50 text-primary font-semibold shadow-xs'
                  : 'bg-muted/40 border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {c.shortLabel}
            </button>
          )
        })}
      </div>

      {/* Conditional Custom Name Input (for 'Other') */}
      {selectedKey === 'other' && (
        <div className="pt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            {t('purchases.customCarrierLabel', 'ឈ្មោះក្រុមហ៊ុនដឹកជញ្ជូន ឬអ្នកដឹក (បញ្ចូលដោយដៃ)')}
          </label>
          <input
            type="text"
            value={customName}
            disabled={disabled}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder={t(
              'purchases.customCarrierPlaceholder',
              'ឧ. ឡានឈ្នួលភ្នំពេញ-បាត់ដំបង, អ្នកដឹកឯកជន...'
            )}
            className="w-full h-10 px-3.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            autoFocus
          />
        </div>
      )}
    </div>
  )
}

export default ShippingCarrierSelect
