import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const COLLECTION_PATHS: Record<string, { dir: string; ext: string }> = {
  posts:      { dir: 'src/content/posts',     ext: '.mdx'  },
  courses:    { dir: 'src/content/courses',   ext: '.mdx'  },
  portfolio:  { dir: 'src/content/portfolio', ext: '.mdx'  },
  categories: { dir: 'src/content/categories',ext: '.yaml' },
}

function getContentPath(collection: string, slug: string): string | null {
  const info = COLLECTION_PATHS[collection]
  if (!info) return null
  if (/[./\\]/.test(slug)) return null // block path traversal
  return path.join(process.cwd(), info.dir, `${slug}${info.ext}`)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection')
  const slug = searchParams.get('slug')

  if (!collection || !slug) {
    return NextResponse.json({ error: '缺少 collection 或 slug' }, { status: 400 })
  }

  const filePath = getContentPath(collection, slug)
  if (!filePath) {
    return NextResponse.json({ error: '無效的 collection 或 slug' }, { status: 400 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '找不到檔案' }, { status: 404 })
  }

  fs.unlinkSync(filePath)
  return NextResponse.json({ success: true })
}
