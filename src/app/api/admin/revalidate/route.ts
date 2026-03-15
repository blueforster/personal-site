import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { reader } from '@/lib/keystatic'

export async function POST(request: NextRequest) {
  // Optional: allow specifying a single path, or revalidate everything
  const body = await request.json().catch(() => ({})) as { path?: string }

  if (body.path) {
    revalidatePath(body.path)
    return NextResponse.json({ revalidated: true, path: body.path })
  }

  // Revalidate all content paths
  revalidatePath('/', 'layout') // covers homepage + layout

  // Revalidate individual post slugs
  try {
    const slugs = await reader.collections.posts.list()
    for (const slug of slugs) {
      revalidatePath(`/blog/${slug}`)
    }
  } catch { /* ignore */ }

  // Revalidate individual course slugs
  try {
    const slugs = await reader.collections.courses.list()
    for (const slug of slugs) {
      revalidatePath(`/courses/${slug}`)
    }
  } catch { /* ignore */ }

  // Revalidate list pages
  revalidatePath('/blog')
  revalidatePath('/courses')
  revalidatePath('/portfolio')

  return NextResponse.json({ revalidated: true, path: 'all' })
}
