import React from 'react'
import { connect } from 'react-redux'
import { AppDispatch, AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { ConnectionState, selectTeamMemberById, TeamMemberId } from './PresenceSlice'
import { selectCurrentEditorId } from './CurrentEditorSlice'
import { promoteUserToCurrentEditorAction } from './PresenceSaga'
import { selectUserId } from '../Config/ConfigSlice'

type TeamMembersListItemOwnProps = {
    teamMemberId: TeamMemberId
}

type TeamMembersListItemProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const renderConnectionState = (connectionState: ConnectionState) => {
    switch (connectionState) {
        case ConnectionState.CONNECTED:
            return <i className="presence__connection-state fas fa-circle " />
        case ConnectionState.DISCONNECTED:
        default:
            return <i className="presence__connection-state far fa-circle" />
    }
}

const renderUserRoleState = (currentEditor: TeamMemberId | undefined, teamMemberId: TeamMemberId) => {
    return currentEditor === teamMemberId ? <i className="fas fa-crown" /> : null
}

const TeamMembersListItem: React.FC<TeamMembersListItemProps> = ({
    teamMember,
    currentEditor,
    userId,
    promoteTeamMemberToCurrentEditor,
}) => {
    const className = `presence__team-member presence__team-member${
        teamMember.connectionState === ConnectionState.CONNECTED ? '--connected' : '--disconnected'
    }`

    const canBePromotedToCurrentEditor =
        teamMember.connectionState === ConnectionState.CONNECTED && teamMember.id !== currentEditor

    const isCurrentEditor = userId === currentEditor

    return (
        <li className={className}>
            <span>
                {teamMember.name} {renderUserRoleState(currentEditor, teamMember.id)}
            </span>
            {isCurrentEditor && (
                <button disabled={!canBePromotedToCurrentEditor} onClick={promoteTeamMemberToCurrentEditor}>
                    Promote
                </button>
            )}
            {renderConnectionState(teamMember.connectionState)}
        </li>
    )
}

const mapStateToProps = (state: AppState, ownProps: TeamMembersListItemOwnProps) => ({
    teamMember: selectTeamMemberById(ownProps.teamMemberId, state),
    currentEditor: selectCurrentEditorId(state),
    userId: selectUserId(state),
})

const mapDispatchToProps = (dispatch: AppDispatch, ownProps: TeamMembersListItemOwnProps) => ({
    promoteTeamMemberToCurrentEditor: () => {
        dispatch(promoteUserToCurrentEditorAction(ownProps.teamMemberId))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembersListItem)
