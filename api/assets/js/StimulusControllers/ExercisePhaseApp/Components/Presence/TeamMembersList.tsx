import React from 'react'
import { connect } from 'react-redux'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { selectIsConnecting, selectTeamMemberIds } from './PresenceSlice'
import TeamMembersListItem from './TeamMembersListItem'

type TeamMembersListProps = ReturnType<typeof mapStateToProps>

const TeamMembersList: React.FC<TeamMembersListProps> = ({ isConnecting, teamMemberIds }) => {
    return (
        <div>
            {isConnecting ? (
                'connecting ...'
            ) : teamMemberIds.length > 0 ? (
                <ul className="presence__team-member-list">
                    {teamMemberIds.map((id) => (
                        <TeamMembersListItem teamMemberId={id} key={id} />
                    ))}
                </ul>
            ) : (
                'fetching presence data ...'
            )}
        </div>
    )
}

const mapStateToProps = (state: AppState) => ({
    teamMemberIds: selectTeamMemberIds(state),
    isConnecting: selectIsConnecting(state),
})

export default connect(mapStateToProps)(TeamMembersList)
