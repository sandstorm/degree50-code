import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import VideoContext from 'videocontext'

import { AppState } from '../../../../Store/Store'
import { actions, selectors } from '../../PlayerSlice'
import { initVideoContext, addCut } from './util'
import { CutList } from './types'
import { useWindowSize } from '../components/MediaLane/MediaTrack/hooks'

type OwnProps = {
    cutList: CutList
    currentTimeCallback: (time: number) => void
    volume: number
}

const mapStateToProps = (state: AppState) => ({
    playPosition: selectors.selectPlayPosition(state),
})

const mapDispatchToProps = {
    setSyncPlayPosition: actions.setSyncPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoContextPlayer = ({ cutList, currentTimeCallback, setSyncPlayPosition, playPosition, volume }: Props) => {
    const windowSize = useWindowSize()
    const [videoContext, setVideoContext] = useState<VideoContext | undefined>(undefined)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
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

            if (aspectRatio !== Infinity) {
                setCanvasWidth(videoWidth * aspectRatio)
                setCanvasHeight(videoHeight * aspectRatio)
            }
        }
    }, [canvasRef.current, videoSrcAttributes, windowSize])

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
            videoContext.volume = volume
        }
    }, [videoContext, volume])

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
            videoContext.currentTime = playPosition
            setSyncPlayPosition(playPosition)
            currentTimeCallback(playPosition)
        }
    }, [videoContext, playPosition])

    // Update video context with new nodes
    useEffect(() => {
        const { videoCtx } = resetVideoContext()

        if (videoCtx && cutList.length > 0) {
            const nodesAndElements = cutList.map((cut) => addCut(cut, videoCtx))
            const firstVideoElement = nodesAndElements[0].videoElement

            // Determine aspect ratio by the first videoElement we encounter - we do not directly set an aspect ration, but get the videos height/width instead
            // NOTE: If we have more than one video source at some point, we might need to
            // change this to accomodate for different aspect ratios
            firstVideoElement.addEventListener('loadedmetadata', () => {
                setVideoSourceAttributes({
                    videoWidth: firstVideoElement.videoWidth,
                    videoHeight: firstVideoElement.videoHeight,
                })
            })
        }
    }, [cutList])

    const handlePlay = useCallback(() => {
        if (!videoContext) return

        if (videoContext.currentTime >= videoContext.duration) {
            videoContext.currentTime = 0
        }

        videoContext.play()
    }, [videoContext])

    const handlePause = useCallback(() => {
        if (videoContext) {
            videoContext.pause()
        }
    }, [videoContext])

    return (
        <>
            <canvas ref={canvasRef} className={'video-context-player'} width={canvasWidth} height={canvasHeight} />
            <div className="actions">
                <button className="video-button btn btn-outline-primary btn-sm" onClick={handlePlay}>
                    Play
                </button>
                <button className="video-button btn btn-outline-primary btn-sm" onClick={handlePause}>
                    Pause
                </button>
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoContextPlayer))
