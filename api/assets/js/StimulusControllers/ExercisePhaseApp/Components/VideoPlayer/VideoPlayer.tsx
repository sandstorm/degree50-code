import React, { useRef, useState, useEffect } from 'react'
import videojs, { VideoJsPlayerOptions, VideoJsPlayer } from 'video.js'

import 'video.js/dist/video-js.css'

type VideoPlayerProps = VideoJsPlayerOptions

const VideoPlayer: React.FC<VideoPlayerProps> = (options) => {
    const videoNode = useRef(null)
    const [player, setPlayer] = useState<VideoJsPlayer | undefined>(undefined)
    const handlePlayerReady = () => console.log('Video Player Ready')

    useEffect(() => {
        setPlayer(videojs(videoNode.current, options, handlePlayerReady))

        return () => {
            player?.dispose()
        }
    }, [videoNode.current, options, player?.dispose])

    // test
    const setTime = () => {
        const video = videojs(document.getElementById('video-js'))
        video.currentTime(video.currentTime() + 10)
    }

    // wrap the player in a div with a `data-vjs-player` attribute
    // so videojs won't create additional wrapper in the DOM
    // see https://github.com/videojs/video.js/pull/3856
    return (
        <div className={'video-player'}>
            <button onClick={setTime}>Set Time</button>
            <div data-vjs-player>
                <video id={'video-js'} ref={videoNode} className="video-js"></video>
            </div>
        </div>
    )
}

export default VideoPlayer
