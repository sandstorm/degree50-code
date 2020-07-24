import React, { useState, useCallback } from 'react'
import { ExercisePhaseTypesEnum } from '../ExercisePhaseApp/Store/ExercisePhaseTypesEnum'
import VideoPlayerWrapper from '../ExercisePhaseApp/Components/VideoPlayer/VideoPlayerWrapper'
import { Solution } from '../ExercisePhaseApp/Components/Solution/SolutionSlice'
import { Teams } from './Components/Teams/Teams'
import { Tabs } from '../ExercisePhaseApp/Components/SubtitleEditor/Src/components/App'

export type SolutionByTeam = {
    teamCreator: string
    teamMembers: Array<string>
    solution: Solution
}

type ReadOnlyExercisePhaseProps = {
    type: ExercisePhaseTypesEnum
    solutions: Array<SolutionByTeam>
}

export const SolutionsApp: React.FC<ReadOnlyExercisePhaseProps> = ({ type, solutions }) => {
    const [activeTab, setActiveTab] = useState(Tabs.ANNOTATIONS)

    console.log(activeTab)

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
                        <option value={Tabs.ANNOTATIONS}>Annotations</option>
                        <option value={Tabs.VIDEO_CODES}>Video-Codes</option>
                    </select>
                    <Teams solutions={solutions} activeTab={activeTab} />
                </div>
            </div>
        </div>
    )
}
