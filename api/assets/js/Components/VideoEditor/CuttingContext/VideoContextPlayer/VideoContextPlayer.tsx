import React, { useRef, useEffect, useLayoutEffect, useState, FC, memo, useMemo } from 'react'
import VideoContext from 'videocontext'

import { initVideoContext, addVideoContextPlayListElement, transformCutListToVideoContextPlayList } from '../util'
import { useDebouncedResizeObserver } from '../../utils/useDebouncedResizeObserver'
import { CutList } from '../../types'
import VideoContextCanvas from './VideoContextCanvas'
import useVideoContextVolume from './hooks/useVideoContextVolume'
import useVideoContextPlayback from './hooks/useVideoContextPlayback'
import useVideoContextCurrentTime from './hooks/useVideoContextCurrentTime'
import VolumeControl from './Controls/VolumeControl'
import PlayBackControl from './Controls/PlayBackControl'
import MuteControl from './Controls/MuteControl'
import ProgressControl from './Controls/ProgressControl'
import TimeInfo from './TimeInfo'
import { getAspectRatioHeight, getAspectRatioWidth } from '../../utils'

type Props = {
    cutList: CutList
}

const VideoContextPlayer: FC<Props> = (props) => {
    const [videoContext, setVideoContext] = useState<VideoContext | undefined>(undefined)
    const videoContextPlayList = useMemo(() => transformCutListToVideoContextPlayList(props.cutList), [props.cutList])
    const $videoContextPlayerRef = useRef<HTMLDivElement>(null)
    const $canvasWrapperRef = useRef<HTMLCanvasElement>(null)
    const [canvasWidth, setCanvasWidth] = useState(0)
    const [canvasHeight, setCanvasHeight] = useState(0)
    const [videoSrcAttributes, setVideoSourceAttributes] = useState<{ videoHeight: number; videoWidth: number }>({
        videoHeight: 0,
        videoWidth: 0,
    })

    const { width: videoContextPlayerWidth, height: videoContextPlayerHeight } = useDebouncedResizeObserver(
        $videoContextPlayerRef,
        100
    )

    // controls
    const { volume, setVolume, isMuted, toggleIsMuted } = useVideoContextVolume(videoContext, 1)
    const { isPaused, toggleIsPaused } = useVideoContextPlayback(videoContext)
    const duration = useMemo(() => videoContextPlayList.reduce((acc, cut) => acc + cut.duration, 0), [
        videoContextPlayList,
    ])
    const { currentTime, setCurrentTime } = useVideoContextCurrentTime(videoContext)

    // handleKeyDown to catch play/pause toggle via short cut
    const handleKeyDown = (ev: React.KeyboardEvent<HTMLElement>) => {
        // TODO: What combination is _wanted_?
        const isKeyCombination = ev.key === ' '

        if (isKeyCombination) {
            toggleIsPaused()
            ev.preventDefault()
        }
    }

    // Determine canvas dimensions preserving the aspect ratio of the original video
    // TODO: This is still a little bit buggy - there are times, when the
    useEffect(() => {
        const canvas = $canvasWrapperRef.current
        const { videoWidth, videoHeight } = videoSrcAttributes

        if (canvas && canvas.parentElement && videoWidth > 0 && videoHeight > 0) {
            const parentElement = canvas.parentElement
            const containerHeight = parentElement.clientHeight
            const containerWidth = parentElement.clientWidth

            // set width to videoWidth capping at containerWidth
            const maxWidth = Math.min(containerWidth, videoWidth)
            const aspectRatioHeight = getAspectRatioHeight(videoWidth, videoHeight, maxWidth)

            setCanvasWidth(maxWidth)
            setCanvasHeight(aspectRatioHeight)

            // tune back to fit the canvas into the container if width is not the limiting factor
            if (canvasHeight > containerHeight) {
                // set height to videoHeight capping at containerHeight
                const maxHeight = Math.min(containerHeight, videoHeight)
                const aspectRatioWidth = getAspectRatioWidth(videoWidth, videoHeight, maxHeight)

                setCanvasHeight(maxHeight)
                setCanvasWidth(aspectRatioWidth)
            }
        }
    }, [$canvasWrapperRef, videoSrcAttributes, videoContextPlayerWidth, videoContextPlayerHeight])

    const resetVideoContext = () => {
        const { videoCtx } = initVideoContext($canvasWrapperRef)
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

        if (videoCtx && videoContextPlayList.length > 0) {
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
    }, [videoContextPlayList])

    return (
        <div className="video-context-player" onKeyDown={handleKeyDown} ref={$videoContextPlayerRef}>
            <VideoContextCanvas $canvasRef={$canvasWrapperRef} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
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
