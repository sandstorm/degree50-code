import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import videojs, { VideoJsPlayerOptions, VideoJsPlayer } from 'video.js'

import 'video.js/dist/video-js.css'
import { Video } from './VideoPlayerWrapper'
import { actions, selectors, VideoEditorState } from '../VideoEditor/VideoEditorSlice'

type OwnProps = {
    videoJsOptions: VideoJsPlayerOptions
    videoMap?: Video
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

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
    const [player, setPlayer] = useState<VideoJsPlayer | undefined>(undefined)
    const videoRef: React.RefObject<HTMLVideoElement> = useRef(null)

    useEffect(() => {
        setPlayer(videojs(videoRef.current, props.videoJsOptions))

        return () => {
            player?.dispose()
        }
    }, [videoRef.current, props.videoJsOptions, player?.dispose])

    useEffect(() => {
        if (player) {
            if (props.isPaused) {
                player.pause()
            } else {
                player.play()
            }
        }
    }, [player, props.isPaused])

    useEffect(() => {
        if (player) {
            console.log(props.playPosition)
            player.currentTime(props.playPosition)
        }
    }, [player, props.playPosition])

    const updateTime = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        props.setSyncPlayPosition(event.currentTarget.currentTime)
    }

    const vttPath = props?.videoMap?.url?.vtt

    return (
        <div className={'video-player'}>
            <div data-vjs-player>
                <video
                    id={'video-js'}
                    ref={videoRef}
                    onTimeUpdate={updateTime}
                    onPause={(event: React.SyntheticEvent<HTMLVideoElement, Event>) => props.setPause(true)}
                    onPlay={(event: React.SyntheticEvent<HTMLVideoElement, Event>) => props.setPause(false)}
                    className="video-js"
                >
                    {vttPath && <track kind="captions" src={vttPath} label="English" default />}
                </video>
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoPlayer))
