import { OverlayContainer } from '@react-aria/overlays'
import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { memo, useEffect } from 'react'
import { connect } from 'react-redux'
import { selectConfig } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import Overlay from './Toolbar/Overlay/Overlay'
import Toolbar from './Toolbar/Toolbar'

const mapStateToProps = (state: AppState) => {
    return {
        videos: selectConfig(state).videos,
    }
}

const VideoEditor = ({ videos }: { videos: Array<Video> }) => {
    const firstVideo = videos[0]

    return (
        <div className="video-editor">
            <div className="video-container">
                <ConnectedVideoJSPlayer
                    videoJsOptions={{
                        autoplay: false,
                        controls: true,
                        sources: [
                            {
                                src: firstVideo?.url?.hls || '',
                            },
                        ],
                    }}
                    videoMap={firstVideo}
                />
            </div>
            <Toolbar />
            <Overlay />
        </div>
    )
}

export default connect(mapStateToProps)(memo(VideoEditor))
