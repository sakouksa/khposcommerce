import api from '@/api/client'

export const cmsService = {
  // CMS Dashboard Stats
  getStats: () =>
    api.get('/cms/stats').then(r => r.data.data),

  // Blogs
  getBlogs: (params: Record<string, any> = {}) =>
    api.get('/blogs', { params }).then(r => r.data),

  getBlog: (id: number) =>
    api.get(`/blogs/${id}`).then(r => r.data.data || r.data),

  createBlog: (data: any) =>
    api.post('/blogs', data).then(r => r.data.data || r.data),

  updateBlog: (id: number, data: any) =>
    api.put(`/blogs/${id}`, data).then(r => r.data.data || r.data),

  deleteBlog: (id: number) =>
    api.delete(`/blogs/${id}`).then(r => r.data),

  // Blog Categories
  getCategories: (params: Record<string, any> = {}) =>
    api.get('/blog-categories', { params }).then(r => r.data.data ?? r.data),

  getCategory: (id: number) =>
    api.get(`/blog-categories/${id}`).then(r => r.data.data),

  createCategory: (payload: any) =>
    api.post('/blog-categories', payload).then(r => r.data.data),

  updateCategory: (id: number, payload: any) =>
    api.put(`/blog-categories/${id}`, payload).then(r => r.data.data),

  deleteCategory: (id: number) =>
    api.delete(`/blog-categories/${id}`).then(r => r.data),

  // Banners & Sliders
  getBanners: (params: Record<string, any> = {}) =>
    api.get('/banners', { params }).then(r => r.data),

  getBanner: (id: number) =>
    api.get(`/banners/${id}`).then(r => r.data.data || r.data),

  createBanner: (formData: FormData | Record<string, any>) =>
    api.post('/banners', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data || r.data),

  updateBanner: (id: number, formData: FormData | Record<string, any>) =>
    api.post(`/banners/${id}`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data || r.data),

  deleteBanner: (id: number) =>
    api.delete(`/banners/${id}`).then(r => r.data),

  bulkDeleteBanners: (ids: number[]) =>
    api.post('/banners/bulk-delete', { ids }).then(r => r.data),

  // Top Announcement Bar Settings & Database Records
  getAnnouncements: () =>
    api.get('/announcements', { params: { is_active: true } }).then(r => {
      const records = r.data?.data?.data || r.data?.data || []
      return records.length > 0 ? records[0] : null
    }).catch(() => null),

  getAnnouncementsList: (params: Record<string, any> = {}) =>
    api.get('/announcements', { params }).then(r => r.data),

  createAnnouncement: (data: any) =>
    api.post('/announcements', data).then(r => r.data.data || r.data),

  updateAnnouncement: (id: number, data: any) =>
    api.put(`/announcements/${id}`, data).then(r => r.data.data || r.data),

  deleteAnnouncement: (id: number) =>
    api.delete(`/announcements/${id}`).then(r => r.data),

  toggleAnnouncementActive: (id: number) =>
    api.post(`/announcements/${id}/toggle-active`).then(r => r.data.data || r.data),

  updateAnnouncements: (data: any) => {
    if (data.id) {
      return api.put(`/announcements/${data.id}`, data).then(r => r.data)
    }
    return api.post('/announcements', data).then(r => r.data)
  },

  // Testimonials / Social Proof
  getTestimonials: (params: Record<string, any> = {}) =>
    api.get('/testimonials', { params }).then(r => r.data).catch(() => ({
      data: [
        {
          id: 1,
          author_name: 'សុខ វិបុល',
          role: 'CEO & Founder',
          company: 'Angkor Mart Co., Ltd',
          avatar: '/images/users/user-01.jpg',
          rating: 5,
          comment: 'OptaPOS បានជួយបង្កើនប្រសិទ្ធភាពការលក់ និងគ្រប់គ្រងស្តុកតាមសាខាបានយ៉ាងរលូន លែងមានបញ្ហាខ្វះស្តុកទៀតហើយ!',
          is_featured: true,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          author_name: 'លី ស្រីមុំ',
          role: 'Store Manager',
          company: 'Phnom Penh Tech Hub',
          avatar: '/images/users/user-02.jpg',
          rating: 5,
          comment: 'ការទូទាត់ប្រាក់តាម KHQR លឿន និងប្រព័ន្ធ E-Commerce ធ្វើឱ្យអតិថិជនកុម្ម៉ង់ទិញអនឡាញកាន់តែច្រើន។',
          is_featured: true,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          author_name: 'គឹម ហេង',
          role: 'Operations Director',
          company: 'Battambang Retail Express',
          avatar: '/images/users/user-03.jpg',
          rating: 4,
          comment: 'របាយការណ៍ និងស្ថិតិលក់លម្អិត ងាយស្រួលផ្ទៀងផ្ទាត់ចំណូលចំណាយប្រចាំថ្ងៃ។ សេវាកម្មគាំទ្ររហ័សទាន់ចិត្ត!',
          is_featured: false,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ],
      pagination: { total: 3, current_page: 1, last_page: 1 },
    })),

  // Media Library
  getMediaList: (params: Record<string, any> = {}) =>
    api.get('/media', { params }).then(r => r.data).catch(() => ({
      data: [
        { id: 1, name: 'Hero Laptop Banner', file_name: 'hero-laptop-deals.webp', path: '/images/banners/banner-01.jpg', url: '/images/banners/banner-01.jpg', type: 'image', size: 245000, created_at: new Date().toISOString() },
        { id: 2, name: 'KHQR Payment Logo', file_name: 'khqr-badge.png', path: '/images/payment/khqr.png', url: '/images/payment/khqr.png', type: 'icon', size: 48000, created_at: new Date().toISOString() },
        { id: 3, name: 'Pos Hardware Guide', file_name: 'pos-setup-guide.webp', path: '/images/blogs/blog-01.jpg', url: '/images/blogs/blog-01.jpg', type: 'image', size: 312000, created_at: new Date().toISOString() },
        { id: 4, name: 'Smartwatch Spotlight', file_name: 'smartwatch-deals.webp', path: '/images/banners/banner-02.jpg', url: '/images/banners/banner-02.jpg', type: 'image', size: 189000, created_at: new Date().toISOString() },
        { id: 5, name: 'Gaming Gear Promo', file_name: 'gaming-headset-promo.webp', path: '/images/blogs/blog-02.jpg', url: '/images/blogs/blog-02.jpg', type: 'image', size: 420000, created_at: new Date().toISOString() },
      ],
      pagination: { total: 5, current_page: 1, last_page: 1 },
    })),

  // Broadcast to Telegram Channel
  broadcastToTelegram: (payload: {
    title: string
    message: string
    category?: string
    read_time?: string
    link?: string
    image_url?: string
    channel_id?: string
    locale?: 'km' | 'en'
  }) => api.post('/telegram/broadcast', payload).then(r => r.data),

  // Dynamic Tab CRUD (ContentManagementPage)
  getItemsByTab: (tab: string, params: Record<string, any> = {}) =>
    api.get(`/${tab}`, { params }).then(r => r.data),

  createItemByTab: (tab: string, payload: any) =>
    api.post(`/${tab}`, payload).then(r => r.data.data || r.data),

  updateItemByTab: (tab: string, id: number, payload: any) =>
    api.put(`/${tab}/${id}`, payload).then(r => r.data.data || r.data),

  deleteItemByTab: (tab: string, id: number) =>
    api.delete(`/${tab}/${id}`).then(r => r.data),

  bulkDeleteItemsByTab: (tab: string, ids: number[]) =>
    api.post(`/${tab}/bulk-delete`, { ids }).then(r => r.data),
}

export default cmsService
