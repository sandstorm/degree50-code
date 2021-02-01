import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import VideoCodeEntry from './VideoCodeEntry'
import AddVideoCodePrototypeForm from './VideoCodeEntry/AddVideoCodePrototypeForm'
import { VideoCodePrototype } from 'Components/VideoEditor/types'

type OwnProps = {
    videoCodesPool: VideoCodePrototype[]
    showCreateVideoCodeForm: boolean
    parentVideoCode?: VideoCodePrototype
}

const mapStateToProps = () => ({})

const mapDispatchToProps = {
    createVideoCodePrototype: actions.data.videoCodePool.append,
    removeVideoCodePrototype: actions.data.videoCodePool.remove,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodesList = (props: Props) => {
    const handleCreatePrototype = useCallback(
        (newPrototype: VideoCodePrototype) => {
            props.createVideoCodePrototype(newPrototype)
            props.syncSolution()
        },
        [props.createVideoCodePrototype, props.syncSolution]
    )

    const handleRemovePrototype = useCallback(
        (prototypeId) => {
            props.removeVideoCodePrototype(prototypeId)
            props.syncSolution()
        },
        [props.removeVideoCodePrototype, props.syncSolution]
    )

    return (
        <>
            {props.videoCodesPool?.length > 0 ? ( // exists, because we might have nested lists inside an Entry
                <ul className="video-editor__video-codes">
                    {props.videoCodesPool.map((videoCode) => (
                        <VideoCodeEntry
                            key={videoCode.id}
                            createVideoCodePrototype={handleCreatePrototype}
                            videoCode={videoCode}
                            removeVideoCodePrototype={handleRemovePrototype}
                            showCreateVideoCodeForm={props.showCreateVideoCodeForm}
                        />
                    ))}
                </ul>
            ) : null}

            {props.showCreateVideoCodeForm ? (
                <AddVideoCodePrototypeForm
                    createVideoCodePrototype={handleCreatePrototype}
                    parentVideoCode={props.parentVideoCode}
                />
            ) : null}
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoCodesList))
