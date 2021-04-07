import { connect } from 'react-redux'
import React from 'react'
import PrototypeList from './PrototypeList'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import Button from 'Components/Button/Button'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    const isSolutionView = configSelectors.selectIsSolutionView(state)

    const videoCodePrototypes = isSolutionView
        ? selectors.data.selectAllPrototypesList(state)
        : selectors.data.selectCurrentPrototypesList(state)

    return {
        videoCodePrototypes,
        isSolutionView,
    }
}

const mapDispatchToProps = {
    openOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
    setCurrentlyEditedElementParentId: actions.overlay.setCurrentlyEditedElementParentId,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// Renders a list of configured video codes.
// These are not yet part of the ReadOnlyMediaTrack.
// Be pressing the add button on these codes, students can add them
// to the media track, to arrange them.
const VideoCodePrototypes = (props: Props) => {
    const hasNoVideoCodes = props.videoCodePrototypes.length === 0

    const handleAdd = () => {
        props.setCurrentlyEditedElementId(undefined)
        props.setCurrentlyEditedElementParentId(undefined)
        props.openOverlay({ overlayId: VideoCodeOverlayIds.editPrototype, closeOthers: false })
    }

    if (hasNoVideoCodes) {
        return (
            <div className="video-editor__video-codes">
                <div className={'video-code'} style={{ backgroundColor: '#ccc' }}>
                    <span>Es stehen keine Video-Codes zur Auswahl für diese Aufgabe</span>
                </div>

                {!props.isSolutionView && (
                    <div className="video-code">
                        <Button
                            className={'btn btn-outline-primary btn--full-width btn-sm'}
                            onPress={handleAdd}
                            title="Neuen Code Erstellen"
                        >
                            <i className="fas fa-plus" />
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return <PrototypeList videoCodePrototypes={props.videoCodePrototypes} />
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoCodePrototypes))
