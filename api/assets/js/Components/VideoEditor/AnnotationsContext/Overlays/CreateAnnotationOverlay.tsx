import Button from 'Components/Button/Button'
import TextField from 'Components/VideoEditor/components/TextField'
import TimeInput from 'Components/TimeInput'
import { Annotation } from 'Components/VideoEditor/types'
import { secondToTime } from 'Components/VideoEditor/utils/time'
import { actions, selectors as videoEditorSelectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { generate } from 'shortid'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../components/Overlay'
import { AnnotationOverlayIds } from '../AnnotationsMenu'
import { useAnnotationEdit } from './useAnnotationEdit'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { SolutionStateSlice } from 'Components/VideoEditor/SolutionSlice'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & SolutionStateSlice) => ({
    currentTime: videoEditorSelectors.player.selectSyncPlayPosition(state),
    duration: configSelectors.selectVideos(state)[0].duration,
    currentSolutionId: videoEditorSelectors.data.solutions.selectCurrentId(state),
})

const mapDispatchToProps = {
    appendAnnotation: actions.data.annotations.append,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CreateAnnotationOverlay: FC<Props> = (props) => {
    const { currentTime, duration } = props

    // currentTime as start
    const start = secondToTime(currentTime)
    // some default delta for end
    const end = secondToTime(Math.min(currentTime + duration / 10, duration))

    // transient annotation
    const initialAnnotation: Annotation = {
        id: generate(),
        start,
        end,
        text: '',
        memo: '',
        color: null,
        solutionId: props.currentSolutionId,
    }

    const {
        transientAnnotation,
        handleStartTimeChange,
        handleEndTimeChange,
        updateText,
        updateMemo,
        minAllowedStartTime,
        maxAllowedStartTime,
        minAllowedEndTime,
        maxAllowedEndTime,
    } = useAnnotationEdit(duration, initialAnnotation)

    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.create)
    }

    if (!transientAnnotation) {
        close()
        return null
    }

    const handleSave = () => {
        props.appendAnnotation(transientAnnotation)
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close} title="Neue Annotation">
            <TimeInput
                label="Start"
                value={transientAnnotation.start}
                min={minAllowedStartTime}
                max={maxAllowedStartTime}
                onChange={handleStartTimeChange}
                hoursLabel="Start Stunden"
                minutesLabel="Start Minuten"
                secondsLabel="Start Sekunden"
            />
            <TimeInput
                label="Ende"
                value={transientAnnotation.end}
                min={minAllowedEndTime}
                max={maxAllowedEndTime}
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
            <Button className="btn btn-secondary" onPress={close} title="Annotation Verwerfen">
                Verwerfen
            </Button>
            <Button className="btn btn-primary" onPress={handleSave} title="Annotation Speichern">
                Speichern
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CreateAnnotationOverlay))
