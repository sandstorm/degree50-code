import React, { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { connect } from 'react-redux'
import VideoContext from 'videocontext'

import { actions, selectors } from '../PlayerSlice'
import { initVideoContext, addVideoContextPlaylistElement, transformCutListToVideoContextPlaylist } from './util'
import { VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { useDebouncedResizeObserver } from '../utils/useDebouncedResizeObserver'
import { CutList } from '../types'

type OwnProps = {
    cutList: CutList
    currentTimeCallback: (time: number) => void
    volume: number
}

const mapStateToProps = (state: VideoEditorState) => ({
    playPosition: selectors.selectPlayPosition(state),
    isPaused: selectors.selectIsPaused(state),
})

const mapDispatchToProps = {
    setSyncPlayPosition: actions.setSyncPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoContextPlayer = ({
    cutList,
    currentTimeCallback,
    setSyncPlayPosition,
    playPosition,
    volume,
    isPaused,
}: Props) => {
    const [videoContext, setVideoContext] = useState<VideoContext | undefined>(undefined)
    const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null)
    const { width: containerWidth } = useDebouncedResizeObserver(canvasRef, 500)

    const [canvasWidth, setCanvasWidth] = useState(0)
    const [canvasHeight, setCanvasHeight] = useState(0)
    const [videoSrcAttributes, setVideoSourceAttributes] = useState<{ videoHeight: number; videoWidth: number }>({
        videoHeight: 0,
        videoWidth: 0,
    })

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
    }, [canvasRef.current, videoSrcAttributes, containerWidth])

    const resetVideoContext = () => {
        const { videoCtx } = initVideoContext(canvasRef)
        setVideoContext(videoCtx)

        return { videoCtx }
    }

    // Initialize video context on first render (runs once)
    useLayoutEffect(() => {
        resetVideoContext()
    }, [])

    // Update volume
    useEffect(() => {
        if (videoContext) {
            // WHY: VideoContext expects a value between 0 and 1.
            // eslint-disable-next-line
            videoContext.volume = volume / 100
        }
    }, [videoContext, volume])

    useEffect(() => {
        if (videoContext) {
            if (isPaused) {
                videoContext.pause()
            } else {
                videoContext.play()
            }
        }
    }, [videoContext, isPaused])

    // Update sync when player is running
    useEffect(() => {
        videoContext?.registerCallback(VideoContext.EVENTS.UPDATE, () => {
            if (videoContext.state === VideoContext.STATE.PLAYING) {
                const currentTime = videoContext.currentTime
                setSyncPlayPosition(currentTime)
                currentTimeCallback(currentTime)
            }
        })
    }, [videoContext, setSyncPlayPosition, currentTimeCallback])

    // Set player position from the outside.
    useEffect(() => {
        if (videoContext) {
            // eslint-disable-next-line
            videoContext.currentTime = playPosition
            setSyncPlayPosition(playPosition)
            currentTimeCallback(playPosition)
        }
    }, [videoContext, playPosition])

    // Update video context with new nodes
    useEffect(() => {
        const { videoCtx } = resetVideoContext()

        if (videoCtx && cutList.length > 0) {
            const nodesAndElements = transformCutListToVideoContextPlaylist(cutList).map((cut) =>
                addVideoContextPlaylistElement(cut, videoCtx)
            )
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
    }, [cutList])

    return (
        <>
            <canvas ref={canvasRef} className={'video-context-player'} width={canvasWidth} height={canvasHeight} />
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoContextPlayer))
