import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const results: { platform: string; success: boolean; error?: string }[] = []

  // ConvertKit
  const ckApiKey = process.env.CONVERTKIT_API_KEY
  const ckFormId = process.env.CONVERTKIT_FORM_ID
  if (ckApiKey && ckFormId) {
    try {
      const res = await fetch(
        `https://api.convertkit.com/v3/forms/${ckFormId}/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: ckApiKey, email }),
        }
      )
      results.push({ platform: 'convertkit', success: res.ok })
    } catch {
      results.push({ platform: 'convertkit', success: false, error: 'Request failed' })
    }
  }

  // Substack — uses the same endpoint Substack's own subscribe buttons use
  const substackUrl = process.env.SUBSTACK_PUBLICATION_URL
  if (substackUrl) {
    try {
      const res = await fetch(`${substackUrl}/api/v1/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      results.push({ platform: 'substack', success: res.ok })
    } catch {
      results.push({ platform: 'substack', success: false, error: 'Request failed' })
    }
  }

  const anySuccess = results.some((r) => r.success)
  return NextResponse.json(
    { success: anySuccess, results },
    { status: anySuccess ? 200 : 502 }
  )
}
