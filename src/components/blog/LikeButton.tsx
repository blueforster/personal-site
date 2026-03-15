'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postSlug: string
}

export function LikeButton({ postSlug }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/likes?slug=${postSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count ?? 0)
        setLiked(data.liked ?? false)
      })
      .catch(() => {})
  }, [postSlug])

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleLike}
      disabled={loading}
      className="gap-2"
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-colors',
          liked && 'fill-red-500 text-red-500'
        )}
      />
      <span>{count}</span>
    </Button>
  )
}
