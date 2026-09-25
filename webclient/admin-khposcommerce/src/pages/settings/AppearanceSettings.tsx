import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useThemeStore, type WidgetConfig } from '@/stores/themeStore'
import { Palette, Type, Sliders, Layout, Grid, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'
import ConfirmModal from '@/components/common/modals/ConfirmModal'
import { DEFAULT_WIDGETS_LIST } from '@/config/dashboardWidgets'

import { TemplatesTab } from './components/tabs/TemplatesTab'
import { PanelsTab } from './components/tabs/PanelsTab'
import { TypographyTab } from './components/tabs/TypographyTab'
import { LayoutTab } from './components/tabs/LayoutTab'
import { WidgetsTab } from './components/tabs/WidgetsTab'
import type { ThemeTemplate, PanelTemplate, UnifiedThemeTemplate } from './types/settings.types'

type TabId = 'theme' | 'fonts' | 'panels' | 'components' | 'widgets'

const AppearanceSettings: React.FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  const customizer = useThemeStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const currentSubTab = (searchParams.get('subTab') as TabId) || 'panels'
  const [activeTab, setActiveTabState] = useState<TabId>(currentSubTab)

  useEffect(() => {
    const param = searchParams.get('subTab') as TabId
    if (param && param !== activeTab) {
      setActiveTabState(param)
    }
  }, [searchParams])

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab)
    setSearchParams(
      prev => {
        const updated = new URLSearchParams(prev)
        updated.set('subTab', tab)
        return updated
      },
      { replace: true }
    )
  }

  const [soundMuted, setSoundMuted] = useState(sound.isMutedSound())
  const [showResetModal, setShowResetModal] = useState(false)
  const [widgetSearch, setWidgetSearch] = useState('')
  const [widgetCategoryFilter, setWidgetCategoryFilter] = useState<string>('all')

  const fullWidgetsList = React.useMemo(() => {
    const map = new Map((customizer.widgetsList || []).map((w) => [w.id, w]))
    const merged: WidgetConfig[] = DEFAULT_WIDGETS_LIST.map((def) => {
      if (map.has(def.id)) {
        return map.get(def.id)!
      }
      return def
    })
    return merged.sort((a, b) => a.order - b.order)
  }, [customizer.widgetsList])

  const handleWidgetToggle = (id: string) => {
    sound.playClick()
    const list = fullWidgetsList.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    customizer.updateWidgetsList(list)
  }

  const handleWidgetSize = (id: string, size: 'small' | 'medium' | 'large') => {
    sound.playClick()
    const list = fullWidgetsList.map((w) => (w.id === id ? { ...w, size } : w))
    customizer.updateWidgetsList(list)
  }

  const moveWidget = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    sound.playClick()
    const list = [...fullWidgetsList]
    if (direction === 'top') {
      const item = list.splice(index, 1)[0]
      list.unshift(item)
    } else if (direction === 'bottom') {
      const item = list.splice(index, 1)[0]
      list.push(item)
    } else {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= list.length) return
      const temp = list[index]
      list[index] = list[targetIndex]
      list[targetIndex] = temp
    }
    const reordered = list.map((w, idx) => ({ ...w, order: idx }))
    customizer.updateWidgetsList(reordered)
  }

  const handleShowAllWidgets = () => {
    sound.playSuccess()
    const updated = fullWidgetsList.map((w) => ({ ...w, visible: true }))
    customizer.updateWidgetsList(updated)
  }

  const handleHideAllWidgets = () => {
    sound.playClick()
    const updated = fullWidgetsList.map((w) => ({ ...w, visible: false }))
    customizer.updateWidgetsList(updated)
  }

  const handleResetWidgetsToDefault = () => {
    sound.playSuccess()
    customizer.updateWidgetsList(DEFAULT_WIDGETS_LIST)
  }

  const handleApplyPresetLayout = (presetId: string) => {
    sound.playSuccess()
    let list: WidgetConfig[] = []
    if (presetId === 'sales_focus') {
      const visibleIds = ['today_sales', 'today_orders', 'sales_overview', 'category_sales', 'recent_orders', 'quick_actions']
      list = DEFAULT_WIDGETS_LIST.map((w, idx) => ({
        ...w,
        visible: visibleIds.includes(w.id),
        order: visibleIds.indexOf(w.id) !== -1 ? visibleIds.indexOf(w.id) : 10 + idx,
      }))
    } else if (presetId === 'inventory_focus') {
      const visibleIds = ['total_products', 'low_stock', 'business_alerts', 'system_health', 'recent_activities']
      list = DEFAULT_WIDGETS_LIST.map((w, idx) => ({
        ...w,
        visible: visibleIds.includes(w.id),
        order: visibleIds.indexOf(w.id) !== -1 ? visibleIds.indexOf(w.id) : 10 + idx,
      }))
    } else if (presetId === 'compact') {
      const visibleIds = ['today_sales', 'sales_overview', 'low_stock', 'recent_orders']
      list = DEFAULT_WIDGETS_LIST.map((w, idx) => ({
        ...w,
        visible: visibleIds.includes(w.id),
        order: visibleIds.indexOf(w.id) !== -1 ? visibleIds.indexOf(w.id) : 10 + idx,
      }))
    } else {
      list = DEFAULT_WIDGETS_LIST
    }
    customizer.updateWidgetsList(list.sort((a, b) => a.order - b.order))
  }

  const handleApplyUnifiedTemplate = (tpl: UnifiedThemeTemplate) => {
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

  const handleApplyTemplate = (tpl: ThemeTemplate) => {
    customizer.updatePrimaryColor(tpl.primaryColor)
    customizer.updateThemeMode(tpl.mode)
  }

  const handleApplyPanelTemplate = (tpl: PanelTemplate) => {
    customizer.updateSidebar({
      bgColor: tpl.sidebarBg,
      textColor: tpl.sidebarText,
      activeBgColor: tpl.activeBg,
      activeTextColor: tpl.activeText,
    })
    customizer.updateNavbar({
      bgColor: tpl.navbarBg,
      textColor: tpl.navbarText,
      borderColor: tpl.navbarBorder,
    })
    sound.playClick()
  }

  return (
    <div className="bg-card dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-border dark:border-slate-800 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
      {/* Sidebar Tabs */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border dark:border-slate-800 bg-muted/20 dark:bg-slate-950/40 p-2.5 sm:p-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible shrink-0">
        {[
          { id: 'theme', label: t('settings.tabThemeAndPanels', 'Theme, Sidebar & Navbar'), icon: <Palette size={16} /> },
          { id: 'fonts', label: t('settings.tabTypography', 'Typography'), icon: <Type size={16} /> },
          { id: 'components', label: t('settings.tabComponents', 'UI Components'), icon: <Layout size={16} /> },
          { id: 'widgets', label: t('settings.tabWidgets', 'Dashboard Widgets'), icon: <Grid size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 lg:shrink ${
              activeTab === tab.id || (tab.id === 'theme' && activeTab === 'panels') ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground dark:text-slate-400 hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-border dark:border-slate-800 hidden lg:block p-2">
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 border border-red-500/20 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
            {t('settings.resetDefaultsBtn', 'Reset All Defaults')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 min-w-0 overflow-x-hidden">
        {activeTab === 'theme' || activeTab === 'panels' ? (
          <TemplatesTab
            customizer={customizer}
            handleApplyUnifiedTemplate={handleApplyUnifiedTemplate}
            handleApplyTemplate={handleApplyTemplate}
            handleApplyPanelTemplate={handleApplyPanelTemplate}
          />
        ) : activeTab === 'fonts' ? (
          <TypographyTab customizer={customizer} />
        ) : activeTab === 'components' ? (
          <LayoutTab
            customizer={customizer}
            soundMuted={soundMuted}
            setSoundMuted={setSoundMuted}
          />
        ) : (
          <WidgetsTab
            fullWidgetsList={fullWidgetsList}
            widgetSearch={widgetSearch}
            setWidgetSearch={setWidgetSearch}
            widgetCategoryFilter={widgetCategoryFilter}
            setWidgetCategoryFilter={setWidgetCategoryFilter}
            handleWidgetToggle={handleWidgetToggle}
            handleWidgetSize={handleWidgetSize}
            moveWidget={moveWidget}
            handleShowAllWidgets={handleShowAllWidgets}
            handleHideAllWidgets={handleHideAllWidgets}
            handleResetWidgetsToDefault={handleResetWidgetsToDefault}
            handleApplyPresetLayout={handleApplyPresetLayout}
          />
        )}
      </div>

      {/* Reset Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          customizer.resetAll()
          sound.playSuccess()
          setShowResetModal(false)
        }}
        title="Reset All Appearance Settings"
        message="Are you sure you want to reset all themes, typography, and widget preferences to system defaults?"
      />
    </div>
  )
}

export default AppearanceSettings
