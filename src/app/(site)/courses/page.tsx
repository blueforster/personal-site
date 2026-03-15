import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedCourses } from '@/lib/keystatic'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle } from 'lucide-react'
import { getCategoryLabels } from '@/lib/keystatic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: '課程',
  description: '探索數字分析、AI 與書評相關的線上課程。',
  openGraph: {
    title: '課程 | NS Web',
    description: '探索數字分析、AI 與書評相關的線上課程。',
    url: `${siteUrl}/courses`,
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: `${siteUrl}/courses`,
  },
}

export default async function CoursesPage() {
  const [courses, categoryLabels] = await Promise.all([
    getPublishedCourses(),
    getCategoryLabels(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">課程</h1>
        <p className="mt-2 text-muted-foreground">
          探索深度學習內容，提升你的知識技能
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          課程即將推出，敬請期待！
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.slug} href={`/courses/${course.slug}`}>
              <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                {course.entry.coverImage && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={course.entry.coverImage as string}
                      alt={course.entry.title as string}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                )}
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2">
                    {course.entry.category ? (categoryLabels[course.entry.category] ?? course.entry.category) : null}
                  </Badge>
                  <h3 className="mb-2 text-lg font-semibold">
                    {course.entry.title as string}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {course.entry.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {course.entry.chapters?.length ?? 0} 章節
                    </span>
                    {course.entry.pricingType === 'free' ? (
                      <span className="font-semibold text-green-600">免費</span>
                    ) : course.entry.price ? (
                      <span className="font-semibold">NT${course.entry.price}</span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
