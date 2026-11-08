export interface MediaItem {
  id: number
  name: string
  file_name: string
  path: string
  url?: string
  mime_type?: string
  size?: number
  type?: 'image' | 'video' | 'document' | 'icon'
  created_at?: string
}
