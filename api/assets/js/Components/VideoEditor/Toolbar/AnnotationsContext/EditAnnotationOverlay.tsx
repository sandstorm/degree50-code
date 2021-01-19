import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { Annotation } from 'Components/VideoEditor/VideoListsSlice'
import React, { ChangeEvent, FC, memo, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from './AnnotationsMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import TimeInput from 'Components/VideoEditor/Editors/components/TimeInput/TimeInput'
import { useAnnotationEdit } from './useAnnotationEdit'
import Overlay from '../OverlayContainer/Overlay'

const mapStateToProps = (state: VideoEditorState) => {
    const currentlyEditedElementId = selectors.overlay.currentlyEditedElementId(state)
    const annotationsById = selectors.data.annotations.selectAnnotationsById(state)
    const annotation = currentlyEditedElementId ? annotationsById[currentlyEditedElementId] : undefined

    return {
        annotation,
    }
}

const mapDispatchToProps = {
    updateAnnotation: actions.data.annotations.update,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// TODO this should probably be consolidated into a single component with the CreateAnnotationOverlay
const EditAnnotationOverlay: FC<Props> = (props) => {
    const {
        transientAnnotation,
        handleStartTimeChange,
        handleEndTimeChange,
        handleTextChange,
        handleMemoChange,
    } = useAnnotationEdit(props.annotation)

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
        <Overlay closeCallback={close}>
            <h3>Annotation Bearbeiten</h3>
            <TimeInput label="Start" value={transientAnnotation.start} onChange={handleStartTimeChange} />
            <TimeInput label="Ende" value={transientAnnotation.end} onChange={handleEndTimeChange} />
            <textarea value={transientAnnotation.text} onChange={handleTextChange} />
            <textarea value={transientAnnotation.memo} onChange={handleMemoChange} />
            <button onClick={close}>Verwerfen</button>
            <button onClick={handleSave}>Speichern</button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(EditAnnotationOverlay))
