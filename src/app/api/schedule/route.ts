import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postSlug, platforms, scheduledAt } = body

    if (!postSlug || !scheduledAt) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const job = await prisma.scheduledJob.create({
      data: {
        postSlug,
        platforms: JSON.stringify(platforms ?? ['website']),
        scheduledAt: new Date(scheduledAt),
      },
    })

    return NextResponse.json({ id: job.id }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const jobs = await prisma.scheduledJob.findMany({
    where: { executed: false },
    orderBy: { scheduledAt: 'asc' },
  })

  return NextResponse.json({ jobs })
}
