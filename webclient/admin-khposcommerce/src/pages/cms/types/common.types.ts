export type Tab =
  | 'blogs'
  | 'blog-categories'
  | 'blog-tags'
  | 'banners'
  | 'pages'
  | 'faqs'
  | 'announcements'
  | 'testimonials'
  | 'media'

export interface CMSAnalytics {
  totalContent: number
  publishedCount: number
  draftCount: number
  archivedCount: number
  publishedToday: number
  totalViews: number
  avgReadTimeMin: number
  seoHealthScore: number
}
