import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash, Brain, BookOpen, Eye } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: '關於我',
  description: '了解更多關於 NS Web 的故事。數字分析、AI、書評與現象觀察的創作者。',
  openGraph: {
    title: '關於我 | NS Web',
    description: '了解更多關於 NS Web 的故事。數字分析、AI、書評與現象觀察的創作者。',
    url: `${siteUrl}/about`,
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
}

const expertise = [
  { icon: Hash, label: '數字分析', color: 'text-violet-500' },
  { icon: Brain, label: 'AI', color: 'text-blue-500' },
  { icon: BookOpen, label: '書評', color: 'text-amber-500' },
  { icon: Eye, label: '現象觀察', color: 'text-emerald-500' },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">關於我</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          歡迎來到 NS Web！我是一位熱衷於數字分析、AI 技術、閱讀與社會觀察的創作者。
        </p>

        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold">我的故事</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              在數字與科技的交匯處，我發現了獨特的觀察視角。
              透過數字分析的方法論、AI 技術的前沿洞察、
              深度閱讀的知識積累、以及對社會現象的敏銳觀察，
              我希望能為讀者帶來有價值的思考角度和實用知識。
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">專業領域</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {expertise.map((item) => (
                <Card key={item.label}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">這個網站</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              NS Web 是我的個人品牌平台，在這裡你可以找到：
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Badge variant="outline">文章</Badge>
                深度分析與觀點分享
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">課程</Badge>
                系統化的學習內容
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">作品集</Badge>
                精選創作與專案展示
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">聯繫方式</h2>
            <p className="mt-3 text-muted-foreground">
              如果你有任何問題或合作提案，歡迎透過以下方式聯繫我。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
