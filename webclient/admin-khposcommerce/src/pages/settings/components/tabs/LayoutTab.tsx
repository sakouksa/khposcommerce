import React from 'react'
import { Layout, Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/common'
import { sound } from '@/utils/sound'

interface LayoutTabProps {
  customizer: any
  soundMuted: boolean
  setSoundMuted: (val: boolean) => void
}

const shadowOptions = [
  { value: 'none', labelKey: 'shadowNone', defaultLabel: 'No Shadow' },
  { value: 'sm', labelKey: 'shadowSm', defaultLabel: 'Small Shadow' },
  { value: 'md', labelKey: 'shadowMd', defaultLabel: 'Medium Shadow' },
  { value: 'lg', labelKey: 'shadowLg', defaultLabel: 'Large Shadow' },
]

const densityOptions = [
  { value: 'compact', labelKey: 'densityCompact', defaultLabel: 'Compact' },
  { value: 'comfortable', labelKey: 'densityComfortable', defaultLabel: 'Comfortable' },
  { value: 'spacious', labelKey: 'densitySpacious', defaultLabel: 'Spacious' },
]

const radiusPresets = [
  { value: '0px', labelKey: 'radiusSharp', defaultLabel: 'Sharp (0px)' },
  { value: '0.25rem', labelKey: 'radiusSm', defaultLabel: 'Small (4px)' },
  { value: '0.5rem', labelKey: 'radiusMd', defaultLabel: 'Medium (8px)' },
  { value: '0.75rem', labelKey: 'radiusLg', defaultLabel: 'Large (12px)' },
  { value: '1rem', labelKey: 'radiusXl', defaultLabel: 'Extra Large (16px)' },
]

const paddingPresets = [
  { value: '0.75rem', labelKey: 'paddingCompact', defaultLabel: 'Compact (12px)' },
  { value: '1rem', labelKey: 'paddingNormal', defaultLabel: 'Normal (16px)' },
  { value: '1.5rem', labelKey: 'paddingRelaxed', defaultLabel: 'Relaxed (24px)' },
  { value: '2rem', labelKey: 'paddingSpacious', defaultLabel: 'Spacious (32px)' },
]

export const LayoutTab: React.FC<LayoutTabProps> = ({
  customizer,
  soundMuted,
  setSoundMuted,
}) => {
  const { t } = useTranslation(['settings', 'common'])

  const toggleSoundMute = () => {
    const isMuted = sound.toggleMute()
    setSoundMuted(isMuted)
    if (!isMuted) sound.playClick()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">{t('settings.tabComponents', 'UI Components & Layout Density')}</h3>
        <p className="text-muted-foreground text-xs">Configure border radius, padding presets, shadows, and system audio feedback.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Border Radius</label>
          <Select
            value={customizer.borderRadius || '0.75rem'}
            onChange={(val) => customizer.updateBorderRadius(val)}
            options={radiusPresets.map((r) => ({ value: r.value, label: t(`settings.${r.labelKey}`, r.defaultLabel) }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Card Padding</label>
          <Select
            value={customizer.cardPadding || '1rem'}
            onChange={(val) => customizer.updateCardPadding(val)}
            options={paddingPresets.map((p) => ({ value: p.value, label: t(`settings.${p.labelKey}`, p.defaultLabel) }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Component Density</label>
          <Select
            value={customizer.density || 'comfortable'}
            onChange={(val) => customizer.updateDensity(val as any)}
            options={densityOptions.map((d) => ({ value: d.value, label: t(`settings.${d.labelKey}`, d.defaultLabel) }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Shadow Level</label>
          <Select
            value={customizer.shadowLevel || 'sm'}
            onChange={(val) => customizer.updateShadowLevel(val as any)}
            options={shadowOptions.map((s) => ({ value: s.value, label: t(`settings.${s.labelKey}`, s.defaultLabel) }))}
          />
        </div>
      </div>

      {/* Audio Effects Toggle */}
      <div className="border border-border p-4 rounded-2xl bg-card flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            {soundMuted ? <VolumeX size={16} className="text-muted-foreground" /> : <Volume2 size={16} className="text-primary" />}
            <span>System Audio & Click Sound Effects</span>
          </h4>
          <p className="text-[11px] text-muted-foreground">Play subtle click sounds on buttons, notifications, and POS checkout.</p>
        </div>
        <button
          type="button"
          onClick={toggleSoundMute}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            soundMuted ? 'bg-muted text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/20'
          }`}
        >
          {soundMuted ? 'Muted' : 'Sound Enabled'}
        </button>
      </div>
    </div>
  )
}

export default LayoutTab
