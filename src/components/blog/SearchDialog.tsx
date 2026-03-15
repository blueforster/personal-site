'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import {
  searchPosts,
  highlightText,
  buildSearchIndex,
  type SearchablePost,
} from '@/lib/search'
import { useCategoryLabels } from '@/components/shared/CategoriesProvider'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  posts: SearchablePost[]
}

export function SearchDialog({ open, onOpenChange, posts }: SearchDialogProps) {
  const categoryLabels = useCategoryLabels()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchablePost[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const indexBuilt = useRef(false)
  const prevOpen = useRef(open)

  // Build index once
  useEffect(() => {
    if (posts.length > 0 && !indexBuilt.current) {
      buildSearchIndex(posts)
      indexBuilt.current = true
    }
  }, [posts])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const found = searchPosts(query, posts, { limit: 10 })
        setResults(found)
        setActiveIndex(0)
      } else {
        setResults([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query, posts])

  // Focus input when dialog opens & reset state on open transition
  useEffect(() => {
    if (open && !prevOpen.current) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
    prevOpen.current = open
  }, [open])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setQuery('')
        setResults([])
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange]
  )

  // Cmd+K shortcut
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleOpenChange(!open)
      }
    },
    [open, handleOpenChange]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleGlobalKeyDown])

  // Keyboard navigation inside dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      handleOpenChange(false)
      window.location.href = `/blog/${results[activeIndex].slug}`
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜尋文章..."
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
          <kbd className="hidden shrink-0 rounded border bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((post, i) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    onClick={() => handleOpenChange(false)}
                    className={`block rounded-lg p-3 transition-colors hover:bg-accent ${
                      i === activeIndex ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3
                          className="truncate font-medium"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(post.title, query),
                          }}
                        />
                        <p
                          className="mt-1 line-clamp-2 text-sm text-muted-foreground"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(post.excerpt, query),
                          }}
                        />
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {categoryLabels[post.category] ?? post.category}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                找不到與「{query}」相關的文章
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                試試其他關鍵字，或瀏覽分類：
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Badge variant="outline">數字分析</Badge>
                <Badge variant="outline">AI</Badge>
                <Badge variant="outline">書評</Badge>
                <Badge variant="outline">現象觀察</Badge>
              </div>
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              輸入關鍵字開始搜尋
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
