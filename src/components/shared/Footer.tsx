'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { useCategoryLinks } from '@/components/shared/CategoriesProvider'

export function Footer() {
  const categoryLinks = useCategoryLinks()
  const footerLinks = [
    {
      title: '內容',
      links: [
        { href: '/blog', label: '文章' },
        { href: '/courses', label: '課程' },
        { href: '/portfolio', label: '作品集' },
      ],
    },
    { title: '主題', links: categoryLinks },
    { title: '其他', links: [{ href: '/about', label: '關於我' }] },
  ]

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label="首頁">
              <Image
                src="/web_icon.png"
                alt="NS Web"
                width={36}
                height={36}
                className="h-9 w-auto object-contain dark:hidden"
                unoptimized
              />
              <Image
                src="/web_icon_dark.png"
                alt="NS Web"
                width={36}
                height={36}
                className="hidden h-9 w-auto object-contain dark:block"
                unoptimized
              />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              數字分析 · AI · 書評 · 現象觀察
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NS Web. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
