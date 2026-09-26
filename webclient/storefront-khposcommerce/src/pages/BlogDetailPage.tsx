import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'
import Spinner from '@/components/ui/Spinner'
import PageTransition from '@/components/common/PageTransition'
import { getImageUrl } from '@/lib/utils'
import api from '@/lib/api'
import { SITE_NAME, SITE_URL } from '@/config/seo'

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams()
  const [post, setPost]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.get(`/blog/${slug}`)
      .then(({ data }) => setPost(data.data || data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <>
        <SEOHead title="Loading Article..." robots="noindex, follow" />
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </>
    )
  }

  if (!post) {
    return (
      <>
        <SEOHead title="Article Not Found" robots="noindex, follow" />
        <div className="container-site py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Article Not Found</h1>
          <p className="text-xs text-slate-500">The blog post you requested does not exist or has been removed.</p>
          <Link to="/blog" className="text-blue-600 hover:underline text-sm font-semibold">← Back to Blog</Link>
        </div>
      </>
    )
  }

  // ── SEO Data ─────────────────────────────────────────────────────────────
  const seoTitle       = post.meta_title || post.title
  const seoDescription = post.meta_description || post.excerpt || ''
  const ogImage        = post.featured_image ? getImageUrl(post.featured_image) : undefined
  const canonicalPath  = `/blog/${post.slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: seoDescription,
    image: ogImage || `${SITE_URL}/favicon.svg`,
    url: `${SITE_URL}${canonicalPath}`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    ...(post.author ? { author: { '@type': 'Person', name: typeof post.author === 'string' ? post.author : post.author?.name || `${SITE_NAME} Team` } } : {
      author: { '@type': 'Organization', name: SITE_NAME },
    }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalPath}
        ogType="article"
        ogImage={ogImage}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        schema={articleSchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: canonicalPath },
        ]}
      />

      <PageTransition className="container-site py-12 max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <Link to="/blog" className="text-xs text-blue-600 hover:underline flex items-center gap-1.5 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
        </Link>

        {/* Article Header */}
        <div className="space-y-4">
          {post.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              {typeof post.category === 'object' ? (post.category.name || 'Retail') : post.category}
            </span>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {post.author && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {typeof post.author === 'object' ? (post.author.name || 'Admin') : post.author}
              </span>
            )}
            {post.view_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.view_count} views
              </span>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="rounded-2xl overflow-hidden aspect-video">
            <img
              src={getImageUrl(post.featured_image)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed border-l-4 border-blue-500 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Article Content */}
        <article
          className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={post.content ? { __html: post.content } : undefined}
        >
          {!post.content && (
            <p className="text-gray-500 italic">Article content coming soon...</p>
          )}
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            {post.tags.map((tag: any) => (
              <span
                key={tag.id || tag}
                className="px-3 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/50 dark:border-blue-800/50"
              >
                #{tag.name || tag}
              </span>
            ))}
          </div>
        )}
      </PageTransition>
    </>
  )
}

export default BlogDetailPage
