'use client'

import { useEffect } from 'react'

export function ForceLightTheme() {
  useEffect(() => {
    const html = document.documentElement
    const prev = html.className
    html.classList.remove('dark')
    html.classList.add('light')
    return () => {
      html.className = prev
    }
  }, [])

  return null
}
