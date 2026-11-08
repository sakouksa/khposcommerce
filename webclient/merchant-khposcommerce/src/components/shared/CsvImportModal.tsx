import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  FileText,
  HelpCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { downloadSampleCsvTemplate } from '@/utils/export'

export interface ImportResult {
  success_count: number
  errors: string[]
}

export interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  resourceName?: string
  expectedHeaders?: string[]
  sampleData?: Record<string, string | number>[]
  importFile?: File | null
  setImportFile?: (file: File | null) => void
  isImporting?: boolean
  importResult?: ImportResult | null
  onImport?: (file: File) => Promise<void> | void
  onSubmit?: (e: React.FormEvent) => void
}

// 5-Language Dictionary for Complete Fallback
const DICTIONARY: Record<string, Record<string, string>> = {
  km: {
    importTitle: 'នាំចូលទិន្នន័យពីឯកសារ CSV',
    importSubtitle: 'ផ្ទុកឡើងឯកសារ CSV ដើម្បីនាំចូលទិន្នន័យជាដុំចូលទៅក្នុងប្រព័ន្ធ',
    dragDropTitle: 'ចុចដើម្បីជ្រើសរើស ឬអូសទម្លាក់ឯកសារ CSV',
    dragDropSubtitle: 'គាំទ្រតែឯកសារ .CSV ប៉ុណ្ណោះ (ទំហំអតិបរមា 10MB)',
    selectFile: 'ជ្រើសរើសឯកសារ',
    changeFile: 'ប្តូរឯកសារ',
    removeFile: 'លុបចេញ',
    requiredColumns: 'ទម្រង់ជួរឈរដែលត្រូវការ៖',
    downloadSample: 'ទាញយកគំរូ CSV',
    cancel: 'បោះបង់',
    close: 'បិទ',
    uploadAndProcess: 'ផ្ទុកឡើង & ដំណើរការ',
    processing: 'កំពុងដំណើរការ...',
    successTitle: 'ការនាំចូលបានជោគជ័យ',
    successCount: 'បាននាំចូល {{count}} ទិន្នន័យដោយជោគជ័យ',
    errorTitle: 'ការនាំចូលមានកំហុសខ្លះ',
    errorCount: 'រកឃើញកំហុសចំនួន {{count}}',
    selectFileAlert: 'សូមជ្រើសរើសឯកសារ CSV មុនពេលបន្ត',
  },
  en: {
    importTitle: 'Import Data from CSV File',
    importSubtitle: 'Upload a CSV file to bulk import records into the system',
    dragDropTitle: 'Click to upload or drag & drop CSV file',
    dragDropSubtitle: 'Only .CSV files supported (Max 10MB, UTF-8)',
    selectFile: 'Select File',
    changeFile: 'Change File',
    removeFile: 'Remove',
    requiredColumns: 'Expected Column Headers:',
    downloadSample: 'Download Sample CSV',
    cancel: 'Cancel',
    close: 'Close',
    uploadAndProcess: 'Upload & Process',
    processing: 'Processing...',
    successTitle: 'Import Completed',
    successCount: 'Successfully imported {{count}} records',
    errorTitle: 'Import Completed with Issues',
    errorCount: '{{count}} errors encountered',
    selectFileAlert: 'Please select a CSV file before submitting',
  },
  zh: {
    importTitle: '从 CSV 文件导入数据',
    importSubtitle: '上传 CSV 文件以批量导入系统记录',
    dragDropTitle: '点击上传或拖放 CSV 文件',
    dragDropSubtitle: '仅支持 .CSV 文件（最大 10MB，UTF-8 编码）',
    selectFile: '选择文件',
    changeFile: '更换文件',
    removeFile: '移除',
    requiredColumns: '所需列标题：',
    downloadSample: '下载示例 CSV',
    cancel: '取消',
    close: '关闭',
    uploadAndProcess: '上传并处理',
    processing: '正在处理...',
    successTitle: '导入完成',
    successCount: '成功导入 {{count}} 条记录',
    errorTitle: '导入完成但存在问题',
    errorCount: '发现 {{count}} 个错误',
    selectFileAlert: '请在提交前选择 CSV 文件',
  },
  th: {
    importTitle: 'นำเข้าข้อมูลจากไฟล์ CSV',
    importSubtitle: 'อัปโหลดไฟล์ CSV เพื่อนำเข้าข้อมูลจำนวนมากเข้าสู่ระบบ',
    dragDropTitle: 'คลิกเพื่ออัปโหลดหรือลากและวางไฟล์ CSV',
    dragDropSubtitle: 'รองรับเฉพาะไฟล์ .CSV เท่านั้น (สูงสุด 10MB, UTF-8)',
    selectFile: 'เลือกไฟล์',
    changeFile: 'เปลี่ยนไฟล์',
    removeFile: 'ลบออก',
    requiredColumns: 'หัวคอลัมน์ที่ต้องการ:',
    downloadSample: 'ดาวน์โหลดตัวอย่าง CSV',
    cancel: 'ยกเลิก',
    close: 'ปิด',
    uploadAndProcess: 'อัปโหลดและประมวลผล',
    processing: 'กำลังประมวลผล...',
    successTitle: 'นำเข้าข้อมูลสำเร็จ',
    successCount: 'นำเข้าข้อมูลสำเร็จ {{count}} รายการ',
    errorTitle: 'การนำเข้ามีข้อผิดพลาดบางรายการ',
    errorCount: 'พบข้อผิดพลาด {{count}} รายการ',
    selectFileAlert: 'กรุณาเลือกไฟล์ CSV ก่อนส่ง',
  },
  vi: {
    importTitle: 'Nhập dữ liệu từ tệp CSV',
    importSubtitle: 'Tải lên tệp CSV để nhập hàng loạt bản ghi vào hệ thống',
    dragDropTitle: 'Nhấp để tải lên hoặc kéo thả tệp CSV',
    dragDropSubtitle: 'Chỉ hỗ trợ tệp .CSV (Tối đa 10MB, UTF-8)',
    selectFile: 'Chọn tệp',
    changeFile: 'Đổi tệp',
    removeFile: 'Xóa',
    requiredColumns: 'Các tiêu đề cột bắt buộc:',
    downloadSample: 'Tải tệp CSV mẫu',
    cancel: 'Hủy',
    close: 'Đóng',
    uploadAndProcess: 'Tải lên & Xử lý',
    processing: 'Đang xử lý...',
    successTitle: 'Nhập dữ liệu hoàn tất',
    successCount: 'Đã nhập thành công {{count}} bản ghi',
    errorTitle: 'Nhập dữ liệu hoàn tất nhưng có lỗi',
    errorCount: 'Gặp {{count}} lỗi',
    selectFileAlert: 'Vui lòng chọn tệp CSV trước khi gửi',
  },
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  resourceName,
  expectedHeaders = [],
  sampleData = [],
  importFile: controlledFile,
  setImportFile: controlledSetFile,
  isImporting = false,
  importResult = null,
  onImport,
  onSubmit,
}) => {
  const { language } = useThemeStore()
  useTranslation(['common', 'employees', 'products'])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [internalFile, setInternalFile] = useState<File | null>(null)
  const currentFile = controlledFile !== undefined ? controlledFile : internalFile
  const setFile = controlledSetFile || setInternalFile

  const [isDragging, setIsDragging] = useState(false)

  // Localized text resolver
  const getText = (key: string, params: Record<string, string | number> = {}): string => {
    const langDict = DICTIONARY[language] || DICTIONARY.en
    let str = langDict[key] || DICTIONARY.en[key] || key
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v))
    })
    return str
  }

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setFile(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleDownloadSample = () => {
    if (expectedHeaders.length === 0 && sampleData.length === 0) return

    const headers = expectedHeaders.length > 0 ? expectedHeaders : Object.keys(sampleData[0] || {})
    const sampleRecord = sampleData.length > 0 ? sampleData[0] : null
    downloadSampleCsvTemplate(resourceName || 'sample', headers, sampleRecord)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFile) return

    if (onImport) {
      await onImport(currentFile)
    } else if (onSubmit) {
      onSubmit(e)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (typeof document === 'undefined') return null

  const resolvedTitle = title || (resourceName ? `${getText('importTitle')} (${resourceName})` : getText('importTitle'))
  const resolvedSubtitle = subtitle || getText('importSubtitle')

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 min-h-screen">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isImporting ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative z-10 w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border/70 shrink-0 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {resolvedTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {resolvedSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isImporting}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {/* Drag & Drop Zone */}
              {!currentFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-primary bg-primary/10 scale-[0.99] shadow-inner'
                      : 'border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-13 h-13 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                    <Upload size={24} className="transition-transform duration-300 group-hover:-translate-y-1" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {getText('dragDropTitle')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getText('dragDropSubtitle')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-1 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    {getText('selectFile')}
                  </button>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {currentFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(currentFile.size)} • CSV File
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      {getText('changeFile')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      disabled={isImporting}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title={getText('removeFile')}
                    >
                      <X size={16} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Sample Download Bar */}
              {expectedHeaders.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <HelpCircle size={14} className="text-primary" />
                      <span>{getText('requiredColumns')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      <Download size={13} />
                      <span>{getText('downloadSample')}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                    {expectedHeaders.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-card border border-border text-muted-foreground"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Results Banner */}
              {importResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
                    importResult.errors.length > 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {importResult.errors.length > 0 ? (
                      <AlertCircle size={17} className="text-rose-500 shrink-0" />
                    ) : (
                      <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
                    )}
                    <span>
                      {importResult.errors.length > 0
                        ? getText('errorTitle')
                        : getText('successTitle')}
                    </span>
                  </div>

                  {importResult.success_count > 0 && (
                    <p className="font-semibold">
                      {getText('successCount', { count: importResult.success_count })}
                    </p>
                  )}

                  {importResult.errors.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="font-semibold text-rose-600 dark:text-rose-400">
                        {getText('errorCount', { count: importResult.errors.length })}:
                      </p>
                      <ul className="list-disc pl-5 space-y-0.5 max-h-32 overflow-y-auto text-[11px] custom-scrollbar">
                        {importResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 pt-3 border-t border-border/70 shrink-0 bg-muted/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isImporting}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted/80 text-foreground transition-all cursor-pointer disabled:opacity-50"
              >
                {importResult && importResult.errors.length === 0 ? getText('close') : getText('cancel')}
              </button>

              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={!currentFile || isImporting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{getText('processing')}</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>{getText('uploadAndProcess')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default CsvImportModal
