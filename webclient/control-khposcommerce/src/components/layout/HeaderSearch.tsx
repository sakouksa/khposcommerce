import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CornerDownLeft, FileText, Package, Users, ShoppingCart, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import api from '@/api/client'

interface SearchItem {
  id: string | number
  category: 'shops' | 'plans' | 'users' | 'pages'
  title: string
  subtitle?: string
  path: string
}

const getStaticPages = (t: any): SearchItem[] => [
  { id: 'dash', category: 'pages', title: t('nav.platformDashboard', 'Platform Dashboard'), subtitle: 'ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ SaaS & KPIs', path: '/dashboard' },
  { id: 'shops', category: 'pages', title: t('nav.shops', 'Shops & Tenants'), subtitle: 'គ្រប់គ្រងហាងអាជីវកម្មទាំងអស់ក្នុងប្រព័ន្ធ', path: '/shops' },
  { id: 'plans', category: 'pages', title: t('nav.plans', 'Subscription Plans'), subtitle: 'កញ្ចប់គម្រោងតម្លៃ និងកំណត់សិទ្ធិប្រើប្រាស់', path: '/plans' },
  { id: 'billing', category: 'pages', title: t('nav.billing', 'SaaS Billing & Invoices'), subtitle: 'វិក្កយបត្រ និងការបង់ប្រាក់ Bakong KHQR', path: '/billing' },
  { id: 'resellers', category: 'pages', title: t('nav.resellers', 'Resellers & Partners'), subtitle: 'បណ្តាញតំណាងចែកចាយ និងកម្រៃជើងសារ', path: '/resellers' },
  { id: 'users', category: 'pages', title: t('nav.superAdmins', 'Super Admins & Staff'), subtitle: 'គណនីបុគ្គលិកគ្រប់គ្រង Platform', path: '/users' },
  { id: 'roles', category: 'pages', title: t('nav.rolesPermissions', 'Roles & Permissions'), subtitle: 'កំណត់សិទ្ធិ និងតួនាទីគ្រប់គ្រងប្រព័ន្ធ SaaS', path: '/roles' },
  { id: 'backup', category: 'pages', title: t('nav.backup', 'System Health & Backup'), subtitle: 'សុខភាពម៉ាស៊ីនបម្រើ និងការចម្លងទុកទិន្នន័យ', path: '/backup' },
  { id: 'logs', category: 'pages', title: t('nav.activityLogs', 'Audit Logs'), subtitle: 'កំណត់ត្រាសកម្មភាពសុវត្ថិភាព Cross-Tenant', path: '/activity-logs' },
  { id: 'notifications', category: 'pages', title: t('nav.broadcastNotifications', 'Broadcast Notifications'), subtitle: 'ផ្ញើសារ Alert និង Notification ទៅកាន់ហាង', path: '/notifications' },
  { id: 'chatbot', category: 'pages', title: t('nav.chatbot', 'AI Chatbot & Telegram'), subtitle: 'កំណត់ Assistant និង Telegram Webhook', path: '/chatbot' },
  { id: 'sett', category: 'pages', title: t('nav.platformSettings', 'Platform Settings'), subtitle: 'ការកំណត់ Gateway, Telegram Bot & Security', path: '/settings' },
]

