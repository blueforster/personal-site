/**
 * 分類設定 — 新增/修改分類只需編輯這個檔案
 * value: 用於 URL、資料庫、MDX frontmatter
 * label: 顯示在網頁上的名稱
 * color: 用於 OG 圖片的顏色
 */
export const CATEGORIES = [
  { value: 'numerology', label: '數字分析', color: '#8B5CF6' },
  { value: 'ai',         label: 'AI',       color: '#3B82F6' },
  { value: 'book-review', label: '書評',    color: '#F59E0B' },
  { value: 'observation', label: '現象觀察', color: '#10B981' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']

/** { numerology: '數字分析', ... } */
export const categoryLabels: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)

/** { numerology: '#8B5CF6', ... } */
export const categoryColors: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.color])
)

/** Keystatic fields.select 用的 options 格式 */
export const categoryOptions = CATEGORIES.map((c) => ({
  label: c.label,
  value: c.value,
}))

/** PostList tabs 用的格式（含「全部」） */
export const categoryTabs = [
  { value: 'all', label: '全部' },
  ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
]

/** Footer 連結用的格式 */
export const categoryLinks = CATEGORIES.map((c) => ({
  href: `/blog?category=${c.value}`,
  label: c.label,
}))
