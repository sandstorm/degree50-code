import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from './AnnotationsMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../OverlayContainer/Overlay'
import Button from 'Components/Button/Button'

const mapStateToProps = (state: VideoEditorState) => ({
    currentlyEditedElementId: selectors.overlay.currentlyEditedElementId(state),
})

const mapDispatchToProps = {
    removeAnnotation: actions.data.annotations.remove,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const DeleteAnnotationOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.remove)
    }

    const handleRemove = () => {
        if (props.currentlyEditedElementId !== undefined) {
            props.removeAnnotation(props.currentlyEditedElementId)
            props.syncSolution()
        }
        close()
    }

    return (
        <Overlay closeCallback={close}>
            <h3>Annotation wirklich löschen?</h3>
            <Button className="btn btn-secondary" onPress={close}>
                Abbrechen
            </Button>
            <Button className="btn btn-primary" onPress={handleRemove}>
                Löschen
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(DeleteAnnotationOverlay))
