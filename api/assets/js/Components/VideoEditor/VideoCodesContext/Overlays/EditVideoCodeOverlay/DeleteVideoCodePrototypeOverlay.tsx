import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../../components/Overlay'
import Button from 'Components/Button/Button'

const mapStateToProps = (state: VideoEditorState) => ({
    currentlyEditedElementId: selectors.overlay.currentlyEditedElementId(state),
})

const mapDispatchToProps = {
    removeVideoCodePrototype: actions.data.videoCodePrototypes.remove,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const DeleteVideoCodePrototypeOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.removePrototype)
    }

    const handleRemove = () => {
        if (props.currentlyEditedElementId !== undefined) {
            props.removeVideoCodePrototype(props.currentlyEditedElementId)
            props.syncSolution()
        }
        close()
    }

    return (
        <Overlay closeCallback={close} title="VideoCode wirklich löschen?">
            <Button className="btn btn-grey" onPress={close}>
                <i className="fas fa-times" />
                <span>Abbrechen</span>
            </Button>
            <Button className="btn btn-primary" onPress={handleRemove}>
                <i className="fas fa-check" />
                <span>Löschen</span>
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(DeleteVideoCodePrototypeOverlay))
