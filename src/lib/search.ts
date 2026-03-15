import { Document, type DocumentData } from 'flexsearch'

export interface SearchablePost {
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

type SearchDoc = SearchablePost & DocumentData

let index: Document<SearchDoc> | null = null

export function buildSearchIndex(posts: SearchablePost[]) {
  index = new Document<SearchDoc>({
    tokenize: 'forward',
    document: {
      id: 'slug',
      index: ['title', 'excerpt', 'content', 'tags'],
      store: true,
    },
  })

  for (const post of posts) {
    index.add(post as SearchDoc)
  }

  return index
}

export function searchPosts(
  query: string,
  posts: SearchablePost[],
  options?: {
    category?: string
    limit?: number
  }
): SearchablePost[] {
  if (!query.trim()) {
    let results = [...posts]
    if (options?.category) {
      results = results.filter((p) => p.category === options.category)
    }
    return results.slice(0, options?.limit ?? 100)
  }

  if (!index) {
    buildSearchIndex(posts)
  }

  const rawResults = index!.search(query, {
    limit: options?.limit ?? 100,
  })

  // Collect unique slugs from all field results
  const slugSet = new Set<string>()
  const matched: SearchablePost[] = []

  for (const fieldResult of rawResults) {
    if (fieldResult.result) {
      for (const id of fieldResult.result) {
        const slug = String(id)
        if (!slugSet.has(slug)) {
          slugSet.add(slug)
          const post = posts.find((p) => p.slug === slug)
          if (post) {
            if (options?.category && post.category !== options.category) continue
            matched.push(post)
          }
        }
      }
    }
  }

  return matched
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text
  const words = query.trim().split(/\s+/).filter(Boolean)
  let result = text
  for (const word of words) {
    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    result = result.replace(regex, '<mark>$1</mark>')
  }
  return result
}
