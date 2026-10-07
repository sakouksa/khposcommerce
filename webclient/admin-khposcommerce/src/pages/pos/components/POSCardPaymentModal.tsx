import React, { useState, useEffect } from 'react'
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Building2, RefreshCw, Lock, Cpu, ChevronDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CardPaymentDetails } from '../types/pos.types'
import { sound } from '@/utils/sound'
import { formatCurrency } from '@/utils/formatters'

interface POSCardPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onConfirmPayment: (details: CardPaymentDetails) => void
}

const CARD_SCHEMES = [
  { 
    id: 'Visa', 
    name: 'Visa', 
    logo: 'VISA',
    icon: (
      <svg className="w-8 h-5 shrink-0" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#1A1F71"/>
        <path d="M14.7 16.5H12.4L13.9 7.5H16.2L14.7 16.5ZM23.4 7.7C22.9 7.5 22.1 7.3 21.1 7.3C18.6 7.3 16.9 8.6 16.9 10.4C16.9 11.8 18.1 12.5 19.1 13C20.1 13.5 20.4 13.8 20.4 14.3C20.4 15 19.6 15.3 18.8 15.3C17.7 15.3 16.8 15 16.1 14.7L15.7 16.5C16.6 16.9 17.8 17.2 19 17.2C21.7 17.2 23.4 15.9 23.4 14C23.4 12.3 22 11.6 20.8 11C19.9 10.5 19.4 10.2 19.4 9.7C19.4 9.2 20 8.8 21 8.8C21.9 8.8 22.7 9 23.2 9.2L23.4 7.7ZM29.2 7.5H27.4C26.8 7.5 26.3 7.7 26.1 8.2L22.6 16.5H25.1L25.6 15.1H28.7L29 16.5H31.2L29.2 7.5ZM26.3 13.4C26.5 12.8 27.2 10.8 27.2 10.8L27.4 11.8L28.1 13.4H26.3ZM11.6 7.5L9.3 16.5H7L5.3 9.4C5.2 8.9 5 8.7 4.5 8.4C3.8 8 2.6 7.6 1.7 7.4L1.8 7.5H5.4C6 7.5 6.5 7.9 6.6 8.5L7.9 14.8L10.1 7.5H11.6Z" fill="#F7B600"/>
      </svg>
    )
  },
  { 
    id: 'Mastercard', 
    name: 'Mastercard', 
    logo: 'MC',
    icon: (
      <svg className="w-8 h-5 shrink-0" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#0A0A0A"/>
        <circle cx="14" cy="12" r="7" fill="#EB001B"/>
        <circle cx="22" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9"/>
        <path d="M18 6.8A6.97 6.97 0 0015.3 12c0 2.1.9 4 2.7 5.2a6.97 6.97 0 002.7-5.2c0-2.1-.9-4-2.7-5.2z" fill="#FF5F00"/>
      </svg>
    )
  },
  { 
    id: 'UnionPay', 
    name: 'UnionPay', 
    logo: 'UnionPay',
    icon: (
      <svg className="w-8 h-5 shrink-0" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#007B86"/>
        <path d="M4 4h9v16H4z" fill="#007B86"/>
        <path d="M13 4h10v16H13z" fill="#004A97"/>
        <path d="M23 4h9v16h-9z" fill="#E21B23"/>
        <path d="M7 8h5v8H7zM16 8h5v8h-5zM25 8h5v8h-5z" fill="#FFFFFF"/>
      </svg>
    )
  },
  { 
    id: 'CSS', 
    name: 'CSS', 
    logo: 'CSS',
    icon: (
      <svg className="w-8 h-5 shrink-0" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#0F172A"/>
        <rect x="3" y="3" width="30" height="18" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1"/>
        <path d="M8 8h20M8 12h14M8 16h8" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="26" cy="15" r="3" fill="#F59E0B"/>
      </svg>
    )
  },
]

interface BankItem {
  id: string
  name: string
  code: string
  color: string
}

const POPULAR_BANKS: BankItem[] = [
  { id: 'aba', name: 'ABA Bank', code: 'ABA', color: 'bg-cyan-600 text-white' },
  { id: 'acleda', name: 'ACLEDA Bank', code: 'ACL', color: 'bg-amber-600 text-white' },
  { id: 'canadia', name: 'Canadia Bank', code: 'CAN', color: 'bg-rose-600 text-white' },
  { id: 'sathapana', name: 'Sathapana Bank', code: 'SPN', color: 'bg-blue-600 text-white' },
  { id: 'wing', name: 'Wing Bank', code: 'WNG', color: 'bg-emerald-600 text-white' },
  { id: 'phillip', name: 'Phillip Bank', code: 'PLP', color: 'bg-indigo-600 text-white' },
  { id: 'prince', name: 'Prince Bank', code: 'PRN', color: 'bg-violet-600 text-white' },
  { id: 'other', name: 'Other Bank', code: 'BNK', color: 'bg-gray-600 text-white' },
]

