import React, { useEffect, useState } from 'react'
import {
  Layers,
  Check,
  Plus,
  Edit2,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react'
import axios from 'axios'

interface Plan {
  id: number
  name: string
  slug: string
  description: string
  price_monthly: number
  price_yearly: number
  max_branches: number
  max_users: number
  max_warehouses: number
  max_products: number
  features: Record<string, boolean>
  is_popular: boolean
}

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: 'Starter (អាជីវកម្មខ្នាតតូច)',
      slug: 'starter',
      description: 'ស័ក្តិសមសម្រាប់ហាងទោល ឬអាជីវកម្មទើបចាប់ផ្តើមដំណើរការ',
      price_monthly: 19,
      price_yearly: 190,
      max_branches: 1,
      max_users: 5,
      max_warehouses: 2,
      max_products: 500,
      features: {
        pos_enabled: true,
        ecommerce_enabled: false,
        advanced_reports: false,
        campaigns: false,
        mobile_app: true,
        khqr_payments: true,
      },
      is_popular: false,
    },
    {
      id: 2,
      name: 'Business (អាជីវកម្មរីកចម្រើន)',
      slug: 'business',
      description: 'ពេញនិយមបំផុត! គ្រប់គ្រងច្រើនសាខា ឃ្លាំង និងប្រព័ន្ធលក់ E-Commerce',
      price_monthly: 49,
      price_yearly: 490,
      max_branches: 5,
      max_users: 30,
      max_warehouses: 10,
      max_products: 10000,
      features: {
        pos_enabled: true,
        ecommerce_enabled: true,
        advanced_reports: true,
        campaigns: true,
        mobile_app: true,
        khqr_payments: true,
        multi_branch: true,
        audit_logs: true,
      },
      is_popular: true,
    },
    {
      id: 3,
      name: 'Enterprise (សហគ្រាសធំ)',
      slug: 'enterprise',
      description: 'សម្រាប់សហគ្រាសធំ មិនកំណត់ចំនួនសាខា មុខងារគ្រប់យ៉ាង និង AI Assistant',
      price_monthly: 129,
      price_yearly: 1290,
      max_branches: -1,
      max_users: -1,
      max_warehouses: -1,
      max_products: -1,
      features: {
        pos_enabled: true,
        ecommerce_enabled: true,
        advanced_reports: true,
        campaigns: true,
        mobile_app: true,
        khqr_payments: true,
        multi_branch: true,
        audit_logs: true,
        custom_domain: true,
        dedicated_support: true,
        ai_chatbot: true,
      },
      is_popular: false,
    },
  ])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            SaaS Subscription Plans (កញ្ចប់សេវាកម្ម)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            កំណត់តម្លៃ កម្រិត Limits និង Features សម្រាប់ក្រុមហ៊ុននីមួយៗ
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all active:scale-95">
          <Plus className="size-4" />
          <span>បង្កើត Plan ថ្មី</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative bg-white dark:bg-slate-800/90 rounded-2xl p-6 border shadow-sm flex flex-col justify-between
              ${plan.is_popular ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200/70 dark:border-slate-700'}
            `}
          >
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                ពេញនិយមបំផុត
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <Layers className="size-5 text-indigo-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-8">
                {plan.description}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ${plan.price_monthly}
                </span>
                <span className="text-xs text-slate-500">/ខែ (${plan.price_yearly}/ឆ្នាំ)</span>
              </div>

              {/* Limits */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>សាខាអតិបរមា:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan.max_branches === -1 ? 'Unlimited' : `${plan.max_branches} សាខា`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>បុគ្គលិក / Users:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan.max_users === -1 ? 'Unlimited' : `${plan.max_users} នាក់`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>ឃ្លាំងទំនិញ:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan.max_warehouses === -1 ? 'Unlimited' : `${plan.max_warehouses} ឃ្លាំង`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>ចំនួនទំនិញ:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan.max_products === -1 ? 'Unlimited' : `${plan.max_products} មុខ`}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-5 space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  មុខងាររួមបញ្ចូល:
                </p>
                {Object.entries(plan.features).map(([key, enabled]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {enabled ? (
                      <Check className="size-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="size-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                        ✕
                      </span>
                    )}
                    <span className={enabled ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400 line-through'}>
                      {key.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2">
                <Edit2 className="size-3.5" />
                <span>កែប្រែ Plan & Pricing</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlansPage
