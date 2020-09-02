import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'
import { TabsTypesEnum } from '../../../../types'
import { VideoCode } from '../../../../Components/VideoEditor/VideoListsSlice'
import { MediaItem } from 'Components/VideoEditor/Editors/components/types'
import ReadOnlyMediaLane from 'Components/VideoEditor/Editors/components/ReadOnlyMediaLane'
import { solveConflicts } from 'Components/VideoEditor/Editors/helpers'
import { Item } from '@react-stately/collections'
import Dropdown from '../../../../Components/Dropdown/Dropdown'
import { useModalHook } from '../../../../Components/Modal/useModalHook'

type TeamProps = {
    solution: SolutionByTeam
    activeTab: string
    currentTime: number
    currentZoom: number
    updateCurrentTime: (time: number) => void
    videoDuration: number
}

const Team = ({ solution, activeTab, currentTime, currentZoom, updateCurrentTime, videoDuration }: TeamProps) => {
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
                <ReadOnlyMediaLane
                    currentTime={currentTime}
                    currentZoom={currentZoom}
                    updateCurrentTime={updateCurrentTime}
                    mediaItems={mediaItems}
                    amountOfLanes={amountOfLanes}
                    videoDuration={videoDuration}
                />
            </div>
            <RenderVideoCodesModal title={'Video-Codes'}>test</RenderVideoCodesModal>
        </div>
    )
}

export default React.memo(Team)
