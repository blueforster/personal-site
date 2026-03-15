import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { zhTW } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'yyyy 年 MM 月 dd 日', { locale: zhTW })
}

export function readingTime(content: string): number {
  const wordsPerMinute = 400 // Chinese characters per minute
  const charCount = content.replace(/\s/g, '').length
  return Math.max(1, Math.ceil(charCount / wordsPerMinute))
}

export function stripMdx(content: string): string {
  return content
    .replace(/import\s+.*from\s+['"].*['"]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .trim()
}
