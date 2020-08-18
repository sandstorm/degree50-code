import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'
import { MediaItem } from '../../../ExercisePhaseApp/Components/VideoEditor/Editors/components/types'
import ReadOnlyMediaLane from '../../../ExercisePhaseApp/Components/VideoEditor/Editors/components/ReadOnlyMediaLane'
import { TabsTypesEnum } from '../../../ExercisePhaseApp/Store/ComponentTypesEnum'
import { solveConflicts } from '../../../ExercisePhaseApp/Components/VideoEditor/Editors/VideoCodeEditor/helpers'
import { VideoCode } from '../../../ExercisePhaseApp/Components/Solution/SolutionSlice'

type TeamProps = {
    solution: SolutionByTeam
    activeTab: string
    currentTime: number
    currentZoom: number
    updateCurrentTime: (time: number) => void
    videoDuration: number
}

export const Team: React.FC<TeamProps> = ({
    solution,
    activeTab,
    currentTime,
    currentZoom,
    updateCurrentTime,
    videoDuration,
}) => {
    const itemsFromAnnotations = solution.solution.annotations.map(
        (annotation) =>
            new MediaItem({
                start: annotation.start,
                end: annotation.end,
                text: annotation.text,
                memo: annotation.memo,
                originalData: annotation,
                lane: 0,
            })
    )

    const itemsFromVideoCodes = solveConflicts(
        solution.solution.videoCodes.map(
            (videoCode) =>
                new MediaItem({
                    start: videoCode.start,
                    end: videoCode.end,
                    text: videoCode.text,
                    memo: videoCode.memo,
                    color: videoCode.color,
                    originalData: videoCode,
                    lane: 0,
                })
        )
    )

    let mediaItems = null
    if (activeTab === TabsTypesEnum.VIDEO_ANNOTATIONS) {
        mediaItems = itemsFromAnnotations
    } else {
        mediaItems = itemsFromVideoCodes
    }

    const amountOfLanes = Math.max.apply(
        Math,
        mediaItems.map((item: MediaItem<VideoCode>) => {
            return item.lane
        })
    )

    return (
        <div className={'team'}>
            <header>
                {solution.teamCreator} {solution.teamMembers.length > 1 ? '(' + solution.teamMembers + ')' : ''}
            </header>
            <div className={'team__solution'}>
                <ReadOnlyMediaLane
                    currentTime={currentTime}
                    currentZoom={currentZoom}
                    updateCurrentTime={updateCurrentTime}
                    mediaItems={mediaItems}
                    amountOfLanes={amountOfLanes}
                    videoDuration={videoDuration}
                />
            </div>
        </div>
    )
}
