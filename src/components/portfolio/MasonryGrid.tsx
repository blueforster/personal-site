'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'

interface PortfolioItem {
  slug: string
  title: string
  type: string
  coverImage: string | null
  mediaUrl: string
  category: string
}

interface MasonryGridProps {
  items: PortfolioItem[]
  onItemClick: (index: number) => void
}

export function MasonryGrid({ items, onItemClick }: MasonryGridProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        目前尚無作品，敬請期待！
      </p>
    )
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((item, index) => (
        <button
          key={item.slug}
          onClick={() => onItemClick(index)}
          className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
        >
          <div className="relative">
            {item.coverImage ? (
              <Image
                src={item.coverImage}
                alt={item.title}
                width={400}
                height={300}
                className="w-full object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-10 w-10 text-white" />
              </div>
            )}
          </div>
          <div className="p-3 text-left">
            <h3 className="font-medium">{item.title}</h3>
            <Badge variant="outline" className="mt-1">
              {item.category}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}
