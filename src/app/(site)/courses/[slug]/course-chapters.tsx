'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { VideoPlayer } from '@/components/courses/VideoPlayer'
import { PlayCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChapterWithAccess {
  title: string
  videoUrl: string
  duration: string
  isFree: boolean
  index: number
  accessible: boolean
}

interface CourseChaptersProps {
  chapters: ChapterWithAccess[]
  courseSlug: string
}

export function CourseChapters({ chapters, courseSlug }: CourseChaptersProps) {
  const [activeChapter, setActiveChapter] = useState(0)
  const currentChapter = chapters[activeChapter]

  const handleChapterClick = (index: number) => {
    if (chapters[index].accessible) {
      setActiveChapter(index)
    }
  }

  return (
    <>
      {/* Video Player Area */}
      <div>
        {currentChapter?.accessible ? (
          <>
            <VideoPlayer
              videoUrl={currentChapter.videoUrl}
              title={currentChapter.title}
              courseSlug={courseSlug}
              chapterIndex={activeChapter}
            />
            <h2 className="mt-4 text-xl font-semibold">
              {currentChapter.title}
            </h2>
          </>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                購買課程後即可觀看此章節
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chapter List */}
      <Card className="h-fit">
        <div className="p-4">
          <h3 className="font-semibold">章節清單</h3>
          <p className="text-sm text-muted-foreground">
            {chapters.length} 章節
          </p>
        </div>
        <Separator />
        <ScrollArea className="max-h-[60vh]">
          <div className="p-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.index}
                onClick={() => handleChapterClick(chapter.index)}
                disabled={!chapter.accessible}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors',
                  chapter.accessible
                    ? 'cursor-pointer hover:bg-accent'
                    : 'cursor-not-allowed opacity-60',
                  activeChapter === chapter.index && 'bg-accent'
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs">
                  {chapter.index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{chapter.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {chapter.duration}
                  </p>
                </div>
                {chapter.accessible ? (
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </>
  )
}
