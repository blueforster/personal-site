'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxItem {
  slug: string
  title: string
  coverImage: string | null
  mediaUrl: string
  category: string
  body?: string
}

interface LightboxProps {
  items: LightboxItem[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (index: number) => void
}

export function Lightbox({
  items,
  currentIndex,
  open,
  onOpenChange,
  onNavigate,
}: LightboxProps) {
  const item = items[currentIndex]

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + items.length) % items.length)
  }, [currentIndex, items.length, onNavigate])

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % items.length)
  }, [currentIndex, items.length, onNavigate])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handlePrev, handleNext, onOpenChange])

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-auto p-0 sm:max-w-4xl">
        <div className="relative">
          {item.coverImage ? (
            <Image
              src={item.coverImage}
              alt={item.title}
              width={1200}
              height={800}
              className="w-full object-contain"
            />
          ) : item.mediaUrl ? (
            <Image
              src={item.mediaUrl}
              alt={item.title}
              width={1200}
              height={800}
              className="w-full object-contain"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-muted">
              <span className="text-muted-foreground">No media</span>
            </div>
          )}

          {/* Navigation buttons */}
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background sm:top-1/2 sm:-translate-y-1/2"
                onClick={handlePrev}
                aria-label="上一張"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background sm:top-1/2 sm:-translate-y-1/2"
                onClick={handleNext}
                aria-label="下一張"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
          {item.body && (
            <p className="mt-3 text-muted-foreground">{item.body}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {currentIndex + 1} / {items.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
