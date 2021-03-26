import React from 'react'
import { connect } from 'react-redux'
import { VideoJsPlayerOptions } from 'video.js'

import 'video.js/dist/video-js.css'
import { Video } from './VideoPlayerWrapper'
import { actions, selectors, VideoEditorState } from '../VideoEditor/VideoEditorSlice'
import VideoJSPlayer from './VideoJSPlayer'

type OwnProps = {
    videoJsOptions: VideoJsPlayerOptions
    videoMap?: Video
    worker?: Worker
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        playPosition: selectors.player.selectPlayPosition(state),
        isPaused: selectors.player.selectIsPaused(state),
    }
}

const mapDispatchToProps = {
    setSyncPlayPosition: actions.player.setSyncPlayPosition,
    setPause: actions.player.setPause,
}

type VideoPlayerProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const ConnectedVideoJSPlayer: React.FC<VideoPlayerProps> = (props) => {
    return <VideoJSPlayer {...props} updateTimeCallback={props.setSyncPlayPosition} setPauseCallback={props.setPause} />
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ConnectedVideoJSPlayer))
