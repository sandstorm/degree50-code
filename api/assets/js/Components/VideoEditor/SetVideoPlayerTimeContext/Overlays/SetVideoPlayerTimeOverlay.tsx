import React, { memo, useState } from 'react'
import Overlay from '../../components/Overlay'
import {
    actions as videoEditorActions,
    selectors as videoEditorSelectors,
    VideoEditorState,
} from '../../VideoEditorSlice'
import TimeInput from '../../../TimeInput'
import { secondToTime, timeToSecond } from '../../utils/time'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { SetVideoPlayerTimeOverlayId } from '../SetVideoPlayerTimeMenu'
import Button from '../../../Button/Button'
import { connect } from 'react-redux'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => ({
    currentTime: videoEditorSelectors.player.selectSyncPlayPosition(state),
    duration: configSelectors.selectVideos(state)[0].duration,
})

const mapDispatchToProps = {
    closeOverlay: videoEditorActions.overlay.unsetOverlay,
    setPlayerTime: videoEditorActions.player.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const SetVideoPlayerTimeOverlay = (props: Props) => {
    const [time, setTime] = useState(secondToTime(props.currentTime))
    const maxAllowedTime = secondToTime(props.duration)
    const minAllowedTime = '00:00:00.000'

    const close = () => {
        props.closeOverlay(SetVideoPlayerTimeOverlayId)
    }

    const handleCommit = () => {
        props.setPlayerTime(timeToSecond(time))
        close()
    }

    return (
        <Overlay closeCallback={close} title="Tastenkombinationen">
            <TimeInput
                label="Zeit"
                value={time}
                onChange={setTime}
                max={maxAllowedTime}
                min={minAllowedTime}
                hoursLabel="Stunden"
                minutesLabel="Minuten"
                secondsLabel="Sekunden"
                showMs={false}
            />
            <hr />
            <Button className="btn btn-secondary" onPress={close} title="Abbrechen">
                Abbrechen
            </Button>
            <Button className="btn btn-primary" onPress={handleCommit} title="Zu eingegebener Zeit springen">
                Zu Zeit Springen
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(SetVideoPlayerTimeOverlay))
