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

  const comments = await prisma.comment.findMany({
    where: { postSlug: slug, approved: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ comments })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postSlug, authorName, content } = body

    if (!postSlug || !authorName || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (authorName.length > 50 || content.length > 1000) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    const ipHash = hashIP(ip)

    // Simple rate limit: max 5 comments per IP per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const recentCount = await prisma.comment.count({
      where: {
        ipHash,
        createdAt: { gte: oneMinuteAgo },
      },
    })

    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        postSlug,
        authorName,
        content,
        ipHash,
      },
    })

    return NextResponse.json({ id: comment.id }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
