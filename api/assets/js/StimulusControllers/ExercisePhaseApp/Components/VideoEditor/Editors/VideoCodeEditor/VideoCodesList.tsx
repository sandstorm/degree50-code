import React from 'react'
import { VideoCodePrototype } from '../../../Config/ConfigSlice'
import AddVideoCodesForm from './AddVideoCodesForm'
import VideoCodeEntry from './VideoCodeEntry'

export type Props = {
    videoCodesPool: VideoCodePrototype[]
    addVideoCode: (videoCode: VideoCodePrototype) => void
    removeVideoCode: (videoCode: VideoCodePrototype) => void
    createVideoCode: (videoCode: VideoCodePrototype, parentVideoCode?: VideoCodePrototype) => void
    showCreateVideoCodeForm: boolean
    parentVideoCode?: VideoCodePrototype
}

const VideoCodesList = (props: Props) => {
    return (
        <>
            {props.videoCodesPool?.length > 0 ? (
                <ul className="video-editor__video-codes">
                    {props.videoCodesPool.map((videoCode) => (
                        <VideoCodeEntry
                            videoCode={videoCode}
                            removeVideoCode={props.removeVideoCode}
                            addVideoCode={props.addVideoCode}
                            createVideoCode={props.createVideoCode}
                            showCreateVideoCodeForm={props.showCreateVideoCodeForm}
                        />
                    ))}
                </ul>
            ) : null}

            {props.showCreateVideoCodeForm ? (
                <AddVideoCodesForm createVideoCode={props.createVideoCode} parentVideoCode={props.parentVideoCode} />
            ) : null}
        </>
    )
}

export default VideoCodesList
