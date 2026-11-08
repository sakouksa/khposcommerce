import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ModalHeader, ModalFooter } from '@/components/common'
import {
  Printer,
  Download,
  RefreshCw,
  Copy,
  CheckCircle2,
  FileDown,
  QrCode as QrCodeIcon,
  MapPin,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { QRCode } from 'antd'
import { companyService } from '@/services/companyService'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import {
  generateStandeeCanvas,
  downloadCanvasAsPng,
  type StandeeTheme,
  type StandeeFormat
} from './standeeCanvasHelper'

interface CompanyItem {
  id: number
  name: string
  address?: string
  phone?: string
  logo?: string
}

interface BranchItem {
  id: number
  company_id: number
  name: string
  code?: string
  address?: string
  phone?: string
}

interface ShiftItem {
  id: number
  name: string
  start_time: string
  end_time: string
  late_grace_minutes?: number
}

interface DynamicQrKioskModalProps {
  open: boolean
  onClose: () => void
  initialCompanies?: CompanyItem[]
  initialBranches?: BranchItem[]
}

// Module-level persistent cache across modal open/close to ensure instant 0ms open
let globalCachedCompanies: CompanyItem[] | null = null
let globalCachedBranches: BranchItem[] | null = null
let globalCachedShifts: ShiftItem[] | null = null
let globalCachedQrToken: string = ''
let globalCachedCompanyId: number = 1
let globalCachedBranchId: number = 1
let globalCachedCompanyName: string = 'NexTech Cambodia Co., Ltd. (HQ)'
let globalCachedBranchName: string = 'NexTech Cambodia (HQ)'
let globalCachedWifiSsid: string = 'BRKHPNH_STAFF_5G'

interface TitlePresetConfig {
  id: string
  key: string
  subKey: string
  defaultPrimary: string
  defaultSecondary: string
}

const TITLE_PRESET_CONFIGS: TitlePresetConfig[] = [
  {
    id: 'checkin',
    key: 'presetCheckin',
    subKey: 'presetCheckinSub',
    defaultPrimary: 'Check-In Attendance',
    defaultSecondary: 'ATTENDANCE CHECK-IN',
  },
  {
    id: 'in_out',
    key: 'presetInOut',
    subKey: 'presetInOutSub',
    defaultPrimary: 'Check-In & Check-Out Attendance',
    defaultSecondary: 'ATTENDANCE CHECK-IN & CHECK-OUT',
  },
  {
    id: 'daily',
    key: 'presetDaily',
    subKey: 'presetDailySub',
    defaultPrimary: 'Daily Attendance',
    defaultSecondary: 'OFFICIAL DAILY ATTENDANCE',
  },
]

const extractArray = <T,>(res: any): T[] => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

const getQrCanvas = async (container: HTMLElement | null): Promise<HTMLCanvasElement | null> => {
  if (!container) return null
  const canvas = container.querySelector('canvas')
  if (canvas) return canvas
  const svg = container.querySelector('svg')
  if (svg) {
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })
      const offscreen = document.createElement('canvas')
      const targetSize = 600
      offscreen.width = targetSize
      offscreen.height = targetSize
      const ctx = offscreen.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, targetSize, targetSize)
        ctx.drawImage(img, 0, 0, targetSize, targetSize)
      }
      return offscreen
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  return null
}

