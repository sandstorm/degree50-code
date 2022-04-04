import Button from 'Components/Button/Button'
import TextField from 'Components/VideoEditor/components/TextField'
import DegreeTimeInput from 'Components/VideoEditor/components/DegreeTimeInput'
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

    const currentTimeTimeString = secondToTime(currentTime)
    console.log(currentTimeTimeString)
    const durationTimeString = secondToTime(duration)

    // currentTime as start
    const start = currentTimeTimeString
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

    const { transientAnnotation, handleStartTimeChange, handleEndTimeChange, updateText, updateMemo } =
        useAnnotationEdit(duration, initialAnnotation)

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
            <DegreeTimeInput
                label="Start"
                value={transientAnnotation.start}
                minValue={'00:00:00'}
                maxValue={durationTimeString}
                onChange={handleStartTimeChange}
            />
            <DegreeTimeInput
                label="Ende"
                value={transientAnnotation.end}
                minValue={transientAnnotation.start}
                maxValue={durationTimeString}
                onChange={handleEndTimeChange}
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
