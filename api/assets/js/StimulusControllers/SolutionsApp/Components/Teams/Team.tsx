import React from 'react'
import { SolutionByTeam, SolutionFilterType } from '../../SolutionsApp'
import { TabsTypesEnum } from '../../../../types'
import { MediaItem } from 'Components/VideoEditor/Editors/components/types'
import { solveConflicts } from 'Components/VideoEditor/Editors/helpers'
import { Item } from '@react-stately/collections'
import Dropdown from '../../../../Components/Dropdown/Dropdown'
import { useModalHook } from '../../../../Components/Modal/useModalHook'
import VideoCodesList from './VideoCodesList'
import { RenderConfig } from '../../../../Components/VideoEditor/Editors/components/MediaLane/MediaTrack'
import SolutionItemRenderer from './SolutionItemRenderer'
import VideoCutSolutionVideo from './VideoCutSolutionVideo'

type TeamProps = {
    solution: SolutionByTeam
    visibleSolutionFilters: Array<SolutionFilterType>
    renderConfig: RenderConfig
    updateCurrentTime: (time: number) => void
}

const Team = ({ solution, visibleSolutionFilters, renderConfig, updateCurrentTime }: TeamProps) => {
    const itemsFromAnnotations = solution.solution.annotations.map(
        (annotation) =>
            new MediaItem({
                start: annotation.start,
                end: annotation.end,
                text: annotation.text,
                memo: annotation.memo,
                originalData: annotation,
                lane: 0,
                idFromPrototype: annotation.idFromPrototype,
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
                    idFromPrototype: videoCode.idFromPrototype,
                })
        )
    )

    const { showModal: showVideoCodesModal, RenderModal: RenderVideoCodesModal } = useModalHook()
    const handleDropdownClick = (key: React.Key) => {
        if (key === 'showVideoCodes') {
            showVideoCodesModal()
        }
    }

    return (
        <div className={'team'}>
            <header>
                {solution.teamCreator} {solution.teamMembers.length > 1 ? '(' + solution.teamMembers + ')' : ''}
                <Dropdown ariaLabel={'Team-Einstellungen aus/einklappen'} onAction={handleDropdownClick}>
                    <Item key="showVideoCodes">Video-Codes anzeigen</Item>
                </Dropdown>
            </header>
            {visibleSolutionFilters.map((solutionFilter: SolutionFilterType) => {
                switch (solutionFilter.id) {
                    case TabsTypesEnum.VIDEO_ANNOTATIONS:
                        return (
                            <SolutionItemRenderer
                                key={solutionFilter.id}
                                renderConfig={renderConfig}
                                updateCurrentTime={updateCurrentTime}
                                solutionFilter={solutionFilter}
                                mediaItems={itemsFromAnnotations}
                            />
                        )
                    case TabsTypesEnum.VIDEO_CODES:
                        return (
                            <SolutionItemRenderer
                                key={solutionFilter.id}
                                renderConfig={renderConfig}
                                updateCurrentTime={updateCurrentTime}
                                solutionFilter={solutionFilter}
                                mediaItems={itemsFromVideoCodes}
                            />
                        )
                    case TabsTypesEnum.VIDEO_CUTTING:
                        return (
                            <div key={solutionFilter.id} className={'team__solution'}>
                                <h5 className={'team__solution-headline'}>{solutionFilter.label}</h5>
                                <VideoCutSolutionVideo videoConfig={solution.cutVideo} />
                            </div>
                        )
                    default:
                        throw new Error(`Invalid solution filter type: "${solutionFilter.id}"`)
                }
            })}
            <RenderVideoCodesModal title={'Video-Codes'}>
                <VideoCodesList
                    videoCodesPool={solution.solution.customVideoCodesPool}
                    usedVideoCodes={solution.solution.videoCodes}
                />
            </RenderVideoCodesModal>
        </div>
    )
}

export default React.memo(Team)
