import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug } = body

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const post = await prisma.post.upsert({
      where: { slug },
      update: { viewCount: { increment: 1 } },
      create: {
        slug,
        title: slug,
        viewCount: 1,
        publishPlatforms: '[]',
      },
    })

    return NextResponse.json({ viewCount: post.viewCount })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
