import React from 'react'
import { Construction, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  subtitle?: string
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle = 'ផ្នែកនេះត្រូវបានរៀបចំរួចជាស្រេចនៅក្នុងស្ថាបត្យកម្ម Multi-Tenant SaaS'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-800">
        <Construction className="size-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        {subtitle}
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
      >
        <ArrowLeft className="size-4" />
        <span>ត្រឡប់ទៅ Platform Dashboard</span>
      </Link>
    </div>
  )
}

export default PlaceholderPage
