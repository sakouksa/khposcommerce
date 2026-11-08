import React from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'

export const CMSPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  if (tab === 'blog-categories' || tab === 'categories') return <Navigate to="/cms/categories" replace />
  if (tab === 'blog-tags' || tab === 'tags') return <Navigate to="/cms/tags" replace />
  if (tab === 'banners') return <Navigate to="/marketing/banners" replace />
  if (tab === 'pages') return <Navigate to="/cms/pages" replace />
  if (tab === 'faqs') return <Navigate to="/cms/faqs" replace />
  if (tab === 'announcements') return <Navigate to="/cms/announcements" replace />
  if (tab === 'testimonials') return <Navigate to="/cms/testimonials" replace />
  if (tab === 'media') return <Navigate to="/cms/media" replace />
  return <Navigate to="/cms/blogs" replace />
}

export default CMSPage
