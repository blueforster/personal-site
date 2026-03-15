import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

import { categoryLabels, categoryColors } from '@/lib/categories'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') ?? '文章標題'
  const category = searchParams.get('category') ?? ''

  const categoryLabel = categoryLabels[category] ?? category
  const accentColor = categoryColors[category] ?? '#6366F1'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '60px',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {categoryLabel && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: accentColor,
                }}
              />
              <span
                style={{
                  fontSize: '24px',
                  color: accentColor,
                  fontWeight: 600,
                }}
              >
                {categoryLabel}
              </span>
            </div>
          )}
          <h1
            style={{
              fontSize: title.length > 30 ? '48px' : '56px',
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.3,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#94a3b8',
            }}
          >
            NS Web
          </span>
          <span style={{ fontSize: '18px', color: '#64748b' }}>
            數字分析 · AI · 書評 · 現象觀察
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
