import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Check, FolderClosed } from 'lucide-react'
import { CATEGORY_ICONS_MAP, CATEGORY_COLORS } from '../media/categoryIconConstants'

// ─── Component Props ───────────────────────────────────────────────────────────

export interface IconColorPickerProps {
  selectedIcon: string
  onSelectIcon: (iconName: string) => void
  selectedColor: string
  onSelectColor: (colorKey: string) => void
  previewTitle?: string
  previewCode?: string
  className?: string
}

export const IconColorPicker: React.FC<IconColorPickerProps> = ({
  selectedIcon = 'FolderClosed',
  onSelectIcon,
  selectedColor = 'blue',
  onSelectColor,
  previewTitle = '',
  previewCode = '',
  className = '',
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const [searchTerm, setSearchTerm] = useState('')

  const activeColorDef = CATEGORY_COLORS[selectedColor] || CATEGORY_COLORS.blue
  const ActiveIconComponent = CATEGORY_ICONS_MAP[selectedIcon] || FolderClosed

  // Filter icons based on search query
  const filteredIconKeys = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return Object.keys(CATEGORY_ICONS_MAP)
    return Object.keys(CATEGORY_ICONS_MAP).filter((key) => key.toLowerCase().includes(q))
  }, [searchTerm])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ─── Real-time Live Preview Card ─── */}
      <div className="p-3 rounded-2xl border border-border bg-muted/20 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>{t('finance.live_preview', 'Live Appearance Preview')}</span>
          <span className="text-[10px] font-medium lowercase text-muted-foreground/80">
            {selectedIcon} • {activeColorDef.label}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeColorDef.bg} ${activeColorDef.text} ${activeColorDef.border}`}
            >
              <ActiveIconComponent size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {previewTitle.trim() || t('finance.category_name_sample', 'Expense Category Name')}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {previewCode.trim() || 'EXP-SAMPLE'}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${activeColorDef.bg} ${activeColorDef.text} ${activeColorDef.border}`}
          >
            <ActiveIconComponent size={13} />
            <span className="text-[11px]">{t('finance.sample_badge', 'Category Badge')}</span>
          </span>
        </div>
      </div>

      {/* ─── Color Palette Selection ─── */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-foreground">
          {t('finance.category_color', 'Color Theme')}
        </label>
        <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl bg-card border border-border shadow-xs">
          {Object.values(CATEGORY_COLORS).map((c) => {
            const isSelected = selectedColor === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onSelectColor(c.key)}
                className={`relative w-7 h-7 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                  isSelected ? 'scale-110 shadow-sm ring-2 ring-foreground/20' : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              >
                {isSelected && <Check size={14} className="text-white drop-shadow-sm stroke-[2.5]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Icon Selector Grid with Search ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-foreground">
            {t('finance.select_icon', 'Select Category Icon')} ({filteredIconKeys.length})
          </label>
        </div>

        {/* Search Filter for Icons */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('finance.search_icon', 'Search icons (e.g. food, bill, wifi, car)...')}
            className="w-full h-8 pl-8 pr-3 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
          />
        </div>

        {/* Icon Grid */}
        <div className="max-h-48 overflow-y-auto p-2 bg-card border border-border rounded-xl grid grid-cols-7 sm:grid-cols-9 gap-1.5 scrollbar-thin shadow-xs">
          {filteredIconKeys.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
              {t('finance.no_icons_found', 'No icons matching search')}
            </div>
          ) : (
            filteredIconKeys.map((iconKey) => {
              const IconComp = CATEGORY_ICONS_MAP[iconKey]
              if (!IconComp) return null
              const isSelected = selectedIcon === iconKey

              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => onSelectIcon(iconKey)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? `${activeColorDef.bg} ${activeColorDef.text} ${activeColorDef.border} border-2 shadow-xs scale-105`
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                  title={iconKey}
                >
                  <IconComp size={18} />
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default IconColorPicker
