'use client'

import { useEffect, useRef, useMemo } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  courseSlug: string
  chapterIndex: number
}

export function VideoPlayer({
  videoUrl,
  title,
  courseSlug,
  chapterIndex,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const youTubeId = useMemo(() => {
    const match = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )
    return match ? match[1] : null
  }, [videoUrl])

  const vimeoId = useMemo(() => {
    const match = videoUrl.match(
      /vimeo\.com\/(?:video\/|channels\/\w+\/|groups\/\w+\/videos\/)?(\d+)/
    )
    return match ? match[1] : null
  }, [videoUrl])

  // Restore playback progress
  useEffect(() => {
    if (youTubeId || !videoRef.current) return
    const storageKey = `progress-${courseSlug}-${chapterIndex}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      videoRef.current.currentTime = parseFloat(saved)
    }

    const video = videoRef.current
    const handleTimeUpdate = () => {
      if (video) {
        localStorage.setItem(storageKey, String(video.currentTime))
      }
    }
    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [courseSlug, chapterIndex, youTubeId])

  if (youTubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}`}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (vimeoId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        title={title}
        controls
        className="h-full w-full"
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    </div>
  )
}
