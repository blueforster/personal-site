'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="mt-6 text-sm font-medium text-green-600">
        訂閱成功！請檢查你的信箱完成確認。
      </p>
    )
  }

  return (
    <form className="mt-6 flex gap-2" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="你的 Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        disabled={status === 'loading'}
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? '訂閱中…' : '訂閱'}
      </Button>
      {status === 'error' && (
        <p className="mt-2 text-xs text-destructive">訂閱失敗，請稍後再試。</p>
      )}
    </form>
  )
}
