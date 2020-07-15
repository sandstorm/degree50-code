import React from 'react'
import { connect } from 'react-redux'
import TeamMembersList from './TeamMembersList'
import { AppState } from '../../Store/Store'
import { selectTeamMemberIds } from './PresenceSlice'

type PresenceProps = ReturnType<typeof mapStateToProps>

const Presence: React.FC<PresenceProps> = ({ teamMemberIds }) => {
    return (
        <div className={'presence'}>
            <header className={'presence__header'}>Online: {teamMemberIds.length}</header>
            <TeamMembersList />
        </div>
    )
}

const mapStateToProps = (state: AppState) => ({
    teamMemberIds: selectTeamMemberIds(state),
})

export default connect(mapStateToProps)(Presence)
