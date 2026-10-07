import React, { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Crown,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import axios from 'axios'

interface CompanyItem {
  id: number
  name: string
  slug: string
  email: string | null
  phone: string | null
  is_active: boolean
  owner_name?: string
  plan_name?: string
  plan_slug?: string
  branches_count?: number
  created_at?: string
}

export const ShopsPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/v1/platform/dashboard/stats')
      if (res.data?.success && res.data?.data?.recent_companies) {
        setCompanies(res.data.data.recent_companies)
      } else {
        // Fallback default list
        setCompanies([
          {
            id: 1,
            name: 'NexTech Cambodia Co., Ltd. (HQ) - សាខា A',
            slug: 'nextech-cambodia-co-ltd-hq-a',
            email: 'tbongkhmum@enterprise-pos.com',
            phone: '+85571888999',
            is_active: true,
            owner_name: 'Sokha Heng (Company Owner 👑)',
            plan_name: 'Business (អាជីវកម្មរីកចម្រើន)',
            plan_slug: 'business',
            branches_count: 3,
            created_at: '2026-09-28',
          },
          {
            id: 2,
            name: 'NexTech Electronics (Tbong Khmum) Co., Ltd. - សាខា B',
            slug: 'nextech-electronics-tbong-khmum-co-ltd-b',
            email: 'contact.branchb@nextech-cambodia.com',
            phone: '+85571888991',
            is_active: true,
            owner_name: 'Sokha Heng (Company Owner 👑)',
            plan_name: 'Starter (អាជីវកម្មខ្នាតតូច)',
            plan_slug: 'starter',
            branches_count: 1,
            created_at: '2026-09-28',
          },
          {
            id: 3,
            name: 'NexTech Retail Solutions (Siem Reap) Co., Ltd. - សាខា C',
            slug: 'nextech-retail-solutions-siem-reap-co-ltd-c',
            email: 'contact.branchc@nextech-cambodia.com',
            phone: '+85563963888',
            is_active: true,
            owner_name: 'Sokha Heng (Company Owner 👑)',
            plan_name: 'Enterprise (សហគ្រាសធំ)',
            plan_slug: 'enterprise',
            branches_count: 1,
            created_at: '2026-09-28',
          },
        ])
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Shops / Companies (ហាង និងក្រុមហ៊ុនទាំងអស់)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            គ្រប់គ្រង Tenants ទាំងអស់ដែលបានចុះឈ្មោះក្នុង Platform
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all active:scale-95">
          <Plus className="size-4" />
          <span>បង្កើតហាងថ្មី</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះក្រុមហ៊ុន ឬ Slug..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/70 dark:border-slate-700">
              <tr>
                <th className="py-3 px-5">ក្រុមហ៊ុន / ហាង</th>
                <th className="py-3 px-5">ម្ចាស់អាជីវកម្ម (Primary Owner 👑)</th>
                <th className="py-3 px-5">កញ្ចប់សេវា (Plan)</th>
                <th className="py-3 px-5 text-center">សាខា</th>
                <th className="py-3 px-5">ស្ថានភាព</th>
                <th className="py-3 px-5 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {shop.name}
                    </div>
                    <div className="text-xs text-slate-400">{shop.slug}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                      <Crown className="size-3.5 text-amber-500 shrink-0" />
                      <span>{shop.owner_name || 'Super Admin'}</span>
                    </div>
                    <div className="text-xs text-slate-400">{shop.phone || shop.email}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Layers className="size-3" />
                      {shop.plan_name || 'Business'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center font-bold text-slate-800 dark:text-slate-200">
                    {shop.branches_count || 1}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors">
                      <span>លម្អិត</span>
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ShopsPage
