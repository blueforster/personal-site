'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '/', label: '首頁' },
  { href: '/blog', label: '文章' },
  { href: '/courses', label: '課程' },
  { href: '/portfolio', label: '作品集' },
  { href: '/about', label: '關於' },
]

interface NavbarProps {
  onSearchOpen?: () => void
}

export function Navbar({ onSearchOpen }: NavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" aria-label="首頁" className="flex items-center gap-2">
          <Image
            src="/web_icon.png"
            alt="NS Web"
            width={40}
            height={40}
            className="h-10 w-auto object-contain dark:hidden"
            priority
            unoptimized
          />
          <Image
            src="/web_icon_dark.png"
            alt="NS Web"
            width={40}
            height={40}
            className="hidden h-10 w-auto object-contain dark:block"
            priority
            unoptimized
          />
          <span className="text-base font-semibold">數感貓探</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchOpen}
            aria-label="搜尋"
          >
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="選單">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
