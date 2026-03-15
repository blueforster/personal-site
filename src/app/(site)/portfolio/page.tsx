import type { Metadata } from 'next'
import { getPublishedPortfolio } from '@/lib/keystatic'
import { PortfolioClient, type PortfolioItem } from './PortfolioClient'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: '作品集',
  description: '精選圖像、影片與專案作品展示。',
  openGraph: {
    title: '作品集 | NS Web',
    description: '精選圖像、影片與專案作品展示。',
    url: `${siteUrl}/portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: `${siteUrl}/portfolio`,
  },
}

export default async function PortfolioPage() {
  const rawItems = await getPublishedPortfolio()

  const items: PortfolioItem[] = rawItems.map((item) => ({
    slug: item.slug,
    title: item.entry.title as string,
    type: item.entry.type as string,
    coverImage: (item.entry.coverImage as string | null) ?? null,
    mediaUrl: (item.entry.mediaUrl as string) ?? '',
    category: (item.entry.category as string) ?? '',
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">作品集</h1>
        <p className="mt-2 text-muted-foreground">
          精選圖像、影片與專案作品
        </p>
      </div>
      <PortfolioClient items={items} />
    </div>
  )
}
