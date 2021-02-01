import React from 'react'
import { SolutionByTeam, SolutionFilterType } from '../../SolutionsApp'
import Team from './Team'
import { RenderConfig } from '../../../../Components/VideoEditor/components/MediaLane/MediaTrack'

type TeamMembersListProps = {
    solutions: Array<SolutionByTeam>
    visibleSolutionFilters: Array<SolutionFilterType>
    renderConfig: RenderConfig
    updateCurrentTime: (time: number) => void
}

export const Teams: React.FC<TeamMembersListProps> = ({
    solutions,
    visibleSolutionFilters,
    renderConfig,
    updateCurrentTime,
}) => {
    return (
        <div className={'teams'}>
            {solutions.map((solutionsEntry: SolutionByTeam) =>
                solutionsEntry.visible ? (
                    <Team
                        key={solutionsEntry.teamCreator}
                        solution={solutionsEntry}
                        visibleSolutionFilters={visibleSolutionFilters}
                        renderConfig={renderConfig}
                        updateCurrentTime={updateCurrentTime}
                    />
                ) : null
            )}
        </div>
    )
}
