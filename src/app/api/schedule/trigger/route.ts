import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find jobs that should be executed
    const now = new Date()
    const jobs = await prisma.scheduledJob.findMany({
      where: {
        executed: false,
        scheduledAt: { lte: now },
      },
    })

    const results = []

    for (const job of jobs) {
      try {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

        // Call the publish API
        const response = await fetch(`${siteUrl}/api/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: job.postSlug,
            platforms: JSON.parse(job.platforms),
            action: 'publish',
          }),
        })

        const result = await response.json()

        await prisma.scheduledJob.update({
          where: { id: job.id },
          data: {
            executed: true,
            executedAt: new Date(),
            error: response.ok ? null : JSON.stringify(result),
          },
        })

        results.push({ jobId: job.id, slug: job.postSlug, success: response.ok })
      } catch (error) {
        await prisma.scheduledJob.update({
          where: { id: job.id },
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        })
        results.push({
          jobId: job.id,
          slug: job.postSlug,
          success: false,
          error: String(error),
        })
      }
    }

    return NextResponse.json({ executed: results.length, results })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
