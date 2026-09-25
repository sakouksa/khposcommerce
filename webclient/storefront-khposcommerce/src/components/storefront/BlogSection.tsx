import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Calendar, ArrowRight, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import { resolveMediaUrl } from '@/lib/utils'

export interface BlogPostItem {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  image?: string | null
  thumbnail?: string | null
  category?: string | null
  author?: string | null
  published_at?: string | null
}

interface BlogSectionProps {
  posts: BlogPostItem[]
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  const { t } = useTranslation()
  const fallbackPlaceholder = '/images/placeholder-product.png'

  if (!posts || posts.length === 0) return null

  return (
    <section className="container-site py-4 sm:py-6">
      <SectionHeader
        title={t('section.blog_title')}
        subtitle={t('section.blog_sub')}
        icon={<BookOpen className="w-5 h-5 text-blue-500" />}
        badge="Editorial"
        viewAllLink="/blog"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {posts.slice(0, 3).map((post) => {
          const imgSrc = resolveMediaUrl(post.image || post.thumbnail, 'general') || fallbackPlaceholder

          return (
            <article
              key={post.id}
              className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={imgSrc}
                  alt={post.title}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = fallbackPlaceholder
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {post.category && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {typeof post.category === 'object' ? ((post.category as any).name || 'Editorial') : post.category}
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2">
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    )}
                    {post.author && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {typeof post.author === 'object' ? ((post.author as any).name || 'Team') : post.author}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                  >
                    {t('hero.learn_more')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default BlogSection
