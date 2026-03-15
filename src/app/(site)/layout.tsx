import { getPublishedPosts, getCategoryLabels } from '@/lib/keystatic'
import { readingTime, stripMdx } from '@/lib/utils'
import type { SearchablePost } from '@/lib/search'
import { SiteShell } from '@/components/shared/SiteShell'
import { CategoriesProvider } from '@/components/shared/CategoriesProvider'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [rawPosts, categoryLabels] = await Promise.all([
    getPublishedPosts(),
    getCategoryLabels(),
  ])

  const posts: SearchablePost[] = rawPosts.map((post) => {
    const contentText =
      typeof post.entry.content === 'string' ? post.entry.content : ''
    return {
      slug: post.slug,
      title: post.entry.title as string,
      excerpt: post.entry.excerpt ?? '',
      content: stripMdx(contentText),
      category: post.entry.category ?? '',
      tags: (post.entry.tags as string[]) ?? [],
      publishedAt: post.entry.publishedAt ?? null,
      readingTime: readingTime(contentText),
      coverImage: (post.entry.coverImage as string | null) ?? null,
    }
  })

  return (
    <CategoriesProvider labels={categoryLabels}>
      <SiteShell posts={posts}>{children}</SiteShell>
    </CategoriesProvider>
  )
}
