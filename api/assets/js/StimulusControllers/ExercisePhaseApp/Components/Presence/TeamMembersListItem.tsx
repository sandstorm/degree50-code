import React from 'react'
import { connect } from 'react-redux'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { TeamMemberId, selectTeamMemberById, ConnectionState } from './PresenceSlice'

type TeamMembersListItemOwnProps = {
    teamMemberId: TeamMemberId
}

type TeamMembersListItemProps = ReturnType<typeof mapStateToProps>

// TODO should be own component
const ConnectionStateRenderer: React.FC<{ connectionState: ConnectionState }> = ({ connectionState }) => {
    switch (connectionState) {
        case ConnectionState.CONNECTED:
            return <em>'online'</em>
        case ConnectionState.NOT_CONNECTED:
        default:
            return <em>'offline'</em>
    }
}

const TeamMembersListItem: React.FC<TeamMembersListItemProps> = ({ teamMember }) => {
    return (
        <li>
            `${teamMember.name}: ${<ConnectionStateRenderer connectionState={teamMember.connectionState} />}`
        </li>
    )
}

const mapStateToProps = (state: AppState, ownProps: TeamMembersListItemOwnProps) => ({
    teamMember: selectTeamMemberById(ownProps.teamMemberId, state),
})

export default connect(mapStateToProps)(TeamMembersListItem)
