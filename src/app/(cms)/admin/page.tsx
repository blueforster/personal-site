import { reader } from '@/lib/keystatic'
import ContentManager, { type ContentItem } from './ContentManager'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '內容管理',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [rawPosts, rawCourses, rawPortfolio] = await Promise.all([
    reader.collections.posts.all(),
    reader.collections.courses.all(),
    reader.collections.portfolio.all(),
  ])

  const posts: ContentItem[] = rawPosts.map((p) => ({
    collection: 'posts',
    slug: p.slug,
    title: p.entry.title as string,
    status: p.entry.status ?? 'draft',
    publishedAt: p.entry.publishedAt ?? null,
    category: p.entry.category ?? null,
  }))

  const courses: ContentItem[] = rawCourses.map((c) => ({
    collection: 'courses',
    slug: c.slug,
    title: c.entry.title as string,
    status: c.entry.status ?? 'draft',
    publishedAt: c.entry.publishedAt ?? null,
    category: c.entry.category ?? null,
  }))

  const portfolio: ContentItem[] = rawPortfolio.map((p) => ({
    collection: 'portfolio',
    slug: p.slug,
    title: p.entry.title as string,
    status: p.entry.status ?? 'draft',
    publishedAt: p.entry.publishedAt ?? null,
    category: null,
  }))

  return <ContentManager posts={posts} courses={courses} portfolio={portfolio} />
}