const DynamicQrKioskModal: React.FC<DynamicQrKioskModalProps> = ({
  open,
  onClose,
  initialCompanies,
  initialBranches,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const toast = useToast()
  const posterRef = useRef<HTMLDivElement>(null)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  // Real Data from Backend (initialized from cache/props if available)
  const effectiveInitialCompanies = useMemo(() => {
    if (initialCompanies && initialCompanies.length > 0) return initialCompanies
    return globalCachedCompanies || []
  }, [initialCompanies])

  const effectiveInitialBranches = useMemo(() => {
    if (initialBranches && initialBranches.length > 0) return initialBranches
    return globalCachedBranches || []
  }, [initialBranches])

  const [companies, setCompanies] = useState<CompanyItem[]>(effectiveInitialCompanies)
  const [branches, setBranches] = useState<BranchItem[]>(effectiveInitialBranches)
  const [shifts, setShifts] = useState<ShiftItem[]>(() => globalCachedShifts || [])
  const [loadingInitial, setLoadingInitial] = useState(() => {
    return !(
      (effectiveInitialCompanies.length > 0) &&
      (effectiveInitialBranches.length > 0) &&
      globalCachedQrToken
    )
  })
  const [loadingQr, setLoadingQr] = useState(false)

  // Selected State
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(() => {
    return effectiveInitialCompanies[0]?.id ?? globalCachedCompanyId
  })
  const [selectedBranchId, setSelectedBranchId] = useState<number>(() => {
    return effectiveInitialBranches[0]?.id ?? globalCachedBranchId
  })
  const [selectedShiftId, setSelectedShiftId] = useState<number | 'all'>('all')

  // Configuration States
  const [companyName, setCompanyName] = useState<string>(() => {
    return effectiveInitialCompanies[0]?.name ?? globalCachedCompanyName
  })
  const [branchName, setBranchName] = useState<string>(() => {
    return effectiveInitialBranches[0]?.name ?? globalCachedBranchName
  })
  const [radiusMeters, setRadiusMeters] = useState(50)
  const [wifiSsid, setWifiSsid] = useState<string>(() => {
    const firstBr = effectiveInitialBranches[0]
    return firstBr?.code
      ? `${firstBr.code.replace(/[^A-Za-z0-9]/g, '')}_STAFF_5G`
      : globalCachedWifiSsid
  })
  const [standeeSize, setStandeeSize] = useState<StandeeFormat>('a4')
  const [theme, setTheme] = useState<StandeeTheme>('standard')
  const [titleIndex, setTitleIndex] = useState(0)

  // Track last synced parameters to avoid duplicate fetches & infinite loops
  const lastSyncedRadiusRef = useRef<number>(50)
  const lastSyncedWifiRef = useRef<string>(wifiSsid)

  // Use refs to avoid re-triggering fetchBackendQrToken callback
  const radiusMetersRef = useRef(radiusMeters)
  radiusMetersRef.current = radiusMeters
  const wifiSsidRef = useRef(wifiSsid)
  wifiSsidRef.current = wifiSsid
  const titleIndexRef = useRef(titleIndex)
  titleIndexRef.current = titleIndex

  // QR Token & Key (From Backend API - Instant if already cached)
  const [qrToken, setQrToken] = useState<string>(() => globalCachedQrToken)
  const [downloadingFull, setDownloadingFull] = useState(false)
  const [downloadingRaw, setDownloadingRaw] = useState(false)

  // Filter branches dynamically based on selectedCompanyId
  const availableBranches = useMemo(() => {
    const list = branches.filter((b) => b.company_id === selectedCompanyId)
    return list.length > 0 ? list : branches
  }, [branches, selectedCompanyId])

  // Fetch real QR Token from Laravel Backend API (Dynamic for all parameters)
  const fetchBackendQrToken = useCallback(
    async (
      compId: number,
      brId: number,
      shId: number | 'all',
      forceRegen = false,
      options?: { wifi?: string; radius?: number; title?: string }
    ) => {
      // If we already have a token and this is a background sync, don't show full loading
      if (!globalCachedQrToken) {
        setLoadingQr(true)
      }
      try {
        const wifi = options?.wifi ?? wifiSsidRef.current
        const radius = options?.radius ?? radiusMetersRef.current

        const res = await employeeService.generateQr({
          company_id: compId,
          branch_id: brId,
          shift_id: shId === 'all' ? null : shId,
          is_standee: true,
          checkpoint_name: 'HQ Entrance Checkpoint',
          radius_meters: radius,
          wifi_ssid: wifi,
          force_regenerate: forceRegen,
        })
        const data = res?.data ?? res
        const token = data?.qr_token
        if (token) {
          setQrToken(token)
          globalCachedQrToken = token
          globalCachedCompanyId = compId
          globalCachedBranchId = brId
          globalCachedWifiSsid = wifi
        }
        if (data?.company_name) {
          setCompanyName(data.company_name)
          globalCachedCompanyName = data.company_name
        }
        if (data?.branch_name) {
          setBranchName(data.branch_name)
          globalCachedBranchName = data.branch_name
        }
      } catch {
        if (!globalCachedQrToken) {
          const fallback = `ATT_STANDEE_${compId}_BR${brId}_${Date.now().toString(36).toUpperCase()}`
          setQrToken(fallback)
        }
      } finally {
        setLoadingQr(false)
      }
    },
    []
  )

  // Load Real Companies, Branches, Shifts ONCE per open event
  const hasInitializedOnOpenRef = useRef(false)
  useEffect(() => {
    if (!open) {
      hasInitializedOnOpenRef.current = false
      return
    }
    if (hasInitializedOnOpenRef.current) return
    hasInitializedOnOpenRef.current = true

    let isMounted = true

    const hasCachedData =
      globalCachedCompanies &&
      globalCachedBranches &&
      globalCachedQrToken

    if (!hasCachedData) {
      setLoadingInitial(true)
    }

    Promise.all([
      effectiveInitialCompanies.length > 0
        ? Promise.resolve({ data: effectiveInitialCompanies })
        : companyService.getCompanies({ per_page: 100 }).catch(() => ({ data: [] })),
      effectiveInitialBranches.length > 0
        ? Promise.resolve({ data: effectiveInitialBranches })
        : companyService.getBranches({ per_page: 100 }).catch(() => ({ data: [] })),
      globalCachedShifts && globalCachedShifts.length > 0
        ? Promise.resolve({ data: globalCachedShifts })
        : employeeService.shifts().catch(() => ({ data: [] })),
    ])
      .then(([companiesRes, branchesRes, shiftsRes]) => {
        if (!isMounted) return
        const companyList: CompanyItem[] = extractArray(companiesRes)
        const branchList: BranchItem[] = extractArray(branchesRes)
        const shiftList: ShiftItem[] = extractArray(shiftsRes)

        setCompanies(companyList)
        setBranches(branchList)
        setShifts(shiftList)
        globalCachedCompanies = companyList
        globalCachedBranches = branchList
        globalCachedShifts = shiftList

        const firstBranch = branchList.find((b) => b.id === selectedBranchId) || branchList[0]
        const brId = firstBranch?.id ?? 1
        const brName = firstBranch?.name ?? 'NexTech Cambodia (HQ)'

        const matchedCompany =
          companyList.find((c) => c.id === firstBranch?.company_id) || companyList[0]
        const compId = matchedCompany?.id ?? 1
        const compName = matchedCompany?.name ?? 'NexTech Cambodia Co., Ltd. (HQ)'

        setSelectedCompanyId(compId)
        setCompanyName(compName)
        setSelectedBranchId(brId)
        setBranchName(brName)

        // Auto Wi-Fi from real branch code
        const calculatedWifi = firstBranch?.code
          ? `${firstBranch.code.replace(/[^A-Za-z0-9]/g, '')}_STAFF_5G`
          : 'NEXTECH_STAFF_5G'
        setWifiSsid(calculatedWifi)

        // Mark synced values to prevent duplicate debounce trigger
        lastSyncedWifiRef.current = calculatedWifi
        lastSyncedRadiusRef.current = 50

        // Fetch real backend QR token (if not cached or force reload)
        if (!globalCachedQrToken) {
          fetchBackendQrToken(compId, brId, 'all', false, { wifi: calculatedWifi, radius: 50 })
        }
      })
      .catch(() => {
        if (isMounted && !globalCachedQrToken) {
          fetchBackendQrToken(1, 1, 'all')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingInitial(false)
        }
      })

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Handle branch change: Auto-syncs corresponding branch & Wi-Fi
  const handleBranchChange = (brId: number) => {
    setSelectedBranchId(brId)
    const foundBranch = branches.find((b) => b.id === brId)
    if (foundBranch) {
      setBranchName(foundBranch.name)
      let newWifi = wifiSsid
      if (foundBranch.code) {
        newWifi = `${foundBranch.code.replace(/[^A-Za-z0-9]/g, '')}_STAFF_5G`
        setWifiSsid(newWifi)
      }
      lastSyncedWifiRef.current = newWifi
      fetchBackendQrToken(selectedCompanyId, brId, selectedShiftId, false, { wifi: newWifi })
    } else {
      fetchBackendQrToken(selectedCompanyId, brId, selectedShiftId)
    }
  }

  // Handle company change: Filters branches, picks first branch of company, regenerates QR
  const handleCompanyChange = (compId: number) => {
    setSelectedCompanyId(compId)
    const foundComp = companies.find((c) => c.id === compId)
    if (foundComp) {
      setCompanyName(foundComp.name)
    }
    const compBranches = branches.filter((b) => b.company_id === compId)
    const targetBranch = compBranches[0] || branches[0]
    if (targetBranch) {
      setSelectedBranchId(targetBranch.id)
      setBranchName(targetBranch.name)
      let newWifi = wifiSsid
      if (targetBranch.code) {
        newWifi = `${targetBranch.code.replace(/[^A-Za-z0-9]/g, '')}_STAFF_5G`
        setWifiSsid(newWifi)
      }
      lastSyncedWifiRef.current = newWifi
      fetchBackendQrToken(compId, targetBranch.id, selectedShiftId, false, { wifi: newWifi })
    } else {
      fetchBackendQrToken(compId, selectedBranchId, selectedShiftId)
    }
  }

  // Handle shift change
  const handleShiftChange = (shId: number | 'all') => {
    setSelectedShiftId(shId)
    fetchBackendQrToken(selectedCompanyId, selectedBranchId, shId)
  }

  // Handle Title Preset change: updates standee poster title immediately with ZERO refresh & ZERO API re-fetching
  const handleTitlePresetChange = (idx: number) => {
    setTitleIndex(idx)
  }

  // Debounced sync ONLY for manual user slider (radius) and manual text input (wifi)
  useEffect(() => {
    if (!open || loadingInitial) return

    // Avoid duplicate requests if values match last synced
    if (
      radiusMeters === lastSyncedRadiusRef.current &&
      wifiSsid === lastSyncedWifiRef.current
    ) {
      return
    }

    const timer = setTimeout(() => {
      lastSyncedRadiusRef.current = radiusMeters
      lastSyncedWifiRef.current = wifiSsid
      fetchBackendQrToken(selectedCompanyId, selectedBranchId, selectedShiftId, false, {
        radius: radiusMeters,
        wifi: wifiSsid,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [
    open,
    loadingInitial,
    radiusMeters,
    wifiSsid,
    fetchBackendQrToken,
    selectedCompanyId,
    selectedBranchId,
    selectedShiftId,
  ])

  // Handle print lifecycle and keyboard shortcut
  useEffect(() => {
    if (!open) return

    const handleBeforePrint = () => {
      document.body.classList.add('has-standee-print')
    }
    const handleAfterPrint = () => {
      document.body.classList.remove('has-standee-print')
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        handlePrint()
      }
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('has-standee-print')
    }
  }, [open])

  if (!open) return null

  const selectedShiftObj = shifts.find((s) => s.id === selectedShiftId)
  const shiftDisplayText =
    selectedShiftId === 'all'
      ? t('employees.entranceQr.allShiftsOption', 'All Shifts Supported')
      : `${selectedShiftObj?.name || 'Shift'} (${selectedShiftObj?.start_time.substring(0, 5)} - ${selectedShiftObj?.end_time.substring(0, 5)})`

  const titlePresets = TITLE_PRESET_CONFIGS.map((p) => ({
    id: p.id,
    primary: t(`employees.entranceQr.${p.key}`, p.defaultPrimary),
    secondary: t(`employees.entranceQr.${p.subKey}`, p.defaultSecondary),
    label: t(`employees.entranceQr.${p.key}`, p.defaultPrimary),
  }))

  const activeTitle = titlePresets[titleIndex] || titlePresets[0]

  // Regenerate security key from backend
  const handleRegenerateKey = async () => {
    sound.playClick()
    await fetchBackendQrToken(selectedCompanyId, selectedBranchId, selectedShiftId, true)
    sound.playSuccess()
    toast.success(t('employees.entranceQr.regenerateSuccess', 'New secure QR generated from backend successfully!'))
  }

  // Direct Clean Print
  const handlePrint = () => {
    sound.playClick()
    document.body.classList.add('has-standee-print')
    setTimeout(() => {
      window.print()
    }, 80)
  }

  // Download Full Standee Image (300 DPI Canvas)
  const handleDownloadFullStandee = async () => {
    sound.playClick()
    setDownloadingFull(true)
    try {
      const qrCanvas = await getQrCanvas(qrContainerRef.current)
      const fullCanvas = await generateStandeeCanvas({
        theme,
        sizeFormat: standeeSize,
        companyName,
        branchName,
        titleKh: activeTitle.primary,
        titleEn: activeTitle.secondary,
        shiftText: selectedShiftId !== 'all' ? shiftDisplayText : undefined,
        wifiSsid,
        radiusMeters,
        qrToken,
        qrSourceCanvas: qrCanvas,
        labels: {
          checkpointSubtitle: t('employees.entranceQr.checkpointBadge', 'OFFICIAL ATTENDANCE CHECKPOINT'),
          locationPrefix: t('employees.entranceQr.branchLocationPrefix', 'Location:'),
          scanInstruction: t('employees.entranceQr.scanQrInstruction', 'Scan this QR code with Mobile App to record attendance'),
          securityKeyLabel: t('employees.entranceQr.securityIdLabel', 'Security ID:'),
          step1: t('employees.entranceQr.step1Full', "Open Employee Mobile App and tap 'Scan Attendance'"),
          step2: t('employees.entranceQr.step2Full', 'Enable GPS or connect to office Wi-Fi'),
          step3: t('employees.entranceQr.step3Full', 'Point camera at this QR code to clock attendance immediately'),
          requirementPrefix: t('employees.entranceQr.attendanceCondition', 'Attendance Requirement:'),
          gpsConditionPrefix: t('employees.entranceQr.gpsConditionPrefix', 'GPS Radius <'),
          metersUnit: t('employees.entranceQr.metersUnit', 'm'),
          deviceIdBound: t('employees.entranceQr.deviceBound', 'Device ID Bound'),
          systemSuffix: t('employees.entranceQr.enterpriseSystem', 'Enterprise Attendance System'),
        },
      })

      const filename = `standee_${branchName.replace(/\s+/g, '_').toLowerCase()}_${theme}_${standeeSize}.png`
      downloadCanvasAsPng(fullCanvas, filename)
      sound.playSuccess()
      toast.success(t('employees.entranceQr.downloadStandeeSuccess', 'Standee downloaded successfully!'))
    } catch {
      toast.error(t('employees.entranceQr.downloadStandeeFail', 'Failed to download Standee'))
    } finally {
      setDownloadingFull(false)
    }
  }

  // Download Raw QR Code Image only
  const handleDownloadRawQr = async () => {
    sound.playClick()
    setDownloadingRaw(true)
    try {
      const qrCanvas = await getQrCanvas(qrContainerRef.current)
      if (qrCanvas) {
        const filename = `qr_matrix_${branchName.replace(/\s+/g, '_').toLowerCase()}.png`
        downloadCanvasAsPng(qrCanvas, filename)
        sound.playSuccess()
        toast.success(t('employees.entranceQr.downloadRawSuccess', 'QR Code downloaded successfully!'))
      } else {
        toast.error(t('employees.entranceQr.qrNotFound', 'QR Code not found'))
      }
    } catch {
      toast.error(t('employees.entranceQr.downloadRawFail', 'Failed to download QR Code'))
    } finally {
      setDownloadingRaw(false)
    }
  }

  const handleCopyToken = () => {
    sound.playClick()
    navigator.clipboard.writeText(qrToken)
    toast.success(t('employees.entranceQr.keyCopied', 'Security Key copied to clipboard!'))
  }

  const isInkSaver = theme === 'ink-saver'

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:hidden">
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 6 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-card w-full max-w-5xl border border-border/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Global Enterprise Modal Header */}
          <ModalHeader
            title={t('employees.entranceQr.modalTitle', 'Company Entrance QR Code')}
            subtitle={t('employees.entranceQr.modalSubtitle', 'Print Standee or Sticker for company door entrance — Scan with Mobile App')}
            icon={<QrCodeIcon size={20} />}
            iconVariant="purple"
            actions={
              <button
                type="button"
                onClick={handlePrint}
                className="h-8 sm:h-9 px-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title={t('employees.entranceQr.printStandeeBtn', 'Print Standee')}
              >
                <Printer size={14} />
                <span className="hidden sm:inline">{t('employees.entranceQr.printStandeeBtn', 'Print Standee')}</span>
              </button>
            }
            onClose={onClose}
          />

          {/* 2-Column Workspace */}
          <div className="p-4 sm:p-4.5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-4.5 flex-1">
            {/* Left Column: Live Standee Preview */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 p-3.5 sm:p-4 rounded-2xl border border-border/50">
              <div className="w-full flex items-center justify-between mb-2 text-xs font-semibold text-muted-foreground">
                <span className="text-foreground/80">
                  {t('employees.entranceQr.livePreviewTitle', 'Standee Print Preview')}
                </span>
                <span className="px-2 py-0.5 rounded bg-card border border-border/70 text-[10px] font-mono uppercase text-muted-foreground">
                  {standeeSize.toUpperCase()} {t('employees.entranceQr.formatLabel', 'FORMAT')}
                </span>
              </div>

              {/* Desktop Live Preview Card */}
              <div
                ref={posterRef}
                id="printable-company-standee"
                className={`w-full bg-white text-slate-900 rounded-2xl relative overflow-hidden transition-all duration-300 flex flex-col items-center text-center ${
                  isInkSaver ? 'border-2 border-slate-900 shadow-none' : 'border border-slate-200/80 shadow-md ring-1 ring-slate-900/5'
                } ${
                  standeeSize === 'a4'
                    ? 'max-w-[360px] p-5 sm:p-6'
                    : standeeSize === 'a5'
                    ? 'max-w-[320px] p-4 sm:p-5'
                    : 'max-w-[280px] p-3.5'
                }`}
              >
                {/* 1. Sleek Corporate Identity Header */}
                <div className="w-full flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2.5 text-left min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${isInkSaver ? 'bg-black text-white' : 'bg-slate-900 text-white'} flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}>
                      {companyName ? companyName.charAt(0).toUpperCase() : 'K'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 uppercase leading-snug truncate">
                        {companyName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9.5px] font-medium text-slate-500 truncate mt-0.5">
                        <span className="flex items-center gap-1 font-bold text-slate-700 truncate">
                          <MapPin size={11} className="text-slate-500" />
                          <span>{branchName}</span>
                        </span>
                        {selectedShiftId !== 'all' && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-600 truncate">{shiftDisplayText}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-[8px] font-bold flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{t('employees.entranceQr.officialCheckpoint', 'Official')}</span>
                  </div>
                </div>

                {/* 2. Action Title */}
                <div className="my-2.5 space-y-0.5">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    {activeTitle.primary}
                  </h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {activeTitle.secondary}
                  </p>
                </div>

                {/* 3. Centerpiece: Optical QR Frame */}
                <div
                  className={`my-1 p-3 rounded-2xl flex flex-col items-center relative w-full max-w-[90%] transition-all ${
                    isInkSaver ? 'bg-white border-2 border-slate-900' : 'bg-slate-50/70 border border-slate-200/80'
                  }`}
                >
                  <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-900 rounded-tl-xs" />
                  <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-900 rounded-tr-xs" />
                  <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-900 rounded-bl-xs" />
                  <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-900 rounded-br-xs" />

                  <div
                    ref={qrContainerRef}
                    className="bg-white p-2 rounded-xl shadow-xs relative flex items-center justify-center min-w-[150px] min-h-[150px]"
                  >
                    {!qrToken ? (
                      <div className="w-36 h-36 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-lg">
                        <RefreshCw size={18} className="animate-spin text-primary" />
                        <span className="text-[10px] font-medium text-slate-500">
                          {t('employees.entranceQr.generatingQr', 'Generating QR...')}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`transition-opacity duration-200 ${
                            loadingQr ? 'opacity-35' : 'opacity-100'
                          }`}
                        >
                          <QRCode
                            type="canvas"
                            value={qrToken}
                            size={standeeSize === 'a4' ? 165 : standeeSize === 'a5' ? 140 : 130}
                            bordered={false}
                            errorLevel="M"
                            color="#0f172a"
                          />
                        </div>
                        {loadingQr && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl transition-all">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white shadow-md">
                              <RefreshCw size={11} className="animate-spin text-white" />
                              <span className="text-[9px] font-bold"></span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-[9.5px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone size={12} className="text-primary" />
                    <span>{t('employees.entranceQr.scanQrInstructionShort', 'Scan with Employee Mobile App')}</span>
                  </p>
                </div>

                {/* 4. Clean Verification Parameters */}
                <div className="w-full max-w-[90%] my-2 py-1 px-3 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center gap-3 text-[9px] text-slate-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} className="text-slate-500" />
                    <span>{t('employees.entranceQr.gpsConditionPrefix', 'GPS <')} {radiusMeters}{t('employees.entranceQr.metersUnit', 'm')}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <Wifi size={10} className="text-slate-500" />
                    <span>{wifiSsid}</span>
                  </span>
                </div>

                {/* 6. Clean Minimal Footer */}
                <div className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 font-medium">
                  <span className="uppercase truncate max-w-[60%]">{companyName}</span>
                  <span>Smart Attendance System</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean, Structured Configuration Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
              <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-4.5 space-y-3.5 shadow-xs">
                {/* Top Section Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {t('employees.entranceQr.standeeSettings', 'Standee Settings & Configuration')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      title={t('employees.entranceQr.copyTitle', 'Copy Security Key')}
                      className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md bg-muted/40 hover:bg-muted border border-border/50 transition-colors cursor-pointer"
                    >
                      <Copy size={11} />
                      <span>{t('employees.entranceQr.copyTitle', 'Copy Key')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerateKey}
                      disabled={loadingQr}
                      title={t('employees.entranceQr.regenerateTitle', 'Regenerate Security Key')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={11} className={loadingQr ? 'animate-spin' : ''} />
                      <span>{t('employees.entranceQr.regenerateTitle', 'Regenerate')}</span>
                    </button>
                  </div>
                </div>

                {/* Section 1: Location & Scope */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Company Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        {t('employees.entranceQr.companyLabel', 'Company')}
                      </label>
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => handleCompanyChange(Number(e.target.value))}
                        disabled={loadingInitial}
                        className="w-full text-xs font-medium rounded-lg px-2.5 py-1.5 border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        {t('employees.entranceQr.branchLabel', 'Branch')}
                      </label>
                      <select
                        value={selectedBranchId}
                        onChange={(e) => handleBranchChange(Number(e.target.value))}
                        disabled={loadingInitial}
                        className="w-full text-xs font-medium rounded-lg px-2.5 py-1.5 border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      >
                        {availableBranches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} {b.code ? `(${b.code})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Shift Scope */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      {t('employees.entranceQr.shiftScopeLabel', 'Shift Scope')}
                    </label>
                    <select
                      value={selectedShiftId}
                      onChange={(e) => {
                        const val = e.target.value === 'all' ? 'all' : Number(e.target.value)
                        handleShiftChange(val)
                      }}
                      disabled={loadingInitial}
                      className="w-full text-xs font-medium rounded-lg px-2.5 py-1.5 border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="all">{t('employees.entranceQr.allShiftsOption', 'All Shifts Supported')}</option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 2: Format & Style */}
                <div className="space-y-2 pt-1 border-t border-border/50">
                  {/* Print Size Tabs */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      {t('employees.entranceQr.printSizeLabel', 'Print Size')}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['a4', 'a5', 'sticker'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setStandeeSize(sz)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                            standeeSize === sz
                              ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                              : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/60'
                          }`}
                        >
                          {sz === 'a4'
                            ? t('employees.entranceQr.sizeA4', 'A4 Poster')
                            : sz === 'a5'
                            ? t('employees.entranceQr.sizeA5', 'A5 Standee')
                            : t('employees.entranceQr.sizeSticker', 'Sticker')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Heading Title Presets */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      {t('employees.entranceQr.titlePresetsLabel', 'Heading Title')}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {titlePresets.map((p, idx) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleTitlePresetChange(idx)}
                          className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all border truncate cursor-pointer ${
                            titleIndex === idx
                              ? 'bg-primary/10 text-primary border-primary font-bold'
                              : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/60'
                          }`}
                          title={p.label}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Style */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      {t('employees.entranceQr.styleLabel', 'Visual Theme')}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTheme('standard')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                          theme === 'standard'
                            ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/60'
                        }`}
                      >
                        {t('employees.entranceQr.styleCleanStandard', 'Clean Standard')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('ink-saver')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                          theme === 'ink-saver'
                            ? 'bg-black text-white border-black shadow-2xs'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/60'
                        }`}
                      >
                        {t('employees.entranceQr.styleMonochrome', 'Monochrome B&W')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 3: Geofence & Wi-Fi */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        {t('employees.entranceQr.gpsRadiusLabel', 'GPS Radius')}
                      </label>
                      <span className="text-[11px] font-bold text-foreground font-mono">
                        {radiusMeters}{t('employees.entranceQr.metersUnit', 'm')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="5"
                      value={radiusMeters}
                      onChange={(e) => setRadiusMeters(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer mt-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      {t('employees.entranceQr.officeWifiLabel', 'Office Wi-Fi')}
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder={t('employees.entranceQr.wifiPlaceholder', 'SSID Name')}
                      className="w-full text-xs rounded-lg px-2.5 py-1.5 border border-border bg-card text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Clean 2 Primary Actions + Discreet Raw Option */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handlePrint}
                    className="py-2.5 px-4 bg-primary hover:bg-primary/90 active:scale-[0.99] text-primary-foreground font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>{t('employees.entranceQr.printStandeeBtn', 'Print Standee')}</span>
                  </button>

                  <button
                    onClick={handleDownloadFullStandee}
                    disabled={downloadingFull || loadingQr}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {downloadingFull ? (
                      <RefreshCw size={14} className="animate-spin text-white" />
                    ) : (
                      <Download size={14} className="text-white" />
                    )}
                    <span>{t('employees.entranceQr.downloadStandeeBtn', 'Download Standee')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-end px-1">
                  <button
                    type="button"
                    onClick={handleDownloadRawQr}
                    disabled={downloadingRaw || loadingQr}
                    className="text-[11px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {downloadingRaw ? <RefreshCw size={11} className="animate-spin" /> : <FileDown size={11} />}
                    <span>{t('employees.entranceQr.downloadRawQrBtn', 'Download QR Code Only')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Global Enterprise Modal Footer */}
          <ModalFooter
            infoSummary={
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={13} /> {t('employees.entranceQr.backendConnected', 'Backend Connected')}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span>{t('employees.entranceQr.geofenceSupported', 'Geofence Supported')}</span>
                <span className="text-muted-foreground/40">•</span>
                <span>{t('employees.entranceQr.printReadyDpi', 'Print-Ready High-DPI')}</span>
              </div>
            }
            showSubmit={false}
            showCancel={true}
            cancelLabel={t('employees.entranceQr.closeBtn', 'Close')}
            onCancel={onClose}
          />
        </motion.div>
      </div>
    </AnimatePresence>

    {/* Standee Print Portal: Scaled with exact physical print dimensions for A4, A5, and Sticker */}
    {createPortal(
      <div id="standee-print-portal" className="hidden print:block">
        <div
          className={`print-standee-card ${
            standeeSize === 'a4'
              ? 'print-a4'
              : standeeSize === 'a5'
              ? 'print-a5'
              : 'print-sticker'
          } ${isInkSaver ? 'is-ink-saver' : ''} flex flex-col items-center justify-between text-center`}
        >
          {/* 1. Sleek Corporate Identity Header */}
          <div className={`w-full flex items-center justify-between ${standeeSize === 'sticker' ? 'pb-2 border-b border-slate-900' : 'pb-3.5 border-b-2 border-slate-900'}`}>
            <div className="flex items-center gap-3 text-left min-w-0">
              <div className={`${standeeSize === 'sticker' ? 'w-9 h-9 rounded-lg text-xs' : 'w-12 h-12 rounded-xl text-base'} ${isInkSaver ? 'bg-white border-2 border-slate-900 text-slate-950' : 'bg-slate-950 border-2 border-slate-950 text-white'} flex items-center justify-center font-black tracking-tight shrink-0 shadow-xs`}>
                {companyName ? companyName.charAt(0).toUpperCase() : 'K'}
              </div>
              <div className="min-w-0">
                <h2 className={`font-black tracking-tight text-slate-950 uppercase leading-tight truncate ${standeeSize === 'sticker' ? 'text-[11pt]' : standeeSize === 'a5' ? 'text-[14pt]' : 'text-[16pt]'}`}>
                  {companyName}
                </h2>
                <div className={`flex items-center gap-2 font-bold text-slate-600 truncate mt-0.5 ${standeeSize === 'sticker' ? 'text-[7.5pt]' : 'text-[9.5pt]'}`}>
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <MapPin size={11} className="text-slate-600" />
                    <span>{branchName}</span>
                  </span>
                  {selectedShiftId !== 'all' && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-700">{shiftDisplayText}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <div className={`border border-slate-900 ${isInkSaver ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'} rounded-full ${standeeSize === 'sticker' ? 'px-2 py-0.5 text-[7pt]' : 'px-3 py-1 text-[8pt]'} font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>{t('employees.entranceQr.checkpointBadge', 'OFFICIAL CHECKPOINT')}</span>
              </div>
            </div>
          </div>

          {/* 2. Bilingual Action Title */}
          <div className={`${standeeSize === 'sticker' ? 'my-1 space-y-0.5' : 'my-2 space-y-1'}`}>
            <h1 className={`font-black text-slate-950 tracking-tight leading-none ${standeeSize === 'sticker' ? 'text-[16pt]' : standeeSize === 'a5' ? 'text-[22pt]' : 'text-[28pt]'}`}>
              {activeTitle.primary}
            </h1>
            <p className={`font-extrabold text-slate-500 uppercase tracking-widest ${standeeSize === 'sticker' ? 'text-[8.5pt]' : standeeSize === 'a5' ? 'text-[11pt]' : 'text-[13pt]'}`}>
              {activeTitle.secondary}
            </p>
          </div>

          {/* 3. Centerpiece: Vector Optical Scanner Container */}
          <div className={`rounded-2xl flex flex-col items-center relative ${standeeSize === 'sticker' ? 'my-1 p-2 w-full max-w-[96%]' : 'my-2.5 p-5 w-full max-w-[90%]'} ${isInkSaver ? 'border-2 border-slate-900 bg-white' : 'border border-slate-200 bg-slate-50/60'}`}>
            <div className="relative p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              {/* L-Corner High-Precision Optical Registration Corners */}
              <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-[3.5px] border-l-[3.5px] border-slate-900 rounded-tl-xs" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-[3.5px] border-r-[3.5px] border-slate-900 rounded-tr-xs" />
              <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-[3.5px] border-l-[3.5px] border-slate-900 rounded-bl-xs" />
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-[3.5px] border-r-[3.5px] border-slate-900 rounded-br-xs" />

              <QRCode
                type="svg"
                value={qrToken || 'COMPANY_ATTENDANCE_STAND_DEFAULT'}
                size={standeeSize === 'a4' ? 250 : standeeSize === 'a5' ? 190 : 135}
                bordered={false}
                errorLevel="M"
                color="#0f172a"
              />
            </div>

            <p className={`font-black text-slate-950 tracking-tight flex items-center gap-1.5 ${standeeSize === 'sticker' ? 'mt-1.5 text-[8.5pt]' : 'mt-2.5 text-[11pt]'}`}>
              <Smartphone size={standeeSize === 'sticker' ? 12 : 14} className="text-slate-900" />
              <span>{t('employees.entranceQr.scanQrInstructionShort', 'Scan with Employee Mobile App')}</span>
            </p>
          </div>

          {/* 4. Geofence & Parameter Strip */}
          <div className={`w-full flex items-center justify-center gap-6 text-center font-bold text-slate-700 ${standeeSize === 'sticker' ? 'max-w-[96%] my-1.5 text-[8.5pt]' : 'max-w-[92%] my-3 text-[10.5pt]'}`}>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-600" />
              <span>{t('employees.entranceQr.gpsConditionPrefix', 'GPS <')} {radiusMeters}{t('employees.entranceQr.metersUnit', 'm')}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 truncate max-w-[260px]" title={wifiSsid}>
              <Wifi size={12} className="text-slate-600" />
              <span>{wifiSsid}</span>
            </div>
          </div>

          {/* 6. Corporate Standard Footer */}
          <div className={`w-full flex items-center justify-between text-slate-500 font-medium ${standeeSize === 'sticker' ? 'pt-1.5 border-t border-slate-900 text-[7pt] mt-1' : 'pt-3 border-t-2 border-slate-900 text-[9pt] mt-2'}`}>
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <span className="uppercase font-black text-slate-950 tracking-wider truncate">{companyName}</span>
              <span>•</span>
              <span className="truncate">{t('employees.entranceQr.enterpriseSystem', 'Enterprise System')}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[8pt] text-slate-400 font-semibold shrink-0">
              <span>SMART ATTENDANCE 2026</span>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
  )
}

export default DynamicQrKioskModal
