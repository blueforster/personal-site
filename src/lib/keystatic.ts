import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'

export const reader = createReader(process.cwd(), keystaticConfig)

export async function getPublishedPosts() {
  const posts = await reader.collections.posts.all()
  return posts
    .filter((post) => post.entry.status === 'published')
    .sort((a, b) => {
      const dateA = a.entry.publishedAt ? new Date(a.entry.publishedAt).getTime() : 0
      const dateB = b.entry.publishedAt ? new Date(b.entry.publishedAt).getTime() : 0
      return dateB - dateA
    })
}

export async function getPostBySlug(slug: string) {
  return reader.collections.posts.read(slug)
}

export async function getPublishedCourses() {
  const courses = await reader.collections.courses.all()
  return courses
    .filter((course) => course.entry.status === 'published')
    .sort((a, b) => {
      const dateA = a.entry.publishedAt ? new Date(a.entry.publishedAt).getTime() : 0
      const dateB = b.entry.publishedAt ? new Date(b.entry.publishedAt).getTime() : 0
      return dateB - dateA
    })
}

export async function getCourseBySlug(slug: string) {
  return reader.collections.courses.read(slug)
}

export async function getPublishedPortfolio() {
  const items = await reader.collections.portfolio.all()
  return items
    .filter((item) => item.entry.status === 'published')
    .sort((a, b) => {
      const dateA = a.entry.publishedAt ? new Date(a.entry.publishedAt).getTime() : 0
      const dateB = b.entry.publishedAt ? new Date(b.entry.publishedAt).getTime() : 0
      return dateB - dateA
    })
}

export async function getAllCategories() {
  return reader.collections.categories.all()
}

/** 從 CMS 讀取分類顯示名稱，找不到時回退 src/lib/categories.ts 靜態值 */
export async function getCategoryLabels(): Promise<Record<string, string>> {
  try {
    const { categoryLabels: fallback } = await import('./categories')
    const cats = await reader.collections.categories.all()
    if (cats.length === 0) return fallback
    return Object.fromEntries(
      cats.map((c) => [c.slug, (c.entry.label as string) || c.slug])
    )
  } catch {
    const { categoryLabels: fallback } = await import('./categories')
    return fallback
  }
}
