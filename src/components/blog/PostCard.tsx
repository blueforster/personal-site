'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCategoryLabel } from '@/components/shared/CategoriesProvider'

interface PostCardProps {
  slug: string
  title: string
  excerpt: string
  coverImage?: string | null
  category: string
  publishedAt?: string | null
  readingTime?: number
}

export function PostCard({
  slug,
  title,
  excerpt,
  coverImage,
  category,
  publishedAt,
  readingTime,
}: PostCardProps) {
  const categoryLabel = useCategoryLabel(category)

  return (
    <Link href={`/blog/${slug}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        {coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="p-5">
          <Badge variant="secondary" className="mb-2">
            {categoryLabel}
          </Badge>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary">
            {title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(publishedAt)}
              </span>
            )}
            {readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} 分鐘閱讀
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
