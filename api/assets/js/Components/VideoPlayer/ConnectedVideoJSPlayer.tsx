import React from 'react'
import { connect } from 'react-redux'
import { VideoJsPlayerOptions } from 'video.js'

import 'video.js/dist/video-js.css'
import { Video } from './VideoPlayerWrapper'
import { actions, selectors, VideoEditorState } from '../VideoEditor/VideoEditorSlice'
import VideoJSPlayer, { CustomVideoControl } from './VideoJSPlayer'
import { AppDispatch } from '../../StimulusControllers/ExerciseAndSolutionStore/Store'

type OwnProps = {
    videoJsOptions: VideoJsPlayerOptions
    videoMap?: Video
    worker?: Worker
    customVideoControls?: Array<CustomVideoControl<(dispatch: AppDispatch) => void>>
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        playPosition: selectors.player.selectPlayPosition(state),
        isPaused: selectors.player.selectIsPaused(state),
    }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    setSyncPlayPosition: (pos: number) => dispatch(actions.player.setSyncPlayPosition(pos)),
    setPause: (isPaused: boolean) => dispatch(actions.player.setPause(isPaused)),
    dispatch,
})

type VideoPlayerProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & OwnProps

const ConnectedVideoJSPlayer: React.FC<VideoPlayerProps> = (props) => {
    const customVideoControlsWithDispatch: Array<CustomVideoControl<() => void>> | undefined =
        props.customVideoControls?.map((customControl) => ({
            ...customControl,
            dispatchActions: () => customControl.dispatchActions(props.dispatch),
        }))

    return (
        <VideoJSPlayer
            {...props}
            customControls={customVideoControlsWithDispatch}
            updateTimeCallback={props.setSyncPlayPosition}
            setPauseCallback={props.setPause}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ConnectedVideoJSPlayer))
