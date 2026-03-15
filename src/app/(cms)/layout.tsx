import type { Metadata } from 'next'
import { ForceLightTheme } from './ForceLightTheme'

export const metadata: Metadata = {
  title: 'CMS 管理後台',
  robots: { index: false, follow: false },
}

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ForceLightTheme />
      {children}
    </>
  )
}
