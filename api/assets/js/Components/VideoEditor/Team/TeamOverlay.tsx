import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import {
    PresenceStateSlice,
    selectOnlineTeamMemberIds,
} from 'StimulusControllers/ExercisePhaseApp/Components/Presence/PresenceSlice'
import TeamMembersList from 'StimulusControllers/ExercisePhaseApp/Components/Presence/TeamMembersList'
import Overlay from '../components/Overlay'
import { actions } from '../VideoEditorSlice'

export const TEAM_OVERLAY_ID = 'overlay/team'

const mapStateToProps = (state: PresenceStateSlice) => ({
    onlineTeamMemberIds: selectOnlineTeamMemberIds(state),
})

const mapDispatchToProps = {
    unsetOverlay: actions.overlay.unsetOverlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const TeamOverlay: FC<Props> = (props) => {
    const title = `Team - ${props.onlineTeamMemberIds.length} online`
    const handleClose = () => {
        props.unsetOverlay(TEAM_OVERLAY_ID)
    }

    return (
        <Overlay title={title} closeCallback={handleClose}>
            <TeamMembersList />
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(TeamOverlay))
