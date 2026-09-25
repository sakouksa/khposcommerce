import React, { useState, useMemo } from 'react'
import {
  Sparkles, Check, Palette, Layout,
  Wand2, Paintbrush, Search,
  Sun, Moon, Laptop, AppWindow
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  UNIFIED_THEME_TEMPLATES,
  type UnifiedThemeTemplate,
  type TemplateCategory
} from '../../types/settings.types'
import { sound } from '@/utils/sound'

interface TemplatesTabProps {
  customizer: any
  handleApplyUnifiedTemplate?: (tpl: UnifiedThemeTemplate) => void
  handleApplyTemplate?: (tpl: any) => void
  handleApplyPanelTemplate?: (tpl: any) => void
}

const QUICK_ACCENT_SWATCHES = [
  { name: 'Neon Coral', hex: '#ec4899' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Mint', hex: '#10b981' },
  { name: 'Violet VIP', hex: '#8b5cf6' },
  { name: 'Sunset Amber', hex: '#f59e0b' },
  { name: 'Cyan Frost', hex: '#06b6d4' },
  { name: 'Matrix Green', hex: '#22c55e' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Indigo Electric', hex: '#6366f1' },
]

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  customizer,
  handleApplyUnifiedTemplate,
}) => {
  const { t } = useTranslation(['settings', 'common'])
  const [activeViewMode, setActiveViewMode] = useState<'gallery' | 'custom'>('gallery')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const currentSidebar = customizer.sidebar || {}
  const currentNavbar = customizer.navbar || {}
  const currentPrimaryColor = customizer.primaryColor || '#ec4899'
  const currentThemeMode = customizer.themeMode || 'light'

  // Apply unified template
  const applyTemplate = (tpl: UnifiedThemeTemplate) => {
    if (handleApplyUnifiedTemplate) {
      handleApplyUnifiedTemplate(tpl)
    } else {
      customizer.updatePrimaryColor(tpl.primaryColor)
      customizer.updateThemeMode(tpl.mode)
      customizer.updateSidebar({
        bgColor: tpl.sidebarBg,
        textColor: tpl.sidebarText,
        activeBgColor: tpl.activeBg,
        activeTextColor: tpl.activeText,
        roundedStyle: tpl.roundedStyle || 'rounded-xl',
        width: tpl.sidebarWidth || 260,
      })
      customizer.updateNavbar({
        bgColor: tpl.navbarBg,
        textColor: tpl.navbarText,
        borderColor: tpl.navbarBorder,
        shadow: tpl.navbarShadow || 'sm',
      })
      sound.playSuccess()
    }
  }

  // Check if a template is active
  const isTemplateActive = (tpl: UnifiedThemeTemplate) => {
    const isPrimaryMatch = currentPrimaryColor?.toLowerCase() === tpl.primaryColor?.toLowerCase()
    const isSidebarMatch = currentSidebar.bgColor?.toLowerCase() === tpl.sidebarBg?.toLowerCase()
    const isNavbarMatch = currentNavbar.bgColor?.toLowerCase() === tpl.navbarBg?.toLowerCase()
    const isActiveBgMatch = currentSidebar.activeBgColor?.toLowerCase() === tpl.activeBg?.toLowerCase()
    return (isSidebarMatch && isActiveBgMatch && isNavbarMatch) || (isPrimaryMatch && isSidebarMatch)
  }

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return UNIFIED_THEME_TEMPLATES.filter((tpl) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        tpl.category.includes(selectedCategory) ||
        (selectedCategory === 'dark' && tpl.mode === 'dark') ||
        (selectedCategory === 'light' && tpl.mode === 'light')

      if (!matchesCategory) return false

      // Search query filter
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const name = t(`settings.${tpl.nameKey}`, tpl.defaultName).toLowerCase()
      const desc = t(`settings.${tpl.descKey}`, tpl.defaultDesc).toLowerCase()
      const badge = tpl.badge.toLowerCase()
      return name.includes(q) || desc.includes(q) || badge.includes(q) || tpl.id.includes(q)
    })
  }, [selectedCategory, searchQuery, t])

  const handleWidthChange = (width: number) => {
    customizer.updateSidebar({ width })
    sound.playClick()
  }

  const handleRoundedChange = (roundedStyle: string) => {
    customizer.updateSidebar({ roundedStyle })
    sound.playClick()
  }

  const handleShadowChange = (shadow: 'none' | 'sm' | 'md' | 'lg') => {
    customizer.updateNavbar({ shadow })
    sound.playClick()
  }

  const handleQuickAccent = (hex: string) => {
    customizer.updateSidebar({ activeBgColor: hex })
    customizer.updatePrimaryColor(hex)
    sound.playSuccess()
  }

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    customizer.updateThemeMode(mode)
    sound.playClick()
  }

  const applyHeaderPreset = (type: 'match_sidebar' | 'brand_accent' | 'crisp_white' | 'slate_dark' | 'soft_tint') => {
    switch (type) {
      case 'match_sidebar':
        customizer.updateNavbar({
          bgColor: currentSidebar.bgColor || '#0b1329',
          textColor: currentSidebar.textColor || '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
        })
        break
      case 'brand_accent':
        customizer.updateNavbar({
          bgColor: currentPrimaryColor || '#ec4899',
          textColor: '#ffffff',
          borderColor: 'rgba(0,0,0,0.15)',
        })
        break
      case 'crisp_white':
        customizer.updateNavbar({
          bgColor: '#ffffff',
          textColor: '#0f172a',
          borderColor: '#e2e8f0',
        })
        break
      case 'slate_dark':
        customizer.updateNavbar({
          bgColor: '#0f172a',
          textColor: '#f8fafc',
          borderColor: '#1e293b',
        })
        break
      case 'soft_tint':
        customizer.updateNavbar({
          bgColor: '#fff1f2',
          textColor: '#881337',
          borderColor: '#fecdd3',
        })
        break
    }
    sound.playSuccess()
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ─── 1. TOP HEADER & NAVIGATION ─────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-foreground flex items-center gap-2.5 tracking-tight">
            <Palette size={22} className="text-primary" />
            <span>{t('settings.themeAndColorTitle', 'Theme, Sidebar & Navbar Customizer')}</span>
          </h3>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed max-w-2xl">
            {t(
              'settings.themeAndColorSub',
              'Choose from 12+ curated full-system design templates with custom executive headers or customize sidebar, navbar, and primary accents with 100% flexibility.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Theme Mode Segmented Controller */}
          <div className="flex items-center p-1 bg-muted/50 border border-border/80 rounded-2xl shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => handleThemeModeChange('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentThemeMode === 'light'
                  ? 'bg-card text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun size={13} className={currentThemeMode === 'light' ? 'text-amber-500' : ''} />
              <span>{t('settings.modeLight', 'Light')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeModeChange('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentThemeMode === 'dark'
                  ? 'bg-card text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon size={13} className={currentThemeMode === 'dark' ? 'text-indigo-400' : ''} />
              <span>{t('settings.modeDark', 'Dark')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeModeChange('system')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentThemeMode === 'system'
                  ? 'bg-card text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Laptop size={13} className={currentThemeMode === 'system' ? 'text-primary' : ''} />
              <span>{t('settings.modeSystem', 'System')}</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-muted/50 border border-border/80 rounded-2xl shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveViewMode('gallery')
                sound.playClick()
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'gallery'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={14} />
              <span>{t('settings.galleryMode', '12 Curated Templates')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveViewMode('custom')
                sound.playClick()
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'custom'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Paintbrush size={14} />
              <span>{t('settings.customStudioMode', 'Custom Studio')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. UNIFIED TEMPLATE GALLERY (WITH CUSTOM HEADERS PREVIEWS) ─── */}
      {activeViewMode === 'gallery' && (
        <div className="space-y-6">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'all', label: t('settings.catAll', 'All Templates (12)') },
                { id: 'dark', label: t('settings.catDark', 'Dark Mode') },
                { id: 'light', label: t('settings.catLight', 'Light Mode') },
                { id: 'corporate', label: t('settings.catCorporate', 'Corporate') },
                { id: 'luxury', label: t('settings.catLuxury', 'Luxury VIP') },
                { id: 'vibrant', label: t('settings.catVibrant', 'Vibrant') },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id as TemplateCategory)
                    sound.playClick()
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative min-w-[200px] sm:w-64 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('settings.searchTemplates', 'Search templates...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* 12 Unified Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const active = isTemplateActive(tpl)

              return (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className={`group relative rounded-3xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    active
                      ? 'border-primary ring-2 ring-primary/30 bg-card shadow-lg scale-[1.01]'
                      : 'border-border/80 hover:border-primary/50 bg-card/60 hover:bg-card shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-muted/60 text-muted-foreground border-border/80">
                          {tpl.badgeKey ? t(`settings.${tpl.badgeKey}`, tpl.badge) : tpl.badge}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {tpl.mode === 'dark' ? t('settings.modeDark', 'Dark') : t('settings.modeLight', 'Light')}
                        </span>
                      </div>
                      {active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs animate-pulse shrink-0">
                          <Check size={11} strokeWidth={3} />
                          {t('settings.activeTemplateBadge', 'Active')}
                        </span>
                      ) : null}
                    </div>

                    {/* ─── Interactive High-Definition UI Mini Mockup ─── */}
                    <div className="h-36 w-full rounded-2xl border border-border/70 overflow-hidden flex shadow-inner bg-muted/20 relative group-hover:shadow-md transition-shadow">
                      {/* Mini Sidebar */}
                      <div
                        className="w-[36%] h-full p-2.5 flex flex-col justify-between shrink-0 border-r transition-colors"
                        style={{
                          backgroundColor: tpl.sidebarBg,
                          borderColor: tpl.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="space-y-2">
                          {/* Mini Brand Header */}
                          <div
                            className="flex items-center gap-1.5 pb-1 border-b"
                            style={{
                              borderColor: tpl.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)',
                            }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-md flex items-center justify-center shadow-xs"
                              style={{ backgroundColor: tpl.activeBg }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tpl.activeText === '#000000' ? '#000000' : '#ffffff' }} />
                            </div>
                            <div
                              className="w-10 h-1.5 rounded-full"
                              style={{ backgroundColor: tpl.sidebarText, opacity: 0.6 }}
                            />
                          </div>

                          {/* Mini Active Menu Item */}
                          <div
                            className="w-full h-4 rounded-lg px-1.5 flex items-center gap-1.5 shadow-xs transition-transform group-hover:scale-102"
                            style={{
                              backgroundColor: tpl.activeBg,
                              color: tpl.activeText,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tpl.activeText === '#000000' ? '#000000' : '#ffffff', opacity: 0.9 }}
                            />
                            <div
                              className="w-8 h-1.5 rounded-full"
                              style={{ backgroundColor: tpl.activeText === '#000000' ? '#000000' : '#ffffff', opacity: 0.9 }}
                            />
                          </div>

                          {/* Mini Inactive Menu Items */}
                          <div className="w-full h-3 rounded-md px-1.5 flex items-center gap-1.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                            <div className="w-7 h-1 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                          </div>
                          <div className="w-full h-3 rounded-md px-1.5 flex items-center gap-1.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                            <div className="w-6 h-1 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                          </div>
                        </div>

                        {/* Mini User Profile Footer */}
                        <div
                          className="w-full pt-1.5 border-t flex items-center gap-1.5"
                          style={{
                            borderColor: tpl.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)',
                          }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText, opacity: 0.5 }}
                          />
                          <div
                            className="w-5 h-1 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText, opacity: 0.4 }}
                          />
                        </div>
                      </div>

                      {/* Mini Content Area & Navbar */}
                      <div className="flex-1 flex flex-col h-full bg-background/60">
                        {/* Mini Custom Navbar Header */}
                        <div
                          className="h-8 w-full px-2.5 border-b flex items-center justify-between shrink-0 shadow-2xs transition-colors"
                          style={{
                            backgroundColor: tpl.navbarBg,
                            borderColor: tpl.navbarBorder,
                            color: tpl.navbarText,
                          }}
                        >
                          <div
                            className="w-12 h-2 rounded-full opacity-60"
                            style={{ backgroundColor: tpl.navbarText }}
                          />
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full opacity-40"
                              style={{ backgroundColor: tpl.navbarText }}
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full shadow-xs"
                              style={{ backgroundColor: tpl.activeBg }}
                            />
                          </div>
                        </div>

                        {/* Mini Canvas Body */}
                        <div className="p-2.5 space-y-2 flex-1">
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="h-6 rounded-lg bg-card border border-border/50 shadow-xs" />
                            <div className="h-6 rounded-lg bg-card border border-border/50 shadow-xs" />
                          </div>
                          <div className="h-8 rounded-lg bg-card border border-border/50 shadow-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h5 className="text-xs font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {t(`settings.${tpl.nameKey}`, tpl.defaultName)}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed min-h-[36px]">
                        {t(`settings.${tpl.descKey}`, tpl.defaultDesc)}
                      </p>
                    </div>
                  </div>

                  {/* Color Swatches Footer */}
                  <div className="pt-3.5 border-t border-border/60 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                        {t('settings.paletteLabel', 'Palette')}:
                      </span>
                      {tpl.palette.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-border/80 shadow-xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground font-bold">{tpl.primaryColor}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="p-8 text-center bg-card border border-border rounded-3xl">
              <p className="text-sm font-bold text-foreground">{t('settings.noTemplatesFound', 'No templates match your criteria.')}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="mt-3 px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl"
              >
                {t('settings.resetFilters', 'Reset Filters')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── 3. CUSTOM DESIGN STUDIO (BUILDER MODE) ──────────────────────── */}
      {activeViewMode === 'custom' && (
        <div className="space-y-6 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-foreground flex items-center gap-2">
                <Paintbrush size={17} className="text-primary" />
                <span>{t('settings.customStudioTitle', 'Custom Design Studio & Color Builder')}</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  'settings.customStudioSubtitle',
                  'Craft your bespoke sidebar, active indicators, and navbar headers with live visual feedback.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Accent Swatches & Custom Brand Hex */}
          <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Wand2 size={15} className="text-primary" />
                <span>{t('settings.customPrimaryColor', 'Custom Brand Primary Accent')}</span>
              </span>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentPrimaryColor}
                  onChange={(e) => {
                    customizer.updatePrimaryColor(e.target.value)
                    customizer.updateSidebar({ activeBgColor: e.target.value })
                  }}
                  className="w-8 h-8 rounded-xl border border-border cursor-pointer bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={currentPrimaryColor}
                  onChange={(e) => {
                    customizer.updatePrimaryColor(e.target.value)
                    customizer.updateSidebar({ activeBgColor: e.target.value })
                  }}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Quick Accent Swatches */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                {t('settings.quickAccentPresets', 'Quick Accents')}:
              </span>
              {QUICK_ACCENT_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => handleQuickAccent(swatch.hex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currentPrimaryColor?.toLowerCase() === swatch.hex.toLowerCase()
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/10 text-primary'
                      : 'border-border/70 hover:border-primary/40 bg-muted/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: swatch.hex }} />
                  <span className="text-[11px]">{swatch.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Header Style Presets */}
          <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <AppWindow size={15} className="text-primary" />
                <span>{t('settings.quickHeaderPresetsTitle', 'Quick Top Navbar Header Styles')}</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {t('settings.quickHeaderPresetsSub', '1-Click Header Styling')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {[
                { id: 'match_sidebar', label: t('settings.headerMatchSidebar', 'Match Sidebar'), bg: currentSidebar.bgColor || '#0b1329', border: 'border-white/20' },
                { id: 'brand_accent', label: t('settings.headerBrandAccent', 'Brand Accent'), bg: currentPrimaryColor || '#ec4899', border: 'border-primary' },
                { id: 'crisp_white', label: t('settings.headerCrispWhite', 'Snow White'), bg: '#ffffff', border: 'border-border' },
                { id: 'slate_dark', label: t('settings.headerSlateDark', 'Dark Slate'), bg: '#0f172a', border: 'border-slate-700' },
                { id: 'soft_tint', label: t('settings.headerSoftTint', 'Soft Tint Pastel'), bg: '#fff1f2', border: 'border-rose-200' },
              ].map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => applyHeaderPreset(h.id as any)}
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer text-left"
                >
                  <div className={`w-5 h-5 rounded-lg shadow-xs shrink-0 border ${h.border}`} style={{ backgroundColor: h.bg }} />
                  <span className="text-[11px] font-bold text-foreground truncate">{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Precision Color Picker Grid */}
          <div className="p-5 rounded-3xl border border-border bg-card/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 shadow-xs">
            {/* Sidebar Background */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                {t('settings.sidebarBg', 'Sidebar Background')}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentSidebar.bgColor || '#0b1329'}
                  onChange={(e) => customizer.updateSidebar({ bgColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentSidebar.bgColor || '#0b1329'}
                  onChange={(e) => customizer.updateSidebar({ bgColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Active Item Background */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                {t('settings.activeBg', 'Active Button Accent')}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentSidebar.activeBgColor || '#ec4899'}
                  onChange={(e) => {
                    customizer.updateSidebar({ activeBgColor: e.target.value })
                    customizer.updatePrimaryColor(e.target.value)
                  }}
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentSidebar.activeBgColor || '#ec4899'}
                  onChange={(e) => {
                    customizer.updateSidebar({ activeBgColor: e.target.value })
                    customizer.updatePrimaryColor(e.target.value)
                  }}
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Sidebar Text Color */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                {t('settings.sidebarText', 'Sidebar Text & Icons')}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentSidebar.textColor || '#94a3b8'}
                  onChange={(e) => customizer.updateSidebar({ textColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentSidebar.textColor || '#94a3b8'}
                  onChange={(e) => customizer.updateSidebar({ textColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Navbar Background */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                {t('settings.navbarBg', 'Navbar Header Background')}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentNavbar.bgColor || '#ffffff'}
                  onChange={(e) => customizer.updateNavbar({ bgColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentNavbar.bgColor || '#ffffff'}
                  onChange={(e) => customizer.updateNavbar({ bgColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Navbar Border Color */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                {t('settings.navbarBorder', 'Navbar Border Color')}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentNavbar.borderColor || '#e2e8f0'}
                  onChange={(e) => customizer.updateNavbar({ borderColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentNavbar.borderColor || '#e2e8f0'}
                  onChange={(e) => customizer.updateNavbar({ borderColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Navbar Text Color */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                {t('settings.navbarText', 'Navbar Text & Search')}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentNavbar.textColor || '#0f172a'}
                  onChange={(e) => customizer.updateNavbar({ textColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentNavbar.textColor || '#0f172a'}
                  onChange={(e) => customizer.updateNavbar({ textColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. SIDEBAR & NAVBAR DIMENSIONS & SIZING ──────────────────────── */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Layout size={15} className="text-primary" />
          <span>{t('settings.dimensionsAndLayout', 'Sidebar & Navbar Sizing & Layout Presets')}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {/* Sidebar Width Preset */}
          <div className="bg-card p-4 sm:p-5 rounded-3xl border border-border/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">{t('settings.sidebarWidth', 'Sidebar Width')}</label>
              <span className="text-xs font-mono font-bold text-primary">{currentSidebar.width || 260}px</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
              {[
                { label: t('settings.widthCompact', 'Compact'), val: 220 },
                { label: t('settings.widthStandard', 'Standard'), val: 260 },
                { label: t('settings.widthSpacious', 'Spacious'), val: 280 },
              ].map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => handleWidthChange(w.val)}
                  className={`py-2 px-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer truncate ${
                    (currentSidebar.width || 260) === w.val
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted border-border/60'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Item Corner Radius */}
          <div className="bg-card p-4 sm:p-5 rounded-3xl border border-border/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">{t('settings.menuItemRadius', 'Menu Item Corners')}</label>
              <span className="text-xs font-mono text-muted-foreground font-semibold">
                {currentSidebar.roundedStyle || 'rounded-xl'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
              {[
                { label: t('settings.radiusSharp', 'Sharp'), val: 'rounded-md' },
                { label: t('settings.radiusSmooth', 'Smooth'), val: 'rounded-xl' },
                { label: t('settings.radiusPill', 'Pill'), val: 'rounded-2xl' },
              ].map((r) => {
                const currentNorm =
                  !currentSidebar.roundedStyle || currentSidebar.roundedStyle === 'rounded-xl' || currentSidebar.roundedStyle === '0.75rem'
                    ? 'rounded-xl'
                    : currentSidebar.roundedStyle === 'rounded-2xl' || currentSidebar.roundedStyle === '1rem'
                    ? 'rounded-2xl'
                    : 'rounded-md'
                const isSelected = currentNorm === r.val

                return (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => handleRoundedChange(r.val)}
                    className={`py-2 px-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/30 text-muted-foreground hover:bg-muted border-border/60'
                    }`}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navbar Elevation / Shadow */}
          <div className="bg-card p-4 sm:p-5 rounded-3xl border border-border/80 space-y-2.5 shadow-2xs md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">{t('settings.navbarShadow', 'Navbar Elevation')}</label>
              <span className="text-xs font-mono text-muted-foreground font-semibold">{currentNavbar.shadow || 'sm'}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-1">
              {[
                { label: t('settings.shadowNone', 'Flat'), val: 'none' },
                { label: t('settings.shadowSm', 'Low'), val: 'sm' },
                { label: t('settings.shadowMd', 'Mid'), val: 'md' },
                { label: t('settings.shadowLg', 'High'), val: 'lg' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => handleShadowChange(s.val as any)}
                  className={`py-2 px-1 text-[10.5px] sm:text-[11px] font-bold rounded-xl border transition-all cursor-pointer truncate ${
                    (currentNavbar.shadow || 'sm') === s.val
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted border-border/60'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatesTab
