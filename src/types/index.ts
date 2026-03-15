export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived'
export type PricingType = 'free' | 'paid'

export interface Post {
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  category: string
  tags: string[]
  status: PostStatus
  publishedAt: string | null
  scheduledAt: string | null
  ogTitle: string
  ogDescription: string
  ogImage: string | null
  seoKeywords: string
  content: string
  readingTime: number
}

export interface Course {
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  pricingType: PricingType
  price: number
  status: PostStatus
  category: string
  videoUrl: string
  chapters: Chapter[]
  ogTitle: string
  ogDescription: string
  publishedAt: string | null
  description: string
}

export interface Chapter {
  title: string
  videoUrl: string
  duration: string
  isFree: boolean
}

export interface PortfolioItem {
  slug: string
  title: string
  type: 'image' | 'video' | 'project'
  mediaUrl: string
  coverImage: string | null
  category: string
  status: PostStatus
  publishedAt: string | null
  body: string
}

export interface Category {
  name: string
  slug: string
  description: string
  icon: string
  color: string
}

export interface SearchRecord {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishedAt: string | null
  readingTime: number
  coverImage: string | null
}
