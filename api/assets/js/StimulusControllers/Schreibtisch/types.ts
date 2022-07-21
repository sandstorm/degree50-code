import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'

export type ExerciseId = string
export type Exercise = {
  id: ExerciseId
  name: string
  course: string
  status: string
  phaseCount: number
  completedPhases: number
}

export type VideoFavoriteId = string
export type VideoFavorite = {
  id: VideoFavoriteId
  video: Video
}
