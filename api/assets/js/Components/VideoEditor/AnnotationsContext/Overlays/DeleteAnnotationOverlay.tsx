import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo, RefObject } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from '../AnnotationsMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../Toolbar/OverlayContainer/Overlay'
import Button from 'Components/Button/Button'
import { remove } from 'immutable'

const mapStateToProps = (state: VideoEditorState) => ({
    currentlyEditedElementId: selectors.overlay.currentlyEditedElementId(state),
    annotationIds: selectors.data.annotations.selectAnnotationIds(state),
})

const mapDispatchToProps = {
    removeAnnotation: actions.data.annotations.remove,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const getFocusNextElement = (annotationIds: Array<string>, deletedAnnotationId: string) => {
    if (annotationIds.length > 1) {
        const deletedAnnotationIndex = annotationIds.findIndex((id) => id === deletedAnnotationId)
        const annotationIdsWithoutDeletedElement = remove(annotationIds, deletedAnnotationIndex)

        // The next annotation should be that takes the place (index) of the deleted one
        // If the last element is deleted the element "before" it will be focused
        const nextAnnotationIdToFocus =
            annotationIdsWithoutDeletedElement[
                Math.min(deletedAnnotationIndex, annotationIdsWithoutDeletedElement.length - 1)
            ]

        return () => {
            document.querySelector<HTMLElement>(`[data-focus-id="${nextAnnotationIdToFocus}"]`)?.focus()
        }
    } else {
        return () => {
            document.querySelector<HTMLElement>(`[data-focus-id="close-button"]`)?.focus()
        }
    }
}

const DeleteAnnotationOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.remove)
    }

    const handleRemove = () => {
        if (props.currentlyEditedElementId !== undefined) {
            const setNewFocus = getFocusNextElement(props.annotationIds, props.currentlyEditedElementId)
            props.removeAnnotation(props.currentlyEditedElementId)
            props.syncSolution()
            close()
            // focus the next plausible DOM element
            setNewFocus()
        } else {
            close()
        }
    }

    return (
        <Overlay closeCallback={close} title="Annotation wirklich löschen?">
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
