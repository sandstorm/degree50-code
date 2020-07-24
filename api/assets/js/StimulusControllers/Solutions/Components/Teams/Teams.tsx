import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'
import { Team } from './Team'

type TeamMembersListProps = {
    solutions: Array<SolutionByTeam>
    activeTab: string
}

export const Teams: React.FC<TeamMembersListProps> = ({ solutions, activeTab }) => {
    return (
        <div className={'teams'}>
            {solutions.map((solutionsEntry: SolutionByTeam) => (
                <Team key={solutionsEntry.teamCreator} solution={solutionsEntry} activeTab={activeTab} />
            ))}
        </div>
    )
}
