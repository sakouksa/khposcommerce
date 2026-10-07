import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface CountryPhoneConfig {
  code: string
  dialCode: string
  flag: string
  nameKm: string
  nameEn: string
  placeholder: string
  format: (digits: string) => string
}

export const SUPPORTED_PHONE_COUNTRIES: CountryPhoneConfig[] = [
  {
    code: 'KH',
    dialCode: '+855',
    flag: '🇰🇭',
    nameKm: 'កម្ពុជា',
    nameEn: 'Cambodia (+855)',
    placeholder: '012 345 678 / 097 123 4567',
    format: (digits: string) => {
      if (!digits) return ''
      if (digits.startsWith('0')) {
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
        if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
      }
      if (digits.length <= 2) return digits
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
      if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`
    }
  },
  {
    code: 'TH',
    dialCode: '+66',
    flag: '🇹🇭',
    nameKm: 'ថៃ',
    nameEn: 'Thailand (+66)',
    placeholder: '081 234 5678',
    format: (digits: string) => {
      if (!digits) return ''
      if (digits.startsWith('0')) {
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
        if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
      }
      if (digits.length <= 2) return digits
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`
    }
  },
  {
    code: 'VN',
    dialCode: '+84',
    flag: '🇻🇳',
    nameKm: 'វៀតណាម',
    nameEn: 'Vietnam (+84)',
    placeholder: '091 234 5678',
    format: (digits: string) => {
      if (!digits) return ''
      if (digits.startsWith('0')) {
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
        if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
      }
      if (digits.length <= 2) return digits
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`
    }
  },
  {
    code: 'CN',
    dialCode: '+86',
    flag: '🇨🇳',
    nameKm: 'ចិន',
    nameEn: 'China (+86)',
    placeholder: '138 0000 0000',
    format: (digits: string) => {
      if (!digits) return ''
      if (digits.length <= 3) return digits
      if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`
    }
  },
  {
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    nameKm: 'សហរដ្ឋអាមេរិក',
    nameEn: 'United States (+1)',
    placeholder: '(202) 555-0123',
    format: (digits: string) => {
      if (!digits) return ''
      if (digits.length <= 3) return `(${digits}`
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }
]

export interface CountryPhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  name?: string
  id?: string
  placeholder?: string
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  name = 'phone',
  id = 'phone',
  placeholder
}) => {
  const { t, i18n } = useTranslation(['common'])
  const [selectedCountry, setSelectedCountry] = useState<CountryPhoneConfig>(SUPPORTED_PHONE_COUNTRIES[0])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Auto-detect country code from value if it starts with dialCode
  useEffect(() => {
    if (value && typeof value === 'string') {
      const match = SUPPORTED_PHONE_COUNTRIES.find(c => value.startsWith(c.dialCode))
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match)
      }
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleCountrySelect = (country: CountryPhoneConfig) => {
    setSelectedCountry(country)
    setIsOpen(false)

    // Re-format existing digits if present
    const digits = (value || '').replace(/\D/g, '')
    if (digits) {
      const formatted = country.format(digits)
      onChange(formatted)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // If user starts with +, preserve international prefix format
    if (raw.startsWith('+')) {
      const sanitized = '+' + raw.replace(/[^\d\s-]/g, '').slice(1)
      onChange(sanitized)
      return
    }

    // Keep only numbers
    const digits = raw.replace(/\D/g, '')
    const formatted = selectedCountry.format(digits)
    onChange(formatted)
  }

  const currentCountryName = i18n.language === 'km' ? selectedCountry.nameKm : selectedCountry.nameEn

  return (
    <div className={`relative flex rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${className}`} ref={dropdownRef}>
      
      {/* ─── Country Code Selector Button ─── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-3 bg-muted/20 hover:bg-muted/40 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 border-r border-border/80 dark:border-slate-700/80 text-xs font-semibold text-foreground/90 dark:text-slate-200 shrink-0 transition-colors cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none rounded-l-lg"
        title={currentCountryName}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-mono text-muted-foreground dark:text-slate-400 font-bold">{selectedCountry.dialCode}</span>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {/* ─── Phone Number Input Field ─── */}
      <input
        type="tel"
        inputMode="tel"
        id={id}
        name={name}
        disabled={disabled}
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder || selectedCountry.placeholder}
        className="flex-1 h-10 px-3.5 text-xs sm:text-[13px] bg-transparent text-foreground dark:text-slate-100 placeholder:text-muted-foreground/50 dark:placeholder:text-slate-500 focus:outline-none font-mono font-medium"
      />

      {/* ─── Modern 5-Country Dropdown Popup ─── */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-card dark:bg-slate-900 rounded-xl border border-border/90 dark:border-slate-700 shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 dark:border-slate-800">
            {t('common.selectCountry', 'Select Country')}
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {SUPPORTED_PHONE_COUNTRIES.map((country) => {
              const isSelected = country.code === selectedCountry.code
              const countryName = i18n.language === 'km' ? country.nameKm : country.nameEn
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20'
                      : 'hover:bg-muted/60 dark:hover:bg-slate-800/80 text-foreground dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg leading-none">{country.flag}</span>
                    <div className="min-w-0">
                      <span className="block truncate text-xs">{countryName}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground">{country.dialCode}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CountryPhoneInput
