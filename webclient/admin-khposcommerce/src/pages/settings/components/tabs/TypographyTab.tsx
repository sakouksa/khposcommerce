import React from 'react'
import { Type } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/common'

interface TypographyTabProps {
  customizer: any
}

const fontFamilies = ['Default', 'Inter', 'Kantumruy Pro', 'system-ui', 'monospace', 'sans-serif']
const fontSizes = ['12px', '13px', '14px', '15px', '16px', '18px']
const fontWeights = ['300', '400', '500', '600', '700']
const lineHeights = ['1.2', '1.3', '1.4', '1.5', '1.6', '1.7']
const letterSpacings = ['-0.05em', '0px', '0.025em', '0.05em', '0.1em']

export const TypographyTab: React.FC<TypographyTabProps> = ({ customizer }) => {
  const { t } = useTranslation(['settings', 'common'])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">{t('settings.tabTypography', 'Typography')}</h3>
        <p className="text-muted-foreground text-xs">Configure font family, sizes, weights, and letter spacing across the dashboard UI.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Font Family</label>
          <Select
            value={customizer.fontFamily || 'Default'}
            onChange={(val) => customizer.updateTypography({ fontFamily: val })}
            options={fontFamilies.map((f) => ({ value: f, label: f }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Base Font Size</label>
          <Select
            value={customizer.fontSize || '14px'}
            onChange={(val) => customizer.updateTypography({ fontSize: val })}
            options={fontSizes.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Default Font Weight</label>
          <Select
            value={customizer.fontWeight || '400'}
            onChange={(val) => customizer.updateTypography({ fontWeight: val })}
            options={fontWeights.map((w) => ({ value: w, label: w }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Line Height</label>
          <Select
            value={customizer.lineHeight || '1.5'}
            onChange={(val) => customizer.updateTypography({ lineHeight: val })}
            options={lineHeights.map((h) => ({ value: h, label: h }))}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Letter Spacing</label>
          <Select
            value={customizer.letterSpacing || '0px'}
            onChange={(val) => customizer.updateTypography({ letterSpacing: val })}
            options={letterSpacings.map((l) => ({ value: l, label: l }))}
          />
        </div>
      </div>

      {/* Typography Preview */}
      <div className="border border-border p-4 rounded-2xl bg-muted/20 space-y-2">
        <span className="text-[10px] uppercase font-bold text-muted-foreground">Typography Live Preview</span>
        <h4 className="text-lg font-bold text-foreground">The quick brown fox jumps over the lazy dog.</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          អក្សរខ្មែរ កម្ពុជា ព័ត៌មានលម្អិត និងទិន្នន័យប្រព័ន្ធគ្រប់គ្រង Enterprise E-Commerce POS System.
        </p>
      </div>
    </div>
  )
}

export default TypographyTab