const HeaderSearch: React.FC = () => {
  const { t } = useTranslation(['nav', 'common'])
  const navigate = useNavigate()
  const staticPages = React.useMemo(() => getStaticPages(t), [t])
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>(staticPages)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const modalRef = useRef<HTMLDivElement>(null)

  // Update results when language changes and query is empty
  useEffect(() => {
    if (!query.trim()) {
      setResults(staticPages)
    }
  }, [staticPages, query])

  // Listen for Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Dynamic search fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults(staticPages)
      setSelectedIndex(0)
      return
    }

    const delayDebounce = setTimeout(() => {
      const pageMatches = staticPages.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(query.toLowerCase()))
      )

      // Fetch companies / shops from platform API
      api.get('/platform/companies', { params: { search: query, per_page: 5 } })
        .then((res) => {
          const companies = res.data?.data?.data || res.data?.data || []
          const companyResults: SearchItem[] = companies.map((c: any) => ({
            id: `shop-${c.id}`,
            category: 'shops',
            title: c.name,
            subtitle: `ម្ចាស់: ${c.owner_name || 'N/A'} • គម្រោង: ${c.plan_name || 'Standard'}`,
            path: `/shops?search=${encodeURIComponent(c.name)}`,
          }))
          setResults([...pageMatches, ...companyResults])
          setSelectedIndex(0)
        })
        .catch(() => {
          setResults(pageMatches)
          setSelectedIndex(0)
        })
    }, 200)

    return () => clearTimeout(delayDebounce)
  }, [query])

  // Key navigation handler inside modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleNavigate(results[selectedIndex].path)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    setIsOpen(false)
    setQuery('')
  }

  const getCategoryIcon = (cat: SearchItem['category']) => {
    switch (cat) {
      case 'products':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'customers':
        return <Users className="w-4 h-4 text-purple-500" />
      case 'orders':
        return <ShoppingCart className="w-4 h-4 text-emerald-500" />
      case 'pages':
      default:
        return <FileText className="w-4 h-4 text-slate-500" />
    }
  }

  const { navbar } = useThemeStore()
  const customTextColor = navbar?.textColor

  return (
    <>
      {/* Search trigger icon button for mobile (< sm) */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          color: customTextColor || undefined,
          borderColor: customTextColor ? `${customTextColor}40` : undefined,
          backgroundColor: customTextColor ? `${customTextColor}18` : undefined,
        }}
        className="flex sm:hidden items-center justify-center w-8 h-8 rounded-xl border opacity-90 hover:opacity-100 transition-all duration-200 flex-shrink-0 cursor-pointer"
        title={`${t('common.search_anything', 'Search anything...')} (⌘K)`}
        aria-label={t('common.search_anything', 'Search anything...')}
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Full search trigger box for tablet & desktop (sm+) */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          color: customTextColor || undefined,
          borderColor: customTextColor ? `${customTextColor}40` : undefined,
          backgroundColor: customTextColor ? `${customTextColor}18` : undefined,
        }}
        className="hidden sm:flex items-center justify-between w-40 md:w-56 xl:w-64 px-3 py-1.5 bg-muted/40 hover:bg-muted/70 border border-border/40 hover:border-border rounded-xl text-xs transition-all duration-200 cursor-pointer flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 opacity-80" />
          <span className="opacity-90 font-medium">{t('common.search_anything', 'Search anything...')}</span>
        </div>
        <kbd
          style={{ color: customTextColor || undefined, borderColor: customTextColor ? `${customTextColor}40` : undefined }}
          className="inline-flex items-center gap-0.5 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 border border-border/60 rounded font-mono text-[9px] font-bold"
        >
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      {/* Global Command palette dialog */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-3 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Modal Body */}
              <motion.div
                initial={{ scale: 0.97, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: -20 }}
                transition={{ duration: 0.18 }}
                className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
                onKeyDown={handleModalKeyDown}
                ref={modalRef}
              >
                {/* Input Header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border flex-shrink-0">
                  <Search className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder={t('common.search_placeholder', 'Search pages, products, customers...')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground border border-border px-1.5 py-0.5 rounded font-bold cursor-pointer"
                  >
                    ESC
                  </button>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 space-y-0.5">
                  {results.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      {t('common.no_results_found', 'No results found')}
                    </div>
                  ) : (
                    results.map((item, index) => {
                      const isSelected = selectedIndex === index
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigate(item.path)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left
                            ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/40'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0
                              ${isSelected ? 'bg-white/20' : 'bg-muted'}`}>
                              {getCategoryIcon(item.category)}
                            </span>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs truncate leading-none">{item.title}</h5>
                              {item.subtitle && (
                                <p className={`text-[10px] mt-1 truncate
                                  ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-1.5 text-[9px] bg-white/20 px-2 py-0.5 rounded font-bold text-primary-foreground/90">
                              <span>Select</span>
                              <CornerDownLeft className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Footer shortcuts */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 text-[10px] text-muted-foreground bg-muted/10 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-0.5"><kbd className="border border-border/80 px-1 rounded">↑↓</kbd> Navigate</span>
                    <span className="flex items-center gap-0.5"><kbd className="border border-border/80 px-1 rounded">Enter</kbd> Open</span>
                  </div>
                  <span>Ctrl + K</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default HeaderSearch
