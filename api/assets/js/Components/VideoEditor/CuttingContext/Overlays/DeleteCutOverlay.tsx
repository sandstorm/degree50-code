import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { CutOverlayIds } from '../CuttingMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../components/Overlay'
import Button from 'Components/Button/Button'
import { remove } from 'immutable'

const mapStateToProps = (state: VideoEditorState) => ({
    currentlyEditedElementId: selectors.overlay.currentlyEditedElementId(state),
    cutIds: selectors.data.cuts.selectCutIds(state),
})

const mapDispatchToProps = {
    removeCut: actions.data.cuts.remove,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const getFocusNextElement = (cutIds: Array<string>, deletedCutId: string) => {
    if (cutIds.length > 1) {
        const deletedCutIndex = cutIds.findIndex((id) => id === deletedCutId)
        const cutIdsWithoutDeletedElement = remove(cutIds, deletedCutIndex)

        // The next cut should be that takes the place (index) of the deleted one
        // If the last element is deleted the element "before" it will be focused
        const nextCutIdToFocus =
            cutIdsWithoutDeletedElement[Math.min(deletedCutIndex, cutIdsWithoutDeletedElement.length - 1)]

        return () => {
            document.querySelector<HTMLElement>(`[data-focus-id="${nextCutIdToFocus}"]`)?.focus()
        }
    } else {
        return () => {
            document.querySelector<HTMLElement>(`[data-focus-id="close-button"]`)?.focus()
        }
    }
}

const DeleteCutOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(CutOverlayIds.remove)
    }

    const handleRemove = () => {
        if (props.currentlyEditedElementId !== undefined) {
            const setNewFocus = getFocusNextElement(props.cutIds, props.currentlyEditedElementId)
            props.removeCut(props.currentlyEditedElementId)
            props.syncSolution()
            close()
            // focus the next plausible DOM element
            setNewFocus()
        } else {
            close()
        }
    }

    return (
        <Overlay closeCallback={close} title="Schnitt wirklich löschen?">
            <Button className="btn btn-secondary" onPress={close}>
                Abbrechen
            </Button>
            <Button className="btn btn-primary" onPress={handleRemove}>
                Löschen
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(DeleteCutOverlay))
