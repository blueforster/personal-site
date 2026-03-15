export function getCloudinaryUrl(publicId: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName) return publicId

  const transforms: string[] = []
  if (options?.width) transforms.push(`w_${options.width}`)
  if (options?.height) transforms.push(`h_${options.height}`)
  if (options?.quality) transforms.push(`q_${options.quality}`)
  if (options?.format) transforms.push(`f_${options.format}`)

  const transformStr = transforms.length > 0 ? transforms.join(',') + '/' : ''
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`
}

export function getCloudinaryVideoUrl(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName) return publicId
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`
}
