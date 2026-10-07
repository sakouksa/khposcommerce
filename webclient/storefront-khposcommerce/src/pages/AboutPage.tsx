import React, { useState, useEffect } from 'react'
import { ShieldCheck, Award, Truck } from 'lucide-react'
import PageTransition from '@/components/common/PageTransition'
import SEOHead from '@/components/seo/SEOHead'
import { useStoreSettings } from '@/hooks'
import api from '@/lib/api'

const AboutPage: React.FC = () => {
  const { data: storeSettings } = useStoreSettings()
  const siteName = storeSettings?.site_name || 'NexTech Tbong Khmum'
  const [cmsPage, setCmsPage] = useState<any>(null)

  useEffect(() => {
    api.get('/pages/about-us')
      .then(({ data }) => {
        if (data?.data) {
          setCmsPage(data.data)
        }
      })
      .catch(() => {
        // Fallback to default
      })
  }, [])

  return (
    <>
      <SEOHead
        title={cmsPage?.meta_title || `About Us | ${siteName}`}
        description={cmsPage?.meta_description || `Learn about ${siteName} — Cambodia's leading e-commerce and POS platform. We deliver authentic electronics, laptops, smartphones, and POS hardware across all 25 provinces.`}
        canonical="/about"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About Us', url: '/about' },
        ]}
      />
      <PageTransition className="container-site py-12 space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white font-display">
            {cmsPage?.title || `About ${siteName}`}
          </h1>
          {cmsPage?.content ? (
            <div
              className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cmsPage.content }}
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
              We are Cambodia's leading omnichannel retail and POS platform delivering premium authentic electronics, laptops, smartphones, gaming accessories, and POS hardware across all 25 provinces.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">100% Authentic Products</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sourced directly from authorized manufacturers and official distributors.</p>
          </div>

          <div className="card p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Nationwide Fast Express</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Same-day delivery in Phnom Penh and 1-2 day express shipping across all 25 provinces.</p>
          </div>

          <div className="card p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Award-Winning Service</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Trusted by over 100,000+ active happy customers and retail merchants nationwide.</p>
          </div>
        </div>
      </PageTransition>
    </>
  )
}

export default AboutPage
