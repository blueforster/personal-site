import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { getCourseBySlug } from '@/lib/keystatic'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.userId || !session?.user?.email) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { courseSlug } = (await request.json()) as { courseSlug: string }
    if (!courseSlug) {
      return NextResponse.json({ error: '缺少課程 slug' }, { status: 400 })
    }

    const course = await getCourseBySlug(courseSlug)
    if (!course) {
      return NextResponse.json({ error: '課程不存在' }, { status: 404 })
    }

    if (course.pricingType === 'free' || !course.price || course.price <= 0) {
      return NextResponse.json({ error: '此為免費課程' }, { status: 400 })
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseSlug: {
          userId: session.userId,
          courseSlug,
        },
      },
    })
    if (existingPurchase) {
      return NextResponse.json({ error: '您已購買此課程' }, { status: 400 })
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'twd',
            product_data: {
              name: course.title as string,
              description: (course.excerpt as string) || undefined,
            },
            unit_amount: course.price as number,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.userId,
        courseSlug,
      },
      success_url: `${siteUrl}/courses/${courseSlug}?purchased=true`,
      cancel_url: `${siteUrl}/courses/${courseSlug}`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch {
    return NextResponse.json(
      { error: '內部伺服器錯誤' },
      { status: 500 }
    )
  }
}
