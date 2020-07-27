import React, { useState, useCallback } from 'react'
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

    const updateActiveTab = useCallback(
        (event) => {
            setActiveTab(event.target.value)
        },
        [setActiveTab]
    )

    return (
        <div className={'exercise-phase__inner'}>
            <div className={'exercise-phase__content'}>
                <div className={'solutions'}>
                    <VideoPlayerWrapper />
                    <select className={'form-control'} onChange={updateActiveTab} value={activeTab}>
                        <option value={TabTypes.ANNOTATIONS}>Annotations</option>
                        <option value={TabTypes.VIDEO_CODES}>Video-Codes</option>
                    </select>
                    <Teams solutions={solutions} activeTab={activeTab} />
                </div>
            </div>
        </div>
    )
}
