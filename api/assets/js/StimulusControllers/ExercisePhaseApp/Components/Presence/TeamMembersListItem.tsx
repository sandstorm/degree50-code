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
            return <i className="presence__connection-state fas fa-circle " />
        case ConnectionState.DISCONNECTED:
        default:
            return <i className="presence__connection-state far fa-circle" />
    }
}

// TODO render correct user role
const renderUserRoleState = () => {
    return <i className="fas fa-crown" />
}

const TeamMembersListItem: React.FC<TeamMembersListItemProps> = ({ teamMember, connectionState }) => {
    const className = `presence__team-member presence__team-member${
        connectionState === ConnectionState.CONNECTED ? '--connected' : '--disconnected'
    }`

    return (
        <li className={className}>
            <span>
                {renderUserRoleState()} {teamMember.name}
            </span>
            {renderConnectionState(connectionState)}
        </li>
    )
}

const mapStateToProps = (state: AppState, ownProps: TeamMembersListItemOwnProps) => ({
    teamMember: selectTeamMemberById(ownProps.teamMemberId, state),
    connectionState: selectTeamMemberConnectionStateById(ownProps.teamMemberId, state),
})

export default connect(mapStateToProps)(TeamMembersListItem)
