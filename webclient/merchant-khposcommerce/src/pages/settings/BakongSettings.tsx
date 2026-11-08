import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  ShieldCheck,
  Check,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Smartphone,
  User,
  MapPin,
  CreditCard,
  QrCode,
  Globe,
  Radio,
  Download,
  Info,
} from 'lucide-react'
import { QRCode } from 'antd'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import {
  getBakongConfig,
  saveBakongConfig,
  DEFAULT_BAKONG_CONFIG,
  generateKHQR,
  checkTransactionStatus,
  type BakongConfig,
  type GeneratedKHQR,
} from '@/services/bakongService'
import { settingsService } from '@/services/settingsService'

const POPULAR_BANKS = [
  {
    id: 'acleda',
    name: 'ACLEDA Bank Plc.',
    shortName: 'ACLEDA',
    accountIdHint: 'khqr@aclb',
    acquiringBank: 'ACLEDA',
    color: '#002F6C',
    badge: 'Official NBC Bakong Member',
  },
  {
    id: 'bakong',
    name: 'NBC Bakong System',
    shortName: 'Bakong',
    accountIdHint: 'phone@bakong',
    acquiringBank: 'NBC',
    color: '#E1251B',
    badge: 'National Bank of Cambodia',
  },
  {
    id: 'aba',
    name: 'ABA Bank',
    shortName: 'ABA',
    accountIdHint: 'account@aba',
    acquiringBank: 'ABAA',
    color: '#004B87',
    badge: 'NBC Bakong Member',
  },
  {
    id: 'canadia',
    name: 'Canadia Bank',
    shortName: 'Canadia',
    accountIdHint: 'account@cnba',
    acquiringBank: 'CANA',
    color: '#D71920',
    badge: 'NBC Bakong Member',
  },
]

