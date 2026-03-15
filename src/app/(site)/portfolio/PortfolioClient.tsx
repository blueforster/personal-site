'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MasonryGrid } from '@/components/portfolio/MasonryGrid'
import { Lightbox } from '@/components/portfolio/Lightbox'

export interface PortfolioItem {
  slug: string
  title: string
  type: string
  coverImage: string | null
  mediaUrl: string
  category: string
  body?: string
}

const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 'image', label: '圖像' },
  { value: 'video', label: '影片' },
  { value: 'project', label: '專案' },
]

export function PortfolioClient({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const filteredItems =
    filter === 'all' ? items : items.filter((item) => item.type === filter)

  const handleItemClick = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <Tabs value={filter} onValueChange={setFilter} className="mb-8">
        <TabsList>
          {filterTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <MasonryGrid items={filteredItems} onItemClick={handleItemClick} />

      <Lightbox
        items={filteredItems}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onNavigate={setLightboxIndex}
      />
    </>
  )
}
