'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2, CheckCircle } from 'lucide-react'

interface PurchaseButtonProps {
  courseSlug: string
  price: number
  pricingType: 'free' | 'paid'
  hasPurchased: boolean
}

export function PurchaseButton({
  courseSlug,
  price,
  pricingType,
  hasPurchased,
}: PurchaseButtonProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  if (pricingType === 'free') {
    return (
      <Button variant="secondary" className="w-full" disabled>
        <CheckCircle className="h-4 w-4" />
        免費課程
      </Button>
    )
  }

  if (hasPurchased) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        <CheckCircle className="h-4 w-4" />
        已購買
      </Button>
    )
  }

  const handlePurchase = async () => {
    if (!session) {
      signIn('google')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handlePurchase} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {session ? `購買課程 NT$${price}` : '登入後購買'}
    </Button>
  )
}
