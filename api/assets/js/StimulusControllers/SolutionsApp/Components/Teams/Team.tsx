import React from 'react'
import { SolutionByTeam, SolutionFilterType } from '../../SolutionsApp'
import { TabsTypesEnum } from '../../../../types'
import { useModalHook } from '../../../../Components/Modal/useModalHook'
import VideoCodesList from './VideoCodesList'
import { RenderConfig } from '../../../../Components/VideoEditor/components/MediaLane/MediaTrack'
import SolutionItemRenderer from './SolutionItemRenderer'
import VideoCutSolutionVideo from './VideoCutSolutionVideo'
import { addIdsToEntities } from 'StimulusControllers/normalizeData'

type TeamProps = {
    solution: SolutionByTeam
    visibleSolutionFilters: Array<SolutionFilterType>
    renderConfig: RenderConfig
    updateCurrentTime: (time: number) => void
}

const Team = ({ solution, visibleSolutionFilters, renderConfig, updateCurrentTime }: TeamProps) => {
    const { showModal: showVideoCodesModal, RenderModal: RenderVideoCodesModal } = useModalHook()

    const annotations = addIdsToEntities(solution.solution.annotations)
    const videoCodes = addIdsToEntities(solution.solution.videoCodes)

    return (
        <div className={'team'}>
            <header>
                Lösung von: {solution.teamCreator}{' '}
                {solution.teamMembers.length > 1 ? '(' + solution.teamMembers + ')' : ''}
                {/*
                Disabled course we dont have enough items to fill this dropdown
                <Dropdown ariaLabel={'Team-Einstellungen aus/einklappen'} onAction={handleDropdownClick}>
                    <Item key="showVideoCodes">Video-Codes anzeigen</Item>
                </Dropdown>*/}
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
                                entities={annotations}
                            />
                        )
                    case TabsTypesEnum.VIDEO_CODES:
                        return (
                            <SolutionItemRenderer
                                key={solutionFilter.id}
                                renderConfig={renderConfig}
                                updateCurrentTime={updateCurrentTime}
                                solutionFilter={solutionFilter}
                                entities={videoCodes}
                                showVideoCodesModal={showVideoCodesModal}
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
