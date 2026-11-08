import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, ShieldAlert, Layers } from 'lucide-react'
import type { NotificationStats } from '../types/notification.types'

interface NotificationAnalyticsChartsProps {
  stats: NotificationStats | null
}

const NotificationAnalyticsCharts: React.FC<NotificationAnalyticsChartsProps> = ({ stats }) => {
  if (!stats) return null

  const { by_type, by_priority, daily_trend, read_ratio } = stats.charts

  const totalPriorityCount = Object.values(by_priority).reduce((a, b) => a + b, 0) || 1
  const totalReadRatioCount = (read_ratio.read + read_ratio.unread) || 1
  const readPercentage = Math.round((read_ratio.read / totalReadRatioCount) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Chart 1: Notifications By Type */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-foreground">Notifications by Type</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {Object.keys(by_type).length} categories
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
            {Object.entries(by_type).map(([type, count]) => {
              const total = Object.values(by_type).reduce((a, b) => a + b, 0) || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="capitalize font-semibold text-foreground">{type}</span>
                    <span className="text-muted-foreground font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Chart 2: Notifications By Priority */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-foreground">Notifications by Priority</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { level: 'critical', label: 'Critical', color: 'bg-rose-500', count: by_priority['critical'] || 0 },
              { level: 'high', label: 'High', color: 'bg-amber-500', count: by_priority['high'] || 0 },
              { level: 'normal', label: 'Normal', color: 'bg-blue-500', count: by_priority['normal'] || 0 },
              { level: 'low', label: 'Low', color: 'bg-slate-400', count: by_priority['low'] || 0 },
            ].map((p) => {
              const pct = Math.round((p.count / totalPriorityCount) * 100)
              return (
                <div key={p.level} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-foreground">{p.label}</span>
                    <span className="text-muted-foreground font-mono">{p.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Chart 3: Unread vs Read Ratio */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-foreground">Read Ratio</span>
            </div>
            <span className="text-xs font-bold text-emerald-500">{readPercentage}% Read</span>
          </div>

          <div className="flex items-center justify-center p-3">
            <div className="relative w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
              <div className="text-center">
                <span className="text-xl font-black text-foreground">{read_ratio.read}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Read</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs border-t border-border/30 pt-2 mt-1">
            <div>
              <span className="text-[10px] text-muted-foreground block">Unread</span>
              <span className="font-bold text-rose-500">{read_ratio.unread}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Total</span>
              <span className="font-bold text-foreground">{totalReadRatioCount}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart 4: Daily 7-Day Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
        className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-foreground">Daily 7-Day Trend</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-28 pt-2">
            {daily_trend.map((item, idx) => {
              const maxCount = Math.max(...daily_trend.map((d) => d.count), 1)
              const heightPct = Math.max(15, Math.round((item.count / maxCount) * 100))
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div className="w-full bg-muted/60 rounded-t-md overflow-hidden flex items-end h-20">
                    <div
                      className="w-full bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">{item.date}</span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotificationAnalyticsCharts
