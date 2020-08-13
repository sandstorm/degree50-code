import React from 'react'
import { VideoCodePrototype } from '../../../Config/ConfigSlice'
import VideoCodesList from './VideoCodesList'

export type Props = {
    addVideoCode: (videoCode: VideoCodePrototype) => void
    removeVideoCode: (videoCode: VideoCodePrototype) => void
    createVideoCode: (videoCode: VideoCodePrototype, parentVideoCode?: VideoCodePrototype) => void
    videoCodesPool: Array<VideoCodePrototype>
}

// Renders a list of configured video codes.
// These are not yet part of the ReadOnlyMediaTrack.
// Be pressing the add button on these codes, students can add them
// to the media track, to arrange them.
const VideoCodes = ({ addVideoCode, removeVideoCode, createVideoCode, videoCodesPool }: Props) => {
    const hasNoVideoCodes = videoCodesPool.length === 0

    if (hasNoVideoCodes) {
        return (
            <div className="video-editor__video-codes">
                <div className={'video-code'} style={{ backgroundColor: '#ccc' }}>
                    <span>Es stehen keine Video-Codes zur Auswahl für diese Aufgabe</span>
                </div>
            </div>
        )
    }

    return (
        <VideoCodesList
            videoCodesPool={videoCodesPool}
            addVideoCode={addVideoCode}
            removeVideoCode={removeVideoCode}
            createVideoCode={createVideoCode}
            showCreateVideoCodeForm={true}
        />
    )
}

export default VideoCodes
