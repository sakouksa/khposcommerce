import React, { useState } from 'react'
import {
  Sliders, Check, Palette, Sparkles, Layout, Eye,
  Maximize2, Minimize2, ChevronDown, ChevronUp, RotateCcw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { panelTemplates, type PanelTemplate } from '../../types/settings.types'
import { sound } from '@/utils/sound'

interface PanelsTabProps {
  customizer: any
  handleApplyPanelTemplate: (tpl: PanelTemplate) => void
}

export const PanelsTab: React.FC<PanelsTabProps> = ({
  customizer,
  handleApplyPanelTemplate,
}) => {
  const { t } = useTranslation(['settings', 'common'])
  const [showAdvancedColors, setShowAdvancedColors] = useState(false)

  const currentSidebar = customizer.sidebar || {}
  const currentNavbar = customizer.navbar || {}

  const isTemplateActive = (tpl: PanelTemplate) => {
    return (
      currentSidebar.bgColor?.toLowerCase() === tpl.sidebarBg.toLowerCase() &&
      currentSidebar.activeBgColor?.toLowerCase() === tpl.activeBg.toLowerCase()
    )
  }

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders size={18} className="text-primary" />
            <span>{t('settings.tabPanels', 'Sidebar & Navbar Layout & Presets')}</span>
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            {t('settings.panelsSubtitle', 'Choose pre-built templates for your sidebar and navigation bar or customize dimensions and colors')}
          </p>
        </div>
      </div>

      {/* ─── PRE-BUILT SIDEBAR & NAVBAR TEMPLATES GALLERY ─────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span>{t('settings.panelTemplatesGallery', 'Sidebar & Navbar Templates')}</span>
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t('settings.panelTemplatesGalleryDesc', 'Click any template to instantly transform the sidebar and top navigation')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {panelTemplates.map((tpl) => {
            const active = isTemplateActive(tpl)
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  handleApplyPanelTemplate(tpl)
                }}
                className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  active
                    ? 'border-primary ring-2 ring-primary/30 bg-card shadow-md scale-[1.02]'
                    : 'border-border/80 hover:border-primary/50 bg-card/60 hover:bg-card shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header with Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-muted/60 text-muted-foreground border-border/80">
                      {tpl.defaultBadge}
                    </span>
                    {active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check size={10} strokeWidth={3} />
                        {t('settings.activeTemplateBadge', 'Active')}
                      </span>
                    ) : null}
                  </div>

                  {/* ─── Interactive Mini UI Mockup ─── */}
                  <div className="h-28 w-full rounded-xl border border-border/60 overflow-hidden flex shadow-inner bg-muted/30 relative">
                    {/* Mini Sidebar */}
                    <div
                      className="w-1/3 h-full p-2 flex flex-col justify-between shrink-0 border-r transition-colors"
                      style={{ backgroundColor: tpl.sidebarBg, borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div className="space-y-1.5">
                        {/* Mini Brand Dot */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: tpl.activeBg }} />
                          <div className="w-8 h-1 rounded-full bg-white/20" />
                        </div>
                        {/* Mini Menu Items */}
                        <div
                          className="w-full h-3 rounded-md px-1 flex items-center gap-1 shadow-xs"
                          style={{ backgroundColor: tpl.activeBg }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          <div className="w-6 h-1 rounded-full bg-white/90" />
                        </div>
                        <div className="w-full h-2.5 rounded-md px-1 flex items-center gap-1 opacity-70">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                          <div className="w-5 h-1 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                        </div>
                        <div className="w-full h-2.5 rounded-md px-1 flex items-center gap-1 opacity-70">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                          <div className="w-4 h-1 rounded-full" style={{ backgroundColor: tpl.sidebarText }} />
                        </div>
                      </div>

                      {/* Mini Avatar / Bottom user */}
                      <div className="w-full pt-1 border-t border-white/10 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-4 h-0.5 rounded-full bg-white/20" />
                      </div>
                    </div>

                    {/* Mini Content Area & Navbar */}
                    <div className="flex-1 flex flex-col h-full bg-background/50">
                      {/* Mini Navbar */}
                      <div
                        className="h-6 w-full px-2 border-b flex items-center justify-between shrink-0"
                        style={{
                          backgroundColor: tpl.navbarBg,
                          borderColor: tpl.navbarBorder,
                          color: tpl.navbarText,
                        }}
                      >
                        <div className="w-8 h-1.5 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tpl.activeBg }} />
                        </div>
                      </div>
                      {/* Mini Canvas Body */}
                      <div className="p-2 space-y-1.5 flex-1">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="h-6 rounded-md bg-card border border-border/40" />
                          <div className="h-6 rounded-md bg-card border border-border/40" />
                        </div>
                        <div className="h-7 rounded-md bg-card border border-border/40" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {t(`settings.${tpl.nameKey}`, tpl.defaultName)}
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {t(`settings.${tpl.descKey}`, tpl.defaultDesc)}
                    </p>
                  </div>
                </div>

                {/* Color Swatch Dots */}
                <div className="pt-3 border-t border-border/50 mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">Colors:</span>
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-border/60 shadow-xs"
                      style={{ backgroundColor: tpl.sidebarBg }}
                      title="Sidebar Background"
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-border/60 shadow-xs"
                      style={{ backgroundColor: tpl.activeBg }}
                      title="Active Accent"
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-border/60 shadow-xs"
                      style={{ backgroundColor: tpl.navbarBg }}
                      title="Navbar Background"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{tpl.id}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── SIDEBAR & NAVBAR DIMENSIONS & LAYOUT CONTROLS ──────────────── */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Layout size={14} className="text-primary" />
          <span>{t('settings.dimensionsAndLayout', 'Dimensions & Sizing Presets')}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sidebar Width Preset */}
          <div className="bg-card p-4 rounded-2xl border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">{t('settings.sidebarWidth', 'Sidebar Width')}</label>
              <span className="text-xs font-mono font-bold text-primary">{currentSidebar.width || 260}px</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: t('settings.widthCompact', 'Compact'), val: 220 },
                { label: t('settings.widthStandard', 'Standard'), val: 260 },
                { label: t('settings.widthSpacious', 'Spacious'), val: 280 },
              ].map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => handleWidthChange(w.val)}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
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
          <div className="bg-card p-4 rounded-2xl border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">{t('settings.menuItemRadius', 'Menu Item Corners')}</label>
              <span className="text-xs font-mono text-muted-foreground">{currentSidebar.roundedStyle || 'rounded-xl'}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
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
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
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
          <div className="bg-card p-4 rounded-2xl border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">{t('settings.navbarShadow', 'Navbar Elevation')}</label>
              <span className="text-xs font-mono text-muted-foreground">{currentNavbar.shadow || 'sm'}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
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
                  className={`py-1.5 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
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

      {/* ─── ADVANCED CUSTOM COLOR PALETTES (ACCORDION) ─────────────────── */}
      <div className="pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => setShowAdvancedColors(!showAdvancedColors)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Palette size={16} className="text-primary" />
            <div className="text-left">
              <h5 className="text-xs font-bold text-foreground">{t('settings.customColorOverrides', 'Fine-Tuned Custom Color Overrides')}</h5>
              <p className="text-[11px] text-muted-foreground">{t('settings.customColorOverridesDesc', 'Manually adjust individual background, text, and border hex codes')}</p>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
            {showAdvancedColors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showAdvancedColors && (
          <div className="mt-4 p-5 rounded-2xl border border-border bg-card/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                {t('settings.sidebarBg', 'Sidebar Background')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentSidebar.bgColor || '#0f172a'}
                  onChange={(e) => customizer.updateSidebar({ bgColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentSidebar.bgColor || '#0f172a'}
                  onChange={(e) => customizer.updateSidebar({ bgColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                {t('settings.activeBg', 'Active Item Background')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentSidebar.activeBgColor || '#ec4899'}
                  onChange={(e) => customizer.updateSidebar({ activeBgColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentSidebar.activeBgColor || '#ec4899'}
                  onChange={(e) => customizer.updateSidebar({ activeBgColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                {t('settings.sidebarText', 'Sidebar Text Color')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentSidebar.textColor || '#94a3b8'}
                  onChange={(e) => customizer.updateSidebar({ textColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentSidebar.textColor || '#94a3b8'}
                  onChange={(e) => customizer.updateSidebar({ textColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                {t('settings.navbarBg', 'Navbar Background')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentNavbar.bgColor || '#ffffff'}
                  onChange={(e) => customizer.updateNavbar({ bgColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentNavbar.bgColor || '#ffffff'}
                  onChange={(e) => customizer.updateNavbar({ bgColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                {t('settings.navbarBorder', 'Navbar Border Color')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentNavbar.borderColor || '#e2e8f0'}
                  onChange={(e) => customizer.updateNavbar({ borderColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentNavbar.borderColor || '#e2e8f0'}
                  onChange={(e) => customizer.updateNavbar({ borderColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                {t('settings.navbarText', 'Navbar Text Color')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentNavbar.textColor || '#0f172a'}
                  onChange={(e) => customizer.updateNavbar({ textColor: e.target.value })}
                  className="w-9 h-9 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentNavbar.textColor || '#0f172a'}
                  onChange={(e) => customizer.updateNavbar({ textColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelsTab
