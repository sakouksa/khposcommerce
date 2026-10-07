import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import Spinner from '@/components/ui/Spinner'
import PageTransition from '@/components/common/PageTransition'
import SEOHead from '@/components/seo/SEOHead'

const BlogPage: React.FC = () => {
  const [blogs, setBlogs]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/blog')
      .then(({ data }) => setBlogs(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const seoElement = (
    <SEOHead
      title="Blog | Tech Articles, Product Guides & Store News"
      description="Explore technology articles, product guides, and store updates from Enterprise Store. Stay informed on the latest electronics and tech trends in Cambodia."
      canonical="/blog"
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
      ]}
    />
  )

  if (loading) {
    return (
      <>
        {seoElement}
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </>
    )
  }

  return (
    <>
      {seoElement}
    <PageTransition className="container-site py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
          Latest News & Tech Articles
        </h1>
        <p className="text-xs text-gray-500 mt-1">Product guides, technology reviews, and store updates</p>
      </div>

      {blogs.length === 0 ? (
        <div className="card p-12 text-center text-xs text-gray-500">No blog posts available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((b) => {
            const imgSrc = b.featured_image || b.thumbnail || b.image_url || b.image
            const catName = typeof b.category === 'object' && b.category !== null
              ? (b.category.name || 'Retail')
              : (typeof b.category === 'string' ? b.category : (b.category_name || 'Retail'))
            return (
              <Link key={b.id} to={`/blog/${b.slug}`} className="card-hover overflow-hidden flex flex-col">
                {imgSrc && <img src={imgSrc} alt={b.title} className="w-full h-48 object-cover" />}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-blue-600 mb-1">{catName}</div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2">{b.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mt-1">{b.excerpt || b.summary}</p>
                  </div>
                  <div className="text-[10px] text-gray-400">{b.published_at ? new Date(b.published_at).toLocaleDateString() : ''}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageTransition>
    </>
  )
}

export default BlogPage
