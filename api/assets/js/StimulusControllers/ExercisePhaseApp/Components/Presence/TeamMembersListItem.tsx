import React from 'react'
import { connect } from 'react-redux'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { TeamMemberId, selectTeamMemberById, ConnectionState } from './PresenceSlice'
import { selectCurrentEditorId } from './CurrentEditorSlice'

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
const renderUserRoleState = (currentEditor: TeamMemberId | undefined, teamMemberId: TeamMemberId) => {
    return currentEditor === teamMemberId ? <i className="fas fa-crown" /> : null
}

const TeamMembersListItem: React.FC<TeamMembersListItemProps> = ({ teamMember, currentEditor }) => {
    const className = `presence__team-member presence__team-member${
        teamMember.connectionState === ConnectionState.CONNECTED ? '--connected' : '--disconnected'
    }`

    return (
        <li className={className}>
            <span>
                {teamMember.name} {renderUserRoleState(currentEditor, teamMember.id)}
            </span>
            {renderConnectionState(teamMember.connectionState)}
        </li>
    )
}

const mapStateToProps = (state: AppState, ownProps: TeamMembersListItemOwnProps) => ({
    teamMember: selectTeamMemberById(ownProps.teamMemberId, state),
    currentEditor: selectCurrentEditorId(state),
})

export default connect(mapStateToProps)(TeamMembersListItem)
