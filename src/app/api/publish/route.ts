import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  publishToFacebook,
  publishToInstagram,
  publishToThreads,
} from '@/lib/meta-api'
import { publishToSubstack } from '@/lib/substack'
import { getPostBySlug } from '@/lib/keystatic'
import { stripMdx } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, platforms, action } = body as {
      slug: string
      platforms: string[]
      action: 'publish' | 'unpublish'
    }

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const results: { platform: string; success: boolean; error?: string; id?: string }[] = []

    if (action === 'unpublish') {
      await prisma.post.update({
        where: { slug },
        data: { status: 'ARCHIVED' },
      })
      return NextResponse.json({ success: true, action: 'unpublished' })
    }

    // Publish action
    const post = await getPostBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Update DB
    await prisma.post.upsert({
      where: { slug },
      update: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishPlatforms: JSON.stringify(platforms),
      },
      create: {
        slug,
        title: post.title as string,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishPlatforms: JSON.stringify(platforms),
      },
    })

    if (platforms.includes('website')) {
      results.push({ platform: 'website', success: true })
    }

    const postUrl = `${siteUrl}/blog/${slug}`
    const shareText = `${post.title}\n\n${post.excerpt ?? ''}\n\n${postUrl}`
    const contentText = typeof post.content === 'string' ? post.content : ''

    // Publish to social platforms
    if (platforms.includes('facebook')) {
      const result = await publishToFacebook(shareText, postUrl)
      results.push(result)
    }

    if (platforms.includes('instagram')) {
      const imageUrl = post.coverImage ?? post.ogImage ?? ''
      const result = await publishToInstagram(imageUrl as string, shareText)
      results.push(result)
    }

    if (platforms.includes('threads')) {
      const result = await publishToThreads(shareText.slice(0, 500))
      results.push(result)
    }

    if (platforms.includes('substack')) {
      const result = await publishToSubstack(
        post.title as string,
        stripMdx(contentText),
        postUrl
      )
      results.push(result)
    }

    return NextResponse.json({ success: true, results })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
