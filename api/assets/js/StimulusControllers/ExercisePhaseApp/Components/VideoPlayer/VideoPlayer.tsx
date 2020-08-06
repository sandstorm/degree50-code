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

    const defaultVideoRef = useRef(null)
    const videoRef = props.videoNodeRef ? props.videoNodeRef : defaultVideoRef

    useEffect(() => {
        setPlayer(videojs(videoRef.current, props.videoJsOptions, handlePlayerReady))

        return () => {
            player?.dispose()
        }
    }, [videoRef.current, props.videoJsOptions, player?.dispose])

    const updateTime = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        if (props.updateCurrentTime) {
            props.updateCurrentTime(event.currentTarget.currentTime)
        }
    }

    return (
        <div className={'video-player'}>
            <div data-vjs-player>
                <video id={'video-js'} ref={videoRef} onTimeUpdate={updateTime} className="video-js" />
            </div>
        </div>
    )
}

export default VideoPlayer
