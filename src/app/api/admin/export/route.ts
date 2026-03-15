import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const COLLECTION_PATHS: Record<string, { dir: string; ext: string }> = {
  posts:      { dir: 'src/content/posts',      ext: '.mdx'  },
  courses:    { dir: 'src/content/courses',    ext: '.mdx'  },
  portfolio:  { dir: 'src/content/portfolio',  ext: '.mdx'  },
  categories: { dir: 'src/content/categories', ext: '.yaml' },
}

function getContentPath(collection: string, slug: string): string | null {
  const info = COLLECTION_PATHS[collection]
  if (!info) return null
  if (/[./\\]/.test(slug)) return null
  return path.join(process.cwd(), info.dir, `${slug}${info.ext}`)
}

// GET /api/admin/export?collection=posts&slug=hello-world
// → downloads the raw .mdx file
export async function GET(request: NextRequest) {
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

  const content = fs.readFileSync(filePath, 'utf-8')
  const ext = path.extname(filePath)
  const filename = `${slug}${ext}`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// POST /api/admin/export
// body: { items: [{ collection, slug }] }
// → downloads a JSON file with all items
export async function POST(request: NextRequest) {
  const body = await request.json() as { items: { collection: string; slug: string }[] }
  const { items } = body

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: '缺少匯出項目' }, { status: 400 })
  }

  const result: { collection: string; slug: string; content: string }[] = []

  for (const { collection, slug } of items) {
    const filePath = getContentPath(collection, slug)
    if (!filePath || !fs.existsSync(filePath)) continue
    result.push({ collection, slug, content: fs.readFileSync(filePath, 'utf-8') })
  }

  const filename = `cms-export-${new Date().toISOString().slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(result, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
