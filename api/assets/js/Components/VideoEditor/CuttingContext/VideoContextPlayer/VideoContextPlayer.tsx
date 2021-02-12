import React, { useRef, useEffect, useLayoutEffect, useState, FC, memo, useMemo } from 'react'
import VideoContext from 'videocontext'

import { initVideoContext, addVideoContextPlayListElement, transformCutListToVideoContextPlayList } from '../util'
import { useDebouncedResizeObserver } from '../../utils/useDebouncedResizeObserver'
import { CutList } from '../../types'
import VideoContextCanvas from './VideoContextCanvas'
import useVideoContextVolume from './hooks/useVideoContextVolume'
import useVideoContextPlayback from './hooks/useVideoContextPlayback'
import useVideoContextCurrentTime from './hooks/useVideoContextCurrentTime'
import useVideoContextPlaybackRate from './hooks/useVideoContextPlaybackRate'
import VolumeControl from './Controls/VolumeControl'
import PlayBackControl from './Controls/PlayBackControl'
import MuteControl from './Controls/MuteControl'
import ProgressControl from './Controls/ProgressControl'
import TimeInfo from './TimeInfo'

type Props = {
    cutList: CutList
}

const VideoContextPlayer: FC<Props> = (props) => {
    const [videoContext, setVideoContext] = useState<VideoContext | undefined>(undefined)
    const videoContextPlayList = useMemo(() => transformCutListToVideoContextPlayList(props.cutList), [props.cutList])
    const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null)
    const [canvasWidth, setCanvasWidth] = useState(0)
    const [canvasHeight, setCanvasHeight] = useState(0)
    const [videoSrcAttributes, setVideoSourceAttributes] = useState<{ videoHeight: number; videoWidth: number }>({
        videoHeight: 0,
        videoWidth: 0,
    })

    const { width: containerWidth } = useDebouncedResizeObserver(canvasRef, 500)

    // controls
    const { volume, setVolume, isMuted, toggleIsMuted } = useVideoContextVolume(videoContext, 1)
    const { isPaused, toggleIsPaused } = useVideoContextPlayback(videoContext)
    const duration = useMemo(() => videoContextPlayList.reduce((acc, cut) => acc + cut.duration, 0), [
        videoContextPlayList,
    ])
    const { currentTime, setCurrentTime } = useVideoContextCurrentTime(videoContext)
    const { playbackRate, setPlaybackRate } = useVideoContextPlaybackRate(videoContext)

    // handleKeyDown to catch play/pause toggle via short cut
    const handleKeyDown = (ev: React.KeyboardEvent<HTMLElement>) => {
        // TODO: What combination is _wanted_?
        const isKeyCombination = ev.key === ' '

        if (isKeyCombination) {
            toggleIsPaused()
            ev.preventDefault()
        }
    }

    // Determine canvas dimensions (important to also preserve a certain resolution)
    useEffect(() => {
        const canvas = canvasRef.current

        if (canvas && canvas.parentElement) {
            const parentElement = canvas.parentElement
            const parentHeight = parentElement.clientHeight
            const parentWidth = parentElement.clientWidth
            const { videoWidth, videoHeight } = videoSrcAttributes
            const aspectRatio = Math.min(parentWidth / videoWidth, parentHeight / videoHeight)

            if (aspectRatio !== Infinity && !isNaN(aspectRatio)) {
                setCanvasWidth(videoWidth * aspectRatio)
                setCanvasHeight(videoHeight * aspectRatio)
            }
        }
    }, [canvasRef, videoSrcAttributes, containerWidth])

    const resetVideoContext = () => {
        const { videoCtx } = initVideoContext(canvasRef)
        setVideoContext(videoCtx)

        return { videoCtx }
    }

    // Initialize video context on first render (runs once)
    useLayoutEffect(() => {
        resetVideoContext()
    }, [])

    // Update video context with new nodes
    useEffect(() => {
        const { videoCtx } = resetVideoContext()

        if (videoCtx && props.cutList.length > 0) {
            const nodesAndElements = videoContextPlayList.map((cut) => addVideoContextPlayListElement(cut, videoCtx))
            const firstVideoElement = nodesAndElements[0].videoElement

            // Determine aspect ratio by the first videoElement we encounter - we do not directly set an aspect ration, but get the videos height/width instead
            // NOTE: If we have more than one video source at some point, we might need to
            // change this to accommodate for different aspect ratios
            firstVideoElement.addEventListener('loadedmetadata', () => {
                setVideoSourceAttributes({
                    videoWidth: firstVideoElement.videoWidth,
                    videoHeight: firstVideoElement.videoHeight,
                })
            })
        }
    }, [props.cutList])

    return (
        <div className="video-context-player" onKeyDown={handleKeyDown}>
            <VideoContextCanvas canvasRef={canvasRef} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
            <div className="video-context-player__controls">
                <PlayBackControl isPaused={isPaused} toggleIsPaused={toggleIsPaused} />

                <div className="video-context-player__divider" />

                <MuteControl isMuted={isMuted} toggleIsMuted={toggleIsMuted} />
                <VolumeControl volume={volume} onChange={setVolume} />

                <div className="video-context-player__divider" />

                <TimeInfo currentTime={currentTime} duration={duration} />
                <ProgressControl duration={duration} currentTime={currentTime} setCurrentTime={setCurrentTime} />
            </div>
        </div>
    )
}

export default memo(VideoContextPlayer)
