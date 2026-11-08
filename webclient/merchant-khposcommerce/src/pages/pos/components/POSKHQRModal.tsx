import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  QrCode,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { QRCode } from 'antd'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'
import { useToast } from '@/hooks/useToast'
import {
  generateKHQR,
  checkTransactionStatus,
  getBakongConfig,
  type GeneratedKHQR,
} from '@/services/bakongService'

interface POSKHQRModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  referenceNo: string
  onPaymentSuccess: () => void
}

export const POSKHQRModal: React.FC<POSKHQRModalProps> = ({
  isOpen,
  onClose,
  amount,
  referenceNo,
  onPaymentSuccess,
}) => {
  const { t } = useTranslation(['pos', 'common'])
  const toast = useToast()
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes standard countdown
  const [isSuccess, setIsSuccess] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [payerInfo, setPayerInfo] = useState<any>(null)

  // KHQR State
  const [khqrData, setKhqrData] = useState<GeneratedKHQR | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  const [merchantName, setMerchantName] = useState('')

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollCountRef = useRef<number>(0)
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load current Bakong configuration on open
  useEffect(() => {
    if (!isOpen) return
    const cfg = getBakongConfig()
    setMerchantName(cfg.merchantName || 'SAK OUSA')
    setIsSuccess(false)
    setIsExpired(false)
    setPayerInfo(null)
    setErrorText(null)
    setTimeLeft(180) // 3 mins real countdown
    pollCountRef.current = 0

    // Generate real Bakong KHQR
    let isMounted = true
    setIsGenerating(true)

    generateKHQR({
      amount,
      currency: 'USD',
      billNumber: referenceNo,
    })
      .then((data) => {
        if (isMounted) {
          setKhqrData(data)
          setIsGenerating(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          const errMsg = t('khqrGenerationFailed', 'Failed to generate QR Code')
          setErrorText(errMsg)
          setIsGenerating(false)
          toast.error(errMsg)
        }
      })

    return () => {
      isMounted = false
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
    }
  }, [isOpen, amount, referenceNo, t, toast])

  // Real Countdown timer with automatic expiration & auto-close
  useEffect(() => {
    if (!isOpen || isSuccess || isExpired) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, isSuccess, isExpired])

  // Expiration handler: stops polling, plays alert sound, displays expired state, and auto-closes
  const handleExpire = () => {
    setIsExpired(true)
    if (pollingRef.current) clearInterval(pollingRef.current)
    sound.playWarning()
    toast.warning(t('khqrExpiredNotice', 'Code KHQR expired! The transaction has been automatically closed.'))

    // Automatically close the modal after 1.6 seconds
    autoCloseTimerRef.current = setTimeout(() => {
      onClose()
    }, 1600)
  }

  // Real-time Polling against Bakong Open API
  useEffect(() => {
    if (!isOpen || !khqrData?.md5 || isSuccess || isExpired) {
      if (pollingRef.current) clearInterval(pollingRef.current)
      return
    }

    const pollInterval = setInterval(async () => {
      pollCountRef.current += 1

      try {
        const result = await checkTransactionStatus(khqrData.md5)

        if (result.is_paid) {
          clearInterval(pollInterval)
          setIsSuccess(true)
          setPayerInfo(result.data)
          sound.playSuccess()
          toast.success(t('khqrPaymentSuccessNotice', 'Payment completed successfully!'))

          // Automatically complete payment after 1.5s
          setTimeout(() => {
            onPaymentSuccess()
          }, 1500)
        }
      } catch (pollErr) {
        console.warn('Bakong polling error:', pollErr)
      }
    }, 2500)

    pollingRef.current = pollInterval

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [isOpen, khqrData?.md5, isSuccess, isExpired, onPaymentSuccess])

  // Close modal on ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const mins = Math.floor(timeLeft / 60)
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border/90 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left cursor-default"
      >

        {/* 1. Header (Standard POS Modal Header matching Project) */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-500">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground leading-tight">
                {t('bakongKhqrPayment', 'Bakong KHQR Payment')}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {t('scanKhqrDesc', 'Scan QR Code with Mobile Banking App (ABA, ACLEDA, Wing, Bakong...)')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live Countdown Badge */}
            <div className="px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-xs font-mono font-bold flex items-center gap-1.5 border border-border/60">
              <Clock size={12} className={timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-amber-500'} />
              <span className={timeLeft < 30 ? 'text-red-600 dark:text-red-400' : ''}>
                {mins}:{secs}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title={`${t('common:close', 'បិទ')} (Esc)`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 3. Authentic KHQR Ticket Display (Center-framed, Clean, Readable) */}
        <div
          id="pos-khqr-card-container"
          className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm max-w-[310px] mx-auto overflow-hidden text-center"
        >
          {/* Top Red KHQR Header Bar with Official 45° Tag Notch on Bottom-Right */}
          <div
            className="h-11 bg-[#E1251B] flex items-center justify-center relative select-none"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, calc(100% - 18px) calc(100% - 11px), 0 calc(100% - 11px))',
            }}
          >
            <div className="flex items-center justify-center text-white pb-2">
              <span className="font-black text-[16px] tracking-widest font-sans">
                KHQR
              </span>
            </div>
          </div>

          {/* Merchant & Amount Info (Left-aligned) */}
          <div className="px-5 pt-3 pb-1 text-left">
            <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 block truncate">
              {merchantName || 'SAK OUSA'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[26px] font-black text-gray-900 dark:text-white tracking-tight leading-none">
                {amount.toFixed(2)}
              </span>
              <span className="text-[11px] font-bold text-gray-600 dark:text-zinc-400 uppercase">
                USD
              </span>
            </div>
          </div>

          {/* Perforated Receipt Divider with Circular Cutouts */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-card border border-border/80" />
            <div className="w-full mx-4 border-b border-dashed border-gray-300 dark:border-zinc-700" />
            <div className="absolute -right-2.5 w-5 h-5 rounded-full bg-card border border-border/80" />
          </div>

          {/* QR Code Canvas Section */}
          <div className="px-4 pt-0.5 pb-4 flex flex-col items-center justify-center min-h-[185px] relative">
            {isSuccess ? (
              <div className="w-44 h-44 flex flex-col items-center justify-center gap-2 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-600 animate-in zoom-in-95 duration-200">
                <CheckCircle2 size={42} className="animate-bounce" />
                <div className="text-center">
                  <span className="font-black text-sm block">{t('khqrPaymentSuccess', 'Payment Completed!')}</span>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    {payerInfo?.fromAccountId
                      ? `${t('khqrFromAccount', 'From')}: ${payerInfo.fromAccountId}`
                      : t('khqrBakongVerified', 'Bakong Transaction Verified')}
                  </span>
                </div>
              </div>
            ) : isExpired ? (
              <div className="w-44 h-44 flex flex-col items-center justify-center gap-2.5 p-4 bg-red-500/10 rounded-2xl border border-red-500/30 text-red-600 animate-in zoom-in-95">
                <AlertCircle size={40} className="animate-pulse" />
                <div className="text-center">
                  <span className="font-black text-sm block">{t('khqrCodeExpired', 'QR Code Expired!')}</span>
                  <span className="text-[11px] font-medium text-red-700 dark:text-red-300 block">
                    {t('khqrAutoClosing', 'Closing automatically...')}
                  </span>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="w-44 h-44 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-zinc-800/40 rounded-2xl border border-border/40">
                <RefreshCw size={22} className="animate-spin text-primary" />
                <span className="text-xs text-muted-foreground font-medium">
                  {t('khqrGenerating', 'Generating QR Code...')}
                </span>
              </div>
            ) : errorText ? (
              <div className="w-44 h-44 flex flex-col items-center justify-center gap-2 p-3 bg-rose-500/10 rounded-2xl border border-rose-500/30 text-rose-600">
                <span className="text-xs font-bold text-center">{errorText}</span>
              </div>
            ) : (
              <div className="p-1 bg-white rounded-xl">
                <QRCode
                  value={khqrData?.qr || referenceNo}
                  size={168}
                  bordered={false}
                  errorLevel="M"
                />
              </div>
            )}
          </div>

          {/* Ticket Footer (Scan to Pay Instruction) */}
          <div className="pb-3 px-4 text-center">
            <div className="text-[10px] text-gray-400">
              {t('khqrScanInstruction', 'Scan with Bakong App or any Mobile Banking App supporting KHQR')}
            </div>
          </div>
        </div>

        {/* Live Real-Time Status */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium pt-1 text-center">
          {isSuccess ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold animate-in fade-in">
              <CheckCircle2 size={15} />
              <span>{t('khqrPaymentSuccess', 'Payment Completed!')}</span>
            </span>
          ) : isExpired ? (
            <span className="text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold animate-in fade-in">
              <AlertCircle size={15} />
              <span>{t('khqrCodeExpired', 'QR Code Expired!')}</span>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
              <span>{t('khqrWaitingScan', 'Waiting for customer to scan and pay...')}</span>
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

export default POSKHQRModal
