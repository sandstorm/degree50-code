import React, { useRef, useState, useCallback } from 'react'
import VideoPlayerWrapper from '../ExercisePhaseApp/Components/VideoPlayer/VideoPlayerWrapper'
import { Solution } from '../ExercisePhaseApp/Components/Solution/SolutionSlice'
import { Teams } from './Components/Teams/Teams'
import { TabTypes } from '../types'

export type SolutionByTeam = {
    teamCreator: string
    teamMembers: Array<string>
    solution: Solution
}

type ReadOnlyExercisePhaseProps = {
    solutions: Array<SolutionByTeam>
}

export const SolutionsApp: React.FC<ReadOnlyExercisePhaseProps> = ({ solutions }) => {
    const [activeTab, setActiveTab] = useState<TabTypes>(TabTypes.ANNOTATIONS)
    const [currentTime, setCurrentTime] = useState(0)

    const videoNodeRef: React.RefObject<HTMLVideoElement> = useRef(null)

    const updateActiveTab = useCallback(
        (event) => {
            setActiveTab(event.target.value)
        },
        [setActiveTab]
    )

    const updateCurrentTime = useCallback(
        (time: number) => {
            if (videoNodeRef.current) {
                videoNodeRef.current.currentTime = time
            }
        },
        [setCurrentTime]
    )

    return (
        <div className={'exercise-phase__inner'}>
            <div className={'exercise-phase__content'}>
                <div className={'solutions'}>
                    <VideoPlayerWrapper updateCurrentTime={setCurrentTime} videoNodeRef={videoNodeRef} />
                    <select className={'form-control'} onChange={updateActiveTab} value={activeTab}>
                        <option value={TabTypes.ANNOTATIONS}>Annotations</option>
                        <option value={TabTypes.VIDEO_CODES}>Video-Codes</option>
                    </select>
                    <Teams
                        solutions={solutions}
                        activeTab={activeTab}
                        currentTime={currentTime}
                        updateCurrentTime={updateCurrentTime}
                    />
                </div>
            </div>
        </div>
    )
}
