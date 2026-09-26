import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  Check,
  ShoppingCart,
} from 'lucide-react'
import ProductCard from '@/components/ecommerce/ProductCard'
import ProductPrice from '@/components/ecommerce/ProductPrice'
import RatingStars from '@/components/ecommerce/RatingStars'
import WishlistButton from '@/components/ecommerce/WishlistButton'
import ImageWithFallback from '@/components/common/ImageWithFallback'
import Spinner from '@/components/ui/Spinner'
import PageTransition from '@/components/common/PageTransition'
import SEOHead from '@/components/seo/SEOHead'
import { useSettingsStore } from '@/stores'
import { useWishlist } from '@/hooks/useWishlist'
import { useAddToCart } from '@/hooks/useAddToCart'
import { cn, getImageUrl } from '@/lib/utils'
import productService from '@/services/productService'
import { SITE_NAME, SITE_URL } from '@/config/seo'

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc')

  const { formatPrice } = useSettingsStore()
  const { addToCart, isAdding, isAdded } = useAddToCart()

  useEffect(() => {
    if (!slug) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    setLoading(true)
    productService
      .getProduct(slug)
      .then((prod) => {
        setProduct(prod)
        if (prod?.images?.length) {
          const firstImg = typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].url
          setActiveImage(firstImg)
        } else if (prod?.image) {
          setActiveImage(prod.image)
        }
        if (prod?.variants?.length) {
          setSelectedVariant(prod.variants[0])
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      })
  }, [slug])

  if (loading) {
    return (
      <>
        <SEOHead title="Loading Product..." robots="noindex, follow" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <SEOHead title="Product Not Found" robots="noindex, follow" />
        <div className="container-site py-24 min-h-[55vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center text-[#f58220] mb-2 shadow-xs">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Product Not Found</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            The product you are looking for might have been retired, sold out, or moved to another link.
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f58220] hover:bg-[#e07110] text-white text-xs font-bold shadow-xs active:scale-95 transition-all">
            Browse All Products
          </Link>
        </div>
      </>
    )
  }

  const currentPrice = selectedVariant
    ? selectedVariant.selling_price
    : product.selling_price || product.price || 0
  const comparePrice = selectedVariant
    ? selectedVariant.compare_price
    : product.compare_price

  const handleAddToCart = async (buyNow = false) => {
    const success = await addToCart(
      product.id,
      quantity,
      selectedVariant?.id || null
    )
    if (success && buyNow) {
      navigate('/checkout')
    }
  }

  // ── SEO Data ────────────────────────────────────────────────────────────
  const seoTitle = product.meta_title || `${product.name} | Buy Online`
  const seoDescription =
    product.meta_description ||
    product.short_description ||
    product.description ||
    ''
  const primaryImageUrl = getImageUrl(activeImage || product.images?.[0]?.url || product.image)
  const canonicalPath = `/products/${product.slug}`

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: seoDescription,
    sku: product.sku || `SKU-${product.id}`,
    url: `${SITE_URL}${canonicalPath}`,
    image: primaryImageUrl,
    ...(product.brand
      ? {
          brand: {
            '@type': 'Brand',
            name: typeof product.brand === 'string' ? product.brand : product.brand.name,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: currentPrice,
      priceValidUntil: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        (product.stock ?? product.stock_quantity ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}${canonicalPath}`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    ...(product.rating_avg && product.rating_count
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating_avg,
            reviewCount: product.rating_count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    ...(product.category
      ? [
          {
            name:
              typeof product.category === 'string'
                ? product.category
                : product.category.name,
            url: `/category/${
              typeof product.category === 'string'
                ? product.category_slug
                : product.category.slug
            }`,
          },
        ]
      : []),
    { name: product.name, url: canonicalPath },
  ]

  const adding = isAdding(product.id)
  const added = isAdded(product.id)

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalPath}
        ogType="product"
        ogImage={primaryImageUrl}
        schema={productSchema}
        breadcrumbs={breadcrumbs}
      />

      <PageTransition className="container-site py-8 space-y-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-slate-500"
        >
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/products"
            className="hover:text-slate-900 dark:hover:text-white"
          >
            Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/category/${
                  typeof product.category === 'string'
                    ? product.category_slug
                    : product.category.slug
                }`}
                className="hover:text-slate-900 dark:hover:text-white"
              >
                {typeof product.category === 'string'
                  ? product.category
                  : product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {product.name}
          </span>
        </nav>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Left: Image Gallery ───────────────────────────────────── */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <ImageWithFallback
                src={activeImage || product.images?.[0]?.url || product.image}
                alt={product.name}
                aspectRatio="square"
                className="w-full h-full object-cover"
              />
              {product.discount_percent > 0 && (
                <span className="absolute top-4 left-4 badge-discount px-3 py-1 text-xs font-bold rounded-xl shadow-sm">
                  -{product.discount_percent}% OFF
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img: any, idx: number) => {
                  const url = typeof img === 'string' ? img : img.url
                  return (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImage(url)}
                      className={cn(
                        'w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer',
                        activeImage === url
                          ? 'border-blue-600 scale-95 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      )}
                    >
                      <ImageWithFallback
                        src={url}
                        alt=""
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ───────────────────────────────────── */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {typeof product.brand === 'string'
                    ? product.brand
                    : product.brand.name}
                </span>
              )}
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
                {product.name}
              </h1>

              {/* Ratings summary */}
              <div className="flex items-center gap-3 mt-3">
                <RatingStars
                  rating={product.rating_avg || 4.8}
                  count={product.rating_count || 14}
                  size="md"
                  showScore
                />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock & Ready to Ship
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <ProductPrice
                price={currentPrice}
                comparePrice={comparePrice}
                size="xl"
                showDiscountBadge
              />
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Variants Selector */}
            {product.variants?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Option / Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                        selectedVariant?.id === v.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      )}
                    >
                      {v.name} ({formatPrice(v.selling_price)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-sm min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Wishlist Button */}
                <WishlistButton productId={product.id} size="lg" />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={adding}
                  className="btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg rounded-2xl"
                >
                  {adding ? (
                    <Spinner size="sm" />
                  ) : added ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {adding ? 'Adding...' : added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  className="btn bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg rounded-2xl cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <RefreshCw className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>30-Day Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs (Description, Reviews) ─────────────────────────────── */}
        <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
            {(['desc', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'py-3 text-sm font-bold border-b-2 transition-colors capitalize cursor-pointer',
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {tab === 'desc' ? 'Description' : 'Customer Reviews'}
              </button>
            ))}
          </div>

          {activeTab === 'desc' && (
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description ||
                'No detailed description available for this product.'}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Customer Reviews
              </h3>
              {product.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((rev: any) => (
                    <div key={rev.id} className="card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {rev.name}
                        </div>
                        <RatingStars rating={rev.rating} size="xs" />
                      </div>
                      {rev.title && (
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {rev.title}
                        </div>
                      )}
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {rev.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No customer reviews yet.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Related Products ────────────────────────────────────────── */}
        {product.related_products?.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="section-title font-display text-xl font-bold">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {product.related_products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </PageTransition>
    </>
  )
}

export default ProductDetailPage
