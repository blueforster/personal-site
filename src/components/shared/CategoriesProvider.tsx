'use client'

import { createContext, useContext } from 'react'
import { categoryLabels as staticLabels, categoryTabs as staticTabs, categoryLinks as staticLinks } from '@/lib/categories'

interface CategoriesContextValue {
  labels: Record<string, string>
}

const CategoriesContext = createContext<CategoriesContextValue>({
  labels: staticLabels,
})

export function CategoriesProvider({
  labels,
  children,
}: {
  labels: Record<string, string>
  children: React.ReactNode
}) {
  return (
    <CategoriesContext.Provider value={{ labels }}>
      {children}
    </CategoriesContext.Provider>
  )
}

/** 取得分類顯示名稱對照表 */
export function useCategoryLabels() {
  return useContext(CategoriesContext).labels
}

/** 取得單一分類的顯示名稱，找不到時回傳原始 value */
export function useCategoryLabel(value: string) {
  const labels = useContext(CategoriesContext).labels
  return labels[value] ?? value
}

/** 取得 PostList tabs 用的格式（含「全部」） */
export function useCategoryTabs() {
  const labels = useContext(CategoriesContext).labels
  return [
    { value: 'all', label: '全部' },
    ...Object.entries(labels).map(([value, label]) => ({ value, label })),
  ]
}

/** 取得 Footer 連結用的格式 */
export function useCategoryLinks() {
  const labels = useContext(CategoriesContext).labels
  return Object.entries(labels).map(([value, label]) => ({
    href: `/blog?category=${value}`,
    label,
  }))
}
