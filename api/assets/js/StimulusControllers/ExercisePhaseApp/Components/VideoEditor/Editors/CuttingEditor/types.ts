import { MediaItemType } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSlice'

export type Cut = MediaItemType & {
    url: string
    offset: number
    playbackRate: number
}

export type CutList = Array<Cut>