export const BakongSettings: React.FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  const toast = useToast()

  // Form State
  const [bankName, setBankName] = useState('ACLEDA Bank')
  const [accountId, setAccountId] = useState('')
  const [accountInformation, setAccountInformation] = useState('')
  const [acquiringBank, setAcquiringBank] = useState('ACLEDA')
  const [merchantName, setMerchantName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [merchantCity, setMerchantCity] = useState('Phnom Penh')
  const [apiUrl, setApiUrl] = useState('https://api-bakong.nbc.gov.kh/v1')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  // Status & Testing State
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    latencyMs?: number
  } | null>(null)
  const [previewQR, setPreviewQR] = useState<GeneratedKHQR | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  // Initialize from localStorage and database
  useEffect(() => {
    const current = getBakongConfig()
    setBankName(current.bankName || 'ACLEDA Bank')
    setAccountId(current.accountId || 'khqr@aclb')
    setAccountInformation(current.accountInformation || '85520019493')
    setAcquiringBank(current.acquiringBank || 'ACLEDA')
    setMerchantName(current.merchantName || 'SAK OUSA')
    setMobileNumber(current.mobileNumber || '0762825595')
    setMerchantCity(current.merchantCity || 'Phnom Penh')
    setApiUrl(current.apiUrl || 'https://api-bakong.nbc.gov.kh/v1')
    setToken(current.token || '')

    // Check if backend has saved settings
    settingsService
      .getSettings()
      .then((settingsList) => {
        if (Array.isArray(settingsList)) {
          const found = settingsList.find((s: any) => s.key === 'bakong_payment_settings')
          if (found && found.value) {
            try {
              const parsed = typeof found.value === 'string' ? JSON.parse(found.value) : found.value
              if (parsed.account_id) setAccountId(parsed.account_id)
              if (parsed.account_information) setAccountInformation(parsed.account_information)
              if (parsed.acquiring_bank) setAcquiringBank(parsed.acquiring_bank)
              if (parsed.merchant_name) setMerchantName(parsed.merchant_name)
              if (parsed.mobile_number) setMobileNumber(parsed.mobile_number)
              if (parsed.merchant_city) setMerchantCity(parsed.merchant_city)
              if (parsed.bank_name) setBankName(parsed.bank_name)
              if (parsed.token) setToken(parsed.token)
              if (parsed.api_url) setApiUrl(parsed.api_url)
            } catch (err) {
              console.warn('Failed parsing bakong_payment_settings from DB:', err)
            }
          }
        }
      })
      .catch(() => {})
  }, [])

  // Refresh Preview QR Code when account details change
  useEffect(() => {
    let active = true
    setIsPreviewLoading(true)

    const timer = setTimeout(() => {
      // Temporarily save preview config to memory and generate preview KHQR
      generateKHQR({
        amount: 0.59,
        currency: 'USD',
        billNumber: 'TEST-001',
      })
        .then((res) => {
          if (active) {
            setPreviewQR(res)
            setIsPreviewLoading(false)
          }
        })
        .catch(() => {
          if (active) setIsPreviewLoading(false)
        })
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [accountId, accountInformation, acquiringBank, merchantName, mobileNumber, merchantCity])

  // Select Bank Preset
  const handleSelectBankPreset = (bank: (typeof POPULAR_BANKS)[0]) => {
    sound.playClick()
    setBankName(bank.name)
    setAcquiringBank(bank.acquiringBank)
    if (bank.id === 'acleda') {
      setAccountId('khqr@aclb')
      if (!accountInformation) setAccountInformation('85520019493')
    }
    toast.success(`បានជ្រើសរើសធនាគារ ${bank.name}`)
  }

  // Save Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    sound.playClick()

    const newConfig: BakongConfig = {
      apiUrl: apiUrl.trim() || 'https://api-bakong.nbc.gov.kh/v1',
      token: token.trim(),
      accountId: accountId.trim() || 'khqr@aclb',
      accountInformation: accountInformation.trim() || '85520019493',
      acquiringBank: acquiringBank.trim() || 'ACLEDA',
      mobileNumber: mobileNumber.trim() || '0762825595',
      merchantName: merchantName.trim() || 'SAK OUSA',
      merchantCity: merchantCity.trim() || 'Phnom Penh',
      bankName: bankName.trim() || 'ACLEDA Bank',
    }

    try {
      // 1. Save locally
      saveBakongConfig(newConfig)

      // 2. Sync to Backend Setting table
      await settingsService.updateSettings({
        company_id: 1,
        settings: {
          bakong_payment_settings: {
            account_id: newConfig.accountId,
            account_information: newConfig.accountInformation,
            acquiring_bank: newConfig.acquiringBank,
            mobile_number: newConfig.mobileNumber,
            merchant_name: newConfig.merchantName,
            merchant_city: newConfig.merchantCity,
            bank_name: newConfig.bankName,
            api_url: newConfig.apiUrl,
            token: newConfig.token,
          },
        },
      })

      sound.playSuccess()
      toast.success('បានរក្សាទុកការកំណត់គណនី ACLEDA Bank & Bakong ដោយជោគជ័យ!')
    } catch (err: any) {
      console.error('Save error:', err)
      toast.error('បរាជ័យក្នុងការរក្សាទុកទៅកាន់ server (រក្សាទុកលើម៉ាស៊ីនក្នុងស្រុករួចរាល់)')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to Default
  const handleResetDefault = () => {
    sound.playClick()
    setBankName(DEFAULT_BAKONG_CONFIG.bankName)
    setAccountId(DEFAULT_BAKONG_CONFIG.accountId)
    setAccountInformation(DEFAULT_BAKONG_CONFIG.accountInformation || '85520019493')
    setAcquiringBank(DEFAULT_BAKONG_CONFIG.acquiringBank || 'ACLEDA')
    setMerchantName(DEFAULT_BAKONG_CONFIG.merchantName)
    setMobileNumber(DEFAULT_BAKONG_CONFIG.mobileNumber || '0762825595')
    setMerchantCity(DEFAULT_BAKONG_CONFIG.merchantCity)
    setApiUrl(DEFAULT_BAKONG_CONFIG.apiUrl)
    setToken(DEFAULT_BAKONG_CONFIG.token)

    saveBakongConfig(DEFAULT_BAKONG_CONFIG)
    sound.playSuccess()
    toast.success('បានកំណត់ឡើងវិញនូវគណនីដើម SAK OUSA (ACLEDA Bank)')
  }

  // Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    sound.playClick()

    const startTime = performance.now()
    try {
      // Check dummy md5 against Bakong Open API
      const result = await checkTransactionStatus('00000000000000000000000000000000')
      const latency = Math.round(performance.now() - startTime)

      // Response code 1 with "Transaction not found" means token is authenticated & API is online!
      if (result.response_code === 1 || result.response_code === 0) {
        setTestResult({
          success: true,
          message: 'ការតភ្ជាប់ជោគជ័យ! NBC Bakong Open API កំពុងដំណើរការប្រក្រតី។',
          latencyMs: latency,
        })
        sound.playSuccess()
        toast.success(`NBC Bakong API Online (${latency}ms)`)
      } else {
        setTestResult({
          success: false,
          message: `API ឆ្លើយតបកូដ ${result.response_code}: ${result.response_message}`,
          latencyMs: latency,
        })
        toast.warning(result.response_message)
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime)
      setTestResult({
        success: false,
        message: err.message || 'មិនអាចតភ្ជាប់ទៅកាន់ NBC Bakong Server បានទេ',
        latencyMs: latency,
      })
      toast.error('បរាជ័យក្នុងការតភ្ជាប់')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Hero Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900/10 via-red-600/5 to-amber-500/10 border border-border/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                <QrCode size={13} />
                NBC Bakong KHQR
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheck size={12} />
                ACLEDA Toanchet Compatible
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5 pt-1 break-words">
              <Building2 className="text-primary shrink-0" size={24} />
              <span>ការកំណត់គណនី Bakong KHQR & ACLEDA Bank</span>
            </h2>
            <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
              កំណត់គណនីទទួលប្រាក់ផ្លូវការសម្រាប់ស្កេនទូទាត់តាមបញ្ជរ POS និងវិក្កយបត្រ។ គាំទ្រការស្កេនដោយផ្ទាល់ពី ACLEDA
              Mobile, Bakong App, និងធនាគារសមាជិក KHQR ទាំងអស់ក្នុងប្រទេសកម្ពុជា។
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full xl:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="កំណត់ត្រឡប់ទៅតម្លៃដើម SAK OUSA"
            >
              <RotateCcw size={13} />
              <span>កំណត់ឡើងវិញ</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកំណត់'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Bank & Account Form Settings (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Bank Selection Presets */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">ជ្រើសរើសធនាគារដៃគូ (Partner Bank)</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">គាំទ្រ Tag 29 & Tag 62</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {POPULAR_BANKS.map((bank) => {
                const isSelected = bankName.toLowerCase().includes(bank.shortName.toLowerCase())
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => handleSelectBankPreset(bank)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20'
                        : 'border-border/70 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-xs text-foreground tracking-tight">{bank.shortName}</span>
                        {isSelected && <Check size={14} className="text-primary stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{bank.name}</p>
                    </div>
                    <span className="text-[9px] font-mono text-primary/80 mt-2 block">{bank.accountIdHint}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Card 2: Core Account Credentials Form */}
          <form onSubmit={handleSaveSettings} className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <User size={18} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">ព័ត៌មានគណនីទទួលប្រាក់ (Receiving Account)</h3>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} />
                EMVCo Standard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bakong Account ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Bakong Account ID</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tag 29 (00)</span>
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="khqr@aclb"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  សម្រាប់ ACLEDA Toanchet បញ្ចូល: <code className="text-primary font-bold">khqr@aclb</code>
                </p>
              </div>

              {/* ACLEDA Account Information */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>លេខគណនី ACLEDA Bank</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tag 29 (01)</span>
                </label>
                <input
                  type="text"
                  value={accountInformation}
                  onChange={(e) => setAccountInformation(e.target.value)}
                  placeholder="85520019493"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <p className="text-[10px] text-muted-foreground">លេខគណនីធនាគារស្នូលទទួលប្រាក់ចូលជាក់ស្តែង</p>
              </div>

              {/* Acquiring Bank */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Acquiring Bank Code</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tag 29 (02)</span>
                </label>
                <input
                  type="text"
                  value={acquiringBank}
                  onChange={(e) => setAcquiringBank(e.target.value)}
                  placeholder="ACLEDA"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <p className="text-[10px] text-muted-foreground">កូដធនាគារផ្លូវការ: ACLEDA</p>
              </div>

              {/* Account Holder / Merchant Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>ឈ្មោះម្ចាស់គណនី (Name)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tag 59</span>
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="SAK OUSA"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                  required
                />
                <p className="text-[10px] text-muted-foreground">បង្ហាញលើវិក្កយបត្រ និងកម្មវិធីទូរស័ព្ទពេលស្កេន</p>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>លេខទូរស័ព្ទ (Mobile)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tag 62 (02)</span>
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="0762825595"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <p className="text-[10px] text-muted-foreground">លេខទូរស័ព្ទដែលភ្ជាប់គណនី ACLEDA</p>
              </div>

              {/* Merchant City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>ទីក្រុង/ខេត្ត (City)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tag 60</span>
                </label>
                <input
                  type="text"
                  value={merchantCity}
                  onChange={(e) => setMerchantCity(e.target.value)}
                  placeholder="Phnom Penh"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <p className="text-[10px] text-muted-foreground">ទីតាំងអាជីវកម្ម (លំនាំដើម: Phnom Penh)</p>
              </div>
            </div>
          </form>

          {/* Card 3: NBC Bakong Open API & Security */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">ការតភ្ជាប់ NBC Bakong Open API (Live Verification)</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                v1 Gateway
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">API Base Endpoint</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api-bakong.nbc.gov.kh/v1"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>NBC Open API Bearer Token</span>
                    {token && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {token.length} chars
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showToken ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showToken ? 'លាក់កូដ' : 'បង្ហាញកូដ'}</span>
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    style={{ WebkitTextSecurity: showToken ? 'none' : 'disc' } as any}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Security Token សម្រាប់ផ្ទៀងផ្ទាត់ការទូទាត់ភ្លាមៗ (Real-time Webhook & Polling) តាមរយៈ NBC Bakong Gateway។
                </p>
              </div>

              {/* API Testing Actions & Result */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw size={13} className="animate-spin" /> : <Radio size={13} />}
                  <span>{isTesting ? 'កំពុងពិនិត្យ...' : 'ពិនិត្យការតភ្ជាប់ Open API'}</span>
                </button>

                {testResult && (
                  <div
                    className={`text-xs font-medium px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{testResult.message}</span>
                    {testResult.latencyMs && (
                      <span className="font-mono text-[10px] opacity-80">({testResult.latencyMs}ms)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Ticket Preview & Usage Guide (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mobile Ticket Preview */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <h3 className="font-bold text-sm text-foreground">គំរូសន្លឹក KHQR លើ POS (Live Preview)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                ស្ទាយដូចរូប 100%
              </span>
            </div>

            {/* Mobile Ticket Viewfinder Card */}
            <div className="max-w-[320px] mx-auto bg-[#FAFAFA] dark:bg-zinc-950 border border-gray-200/80 dark:border-zinc-800 rounded-[28px] p-5 shadow-lg space-y-3 text-center">
              {/* Top Avatar */}
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-[#E57538] text-white flex flex-col items-center justify-center shadow-xs font-black select-none border border-amber-600/20">
                  <span className="text-xs font-black leading-tight">
                    {merchantName?.slice(0, 3)?.toUpperCase() || 'POS'}
                  </span>
                  <span className="text-[8px] font-bold opacity-90 leading-tight">ហាងទំនិញ</span>
                </div>
              </div>

              {/* Ticket Container */}
              <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm overflow-hidden text-center">
                {/* Red Header Notch */}
                <div className="relative bg-[#E1251B] text-white py-1.5 px-4 font-black text-xs tracking-wider flex items-center justify-center">
                  <span className="tracking-widest">KHQR</span>
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-[#E1251B] [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,100%_50%)]" />
                </div>

                {/* Merchant Name & Amount */}
                <div className="pt-3 pb-2 px-4 space-y-0.5">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate">
                    {merchantName || 'SAK OUSA'}
                  </div>
                  <div className="text-xl font-black text-gray-900 dark:text-zinc-100 flex items-baseline justify-center gap-1">
                    <span>0.59</span>
                    <span className="text-xs font-bold text-gray-500">USD</span>
                  </div>
                </div>

                {/* Dashed Line with Ticket Punches */}
                <div className="relative py-1 flex items-center">
                  <div className="absolute -left-2.5 w-4 h-4 rounded-full bg-[#FAFAFA] dark:bg-zinc-950 border-r border-gray-200/80 dark:border-zinc-800" />
                  <div className="w-full border-t border-dashed border-gray-200 dark:border-zinc-700" />
                  <div className="absolute -right-2.5 w-4 h-4 rounded-full bg-[#FAFAFA] dark:bg-zinc-950 border-l border-gray-200/80 dark:border-zinc-800" />
                </div>

                {/* Centered QR Code with Official NBC Flower Emblem */}
                <div className="py-2.5 flex justify-center">
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100 dark:border-zinc-800 inline-block">
                    {previewQR?.qr ? (
                      <QRCode
                        value={previewQR.qr}
                        size={140}
                        bordered={false}
                        errorLevel="M"
                      />
                    ) : (
                      <div className="w-[140px] h-[140px] flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-lg">
                        <RefreshCw className="animate-spin text-gray-400" size={24} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan to Pay Footer */}
                <div className="pb-3 px-4 space-y-0.5">
                  <div className="text-xs font-bold text-gray-800 dark:text-zinc-200">Scan to Pay</div>
                  <div className="text-[10px] text-gray-400">or upload to Mobile Banking app</div>
                </div>
              </div>

              {/* Subtotal & Total Preview */}
              <div className="px-2 pt-1 text-[11px] text-gray-600 dark:text-zinc-400 space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">0.59 USD</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 dark:text-zinc-100 text-xs pt-1 border-t border-gray-200/60 dark:border-zinc-800">
                  <span>TOTAL:</span>
                  <span className="text-primary font-bold">0.59 USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Guide for ACLEDA Mobile & Bakong */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <Info size={17} className="text-blue-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                របៀបដំណើរការស្កេនជាមួយ ACLEDA Toanchet
              </h3>
            </div>

            <ol className="text-xs text-muted-foreground space-y-2.5 list-decimal pl-4 leading-relaxed">
              <li>
                <strong className="text-foreground">បើក ACLEDA Mobile:</strong> អតិថិជនបើកកម្មវិធី ACLEDA Mobile ឬ
                Bakong App លើទូរស័ព្ទដៃ។
              </li>
              <li>
                <strong className="text-foreground">ស្កេន KHQR:</strong> ចុចលើប៊ូតុង "ស្កេន QR" ហើយស្កេនកូដលើផ្ទាំង POS
                របស់លោកអ្នក។
              </li>
              <li>
                <strong className="text-foreground">ប្រាក់ចូលគណនីភ្លាមៗ:</strong> ប្រព័ន្ធនឹងរត់ចូលគណនី ACLEDA Core
                លេខ <code className="text-primary font-bold">{accountInformation}</code> របស់លោកអ្នកភ្លាមៗ។
              </li>
              <li>
                <strong className="text-foreground">បិទដោយស្វ័យប្រវត្តិ:</strong> នៅពេលទទួលបានប្រាក់ជោគជ័យ
                ប្រព័ន្ធនឹងបន្លឺសំឡេង "Ding!" ហើយបិទផ្ទាំង QR ដើម្បីចេញវិក្កយបត្រ។
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BakongSettings
