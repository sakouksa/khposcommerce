import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Building2, ChevronDown, Check, Search, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, type AccessibleBranch } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { toast } from '@/stores/toastStore'
import api from '@/api/client'

interface TenantContextSwitcherProps {
  className?: string
}

export const TenantContextSwitcher: React.FC<TenantContextSwitcherProps> = ({ className = '' }) => {
  const { t } = useTranslation(['common', 'nav'])
  const {
    user,
    activeBranchId,
    accessibleBranches,
    setActiveBranch,
    setAccessibleBranches,
    hasRole,
  } = useAuthStore()
  const { navbar } = useThemeStore()

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingContexts, setIsLoadingContexts] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isSuperAdmin = hasRole('super_admin')
  const isOwner = hasRole('owner')

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Fetch updated user contexts if accessibleBranches list is empty
  useEffect(() => {
    if (user && accessibleBranches.length === 0) {
      setIsLoadingContexts(true)
      api.get('/auth/user-contexts')
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const data = res.data.data
            if (Array.isArray(data.accessible_branches) && data.accessible_branches.length > 0) {
              setAccessibleBranches(data.accessible_branches)
              if (!activeBranchId && data.active_branch_id) {
                setActiveBranch(data.active_branch_id)
              }
            }
          }
        })
        .catch(() => {
          // Graceful fallback to user.branch if present
          if (user?.branch) {
            setAccessibleBranches([{
              id: user.branch.id,
              name: user.branch.name,
              is_main: true,
              is_active: true,
            }])
          }
        })
        .finally(() => setIsLoadingContexts(false))
    }
  }, [user, accessibleBranches.length, activeBranchId, setAccessibleBranches, setActiveBranch])

  // Active branch resolution
  const activeBranch: AccessibleBranch | undefined = useMemo(() => {
    if (activeBranchId) {
      const found = accessibleBranches.find((b) => b.id === activeBranchId)
      if (found) return found
    }
    if (user?.branch) {
      return {
        id: user.branch.id,
        name: user.branch.name,
        is_main: true,
        is_active: true,
      }
    }
    return accessibleBranches[0]
  }, [activeBranchId, accessibleBranches, user?.branch])

  // Filtered branches by search query
  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return accessibleBranches
    const q = searchQuery.toLowerCase()
    return accessibleBranches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.code && b.code.toLowerCase().includes(q)) ||
        (b.city && b.city.toLowerCase().includes(q))
    )
  }, [accessibleBranches, searchQuery])

  const handleSelectBranch = async (branch: AccessibleBranch) => {
    if (branch.id === activeBranch?.id) {
      setIsOpen(false)
      return
    }

    setActiveBranch(branch.id)
    setIsOpen(false)

    toast.success(
      t('common.branch_switched', 'Switched to {{name}}', { name: branch.name }),
      { duration: 3000 }
    )

    // Notify backend endpoint asynchronously (non-blocking)
    try {
      await api.post('/auth/switch-context', {
        branch_id: branch.id,
        company_id: user?.company_id || user?.company?.id,
      })
    } catch {
      // Handled silently since client-side headers and event already broadcast
    }
  }

  // If user only has 1 branch and is not super_admin or owner, show a clean pill without dropdown
  const canSwitch = isSuperAdmin || isOwner || accessibleBranches.length > 1

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => canSwitch && setIsOpen(!isOpen)}
        disabled={!canSwitch || isLoadingContexts}
        title={
          canSwitch
            ? t('common.switch_branch_scope', 'Switch active branch scope')
            : t('common.current_branch', 'Current assigned branch')
        }
        className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 ${
          canSwitch
            ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 hover:border-primary/40'
            : 'cursor-default opacity-85'
        } ${
          isOpen
            ? 'bg-primary/10 border-primary text-primary shadow-xs'
            : 'bg-background/80 dark:bg-slate-800/80 border-border/60 text-foreground'
        }`}
      >
        <div className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <GitBranch size={13} className="text-primary group-hover:rotate-12 transition-transform duration-200" />
        </div>

        <div className="flex flex-col text-left min-w-0 max-w-[100px] sm:max-w-[140px] md:max-w-[180px]">
          {(isSuperAdmin || isOwner) && user?.company?.name && (
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold truncate leading-none">
              {user.company.name}
            </span>
          )}
          <span className="truncate font-bold text-[11px] sm:text-xs leading-tight">
            {activeBranch?.name || user?.branch?.name || t('common.all_branches', 'Select Branch')}
          </span>
        </div>

        {activeBranch?.is_main && (
          <span className="hidden xl:inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {t('common.main', 'Main')}
          </span>
        )}

        {canSwitch && (
          <ChevronDown
            size={13}
            className={`opacity-60 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180 text-primary opacity-100' : 'group-hover:opacity-100'
            }`}
          />
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 sm:right-auto sm:left-0 mt-1.5 w-72 max-w-[90vw] rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-border/60 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {t('common.branch_scope', 'Branch Scope')}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-background border border-border/50">
                {accessibleBranches.length} {t('common.available', 'available')}
              </span>
            </div>

            {/* Search Input (if > 3 branches) */}
            {accessibleBranches.length > 3 && (
              <div className="p-2 border-b border-border/40 bg-background/50">
                <div className="relative flex items-center">
                  <Search size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.search_branches', 'Search branches...')}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-muted/40 rounded-xl border border-border/40 focus:border-primary focus:bg-background focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Branch List */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => {
                  const isSelected = branch.id === activeBranch?.id
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => handleSelectBranch(branch)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-background'
                          }`}
                        >
                          <GitBranch size={12} />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="truncate font-semibold">{branch.name}</p>
                          {(branch.code || branch.city) && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {[branch.code, branch.city].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {branch.is_main && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {t('common.main', 'Main')}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <p>{t('common.no_branches_found', 'No branches found.')}</p>
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="px-3 py-2 bg-muted/20 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                {t('common.scope_active', 'All records automatically scoped')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TenantContextSwitcher