export const POSCardPaymentModal: React.FC<POSCardPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onConfirmPayment,
}) => {
  const { t } = useTranslation(['pos', 'common'])

  const [mode, setMode] = useState<'edc' | 'gateway'>('edc')
  const [selectedCardType, setSelectedCardType] = useState<string>('Visa')
  const [selectedBank, setSelectedBank] = useState<string>('ABA Bank')
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState<boolean>(false)
  const [approvalCode, setApprovalCode] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [isProcessingGateway, setIsProcessingGateway] = useState<boolean>(false)

  const currentBankObj = POPULAR_BANKS.find(b => b.name === selectedBank) || POPULAR_BANKS[0]

  useEffect(() => {
    if (isOpen) {
      setApprovalCode('')
      setErrorMsg('')
      setIsProcessingGateway(false)
      setIsBankDropdownOpen(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const trimmedCode = approvalCode.trim()
    if (mode === 'edc' && !trimmedCode) {
      sound.playError()
      setErrorMsg(t('approvalCodeRequired', 'Please enter the 6-digit Approval Code from the EDC terminal slip.'))
      return
    }

    sound.playSuccess()
    setErrorMsg('')
    onConfirmPayment({
      card_type: selectedCardType,
      approval_code: trimmedCode || `EDC-${Math.floor(100000 + Math.random() * 900000)}`,
      bank_name: selectedBank,
    })
  }

  const handleSimulateGatewayProcessing = () => {
    setIsProcessingGateway(true)
    setErrorMsg('')
    sound.playClick()
    setTimeout(() => {
      setIsProcessingGateway(false)
      const autoCode = String(Math.floor(100000 + Math.random() * 900000))
      setApprovalCode(autoCode)
      sound.playSuccess()
      onConfirmPayment({
        card_type: selectedCardType,
        approval_code: autoCode,
        bank_name: selectedBank,
      })
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border/90 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground leading-tight">
                {t('cardPaymentWorkflow', 'Card Payment Processing')}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {t('edcVerificationDesc', 'Verify physical EDC terminal receipt or online gateway')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount Summary Box */}
        <div className="bg-muted/30 border border-border/70 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">{t('amountToCharge', 'Amount to Charge')}</span>
            <div className="text-3xl font-black text-primary tracking-tight">{formatCurrency(amount)}</div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-primary/20">
              <Lock size={11} /> {t('secureTerminal', 'Secure EDC')}
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/30 rounded-2xl border border-border/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('edc')
              setErrorMsg('')
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'edc'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <CreditCard size={15} />
            <span>{t('edcManualTerminal', 'EDC Terminal (Manual)')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('gateway')
              setErrorMsg('')
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'gateway'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <Cpu size={15} />
            <span>{t('integratedGateway', 'Integrated Gateway')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Card Type Selector with Official Badges & Icons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <CreditCard size={14} className="text-primary" />
                <span>{t('cardType', 'Card Type')} *</span>
              </label>
              <span className="text-[11px] text-muted-foreground font-medium">{t('selectCardScheme', 'Select Card Scheme')}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {CARD_SCHEMES.map((scheme) => {
                const isSelected = selectedCardType === scheme.id
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => setSelectedCardType(scheme.id)}
                    className={`py-3 px-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center relative ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary font-black shadow-xs ring-2 ring-primary/20'
                        : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    {scheme.icon}
                    <span className="text-[11px] font-black tracking-tight leading-none">{scheme.logo}</span>
                    {scheme.id === 'CSS' && <span className="text-[9px] font-medium text-muted-foreground leading-none">(Local)</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Modern Bank Selection Custom Dropdown Component */}
          <div className="relative space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Building2 size={14} className="text-primary" />
              <span>{t('issuingBank', 'Acquiring / Issuing Bank')} *</span>
            </label>
            
            {/* Custom Trigger Button */}
            <button
              type="button"
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
              className="w-full bg-card border border-border/80 hover:border-primary/60 rounded-2xl py-2.5 px-3.5 flex items-center justify-between transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-xl font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs ${currentBankObj.color}`}>
                  {currentBankObj.code}
                </span>
                <span className="font-bold text-xs text-foreground">{currentBankObj.name}</span>
              </div>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isBankDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {/* Custom Popover Dropdown Menu */}
            {isBankDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsBankDropdownOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border/90 rounded-2xl shadow-xl p-1.5 z-20 space-y-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  {POPULAR_BANKS.map((b) => {
                    const isSelected = selectedBank === b.name
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBank(b.name)
                          setIsBankDropdownOpen(false)
                        }}
                        className={`w-full py-2 px-3 rounded-xl flex items-center justify-between transition-all text-xs font-semibold cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg font-black text-[9px] flex items-center justify-center shrink-0 ${b.color}`}>
                            {b.code}
                          </span>
                          <span>{b.name}</span>
                        </div>
                        {isSelected && <Check size={15} className="text-primary" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Approval Code Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Lock size={14} className="text-amber-500 shrink-0" />
                <span>{t('approvalCodeLabel', 'Approval Code / Reference No.')} *</span>
              </label>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap shrink-0">
                {t('mandatoryAccounting', 'Mandatory Verification')}
              </span>
            </div>

            <input
              type="text"
              value={approvalCode}
              onChange={(e) => {
                setApprovalCode(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              placeholder={t('approvalCodePlaceholder', 'e.g. 482910')}
              className={`form-input text-xs font-semibold py-2.5 px-3.5 rounded-2xl border w-full transition-all ${
                errorMsg ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/5' : 'border-border/80 focus:border-primary focus:bg-card'
              }`}
              autoFocus={mode === 'edc'}
            />
            <p className="text-[11px] text-muted-foreground leading-tight">
              {t('approvalCodeTip', 'Check the printed paper slip from the physical EDC machine for the 6-digit approval number.')}
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium animate-in fade-in">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2">
            {mode === 'edc' ? (
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-xs text-primary-foreground bg-primary hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <CheckCircle2 size={16} />
                <span>{t('confirmCardPayment', 'Confirm Card Payment')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSimulateGatewayProcessing}
                disabled={isProcessingGateway}
                className="w-full py-3 rounded-2xl font-black text-xs text-primary-foreground bg-primary hover:opacity-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                {isProcessingGateway ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{t('communicatingGateway', 'Connecting to PayWay/EDC Gateway...')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>{t('autoProcessGateway', 'Auto-Process & Generate Approval Code')}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  )
}
