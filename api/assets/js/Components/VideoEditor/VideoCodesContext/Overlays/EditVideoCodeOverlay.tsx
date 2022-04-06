import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import TimeInput from 'Components/TimeInput'
import Overlay from '../../components/Overlay'
import TextField from 'Components/VideoEditor/components/TextField'
import Button from 'Components/Button/Button'
import VideoCodeSelection from './VideoCodePrototypeSelection'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { VideoCodeOverlayIds } from '../VideoCodesMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { useVideoCodeEdit } from './useVideoCodeEdit'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    const currentlyEditedElementId = selectors.overlay.currentlyEditedElementId(state)
    const videoCodesById = selectors.data.videoCodes.selectById(state)
    const videoCode = currentlyEditedElementId ? videoCodesById[currentlyEditedElementId] : undefined
    const duration = configSelectors.selectVideos(state)[0].duration

    return {
        videoCode,
        prototypes: selectors.data.selectAllPrototypesFlattened(state),
        duration,
    }
}

const mapDispatchToProps = {
    updateVideoCode: actions.data.videoCodes.update,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// TODO this should probably be consolidated into a single component with the CreateVideoCodeOverlay
const EditVideoCodeOverlay: FC<Props> = (props) => {
    const defaultPrototypeId = props.prototypes[0].id

    const {
        transientVideoCode,
        handleStartTimeChange,
        handleEndTimeChange,
        handleMemoChange,
        updateSelectedCode,
        minAllowedStartTime,
        maxAllowedStartTime,
        minAllowedEndTime,
        maxAllowedEndTime,
    } = useVideoCodeEdit(props.duration, props.videoCode)

    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.edit)
    }

    if (!transientVideoCode) {
        close()
        return null
    }

    const handleSave = () => {
        props.updateVideoCode({ transientVideoCode })
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close} title="Codierung bearbeiten">
            <TimeInput
                label="Start"
                hoursLabel="Start Stunden"
                minutesLabel="Start Minuten"
                secondsLabel="Start Sekunden"
                value={transientVideoCode.start}
                min={minAllowedStartTime}
                max={maxAllowedStartTime}
                onChange={handleStartTimeChange}
            />
            <TimeInput
                label="Ende"
                hoursLabel="Ende Stunden"
                minutesLabel="End Minuten"
                secondsLabel="Ende Sekunden"
                value={transientVideoCode.end}
                min={minAllowedEndTime}
                max={maxAllowedEndTime}
                onChange={handleEndTimeChange}
            />
            <hr />
            <VideoCodeSelection
                defaultPrototypeId={defaultPrototypeId}
                onSelect={updateSelectedCode}
                selectedPrototypeId={transientVideoCode.idFromPrototype}
            />
            <br />

            <label htmlFor="memo">Memo</label>
            <TextField id="memo" text={transientVideoCode.memo} updateText={handleMemoChange} />
            <hr />

            <Button className="btn btn-secondary" onPress={close} title="Änderungen Verwerfen">
                Verwerfen
            </Button>
            <Button className="btn btn-primary" onPress={handleSave} title="Änderungen Speichern">
                Speichern
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(EditVideoCodeOverlay))
