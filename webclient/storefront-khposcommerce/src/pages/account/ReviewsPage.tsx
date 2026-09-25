import React from 'react'
import { Star, MessageSquare, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export const ReviewsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              My Product Reviews
            </h2>
            <p className="text-xs text-slate-400">
              Ratings and verified feedback you submitted for purchased items
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-xs">
          <MessageSquare className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          No reviews submitted yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
          Share your experience with products you have purchased to help other shoppers and earn extra loyalty points!
        </p>
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f58220] hover:bg-[#e07110] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <span>View Orders to Review</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default ReviewsPage
