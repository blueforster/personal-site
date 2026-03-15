'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from './PostCard'
import { searchPosts, buildSearchIndex, type SearchablePost } from '@/lib/search'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCategoryTabs } from '@/components/shared/CategoriesProvider'

const ITEMS_PER_PAGE = 12

const sortOptions = [
  { value: 'latest', label: '最新' },
  { value: 'oldest', label: '最舊' },
]

interface PostListProps {
  posts: SearchablePost[]
  initialCategory?: string
}

export function PostList({ posts, initialCategory }: PostListProps) {
  const categoryTabs = useCategoryTabs()
  const [category, setCategory] = useState(initialCategory ?? 'all')
  const [sort, setSort] = useState('latest')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Build index once
  useMemo(() => {
    if (posts.length > 0) buildSearchIndex(posts)
  }, [posts])

  const filteredPosts = useMemo(() => {
    let results: SearchablePost[]

    if (search.trim()) {
      results = searchPosts(search, posts, {
        category: category !== 'all' ? category : undefined,
      })
    } else {
      results = category === 'all'
        ? [...posts]
        : posts.filter((p) => p.category === category)
    }

    // Sort
    results.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return sort === 'oldest' ? dateA - dateB : dateB - dateA
    })

    return results
  }, [posts, category, sort, search])

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Search & Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="搜尋文章..."
          className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={handleCategoryChange}>
        <TabsList className="flex-wrap">
          {categoryTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Post Grid */}
      {paginatedPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              coverImage={post.coverImage}
              category={post.category}
              publishedAt={post.publishedAt}
              readingTime={post.readingTime}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          {search ? `找不到與「${search}」相關的文章` : '目前此分類尚無文章'}
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            aria-label="上一頁"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            aria-label="下一頁"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
