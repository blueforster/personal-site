import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/keystatic'
import { readingTime, stripMdx } from '@/lib/utils'
import { PostList } from '@/components/blog/PostList'
import type { SearchablePost } from '@/lib/search'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: '文章',
  description: '瀏覽數字分析、AI、書評與現象觀察相關文章。',
  openGraph: {
    title: '文章 | NS Web',
    description: '瀏覽數字分析、AI、書評與現象觀察相關文章。',
    url: `${siteUrl}/blog`,
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const rawPosts = await getPublishedPosts()

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">文章</h1>
        <p className="mt-2 text-muted-foreground">
          數字分析、AI、書評與現象觀察
        </p>
      </div>
      <PostList posts={posts} initialCategory={params.category} />
    </div>
  )
}
