import { connect } from 'react-redux'
import React from 'react'
import PrototypeList from './PrototypeList'
import { selectors } from 'Components/VideoEditor/VideoEditorSlice'
import { VideoCodePoolStateSlice } from 'Components/VideoEditor/VideoCodesContext/VideoCodePrototypesSlice'

const mapStateToProps = (state: VideoCodePoolStateSlice) => {
    return {
        videoCodePrototypes: selectors.data.videoCodePrototypes.selectVideoCodePoolList(state),
    }
}

type Props = ReturnType<typeof mapStateToProps>

// Renders a list of configured video codes.
// These are not yet part of the ReadOnlyMediaTrack.
// Be pressing the add button on these codes, students can add them
// to the media track, to arrange them.
const VideoCodePrototypes = (props: Props) => {
    const hasNoVideoCodes = props.videoCodePrototypes.length === 0

    if (hasNoVideoCodes) {
        return (
            <div className="video-editor__video-codes">
                <div className={'video-code'} style={{ backgroundColor: '#ccc' }}>
                    <span>Es stehen keine Video-Codes zur Auswahl für diese Aufgabe</span>
                </div>
            </div>
        )
    }

    return <PrototypeList videoCodePrototypes={props.videoCodePrototypes} />
}

export default connect(mapStateToProps, {})(React.memo(VideoCodePrototypes))
