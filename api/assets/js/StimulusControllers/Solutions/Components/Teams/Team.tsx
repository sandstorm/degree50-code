import React from 'react'
import { SolutionByTeam } from '../../SolutionsApp'

type TeamProps = {
    solution: SolutionByTeam
    activeTab: string
}

export const Team: React.FC<TeamProps> = ({ solution, activeTab }) => {
    return (
        <div className={'team'}>
            <header>
                {solution.teamCreator} {solution.teamMembers.length > 1 ? '(' + solution.teamMembers + ')' : ''}
            </header>
            <div className={'team__solution'}>Solution: {activeTab}</div>
        </div>
    )
}
