import React, { useState } from 'react'
import {
  Copy,
  Layers,
  Coins,
  Check,
} from 'lucide-react'
import {
  FlattenCard,
  FlattenTaskItem,
  FlattenTransactionItem,
  FlattenCryptoTxItem,
  FlattenPerformanceItem,
  FlattenActivityHistoryItem,
} from '../cards/FlattenCard'
import {
  FlattenProjectStatCard,
  FlattenCryptoStatCard,
  FlattenStatsGrid,
} from '../cards/FlattenStatCard'
import {
  FlattenRadialProgressCard,
  FlattenIncomeAnalyticsCard,
  FlattenTaskSummaryCard,
  FlattenMarketOverviewCard,
  FlattenCryptoStatsCard,
} from '../cards/FlattenChartCards'

export const FlattenShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'project' | 'crypto' | 'all'>('project')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen rounded-2xl">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0e5a77] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              Flutter 3 Flatten UI Cards Suite
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global reusable cards inspired by Flutter 3 Flatten Admin & Dashboard Template.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-850 self-start sm:self-auto border border-slate-300/60 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('project')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'project'
                ? 'bg-white dark:bg-slate-800 text-[#0e5a77] dark:text-cyan-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Project Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crypto')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'crypto'
                ? 'bg-white dark:bg-slate-800 text-[#0e5a77] dark:text-cyan-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Crypto Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-800 text-[#0e5a77] dark:text-cyan-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Card Components
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. PROJECT DASHBOARD CLONE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'project' || activeTab === 'all') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-[#0e5a77] dark:text-cyan-400" />
              Project Dashboard View
            </h2>
            <span className="text-xs text-slate-400">Flatten / Project / Dashboard</span>
          </div>

          {/* Top 4 Stat Cards */}
          <FlattenStatsGrid columns={4}>
            <FlattenProjectStatCard
              title="Total Tasks"
              value={2500}
              trend={{ value: '3.5', label: 'Project Progress', direction: 'up' }}
              color="teal"
            />
            <FlattenProjectStatCard
              title="Finished Tasks"
              value={1800}
              trend={{ value: '-2.3', label: 'Project Progress', direction: 'down' }}
              color="teal"
              delay={0.05}
            />
            <FlattenProjectStatCard
              title="Ongoing Tasks"
              value={500}
              trend={{ value: '4.1', label: 'Project Progress', direction: 'up' }}
              color="teal"
              delay={0.1}
            />
            <FlattenProjectStatCard
              title="Active Tasks"
              value={75}
              trend={{ value: '-1.1', label: 'Project Progress', direction: 'down' }}
              color="teal"
              delay={0.15}
            />
          </FlattenStatsGrid>

          {/* Middle Row 1: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FlattenRadialProgressCard
              title="Task Performance"
              rings={[
                { label: 'Assigned', value: 85, color: '#06b6d4' },
                { label: 'Active', value: 65, color: '#059669' },
                { label: 'Complete', value: 45, color: '#0e5a77' },
              ]}
            />
            <FlattenIncomeAnalyticsCard
              title="Income Analytics"
              segments={[
                { label: 'USA', value: 35, color: '#3b82f6' },
                { label: 'Germany', value: 20, color: '#f43f5e' },
                { label: 'China', value: 18, color: '#f97316' },
                { label: 'India', value: 12, color: '#eab308' },
                { label: 'Brazil', value: 7, color: '#10b981' },
                { label: 'Russia', value: 5, color: '#06b6d4' },
                { label: 'South Africa', value: 3, color: '#8b5cf6' },
              ]}
            />
          </div>

          {/* Middle Row 2: Task List + Recent Transactions + Task Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Task List */}
            <FlattenCard title="Task List">
              <FlattenTaskItem
                title="Finalize Financial"
                status="In Progress"
                statusVariant="amber"
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
              />
              <FlattenTaskItem
                title="Project Sync"
                status="Completed"
                statusVariant="emerald"
                avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
                completed={true}
              />
              <FlattenTaskItem
                title="Grocery Shopping"
                status="Pending"
                statusVariant="cyan"
                avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
              />
            </FlattenCard>

            {/* Recent Transaction */}
            <FlattenCard title="Recent Transaction">
              <FlattenTransactionItem
                initial="A"
                name="Alice"
                date="Nov 28, 2024 - 10:30AM"
                amount="50.00"
              />
              <FlattenTransactionItem
                initial="B"
                name="Bob"
                date="Nov 28, 2024 - 11:15AM"
                amount="75.00"
              />
              <FlattenTransactionItem
                initial="C"
                name="Charlie"
                date="Nov 28, 2024 - 01:20PM"
                amount="120.00"
              />
            </FlattenCard>

            {/* Task Summary */}
            <FlattenTaskSummaryCard
              title="Task Summary"
              onViewAll={() => alert('View All clicked')}
            />
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. CRYPTO DASHBOARD CLONE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'crypto' || activeTab === 'all') && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Coins size={18} className="text-emerald-500" />
              Crypto Dashboard View
            </h2>
            <span className="text-xs text-slate-400">Flatten / Crypto / Dashboard</span>
          </div>

          {/* Crypto Top 4 Stat Cards */}
          <FlattenStatsGrid columns={4}>
            <FlattenCryptoStatCard
              title="Ethereum"
              value="3200.00"
              trend={{ value: '250.75%', direction: 'up' }}
            />
            <FlattenCryptoStatCard
              title="Bitcoin"
              value="21500.00"
              trend={{ value: '100.10%', direction: 'up' }}
              delay={0.05}
            />
            <FlattenCryptoStatCard
              title="Ripple"
              value="0.90"
              trend={{ value: '-0.05%', direction: 'down' }}
              delay={0.1}
            />
            <FlattenCryptoStatCard
              title="Dogecoin"
              value="0.073"
              trend={{ value: '0.004%', direction: 'up' }}
              delay={0.15}
            />
          </FlattenStatsGrid>

          {/* Row 2: 3 List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Latest Transactions */}
            <FlattenCard title="Latest Transactions">
              <FlattenCryptoTxItem
                type="buy"
                title="Bought Ethereum"
                subtitle="Credit Card ***3"
                cryptoAmount="+1.5 ETH"
                fiatAmount="+$4800.00 USD"
              />
              <FlattenCryptoTxItem
                type="sell"
                title="Sold Bitcoin"
                subtitle="Bank Account"
                cryptoAmount="-0.03 BTC"
                fiatAmount="-$650.20 USD"
              />
              <FlattenCryptoTxItem
                type="transfer"
                title="Transferred Ripple"
                subtitle="Crypto Wallet"
                cryptoAmount="-500 XRP"
                fiatAmount="-$125.30 USD"
              />
              <FlattenCryptoTxItem
                type="buy"
                title="Bought Solana"
                subtitle="PayPal"
                cryptoAmount="+200 SOL"
                fiatAmount="+$3,980.10 USD"
              />
              <FlattenCryptoTxItem
                type="sell"
                title="Sold Dogecoin"
                subtitle="Debit Card ***7"
                cryptoAmount="-15,000 DOGE"
                fiatAmount="-$1,200.50 USD"
              />
            </FlattenCard>

            {/* Top Performance */}
            <FlattenCard title="Top Performance">
              <FlattenPerformanceItem
                name="Bitcoin"
                symbol="BTC"
                price="45,000"
                iconBg="bg-[#f7931a]"
              />
              <FlattenPerformanceItem
                name="Chainlink"
                symbol="LINK"
                price="25.50"
                iconBg="bg-[#375bd2]"
              />
              <FlattenPerformanceItem
                name="Dogecoin"
                symbol="DOGE"
                price="0.25"
                iconBg="bg-[#c2a633]"
              />
              <FlattenPerformanceItem
                name="Ethereum"
                symbol="ETH"
                price="3,200"
                iconBg="bg-[#627eea]"
              />
              <FlattenPerformanceItem
                name="Polkadot"
                symbol="DOT"
                price="12.75"
                iconBg="bg-[#e6007a]"
              />
            </FlattenCard>

            {/* Transaction History */}
            <FlattenCard title="Transaction History">
              <FlattenActivityHistoryItem
                type="send"
                title="Sent BTC"
                date="20 November 2024 3:00 PM"
                amount="0.075 BTC"
              />
              <FlattenActivityHistoryItem
                type="receive"
                title="Received ETH"
                date="19 November 2024 10:15 AM"
                amount="1.0 ETH"
              />
              <FlattenActivityHistoryItem
                type="upload"
                title="Sent LTC"
                date="18 November 2024 4:45 PM"
                amount="0.5 LTC"
              />
              <FlattenActivityHistoryItem
                type="receive"
                title="Received ADA"
                date="17 November 2024 9:00 AM"
                amount="800 ADA"
              />
              <FlattenActivityHistoryItem
                type="send"
                title="Sent DOGE"
                date="16 November 2024 12:30 PM"
                amount="5,000 DOGE"
              />
            </FlattenCard>
          </div>

          {/* Row 3: Market Overview & Crypto Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FlattenMarketOverviewCard />
            <FlattenCryptoStatsCard />
          </div>
        </section>
      )}

      {/* Code Snippet Quick Copy Guide */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Quick Code Examples / របៀបប្រើប្រាស់
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 font-mono text-xs">
            <div className="flex justify-between items-center mb-1 text-slate-400 font-sans font-medium">
              <span>Project Stat Card</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `<FlattenProjectStatCard
  title="Total Tasks"
  value={2500}
  trend={{ value: '3.5', label: 'Project Progress', direction: 'up' }}
/>`,
                    'p-stat'
                  )
                }
                className="text-cyan-600 hover:text-cyan-700 cursor-pointer flex items-center gap-1"
              >
                {copiedCode === 'p-stat' ? <Check size={12} /> : <Copy size={12} />}
                Copy
              </button>
            </div>
            <pre className="text-slate-700 dark:text-slate-300 overflow-x-auto">
{`<FlattenProjectStatCard
  title="Total Tasks"
  value={2500}
  trend={{ value: '3.5', label: 'Project Progress', direction: 'up' }}
/>`}
            </pre>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 font-mono text-xs">
            <div className="flex justify-between items-center mb-1 text-slate-400 font-sans font-medium">
              <span>Crypto Stat Card</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `<FlattenCryptoStatCard
  title="Ethereum"
  value="3200.00"
  trend={{ value: '250.75%', direction: 'up' }}
/>`,
                    'c-stat'
                  )
                }
                className="text-cyan-600 hover:text-cyan-700 cursor-pointer flex items-center gap-1"
              >
                {copiedCode === 'c-stat' ? <Check size={12} /> : <Copy size={12} />}
                Copy
              </button>
            </div>
            <pre className="text-slate-700 dark:text-slate-300 overflow-x-auto">
{`<FlattenCryptoStatCard
  title="Ethereum"
  value="3200.00"
  trend={{ value: '250.75%', direction: 'up' }}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlattenShowcase
