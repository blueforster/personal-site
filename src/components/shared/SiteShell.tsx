'use client'

import { useState } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SearchDialog } from '@/components/blog/SearchDialog'
import type { SearchablePost } from '@/lib/search'

interface SiteShellProps {
  posts: SearchablePost[]
  children: React.ReactNode
}

export function SiteShell({ posts, children }: SiteShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} posts={posts} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
