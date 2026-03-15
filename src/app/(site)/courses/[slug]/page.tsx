import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getCourseBySlug, getPublishedCourses } from '@/lib/keystatic'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { PurchaseButton } from '@/components/courses/PurchaseButton'
import { CourseChapters } from './course-chapters'
import { getCategoryLabels } from '@/lib/keystatic'

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ purchased?: string }>
}

export async function generateStaticParams() {
  const courses = await getPublishedCourses()
  return courses.map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) return { title: '課程不存在' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const ogTitle = (course.ogTitle as string) || (course.title as string)
  const ogDescription =
    (course.ogDescription as string) || (course.excerpt as string)

  return {
    title: course.title as string,
    description: course.excerpt as string,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'website',
      url: `${siteUrl}/courses/${slug}`,
      images: [
        {
          url: `${siteUrl}/api/og?title=${encodeURIComponent(ogTitle)}&category=${course.category ?? ''}`,
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
      canonical: `${siteUrl}/courses/${slug}`,
    },
  }
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: CourseDetailPageProps) {
  const { slug } = await params
  const { purchased: purchasedParam } = await searchParams
  const [course, categoryLabels] = await Promise.all([
    getCourseBySlug(slug),
    getCategoryLabels(),
  ])

  if (!course || course.status !== 'published') {
    notFound()
  }

  const session = await getServerSession(authOptions)
  let hasPurchased = false
  const isAdmin = session?.role === 'ADMIN'

  if (session?.userId) {
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseSlug: {
          userId: session.userId,
          courseSlug: slug,
        },
      },
    })
    hasPurchased = !!purchase
  }

  const isFree = course.pricingType === 'free'
  const hasAccess = isFree || hasPurchased || isAdmin

  const chapters = (
    (course.chapters as Array<{
      title: string
      videoUrl: string
      duration: string
      isFree: boolean
    }>) ?? []
  ).map((ch, index) => ({
    ...ch,
    index,
    accessible: hasAccess || ch.isFree,
  }))

  const freeCount = chapters.filter((c) => c.isFree).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Badge variant="secondary">
          {categoryLabels[course.category as string] ??
            (course.category as string)}
        </Badge>
        <h1 className="mt-2 text-3xl font-bold">{course.title as string}</h1>
        <p className="mt-1 text-muted-foreground">
          {course.excerpt as string}
        </p>
      </div>

      {purchasedParam === 'true' && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          購買成功！您現在可以觀看所有課程章節。
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CourseChapters chapters={chapters} courseSlug={slug} />

        {/* Sidebar */}
        <div className="order-first space-y-4 lg:order-none">
          <Card className="p-4">
            <div className="mb-3 text-center">
              {isFree ? (
                <p className="text-2xl font-bold text-green-600">免費</p>
              ) : (
                <p className="text-2xl font-bold">
                  NT${course.price as number}
                </p>
              )}
            </div>
            <PurchaseButton
              courseSlug={slug}
              price={course.price as number}
              pricingType={course.pricingType as 'free' | 'paid'}
              hasPurchased={hasPurchased}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {chapters.length} 章節
              {!isFree && freeCount > 0 && ` · ${freeCount} 免費預覽`}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
