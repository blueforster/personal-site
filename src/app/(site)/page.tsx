import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedPosts, getPublishedCourses, getPublishedPortfolio } from '@/lib/keystatic'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  Hash,
  Brain,
  BookOpen,
  Eye,
} from 'lucide-react'
import { PostCard } from '@/components/blog/PostCard'
import { readingTime } from '@/lib/utils'
import { NewsletterForm } from '@/components/shared/NewsletterForm'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    absolute: 'NS Web — 數字分析 · AI · 書評 · 現象觀察',
  },
  description:
    '透過數字分析、AI 洞察、書評筆記與現象觀察，帶你深入理解這個世界的運作方式。',
  openGraph: {
    title: 'NS Web — 數字分析 · AI · 書評 · 現象觀察',
    description:
      '透過數字分析、AI 洞察、書評筆記與現象觀察，帶你深入理解這個世界的運作方式。',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/api/og?title=NS+Web+%E2%80%94+%E6%95%B8%E5%AD%97%E5%88%86%E6%9E%90+%C2%B7+AI+%C2%B7+%E6%9B%B8%E8%A9%95+%C2%B7+%E7%8F%BE%E8%B1%A1%E8%A7%80%E5%AF%9F`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NS Web — 數字分析 · AI · 書評 · 現象觀察',
    description:
      '透過數字分析、AI 洞察、書評筆記與現象觀察，帶你深入理解這個世界的運作方式。',
  },
  alternates: {
    canonical: siteUrl,
  },
}

const categories = [
  {
    slug: 'numerology',
    name: '數字分析',
    description: '透過數字解讀人生密碼',
    icon: Hash,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    slug: 'ai',
    name: 'AI',
    description: '人工智慧趨勢與應用',
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    slug: 'book-review',
    name: '書評',
    description: '閱讀筆記與推薦',
    icon: BookOpen,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    slug: 'observation',
    name: '現象觀察',
    description: '社會現象深度分析',
    icon: Eye,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
]

export default async function HomePage() {
  const posts = await getPublishedPosts()
  const courses = await getPublishedCourses()
  const portfolioItems = await getPublishedPortfolio()

  const latestPosts = posts.slice(0, 6)
  const latestCourse = courses[0]
  const featuredPortfolio = portfolioItems.slice(0, 3)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-4">
            數字分析 · AI · 書評 · 現象觀察
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            探索數字與知識的
            <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              無限可能
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            透過數字分析、AI 洞察、書評筆記與現象觀察，帶你深入理解這個世界的運作方式。
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/blog">
                瀏覽文章
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">關於我</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">精選文章</h2>
            <p className="mt-1 text-muted-foreground">最新發布的內容</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/blog">
              查看全部
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => {
              const contentText =
                typeof post.entry.content === 'string'
                  ? post.entry.content
                  : ''
              return (
                <PostCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.entry.title as string}
                  excerpt={post.entry.excerpt ?? ''}
                  coverImage={post.entry.coverImage as string | null}
                  category={post.entry.category ?? ''}
                  publishedAt={post.entry.publishedAt}
                  readingTime={readingTime(contentText)}
                />
              )
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            尚無已發布的文章，請先在 CMS 中新增內容。
          </p>
        )}
      </section>

      <Separator />

      {/* Category Navigation */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">探索主題</h2>
          <p className="mt-1 text-muted-foreground">
            四大主題，帶你深入各個領域
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/blog?category=${cat.slug}`}>
              <Card className="group h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${cat.bgColor}`}
                  >
                    <cat.icon className={`h-7 w-7 ${cat.color}`} />
                  </div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Separator />

      {/* Latest Course */}
      {latestCourse && (
        <>
          <section className="container mx-auto px-4 py-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">最新課程</h2>
                <p className="mt-1 text-muted-foreground">深度學習內容</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/courses">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <Badge variant="secondary" className="mb-3">
                  新課程
                </Badge>
                <h3 className="text-xl font-semibold">
                  {latestCourse.entry.title as string}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {latestCourse.entry.excerpt}
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/courses/${latestCourse.slug}`}>
                    開始學習
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
          <Separator />
        </>
      )}

      {/* Featured Portfolio */}
      {featuredPortfolio.length > 0 && (
        <>
          <section className="container mx-auto px-4 py-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">精選作品</h2>
                <p className="mt-1 text-muted-foreground">最新作品展示</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/portfolio">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {featuredPortfolio.map((item) => (
                <Card
                  key={item.slug}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium">
                      {item.entry.title as string}
                    </h3>
                    <Badge variant="outline" className="mt-1">
                      {item.entry.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          <Separator />
        </>
      )}

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold">訂閱電子報</h2>
          <p className="mt-2 text-muted-foreground">
            每週精選文章直送你的信箱，不錯過任何精彩內容。
          </p>
          <NewsletterForm />
          <p className="mt-2 text-xs text-muted-foreground">
            隨時可以取消訂閱，我們尊重你的隱私。
          </p>
        </div>
      </section>
    </div>
  )
}
