'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

function useHeadings() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Use requestAnimationFrame to read DOM after paint
    requestAnimationFrame(() => {
      const elements = Array.from(
        document.querySelectorAll('article h2, article h3')
      )
      const items: TocItem[] = elements.map((el) => ({
        id: el.id,
        text: el.textContent ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      }))
      setHeadings(items)
    })
  }, [])

  return headings
}

export function TableOfContents() {
  const headings = useHeadings()
  const [activeId, setActiveId] = useState<string>('')
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0.1 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setCollapsed(true)
  }

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <nav className="hidden lg:block" aria-label="目錄索引">
        <h2 className="mb-3 text-sm font-semibold">目錄</h2>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={cn(
                  'block w-full text-left text-sm transition-colors hover:text-foreground',
                  heading.level === 3 && 'pl-4',
                  activeId === heading.id
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: collapsible dropdown */}
      <div className="mb-6 lg:hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium"
          aria-expanded={!collapsed}
        >
          <span>目錄索引</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              !collapsed && 'rotate-180'
            )}
          />
        </button>
        {!collapsed && (
          <ul className="mt-2 space-y-1 rounded-lg border p-3">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => handleClick(heading.id)}
                  className={cn(
                    'block w-full text-left text-sm transition-colors hover:text-foreground',
                    heading.level === 3 && 'pl-4',
                    activeId === heading.id
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
