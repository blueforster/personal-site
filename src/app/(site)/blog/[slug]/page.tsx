import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPublishedPosts } from '@/lib/keystatic'
import { readingTime, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock } from 'lucide-react'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { CommentSection } from '@/components/blog/CommentSection'
import { LikeButton } from '@/components/blog/LikeButton'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { ViewTracker } from './view-tracker'
import { getCategoryLabels } from '@/lib/keystatic'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: '文章不存在' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const ogTitle = post.ogTitle || post.title
  const ogDescription = post.ogDescription || post.excerpt

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.seoKeywords
      ? post.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
      : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
      url: `${siteUrl}/blog/${slug}`,
      images: post.ogImage
        ? [{ url: post.ogImage, width: 1200, height: 630 }]
        : [
            {
              url: `${siteUrl}/api/og?title=${encodeURIComponent(ogTitle)}&category=${post.category}`,
              width: 1200,
              height: 630,
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
    alternates: {
      canonical: `${siteUrl}/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || post.status !== 'published') {
    notFound()
  }

  const categoryLabels = await getCategoryLabels()
  const contentText = typeof post.content === 'string' ? post.content : ''
  const time = readingTime(contentText)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const ogImage = post.ogImage
    ?? `${siteUrl}/api/og?title=${encodeURIComponent(post.ogTitle || post.title)}&category=${post.category ?? ''}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: ogImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: 'NS Web',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NS Web',
      url: siteUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker slug={slug} />
      <article className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {(post.category ? (categoryLabels[post.category] ?? post.category) : null)}
            </Badge>
            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
              {post.title}
            </h1>
            <p className="mb-4 text-lg text-muted-foreground">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {time} 分鐘閱讀
              </span>
            </div>
          </header>

          <Separator className="mb-8" />

          {/* Mobile TOC */}
          <TableOfContents />

          {/* Content with sidebar TOC */}
          <div className="relative lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {contentText ? (
                <MDXRemote
                  source={contentText}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        rehypeSlug,
                        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                        [rehypePrettyCode, { theme: 'github-dark' }],
                      ],
                    },
                  }}
                />
              ) : null}
            </div>

            {/* Desktop TOC sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents />
              </div>
            </aside>
          </div>

          <Separator className="my-8" />

          {/* Like, Share & Tags */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <LikeButton postSlug={slug} />
              <ShareButtons
                url={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/blog/${slug}`}
                title={post.title}
                excerpt={post.excerpt}
              />
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <CommentSection postSlug={slug} />
        </div>
      </article>
    </>
  )
}
