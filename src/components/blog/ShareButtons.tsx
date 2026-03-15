'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  Share2,
  Check,
} from 'lucide-react'

interface ShareButtonsProps {
  url: string
  title: string
  excerpt?: string
}

export function ShareButtons({ url, title, excerpt }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(excerpt ? `${title}\n${excerpt}` : title)

  const shareLinks = [
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: 'hover:text-[#1877F2]',
    },
    {
      label: 'X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      className: 'hover:text-foreground',
    },
    {
      label: 'LINE',
      icon: Share2,
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      className: 'hover:text-[#06C755]',
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      className: 'hover:text-[#0A66C2]',
    },
    {
      label: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
      className: 'hover:text-foreground',
      isEmail: true,
    },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt, url })
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shareLinks.map((link) => (
        <Button
          key={link.label}
          variant="ghost"
          size="icon"
          className={`h-9 w-9 text-muted-foreground ${link.className}`}
          asChild
          aria-label={`分享到 ${link.label}`}
        >
          <a
            href={link.href}
            target={link.isEmail ? undefined : '_blank'}
            rel={link.isEmail ? undefined : 'noopener noreferrer'}
          >
            <link.icon className="h-4 w-4" />
          </a>
        </Button>
      ))}

      {/* Copy link */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        aria-label="複製連結"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </Button>

      {/* Native share (mobile) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden"
          onClick={handleNativeShare}
          aria-label="分享"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
