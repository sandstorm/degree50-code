import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import VideoCodeEntry from './VideoCodeEntry'
import { VideoCodePrototype } from 'Components/VideoEditor/types'
import Button from 'Components/Button/Button'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'

type OwnProps = {
    videoCodesPool: VideoCodePrototype[]
    parentVideoCode?: VideoCodePrototype
}

const mapDispatchToProps = {
    createVideoCodePrototype: actions.data.videoCodePool.append,
    removeVideoCodePrototype: actions.data.videoCodePool.remove,
    syncSolution: syncSolutionAction,
    openOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
    setCurrentlyEditedElementParentId: actions.overlay.setCurrentlyEditedElementParentId,
}

type Props = typeof mapDispatchToProps & OwnProps

const VideoCodesList = (props: Props) => {
    const handleAdd = () => {
        props.setCurrentlyEditedElementId(undefined)
        props.setCurrentlyEditedElementParentId(props.parentVideoCode?.id)
        props.openOverlay({ overlayId: VideoCodeOverlayIds.editPrototype, closeOthers: false })
    }

    return (
        <>
            {props.videoCodesPool?.length > 0 ? ( // exists, because we might have nested lists inside an Entry
                <ul className="video-editor__video-codes">
                    {props.videoCodesPool.map((videoCode) => (
                        <VideoCodeEntry key={videoCode.id} videoCode={videoCode} />
                    ))}
                </ul>
            ) : null}

            <div className="video-code">
                <Button className={'btn btn-outline-primary btn--full-width btn-sm'} onPress={handleAdd}>
                    <i className="fas fa-plus" />
                </Button>
            </div>
        </>
    )
}

export default connect(undefined, mapDispatchToProps)(React.memo(VideoCodesList))
