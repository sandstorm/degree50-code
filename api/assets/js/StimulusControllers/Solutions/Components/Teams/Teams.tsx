import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'
import { Team } from './Team'

type TeamMembersListProps = {
    solutions: Array<SolutionByTeam>
    activeTab: string
    currentTime: number
    currentZoom: number
    updateCurrentTime: (time: number) => void
}

export const Teams: React.FC<TeamMembersListProps> = ({
    solutions,
    activeTab,
    currentTime,
    currentZoom,
    updateCurrentTime,
}) => {
    return (
        <div className={'teams'}>
            {solutions.map((solutionsEntry: SolutionByTeam) => (
                <Team
                    key={solutionsEntry.teamCreator}
                    solution={solutionsEntry}
                    activeTab={activeTab}
                    currentTime={currentTime}
                    currentZoom={currentZoom}
                    updateCurrentTime={updateCurrentTime}
                />
            ))}
        </div>
    )
}
