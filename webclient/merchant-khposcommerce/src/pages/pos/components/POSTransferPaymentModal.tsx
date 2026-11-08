import React, { useState, useEffect } from 'react'
import { X, Building2, Copy, Check, CheckCircle2, AlertCircle, Hash, ShieldCheck, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TransferPaymentDetails } from '../types/pos.types'
import { sound } from '@/utils/sound'
import { formatCurrency } from '@/utils/formatters'

interface POSTransferPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onConfirmPayment: (details: TransferPaymentDetails) => void
}

const STORE_BANK_ACCOUNTS = [
  {
    id: 'aba',
    bank_name: 'ABA Bank',
    account_number: '001 234 567',
    account_name: 'DIGITALPC MARKET',
    badge: 'ABA',
    color: 'bg-cyan-600 text-white',
  },
  {
    id: 'acleda',
    bank_name: 'ACLEDA Bank',
    account_number: '0100 2233 4455',
    account_name: 'ENTERPRISE POS MARKET',
    badge: 'ACL',
    color: 'bg-amber-600 text-white',
  },
  {
    id: 'canadia',
    bank_name: 'Canadia Bank',
    account_number: '002 9988 7766',
    account_name: 'ENTERPRISE POS MARKET',
    badge: 'CAN',
    color: 'bg-rose-600 text-white',
  },
  {
    id: 'wing',
    bank_name: 'Wing Bank',
    account_number: '099 888 777',
    account_name: 'ENTERPRISE POS MARKET',
    badge: 'WNG',
    color: 'bg-emerald-600 text-white',
  },
]

export const POSTransferPaymentModal: React.FC<POSTransferPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onConfirmPayment,
}) => {
  const { t } = useTranslation(['pos', 'common'])

  const [selectedBankId, setSelectedBankId] = useState<string>('aba')
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState<boolean>(false)
  const [txnReference, setTxnReference] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)

  const activeAccount = STORE_BANK_ACCOUNTS.find(b => b.id === selectedBankId) || STORE_BANK_ACCOUNTS[0]

  useEffect(() => {
    if (isOpen) {
      setTxnReference('')
      setErrorMsg('')
      setCopied(false)
      setIsBankDropdownOpen(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCopyAccount = () => {
    sound.playClick()
    navigator.clipboard.writeText(activeAccount.account_number.replace(/\s+/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedRef = txnReference.trim()

    if (!trimmedRef) {
      sound.playError()
      setErrorMsg(t('txnReferenceRequired', 'Please enter the Transaction Reference ID (4 to 6 digits) from the transfer receipt.'))
      return
    }

    sound.playSuccess()
    setErrorMsg('')
    onConfirmPayment({
      bank_name: activeAccount.bank_name,
      account_number: activeAccount.account_number.replace(/\s+/g, ''),
      account_name: activeAccount.account_name,
      txn_reference: trimmedRef,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border/90 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground leading-tight">
                {t('transferPaymentTitle', 'Manual Bank Transfer')}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {t('transferPaymentDesc', 'Direct transfer verification or Telegram receipt fallback')}
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
            <span className="text-xs text-muted-foreground font-medium block">{t('totalPayableAmount', 'Total Payable Amount')}</span>
            <div className="text-3xl font-black text-primary tracking-tight">{formatCurrency(amount)}</div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-primary/20">
              <ShieldCheck size={11} /> {t('manualVerify', 'Manual Verify')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Select Bank Account Modern Custom Dropdown Component */}
          <div className="relative space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Building2 size={14} className="text-primary" />
              <span>{t('selectStoreBankAccount', 'Select Store Bank Account')} *</span>
            </label>
            
            {/* Custom Trigger Button */}
            <button
              type="button"
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
              className="w-full bg-card border border-border/80 hover:border-primary/60 rounded-2xl py-2.5 px-3.5 flex items-center justify-between transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-xl font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs ${activeAccount.color}`}>
                  {activeAccount.badge}
                </span>
                <span className="font-bold text-xs text-foreground">{activeAccount.bank_name} — {activeAccount.account_number}</span>
              </div>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isBankDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {/* Custom Popover Dropdown Menu */}
            {isBankDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsBankDropdownOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border/90 rounded-2xl shadow-xl p-1.5 z-20 space-y-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  {STORE_BANK_ACCOUNTS.map((acc) => {
                    const isSelected = selectedBankId === acc.id
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedBankId(acc.id)
                          setIsBankDropdownOpen(false)
                        }}
                        className={`w-full py-2 px-3 rounded-xl flex items-center justify-between transition-all text-xs font-semibold cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg font-black text-[9px] flex items-center justify-center shrink-0 ${acc.color}`}>
                            {acc.badge}
                          </span>
                          <span>{acc.bank_name} — {acc.account_number}</span>
                        </div>
                        {isSelected && <Check size={15} className="text-primary" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Account Detail Display Box with Copy Button */}
          <div className="p-3.5 bg-card border border-border/80 rounded-2xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{t('accountName', 'Account Name:')}</span>
              <span className="font-extrabold text-foreground">{activeAccount.account_name}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
              <div>
                <span className="text-[10px] text-muted-foreground block">{t('accountNumber', 'Account Number:')}</span>
                <span className="text-base font-black tracking-wider text-primary">{activeAccount.account_number}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="py-1.5 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? t('copied', 'Copied!') : t('copyAccount', 'Copy Number')}</span>
              </button>
            </div>
          </div>

          {/* Txn Reference ID Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Hash size={14} className="text-amber-500 shrink-0" />
                <span>{t('txnReferenceLabel', 'Txn Reference ID')} *</span>
              </label>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap shrink-0">
                {t('mandatoryVerification', 'Mandatory Verification')}
              </span>
            </div>

            <input
              type="text"
              value={txnReference}
              onChange={(e) => {
                setTxnReference(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              placeholder={t('txnReferencePlaceholder', 'e.g. 894312')}
              className={`form-input text-xs font-semibold py-2.5 px-3.5 rounded-2xl border w-full transition-all ${
                errorMsg ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/5' : 'border-border/80 focus:border-primary focus:bg-card'
              }`}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground leading-tight">
              {t('txnReferenceTip', 'Check customer mobile app transfer slip or Telegram screenshot for transaction ID.')}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium animate-in fade-in">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-black text-xs text-primary-foreground bg-primary hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <CheckCircle2 size={16} />
              <span>{t('confirmTransferPayment', 'Confirm Bank Transfer Payment')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
