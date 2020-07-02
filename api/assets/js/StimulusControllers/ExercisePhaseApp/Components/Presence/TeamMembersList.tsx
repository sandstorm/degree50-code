import React from 'react'
import { connect } from 'react-redux'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { selectTeamMemberIds } from './PresenceSlice'
import TeamMembersListItem from './TeamMembersListItem'

type TeamMembersListProps = ReturnType<typeof mapStateToProps>

const TeamMembersList: React.FC<TeamMembersListProps> = ({ teamMemberIds }) => {
    return (
        <div>
            <h1>TeamMembers</h1>
            <ul>
                {teamMemberIds.map((id) => (
                    <TeamMembersListItem teamMemberId={id} key={id} />
                ))}
            </ul>
        </div>
    )
}

const mapStateToProps = (state: AppState) => ({
    teamMemberIds: selectTeamMemberIds(state),
})

export default connect(mapStateToProps)(TeamMembersList)
