import React, { useRef, useState, useEffect } from 'react'
import videojs, { VideoJsPlayerOptions, VideoJsPlayer } from 'video.js'

import 'video.js/dist/video-js.css'

type VideoPlayerProps = {
    videoJsOptions: VideoJsPlayerOptions
    updateCurrentTime: (time: number) => void
    videoNodeRef: React.RefObject<HTMLVideoElement>
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
    const [player, setPlayer] = useState<VideoJsPlayer | undefined>(undefined)
    const handlePlayerReady = () => console.log('Video Player Ready')

    useEffect(() => {
        setPlayer(videojs(props.videoNodeRef.current, props.videoJsOptions, handlePlayerReady))

        return () => {
            player?.dispose()
        }
    }, [props.videoNodeRef.current, props.videoJsOptions, player?.dispose])

    const updateTime = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        props.updateCurrentTime(event.currentTarget.currentTime)
    }

    return (
        <div className={'video-player'}>
            <div data-vjs-player>
                <video id={'video-js'} ref={props.videoNodeRef} onTimeUpdate={updateTime} className="video-js" />
            </div>
        </div>
    )
}

export default VideoPlayer
