import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Home, ArrowLeft, ShoppingBag, Layers } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'
import PageTransition from '@/components/common/PageTransition'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      <SEOHead
        title="404 — Page Not Found"
        description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
        robots="noindex, follow"
      />

      <PageTransition className="container-site py-16 max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
            <span className="text-4xl font-black font-display">404</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
            Oops! Page Not Found
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            The page you requested does not exist or has been moved. Try searching our catalog or explore popular categories below.
          </p>
        </div>

        {/* Quick Search Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Search laptops, smartphones, accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs py-2 px-4 font-bold rounded-xl"
          >
            Search
          </button>
        </form>

        {/* Action Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2 py-3 px-5 text-xs font-bold rounded-xl shadow-md"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>

          <Link
            to="/products"
            className="btn-secondary inline-flex items-center gap-2 py-3 px-5 text-xs font-bold rounded-xl"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Catalog
          </Link>
        </div>

        {/* Popular Categories Shortcut */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Popular Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {['Laptops & Computers', 'Smartphones & Tablets', 'Gaming Gear', 'Audio & Headphones', 'POS Systems'].map((cat, i) => (
              <Link
                key={i}
                to="/products"
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold text-slate-600 dark:text-slate-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </PageTransition>
    </>
  )
}

export default NotFoundPage
