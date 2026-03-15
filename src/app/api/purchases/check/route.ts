import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ purchased: false })
  }

  const courseSlug = request.nextUrl.searchParams.get('courseSlug')
  if (!courseSlug) {
    return NextResponse.json({ error: 'Missing courseSlug' }, { status: 400 })
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_courseSlug: {
        userId: session.userId,
        courseSlug,
      },
    },
  })

  return NextResponse.json({ purchased: !!purchase })
}
