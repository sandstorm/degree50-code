import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'
import { TabsTypesEnum } from '../../../../types'
import { VideoListsState } from '../../../../Components/VideoEditor/VideoListsSlice'
import { MediaItem } from 'Components/VideoEditor/Editors/components/types'
import ReadOnlyMediaLane from 'Components/VideoEditor/Editors/components/ReadOnlyMediaLane'
import { Item } from '@react-stately/collections'
import Dropdown from '../../../../Components/Dropdown/Dropdown'
import { useModalHook } from '../../../../Components/Modal/useModalHook'
import VideoCodesList from './VideoCodesList'
import { RenderConfig } from '../../../../Components/VideoEditor/Editors/components/MediaLane/MediaTrack'
import { solveConflicts } from '../../../../Components/VideoEditor/Editors/helpers'
import VideoCutSolutionVideo from './VideoCutSolutionVideo'

type TeamProps = {
    solution: SolutionByTeam
    activeTab: TabsTypesEnum
    renderConfig: RenderConfig
    updateCurrentTime: (time: number) => void
}

const prepareMediaItems = (solution: VideoListsState, activeTab: TabsTypesEnum) => {
    switch (activeTab) {
        case TabsTypesEnum.VIDEO_ANNOTATIONS:
            return solution.annotations.map(
                (annotation) =>
                    new MediaItem({
                        ...annotation,
                        originalData: annotation,
                        lane: 0,
                    })
            )
        case TabsTypesEnum.VIDEO_CODES:
            return solveConflicts(
                solution.videoCodes.map(
                    (videoCode) =>
                        new MediaItem({
                            ...videoCode,
                            originalData: videoCode,
                            lane: 0,
                        })
                )
            )
        case TabsTypesEnum.VIDEO_CUTTING:
            return solution.cutlist.map(
                (videoCut, index) =>
                    new MediaItem({
                        ...videoCut,
                        // TODO: What should be the text? e.g. (start : end) of the cut in the original video?
                        text: `Cut ${index + 1}`,
                        originalData: videoCut,
                        lane: 0,
                    })
            )
        default:
            throw new Error(`Invalid value for activeTab: "${activeTab}"`)
    }
}

const Team = ({ solution, activeTab, renderConfig, updateCurrentTime }: TeamProps) => {
    const mediaItems = prepareMediaItems(solution.solution, activeTab)
    const showTextInMediaItems = activeTab !== TabsTypesEnum.VIDEO_ANNOTATIONS
    const amountOfLanes = Math.max(...mediaItems.map((item) => item.lane))
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
            <div className={'team__solution'}>
                {activeTab === TabsTypesEnum.VIDEO_CUTTING ? (
                    <VideoCutSolutionVideo videoUrl={solution.cutVideo?.url.mp4} />
                ) : (
                    <ReadOnlyMediaLane
                        updateCurrentTime={updateCurrentTime}
                        mediaItems={mediaItems}
                        amountOfLanes={amountOfLanes}
                        showTextInMediaItems={showTextInMediaItems}
                        renderConfig={renderConfig}
                    />
                )}
            </div>
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
