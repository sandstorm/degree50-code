import { connect } from 'react-redux'
import React from 'react'
import PrototypeList from './PrototypeList'
import { actions, selectors } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import Button from 'Components/Button/Button'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => {
    const isSolutionView = selectors.config.selectIsSolutionView(state)

    const videoCodePrototypes = isSolutionView
        ? selectors.data.selectAllPrototypesList(state)
        : selectors.data.selectCurrentPrototypesList(state)

    return {
        videoCodePrototypes,
        isSolutionView,
    }
}

const mapDispatchToProps = {
    openOverlay: actions.videoEditor.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.videoEditor.overlay.setCurrentlyEditedElementId,
    setCurrentlyEditedElementParentId: actions.videoEditor.overlay.setCurrentlyEditedElementParentId,
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
        props.openOverlay({
            overlayId: VideoCodeOverlayIds.editPrototype,
            closeOthers: false,
        })
    }

    if (hasNoVideoCodes) {
        return (
            <div className="video-editor__video-codes">
                <div className={'video-code'} style={{ backgroundColor: '#ccc' }}>
                    <span>Es stehen keine Video-Codes zur Auswahl für diese Aufgabe</span>
                </div>

                {!props.isSolutionView && (
                    <Button
                        className={'button button--type-outline-primary button--block button--size-small'}
                        onPress={handleAdd}
                        title="Neuen Code Erstellen"
                    >
                        <i className="fas fa-plus" /> Neuen Code erstellen
                    </Button>
                )}
            </div>
        )
    }

    return <PrototypeList videoCodePrototypes={props.videoCodePrototypes} />
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoCodePrototypes))
