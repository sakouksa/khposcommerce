import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ShieldCheck, FileText, Truck, RefreshCw, HelpCircle } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'
import PageTransition from '@/components/common/PageTransition'
import Spinner from '@/components/ui/Spinner'
import api from '@/lib/api'
import { SITE_NAME, SITE_URL } from '@/config/seo'

interface PolicyConfig {
  title: string
  subtitle: string
  icon: React.ElementType
  metaDescription: string
  defaultContent: string
}

const POLICY_DATA: Record<string, PolicyConfig> = {
  terms: {
    title: 'Terms of Service',
    subtitle: 'Please review our commercial terms, purchasing policies, and user agreements.',
    icon: FileText,
    metaDescription: 'Read the official Terms of Service for Enterprise Store Cambodia. Understand our ordering, payment, warranty, and consumer guidelines.',
    defaultContent: `
      <h2>1. Introduction & Acceptance</h2>
      <p>Welcome to Enterprise Store. By accessing or using our website, services, or purchasing products from our catalog, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our storefront.</p>
      
      <h2>2. Products & Pricing</h2>
      <p>All products listed in our catalog are 100% genuine and sourced directly from authorized manufacturers and official distributors. Prices are displayed in US Dollars (USD) and Khmer Riel (KHR) and include applicable commercial taxes unless otherwise stated. We reserve the right to correct any typographical or pricing errors.</p>
      
      <h2>3. Orders & Payment</h2>
      <p>Orders placed through our website are subject to acceptance and product availability. We support ABA KHQR, ACLEDA Mobile, Visa, Mastercard, and Cash on Delivery (COD). Upon receipt of your order, an electronic confirmation receipt is generated.</p>
      
      <h2>4. Warranties & Hardware Support</h2>
      <p>All consumer hardware, enterprise laptops, desktop computers, and POS accessories come with standard manufacturer warranties. Authorized warranty claims can be processed at our official Service & Repair Center in Phnom Penh.</p>
      
      <h2>5. Governing Law</h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws of the Kingdom of Cambodia.</p>
    `,
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we collect, protect, and handle your customer data with 256-bit SSL encryption.',
    icon: ShieldCheck,
    metaDescription: 'Learn how Enterprise Store protects your privacy and personal data in accordance with Cambodian data protection regulations.',
    defaultContent: `
      <h2>1. Information We Collect</h2>
      <p>We collect personal information necessary to fulfill your orders, provide customer support, and improve your shopping experience. This includes your name, email address, phone number, shipping address in Cambodia, and transaction history.</p>
      
      <h2>2. Use of Information</h2>
      <p>Your information is used strictly to process orders, deliver packages via our express logistics network, send order status notifications, and communicate important service updates.</p>
      
      <h2>3. Payment Security</h2>
      <p>All digital payments via ABA KHQR and credit cards are processed through PCI-DSS compliant secure payment gateways with 256-bit SSL encryption. We do not store full credit card numbers on our servers.</p>
      
      <h2>4. Cookies & Analytics</h2>
      <p>We use essential cookies to maintain your shopping cart and user preferences (such as selected language and currency). Analytics cookies help us improve site performance and search relevance.</p>
      
      <h2>5. Your Rights</h2>
      <p>You may request access to, correction of, or deletion of your account profile data at any time through your Customer Account Dashboard or by contacting customer support.</p>
    `,
  },
  shipping: {
    title: 'Shipping & Delivery Policy',
    subtitle: 'Express 1-hour delivery in Phnom Penh and nationwide shipping across all 25 provinces.',
    icon: Truck,
    metaDescription: 'Discover our nationwide shipping options, delivery timeframes, and rates across Phnom Penh and all 25 provinces in Cambodia.',
    defaultContent: `
      <h2>1. Delivery Areas & Coverage</h2>
      <p>We provide nationwide delivery services across all 25 provinces in the Kingdom of Cambodia, including Phnom Penh, Kandal, Siem Reap, Battambang, Sihanoukville, Kampong Cham, and surrounding regions.</p>
      
      <h2>2. Delivery Timeframes</h2>
      <ul>
        <li><strong>Phnom Penh Express:</strong> Same-day delivery within 1 to 3 hours for orders placed before 4:00 PM.</li>
        <li><strong>Provincial Delivery:</strong> 1 to 2 business days via reliable express courier partners (VET, J&T, Kerry Express).</li>
      </ul>
      
      <h2>3. Shipping Rates</h2>
      <ul>
        <li><strong>Orders over $50:</strong> FREE standard delivery nationwide.</li>
        <li><strong>Phnom Penh standard delivery:</strong> $1.00 - $1.50</li>
        <li><strong>Provincial delivery:</strong> $1.50 - $2.50 depending on weight and province location.</li>
      </ul>
      
      <h2>4. Real-time Order Tracking</h2>
      <p>You can track your order at any time using your Order Number on our <a href="/track" class="text-blue-600 underline">Track Order</a> page.</p>
    `,
  },
  returns: {
    title: 'Returns & Refund Policy',
    subtitle: 'Hassle-free 30-day return policy and official manufacturer warranty claims.',
    icon: RefreshCw,
    metaDescription: 'Read our 30-day return and refund policy for electronics, computers, and POS accessories at Enterprise Store Cambodia.',
    defaultContent: `
      <h2>1. 30-Day Return Guarantee</h2>
      <p>If you are not completely satisfied with your purchase, you may return unopened and unused items in their original retail packaging within 30 days of delivery for an exchange or full refund.</p>
      
      <h2>2. Defective or Damaged Products</h2>
      <p>If you receive a product that is defective or damaged during transit, please notify our customer support team within 48 hours of delivery. We will arrange a free immediate replacement or full refund.</p>
      
      <h2>3. Refund Processing</h2>
      <p>Approved refunds are processed to your original payment method (ABA KHQR account or card) within 2 to 5 business days after our inspection team verifies the returned item.</p>
      
      <h2>4. Non-Returnable Items</h2>
      <p>Digital software licenses, gift cards, and opened consumable goods cannot be returned unless verified defective under warranty.</p>
    `,
  },
}

export const PolicyPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>()
  const location = useLocation()

  // Determine active policy key from path or slug
  const pathname = location.pathname.replace(/^\//, '').toLowerCase()
  const policyKey = (slug || pathname).split('/')[0]
  const config = POLICY_DATA[policyKey] || POLICY_DATA.terms

  const [dbPage, setDbPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/pages/${policyKey}`)
      .then(({ data }) => {
        if (data?.data) {
          setDbPage(data.data)
        }
      })
      .catch(() => {
        // Fall back to default rich content gracefully
      })
      .finally(() => setLoading(false))
  }, [policyKey])

  const title = dbPage?.title || config.title
  const content = dbPage?.content || config.defaultContent
  const metaDesc = dbPage?.meta_description || config.metaDescription
  const Icon = config.icon

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: metaDesc,
    url: `${SITE_URL}/${policyKey}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }

  return (
    <>
      <SEOHead
        title={title}
        description={metaDesc}
        canonical={`/${policyKey}`}
        schema={pageSchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: title, url: `/${policyKey}` },
        ]}
      />

      <PageTransition className="container-site py-12 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <Icon className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            {config.subtitle}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="card p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-6">
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Support Box */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Have additional questions regarding this policy?</span>
              </div>
              <Link to="/contact" className="btn-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5">
                Contact Customer Support
              </Link>
            </div>
          </div>
        )}
      </PageTransition>
    </>
  )
}

export default PolicyPage
