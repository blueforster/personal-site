'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Comment {
  id: string
  authorName: string
  content: string
  createdAt: string
}

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/comments?slug=${postSlug}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments ?? []))
      .catch(() => {})
  }, [postSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug, authorName: name, content }),
      })
      if (res.ok) {
        setSubmitted(true)
        setName('')
        setContent('')
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-2xl">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <MessageSquare className="h-5 w-5" />
        留言 ({comments.length})
      </h2>

      {/* Comment Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {submitted ? (
            <p className="text-sm text-muted-foreground">
              感謝留言！留言將在審核後顯示。
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="您的名稱"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
              />
              <Textarea
                placeholder="寫下您的想法..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                maxLength={1000}
                rows={4}
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? '送出中...' : '送出留言'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </CardContent>
          </Card>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            暫無留言，成為第一個留言的人吧！
          </p>
        )}
      </div>
    </section>
  )
}
