import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import PrototypeEntry from './PrototypeEntry'
import { VideoCodePrototype } from 'Components/VideoEditor/types'
import Button from 'Components/Button/Button'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'

type OwnProps = {
    videoCodePrototypes: VideoCodePrototype[]
    parentPrototype?: VideoCodePrototype
}

const mapDispatchToProps = {
    createVideoCodePrototype: actions.data.videoCodePrototypes.append,
    removeVideoCodePrototype: actions.data.videoCodePrototypes.remove,
    syncSolution: syncSolutionAction,
    openOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
    setCurrentlyEditedElementParentId: actions.overlay.setCurrentlyEditedElementParentId,
}

type Props = typeof mapDispatchToProps & OwnProps

const PrototypeList = (props: Props) => {
    const handleAdd = () => {
        props.setCurrentlyEditedElementId(undefined)
        props.setCurrentlyEditedElementParentId(props.parentPrototype?.id)
        props.openOverlay({ overlayId: VideoCodeOverlayIds.editPrototype, closeOthers: false })
    }

    return (
        <>
            {props.videoCodePrototypes?.length > 0 ? ( // exists, because we might have nested lists inside an Entry
                <ul className="video-editor__video-codes">
                    {props.videoCodePrototypes.map((prototype) => (
                        <PrototypeEntry key={prototype.id} videoCodePrototype={prototype} />
                    ))}
                </ul>
            ) : null}

            <div className="video-code">
                <Button
                    title={`Neuen ${props.parentPrototype ? 'Untercode' : 'Code'} erstellen`}
                    className={'btn btn-outline-primary btn--full-width btn-sm'}
                    onPress={handleAdd}
                >
                    <i className="fas fa-plus" />
                </Button>
            </div>
        </>
    )
}

export default connect(undefined, mapDispatchToProps)(React.memo(PrototypeList))
