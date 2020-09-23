import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'
import Team from './Team'
import { RenderConfig } from '../../../../Components/VideoEditor/Editors/components/MediaLane/MediaTrack'
import { TabsTypesEnum } from '../../../../types'

type TeamMembersListProps = {
    solutions: Array<SolutionByTeam>
    activeTab: TabsTypesEnum
    renderConfig: RenderConfig
    updateCurrentTime: (time: number) => void
}

export const Teams: React.FC<TeamMembersListProps> = ({ solutions, activeTab, renderConfig, updateCurrentTime }) => {
    return (
        <div className={'teams'}>
            {solutions.map((solutionsEntry: SolutionByTeam) => (
                <Team
                    key={solutionsEntry.teamCreator}
                    solution={solutionsEntry}
                    activeTab={activeTab}
                    renderConfig={renderConfig}
                    updateCurrentTime={updateCurrentTime}
                />
            ))}
        </div>
    )
}
