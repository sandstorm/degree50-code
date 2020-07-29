import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'
import { MediaItem } from '../../../ExercisePhaseApp/Components/VideoEditor/Editors/components/types'
import ReadOnlyMediaLane from '../../../ExercisePhaseApp/Components/VideoEditor/Editors/components/ReadOnlyMediaLane'
import { TabTypes } from '../../../types'

type TeamProps = {
    solution: SolutionByTeam
    activeTab: string
    currentTime: number
    updateCurrentTime: (time: number) => void
}

export const Team: React.FC<TeamProps> = ({ solution, activeTab, currentTime, updateCurrentTime }) => {
    const itemsFromAnnotations = solution.solution.annotations.map(
        (annotation) => new MediaItem(annotation.start, annotation.end, annotation.text)
    )
    const itemsFromVideoCodes = solution.solution.videoCodes.map(
        (videoCode) => new MediaItem(videoCode.start, videoCode.end, videoCode.text, videoCode.color)
    )

    let mediaItems = null
    if (activeTab === TabTypes.ANNOTATIONS) {
        mediaItems = itemsFromAnnotations
    } else {
        mediaItems = itemsFromVideoCodes
    }

    return (
        <div className={'team'}>
            <header>
                {solution.teamCreator} {solution.teamMembers.length > 1 ? '(' + solution.teamMembers + ')' : ''}
            </header>
            <div className={'team__solution'}>
                <ReadOnlyMediaLane
                    currentTime={currentTime}
                    updateCurrentTime={updateCurrentTime}
                    mediaItems={mediaItems}
                />
            </div>
        </div>
    )
}
