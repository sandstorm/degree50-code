import Button from 'Components/Button/Button'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { ConfigStateSlice, selectors } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import {
    PresenceStateSlice,
    selectOnlineTeamMemberIds,
} from 'StimulusControllers/ExercisePhaseApp/Components/Presence/PresenceSlice'
import { actions } from '../VideoEditorSlice'
import { TEAM_OVERLAY_ID } from './TeamOverlay'

const mapStateToProps = (state: ConfigStateSlice & PresenceStateSlice) => ({
    isGroupPhase: selectors.selectIsGroupPhase(state),
    onlineTeamMemberIds: selectOnlineTeamMemberIds(state),
})

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const TeamMenu: FC<Props> = (props) => {
    const handleClick = () => {
        props.setOverlay({ overlayId: TEAM_OVERLAY_ID, closeOthers: true })
    }

    const isDisabled = !props.isGroupPhase

    return (
        <Button
            title="Team"
            isDisabled={isDisabled}
            className="btn btn-grey btn-sm video-editor__toolbar__button"
            onPress={handleClick}
        >
            {props.isGroupPhase && (
                <div className="video-editor__menu__count-badge">{props.onlineTeamMemberIds.length}</div>
            )}
            <i className="fas fa-users" />
        </Button>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(TeamMenu))
