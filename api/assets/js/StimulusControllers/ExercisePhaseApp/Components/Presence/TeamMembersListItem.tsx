import React from 'react'
import { connect } from 'react-redux'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import {
    TeamMemberId,
    selectTeamMemberById,
    ConnectionState,
    selectTeamMemberConnectionStateById,
} from './PresenceSlice'

type TeamMembersListItemOwnProps = {
    teamMemberId: TeamMemberId
}

type TeamMembersListItemProps = ReturnType<typeof mapStateToProps>

const renderConnectionState = (connectionState: ConnectionState) => {
    switch (connectionState) {
        case ConnectionState.CONNECTED:
            return 'online'
        case ConnectionState.DISCONNECTED:
        default:
            return 'offline'
    }
}

const TeamMembersListItem: React.FC<TeamMembersListItemProps> = ({ teamMember, connectionState }) => {
    const className = `team_member-list__item${
        connectionState === ConnectionState.CONNECTED ? '--connected' : '--disconnected'
    }`

    return <li className={className}>{`${teamMember.name}: ${renderConnectionState(connectionState)}`}</li>
}

const mapStateToProps = (state: AppState, ownProps: TeamMembersListItemOwnProps) => ({
    teamMember: selectTeamMemberById(ownProps.teamMemberId, state),
    connectionState: selectTeamMemberConnectionStateById(ownProps.teamMemberId, state),
})

export default connect(mapStateToProps)(TeamMembersListItem)
