import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'

export type ExerciseId = string
export type Exercise = {
  id: ExerciseId
  name: string
  course: string
  status: 'IN_BEARBEITUNG' | 'IN_REVIEW' | 'NEU' | 'BEENDET'
  phaseCount: number
  completedPhases: number
  lastEditedAt?: { date: string }
}

export type VideoFavoriteId = string
export type VideoFavorite = {
  id: VideoFavoriteId
  video: Video
}

export type MaterialId = string
export type Material = {
  id: MaterialId
  material: string
  owner: string
  originalExercisePhaseTeamId: string
  originalExercisePhaseName: string
  originalExercisePhaseUrl: string
  createdAt: { date: string }
  lastUpdatedAt?: { date: string }
}
