import { connect } from 'react-redux'
import React from 'react'
import VideoCodesList from './VideoCodesList'
import { selectors } from 'Components/VideoEditor/VideoEditorSlice'
import { VideoCodePoolStateSlice } from 'Components/VideoEditor/VideoCodesContext/VideoCodePoolSlice'

const mapStateToProps = (state: VideoCodePoolStateSlice) => {
    return {
        videoCodesPool: selectors.data.videoCodePool.selectVideoCodePoolList(state),
    }
}

type Props = ReturnType<typeof mapStateToProps>

// Renders a list of configured video codes.
// These are not yet part of the ReadOnlyMediaTrack.
// Be pressing the add button on these codes, students can add them
// to the media track, to arrange them.
const VideoCodes = ({ videoCodesPool }: Props) => {
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

    return <VideoCodesList videoCodesPool={videoCodesPool} showCreateVideoCodeForm={true} />
}

export default connect(mapStateToProps, {})(React.memo(VideoCodes))
