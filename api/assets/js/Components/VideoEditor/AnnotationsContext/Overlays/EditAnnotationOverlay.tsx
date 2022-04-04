import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from '../AnnotationsMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import TimeInput from 'Components/TimeInput'
import { useAnnotationEdit } from './useAnnotationEdit'
import Overlay from '../../components/Overlay'
import TextField from 'Components/VideoEditor/components/TextField'
import Button from 'Components/Button/Button'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    const currentlyEditedElementId = selectors.overlay.currentlyEditedElementId(state)
    const annotationsById = selectors.data.annotations.selectById(state)
    const annotation = currentlyEditedElementId ? annotationsById[currentlyEditedElementId] : undefined
    const duration = configSelectors.selectVideos(state)[0].duration

    return {
        annotation,
        duration,
    }
}

const mapDispatchToProps = {
    updateAnnotation: actions.data.annotations.update,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// TODO: this should probably be consolidated into a single component with the CreateAnnotationOverlay
const EditAnnotationOverlay: FC<Props> = (props) => {
    const {
        transientAnnotation,
        handleStartTimeChange,
        handleEndTimeChange,
        updateText,
        updateMemo,
        minStart,
        maxStart,
        minEnd,
        maxEnd,
    } = useAnnotationEdit(props.duration, props.annotation)

    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.edit)
    }

    if (!transientAnnotation) {
        close()
        return null
    }

    const handleSave = () => {
        props.updateAnnotation({ transientAnnotation })
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close} title="Annotation bearbeiten">
            <TimeInput
                label="Start"
                value={transientAnnotation.start}
                min={minStart}
                max={maxStart}
                onChange={handleStartTimeChange}
                hoursLabel="Start Stunden"
                minutesLabel="Start Minuten"
                secondsLabel="Start Sekunden"
            />
            <TimeInput
                label="Ende"
                value={transientAnnotation.end}
                min={minEnd}
                max={maxEnd}
                onChange={handleEndTimeChange}
                hoursLabel="Ende Stunden"
                minutesLabel="Ende Minuten"
                secondsLabel="Ende Sekunden"
            />
            <hr />
            <label htmlFor="text">Beschreibung</label>
            <TextField id="text" text={transientAnnotation.text} updateText={updateText} />
            <br />
            <label htmlFor="memo">Memo</label>
            <TextField id="memo" text={transientAnnotation.memo} updateText={updateMemo} />
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

export default connect(mapStateToProps, mapDispatchToProps)(memo(EditAnnotationOverlay))
