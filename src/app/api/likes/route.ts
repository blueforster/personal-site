import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex')
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const ipHash = hashIP(ip)

  const [count, existing] = await Promise.all([
    prisma.like.count({ where: { postSlug: slug } }),
    prisma.like.findUnique({
      where: { postSlug_ipHash: { postSlug: slug, ipHash } },
    }),
  ])

  return NextResponse.json({ count, liked: !!existing })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postSlug } = body

    if (!postSlug) {
      return NextResponse.json({ error: 'Missing postSlug' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    const ipHash = hashIP(ip)

    const existing = await prisma.like.findUnique({
      where: { postSlug_ipHash: { postSlug, ipHash } },
    })

    if (existing) {
      // Unlike
      await prisma.like.delete({ where: { id: existing.id } })
      const count = await prisma.like.count({ where: { postSlug } })
      return NextResponse.json({ liked: false, count })
    } else {
      // Like
      await prisma.like.create({ data: { postSlug, ipHash } })
      const count = await prisma.like.count({ where: { postSlug } })
      return NextResponse.json({ liked: true, count })
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
