'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import {
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  Search,
  Check,
  Loader2,
  FileDown,
  RefreshCw,
  Send,
  Clock,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export interface ContentItem {
  collection: string
  slug: string
  title: string
  status: string
  publishedAt: string | null
  category: string | null
}

interface Props {
  posts: ContentItem[]
  courses: ContentItem[]
  portfolio: ContentItem[]
}

const COLLECTION_LABELS: Record<string, string> = {
  posts: '文章',
  courses: '課程',
  portfolio: '作品集',
}

const STATUS_VARIANTS: Record<string, string> = {
  published: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  draft:     'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
  scheduled: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  archived:  'bg-orange-500/15 text-orange-700 dark:text-orange-400',
}

const STATUS_LABELS: Record<string, string> = {
  published: '已發布',
  draft:     '草稿',
  scheduled: '排程中',
  archived:  '已封存',
}

const STATUS_COLORS: Record<string, string> = {
  published: '#10b981',
  draft:     '#71717a',
  scheduled: '#3b82f6',
  archived:  '#f97316',
}

const CATEGORY_COLORS = [
  '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981',
  '#ec4899', '#06b6d4', '#f43f5e', '#84cc16',
]

export default function ContentManager({ posts, courses, portfolio }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [notification, setNotification] = useState<{ msg: string; ok: boolean } | null>(null)

  // Publish dialog state
  const [publishTarget, setPublishTarget] = useState<ContentItem | null>(null)
  const [publishPlatforms, setPublishPlatforms] = useState<Set<string>>(new Set(['website']))
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleAt, setScheduleAt] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResults, setPublishResults] = useState<{ platform: string; success: boolean; error?: string }[] | null>(null)

  const allByCollection: Record<string, ContentItem[]> = { posts, courses, portfolio }

  // ── Stats computation ─────────────────────────────────
  const statsData = useMemo(() => {
    const allPosts = posts

    // By month (last 12 months, published only)
    const monthMap: Record<string, number> = {}
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap[key] = 0
    }
    for (const p of allPosts) {
      if (p.publishedAt && p.status === 'published') {
        const d = new Date(p.publishedAt)
        const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
        if (key in monthMap) monthMap[key] = (monthMap[key] ?? 0) + 1
      }
    }
    const byMonth = Object.entries(monthMap).map(([month, count]) => ({
      month: month.slice(5), // show "01"~"12"
      fullMonth: month,
      count,
    }))

    // By category (all posts)
    const catMap: Record<string, number> = {}
    for (const p of allPosts) {
      const cat = p.category ?? '未分類'
      catMap[cat] = (catMap[cat] ?? 0) + 1
    }
    const byCategory = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name,
        count,
        fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))

    // By status (all posts)
    const statusMap: Record<string, number> = {}
    for (const p of allPosts) {
      statusMap[p.status] = (statusMap[p.status] ?? 0) + 1
    }
    const byStatus = Object.entries(statusMap).map(([status, count]) => ({
      name: STATUS_LABELS[status] ?? status,
      value: count,
      fill: STATUS_COLORS[status] ?? '#94a3b8',
    }))

    return { byMonth, byCategory, byStatus }
  }, [posts])

  // ── Helpers ───────────────────────────────────────────
  function itemKey(item: ContentItem) {
    return `${item.collection}:${item.slug}`
  }

  function filtered(items: ContentItem[]) {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.slug.toLowerCase().includes(q) ||
        (i.category ?? '').toLowerCase().includes(q)
    )
  }

  function toggleItem(item: ContentItem) {
    setSelected((prev) => {
      const next = new Set(prev)
      const key = itemKey(item)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  function toggleAll(items: ContentItem[]) {
    const keys = filtered(items).map(itemKey)
    const allChecked = keys.every((k) => selected.has(k))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allChecked) keys.forEach((k) => next.delete(k))
      else keys.forEach((k) => next.add(k))
      return next
    })
  }

  function notify(msg: string, ok = true) {
    setNotification({ msg, ok })
    setTimeout(() => setNotification(null), 3000)
  }

  // ── Revalidate ───────────────────────────────────────
  async function revalidateAll() {
    setIsRevalidating(true)
    try {
      const res = await fetch('/api/admin/revalidate', { method: 'POST', body: JSON.stringify({}) })
      if (!res.ok) throw new Error()
      notify('已發布變更，網站頁面已更新')
      startTransition(() => router.refresh())
    } catch {
      notify('發布失敗，請再試一次', false)
    } finally {
      setIsRevalidating(false)
    }
  }

  // ── Edit ─────────────────────────────────────────────
  function editItem(item: ContentItem) {
    window.open(`/keystatic/collection/${item.collection}/item/${item.slug}`, '_blank')
  }

  // ── Delete (single) ──────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/delete?collection=${deleteTarget.collection}&slug=${deleteTarget.slug}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error(await res.text())
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(itemKey(deleteTarget))
        return next
      })
      notify(`「${deleteTarget.title}」已刪除`)
      startTransition(() => router.refresh())
    } catch {
      notify('刪除失敗，請再試一次', false)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ── Delete (bulk) ────────────────────────────────────
  async function deleteSelected() {
    const keys = Array.from(selected)
    if (keys.length === 0) return
    const all = [...posts, ...courses, ...portfolio]
    const targets = all.filter((i) => keys.includes(itemKey(i)))

    setIsDeleting(true)
    let success = 0
    for (const item of targets) {
      const res = await fetch(
        `/api/admin/delete?collection=${item.collection}&slug=${item.slug}`,
        { method: 'DELETE' }
      )
      if (res.ok) success++
    }
    setIsDeleting(false)
    setSelected(new Set())
    notify(`已刪除 ${success} / ${targets.length} 個項目`)
    startTransition(() => router.refresh())
  }

  // ── Publish ──────────────────────────────────────────
  function openPublishDialog(item: ContentItem) {
    setPublishTarget(item)
    setPublishPlatforms(new Set(['website']))
    setIsScheduled(false)
    setScheduleAt('')
    setPublishResults(null)
  }

  function togglePlatform(platform: string) {
    setPublishPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(platform)) { next.delete(platform) } else { next.add(platform) }
      return next
    })
  }

  async function confirmPublish() {
    if (!publishTarget) return
    setIsPublishing(true)
    setPublishResults(null)
    const platforms = Array.from(publishPlatforms)

    try {
      if (isScheduled && scheduleAt) {
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postSlug: publishTarget.slug, platforms, scheduledAt: scheduleAt }),
        })
        if (!res.ok) throw new Error()
        notify(`「${publishTarget.title}」已排程發布`)
        setPublishTarget(null)
      } else {
        const res = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: publishTarget.slug, platforms, action: 'publish' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPublishResults(data.results ?? [])
        startTransition(() => router.refresh())
      }
    } catch {
      notify('發布失敗，請再試一次', false)
    } finally {
      setIsPublishing(false)
    }
  }

  // ── Export (single) ──────────────────────────────────
  function exportItem(item: ContentItem) {
    const url = `/api/admin/export?collection=${item.collection}&slug=${item.slug}`
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.slug}.mdx`
    a.click()
  }

  // ── Export (bulk) ────────────────────────────────────
  async function exportSelected() {
    const keys = Array.from(selected)
    const all = [...posts, ...courses, ...portfolio]
    const targets = all
      .filter((i) => keys.includes(itemKey(i)))
      .map(({ collection, slug }) => ({ collection, slug }))

    const res = await fetch('/api/admin/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: targets }),
    })
    if (!res.ok) { notify('匯出失敗', false); return }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const filename =
      res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ??
      'export.json'
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Table for one collection ──────────────────────────
  function CollectionTable({ items }: { items: ContentItem[] }) {
    const rows = filtered(items)
    const allChecked = rows.length > 0 && rows.every((i) => selected.has(itemKey(i)))
    const someChecked = rows.some((i) => selected.has(itemKey(i)))

    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked }}
                  onChange={() => toggleAll(items)}
                  className="h-4 w-4 rounded border-muted-foreground accent-primary cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">標題</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">分類</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">狀態</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">發布日期</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {query ? '找不到符合的項目' : '尚無內容'}
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const key = itemKey(item)
                const isChecked = selected.has(key)
                return (
                  <tr
                    key={key}
                    className={`transition-colors hover:bg-muted/30 ${isChecked ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item)}
                        className="h-4 w-4 rounded border-muted-foreground accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium line-clamp-1">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.slug}</span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {item.category ? (
                        <Badge variant="outline">{item.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_VARIANTS[item.status] ?? STATUS_VARIANTS.draft}`}
                      >
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {item.publishedAt ? formatDate(item.publishedAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="在 Keystatic 中編輯"
                          onClick={() => editItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {item.collection === 'posts' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="發布到平台"
                            onClick={() => openPublishDialog(item)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="匯出"
                          onClick={() => exportItem(item)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="刪除"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    )
  }

  const selectedCount = selected.size
  const publishedCount = posts.filter((p) => p.status === 'published').length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">內容管理</h1>
            <p className="text-sm text-muted-foreground">管理所有內容項目</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={revalidateAll}
              disabled={isRevalidating}
              title="重新產生所有靜態頁面（部署後使用）"
            >
              {isRevalidating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              發布變更
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/keystatic" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Keystatic CMS
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">← 返回網站</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: '文章總數', count: posts.length, sub: `${publishedCount} 已發布`, href: '/blog' },
            { label: '課程', count: courses.length, href: '/courses' },
            { label: '作品集', count: portfolio.length, href: '/portfolio' },
            { label: '草稿', count: posts.filter((p) => p.status === 'draft').length, sub: '文章' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border bg-card p-4 text-center"
            >
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              {s.sub && <div className="mt-0.5 text-xs text-muted-foreground/70">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-4 lg:grid-cols-3">

          {/* Monthly bar chart */}
          <div className="col-span-2 rounded-lg border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold">文章發布趨勢（近 12 個月）</h2>
            <p className="mb-4 text-xs text-muted-foreground">僅計算已發布文章</p>
            {statsData.byMonth.every((m) => m.count === 0) ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                尚無已發布文章
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={statsData.byMonth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [value ?? 0, '篇']}
                    labelFormatter={(label) => {
                      const item = statsData.byMonth.find((m) => m.month === label)
                      return item?.fullMonth ?? label
                    }}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status pie chart */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold">文章狀態分佈</h2>
            <p className="mb-2 text-xs text-muted-foreground">所有文章</p>
            {statsData.byStatus.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                尚無文章
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statsData.byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {statsData.byStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) => [value ?? 0, '篇']}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                  />
                  <Legend
                    iconSize={10}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category bar chart */}
          <div className="col-span-2 rounded-lg border bg-card p-4 lg:col-span-3">
            <h2 className="mb-1 text-sm font-semibold">文章分類分佈</h2>
            <p className="mb-4 text-xs text-muted-foreground">所有文章（含草稿）</p>
            {statsData.byCategory.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                尚無文章
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart
                  data={statsData.byCategory}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [value ?? 0, '篇']}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {statsData.byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜尋標題或 slug…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                已選 {selectedCount} 項
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={exportSelected}
                disabled={isPending}
              >
                <FileDown className="mr-1.5 h-3.5 w-3.5" />
                匯出選取
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={deleteSelected}
                disabled={isDeleting || isPending}
              >
                {isDeleting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                )}
                刪除選取
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelected(new Set())}
              >
                取消選取
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="mb-4">
            {(['posts', 'courses', 'portfolio'] as const).map((col) => (
              <TabsTrigger key={col} value={col}>
                {COLLECTION_LABELS[col]}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                  {allByCollection[col].length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(['posts', 'courses', 'portfolio'] as const).map((col) => (
            <TabsContent key={col} value={col}>
              <CollectionTable items={allByCollection[col]} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除「{deleteTarget?.title}」？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={!!publishTarget} onOpenChange={(o) => !o && setPublishTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>發布「{publishTarget?.title}」</DialogTitle>
            <DialogDescription>選擇要發布的平台</DialogDescription>
          </DialogHeader>

          {publishResults ? (
            <div className="space-y-2 py-2">
              {publishResults.map((r) => (
                <div key={r.platform} className="flex items-center gap-2 text-sm">
                  {r.success ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <span className="h-4 w-4 text-destructive">✕</span>
                  )}
                  <span className="capitalize font-medium">{r.platform}</span>
                  {!r.success && r.error && (
                    <span className="text-xs text-muted-foreground truncate">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Platform checkboxes */}
              <div className="space-y-2">
                {[
                  { id: 'website', label: '網站（重新產生頁面）' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'threads', label: 'Threads' },
                  { id: 'substack', label: 'Substack' },
                ].map(({ id, label }) => (
                  <label key={id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={publishPlatforms.has(id)}
                      onChange={() => togglePlatform(id)}
                      className="h-4 w-4 rounded border-muted-foreground accent-primary"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>

              {/* Schedule toggle */}
              <div className="border-t pt-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="h-4 w-4 rounded border-muted-foreground accent-primary"
                  />
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">排程發布</span>
                </label>
                {isScheduled && (
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className="mt-2 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishTarget(null)}>
              {publishResults ? '關閉' : '取消'}
            </Button>
            {!publishResults && (
              <Button
                onClick={confirmPublish}
                disabled={isPublishing || publishPlatforms.size === 0 || (isScheduled && !scheduleAt)}
              >
                {isPublishing ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isScheduled ? '建立排程' : '立即發布'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            notification.ok
              ? 'bg-emerald-600 text-white'
              : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {notification.ok && <Check className="h-4 w-4" />}
          {notification.msg}
        </div>
      )}
    </div>
  )
}
